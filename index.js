const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("OAuth backend running!");
});

app.get("/auth/google/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Missing code");

  try {
    const params = new URLSearchParams();
    params.append("code", code);
    params.append("client_id", process.env.GOOGLE_CLIENT_ID);
    params.append("client_secret", process.env.GOOGLE_CLIENT_SECRET);
    params.append("redirect_uri", process.env.GOOGLE_REDIRECT_URI);
    params.append("grant_type", "authorization_code");

    const tokenRes = await axios.post(
      "https://oauth2.googleapis.com/token",
      params
    );

    const accessToken = tokenRes.data.access_token;

    const userRes = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const userInfo = userRes.data;

    // Redirigimos a la app móvil con los datos
    res.redirect(
      `com.exposocialauth.app://oauthredirect?userInfo=${encodeURIComponent(
        JSON.stringify(userInfo)
      )}`
    );
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send("Error handling Google OAuth");
  }
});

app.get("/auth/discord/callback", async (req, res) => {
  const code = req.query.code;
  console.log("code", code);
  if (!code) return res.status(400).send("Missing code");

  try {
    const params = new URLSearchParams();
    params.append("client_id", process.env.DISCORD_CLIENT_ID);
    params.append("client_secret", process.env.DISCORD_CLIENT_SECRET);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", process.env.DISCORD_REDIRECT_URI);
    params.append("scope", "identify email");

    console.log("params from back", params);

    const tokenRes = await axios.post(
      "https://discord.com/api/oauth2/token",
      params,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const accessToken = tokenRes.data.access_token;

    const userRes = await axios.get("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userInfo = userRes.data;

    // Redirigir de vuelta a la app con los datos del usuario (puede ser en querystring, token, etc.)
    res.redirect(
      `com.exposocialauth.app://oauthredirect?userInfo=${encodeURIComponent(
        JSON.stringify(userInfo)
      )}`
    );
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send("Error handling Discord OAuth");
  }
});

app.get("/auth/twitch/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Missing code");

  try {
    const params = new URLSearchParams();
    params.append("client_id", process.env.TWITCH_CLIENT_ID);
    params.append("client_secret", process.env.TWITCH_CLIENT_SECRET);
    params.append("code", code);
    params.append("grant_type", "authorization_code");
    params.append("redirect_uri", process.env.TWITCH_REDIRECT_URI);

    console.log("params from back twitch", params);

    const tokenRes = await axios.post(
      "https://id.twitch.tv/oauth2/token",
      params
    );

    const accessToken = tokenRes.data.access_token;

    const userRes = await axios.get("https://api.twitch.tv/helix/users", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Client-ID": process.env.TWITCH_CLIENT_ID,
      },
    });

    const userInfo = userRes.data.data[0];

    res.redirect(
      `com.exposocialauth.app://oauthredirect?userInfo=${encodeURIComponent(
        JSON.stringify(userInfo)
      )}`
    );
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send("Error handling Twitch OAuth");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
