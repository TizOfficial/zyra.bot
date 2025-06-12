export async function onRequest(context) {
    const url = new URL(context.request.url);
    const guildId = url.searchParams.get("guild_id");

    if (!guildId) {
        return new Response(JSON.stringify({ error: "guild_id erforderlich." }), { status: 400 });
    }

    // Bot-Token aus Cloudflare-Umgebung abrufen
    const botToken = context.env.DISCORD_BOT_TOKEN;
    if (!botToken) {
        return new Response(JSON.stringify({ error: "Bot-Token nicht konfiguriert." }), { status: 500 });
    }

    try {
        // Server-Infos abrufen
        const guildResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}?with_counts=true`, {
            headers: { Authorization: `Bot ${botToken}` }
        });

        if (!guildResponse.ok) {
            return new Response(JSON.stringify({ error: "Ungültige Server-ID oder keine Berechtigung." }), { status: 403 });
        }

        const guildData = await guildResponse.json();

        // Channels abrufen
        const channelsResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
            headers: { Authorization: `Bot ${botToken}` }
        });

        const channels = channelsResponse.ok ? await channelsResponse.json() : [];

        // Berechnungen der Kanäle
        const channelStats = {
            total: channels.length,
            text: channels.filter(c => c.type === 0).length,
            voice: channels.filter(c => c.type === 2).length,
            categories: channels.filter(c => c.type === 4).length,
            stage: channels.filter(c => c.type === 13).length,
            forum: channels.filter(c => c.type === 15).length
        };

        // Berechnung des Erstellungsdatums
        const discordEpoch = 1420070400000;
        const timestamp = parseInt(guildData.id) / 4194304 + discordEpoch;
        const createdAt = new Date(timestamp).toISOString();

        return new Response(JSON.stringify({
            id: guildData.id,
            name: guildData.name,
            description: guildData.description || "Keine Beschreibung",
            icon_url: guildData.icon ? `https://cdn.discordapp.com/icons/${guildData.id}/${guildData.icon}.png` : null,
            banner_url: guildData.banner ? `https://cdn.discordapp.com/banners/${guildData.id}/${guildData.banner}.png` : null,
            splash_url: guildData.splash ? `https://cdn.discordapp.com/splashes/${guildData.id}/${guildData.splash}.png` : null,
            owner_id: guildData.owner_id,
            preferred_locale: guildData.preferred_locale || "Unbekannt",
            system_channel_id: guildData.system_channel_id || "Nicht verfügbar",
            member_count: guildData.approximate_member_count || 0,
            online_members: guildData.approximate_presence_count || 0,
            premium_tier: guildData.premium_tier,
            premium_subscription_count: guildData.premium_subscription_count || 0,
            verification_level: guildData.verification_level,
            mfa_level: guildData.mfa_level,
            explicit_content_filter: guildData.explicit_content_filter,
            default_message_notifications: guildData.default_message_notifications,
            roles_count: guildData.roles ? guildData.roles.length : 0,
            emojis_count: guildData.emojis ? guildData.emojis.length : 0,
            stickers_count: guildData.stickers ? guildData.stickers.length : 0,
            features: guildData.features || [],
            created_at: createdAt,
            channels: channelStats
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: "Interner Fehler", details: error.message }), { status: 500 });
    }
}
