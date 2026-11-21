// Rewrites the "Featured projects" block of README.md: a fixed list of flagship repositories,
// with their current descriptions from the GitHub API (so the profile never shows a stale description).
// No dependencies. Runs weekly in GitHub Actions; GITHUB_TOKEN is optional (raises the rate limit).
import { readFileSync, writeFileSync } from 'node:fs';

const user = process.env.PROFILE_USER ?? 'zhichkin44-del';
const FEATURED = ['agentprism', 'leo-claude-plugin', 'Zokul', 'Video-Studio'];
const headers = { 'User-Agent': 'profile-readme', Accept: 'application/vnd.github+json' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const lines = [];
for (const name of FEATURED) {
  const res = await fetch(`https://api.github.com/repos/${user}/${name}`, { headers });
  if (!res.ok) throw new Error(`GitHub API ${res.status} for ${name}`);
  const r = await res.json();
  lines.push(`- **[${r.name}](${r.html_url})**: ${r.description ?? ''}`);
}
const block = `<!-- recent starts -->\n${lines.join('\n')}\n<!-- recent ends -->`;

const md = readFileSync('README.md', 'utf8');
const next = md.replace(/<!-- recent starts -->[\s\S]*<!-- recent ends -->/, block);
if (next !== md) { writeFileSync('README.md', next); console.log('updated'); } else console.log('no change');
