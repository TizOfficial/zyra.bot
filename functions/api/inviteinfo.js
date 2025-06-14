export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response("Missing ?code=", { status: 400 });
  }

  const res = await fetch(`https://discord.com/api/v10/invites/${code}?with_counts=true`, {
    headers: {
      "Authorization": `Bot ${env.DISCORD_BOT_TOKEN}`
    }
  });

  const data = await res.json();
  return Response.json(data);
}
