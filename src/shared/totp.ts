export class TOTP {
  private static BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

  static generateSecret(length: number = 16): string {
    const randomBytes = new Uint8Array(length);
    crypto.getRandomValues(randomBytes);
    let secret = '';
    for (let i = 0; i < length; i++) {
      secret += this.BASE32_CHARS[randomBytes[i] % 32];
    }
    return secret;
  }

  private static base32ToBytes(base32: string): Uint8Array {
    const cleanBase32 = base32.toUpperCase().replace(/[^A-Z2-7]/g, '');
    let bits = 0;
    let value = 0;
    const bytes: number[] = [];

    for (let i = 0; i < cleanBase32.length; i++) {
      value = (value << 5) | this.BASE32_CHARS.indexOf(cleanBase32[i]);
      bits += 5;

      if (bits >= 8) {
        bytes.push((value >>> (bits - 8)) & 255);
        bits -= 8;
      }
    }

    return new Uint8Array(bytes);
  }

  static async generateTOTP(secret: string, timeStepWindow: number = 0): Promise<string> {
    const epoch = Math.floor(Date.now() / 1000);
    const counter = Math.floor(epoch / 30) + timeStepWindow;

    const counterBuffer = new ArrayBuffer(8);
    const counterView = new DataView(counterBuffer);
    counterView.setBigUint64(0, BigInt(counter), false);

    const keyUint8 = this.base32ToBytes(secret);
    const keyBuffer = keyUint8.buffer.slice(keyUint8.byteOffset, keyUint8.byteOffset + keyUint8.byteLength) as ArrayBuffer;

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, counterBuffer);
    const hashBytes = new Uint8Array(signature);

    const offset = hashBytes[hashBytes.length - 1] & 0xf;
    const binary =
      ((hashBytes[offset] & 0x7f) << 24) |
      ((hashBytes[offset + 1] & 0xff) << 16) |
      ((hashBytes[offset + 2] & 0xff) << 8) |
      (hashBytes[offset + 3] & 0xff);

    const otp = binary % 1000000;
    return otp.toString().padStart(6, '0');
  }

  static async verifyTOTP(secret: string, code: string, window: number = 1): Promise<boolean> {
    const cleanCode = code.trim().replace(/\s+/g, '');
    if (cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
      return false;
    }

    for (let errorWindow = -window; errorWindow <= window; errorWindow++) {
      const generatedCode = await this.generateTOTP(secret, errorWindow);
      if (generatedCode === cleanCode) {
        return true;
      }
    }

    return false;
  }

  static getOtpAuthUrl(secret: string, accountName: string = 'admin', issuer: string = 'MonitorFlare'): string {
    const encodedIssuer = encodeURIComponent(issuer);
    const encodedAccount = encodeURIComponent(accountName);
    return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
  }
}
