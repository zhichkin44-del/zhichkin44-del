// Rewrites the "Recent work" block of README.md from the GitHub API: the 6 most recently updated public repositories.
// No dependencies. Runs weekly in GitHub Actions; GITHUB_TOKEN is optional (raises the rate limit).
import { readFileSync, writeFileSync } from 'node:fs';

const user = process.env.PROFILE_USER ?? 'zhichkin44-del';
const headers = { 'User-Agent': 'profile-readme', Accept: 'application/vnd.github+json' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const res = await fetch(`https://api.github.com/users/${user}/repos?type=owner&sort=pushed&per_page=30`, { headers });
if (!res.ok) throw new Error(`GitHub API ${res.status}`);
const repos = (await res.json())
  .filter((r) => !r.fork && !r.private && !r.archived && r.name !== user && !r.name.endsWith('.github.io') && r.description)
  .slice(0, 6);

const day = (s) => s.slice(0, 10);
const lines = repos.map((r) => `- [${r.name}](${r.html_url}): ${r.description} <sub>updated ${day(r.pushed_at)}</sub>`);
const block = `<!-- recent starts -->\n${lines.join('\n')}\n<!-- recent ends -->`;

const md = readFileSync('README.md', 'utf8');
const next = md.replace(/<!-- recent starts -->[\s\S]*<!-- recent ends -->/, block);
if (next !== md) { writeFileSync('README.md', next); console.log('updated'); } else console.log('no change');
