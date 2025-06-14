import keys from './keys.json';

export function checkApiKey(url) {
  const apiKey = url.searchParams.get("key");
  if (!apiKey || !keys.keys.includes(apiKey)) {
    return new Response(JSON.stringify({
      success: false,
      message: "Forbidden: Invalid API key"
    }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }
  return null; // Valid!
}
