export function normalizeTags(input: string[]): string[] {
  return Array.from(
    new Set(
      input
        .map(tag => String(tag).toLowerCase().trim())
        .filter(tag => tag.length > 0)
    )
  ).slice(0, 8);
}


