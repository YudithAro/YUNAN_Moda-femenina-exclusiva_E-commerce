import { describe, expect, it } from 'vitest';
import { corsOrigins, productionFrontend } from './deployment.config.js';

describe('Production CORS configuration', () => {
  it('keeps local development available', () => {
    expect(corsOrigins({})).toEqual(['http://localhost:4000']);
  });

  it('supports the existing Render/Vercel deployment with an exact origin', () => {
    expect(corsOrigins({ NODE_ENV: 'production', RENDER: 'true', RENDER_EXTERNAL_HOSTNAME: 'yunan-moda-femenina-exclusiva-e-commerce.onrender.com' })).toEqual([productionFrontend]);
  });

  it('requires explicit configuration for other production services', () => {
    expect(() => corsOrigins({ NODE_ENV: 'production' })).toThrow('CORS_ORIGINS');
    expect(() => corsOrigins({ RENDER: 'true', RENDER_EXTERNAL_HOSTNAME: 'another.onrender.com' })).toThrow('CORS_ORIGINS');
  });

  it('honors explicit origins, normalizes slash and removes duplicates', () => {
    expect(corsOrigins({ NODE_ENV: 'production', CORS_ORIGINS: 'https://shop.example.com/, https://shop.example.com, https://preview.example.com' })).toEqual(['https://shop.example.com', 'https://preview.example.com']);
  });

  it.each(['*', 'https://*.vercel.app', 'https://shop.example.com/path', 'https://shop.example.com?key=private', 'https://user:secret@shop.example.com', 'file:///shop'])('rejects invalid origin %s', value => {
    expect(() => corsOrigins({ CORS_ORIGINS: value })).toThrow('CORS_ORIGINS');
  });
});
