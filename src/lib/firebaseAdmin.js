import admin from 'firebase-admin';

let db = null;

function initAdmin() {
    if (admin.apps.length) {
        // HMRでモジュール再評価された場合でも既存appからdbを再取得する
        db = admin.firestore();
        return;
    }
    const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
    if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) return;

    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: FIREBASE_PROJECT_ID,
            clientEmail: FIREBASE_CLIENT_EMAIL,
            // private key in env should have literal \n sequences replaced
            privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
    });

    db = admin.firestore();
}

export function getFirestore() {
    if (!db) initAdmin();
    return db;
}

export default getFirestore;
