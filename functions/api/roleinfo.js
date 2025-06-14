export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const guildId = url.searchParams.get("guild");
  const roleId = url.searchParams.get("role");

  if (!guildId || !roleId) {
    return new Response("Missing ?guild= and/or ?role=", { status: 400 });
  }

  const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
    headers: {
      "Authorization": `Bot ${env.DISCORD_BOT_TOKEN}`
    }
  });

  const roles = await res.json();
  const role = roles.find(r => r.id === roleId);

  if (!role) {
    return new Response("Role not found", { status: 404 });
  }

  return Response.json(role);
}
