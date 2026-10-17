import Constants from 'expo-constants';
import * as Sentry from '@sentry/react-native';

/**
 * Crash reporting.
 *
 * Off in development and off whenever EXPO_PUBLIC_SENTRY_DSN is missing, so
 * the app runs normally without it. The DSN is a public value and ships in
 * the binary; the auth token that uploads source maps is a build-time EAS
 * secret and must never appear in this repo.
 *
 * Nothing personal is sent: default PII is off, and every event and
 * breadcrumb is passed through a scrubber that replaces player names and
 * the game's words with a placeholder.
 */

const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN ?? '';

export const CRASH_REPORTING_ENABLED = !__DEV__ && DSN.length > 0;

const PLACEHOLDER = '[redacted]';

/**
 * Strings the player could recognise: the names they typed and the secret
 * word in play. Held in memory only, never written to storage by this file.
 */
const secrets = new Set<string>();

/** Called when a game starts, and again when it ends with an empty list. */
export function setSensitiveStrings(values: string[]): void {
  secrets.clear();
  for (const v of values) {
    const trimmed = (v ?? '').trim();
    // Very short strings would redact ordinary words out of a stack trace.
    if (trimmed.length >= 3) secrets.add(trimmed);
  }
}

export function clearSensitiveStrings(): void {
  secrets.clear();
}

function escapeForRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Replaces any registered secret anywhere inside a string. */
export function scrubString(input: string): string {
  if (!input || secrets.size === 0) return input;
  let out = input;
  for (const secret of secrets) {
    out = out.replace(new RegExp(escapeForRegExp(secret), 'gi'), PLACEHOLDER);
  }
  return out;
}

/** Walks an event or breadcrumb and scrubs every string it holds. */
export function scrubDeep<T>(value: T, depth = 0): T {
  if (depth > 8) return value;
  if (typeof value === 'string') return scrubString(value) as unknown as T;
  if (Array.isArray(value)) {
    return value.map(v => scrubDeep(v, depth + 1)) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = scrubDeep(v, depth + 1);
    }
    return out as unknown as T;
  }
  return value;
}

export function initCrashReporting(): void {
  if (!CRASH_REPORTING_ENABLED) return;

  const release = Constants.expoConfig?.version ?? 'unknown';

  Sentry.init({
    dsn: DSN,
    // No IP address, no device identifier, no username.
    sendDefaultPii: false,
    environment: __DEV__ ? 'development' : 'production',
    release: `impostr@${release}`,
    dist: String(
      Constants.expoConfig?.android?.versionCode
      ?? Constants.expoConfig?.ios?.buildNumber
      ?? '1'
    ),
    // Performance tracing is not needed for a local party game.
    tracesSampleRate: 0,
    beforeSend(event) {
      delete event.user;
      delete event.server_name;
      return scrubDeep(event);
    },
    beforeBreadcrumb(breadcrumb) {
      return scrubDeep(breadcrumb);
    },
  });
}

/** No-op when reporting is off, so callers never have to check. */
export function reportError(error: unknown, context?: string): void {
  if (!CRASH_REPORTING_ENABLED) return;
  Sentry.captureException(error, context ? { tags: { context } } : undefined);
}
