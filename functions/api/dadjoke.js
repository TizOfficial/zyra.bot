export async function onRequest() {
  const res = await fetch(`https://icanhazdadjoke.com/`, {
    headers: { "Accept": "application/json" }
  });
  const data = await res.json();
  return Response.json({ joke: data.joke });
}
