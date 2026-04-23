import { describe, it, expect } from 'vitest';
import { compose } from '../src/composer.js';

describe('composer', () => {
  it('returns empty string for empty array', () => {
    expect(compose([])).toBe('');
  });

  it('returns content unchanged for single item', () => {
    expect(compose(['# Hello\nworld'])).toBe('# Hello\nworld');
  });

  it('joins multiple items with separator', () => {
    const result = compose(['# Section A', '# Section B']);
    expect(result).toBe('# Section A\n\n---\n\n# Section B');
  });

  it('joins three items in order', () => {
    const result = compose(['first', 'second', 'third']);
    expect(result).toBe('first\n\n---\n\nsecond\n\n---\n\nthird');
  });

  it('trims trailing whitespace from each section', () => {
    const result = compose(['hello   \n  ', 'world']);
    expect(result).toBe('hello\n\n---\n\nworld');
  });

  it('preserves internal whitespace', () => {
    const content = '# Title\n\nParagraph one.\n\nParagraph two.';
    expect(compose([content])).toBe(content);
  });
});
