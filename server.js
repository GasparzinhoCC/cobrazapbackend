const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://cobrazapia.firebaseio.com"
});

const db = admin.firestore();

const app = express();

// CORS configurado para Netlify (substitua pelo seu domínio)
app.use(cors({
  origin: ["https://SEU-SITE.netlify.app"], 
  credentials: true
}));

app.use(bodyParser.json());

// Teste de backend
app.get("/", (req, res) => res.send("Backend funcionando!"));

// Contagem de mensagens grátis
app.get("/messages/:userId", async (req, res) => {
  const { userId } = req.params;
  const doc = db.collection("users").doc(userId);
  const user = await doc.get();
  if (!user.exists) {
    await doc.set({ freeMessages: 5, premium: false });
    return res.json({ freeMessages: 5 });
  }
  return res.json(user.data());
});

// Atualizar mensagens usadas
app.post("/messages/use/:userId", async (req, res) => {
  const { userId } = req.params;
  const doc = db.collection("users").doc(userId);
  const user = await doc.get();
  if (!user.exists) return res.status(404).json({ error: "Usuário não encontrado" });
  const data = user.data();
  const freeMessages = data.freeMessages > 0 ? data.freeMessages - 1 : 0;
  await doc.update({ freeMessages });
  res.json({ freeMessages });
});

// Webhook Mercado Pago
app.post("/mp-webhook", async (req, res) => {
  const payment = req.body;
  console.log("Pagamento recebido:", payment);
  // Atualizar Premium no Firebase aqui
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(Backend rodando na porta ${PORT}));
