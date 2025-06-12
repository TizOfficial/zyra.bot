export async function onRequest(context) {
    const url = new URL(context.request.url);
    const inviteCode = url.searchParams.get("code");

    if (!inviteCode) {
        return new Response(JSON.stringify({ error: "Kein Invite-Code angegeben." }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        const response = await fetch(`https://discord.com/api/v9/invites/${inviteCode}?with_counts=true&with_expiration=true`);
        const data = await response.json();

        if (!response.ok) {
            return new Response(JSON.stringify({ error: "Ungültiger oder abgelaufener Invite-Code." }), {
                status: response.status,
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response(JSON.stringify({
            invite_code: inviteCode,
            created_at: data.expires_at || "Permanent",
            inviter: data.inviter ? {
                id: data.inviter.id,
                username: data.inviter.username,
                discriminator: data.inviter.discriminator,
                avatar: data.inviter.avatar ? `https://cdn.discordapp.com/avatars/${data.inviter.id}/${data.inviter.avatar}.png` : null
            } : null,
            guild: data.guild ? {
                id: data.guild.id,
                name: data.guild.name,
                description: data.guild.description || "Keine Beschreibung",
                icon: data.guild.icon ? `https://cdn.discordapp.com/icons/${data.guild.id}/${data.guild.icon}.png` : null,
                banner: data.guild.banner ? `https://cdn.discordapp.com/banners/${data.guild.id}/${data.guild.banner}.png` : null,
                splash: data.guild.splash ? `https://cdn.discordapp.com/splashes/${data.guild.id}/${data.guild.splash}.png` : null,
                verification_level: data.guild.verification_level,
                nsfw: data.guild.nsfw_level > 0,
                features: data.guild.features,
                premium_tier: data.guild.premium_tier,
                premium_subscription_count: data.guild.premium_subscription_count || 0,
                approximate_member_count: data.approximate_member_count || 0,
                approximate_presence_count: data.approximate_presence_count || 0,
                welcome_screen: data.guild.welcome_screen ? {
                    description: data.guild.welcome_screen.description,
                    welcome_channels: data.guild.welcome_screen.welcome_channels.map(ch => ({
                        channel_id: ch.channel_id,
                        description: ch.description,
                        emoji: ch.emoji
                    }))
                } : null
            } : null,
            channel: data.channel ? {
                id: data.channel.id,
                name: data.channel.name,
                type: data.channel.type,
                nsfw: data.channel.nsfw,
                position: data.channel.position,
                parent_id: data.channel.parent_id
            } : null,
            stage_instance: data.stage_instance ? {
                members: data.stage_instance.members.length,
                topic: data.stage_instance.topic
            } : null
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
