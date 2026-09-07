import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

export function verifyPages(basePath) {
  const root = resolve('dist/client');
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  if (!html.includes('让想法') || !html.includes('星哥')) throw new Error('Missing page content');
  const localURLs = [...html.matchAll(/(?:src|href)="(\/[^\"]*)"/g)].map(match => match[1].split('?')[0]);
  for (const url of localURLs) {
    if (!url.startsWith(`${basePath}/`)) throw new Error(`Wrong base path: ${url}`);
    const target = resolve(root, `.${decodeURIComponent(url.slice(basePath.length))}`);
    if (relative(root, target).startsWith('..') || !existsSync(target)) throw new Error(`Missing local asset: ${url}`);
  }
  const walk = folder => readdirSync(folder).flatMap(name => {
    const path = join(folder, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
  const files = walk(root);
  for (const name of ['visuals-orbit-', 'visuals-network-', 'visuals-flow-']) {
    if (!files.some(path => path.includes(name) && path.endsWith('.js'))) throw new Error(`Missing visual bundle: ${name}`);
  }
  for (const name of ['images/xingge.jpg', 'images/wechat.jpg', '.nojekyll']) {
    if (!existsSync(join(root, name))) throw new Error(`Missing public file: ${name}`);
  }
  for (const file of files.filter(path => /\.(html|js|css|rsc|json)$/.test(path))) {
    const text = readFileSync(file, 'utf8');
    if (/(?:https?:\/\/staging\.|art_v2_|-----BEGIN [A-Z ]*PRIVATE KEY)/i.test(text)) throw new Error('Private data detected in public output');
  }
  console.log(`Pages verification passed: ${localURLs.length} local asset references, 3 visual bundles, images, and privacy scan. Base: ${basePath || '/'}`);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { basePath } = JSON.parse(readFileSync('dist/pages-build.json', 'utf8'));
  verifyPages(basePath);
}

