import admin from "firebase-admin";

function getDb() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(
        JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      ),
    });
  }
  return admin.firestore();
}

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
      const { email, gym_id: gymId, plan_id: planId, plan_name: planName, classes } = payment.metadata ?? {};

      if (email && gymId) {
        const db = getDb();
        await db.doc(`gyms/${gymId}/members/${emailToKey(email)}`).set(
          {
            paymentConfirmed: true,
            paymentId: String(paymentId),
            plan: { id: planId, name: planName },
            classesTotal: Number(classes) || 0,
            classesLeft: Number(classes) || 0,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
    }

    res.status(200).end();
  } catch (e) {
    console.error("webhook error:", e.message);
    res.status(500).json({ error: e.message });
  }
}
