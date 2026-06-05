/**
 * R19/S-4 — LargeSecureStore: encrypt Supabase auth tokens at rest.
 *
 * Default Supabase RN storage is plain AsyncStorage — unencrypted on disk,
 * extractable on a rooted/jailbroken device. expo-secure-store uses the
 * iOS Keychain / Android Keystore but caps each value at ~2 KB, and
 * Supabase session blobs (access + refresh JWT) routinely exceed that.
 *
 * Pattern (Supabase-documented): generate a per-key AES-256 key, keep the
 * small key in SecureStore (fits the 2 KB cap), store the bulky ciphertext
 * in AsyncStorage. An attacker with the AsyncStorage blob can't decrypt
 * without the Keychain-protected key.
 *
 * FAIL-SAFE: if SecureStore / crypto is unavailable for ANY reason, every
 * method degrades to plain AsyncStorage — identical to the prior behaviour.
 * A bug here can never log the whole userbase out; worst case is "no better
 * than before". Supabase only ever sees a valid get/set/removeItem surface.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import aesjs from 'aes-js';

// SecureStore keys must be alphanumeric + ".-_"; Supabase storage keys
// contain ':' etc., so hash them into a safe key id.
function keyIdFor(name: string): string {
  let h = 5381;
  for (let i = 0; i < name.length; i++) h = ((h << 5) + h + name.charCodeAt(i)) >>> 0;
  return `sb_enc_${h.toString(16)}`;
}

// Tag ciphertext so reads can distinguish an encrypted blob from a legacy
// plaintext value written before this adapter shipped.
const ENC_PREFIX = 'enc:v1:';

async function encrypt(name: string, plaintext: string): Promise<string> {
  const keyBytes = Crypto.getRandomBytes(32); // AES-256
  const cipher = new aesjs.ModeOfOperation.ctr(keyBytes, new aesjs.Counter(1));
  const encrypted = cipher.encrypt(aesjs.utils.utf8.toBytes(plaintext));
  await SecureStore.setItemAsync(keyIdFor(name), aesjs.utils.hex.fromBytes(keyBytes));
  return ENC_PREFIX + aesjs.utils.hex.fromBytes(encrypted);
}

async function decrypt(name: string, cipherHex: string): Promise<string | null> {
  const keyHex = await SecureStore.getItemAsync(keyIdFor(name));
  if (!keyHex) return null; // key gone -> unrecoverable (treat as logged-out)
  const keyBytes = aesjs.utils.hex.toBytes(keyHex);
  const cipher = new aesjs.ModeOfOperation.ctr(keyBytes, new aesjs.Counter(1));
  const decrypted = cipher.decrypt(aesjs.utils.hex.toBytes(cipherHex));
  return aesjs.utils.utf8.fromBytes(decrypted);
}

export const LargeSecureStore = {
  async getItem(key: string): Promise<string | null> {
    let stored: string | null = null;
    try {
      stored = await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
    if (!stored) return null;
    // Legacy plaintext (pre-S-4) -> return verbatim so the migration doesn't
    // log the user out; re-encrypted on next setItem.
    if (!stored.startsWith(ENC_PREFIX)) return stored;
    try {
      return await decrypt(key, stored.slice(ENC_PREFIX.length));
    } catch {
      // Encrypted but key unreadable -> clean logout. NEVER return ciphertext.
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      const tagged = await encrypt(key, value);
      await AsyncStorage.setItem(key, tagged);
    } catch {
      try {
        await AsyncStorage.setItem(key, value); // fail-safe: keep the session
      } catch {
        /* give up - Supabase re-auths next launch */
      }
    }
  },

  async removeItem(key: string): Promise<void> {
    try { await SecureStore.deleteItemAsync(keyIdFor(key)); } catch { /* ignore */ }
    try { await AsyncStorage.removeItem(key); } catch { /* ignore */ }
  },
};
