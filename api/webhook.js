import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { credential } from "firebase-admin";

if (!getApps().length) {
  initializeApp({
    credential: credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
  });
}

const db = getFirestore();

function emailToKey(email) {
  return email.toLowerCase().replace(/\./g, "_").replace(/@/g, "--");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const paymentId = req.body?.data?.id;
  if (!paymentId) return res.status(400).end();

  try {
    const mpRes = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      { headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` } }
    );
    const payment = await mpRes.json();

    if (payment.status === "approved") {
      const email = payment.metadata?.email;
      const gymId = payment.metadata?.gym_id;
      const planId = payment.metadata?.plan_id;
      const planName = payment.metadata?.plan_name;
      const classes = Number(payment.metadata?.classes) || 0;

      if (email && gymId) {
        const key = emailToKey(email);
        await db.doc(`gyms/${gymId}/members/${key}`).set(
          {
            paymentConfirmed: true,
            paymentId: String(paymentId),
            plan: { id: planId, name: planName },
            classesTotal: classes,
            classesLeft: classes,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
    }

    res.status(200).end();
  } catch (e) {
    console.error("webhook error:", e);
    res.status(500).end();
  }
}
