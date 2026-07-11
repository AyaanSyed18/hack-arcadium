import { Client, GatewayIntentBits, Events } from 'discord.js';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;
const ROLE_NAME = "Registered"; // The role to assign to registered members

if (!MONGODB_URI || !DISCORD_BOT_TOKEN || !DISCORD_GUILD_ID) {
  console.error("Error: Missing required env variables in .env.local");
  console.error("Ensure MONGODB_URI, DISCORD_BOT_TOKEN, and DISCORD_GUILD_ID are defined.");
  process.exit(1);
}

// Define lightweight Registration schema locally to keep the script standalone
const RegistrationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  discord: { type: String, required: true },
  discordOnboarded: { type: Boolean, default: false },
});

const Registration = mongoose.models.Registration || mongoose.model('Registration', RegistrationSchema);

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI!);
    console.log("Connected to MongoDB");
  }
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Discord Bot is logged in as ${readyClient.user.tag}!`);
  connectDB().catch(console.error);
});

// Event listener for when a member joins the guild
client.on(Events.GuildMemberAdd, async (member) => {
  if (member.guild.id !== DISCORD_GUILD_ID) return;

  console.log(`\nNew member joined: ${member.user.tag} (${member.id})`);

  try {
    await connectDB();
    
    const username = member.user.username; // e.g. "ayaanplayz"
    const tag = member.user.tag; // e.g. "ayaanplayz#1234" (if legacy tag)

    // Search for a registration that matches the user's username or tag (case insensitive)
    const registration = await Registration.findOne({
      $and: [
        {
          $or: [
            { discord: { $regex: new RegExp(`^${escapeRegex(username)}$`, 'i') } },
            { discord: { $regex: new RegExp(`^${escapeRegex(tag)}$`, 'i') } }
          ]
        },
        { discordOnboarded: { $ne: true } }
      ]
    });

    if (registration) {
      console.log(`Found matching registration for ${member.user.tag}: ${registration.name}`);

      // 1. Assign "Registered" role
      let role = member.guild.roles.cache.find(r => r.name === ROLE_NAME);
      if (!role) {
        // Try creating the role if it doesn't exist
        try {
          role = await member.guild.roles.create({
            name: ROLE_NAME,
            color: 'Aqua',
            reason: 'Role for verified hackathon participants',
          });
          console.log(`Created new role: "${ROLE_NAME}"`);
        } catch (roleErr) {
          console.error(`Failed to automatically create role "${ROLE_NAME}":`, roleErr);
        }
      }

      if (role) {
        await member.roles.add(role);
        console.log(`Assigned role "${ROLE_NAME}" to ${member.user.tag}`);
      }

      // 2. Send welcome Direct Message
      try {
        await member.send(`Hi ${registration.name}! 🎉 Welcome to Arcadium. You have been successfully onboarded and assigned the **${ROLE_NAME}** role on the server! Have fun hacking!`);
        console.log(`Sent welcome DM to ${member.user.tag}`);
      } catch (dmErr) {
        console.warn(`Could not send DM to ${member.user.tag}. They may have DMs closed.`);
      }

      // 3. Mark as onboarded in DB
      registration.discordOnboarded = true;
      await registration.save();
      console.log(`Marked ${registration.name} as Discord onboarded in MongoDB.`);
    } else {
      console.log(`No pending registration match found for ${member.user.tag}.`);
    }

  } catch (error) {
    console.error("Error processing guildMemberAdd:", error);
  }
});

function escapeRegex(string: string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

client.login(DISCORD_BOT_TOKEN);
