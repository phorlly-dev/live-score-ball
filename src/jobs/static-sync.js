import axios from "axios";
import { ENV } from "../config/env.js";
import { writeUnique } from "../utils/crud.js";

export async function syncStaticData() {
    console.log("🗂 Syncing static data...");
    const res = await axios.get(`${ENV.BASE_URL}/games`);
    const { sports, countries, competitions, competitors } = res.data;

    await writeUnique("meta/sports", sports, "id");
    await writeUnique("meta/countries", countries, "id");
    await writeUnique("meta/competitions", competitions, "id");
    await writeUnique("meta/competitors", competitors, "id");

    console.log("✅ Static data synced without duplication");
}
