"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
// Mock child_process before importing github-client
vitest_1.vi.mock('child_process', () => ({
    execSync: vitest_1.vi.fn(),
}));
const child_process_1 = require("child_process");
const github_client_js_1 = require("../src/github-client.js");
const mockExecSync = vitest_1.vi.mocked(child_process_1.execSync);
// Helper to mock fetch
function mockFetch(body, status = 200) {
    global.fetch = vitest_1.vi.fn().mockResolvedValue({
        ok: status >= 200 && status < 300,
        status,
        statusText: status === 200 ? 'OK' : 'Error',
        text: () => Promise.resolve(typeof body === 'string' ? body : JSON.stringify(body)),
        json: () => Promise.resolve(body),
    });
}
(0, vitest_1.beforeEach)(() => {
    vitest_1.vi.clearAllMocks();
    delete process.env.GITHUB_TOKEN;
});
(0, vitest_1.afterEach)(() => {
    delete process.env.GITHUB_TOKEN;
});
(0, vitest_1.describe)('github-client: token resolution', () => {
    (0, vitest_1.it)('uses token from gh CLI when available', async () => {
        mockExecSync.mockReturnValue('gh-token-123\n');
        mockFetch('file content');
        await (0, github_client_js_1.fetchFileContent)('skills/test/00-base.md');
        const fetchCall = global.fetch.mock.calls[0];
        (0, vitest_1.expect)(fetchCall[1].headers.Authorization).toBe('Bearer gh-token-123');
    });
    (0, vitest_1.it)('falls back to GITHUB_TOKEN env var when gh CLI fails', async () => {
        mockExecSync.mockImplementation(() => { throw new Error('gh not found'); });
        process.env.GITHUB_TOKEN = 'env-token-456';
        mockFetch('file content');
        await (0, github_client_js_1.fetchFileContent)('skills/test/00-base.md');
        const fetchCall = global.fetch.mock.calls[0];
        (0, vitest_1.expect)(fetchCall[1].headers.Authorization).toBe('Bearer env-token-456');
    });
    (0, vitest_1.it)('throws a clear error when no token is available', async () => {
        mockExecSync.mockImplementation(() => { throw new Error('gh not found'); });
        await (0, vitest_1.expect)((0, github_client_js_1.fetchFileContent)('skills/test/00-base.md')).rejects.toThrow("GitHub auth not found. Run 'gh auth login' or set the GITHUB_TOKEN environment variable.");
    });
});
(0, vitest_1.describe)('github-client: fetchFileContent', () => {
    (0, vitest_1.beforeEach)(() => {
        mockExecSync.mockReturnValue('test-token\n');
    });
    (0, vitest_1.it)('constructs the correct URL', async () => {
        mockFetch('# Hello');
        await (0, github_client_js_1.fetchFileContent)('skills/prd-to-issues/00-base.md');
        const fetchCall = global.fetch.mock.calls[0];
        (0, vitest_1.expect)(fetchCall[0]).toContain('skills/prd-to-issues/00-base.md');
        (0, vitest_1.expect)(fetchCall[0]).toContain('michiel2002v');
        (0, vitest_1.expect)(fetchCall[0]).toContain('Vintecc.Skills');
    });
    (0, vitest_1.it)('returns file content as string', async () => {
        mockFetch('# Skill content\nHello world');
        const result = await (0, github_client_js_1.fetchFileContent)('skills/prd-to-issues/00-base.md');
        (0, vitest_1.expect)(result).toBe('# Skill content\nHello world');
    });
    (0, vitest_1.it)('throws on non-OK response', async () => {
        mockFetch({ message: 'Not Found' }, 404);
        await (0, vitest_1.expect)((0, github_client_js_1.fetchFileContent)('skills/missing/00-base.md')).rejects.toThrow('404');
    });
});
(0, vitest_1.describe)('github-client: fetchRepoTree', () => {
    (0, vitest_1.beforeEach)(() => {
        mockExecSync.mockReturnValue('test-token\n');
    });
    (0, vitest_1.it)('returns only blob paths', async () => {
        mockFetch({
            tree: [
                { path: 'skills/prd-to-issues/00-base.md', type: 'blob' },
                { path: 'skills/prd-to-issues', type: 'tree' },
                { path: 'skills/grill-me/00-base.md', type: 'blob' },
            ],
        });
        const result = await (0, github_client_js_1.fetchRepoTree)();
        (0, vitest_1.expect)(result).toEqual([
            'skills/prd-to-issues/00-base.md',
            'skills/grill-me/00-base.md',
        ]);
    });
    (0, vitest_1.it)('constructs URL with recursive flag', async () => {
        mockFetch({ tree: [] });
        await (0, github_client_js_1.fetchRepoTree)();
        const fetchCall = global.fetch.mock.calls[0];
        (0, vitest_1.expect)(fetchCall[0]).toContain('recursive=1');
    });
});
//# sourceMappingURL=github-client.test.js.map