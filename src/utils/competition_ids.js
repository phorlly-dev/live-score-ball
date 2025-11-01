import axios from "axios";
import { ENV } from "../config/env.js";

export async function getCompetitionIds() {
    try {
        const response = await axios.get(`${ENV.BASE_URL}/competitions/?sports=1`);
        const competitions = response.data.competitions || [];

        return competitions.map((c) => c.id);
    } catch (err) {
        console.error("❌ Failed to fetch competitions:", err.message);
        return [];
    }
}
