/**
 * Lets Node run the app's TypeScript directly.
 *
 * App source uses extensionless relative imports because that is what Metro
 * expects. Node's ESM resolver needs the extension, so this hook retries a
 * failed relative import as `.ts`, then `.tsx`, then `/index.ts`. It exists
 * only for `npm test` and `npm run check-words`; nothing in the app bundle
 * goes near it.
 */
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

const CANDIDATES = ['.ts', '.tsx', '/index.ts', '/index.tsx'];

export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    if (!specifier.startsWith('.') && !specifier.startsWith('/')) throw error;
    for (const suffix of CANDIDATES) {
      try {
        return await nextResolve(specifier + suffix, context);
      } catch { /* try the next one */ }
    }
    throw error;
  }
}

register(pathToFileURL(import.meta.filename));
