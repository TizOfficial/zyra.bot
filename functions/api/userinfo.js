export async function onRequest(context) {
    const url = new URL(context.request.url);
    const userId = url.searchParams.get("user_id");

    if (!userId) {
        return new Response(JSON.stringify({ error: "user_id erforderlich." }), { status: 400 });
    }

    const botToken = context.env.DISCORD_BOT_TOKEN;
    if (!botToken) {
        return new Response(JSON.stringify({ error: "Bot-Token nicht konfiguriert." }), { status: 500 });
    }

    try {
        // 1️⃣ Basis-User-Infos abrufen
        const userResponse = await fetch(`https://discord.com/api/v10/users/${userId}`, {
            headers: { Authorization: `Bot ${botToken}` }
        });

        if (!userResponse.ok) {
            return new Response(JSON.stringify({ error: "Ungültige User-ID oder keine Berechtigung." }), { status: 403 });
        }

        const userData = await userResponse.json();

        // 2️⃣ Server-Infos abrufen (falls in einer Gilde)
        let guildData = {};
        const guildId = context.env.DISCORD_GUILD_ID; // Gilde in den ENV-Variablen setzen
        if (guildId) {
            const guildResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${userId}`, {
                headers: { Authorization: `Bot ${botToken}` }
            });

            if (guildResponse.ok) {
                guildData = await guildResponse.json();
            }
        }

        // 3️⃣ Präsenz (Online-Status & Geräte)
        let presenceData = {};
        const presenceResponse = await fetch(`https://discord.com/api/v10/users/${userId}/presence`, {
            headers: { Authorization: `Bot ${botToken}` }
        });

        if (presenceResponse.ok) {
            presenceData = await presenceResponse.json();
        }

        // 🏆 4️⃣ BADGES: Öffentliche Flags (Staff, Hypesquad, Bug Hunter)
        const publicFlags = userData.public_flags || 0;
        const flagBadges = {
            1: "Discord Staff",
            2: "Partner",
            4: "Hypesquad Events",
            8: "Bug Hunter Level 1",
            64: "Hypesquad Bravery",
            128: "Hypesquad Brilliance",
            256: "Hypesquad Balance",
            512: "Early Supporter",
            16384: "Bug Hunter Level 2",
            131072: "Verified Bot Developer",
            4194304: "Active Developer"
        };

        const badges = [];
        Object.keys(flagBadges).forEach(flag => {
            if (publicFlags & flag) {
                badges.push(flagBadges[flag]);
            }
        });

        // 🎟️ 5️⃣ Nitro-Status herausfinden
        const nitroTypes = {
            0: "Kein Nitro",
            1: "Nitro Classic",
            2: "Nitro"
        };

        const nitroType = guildData.premium_type ? nitroTypes[guildData.premium_type] : "Unbekannt";

        // 🚀 6️⃣ Server Boost-Status (falls Gilde vorhanden)
        let boostingSince = guildData.premium_since || null;

        if (boostingSince) {
            badges.push("Server Booster");
        }

        // 7️⃣ Avatar, Banner & andere User-Infos
        const avatarUrl = userData.avatar 
            ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.${userData.avatar.startsWith("a_") ? "gif" : "png"}`
            : null;

        const bannerUrl = userData.banner 
            ? `https://cdn.discordapp.com/banners/${userData.id}/${userData.banner}.${userData.banner.startsWith("a_") ? "gif" : "png"}`
            : null;

        // Discord Snowflake → Erstellungsdatum
        const discordEpoch = 1420070400000;
        const timestamp = parseInt(userData.id) / 4194304 + discordEpoch;
        const createdAt = new Date(timestamp).toISOString();

        // 🔥 8️⃣ Aktivitäts- & Geräte-Daten
        const devices = presenceData.client_status || {};
        const activities = presenceData.activities?.map(activity => ({
            name: activity.name,
            type: activity.type,
            details: activity.details || null,
            state: activity.state || null
        })) || [];

        // 9️⃣ Finale JSON-Antwort
        return new Response(JSON.stringify({
            id: userData.id,
            username: userData.username,
            discriminator: userData.discriminator,
            global_name: userData.global_name || userData.username,
            bot: userData.bot || false,
            system: userData.system || false,
            avatar_url: avatarUrl,
            banner_url: bannerUrl,
            accent_color: userData.accent_color || null,
            created_at: createdAt,
            badges: badges.length > 0 ? badges : undefined,
            nitro_type: nitroType,
            boosting_since: boostingSince,
            presence: presenceData.status || "offline",
            devices: devices,
            activities: activities
        }, null, 2), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: "Interner Fehler", details: error.message }), { status: 500 });
    }
          }
