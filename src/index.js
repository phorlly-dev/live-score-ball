const express = require("express");
const dotenv = require("dotenv");
const axios = require("axios");
const cors = require("cors");
const { schedule } = require("node-cron");
const admin = require("firebase-admin");
const { getDatabase } = require("firebase-admin/database");
const { setGlobalOptions } = require("firebase-functions");
// const logger = require("firebase-functions/logger");

dotenv.config({ path: "./.env" });
const serviceAccount = {
    type: process.env.TYPE,
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.CLIIENT_EMAIL,
    client_id: process.env.CLIIENT_ID,
    auth_uri: process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
    universe_domain: process.env.UNIVERSE_DOMAIN,
};

// Firebase setup
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.DATABASE_URL,
    });
}

const db = getDatabase();

// Express setup
const app = express();
app.use(cors());
app.use(express.json());
setGlobalOptions({ maxInstances: 10 });

// ✅ Now it's safe to use .env
const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;

// Manual trigger endpoint
app.get("/sync", async (_req, res) => {
    res.json({ message: "Manual sync endpoint – cron is running automatically!" });
});

// Auto-sync job
schedule("*/1 * * * *", async () => {
    try {
        const response = await axios.get(API_URL, {
            headers: { "x-apisports-key": API_KEY },
        });

        const matches = response.data.response;
        const ref = db.ref("matches");

        if (!matches || matches.length === 0) {
            console.log("⚪ No live matches currently");
            return;
        }

        for (const match of matches) {
            await ref.child(match.fixture.id).set(match);
        }

        console.log(`[${new Date().toLocaleTimeString()}] ✅ Synced ${matches.length} live matches`);
    } catch (err) {
        console.error("❌ Cron sync failed:", err.message);
    }
});

app.get("/", (_req, res) => {
    res.send("⚽ Live Score API is running...");
});

module.exports = app;
