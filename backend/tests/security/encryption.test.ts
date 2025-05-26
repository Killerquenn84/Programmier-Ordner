import { EncryptionService } from '../../src/utils/encryption';
import { describe, it, expect } from '@jest/globals';

describe('Encryption Tests', () => {
  const encryptionService = EncryptionService.getInstance();

  // Test: Text verschlüsseln und entschlüsseln
  it('sollte Text korrekt verschlüsseln und entschlüsseln', () => {
    const originalText = 'Test Text';
    const encrypted = encryptionService.encrypt(originalText);
    const decrypted = encryptionService.decrypt(encrypted);

    expect(encrypted).not.toBe(originalText);
    expect(decrypted).toBe(originalText);
  });

  // Test: Objekt verschlüsseln und entschlüsseln
  it('sollte Objekte korrekt verschlüsseln und entschlüsseln', () => {
    const originalObject = {
      name: 'Test',
      age: 30,
      isActive: true
    };

    const encrypted = encryptionService.encryptObject(originalObject);
    const decrypted = encryptionService.decryptObject(encrypted);

    expect(encrypted).not.toEqual(originalObject);
    expect(decrypted).toEqual(originalObject);
  });

  // Test: Ungültige Verschlüsselung
  it('sollte bei ungültiger Verschlüsselung einen Fehler werfen', () => {
    expect(() => {
      encryptionService.decrypt('invalid-encrypted-text');
    }).toThrow('Entschlüsselung fehlgeschlagen');
  });

  // Test: Ungültiges verschlüsseltes Objekt
  it('sollte bei ungültigem verschlüsselten Objekt einen Fehler werfen', () => {
    expect(() => {
      encryptionService.decryptObject('invalid-encrypted-object');
    }).toThrow('Entschlüsselung fehlgeschlagen');
  });
}); 