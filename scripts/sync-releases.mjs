// 从 GitHub 的 release HTML 页面同步版本列表，写进 snippets/downloads.jsx 的快照块。
//
// 为什么不用 api.github.com：未认证的 API 每 IP 每小时只有 60 次配额，文档站访客
// 共享出口 IP 时会直接 403。而 github.com 的 release 页面没有这个限制（和桌面端
// src-tauri/src/service/download/github.rs 用的是同一批来源：/releases 列表页、
// releases/tag/<tag> 链接、releases/expanded_assets/<tag> 片段）。
//
// 浏览器里无法直接读这些页面——github.com 不返回 Access-Control-Allow-Origin，
// 所以只能在构建期/CI 里抓取，把结果作为快照提交进仓库，页面渲染时零网络请求。

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const REPO = 'dsh-tauri/deepseek-harness-desktop'
const RELEASES_URL = `https://github.com/${REPO}/releases`
const EXPANDED_URL = tag => `https://github.com/${REPO}/releases/expanded_assets/${encodeURIComponent(tag)}`
const RELEASE_LIMIT = 12
const USER_AGENT = 'deepseek-harness-desktop-docs (+https://github.com/dsh-tauri/deepseek-harness-desktop-docs)'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const target = join(root, 'snippets', 'downloads.jsx')

const START_MARKER = /(\/\* sync-releases:start[^\n]*\n)[\s\S]*?(\n[ \t]*\/\* sync-releases:end \*\/)/

const decodeEntities = value => value
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, '\'')

const firstIsoDate = (text) => {
  const match = text.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/)
  return match ? match[0] : null
}

// 与桌面端 parse_release_list_from_html 相同的做法：按 `releases/tag/` 顺序切片去重，
// 「Pre-release」只在当前 release 自己的切片里判断，避免把相邻条目的标记串进来。
const parseReleaseList = (html) => {
  const marker = 'releases/tag/'
  const releases = []
  const seen = new Set()
  let cursor = 0
  while (cursor < html.length) {
    const relative = html.indexOf(marker, cursor)
    if (relative === -1)
      break
    const start = relative + marker.length
    const stop = html.slice(start).search(/["'?]/)
    if (stop === -1)
      break
    const tag = html.slice(start, start + stop)
    const nextRelative = html.indexOf(marker, start + stop)
    const next = nextRelative === -1 ? html.length : nextRelative
    const entry = html.slice(start, next)
    if (tag && !seen.has(tag)) {
      seen.add(tag)
      releases.push({
        tag: decodeURIComponent(tag),
        prerelease: entry.includes('Pre-release'),
        published: firstIsoDate(entry),
      })
    }
    cursor = next
  }
  return releases
}

// expanded_assets 片段里每个资产是一个 <li>，含下载 href、文件名与体积（如 `6.73 MB`）。
// GitHub 不在片段里给出字节数，体积以页面展示的字符串为准。
const parseAssets = (html) => {
  const assets = []
  for (const item of html.split('<li')) {
    const href = item.match(/href="([^"]*\/releases\/download\/[^"]+)"/)
    if (href === null)
      continue
    const link = decodeEntities(href[1])
    const name = item.match(/<span class="text-bold">([^<]+)<\/span>/)
    const size = item.match(/>\s*([\d.]+\s*(?:KB|MB|GB))\s*</)
    assets.push({
      name: name === null ? decodeURIComponent(link.split('/').pop()) : decodeEntities(name[1]).trim(),
      url: link.startsWith('http') ? link : `https://github.com${link}`,
      size: size === null ? null : decodeEntities(size[1]).replace(/\s+/g, ' '),
    })
  }
  return assets
}

const get = async (url, attempt = 1) => {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, 'Accept': 'text/html' },
      signal: AbortSignal.timeout(30000),
    })
    if (!response.ok)
      throw new Error(`${response.status} ${response.statusText}`)
    return await response.text()
  }
  catch (error) {
    if (attempt >= 3)
      throw new Error(`${url}: ${error.message}`)
    console.warn(`warn: attempt ${attempt} failed for ${url} (${error.message}); retrying`)
    await new Promise(resolve => setTimeout(resolve, attempt * 2000))
    return get(url, attempt + 1)
  }
}

const main = async () => {
  const listHtml = await get(RELEASES_URL)
  const releases = parseReleaseList(listHtml).slice(0, RELEASE_LIMIT)
  if (releases.length === 0)
    throw new Error('no releases parsed from the releases page')

  const snapshot = []
  for (const release of releases) {
    let assets = []
    try {
      assets = parseAssets(await get(EXPANDED_URL(release.tag)))
    }
    catch (error) {
      console.warn(`warn: ${release.tag}: ${error.message}`)
    }
    console.log(`${release.tag}${release.prerelease ? ' (pre-release)' : ''} ${release.published ?? 'no date'} assets=${assets.length}`)
    snapshot.push({
      tag: release.tag,
      url: `https://github.com/${REPO}/releases/tag/${release.tag}`,
      published: release.published,
      prerelease: release.prerelease,
      assets,
    })
  }

  const block = `  const SNAPSHOT = ${JSON.stringify(snapshot, null, 2).replace(/^/gm, '  ').trimStart()}\n`
  const source = readFileSync(target, 'utf8')
  if (!START_MARKER.test(source))
    throw new Error(`snapshot markers not found in ${target}`)
  const next = source.replace(START_MARKER, (_match, head, tail) => `${head}${block}${tail}`)

  if (next === source) {
    console.log('snapshot already up to date')
    return
  }
  writeFileSync(target, next)
  console.log(`snapshot updated: ${snapshot.length} releases`)
}

await main()
