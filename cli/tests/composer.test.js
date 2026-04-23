"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const composer_js_1 = require("../src/composer.js");
(0, vitest_1.describe)('composer', () => {
    (0, vitest_1.it)('returns empty string for empty array', () => {
        (0, vitest_1.expect)((0, composer_js_1.compose)([])).toBe('');
    });
    (0, vitest_1.it)('returns content unchanged for single item', () => {
        (0, vitest_1.expect)((0, composer_js_1.compose)(['# Hello\nworld'])).toBe('# Hello\nworld');
    });
    (0, vitest_1.it)('joins multiple items with separator', () => {
        const result = (0, composer_js_1.compose)(['# Section A', '# Section B']);
        (0, vitest_1.expect)(result).toBe('# Section A\n\n---\n\n# Section B');
    });
    (0, vitest_1.it)('joins three items in order', () => {
        const result = (0, composer_js_1.compose)(['first', 'second', 'third']);
        (0, vitest_1.expect)(result).toBe('first\n\n---\n\nsecond\n\n---\n\nthird');
    });
    (0, vitest_1.it)('trims trailing whitespace from each section', () => {
        const result = (0, composer_js_1.compose)(['hello   \n  ', 'world']);
        (0, vitest_1.expect)(result).toBe('hello\n\n---\n\nworld');
    });
    (0, vitest_1.it)('preserves internal whitespace', () => {
        const content = '# Title\n\nParagraph one.\n\nParagraph two.';
        (0, vitest_1.expect)((0, composer_js_1.compose)([content])).toBe(content);
    });
});
//# sourceMappingURL=composer.test.js.map