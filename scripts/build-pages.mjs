import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync, renameSync, readdirSync, rmdirSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { verifyPages } from './verify-pages.mjs';

const cli = fileURLToPath(new URL('../node_modules/vinext/dist/cli.js', import.meta.url));
const argument = process.argv.find(value => value.startsWith('--base='));
let base = argument?.slice(7) ?? process.env.PAGES_BASE_PATH;
if (base === undefined && process.env.GITHUB_REPOSITORY) {
  const [owner, repository] = process.env.GITHUB_REPOSITORY.split('/');
  base = repository.toLowerCase() === `${owner.toLowerCase()}.github.io` ? '' : `/${repository}`;
}
base = (base || '').replace(/\/$/, '');
if (base && !/^\/[A-Za-z0-9_.-]+$/.test(base)) throw new Error('Base path must be empty or /repository-name');
console.log(`GitHub Pages base path: ${base || '/'}`);
const args = process.platform === 'win32'
  ? ['--import', new URL('./windows-clean-exit.mjs', import.meta.url).href, cli, 'build']
  : [cli, 'build'];
const result = spawnSync(process.execPath, args, {
  stdio: 'inherit',
  env: { ...process.env, NEXT_PUBLIC_BASE_PATH: base },
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
// Vinext emits a path assetPrefix as nested output. GitHub mounts the artifact
// itself at /repository, so normalize only the generated _next folder.
if (base) {
  const root = resolve('dist/client');
  const nested = resolve(root, `.${base}`, '_next');
  const target = resolve(root, '_next');
  for (const path of [nested, target]) {
    if (relative(root, path).startsWith('..')) throw new Error('Output path escaped dist/client');
  }
  if (existsSync(nested)) {
    if (existsSync(target)) throw new Error('Ambiguous duplicate _next output');
    renameSync(nested, target);
    const parent = resolve(root, `.${base}`);
    if (readdirSync(parent).length === 0) rmdirSync(parent);
  }
}
mkdirSync('dist', { recursive: true });
writeFileSync('dist/pages-build.json', JSON.stringify({ basePath: base }, null, 2));
writeFileSync('dist/client/.nojekyll', '');
verifyPages(base);


