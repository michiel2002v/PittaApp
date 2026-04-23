export function compose(sections: string[]): string {
  if (sections.length === 0) return '';
  return sections
    .map((s) => s.trimEnd())
    .join('\n\n---\n\n');
}
