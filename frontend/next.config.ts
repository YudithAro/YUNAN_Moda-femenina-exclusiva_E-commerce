import type { NextConfig } from "next";

const remotePatterns: NonNullable<NonNullable<NextConfig['images']>['remotePatterns']> = [
  { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
];
for (const [value, pathname] of [
  [process.env.NEXT_PUBLIC_SUPABASE_URL, '/storage/v1/object/public/**'],
  [process.env.NEXT_PUBLIC_API_URL, '/uploads/**'],
] as const) {
  if (!value) continue;
  const url = new URL(value);
  remotePatterns.push({ protocol: url.protocol === 'http:' ? 'http' : 'https', hostname: url.hostname, port: url.port, pathname });
}

const nextConfig: NextConfig = {
  images: { remotePatterns },
  poweredByHeader: false,
  async headers() {
    return [{ source: '/(.*)', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'DENY' },
    ] }];
  },
};

export default nextConfig;
