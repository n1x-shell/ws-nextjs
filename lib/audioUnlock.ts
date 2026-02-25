/**
 * Shared audio unlock flag.
 * Browser autoplay policy requires a user gesture before unmuted playback.
 * One tap on any player's overlay sets this flag, allowing all subsequent
 * player mounts to autoplay with sound immediately.
 */

let _unlocked = false;

export function isAudioUnlocked(): boolean {
  return _unlocked;
}

export function setAudioUnlocked(): void {
  _unlocked = true;
}
