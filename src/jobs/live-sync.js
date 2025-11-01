import { delay, fetchAndStore, syncStandings } from "../utils/crud.js";
import { schedule } from "node-cron";

const START_LIVE = {
    startLiveSyncLocal() {
        schedule("*/6 * * * *", async () => {
            const today = new Date().toISOString().split("T")[0];
            console.log(`[LIVE SYNC] Updating for ${today}`);

            // Games (live & today)
            await fetchAndStore("/games/allscores", "live/games", `?sports=1&startDate=${today}&endDate=${today}`);

            // Standings (by competition)
            await syncStandings();

            console.log("✅ Live data updated");
        });
    },
    async startLiveSynServer() {
        const today = new Date().toISOString().split("T")[0];
        console.log(`[LIVE SYNC] Updating for ${today}`);
        await fetchAndStore("/games/allscores", "live/games", `?sports=1&startDate=${today}&endDate=${today}`);
        await delay(16000);
        await syncStandings();
        console.log("✅ Live data updated");
    },
};

export const { startLiveSynServer, startLiveSyncLocal } = START_LIVE;
