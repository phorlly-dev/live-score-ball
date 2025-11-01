import admin from "firebase-admin";
import { ENV } from "./env.js";

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(ENV.FIREBASE),
        databaseURL: ENV.DATABASE_URL,
    });
}

export const db = admin.database();
