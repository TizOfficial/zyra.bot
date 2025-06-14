export async function onRequest() {
  const res = await fetch(`https://dog-api.kinduff.com/api/facts`);
  const data = await res.json();
  return Response.json({ fact: data.facts[0] });
}
