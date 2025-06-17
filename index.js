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

app.get("/auth/:provider/callback", async (req, res) => {
  const { provider } = req.params;
  const code = req.query.code;

  if (!code) return res.status(400).send("Missing code");

  try {
    const config = {
      google: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        token_url: "https://oauth2.googleapis.com/token",
        user_url: "https://www.googleapis.com/oauth2/v3/userinfo",
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        extraParams: {},
        getUserInfo: (data) => data,
      },
      discord: {
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        token_url: "https://discord.com/api/oauth2/token",
        user_url: "https://discord.com/api/users/@me",
        redirect_uri: process.env.DISCORD_REDIRECT_URI,
        extraParams: { scope: "identify email" },
        getUserInfo: (data) => data,
      },
      twitch: {
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        token_url: "https://id.twitch.tv/oauth2/token",
        user_url: "https://api.twitch.tv/helix/users",
        redirect_uri: process.env.TWITCH_REDIRECT_URI,
        extraParams: {},
        getUserInfo: (data) => data.data[0],
      },
    };

    const providerConfig = config[provider];

    if (!providerConfig) {
      return res.status(400).send("Unsupported provider");
    }

    // const params = new URLSearchParams({
    //   code,
    //   client_id: providerConfig.client_id,
    //   client_secret: providerConfig.client_secret,
    //   redirect_uri: providerConfig.redirect_uri,
    //   grant_type: "authorization_code",
    //   ...providerConfig.extraParams,
    // });

    // const tokenRes = await axios.post(providerConfig.token_url, params, {
    //   headers: { "Content-Type": "application/x-www-form-urlencoded" },
    // });

    // const accessToken = tokenRes.data.access_token;

    // const userRes = await axios.get(providerConfig.user_url, {
    //   headers: {
    //     Authorization: `Bearer ${accessToken}`,
    //     ...(provider === "twitch"
    //       ? { "Client-ID": providerConfig.client_id }
    //       : {}),
    //   },
    // });

    // const userInfo = providerConfig.getUserInfo(userRes.data);

    // const redirectToApp = `com.exposocialauth.app:/oauthredirect?userInfo=${encodeURIComponent(
    //   JSON.stringify(userInfo)
    // )}`;
    const redirectToApp = `com.exposocialauth.app:`;

    console.log("🔁 Redirecting to:", redirectToApp);
    res.redirect(redirectToApp);
  } catch (err) {
    console.error("❌ Error:", err.response?.data || err.message);
    res.status(500).send(`Error handling ${req.params.provider} OAuth`);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
