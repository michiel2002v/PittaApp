import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/github-client.js', () => ({
  fetchRepoTree: vi.fn(),
  fetchFileContent: vi.fn(),
}));

import { fetchRepoTree, fetchFileContent } from '../src/github-client.js';
import { listSkills } from '../src/registry.js';

const mockFetchRepoTree = vi.mocked(fetchRepoTree);
const mockFetchFileContent = vi.mocked(fetchFileContent);

const FIXTURE_TREE = [
  'skills/prd-to-issues/00-base.md',
  'skills/prd-to-issues/extensions/10-save-as-markdown.md',
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
order: 10
description: Save the PRD as a markdown file.
---

## Extension: Save PRD as Markdown`;

beforeEach(() => {
  vi.clearAllMocks();
  mockFetchRepoTree.mockResolvedValue(FIXTURE_TREE);
  mockFetchFileContent.mockImplementation(async (path: string) => {
    if (path === 'skills/prd-to-issues/00-base.md') return FIXTURE_BASE_PRD;
    if (path === 'skills/grill-me/00-base.md') return FIXTURE_BASE_GRILL;
    if (path.includes('10-save-as-markdown')) return FIXTURE_EXTENSION;
    throw new Error(`Unexpected path: ${path}`);
  });
});

describe('registry: listSkills', () => {
  it('returns all skills from the repo tree', async () => {
    const skills = await listSkills();
    expect(skills).toHaveLength(2);
  });

  it('parses skill name and description from frontmatter', async () => {
    const skills = await listSkills();
    const prd = skills.find((s) => s.name === 'prd-to-issues');
    expect(prd).toBeDefined();
    expect(prd?.description).toBe('Break a PRD into issues using vertical slices.');
  });

  it('attaches extensions to the correct skill', async () => {
    const skills = await listSkills();
    const prd = skills.find((s) => s.name === 'prd-to-issues');
    expect(prd?.extensions).toHaveLength(1);
    expect(prd?.extensions[0].description).toBe('Save the PRD as a markdown file.');
  });

  it('skills with no extensions have empty extensions array', async () => {
    const skills = await listSkills();
    const grill = skills.find((s) => s.name === 'grill-me');
    expect(grill?.extensions).toHaveLength(0);
  });

  it('extensions are sorted by numeric order', async () => {
    mockFetchRepoTree.mockResolvedValue([
      'skills/prd-to-issues/00-base.md',
      'skills/prd-to-issues/extensions/20-second.md',
      'skills/prd-to-issues/extensions/10-first.md',
    ]);
    mockFetchFileContent.mockImplementation(async (path: string) => {
      if (path.includes('00-base')) return FIXTURE_BASE_PRD;
      if (path.includes('10-first')) return `---\nextensionFor: prd-to-issues\norder: 10\ndescription: First.\n---\n# First`;
      if (path.includes('20-second')) return `---\nextensionFor: prd-to-issues\norder: 20\ndescription: Second.\n---\n# Second`;
      throw new Error(`Unexpected: ${path}`);
    });

    const skills = await listSkills();
    const prd = skills.find((s) => s.name === 'prd-to-issues')!;
    expect(prd.extensions[0].description).toBe('First.');
    expect(prd.extensions[1].description).toBe('Second.');
  });
});
