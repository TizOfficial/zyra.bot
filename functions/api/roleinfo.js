export async function onRequest(context) {
    const url = new URL(context.request.url);
    const guildId = url.searchParams.get("guild_id");
    const roleId = url.searchParams.get("role_id");

    if (!guildId || !roleId) {
        return new Response(JSON.stringify({ error: "guild_id und role_id sind erforderlich." }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }

    const BOT_TOKEN = context.env.DISCORD_BOT_TOKEN; // Ersetze mit deinem Bot-Token

    try {
        const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
            headers: { Authorization: `Bot ${BOT_TOKEN}` }
        });

        if (!response.ok) {
            return new Response(JSON.stringify({ error: "Ungültige Server-ID oder fehlende Berechtigungen." }), {
                status: response.status,
                headers: { "Content-Type": "application/json" }
            });
        }

        const roles = await response.json();
        const role = roles.find(r => r.id === roleId);

        if (!role) {
            return new Response(JSON.stringify({ error: "Rolle nicht gefunden." }), {
                status: 404,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Berechnetes Erstellungsdatum (Snowflake zu Datum)
        const createdAt = new Date(Number((BigInt(role.id) >> 22n) + 1420070400000n)).toISOString();

        return new Response(JSON.stringify({
            id: role.id,
            name: role.name,
            color: `#${role.color.toString(16).padStart(6, "0")}`,
            hoist: role.hoist, // Wird die Rolle separat in der Mitgliederliste angezeigt?
            position: role.position, // Position der Rolle im Server
            permissions: role.permissions, // Berechtigungen als Bitwert
            permissions_decoded: decodePermissions(BigInt(role.permissions)), // Berechtigungen als lesbare Liste
            managed: role.managed, // Gehört die Rolle zu einem Bot/Integration?
            mentionable: role.mentionable, // Können User die Rolle erwähnen?
            is_everyone_role: role.id === guildId, // Ist es die @everyone-Rolle?
            integration: role.tags?.integration_id || null, // Gehört die Rolle zu einer Integration?
            bot_id: role.tags?.bot_id || null, // Ist es eine Bot-Rolle?
            premium_subscriber: role.tags?.premium_subscriber !== undefined, // Boost-Rolle?
            unicode_emoji: role.unicode_emoji || null, // Hat die Rolle ein Unicode-Emoji?
            created_at: createdAt
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: "Interner Fehler", details: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}

// Funktion zur Umwandlung der Berechtigungen in eine lesbare Liste
function decodePermissions(permissions) {
    const permissionFlags = {
        CREATE_INSTANT_INVITE: 0x00000001,
        KICK_MEMBERS: 0x00000002,
        BAN_MEMBERS: 0x00000004,
        ADMINISTRATOR: 0x00000008,
        MANAGE_CHANNELS: 0x00000010,
        MANAGE_GUILD: 0x00000020,
        ADD_REACTIONS: 0x00000040,
        VIEW_AUDIT_LOG: 0x00000080,
        PRIORITY_SPEAKER: 0x00000100,
        STREAM: 0x00000200,
        VIEW_CHANNEL: 0x00000400,
        SEND_MESSAGES: 0x00000800,
        MANAGE_MESSAGES: 0x00002000,
        EMBED_LINKS: 0x00004000,
        ATTACH_FILES: 0x00008000,
        READ_MESSAGE_HISTORY: 0x00010000,
        MENTION_EVERYONE: 0x00020000,
        USE_EXTERNAL_EMOJIS: 0x00040000,
        CONNECT: 0x00100000,
        SPEAK: 0x00200000,
        MUTE_MEMBERS: 0x00400000,
        DEAFEN_MEMBERS: 0x00800000,
        MOVE_MEMBERS: 0x01000000,
        USE_VAD: 0x02000000,
        CHANGE_NICKNAME: 0x04000000,
        MANAGE_NICKNAMES: 0x08000000,
        MANAGE_ROLES: 0x10000000,
        MANAGE_WEBHOOKS: 0x20000000,
        MANAGE_EMOJIS_AND_STICKERS: 0x40000000,
        USE_APPLICATION_COMMANDS: 0x80000000,
        REQUEST_TO_SPEAK: 0x100000000,
        MANAGE_EVENTS: 0x200000000,
        MANAGE_THREADS: 0x400000000,
        CREATE_PUBLIC_THREADS: 0x800000000,
        CREATE_PRIVATE_THREADS: 0x1000000000,
        USE_EXTERNAL_STICKERS: 0x2000000000,
        SEND_MESSAGES_IN_THREADS: 0x4000000000,
        START_EMBEDDED_ACTIVITIES: 0x8000000000,
        MODERATE_MEMBERS: 0x10000000000
    };

    let decoded = [];
    for (const [key, value] of Object.entries(permissionFlags)) {
        if ((permissions & BigInt(value)) === BigInt(value)) {
            decoded.push(key);
        }
    }
    return decoded;
}
