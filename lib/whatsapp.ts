export async function sendWhatsAppMessage(phone: string, name: string): Promise<boolean> {
  const token = process.env.WHATSAPP_API_TOKEN;
  const instanceId = process.env.WHATSAPP_INSTANCE_ID; // Used by providers like UltraMsg
  const provider = process.env.WHATSAPP_API_PROVIDER || 'generic'; // 'ultramsg', 'twilio', 'generic'

  if (!token) {
    console.warn("⚠️ WHATSAPP_API_TOKEN is not defined. Skipping WhatsApp message delivery.");
    return false;
  }

  // Clean phone number: keep only digits
  const cleanedPhone = phone.replace(/[^\d]/g, '');
  const message = `Hi ${name}! 👋 Welcome to Arcadium.\n\nPlease join our official Discord server using this link to complete your onboarding: https://discord.gg/QaGCGb3Z2`;

  try {
    console.log(`Sending WhatsApp message to ${name} (${cleanedPhone}) via ${provider}...`);
    
    if (provider === 'ultramsg' && instanceId) {
      const url = `https://api.ultramsg.com/${instanceId}/messages/chat`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          token,
          to: cleanedPhone,
          body: message
        })
      });
      const data = await res.json();
      return data.sent === "true" || data.success === true;
    } 
    
    else if (provider === 'twilio') {
      // Twilio requires account SID in the URL. For Twilio, WHATSAPP_INSTANCE_ID will represent the Account SID.
      if (!instanceId) {
        console.warn("⚠️ WHATSAPP_INSTANCE_ID (Twilio Account SID) is missing.");
        return false;
      }
      const url = `https://api.twilio.com/2010-04-01/Accounts/${instanceId}/Messages.json`;
      const fromNumber = process.env.WHATSAPP_FROM_NUMBER || ''; // e.g. 'whatsapp:+14155238886'
      
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${instanceId}:${token}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          From: fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`,
          To: `whatsapp:+${cleanedPhone}`,
          Body: message
        })
      });
      const data = await res.json();
      return res.ok && !!data.sid;
    } 
    
    else {
      // Generic webhook/API setup
      const url = process.env.WHATSAPP_API_URL || '';
      if (!url) {
        console.warn("⚠️ WHATSAPP_API_URL is not configured for generic provider.");
        return false;
      }
      const res = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          to: cleanedPhone,
          message: message
        })
      });
      return res.ok;
    }
  } catch (error) {
    console.error("❌ Failed to send WhatsApp message via HTTP API:", error);
    return false;
  }
}
