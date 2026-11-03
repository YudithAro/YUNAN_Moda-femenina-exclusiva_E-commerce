const productionBackend = 'yunan-moda-femenina-exclusiva-e-commerce.onrender.com';
export const productionFrontend = 'https://yunan-moda-femenina-exclusiva-e-com.vercel.app';

export function corsOrigins(env: NodeJS.ProcessEnv = process.env): string[] {
  // Existing Render service keeps its exact Vercel origin without a new secret.
  // Other deployments must configure their own production origins explicitly.
  const existingRender = env.RENDER === 'true' && env.RENDER_EXTERNAL_HOSTNAME === productionBackend;
  const fallback = existingRender ? productionFrontend
    : env.NODE_ENV === 'production' || env.RENDER === 'true' ? '' : 'http://localhost:4000';
  const values = (env.CORS_ORIGINS || fallback).split(',').map(value => value.trim()).filter(Boolean);
  if (!values.length) throw new Error('Configura CORS_ORIGINS con el dominio del frontend.');
  return [...new Set(values.map(value => {
    try {
      const url = new URL(value);
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.hostname.includes('*')
        || url.pathname !== '/' || url.search || url.hash) throw new Error();
      return url.origin;
    } catch { throw new Error('CORS_ORIGINS debe contener orígenes HTTP o HTTPS exactos, sin rutas ni comodines.'); }
  }))];
}
