import { checkApiKey } from './checkApiKey';
import { snowflakeToTimestamp } from './snowflake';

export async function onRequest({ request, env }) {
  const url = new URL(request.url);

  // ✅ 1) Check API-Key
  const auth = checkApiKey(url);
  if (auth) return auth;

  const guildId = env.GUILD_ID;

  const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}`, {
    headers: {
      "Authorization": `Bot ${env.DISCORD_BOT_TOKEN}`
    }
  });

  if (!res.ok) {
    return new Response(`Discord API Error: ${res.statusText}`, { status: res.status });
  }

  const guild = await res.json();

  return Response.json({
    success: true,
    id: guild.id,
    name: guild.name,
    icon: guild.icon,
    owner_id: guild.owner_id,
    region: guild.region,
    afk_channel: guild.afk_channel_id,
    afk_timeout: guild.afk_timeout,
    verification_level: guild.verification_level,
    default_message_notifications: guild.default_message_notifications,
    explicit_content_filter: guild.explicit_content_filter,
    roles: guild.roles,
    emojis: guild.roles,
    features: guild.features,
    mfa_level: guild.mfa_level,
    widget_enabled: guild.widget_enabled,
    system_channel_id: guild.system_channel_id,
    rules_channel_id: guild.rules_channel_id,
    member_count: guild.approximate_member_count,
    boosts: guild.premium_subscription_count,
    boost_level: guild.premium_tier,
    created_timestamp: snowflakeToTimestamp(guild.id),
    created_iso: new Date(snowflakeToTimestamp(guild.id)).toISOString()
  });
}
