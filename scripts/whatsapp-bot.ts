import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import Registration from '../models/Registration';

// Load env variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI is not defined in .env.local");
  process.exit(1);
}

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI!);
    console.log("Connected to MongoDB");
  }
}

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: path.resolve(process.cwd(), '.wwebjs_auth')
  }),
  puppeteer: {
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
      '--disable-extensions',
      '--js-flags="--max-old-space-size=150"'
    ],
  }
});

client.on('qr', (qr) => {
  console.log('\n--- SCAN THIS QR CODE WITH YOUR WHATSAPP MOBILE APP ---');
  qrcode.generate(qr, { small: true });
  console.log('-------------------------------------------------------\n');
});

client.on('ready', () => {
  console.log('WhatsApp Client is logged in and ready!');
  // Start polling MongoDB for new registrations every 10 seconds
  setInterval(checkAndSendInvites, 10000);
  checkAndSendInvites(); // run immediately on startup
});

client.on('disconnected', (reason) => {
  console.error('WhatsApp Client was disconnected:', reason);
  process.exit(1);
});

client.on('auth_failure', (msg) => {
  console.error('WhatsApp Authentication failure:', msg);
  process.exit(1);
});

async function checkAndSendInvites() {
  try {
    await connectDB();
    const unsent = await Registration.find({ whatsappInviteSent: { $ne: true } });
    if (unsent.length === 0) return;

    console.log(`Found ${unsent.length} pending registration(s) to invite...`);

    for (const reg of unsent) {
      if (!reg.phone) continue;
      
      // Clean phone number: keep only digits and strip leading '+' or spaces
      let cleanedPhone = reg.phone.replace(/[^\d]/g, '');
      
      // whatsapp-web.js requires suffix '@c.us' for individual chats
      const chatId = `${cleanedPhone}@c.us`;
      
      const message = `Hi ${reg.name}! 👋 Welcome to Arcadium.\n\nPlease join our official Discord server using this link to complete your onboarding: https://discord.gg/QaGCGb3Z2`;

      console.log(`Sending invite to ${reg.name} (${chatId})...`);
      try {
        await client.sendMessage(chatId, message);
        reg.whatsappInviteSent = true;
        await reg.save();
        console.log(`✅ Successfully sent WhatsApp invite to ${reg.name}!`);
      } catch (err: any) {
        console.error(`❌ Failed to send message to ${reg.name}:`, err);
        const errMsg = err?.message || '';
        if (
          errMsg.includes('detached') || 
          errMsg.includes('closed') || 
          errMsg.includes('Protocol error') || 
          errMsg.includes('Navigation failed')
        ) {
          console.error('Critical WhatsApp browser/client error detected. Exiting process for PM2 to auto-restart...');
          process.exit(1);
        }
      }
    }
  } catch (error) {
    console.error("Error checking and sending invites:", error);
  }
}

client.initialize();
