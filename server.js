// backend/server.js
const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const fetch = require("node-fetch");

// Carrega Service Account JSON do Firebase
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Mercado Pago Access Token
const MP_ACCESS_TOKEN = "APP_USR-818599989759132-012209-35905b58280d1b334cd49b46590b044e-99553539";

// Webhook Mercado Pago
app.post("/mp-webhook", async (req, res) => {
  const { data } = req.body;
  if (!data || !data.id) return res.status(400).send("No data");

  try {
    const mpRes = await fetch(https://api.mercadopago.com/v1/payments/${data.id}, {
      headers: { Authorization: Bearer ${MP_ACCESS_TOKEN} },
    });
    const payment = await mpRes.json();

    if (payment.status === "approved") {
      const userId = payment.external_reference; // ID do usuário enviado no link
      const premiumDuration = payment.plan === "monthly" ? 30 : 365; // dias
      const premiumUntil = new Date();
      premiumUntil.setDate(premiumUntil.getDate() + premiumDuration);

      await db.collection("users").doc(userId).update({
        plano: "premium",
        premium_ate: premiumUntil,
      });
      console.log(Usuário ${userId} liberado para premium até ${premiumUntil});
    }

    res.status(200).send("OK");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

// Rotas do admin
app.get("/admin/users", async (req, res) => {
  const snapshot = await db.collection("users").get();
  const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(users);
});

app.listen(PORT, () => console.log(Backend rodando na porta ${PORT}));