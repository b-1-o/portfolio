const OWNER = 'b-1-o';
const EXCLUDED = new Set(['b-1-o', 'portfolio', 'myUI', 'Portfolio']);
const DISPLAY_NAMES = { Bio: 'Bio', AI: 'AI' };

const iconFor = (repo) => {
  const topics = Array.isArray(repo.topics) ? repo.topics : [];
  const h = [repo.name, repo.description, repo.language, ...topics].filter(Boolean).join(' ').toLowerCase();
  const n = repo.name.toLowerCase();
  if (n.includes('music') || /music|audio|spotify/.test(h)) return 'music';
  if (n.includes('nothing') || /iphone|ios|swift|android|mobile/.test(h)) return 'phone';
  if (n === 'bio' || /linux|python|fastapi|backend/.test(h)) return 'linux';
  if (n.includes('heaven') || /terminal|cli|devtool/.test(h)) return 'terminal';
  if (/barber|scissor|salon/.test(h)) return 'scissors';
  if (/build|construction|real.?estate/.test(h)) return 'build';
  if (/agent|ai|llm|machine.?learning|openai/.test(h)) return 'agent';
  if (/sleep|rest|health/.test(h)) return 'sleep';
  if (/forest|nature|tree/.test(h)) return 'forest';
  if (/fog|weather|atmosphere/.test(h)) return 'fog';
  if (/coffee|cafe|design|ui|ux|portfolio|website/.test(h)) return 'brand';
  if (/ascii|shell|bash|command/.test(h)) return 'terminal';
  if (['python','rust','go','java','c','c++','c#'].includes((repo.language || '').toLowerCase())) return 'terminal';
  return 'web';
};

export async function fetchLiveProjects(signal) {
  const repos = [];
  for (let page = 1; page <= 10; page += 1) {
    const response = await fetch('https://api.github.com/users/' + OWNER + '/repos?per_page=100&type=owner&sort=updated&page=' + page, {
      headers: { Accept: 'application/vnd.github+json' }, cache: 'no-store', signal,
    });
    if (!response.ok) throw new Error('GitHub API ' + response.status);
    const batch = await response.json(); repos.push(...batch);
    if (batch.length < 100) break;
  }
  return repos
    .filter((r) => !r.private && !r.archived && !r.fork && !EXCLUDED.has(r.name))
    .sort((a,b) => new Date(b.updated_at) - new Date(a.updated_at))
    .map((r, i) => {
      const name = DISPLAY_NAMES[r.name] || r.name;
      const topics = Array.isArray(r.topics) ? r.topics.slice(0, 5) : [];
      const stack = [r.language, ...topics].filter(Boolean).filter((v,j,a) => a.indexOf(v) === j);
      const site = r.homepage && r.homepage.trim() ? r.homepage.trim() : (r.has_pages ? 'https://' + OWNER + '.github.io/' + r.name + '/' : null);
      return { id: String(i + 1).padStart(2,'0'), name, icon: iconFor(r), kind: 'GITHUB · ' + (r.language ? r.language.toUpperCase() : 'PROJECT'), blurb: r.description && r.description.trim() ? r.description.trim() : name + ' — public GitHub project.', detail: 'Public GitHub repository · ' + (r.default_branch || 'main') + ' branch · updated ' + new Date(r.updated_at).toLocaleDateString('en-US') + '.', stack, repo: r.html_url, site };
    });
};