import { readFile, writeFile } from 'node:fs/promises';

const owner = 'b-1-o';
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const featuredProjects = JSON.parse(await readFile('src/projects.featured.json', 'utf8'));
const featuredNames = new Set(featuredProjects.map(project => project.repoName.toLowerCase()));
const excludedRepos = new Set(['b-1-o', 'portfolio', 'Portfolio']);
const displayNames = { Bio: 'Bio', AI: 'AI' };

async function github(path) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'b-1-o-portfolio-sync',
    },
  });
  if (!response.ok) throw new Error(`GitHub API ${response.status}: ${path}`);
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

const repos = await github(`/users/${owner}/repos?per_page=100&type=owner&sort=updated`);
const publicRepos = repos.filter(repo =>
  !repo.private && !repo.archived && !repo.fork && !excludedRepos.has(repo.name)
);
const extras = [];

for (const repo of publicRepos) {
  if (featuredNames.has(repo.name.toLowerCase())) continue;
  let site = repo.homepage || null;
  if (!site && repo.has_pages) {
    try {
      const pages = await github(`/repos/${owner}/${repo.name}/pages`);
      site = pages.html_url || (pages.url ? `https://${owner}.github.io/${repo.name}/` : null);
    } catch {
      // GitHub Pages metadata can be unavailable while the repository is valid.
    }
  }
  if (!site && repo.has_pages) site = `https://${owner}.github.io/${repo.name}/`;
  const name = displayNames[repo.name] || repo.name;
  const topics = Array.isArray(repo.topics) ? repo.topics.slice(0, 5) : [];
  const stack = [repo.language, ...topics].filter(Boolean).filter((value, index, values) => values.indexOf(value) === index);
  extras.push({
    name,
    icon: iconFor(repo.name),
    kind: 'GITHUB · ' + (repo.language ? repo.language.toUpperCase() : 'PROJECT'),
    blurb: repo.description?.trim() || `${name} — public GitHub project.`,
    detail: `Public GitHub repository · ${repo.default_branch || 'main'} branch · updated ${new Date(repo.updated_at).toLocaleDateString('en-US')}.`,
    stack,
    repo: repo.html_url,
    site,
    updatedAt: repo.updated_at,
  });
}

extras.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
const featured = featuredProjects.map(({ repoName, ...project }) => project);
const projects = [...featured, ...extras.slice(0, 18)].map((project, index) => {
  const { updatedAt, ...cleanProject } = project;
  return { ...cleanProject, id: String(index + 1).padStart(2, '0') };
});

await writeFile('src/projects.auto.json', `${JSON.stringify(projects, null, 2)}\n`, 'utf8');
console.log(`Synced ${featured.length} featured projects and ${projects.length - featured.length} additional public repositories.`);
