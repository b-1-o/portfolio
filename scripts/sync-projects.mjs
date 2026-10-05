import { writeFile } from 'node:fs/promises';

const owner = 'b-1-o';
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

// Meta / self-referential repos that should never appear in the portfolio grid.
const excludedRepos = new Set([
  'b-1-o',
  'portfolio',
  'myUI',
  'Portfolio',
]);

// Display-name overrides (repo name on GitHub stays as-is).
const displayNames = {
  Bio: 'Bio',
  AI: 'AI',
};

async function github(path) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'b-1-o-portfolio-sync',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}: ${path}`);
  }

  return response.json();
}

const iconFor = (name) => {
  const value = name.toLowerCase();
  if (value.includes('music') || value === 'b1api') return 'music';
  if (value.includes('biogram') || value.includes('nothing')) return 'phone';
  if (value.includes('biohub') || value === 'bio') return 'linux';
  if (value.includes('heaven')) return 'terminal';
  if (value.includes('barber')) return 'scissors';
  if (value.includes('build')) return 'build';
  if (value.includes('agent')) return 'agent';
  if (value.includes('sleep') || value === 's1eep') return 'sleep';
  if (value.includes('forest')) return 'forest';
  if (value.includes('fog')) return 'fog';
  if (value.includes('coffee')) return 'brand';
  if (value === 'ai' || value.includes('ai')) return 'agent';
  if (value.includes('ascii')) return 'terminal';
  return 'web';
};

const languageLabel = (language) =>
  language ? `GITHUB · ${language.toUpperCase()}` : 'GITHUB · PROJECT';

const repos = await github(`/users/${owner}/repos?per_page=100&type=owner&sort=updated`);
const publicRepos = repos.filter(
  (repo) =>
    !repo.private &&
    !repo.archived &&
    !repo.fork &&
    !excludedRepos.has(repo.name)
);

const projects = [];

for (const repo of publicRepos) {
  let site = repo.homepage || null;

  if (!site && repo.has_pages) {
    try {
      const pages = await github(`/repos/${owner}/${repo.name}/pages`);
      site =
        pages.html_url ||
        (pages.url ? `https://${owner}.github.io/${repo.name}/` : null);
    } catch {
      // Pages endpoint can be unavailable while the repository is still valid.
    }
  }

  if (!site && repo.has_pages) {
    site = `https://${owner}.github.io/${repo.name}/`;
  }

  const displayName = displayNames[repo.name] || repo.name;
  const description =
    repo.description?.trim() || `${displayName} — public GitHub project.`;
  const topics = Array.isArray(repo.topics) ? repo.topics.slice(0, 5) : [];
  const stack = [repo.language, ...topics]
    .filter(Boolean)
    .filter((value, index, values) => values.indexOf(value) === index);

  projects.push({
    id: String(projects.length + 1).padStart(2, '0'),
    name: displayName,
    icon: iconFor(repo.name),
    kind: languageLabel(repo.language),
    blurb: description,
    detail: `Public GitHub repository · ${repo.default_branch} branch · updated ${new Date(repo.updated_at).toLocaleDateString('en-US')}.`,
    stack,
    repo: repo.html_url,
    site,
    updatedAt: repo.updated_at,
  });
}

projects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
projects.forEach((project, index) => {
  project.id = String(index + 1).padStart(2, '0');
  delete project.updatedAt;
});

await writeFile('src/projects.auto.json', `${JSON.stringify(projects, null, 2)}\n`, 'utf8');
console.log(`Synced ${projects.length} public GitHub repositories.`);
