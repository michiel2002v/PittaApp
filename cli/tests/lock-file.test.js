"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const fs_1 = require("fs");
const path_1 = require("path");
const os_1 = require("os");
const lock_file_js_1 = require("../src/lock-file.js");
let tmpDir;
(0, vitest_1.beforeEach)(() => {
    tmpDir = (0, fs_1.mkdtempSync)((0, path_1.join)((0, os_1.tmpdir)(), 'vintecc-skills-test-'));
});
(0, vitest_1.afterEach)(() => {
    (0, fs_1.rmSync)(tmpDir, { recursive: true, force: true });
});
(0, vitest_1.describe)('lock-file', () => {
    (0, vitest_1.it)('returns empty state when file does not exist', () => {
        const result = (0, lock_file_js_1.readLockFile)(tmpDir);
        (0, vitest_1.expect)(result.version).toBe(1);
        (0, vitest_1.expect)(result.skills).toEqual({});
    });
    (0, vitest_1.it)('round-trips read/write without data loss', () => {
        const lockFile = {
            version: 1,
            skills: {
                'prd-to-issues': {
                    platform: 'vscode-visualstudio',
                    scope: 'project',
                    selectedExtensions: ['skills/prd-to-issues/extensions/team-example/10-save-as-markdown.md'],
                    installedAt: '2026-01-01T00:00:00.000Z',
                    updatedAt: '2026-01-01T00:00:00.000Z',
                    sourceRef: 'main',
                },
            },
        };
        (0, lock_file_js_1.writeLockFile)(tmpDir, lockFile);
        const result = (0, lock_file_js_1.readLockFile)(tmpDir);
        (0, vitest_1.expect)(result).toEqual(lockFile);
    });
    (0, vitest_1.it)('upserts a new skill entry', () => {
        (0, lock_file_js_1.upsertLockEntry)(tmpDir, 'grill-me', {
            platform: 'claudecode',
            scope: 'user',
            selectedExtensions: [],
            sourceRef: 'main',
        });
        const entry = (0, lock_file_js_1.getLockEntry)(tmpDir, 'grill-me');
        (0, vitest_1.expect)(entry).toBeDefined();
        (0, vitest_1.expect)(entry?.platform).toBe('claudecode');
        (0, vitest_1.expect)(entry?.scope).toBe('user');
        (0, vitest_1.expect)(entry?.installedAt).toBeDefined();
        (0, vitest_1.expect)(entry?.updatedAt).toBeDefined();
    });
    (0, vitest_1.it)('updating an entry preserves installedAt', () => {
        (0, lock_file_js_1.upsertLockEntry)(tmpDir, 'prd-to-issues', {
            platform: 'vscode-visualstudio',
            scope: 'project',
            selectedExtensions: [],
            sourceRef: 'main',
        });
        const first = (0, lock_file_js_1.getLockEntry)(tmpDir, 'prd-to-issues');
        (0, lock_file_js_1.upsertLockEntry)(tmpDir, 'prd-to-issues', {
            platform: 'vscode-visualstudio',
            scope: 'project',
            selectedExtensions: ['skills/prd-to-issues/extensions/team-example/10-save-as-markdown.md'],
            sourceRef: 'main',
        });
        const second = (0, lock_file_js_1.getLockEntry)(tmpDir, 'prd-to-issues');
        (0, vitest_1.expect)(second?.installedAt).toBe(first?.installedAt);
        (0, vitest_1.expect)(second?.selectedExtensions).toHaveLength(1);
    });
    (0, vitest_1.it)('updating one skill does not affect other skills', () => {
        (0, lock_file_js_1.upsertLockEntry)(tmpDir, 'grill-me', {
            platform: 'claudecode',
            scope: 'user',
            selectedExtensions: [],
            sourceRef: 'main',
        });
        (0, lock_file_js_1.upsertLockEntry)(tmpDir, 'prd-to-issues', {
            platform: 'vscode-visualstudio',
            scope: 'project',
            selectedExtensions: [],
            sourceRef: 'main',
        });
        (0, lock_file_js_1.upsertLockEntry)(tmpDir, 'grill-me', {
            platform: 'vscode-visualstudio',
            scope: 'project',
            selectedExtensions: [],
            sourceRef: 'main',
        });
        const prdEntry = (0, lock_file_js_1.getLockEntry)(tmpDir, 'prd-to-issues');
        (0, vitest_1.expect)(prdEntry?.platform).toBe('vscode-visualstudio');
        (0, vitest_1.expect)(prdEntry?.scope).toBe('project');
    });
    (0, vitest_1.it)('returns undefined for unknown skill', () => {
        const entry = (0, lock_file_js_1.getLockEntry)(tmpDir, 'nonexistent');
        (0, vitest_1.expect)(entry).toBeUndefined();
    });
});
//# sourceMappingURL=lock-file.test.js.map