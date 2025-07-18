require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');

// Initialize WhatsApp client with persistent session
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true }
});

// Display QR for first-time auth
client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
  console.log('Escanea este QR con WhatsApp para iniciar sesión');
});

client.on('ready', () => {
  console.log('✅ Cliente listo. Programando mensaje diario.');

  // Build cron expression: minute 0 of SEND_HOUR every day
  const hour = parseInt(process.env.SEND_HOUR, 10);
  const cronExp = `0 ${hour} * * *`;

  const chatId = process.env.TARGET_NUMBER + '@c.us';
  client.sendMessage(chatId, process.env.MESSAGE)

  cron.schedule(cronExp, () => {
    const chatId = process.env.TARGET_NUMBER + '@c.us';
    client.sendMessage(chatId, process.env.MESSAGE)
      .then(() => console.log(`Mensaje enviado a ${chatId} a las ${hour}:00`))
      .catch(err => console.error('Error enviando mensaje:', err));
  }, {
    timezone: 'America/Bogota'   // adjust to your timezone
  });
});

client.initialize();
