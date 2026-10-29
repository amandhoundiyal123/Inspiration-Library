import * as cheerio from 'cheerio';
import dns from 'node:dns/promises';
import net from 'node:net';

export interface ScrapedMetadata {
  title?: string;
  description?: string;
  previewImage?: string;
  sourceDomain: string;
  canonicalUrl: string;
  favicon?: string;
}

/**
 * Validates whether an IP address is a private, loopback, or cloud-internal address.
 * Prevents Server-Side Request Forgery (SSRF).
 */
export function isPrivateOrReservedIP(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    const [a, b] = parts;

    // Loopback (127.0.0.0/8)
    if (a === 127) return true;
    // Private Network 10.0.0.0/8
    if (a === 10) return true;
    // Private Network 172.16.0.0/12
    if (a === 172 && b >= 16 && b <= 31) return true;
    // Private Network 192.168.0.0/16
    if (a === 192 && b === 168) return true;
    // Link-local / Cloud metadata (169.254.0.0/16)
    if (a === 169 && b === 254) return true;
    // Broadcast / Zero
    if (a === 0 || a === 255) return true;

    return false;
  }

  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    // IPv6 loopback
    if (lower === '::1' || lower === '0:0:0:0:0:0:0:1') return true;
    // IPv6 link-local (fe80::)
    if (lower.startsWith('fe80:')) return true;
    // IPv6 unique local (fc00:: / fd00::)
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true;
    return false;
  }

  return true;
}

/**
 * Safely fetches and parses metadata from an external URL with strict SSRF protection.
 */
export async function scrapeUrlMetadata(inputUrl: string): Promise<ScrapedMetadata> {
  let parsedUrl: URL;
  try {
    let urlToParse = inputUrl.trim();
    if (!urlToParse.startsWith('http://') && !urlToParse.startsWith('https://')) {
      urlToParse = 'https://' + urlToParse;
    }
    parsedUrl = new URL(urlToParse);
  } catch {
    throw new Error('Invalid URL format');
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw new Error('Only HTTP and HTTPS protocols are supported');
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // Block localhost and standard internal names
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.local') ||
    hostname === 'metadata.google.internal' ||
    hostname === '169.254.169.254'
  ) {
    throw new Error('Access to internal or private hosts is prohibited');
  }

  // Resolve DNS to verify IP is not internal/private
  try {
    const addresses = await dns.lookup(hostname, { all: true });
    for (const addr of addresses) {
      if (isPrivateOrReservedIP(addr.address)) {
        throw new Error('Target resolves to a restricted private or internal IP address');
      }
    }
  } catch (err: any) {
    if (err.message?.includes('restricted')) throw err;
    // If DNS lookup fails, return basic domain metadata
    return {
      sourceDomain: hostname,
      canonicalUrl: parsedUrl.toString()
    };
  }

  // Fetch with safe timeouts (6 seconds) and size limits (max 2MB)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 DesignVault/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      },
      redirect: 'follow'
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        sourceDomain: hostname,
        canonicalUrl: parsedUrl.toString()
      };
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('xml')) {
      return {
        sourceDomain: hostname,
        canonicalUrl: parsedUrl.toString()
      };
    }

    // Read max 2MB of HTML text
    const text = await response.text();
    const truncatedHtml = text.slice(0, 2 * 1024 * 1024);

    const $ = cheerio.load(truncatedHtml);

    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text().trim() ||
      undefined;

    const description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      undefined;

    let previewImage =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      undefined;

    if (previewImage && !previewImage.startsWith('http://') && !previewImage.startsWith('https://')) {
      try {
        previewImage = new URL(previewImage, parsedUrl.origin).toString();
      } catch {
        previewImage = undefined;
      }
    }

    let favicon = $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href');
    if (favicon && !favicon.startsWith('http')) {
      try {
        favicon = new URL(favicon, parsedUrl.origin).toString();
      } catch {
        favicon = undefined;
      }
    }

    return {
      title: title ? title.slice(0, 200) : undefined,
      description: description ? description.slice(0, 500) : undefined,
      previewImage,
      sourceDomain: hostname,
      canonicalUrl: parsedUrl.toString(),
      favicon
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    // If fetch failed or timed out, gracefully return domain
    return {
      sourceDomain: hostname,
      canonicalUrl: parsedUrl.toString()
    };
  }
}
