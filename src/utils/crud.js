import axios from "axios";
import { db } from "../config/firebase.js";
import { ENV } from "../config/env.js";

const SYNC_DATA = {
    async fetchAndStore(endpoint, path, query = "") {
        try {
            const res = await axios.get(`${ENV.BASE_URL}${endpoint}${query}`);
            const games = res.data.games || [];

            if (!games.length) {
                console.log(`⚠️ No games found for ${path}`);
                return;
            }

            // Update or insert live games
            await updateLiveGames(games);

            // Check for ended games and move them to archive
            for (const game of games) {
                if (game.statusText === "Ended") {
                    const id = game.id;
                    await db.ref(`live_score/archive/${id}`).set(game);
                    await db.ref(`live_score/live/games/${id}`).remove();
                    console.log(`📦 Archived game ${id} (${game.competitionDisplayName})`);
                }
            }

            console.log(`✅ Synced ${path} (${games.length} games)`);
        } catch (error) {
            console.error(`❌ Failed ${path}:`, error.message);
        }
    },
    async writeUnique(path, items, idField = "id") {
        const ref = db.ref(`live_score/${path}`);
        const snapshot = await ref.get();
        const existing = snapshot.exists() ? snapshot.val() : {};

        const updates = {};

        for (const item of items) {
            const id = item[idField];

            // Only write if new or changed
            if (!existing[id] || JSON.stringify(existing[id]) !== JSON.stringify(item)) {
                updates[id] = item;
            }
        }

        if (Object.keys(updates).length > 0) {
            await ref.update(updates);
            console.log(`🔄 Updated ${path}: ${Object.keys(updates).length} items`);
        } else {
            console.log(`✅ No changes in ${path}`);
        }
    },
    async updateLiveGames(games) {
        const ref = db.ref("live_score/live/games");
        const snapshot = await ref.get();
        const existing = snapshot.exists() ? snapshot.val() : {};

        const updates = {};

        for (const game of games) {
            const id = game.id;
            const current = existing[id];
            if (!current || JSON.stringify(current) !== JSON.stringify(game)) {
                updates[id] = game;
            }
        }

        if (Object.keys(updates).length > 0) {
            await ref.update(updates);
            console.log(`🔄 Updated ${Object.keys(updates).length} live games`);
        } else {
            console.log("✅ No live game changes");
        }
    },
    async destroyAll() {
        try {
            const ref = db.ref("live_score");
            if (ref) {
                await ref.remove();
                console.log("The all data deleted from DB.");
            } else {
                console.log("This path unavailable");
            }
        } catch (error) {
            console.log("Something wrong: ", error.message);
        }
    },
    async syncStandings() {
        // const competitions = await getCompetitionIds();
        const competitions = [7, 11, 17, 25, 35, 552, 572, 573, 73, 57, 649];
        for (const id of competitions) {
            const res = await axios.get(`${ENV.BASE_URL}/standings/?competitions=${id}&withSeasonsFilter=false`);
            const data = res.data;

            // Only save if standings exist and are an array
            if (Array.isArray(data.standings) && data.standings.length > 0) {
                await db.ref(`live_score/standings/${id}`).set(data);
                console.log(`✅ Synced standings for competition ${id}`);
            } else {
                console.log(`⚠️ No standings for competition ${id}`);
            }

            // Prevent rate-limit issues
            await delay(1600);
        }
    },
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    },
    setTitle(title) {
        return `<h1 style="text-align: center; font-family: 'Gill Sans Extrabold', sans-serif; margin: 2rem">${title}</h1>`;
    },
};

export const { fetchAndStore, writeUnique, updateLiveGames, destroyAll, syncStandings, delay, setTitle } = SYNC_DATA;
