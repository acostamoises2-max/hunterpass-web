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
      const email = payment.payer?.email;
      const ref = payment.external_reference ?? "";
      const underscoreIdx = ref.indexOf("_");
      const gymId = ref.slice(0, underscoreIdx);
      const planId = ref.slice(underscoreIdx + 1);

      if (email && gymId && planId) {
        const db = getDb();
        const gymDoc = await db.doc(`gyms/${gymId}`).get();
        const plans = gymDoc.data()?.plans ?? [];
        const plan = plans.find((p) => p.id === planId);
        const classes = Number(plan?.classes) || 0;

        await db.doc(`gyms/${gymId}/members/${emailToKey(email)}`).set(
          {
            paymentConfirmed: true,
            paymentId: String(paymentId),
            plan: { id: planId, name: plan?.name ?? planId },
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
    console.error("webhook error:", e.message);
    res.status(500).json({ error: e.message });
  }
}
