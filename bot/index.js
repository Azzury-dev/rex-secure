require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Events } = require('discord.js');
const { ensureGuild } = require('./services/config');
const { onMessageCreate } = require('./listeners/messageCreate');
const { onGuildMemberAdd } = require('./listeners/guildMemberAdd');
const { onGuildUpdate } = require('./listeners/guildUpdate');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildWebhooks
  ],
  partials: [Partials.Channel]
});

client.once(Events.ClientReady, async () => {
  console.log(`[Rex] Connecté en tant que ${client.user.tag}`);
  for (const [id, g] of client.guilds.cache) {
    await ensureGuild({ id, name: g.name });
  }
});

client.on(Events.GuildCreate, async (guild) => {
  await ensureGuild({ id: guild.id, name: guild.name });
  console.log(`[Rex] Ajouté à ${guild.name} (${guild.id})`);
});

client.on(Events.GuildDelete, async (guild) => {
  console.log(`[Rex] Retiré de ${guild.id}`);
});

client.on(Events.MessageCreate, (msg) => onMessageCreate(client, msg));
client.on(Events.GuildMemberAdd, (member) => onGuildMemberAdd(client, member));
client.on(Events.GuildUpdate, (oldG, newG) => onGuildUpdate(client, oldG, newG));

client.login(process.env.BOT_TOKEN);
