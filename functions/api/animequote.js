export async function onRequest() {
  const res = await fetch(`https://animechan.xyz/api/random`);
  const data = await res.json();
  return Response.json({
    anime: data.anime,
    character: data.character,
    quote: data.quote
  });
}
