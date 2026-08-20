import fs from 'fs'
import path from 'path'

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

const projectRoot = path.resolve(new URL(import.meta.url).pathname, '..', '..')
const distDir = path.join(projectRoot, 'dist')
const pkgPath = path.join(projectRoot, 'package.json')

if (!fs.existsSync(distDir)) {
  console.error('dist directory not found — run `npm run build` first')
  process.exit(1)
}

const pkg = readJSON(pkgPath)
let site = pkg.homepage || ''
if (!site) {
  console.warn('No `homepage` in package.json; using root path for URLs')
  site = ''
}
// remove trailing slash
if (site.endsWith('/')) site = site.slice(0, -1)

function walk(dir) {
  const files = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...walk(full))
    else files.push(full)
  }
  return files
}

const htmlFiles = walk(distDir).filter(f => f.endsWith('.html'))

const urls = htmlFiles
  .map(f => path.relative(distDir, f))
  .filter(rel => rel !== '404.html')
  .map(rel => {
    let urlPath = rel
    if (urlPath.endsWith('index.html')) urlPath = urlPath.slice(0, -'index.html'.length)
    else if (urlPath.endsWith('.html')) urlPath = urlPath.slice(0, -'.html'.length)
    // ensure leading slash
    if (!urlPath.startsWith('/')) urlPath = '/' + urlPath
    // convert Windows backslashes
    urlPath = urlPath.replace(/\\/g, '/')
    const loc = site ? site + urlPath : urlPath
    const fullPath = path.join(distDir, rel)
    const stat = fs.statSync(fullPath)
    const lastmod = stat.mtime.toISOString()
    return { loc, lastmod }
  })

const xml = [`<?xml version="1.0" encoding="UTF-8"?>`, `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`]
for (const u of urls) {
  xml.push('  <url>')
  xml.push(`    <loc>${u.loc}</loc>`)
  xml.push(`    <lastmod>${u.lastmod}</lastmod>`)
  xml.push(`    <priority>0.8</priority>`)
  xml.push('  </url>')
}
xml.push('</urlset>')

const out = xml.join('\n') + '\n'
fs.writeFileSync(path.join(distDir, 'sitemap.xml'), out, 'utf8')
console.log('Generated sitemap.xml with', urls.length, 'entries')
