import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const port = 4000;

app.use(cors({ origin: "http://localhost:5173" }));

const stateStore = new Set();
let userAccessToken = null;

app.get("/", (req, res) => {
    res.send("⚡ Fantasy API is live! Use /auth to login and /all-players");
});

app.get("/auth", (req, res) => {
    const clientId = process.env.YAHOO_CLIENT_ID;
    const redirectUri = encodeURIComponent(process.env.YAHOO_CALLBACK);
    const scope = "fspt-r";
    const state = crypto.randomBytes(16).toString("hex");

    stateStore.add(state);

    const authUrl = `https://api.login.yahoo.com/oauth2/request_auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}`;

    console.log("🔗 Redirecting to Yahoo:", authUrl);
    res.redirect(authUrl);
});

app.get("/auth/callback", async (req, res) => {
    const { code, state } = req.query;

    if (!code || !state) return res.status(400).send("Missing code or state");
    if (!stateStore.has(state)) return res.status(400).send("Invalid or expired state");
    stateStore.delete(state);

    try {
        const tokenParams = new URLSearchParams({
            client_id: process.env.YAHOO_CLIENT_ID,
            client_secret: process.env.YAHOO_CLIENT_SECRET,
            redirect_uri: process.env.YAHOO_CALLBACK,
            code,
            grant_type: "authorization_code",
        });

        const tokenRes = await fetch("https://api.login.yahoo.com/oauth2/get_token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization:
                    "Basic " +
                    Buffer.from(`${process.env.YAHOO_CLIENT_ID}:${process.env.YAHOO_CLIENT_SECRET}`).toString("base64"),
            },
            body: tokenParams.toString(),
        });

        if (!tokenRes.ok) {
            const errorText = await tokenRes.text();
            throw new Error(errorText);
        }

        const tokenData = await tokenRes.json();
        userAccessToken = tokenData.access_token;

        console.log("✅ Access token obtained and set");
        res.redirect("http://localhost:5173");
    } catch (error) {
        console.error("❌ OAuth token exchange failed:", error.message);
        res.status(500).send("OAuth token exchange failed: " + error.message);
    }
});

app.get("/all-players", async (req, res) => {
    if (!userAccessToken) return res.status(401).json({ error: "User not authenticated" });

    try {
        const leagueKey = process.env.YAHOO_LEAGUE_KEY;
        if (!leagueKey) throw new Error("Missing YAHOO_LEAGUE_KEY in environment");

        const count = 25;
        let start = 0;
        let allPlayers = [];
        let hasMore = true;

        console.log("Fetching all NFL players with rankings from Yahoo API...");

        while (hasMore) {
            const url = `https://fantasysports.yahooapis.com/fantasy/v2/league/${leagueKey}/players?sort=OR&start=${start}&count=${count}&format=json`;

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${userAccessToken}`,
                },
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Failed fetching players: ${text}`);
            }

            const data = await response.json();

            const playersObj = data?.fantasy_content?.league?.[1]?.players;
            if (!playersObj) break;

            const playerEntries = Object.values(playersObj).filter((p) => p?.player);

            const batch = playerEntries
                .map((entry) => {
                    const player = entry.player?.[0];
                    if (!Array.isArray(player)) return null;

                    const getField = (key) => player.find((item) => Object.prototype.hasOwnProperty.call(item, key))?.[key];

                    const id = getField("player_id");
                    const name = getField("name")?.full;
                    const position = getField("display_position") || "—";
                    const team = getField("editorial_team_abbr") || "—";
                    const byeWeek = getField("bye_weeks")?.week || "—";
                    const OR = getField("OR") ?? "—";  // Overall Rank
                    const AR = getField("AR") ?? "—";  // Actual Rank

                    if (!id || !name) return null;

                    return { id, name, position, team, byeWeek, OR, AR };
                })
                .filter(Boolean);

            allPlayers = allPlayers.concat(batch);

            if (batch.length < count) {
                hasMore = false;
            } else {
                start += count;
            }
        }

        console.log(`Total players fetched: ${allPlayers.length}`);
        res.json(allPlayers);
    } catch (error) {
        console.error("❌ Error fetching all players:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get("/status", (req, res) => {
    res.json({ authenticated: !!userAccessToken });
});

app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
