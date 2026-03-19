const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Load local env if present so this script can be run with node directly
try {
    require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });
} catch (e) { }

const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    console.error('Missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY in env');
    process.exit(1);
}

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
});

const db = admin.firestore();

async function migrate() {
    const file = path.join(process.cwd(), 'lib', 'events.json');
    if (!fs.existsSync(file)) {
        console.error('No lib/events.json found, nothing to migrate');
        process.exit(1);
    }
    const raw = fs.readFileSync(file, 'utf-8');
    let events = [];
    try { events = JSON.parse(raw); } catch (e) { console.error('Invalid JSON in lib/events.json'); process.exit(1); }

    const col = db.collection('events');
    console.log(`Migrating ${events.length} events to Firestore path 'events/{docId}'...`);
    for (const ev of events) {
        const id = ev.id || undefined;
        const payload = { ...ev };
        delete payload.id;

        if (id) {
            await col.doc(id).set(payload);
            console.log(`-> wrote events/${id}`);
        } else {
            const ref = await col.add(payload);
            console.log(`-> added events/${ref.id}`);
        }
    }
    console.log('Migration complete');
    process.exit(0);
}

migrate().catch((e) => { console.error(e); process.exit(1); });
