import { createHmac } from 'crypto';
/**
 * Generates a secure one-way hash (HMAC) using SHA-256.
 *
 * @param userId   - The user ID as a string.
 * @param dateTime - The date/time as a string.
 * @param apiKey   - The API key as a string (used as the HMAC secret).
 * @returns        - The resulting hash (hex-encoded) as a string.
 */
export function generateSecureHash(
  userId: string,
  dateTime: string,
  apiKey: string,
): string {
  // Combine userId and dateTime in a consistent way.
  // You can choose any delimiter or format as needed.
  const data = `${userId}:${dateTime}`;

  // Create the HMAC using SHA-256 and the provided apiKey as the secret.
  const hmac = createHmac('sha256', apiKey);

  // Update the HMAC with your data.
  hmac.update(data);

  // Finalize and get the hex-encoded digest.
  return hmac.digest('hex');
}
