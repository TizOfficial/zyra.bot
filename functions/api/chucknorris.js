export async function onRequest() {
  const res = await fetch(`https://api.chucknorris.io/jokes/random`);
  const data = await res.json();
  return Response.json(data);
}
