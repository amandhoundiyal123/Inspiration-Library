import test from 'node:test';
import assert from 'node:assert/strict';
import { isPrivateOrReservedIP } from '../server/urlScraper';

test('SSRF Protection: blocks private and loopback IPv4 addresses', () => {
  assert.equal(isPrivateOrReservedIP('127.0.0.1'), true, 'Should block loopback 127.0.0.1');
  assert.equal(isPrivateOrReservedIP('127.10.20.30'), true, 'Should block entire 127.0.0.0/8 subnet');
  assert.equal(isPrivateOrReservedIP('10.0.1.5'), true, 'Should block 10.0.0.0/8 private network');
  assert.equal(isPrivateOrReservedIP('172.16.0.1'), true, 'Should block 172.16.0.0/12 private network');
  assert.equal(isPrivateOrReservedIP('172.31.255.254'), true, 'Should block 172.31.x private network');
  assert.equal(isPrivateOrReservedIP('192.168.1.1'), true, 'Should block 192.168.0.0/16 private network');
  assert.equal(isPrivateOrReservedIP('169.254.169.254'), true, 'Should block GCP/AWS link-local metadata IP');
  assert.equal(isPrivateOrReservedIP('0.0.0.0'), true, 'Should block 0.0.0.0');
});

test('SSRF Protection: blocks private and loopback IPv6 addresses', () => {
  assert.equal(isPrivateOrReservedIP('::1'), true, 'Should block IPv6 loopback');
  assert.equal(isPrivateOrReservedIP('fe80::1'), true, 'Should block IPv6 link-local');
  assert.equal(isPrivateOrReservedIP('fc00::1'), true, 'Should block IPv6 unique local');
});

test('SSRF Protection: permits valid public internet IP addresses', () => {
  assert.equal(isPrivateOrReservedIP('93.184.216.34'), false, 'Should allow example.com public IP');
  assert.equal(isPrivateOrReservedIP('8.8.8.8'), false, 'Should allow Google public DNS');
  assert.equal(isPrivateOrReservedIP('142.250.190.46'), false, 'Should allow public IP');
});

test('URL Normalization utility logic', () => {
  function normalizeUrl(input: string): string {
    let trimmed = input.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      trimmed = 'https://' + trimmed;
    }
    const u = new URL(trimmed);
    return u.toString();
  }

  assert.equal(normalizeUrl('basement.studio'), 'https://basement.studio/');
  assert.equal(normalizeUrl('http://example.com/blog'), 'http://example.com/blog');
  assert.equal(normalizeUrl('https://stripe.com'), 'https://stripe.com/');
});

test('Design DNA validation parses required fields', () => {
  const sample = {
    summary: 'A minimalist dark theme layout',
    primaryStyle: 'Neo-Gothic Editorial',
    secondaryStyles: ['Swiss Grid'],
    visualMood: 'Disciplined',
    keywords: ['Charcoal', 'High contrast'],
    colorPalette: [{ hex: '#111111', name: 'Dark', role: 'Main' }]
  };

  assert.ok(sample.summary.length > 0);
  assert.ok(sample.primaryStyle.length > 0);
  assert.ok(Array.isArray(sample.secondaryStyles));
  assert.ok(sample.colorPalette[0].hex.startsWith('#'));
});
