export async function onRequest({ request }) {
  const url = new URL(request.url);
  const name = url.searchParams.get("name") || "pikachu";

  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(name)}`);
  const data = await res.json();
  return Response.json(data);
}
