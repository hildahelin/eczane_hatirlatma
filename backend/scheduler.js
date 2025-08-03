const admin = require('firebase-admin');
const cron = require('node-cron');
const { sendWhatsAppMessage } = require('./whatsappSender');
const serviceAccount = require('./firebaseKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

async function scheduleReminders() {
  const snapshot = await db.collection('reminders').get();
  snapshot.forEach(doc => {
    const reminder = doc.data();
    // Örnek: her gün saat 21:00'de gönder
    if (reminder.type === 'daily') {
      cron.schedule('0 21 * * *', () => {
        sendWhatsAppMessage(reminder.phone, reminder.message);
      });
    }
    // Diğer tekrar tipleri burada eklenebilir
  });
}

scheduleReminders();