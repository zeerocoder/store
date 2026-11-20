import test from 'node:test';
import assert from 'node:assert/strict';
import { compressImage, safeLocalStorageSet } from './imageStorage';

test('compressImage returns remote URL unchanged without unnecessary re-encoding', async () => {
  const url = 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f';
  const result = await compressImage(url);
  assert.equal(result, url);
});

test('compressImage returns dataUrl fallback in non-browser environment', async () => {
  const fakeDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...';
  const result = await compressImage(fakeDataUrl);
  assert.equal(result, fakeDataUrl);
});

test('safeLocalStorageSet handles missing or mocked window without throwing', () => {
  const res = safeLocalStorageSet('test_key', 'test_value');
  assert.equal(typeof res, 'boolean');
});

test('safeLocalStorageSet gracefully handles QuotaExceededError without throwing', () => {
  // Simulate global window.localStorage throwing QuotaExceededError
  const originalWindow = (globalThis as any).window;
  (globalThis as any).window = {
    localStorage: {
      setItem: () => {
        const err = new Error('The quota has been exceeded');
        err.name = 'QuotaExceededError';
        throw err;
      },
    },
  };

  const success = safeLocalStorageSet('overflow_key', 'large_payload');
  assert.equal(success, false);

  // Restore
  if (originalWindow) {
    (globalThis as any).window = originalWindow;
  } else {
    delete (globalThis as any).window;
  }
});

test('safeLocalStorageSet stores data when quota is available', () => {
  let storedKey = '';
  let storedVal = '';
  const originalWindow = (globalThis as any).window;
  (globalThis as any).window = {
    localStorage: {
      setItem: (k: string, v: string) => {
        storedKey = k;
        storedVal = v;
      },
    },
  };

  const success = safeLocalStorageSet('user_profile_01', '{"name":"Engr. Adeleke"}');
  assert.equal(success, true);
  assert.equal(storedKey, 'user_profile_01');
  assert.equal(storedVal, '{"name":"Engr. Adeleke"}');

  // Restore
  if (originalWindow) {
    (globalThis as any).window = originalWindow;
  } else {
    delete (globalThis as any).window;
  }
});
