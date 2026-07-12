import { Client, GatewayIntentBits, Events } from 'discord.js';
import Registration from '../models/Registration';
import { connectToDatabase } from './mongodb';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;
const ROLE_NAME = "Registered"; // The role to assign to registered members

export function initDiscordBot() {
  if (!DISCORD_BOT_TOKEN || !DISCORD_GUILD_ID) {
    console.warn("⚠️ DISCORD_BOT_TOKEN or DISCORD_GUILD_ID is not defined. Discord bot will not start.");
    return;
  }

  // Prevent multiple instantiations in development mode (caused by Next.js hot-reloads)
  if ((global as any).discordBotInitialized) {
    console.log("Discord bot already initialized. Skipping duplicate startup.");
    return;
  }
  (global as any).discordBotInitialized = true;

  console.log("🤖 Starting Discord Bot inside Next.js process...");

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
    ],
  });

  client.once(Events.ClientReady, (readyClient) => {
    console.log(`🤖 Discord Bot is logged in as ${readyClient.user.tag}!`);
  });

  // Event listener for when a member joins the guild
  client.on(Events.GuildMemberAdd, async (member) => {
    if (member.guild.id !== DISCORD_GUILD_ID) return;

    console.log(`\nNew member joined: ${member.user.tag} (${member.id})`);

    try {
      await connectToDatabase();
      
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

  client.login(DISCORD_BOT_TOKEN).catch(err => {
    console.error("❌ Failed to log in Discord bot:", err);
  });
}

function escapeRegex(string: string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}
