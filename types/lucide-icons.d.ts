/**
 * Per-icon deep imports.
 *
 * Importing from 'lucide-react-native' pulls the whole barrel, and with it
 * all 1,621 icons: 1.3 MB, a quarter of the Android bundle, for the 18 we
 * use. Importing each icon's own file keeps only that icon, but lucide
 * ships no .d.ts beside those files, so this declares their shape.
 *
 * Every icon module default-exports a LucideIcon, which is what the barrel
 * types say too.
 */
declare module 'lucide-react-native/dist/esm/icons/*' {
  import type { LucideIcon } from 'lucide-react-native';
  const icon: LucideIcon;
  export default icon;
}
