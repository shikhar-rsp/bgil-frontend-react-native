import CryptoJS from "crypto-js";

/**
 * Encrypt data using AES‑256
 * @param data string | object
 * @param secretKey 32‑character secret key
 */
export const encryptAES = <T>(
  data: T,
  secretKey: string
): string => {
  if (secretKey.length !== 32) {
    throw new Error("Secret key must be 32 characters for AES‑256");
  }

  const text =
    typeof data === "string" ? data : JSON.stringify(data);

  const encrypted = CryptoJS.AES.encrypt(
    text,
    CryptoJS.enc.Utf8.parse(secretKey),
    {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );

  return encrypted.toString();
};

/**
 * Decrypt AES‑256 encrypted string
 * @param encryptedData AES encrypted text
 * @param secretKey 32‑character secret key
 */
export const decryptAES = <T = unknown>(
  encryptedData: string,
  secretKey: string
): T => {
  if (secretKey.length !== 32) {
    throw new Error("Secret key must be 32 characters for AES‑256");
  }

  const decrypted = CryptoJS.AES.decrypt(
    encryptedData,
    CryptoJS.enc.Utf8.parse(secretKey),
    {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );

  const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

  if (!decryptedText) {
    throw new Error("Invalid encryption key or corrupted data");
  }

  try {
    return JSON.parse(decryptedText) as T;
  } catch {
    return decryptedText as T;
  }
};

/**
 * Generate a unique correlation ID for tracking requests
 * @returns A unique UUID string to be used as a correlation ID for request tracking
 */
export const generateCorrelationId = (): string => {
  // React Native has no `crypto.randomUUID`. Build a RFC-4122 v4 UUID from
  // CryptoJS's CSPRNG (`WordArray.random`) so no Web Crypto / extra native
  // module is required.
  const bytes = CryptoJS.lib.WordArray.random(16);
  const hex = CryptoJS.enc.Hex.stringify(bytes);
  const b = hex.match(/.{2}/g) as string[];
  // Set version (4) and variant (10xx) bits per RFC 4122.
  b[6] = ((parseInt(b[6], 16) & 0x0f) | 0x40).toString(16).padStart(2, '0');
  b[8] = ((parseInt(b[8], 16) & 0x3f) | 0x80).toString(16).padStart(2, '0');
  const correlationId = `${b.slice(0, 4).join('')}-${b.slice(4, 6).join('')}-${b
    .slice(6, 8)
    .join('')}-${b.slice(8, 10).join('')}-${b.slice(10, 16).join('')}`;
  console.log(correlationId);
  return correlationId;
};

/**
 * Encrypt message using 256-bit AES with provided key and IV
 * @param key - Secret key (UTF-8 encoded string)
 * @param message - Plain text message to encrypt
 * @param iv - Initialization Vector (UTF-8 encoded string)
 * @returns Base64 encoded ciphertext
 */
export const encrypt = (key: string, message: string, iv: string): string => {
  try {
    const keyBytes = CryptoJS.enc.Utf8.parse(key);
    const ivBytes = CryptoJS.enc.Utf8.parse(iv);
    const messageBytes = CryptoJS.enc.Utf8.parse(message);

    const encrypted = CryptoJS.AES.encrypt(messageBytes, keyBytes, {
      iv: ivBytes,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const encoded = encrypted.toString();
    console.log('Encrypted message:', encoded);
    return encoded;
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
};

/**
 * Decrypt ciphertext using 256-bit AES with provided key and IV
 * @param key - Secret key (UTF-8 encoded string)
 * @param base64EncodedCipherText - Base64 encoded ciphertext
 * @param iv - Initialization Vector (UTF-8 encoded string)
 * @returns Decrypted plain text message
 */
export const decrypt = (
  key: string,
  base64EncodedCipherText: string,
  iv: string
): string => {
  try {
    console.log("====encrypted payload ===>",base64EncodedCipherText)
    const keyBytes = CryptoJS.enc.Utf8.parse(key);
    const ivBytes = CryptoJS.enc.Utf8.parse(iv);

    const decrypted = CryptoJS.AES.decrypt(base64EncodedCipherText, keyBytes, {
      iv: ivBytes,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const message = decrypted.toString(CryptoJS.enc.Utf8);

    if (message === '') {
      // Empty string is valid, check if it's actually corrupted
      // by comparing with the input ciphertext validity
      try {
        CryptoJS.enc.Base64.parse(base64EncodedCipherText);
      } catch {
        throw new Error('Invalid encryption key or corrupted data');
      }
    }

    console.log('Decrypted message:', message);
    return message;
  } catch (error) {
    console.error('Decryption error:', error);
    throw error;
  }
};

/**
 * Generate HMAC-SHA256 signature for data (matches backend's generateHmacUni)
 * Backend logic:
 *   - Mac mac = Mac.getInstance("HmacSHA256");
 *   - SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
 *   - mac.init(secretKeySpec);
 *   - byte[] hmacBytes = mac.doFinal(jsonData.getBytes(StandardCharsets.UTF_8));
 *   - return Base64.getEncoder().encodeToString(hmacBytes);
 * 
 * @param data - Data object or string to generate HMAC for
 * @param key - Secret key for HMAC generation (UTF-8 encoded)
 * @returns Base64 encoded HMAC signature
 */
export const generateHmac = (
  data: object | string,
  key: string
): string => {
  try {
    // Convert to string - use JSON.stringify for objects
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
    
    // Parse both key and message as UTF-8
    const keyBytes = CryptoJS.enc.Utf8.parse(key);
    const message = CryptoJS.enc.Utf8.parse(jsonString);

    // Generate HMAC-SHA256
    const hmac = CryptoJS.HmacSHA256(message, keyBytes);
    
    // Encode as Base64
    const encoded = CryptoJS.enc.Base64.stringify(hmac);

    console.log('Generated HMAC:', encoded);
    console.log('Payload:', jsonString);
    return encoded;
  } catch (error) {
    console.error('HMAC generation error:', error);
    throw error;
  }
};

/**
 * Generate HMAC-SHA256 using Web Crypto API.
 * This mirrors the browser-side implementation based on crypto.subtle.
 *
 * @param data - Data object or string to generate HMAC for
 * @param key - Secret key for HMAC generation (UTF-8 encoded)
 * @returns Base64 encoded HMAC signature
 */
export const generateHmacAsync = async (
  data: object,
  key: string
): Promise<string> => {
  // The web build used Web Crypto (`crypto.subtle` + `TextEncoder` + `btoa`),
  // none of which exist in React Native. The synchronous CryptoJS path above
  // produces an identical HMAC-SHA256 (UTF-8 key over `JSON.stringify(data)`,
  // Base64-encoded), so we simply delegate to it and keep the async signature
  // the callers already expect.
  return generateHmac(data, key);
};
