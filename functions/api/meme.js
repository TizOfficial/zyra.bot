export async function onRequest() {
  const res = await fetch(`https://meme-api.com/gimme`);
  const data = await res.json();
  return Response.json(data);
}
