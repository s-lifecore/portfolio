import admin from "firebase-admin";
import getFirestore from "./firebaseAdmin";

function normalizeDate(value) {
    if (value && typeof value === "object" && typeof value.toDate === "function") {
        try {
            return value.toDate().toISOString().split("T")[0];
        } catch (e) {
            return String(value);
        }
    }
    return value;
}

function normalizeDateTime(value) {
    if (value && typeof value === "object" && typeof value.toDate === "function") {
        try {
            return value.toDate().toISOString();
        } catch (e) {
            return String(value);
        }
    }
    return value;
}

export function ensureDb() {
    const db = getFirestore();
    if (!db) throw new Error("Firestore not configured");
    return db;
}

export function convertEventDocToEvent(d) {
    const data = d && typeof d.data === "function" ? d.data() : {};

    return {
        id: d.id,
        ...data,
        date: normalizeDate(data.date),
        createdAt: normalizeDateTime(data.createdAt),
        updatedAt: normalizeDateTime(data.updatedAt),
    };
}

export async function listEvents(db = ensureDb()) {
    const snap = await db.collection("events").get();
    const events = snap.docs.map(convertEventDocToEvent);
    events.sort((a, b) => new Date(b.date) - new Date(a.date));
    return events;
}

export function resolveEventDocRef(db, eventId) {
    return db.collection("events").doc(eventId);
}

export function withServerTimestamps(payload, isCreate) {
    const now = admin.firestore.FieldValue.serverTimestamp();
    if (isCreate) {
        return { ...payload, createdAt: now, updatedAt: now };
    }
    return { ...payload, updatedAt: now };
}
