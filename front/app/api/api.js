
export default async function api(url, { method = "GET", body, headers } = {}) {
    console.info("==> Appi body: ", body);
    console.info("==> Appi headers: ", headers);
  const res = await fetch(url, {
    method,
    credentials: "include",
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error?.code || `HTTP ${res.status}`);
  }
  return res.json();
}