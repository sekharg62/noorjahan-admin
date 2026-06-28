function randomSegment(length = 8): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().replace(/-/g, '').slice(0, length).toLowerCase();
  }

  return Math.random()
    .toString(36)
    .slice(2, 2 + length)
    .toLowerCase();
}

export function generateUrl(): string {
  const segment = randomSegment(10);
  const suffix = Date.now().toString(36).slice(-4);

  return `${segment}-${suffix}`;
}

function getFileExtension(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
  return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension) ? extension : 'jpg';
}

export function generateBannerImageUrl(baseUrl: string, filename?: string): string {
  const extension = filename ? getFileExtension(filename) : 'jpg';
  return `${baseUrl.replace(/\/$/, '')}/uploads/banners/${generateUrl()}.${extension}`;
}

/** Placeholder until a real image upload service is connected. */
export async function uploadBannerImage(file: File, baseUrl: string): Promise<string> {
  await Promise.resolve();
  return generateBannerImageUrl(baseUrl, file.name);
}
