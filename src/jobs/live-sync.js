import { delay, fetchAndStore, syncStandings } from "../utils/crud.js";
import { schedule } from "node-cron";

const START_LIVE = {
    startLiveOnLocal() {
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
    async startLiveOnServer() {
        const today = new Date().toISOString().split("T")[0];
        console.log(`[LIVE SYNC] Updating for ${today}`);
        await fetchAndStore("/games/allscores", "live/games", `?sports=1&startDate=${today}&endDate=${today}`);
        await syncStandings();
        await delay(16000);
        console.log("✅ Live data updated");
    },
};

export const { startLiveOnServer, startLiveOnLocal } = START_LIVE;
