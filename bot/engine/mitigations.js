const { PermissionFlagsBits, ChannelType } = require('discord.js');

const quarantineSetupDone = new Set();
const unqTimers = new Map();

async function ensureQuarantineRole(guild, roleName = 'Quarantine') {
  let role = guild.roles.cache.find(r => r.name === roleName);
  if (!role) {
    role = await guild.roles.create({
      name: roleName,
      permissions: [],
      reason: 'Rex Secure: create quarantine role'
    });
  }
  return role;
}

async function applyOverwritesForQuarantine(guild, role) {
  const key = `${guild.id}:${role.id}`;
  if (quarantineSetupDone.has(key)) return;

  const me = guild.members.me || await guild.members.fetchMe().catch(() => null);
  if (!me) return;

  const denyText = {
    SendMessages: false,
    AddReactions: false,
    SendMessagesInThreads: false
  };
  const denyVoice = {
    Connect: false,
    Speak: false,
    Stream: false,
    UseVAD: false
  };

  const channels = guild.channels.cache;
  for (const [, ch] of channels) {
    try {
      if (
        ch.type === ChannelType.GuildText ||
        ch.type === ChannelType.GuildAnnouncement ||
        ch.type === ChannelType.GuildForum
      ) {
        await ch.permissionOverwrites.edit(role, denyText, { reason: 'Rex Secure: quarantine text' });
      } else if (
        ch.type === ChannelType.GuildVoice ||
        ch.type === ChannelType.GuildStageVoice
      ) {
        await ch.permissionOverwrites.edit(role, denyVoice, { reason: 'Rex Secure: quarantine voice' });
      }
    } catch (e) {
      console.warn('[Rex][quarantine] overwrite fail on channel', ch.id, e?.message);
    }
  }

  quarantineSetupDone.add(key);
}

function scheduleAutoUnquarantine(guildId, userId, roleId, durationMs, removeFn) {
  const tKey = `${guildId}:${userId}:${roleId}`;
  const old = unqTimers.get(tKey);
  if (old) clearTimeout(old);

  const timer = setTimeout(async () => {
    try {
      await removeFn();
      console.log('[Rex][quarantine] auto-unquarantine OK', { guildId, userId });
    } catch (e) {
      console.error('[Rex][quarantine] auto-unquarantine fail', e?.message);
    } finally {
      unqTimers.delete(tKey);
    }
  }, durationMs);

  unqTimers.set(tKey, timer);
}

async function applyMitigation(client, ctx, decision, cfg) {
  const lvl = decision?.level ?? 'log';
  const enforce = (cfg?.mode ?? 'observe') === 'enforce';

  console.log('[Rex][mitigation]', {
    guild: ctx.guild?.id, channel: ctx.channel?.id, user: ctx.author?.id,
    level: lvl, enforce, cfgMode: cfg?.mode
  });

  if (!enforce || lvl === 'log') return;

  if (lvl === 'soft' && ctx && typeof ctx.delete === 'function') {
    try {
      if (ctx.channel?.isThread?.()) { try { await ctx.channel.join(); } catch {} }

      let me = ctx.guild?.members?.me || await ctx.guild.members.fetchMe().catch(() => null);
      const perms = ctx.channel?.permissionsFor?.(me?.id ?? client.user.id);
      const hasView    = perms?.has(PermissionFlagsBits.ViewChannel);
      const hasHistory = perms?.has(PermissionFlagsBits.ReadMessageHistory);
      const hasManage  = perms?.has(PermissionFlagsBits.ManageMessages);
      console.log('[Rex][perms-soft]', { hasView, hasHistory, hasManage });

      if (!hasView || !hasHistory || !hasManage) return;

      if (ctx.deleted || ctx.deletable === false) {
        try { await ctx.channel.messages.delete(ctx.id); return; }
        catch (e) { console.error('[Rex] Fallback delete(messageId) KO:', e?.message); return; }
      }
      await ctx.delete();
      console.log('[Rex] Delete OK');
    } catch (e) { console.error('[Rex] Delete échec:', e?.message || e); }
    return;
  }

  if (lvl === 'quarantine' && ctx?.member) {
    try {
      const guild = ctx.guild;

      const me = guild.members.me || await guild.members.fetchMe().catch(() => null);
      const canManageRoles   = me?.permissions?.has(PermissionFlagsBits.ManageRoles);
      const canManageChannel = me?.permissions?.has(PermissionFlagsBits.ManageChannels);
      if (!canManageRoles) {
        console.warn('[Rex][quarantine] manque ManageRoles');
        return;
      }

      const roleName = cfg?.quarantine?.role_name || 'Mute';
      const durationSec = Number(cfg?.quarantine?.duration_sec ?? 3600);
      const role = await ensureQuarantineRole(guild, roleName);

      if (me.roles.highest.comparePositionTo(role) <= 0) {
        console.warn('[Rex][quarantine] rôle bot pas assez haut pour assigner le rôle Quarantine');
        return;
      }

      if (canManageChannel) {
        await applyOverwritesForQuarantine(guild, role);
      } else {
        console.warn('[Rex][quarantine] skip overwrites (pas ManageChannels)');
      }

      await ctx.member.roles.add(role, 'Rex Secure: quarantine');
      console.log('[Rex][quarantine] role assigned', { user: ctx.author.id });

      scheduleAutoUnquarantine(
        guild.id,
        ctx.author.id,
        role.id,
        Math.max(5_000, durationSec * 1000),
        async () => {
          const fresh = await guild.members.fetch(ctx.author.id).catch(() => null);
          if (!fresh) return;
          if (fresh.roles.cache.has(role.id)) {
            await fresh.roles.remove(role, 'Rex Secure: auto-unquarantine');
          }
        }
      );
    } catch (e) {
      console.error('[Rex][quarantine] fail:', e?.message || e);
    }
    return;
  }

}

module.exports = { applyMitigation };