const admin = require("firebase-admin");

function getDb() {
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }
  return admin.firestore();
}

function emailToKey(email) {
  return email.toLowerCase().replace(/\./g, "_").replace(/@/g, "--");
}

module.exports = async function handler(req, res) {
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
        const db = getDb();
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
    console.error("webhook error:", e.message);
    res.status(500).json({ error: e.message });
  }
};
