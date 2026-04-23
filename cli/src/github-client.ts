import { execSync } from 'child_process';

const REPO_OWNER = 'michiel2002v';
const REPO_NAME = 'Vintecc.Skills';
const REPO_REF = 'main';

function resolveToken(): string {
  // Try gh CLI first
  try {
    const token = execSync('gh auth token', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
    if (token) return token;
  } catch {
    // gh CLI not available or not authenticated
  }

  // Fallback to environment variable
  const envToken = process.env.GITHUB_TOKEN;
  if (envToken) return envToken;

  throw new Error(
    "GitHub auth not found. Run 'gh auth login' or set the GITHUB_TOKEN environment variable."
  );
}

export async function fetchFileContent(path: string): Promise<string> {
  const token = resolveToken();
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}?ref=${REPO_REF}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.raw+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

export async function fetchRepoTree(): Promise<string[]> {
  const token = resolveToken();
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/trees/${REPO_REF}?recursive=1`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch repo tree: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as { tree: Array<{ path: string; type: string }> };
  return data.tree.filter((item) => item.type === 'blob').map((item) => item.path);
}
