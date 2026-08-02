const encoder = new TextEncoder();

async function hmacHex(secret: string, message: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const bytes = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let i = 0; i < left.length; i++) {
    result |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return result === 0;
}

export async function verifyGenericHmac(input: {
  secret: string;
  rawBody: string;
  suppliedSignature: string;
  timestamp?: string;
  toleranceSeconds?: number;
}) {
  if (input.timestamp) {
    const timestamp = Number(input.timestamp);
    const tolerance = input.toleranceSeconds ?? 300;
    if (
      !Number.isFinite(timestamp) ||
      Math.abs(Date.now() / 1000 - timestamp) > tolerance
    ) {
      return false;
    }
  }

  const message = input.timestamp
    ? `${input.timestamp}.${input.rawBody}`
    : input.rawBody;

  const expected = await hmacHex(input.secret, message);
  return constantTimeEqual(expected, input.suppliedSignature);
}
