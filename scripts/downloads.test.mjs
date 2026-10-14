import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'

const source = readFileSync(new URL('../snippets/downloads.jsx', import.meta.url), 'utf8')
// Exercise the shared component's grouping without a browser or JSX test dependency.
const start = source.indexOf('  const PLATFORM_ORDER')
const end = source.indexOf('  const releases =')
const { groupAssets, SNAPSHOT } = runInNewContext(
  `${source.slice(start, end)}; ({ groupAssets, SNAPSHOT })`,
  { lang: 'zh-CN' },
)

for (const release of SNAPSHOT) {
  const groups = groupAssets(release.assets)
  const items = groups.flatMap(group => group.items)
  assert.equal(items.length, release.assets.length)
  assert.equal(new Set(items.map(item => item.url)).size, release.assets.length)
  for (const group of groups) {
    assert.ok(group.items.every(item => item.tab === group.tab))
    for (const item of group.items) {
      const mobile = /\.(apk|ipa)$|^SHA256SUMS-(Android|iOS)\.txt$/i.test(item.name)
      assert.equal(group.tab, mobile ? 'mobile' : /_bundle_/i.test(item.name) ? 'bundle' : 'standard')
    }
  }
}
assert.equal(groupAssets([]).length, 0)
const groups = groupAssets([
  { name: 'Desktop_BUNDLE_1.exe', url: 'bundle' },
  { name: 'Desktop_1.exe', url: 'standard' },
])
assert.equal(groups.find(group => group.tab === 'standard').items[0].url, 'standard')
assert.equal(groups.find(group => group.tab === 'bundle').items[0].url, 'bundle')
// Both locales expose the invite and mobile assets, even when a release has no mobile files.
for (const lang of ['zh-CN', 'en']) {
  const { TESTFLIGHT_URL, TAB_ORDER, copy, groupAssets } = runInNewContext(
    `${source.slice(start, end)}; ({ TESTFLIGHT_URL, TAB_ORDER, copy, groupAssets })`,
    { lang },
  )
  assert.deepEqual(Array.from(TAB_ORDER), ['standard', 'bundle', 'mobile'])
  assert.equal(TESTFLIGHT_URL, 'https://testflight.apple.com/join/kYXkpnp1')
  const tabs = source.slice(source.indexOf('<Tabs sync={false}>'), source.indexOf('</Tabs>'))
  assert.deepEqual([...tabs.matchAll(/<Tab title=\{copy\.(\w+)\}>/g)].map(match => match[1]), ['standard', 'bundle', 'mobile'])
  assert.match(tabs, /^<Tabs sync=\{false\}>\s*<Tab title=\{copy.standard\}>/)
  assert.match(tabs, /<Tab title=\{copy.mobile\}>\s*\{renderGroups\("mobile"\)\}[\s\S]*?href=\{TESTFLIGHT_URL\}/)
  assert.doesNotMatch(tabs, /\.map\(/)
  assert.match(copy.testFlight, /iOS.*TestFlight/)
  assert.ok(copy.testFlightNote && copy.mobile && copy.noMobileAssets)
  const mobileGroups = groupAssets([
    { name: 'Deepseek.Harness.Android_1.apk', url: 'apk' },
    { name: 'Deepseek.Harness.iOS_1_unsigned.ipa', url: 'ipa' },
    { name: 'SHA256SUMS-Android.txt', url: 'android-checksum' },
    { name: 'SHA256SUMS-iOS.txt', url: 'ios-checksum' },
  ])
  assert.equal(mobileGroups.length, 2)
  assert.ok(mobileGroups.every(group => group.tab === 'mobile'))
  assert.deepEqual(Array.from(mobileGroups.find(group => group.label === 'Android').items, item => item.url), ['apk', 'android-checksum'])
  const ios = mobileGroups.find(group => group.label === 'iOS').items
  assert.deepEqual(Array.from(ios, item => item.url), ['ipa', 'ios-checksum'])
  assert.match(ios[0].label, /IPA.*(自签名|self-signing)/)
}
console.log('Download grouping and iOS installation checks passed')
