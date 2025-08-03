// WhatsApp Cloud API ile mesaj göndermek için temel fonksiyon
async function sendWhatsAppMessage(phone, message) {
  // Burada gerçek WhatsApp API entegrasyonu yapılacak
  console.log(`WhatsApp mesajı gönderildi: ${phone} - ${message}`);
}

module.exports = { sendWhatsAppMessage };