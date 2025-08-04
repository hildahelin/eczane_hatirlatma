const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const serviceAccount = require('./firebaseKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Sadece belirli IP'den erişim izni veren middleware
const allowedIps = ['176.88.73.175', '::1', '127.0.0.1', '::ffff:127.0.0.1'];
app.use((req, res, next) => {
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
  // IPv4-mapped IPv6 adreslerini normalize et
  const ip = clientIp.replace('::ffff:', '');
  if (!allowedIps.includes(ip)) {
    return res.status(403).json({ error: 'Erişim reddedildi. Bu API sadece yetkili IP adreslerinden kullanılabilir.' });
  }
  next();
});

// X-LOGIN-TOKEN kontrolü (çift koruma)
const SECRET_TOKEN = "gizli-token-123";
app.use((req, res, next) => {
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
  const ip = clientIp.replace('::ffff:', '');
  const token = req.headers['x-login-token'];
  if (!allowedIps.includes(ip)) {
    return res.status(403).json({ error: 'Erişim reddedildi. Bu API sadece yetkili IP adreslerinden kullanılabilir.' });
  }
  if (token !== SECRET_TOKEN) {
    return res.status(403).json({ error: 'Geçersiz veya eksik token.' });
  }
  next();
});

// Kayıt ekleme endpoint'i
app.post('/api/reminders', async (req, res) => {
  try {
    const data = req.body;
    const docRef = await db.collection('reminders').add(data);
    res.status(201).json({ id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Kayıtları listeleme endpoint'i
app.get('/api/reminders', async (req, res) => {
  try {
    const snapshot = await db.collection('reminders').get();
    const reminders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Kayıt silme endpoint'i
app.delete('/api/reminders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('reminders').doc(id).delete();
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Kayıt güncelleme endpoint'i
app.put('/api/reminders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    await db.collection('reminders').doc(id).update(data);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
