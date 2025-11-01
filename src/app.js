import cors from "cors";
import express from "express";
import { setGlobalOptions } from "firebase-functions";
import { syncStaticData } from "./jobs/static-sync.js";
import { startLiveOnLocal } from "./jobs/live-sync.js";
import { destroyAll, setTitle } from "./utils/crud.js";

// Express setup
const app = express();
app.use(cors());
app.use(express.json());
setGlobalOptions({ maxInstances: 10 });

//START APP
app.get("/", (_req, res) => res.send(setTitle("⚽ Live Score API running on Vercel!")));

// Manual trigger for static sync
app.get("/sync-static", async (_req, res) => {
    await syncStaticData();
    res.send(setTitle("✅ Static Data Refreshed"));
});

app.get("/clear", async (_req, res) => {
    await destroyAll();
    res.send(setTitle("✅ All Data Cleared."));
});

// Start live sync automatically
app.get("/sync", (_req, res) => {
    startLiveOnLocal();
    res.send(setTitle("✅ Sync Completed."));
});

export default app;
