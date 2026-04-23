import { isValidSeed, generateSeed } from "./seed";

export function resolveSeed(rawSeed: string | null): string {
  if (rawSeed !== null && isValidSeed(rawSeed)) {
    return rawSeed;
  }
  return generateSeed();
}
