// Module-level key store.
// Persists across warm serverless instances on the same container.
// Keys are 16-char hex strings generated when daemonState hits 'exposed'.

const issuedF010Keys = new Set<string>();

export function registerF010Key(key: string): void {
  issuedF010Keys.add(key.toLowerCase().trim());
}

export function validateF010Key(key: string): boolean {
  return issuedF010Keys.has(key.toLowerCase().trim());
}
