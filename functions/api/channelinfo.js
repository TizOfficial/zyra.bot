export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const channelId = url.searchParams.get("id");

  if (!channelId) {
    return new Response("Missing ?id=", { status: 400 });
  }

  const res = await fetch(`https://discord.com/api/v10/channels/${channelId}`, {
    headers: {
      "Authorization": `Bot ${env.DISCORD_BOT_TOKEN}`
    }
  });

  const data = await res.json();
  return Response.json(data);
}
