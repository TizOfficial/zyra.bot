export async function onRequest() {
  const res = await fetch(`https://catfact.ninja/fact`);
  const data = await res.json();
  return Response.json(data);
}
