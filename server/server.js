// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const YahooFantasy = require("yahoo-fantasy");

dotenv.config();

const app = express();
app.use(cors());
const port = 4000;

const yf = new YahooFantasy(
    process.env.YAHOO_CLIENT_ID,
    process.env.YAHOO_CLIENT_SECRET
);

// Redirect to Yahoo for login
app.get("/auth", (req, res) => {
    const url = yf.authURL();
    res.redirect(url);
});

// Callback after Yahoo login
app.get("/auth/callback", async (req, res) => {
    try {
        const { code } = req.query;
        await yf.auth(code);
        res.redirect("http://localhost:3000"); // Go back to frontend
    } catch (err) {
        res.status(500).send("Auth failed: " + err.message);
    }
});

// Get players
app.get("/players", async (req, res) => {
    try {
        const players = await yf.players.collection("nfl", ["QB", "RB", "WR", "TE"], {
            start: 0,
            count: 100,
        });

        const simplified = players.map((p) => ({
            id: p.player_id,
            name: p.name.full,
            position: p.display_position,
            team: p.editorial_team_abbr,
            byeWeek: p.bye_weeks?.week || "—",
        }));

        res.json(simplified);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
