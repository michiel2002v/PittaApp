import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock child_process before importing github-client
vi.mock('child_process', () => ({
  execSync: vi.fn(),
}));

import { execSync } from 'child_process';
import { fetchFileContent, fetchRepoTree } from '../src/github-client.js';

const mockExecSync = vi.mocked(execSync);

// Helper to mock fetch
function mockFetch(body: unknown, status = 200) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    text: () => Promise.resolve(typeof body === 'string' ? body : JSON.stringify(body)),
    json: () => Promise.resolve(body),
  } as Response);
}

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.GITHUB_TOKEN;
});

afterEach(() => {
  delete process.env.GITHUB_TOKEN;
});

describe('github-client: token resolution', () => {
  it('uses token from gh CLI when available', async () => {
    mockExecSync.mockReturnValue('gh-token-123\n' as any);
    mockFetch('file content');

    await fetchFileContent('skills/test/00-base.md');

    const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(fetchCall[1].headers.Authorization).toBe('Bearer gh-token-123');
  });

  it('falls back to GITHUB_TOKEN env var when gh CLI fails', async () => {
    mockExecSync.mockImplementation(() => { throw new Error('gh not found'); });
    process.env.GITHUB_TOKEN = 'env-token-456';
    mockFetch('file content');

    await fetchFileContent('skills/test/00-base.md');

    const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(fetchCall[1].headers.Authorization).toBe('Bearer env-token-456');
  });

  it('throws a clear error when no token is available', async () => {
    mockExecSync.mockImplementation(() => { throw new Error('gh not found'); });

    await expect(fetchFileContent('skills/test/00-base.md')).rejects.toThrow(
      "GitHub auth not found. Run 'gh auth login' or set the GITHUB_TOKEN environment variable."
    );
  });
});

describe('github-client: fetchFileContent', () => {
  beforeEach(() => {
    mockExecSync.mockReturnValue('test-token\n' as any);
  });

  it('constructs the correct URL', async () => {
    mockFetch('# Hello');

    await fetchFileContent('skills/prd-to-issues/00-base.md');

    const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(fetchCall[0]).toContain('skills/prd-to-issues/00-base.md');
    expect(fetchCall[0]).toContain('michiel2002v');
    expect(fetchCall[0]).toContain('Vintecc.Skills');
  });

  it('returns file content as string', async () => {
    mockFetch('# Skill content\nHello world');

    const result = await fetchFileContent('skills/prd-to-issues/00-base.md');
    expect(result).toBe('# Skill content\nHello world');
  });

  it('throws on non-OK response', async () => {
    mockFetch({ message: 'Not Found' }, 404);

    await expect(fetchFileContent('skills/missing/00-base.md')).rejects.toThrow('404');
  });
});

describe('github-client: fetchRepoTree', () => {
  beforeEach(() => {
    mockExecSync.mockReturnValue('test-token\n' as any);
  });

  it('returns only blob paths', async () => {
    mockFetch({
      tree: [
        { path: 'skills/prd-to-issues/00-base.md', type: 'blob' },
        { path: 'skills/prd-to-issues', type: 'tree' },
        { path: 'skills/grill-me/00-base.md', type: 'blob' },
      ],
    });

    const result = await fetchRepoTree();
    expect(result).toEqual([
      'skills/prd-to-issues/00-base.md',
      'skills/grill-me/00-base.md',
    ]);
  });

  it('constructs URL with recursive flag', async () => {
    mockFetch({ tree: [] });

    await fetchRepoTree();

    const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(fetchCall[0]).toContain('recursive=1');
  });
});
