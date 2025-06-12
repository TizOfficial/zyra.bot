export async function onRequest(context) {
    try {
        const url = new URL(context.request.url);
        const channelId = url.searchParams.get("channel_id");

        if (!channelId) {
            return new Response(JSON.stringify({ error: "channel_id erforderlich." }), { status: 400 });
        }

        // Bot-Token aus ENV-Variablen holen
        const botToken = context.env.DISCORD_BOT_TOKEN;
        if (!botToken) {
            return new Response(JSON.stringify({ error: "Bot-Token nicht konfiguriert." }), { status: 500 });
        }

        const response = await fetch(`https://discord.com/api/v10/channels/${channelId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bot ${botToken}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            return new Response(JSON.stringify({ error: `Fehler beim Abruf: ${response.status}` }), { status: response.status });
        }

        const data = await response.json();

        return new Response(JSON.stringify({
            id: data.id,
            name: data.name || "Kein Name",
            type: data.type,
            topic: data.topic || "Kein Thema",
            nsfw: data.nsfw || false,
            position: data.position || 0,
            parent_id: data.parent_id || null, // Falls der Channel in einer Kategorie ist
            rate_limit_per_user: data.rate_limit_per_user || 0, // Slowmode in Sekunden
            bitrate: data.bitrate || null, // Nur für Voice-Channels
            user_limit: data.user_limit || null, // Maximale User (nur Voice-Channels)
            created_at: new Date(parseInt(data.id) / 4194304 + 1420070400000).toISOString()
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: "Interner Fehler", details: error.message }), { status: 500 });
    }
}
