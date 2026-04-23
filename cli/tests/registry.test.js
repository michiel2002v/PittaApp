"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
vitest_1.vi.mock('../src/github-client.js', () => ({
    fetchRepoTree: vitest_1.vi.fn(),
    fetchFileContent: vitest_1.vi.fn(),
}));
const github_client_js_1 = require("../src/github-client.js");
const registry_js_1 = require("../src/registry.js");
const mockFetchRepoTree = vitest_1.vi.mocked(github_client_js_1.fetchRepoTree);
const mockFetchFileContent = vitest_1.vi.mocked(github_client_js_1.fetchFileContent);
const FIXTURE_TREE = [
    'skills/prd-to-issues/00-base.md',
    'skills/prd-to-issues/extensions/team-example/10-save-as-markdown.md',
    'skills/grill-me/00-base.md',
    'skills/CONTRIBUTING.md',
    'cli/src/index.ts',
];
const FIXTURE_BASE_PRD = `---
name: prd-to-issues
description: Break a PRD into issues using vertical slices.
---

# PRD to Issues
Content here.`;
const FIXTURE_BASE_GRILL = `---
name: grill-me
description: Interview the user relentlessly.
---

# Grill Me
Content here.`;
const FIXTURE_EXTENSION = `---
extensionFor: prd-to-issues
team: team-example
order: 10
description: Save the PRD as a markdown file.
---

## Extension: Save PRD as Markdown`;
(0, vitest_1.beforeEach)(() => {
    vitest_1.vi.clearAllMocks();
    mockFetchRepoTree.mockResolvedValue(FIXTURE_TREE);
    mockFetchFileContent.mockImplementation(async (path) => {
        if (path === 'skills/prd-to-issues/00-base.md')
            return FIXTURE_BASE_PRD;
        if (path === 'skills/grill-me/00-base.md')
            return FIXTURE_BASE_GRILL;
        if (path.includes('10-save-as-markdown'))
            return FIXTURE_EXTENSION;
        throw new Error(`Unexpected path: ${path}`);
    });
});
(0, vitest_1.describe)('registry: listSkills', () => {
    (0, vitest_1.it)('returns all skills from the repo tree', async () => {
        const skills = await (0, registry_js_1.listSkills)();
        (0, vitest_1.expect)(skills).toHaveLength(2);
    });
    (0, vitest_1.it)('parses skill name and description from frontmatter', async () => {
        const skills = await (0, registry_js_1.listSkills)();
        const prd = skills.find((s) => s.name === 'prd-to-issues');
        (0, vitest_1.expect)(prd).toBeDefined();
        (0, vitest_1.expect)(prd?.description).toBe('Break a PRD into issues using vertical slices.');
    });
    (0, vitest_1.it)('attaches extensions to the correct skill', async () => {
        const skills = await (0, registry_js_1.listSkills)();
        const prd = skills.find((s) => s.name === 'prd-to-issues');
        (0, vitest_1.expect)(prd?.extensions).toHaveLength(1);
        (0, vitest_1.expect)(prd?.extensions[0].team).toBe('team-example');
        (0, vitest_1.expect)(prd?.extensions[0].description).toBe('Save the PRD as a markdown file.');
    });
    (0, vitest_1.it)('skills with no extensions have empty extensions array', async () => {
        const skills = await (0, registry_js_1.listSkills)();
        const grill = skills.find((s) => s.name === 'grill-me');
        (0, vitest_1.expect)(grill?.extensions).toHaveLength(0);
    });
    (0, vitest_1.it)('extensions are sorted by numeric order', async () => {
        mockFetchRepoTree.mockResolvedValue([
            'skills/prd-to-issues/00-base.md',
            'skills/prd-to-issues/extensions/team-b/20-second.md',
            'skills/prd-to-issues/extensions/team-a/10-first.md',
        ]);
        mockFetchFileContent.mockImplementation(async (path) => {
            if (path.includes('00-base'))
                return FIXTURE_BASE_PRD;
            if (path.includes('10-first'))
                return `---\nextensionFor: prd-to-issues\nteam: team-a\norder: 10\ndescription: First.\n---\n# First`;
            if (path.includes('20-second'))
                return `---\nextensionFor: prd-to-issues\nteam: team-b\norder: 20\ndescription: Second.\n---\n# Second`;
            throw new Error(`Unexpected: ${path}`);
        });
        const skills = await (0, registry_js_1.listSkills)();
        const prd = skills.find((s) => s.name === 'prd-to-issues');
        (0, vitest_1.expect)(prd.extensions[0].team).toBe('team-a');
        (0, vitest_1.expect)(prd.extensions[1].team).toBe('team-b');
    });
});
//# sourceMappingURL=registry.test.js.map