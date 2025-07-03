// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";
import YahooFantasy from "yahoo-fantasy";

dotenv.config();

const app = express();
const port = 4000;

// Allow CORS for React frontend
app.use(cors({ origin: "http://localhost:5173" }));

// YahooFantasy client instance
const yf = new YahooFantasy(process.env.YAHOO_CLIENT_ID, process.env.YAHOO_CLIENT_SECRET);

// In-memory store for OAuth states (for demo only)
const stateStore = new Set();

// In-memory store for access token (demo only)
let userAccessToken = null;

app.get("/", (req, res) => {
    res.send("⚡ Fantasy API is live! Use /auth to login and /players to fetch players");
});

// Step 1: Redirect to Yahoo OAuth login
app.get("/auth", (req, res) => {
    const clientId = process.env.YAHOO_CLIENT_ID;
    const redirectUri = encodeURIComponent(process.env.YAHOO_CALLBACK);
    const scope = "fspt-r"; // read-only fantasy sports
    const state = crypto.randomBytes(16).toString("hex"); // secure random state

    // Store state for validation later
    stateStore.add(state);

    const authUrl = `https://api.login.yahoo.com/oauth2/request_auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}`;

    console.log("Redirecting user to:", authUrl);

    res.redirect(authUrl);
});

// Step 2: OAuth callback - exchange code for access token
app.get("/auth/callback", async (req, res) => {
    const { code, state } = req.query;

    if (!code || !state) {
        return res.status(400).send("Missing code or state in callback");
    }

    // Verify state is valid and remove it from store to prevent reuse
    if (!stateStore.has(state)) {
        return res.status(400).send("Invalid or expired state");
    }
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
                    Buffer.from(`${process.env.YAHOO_CLIENT_ID}:${process.env.YAHOO_CLIENT_SECRET}`).toString(
                        "base64"
                    ),
            },
            body: tokenParams.toString(),
        });

        if (!tokenRes.ok) {
            const errorText = await tokenRes.text();
            throw new Error(errorText);
        }

        const tokenData = await tokenRes.json();

        userAccessToken = tokenData.access_token;
        yf.setUserToken(userAccessToken);
        console.log("✅ Access token obtained and set");

        // Redirect back to frontend (adjust if needed)
        res.redirect("http://localhost:5173");
    } catch (error) {
        console.error("❌ Token exchange failed:", error);
        res.status(500).send("OAuth token exchange failed: " + error.message);
    }
});

// Get players - requires user to be authenticated
app.get("/players", async (req, res) => {
    if (!userAccessToken) {
        return res.status(401).json({ error: "User not authenticated" });
    }

    try {
        yf.setUserToken(userAccessToken);

        // Get NFL game info for user
        const games = await yf.user.games();
        const nflGame = games.find((g) => g.code === "nfl");
        if (!nflGame) throw new Error("No NFL game found");

        // Get user's leagues for NFL game
        const leagues = await yf.user.leagues(nflGame.game_key);
        if (!leagues.length) throw new Error("No NFL leagues found");

        const leagueKey = leagues[0].league_key;

        // Get players for that league
        const leaguePlayers = await yf.league.players(leagueKey, {
            count: 100,
            start: 0,
        });

        // Simplify data for frontend
        const simplified = leaguePlayers.map((p) => ({
            id: p.player_id,
            name: p.name.full,
            position: p.display_position,
            team: p.editorial_team_abbr,
            byeWeek: p.bye_weeks?.week || "—",
        }));

        res.json(simplified);
    } catch (error) {
        console.error("❌ Error fetching players:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`);
});
