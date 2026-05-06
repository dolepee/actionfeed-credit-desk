import { keccak256, toUtf8Bytes } from "ethers";

export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

export function hashCanonical(value: unknown): `0x${string}` {
  return keccak256(toUtf8Bytes(canonicalJson(value))) as `0x${string}`;
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, inner]) => [key, sortValue(inner)]),
    );
  }

  return value;
}

