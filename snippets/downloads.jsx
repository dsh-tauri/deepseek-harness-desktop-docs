export const ReleaseDownloads = ({ lang = "zh-CN" }) => {
  const RELEASES_API = "https://api.github.com/repos/dsh-tauri/deepseek-harness-desktop/releases?per_page=12"
  const RELEASES_PAGE = "https://github.com/dsh-tauri/deepseek-harness-desktop/releases"
  const PLATFORM_ORDER = ["windows", "macos", "linux", "other"]

  const TEXT = {
    "zh-CN": {
      loading: "正在读取版本信息…",
      errorTitle: "无法从 GitHub 读取版本信息",
      errorHint: "网络受限或 GitHub 接口限流时会这样。可以直接打开发布页面选择安装包。",
      fallback: "前往 GitHub Releases",
      version: "版本",
      previewTag: "预览版",
      published: "发布于",
      noAssets: "该版本没有可下载的安装包。",
      releaseNotes: "查看该版本的发布说明",
      platforms: { windows: "Windows", macos: "macOS", linux: "Linux", other: "其他文件" },
      kinds: {
        winSetup: "安装程序（.exe）",
        winMsiZh: "MSI（简体中文）",
        winMsiEn: "MSI（英文）",
        winMsi: "MSI 安装包",
        macArm: "Apple Silicon（.dmg）",
        macIntel: "Intel 芯片（.dmg）",
        macDmg: "macOS（.dmg）",
        linuxDeb: "Debian / Ubuntu（.deb）",
        linuxAppImage: "AppImage",
        other: "其他文件",
      },
    },
    en: {
      loading: "Loading release information…",
      errorTitle: "Release information is unavailable",
      errorHint: "This happens when the network is restricted or the GitHub API rate limit is reached. Open the release page to pick an installer instead.",
      fallback: "Open GitHub Releases",
      version: "Version",
      previewTag: "pre-release",
      published: "Published",
      noAssets: "This release has no downloadable installers.",
      releaseNotes: "Read the release notes",
      platforms: { windows: "Windows", macos: "macOS", linux: "Linux", other: "Other files" },
      kinds: {
        winSetup: "Installer (.exe)",
        winMsiZh: "MSI (Simplified Chinese)",
        winMsiEn: "MSI (English)",
        winMsi: "MSI package",
        macArm: "Apple Silicon (.dmg)",
        macIntel: "Intel (.dmg)",
        macDmg: "macOS (.dmg)",
        linuxDeb: "Debian / Ubuntu (.deb)",
        linuxAppImage: "AppImage",
        other: "Other file",
      },
    },
  }

  const copy = TEXT[lang] ?? TEXT["zh-CN"]

  const classifyAsset = (name) => {
    const lower = name.toLowerCase()
    if (lower.endsWith("-setup.exe"))
      return { platform: "windows", kind: "winSetup", rank: 0 }
    if (lower.endsWith("_zh-cn.msi"))
      return { platform: "windows", kind: "winMsiZh", rank: 1 }
    if (lower.endsWith("_en-us.msi"))
      return { platform: "windows", kind: "winMsiEn", rank: 2 }
    if (lower.endsWith(".msi"))
      return { platform: "windows", kind: "winMsi", rank: 3 }
    if (lower.endsWith("aarch64.dmg") || lower.endsWith("arm64.dmg"))
      return { platform: "macos", kind: "macArm", rank: 0 }
    if (lower.endsWith("x64.dmg") || lower.endsWith("x86_64.dmg"))
      return { platform: "macos", kind: "macIntel", rank: 1 }
    if (lower.endsWith(".dmg"))
      return { platform: "macos", kind: "macDmg", rank: 2 }
    if (lower.endsWith(".deb"))
      return { platform: "linux", kind: "linuxDeb", rank: 0 }
    if (lower.endsWith(".appimage"))
      return { platform: "linux", kind: "linuxAppImage", rank: 1 }
    return { platform: "other", kind: "other", rank: 9 }
  }

  const formatSize = (bytes) => {
    if (typeof bytes !== "number" || bytes <= 0)
      return null
    if (bytes >= 1048576)
      return `${(bytes / 1048576).toFixed(1)} MB`
    return `${Math.round(bytes / 1024)} KB`
  }

  const formatDate = (value) => {
    if (!value)
      return null
    try {
      return new Date(value).toLocaleDateString(lang === "zh-CN" ? "zh-CN" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    }
    catch {
      return null
    }
  }

  const groupAssets = (assets) => {
    const buckets = { windows: [], macos: [], linux: [], other: [] }
    for (const asset of assets ?? []) {
      const meta = classifyAsset(asset.name ?? "")
      buckets[meta.platform].push({
        key: asset.id ?? asset.name,
        label: copy.kinds[meta.kind],
        name: asset.name,
        url: asset.browser_download_url,
        size: formatSize(asset.size),
        rank: meta.rank,
      })
    }
    return PLATFORM_ORDER
      .filter(platform => buckets[platform].length > 0)
      .map(platform => ({
        platform,
        label: copy.platforms[platform],
        items: buckets[platform].sort((a, b) => a.rank - b.rank),
      }))
  }

  const [status, setStatus] = useState("loading")
  const [releases, setReleases] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    let active = true
    fetch(RELEASES_API, { headers: { Accept: "application/vnd.github+json" } })
      .then((response) => {
        if (!response.ok)
          throw new Error(`GitHub API responded with ${response.status}`)
        return response.json()
      })
      .then((payload) => {
        if (!active)
          return
        const list = (Array.isArray(payload) ? payload : []).filter(release => !release.draft)
        if (list.length === 0) {
          setStatus("error")
          return
        }
        const preferred = list.find(release => !release.prerelease) ?? list[0]
        setReleases(list)
        setSelected(preferred.tag_name)
        setStatus("ready")
      })
      .catch(() => {
        if (active)
          setStatus("error")
      })
    return () => {
      active = false
    }
  }, [])

  if (status === "loading") {
    return (
      <div className="not-prose rounded-2xl border border-zinc-950/10 dark:border-white/10 px-4 py-5 text-sm text-zinc-950/60 dark:text-white/60">
        {copy.loading}
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="not-prose rounded-2xl border border-zinc-950/10 dark:border-white/10 px-4 py-5">
        <p className="text-sm font-medium text-zinc-950 dark:text-white">{copy.errorTitle}</p>
        <p className="mt-1 text-sm text-zinc-950/60 dark:text-white/60">{copy.errorHint}</p>
        <a
          className="mt-3 inline-flex items-center rounded-lg border border-zinc-950/15 dark:border-white/20 px-3 py-1.5 text-sm font-medium text-zinc-950 dark:text-white"
          href={RELEASES_PAGE}
          target="_blank"
          rel="noreferrer"
        >
          {copy.fallback} ↗
        </a>
      </div>
    )
  }

  const release = releases.find(item => item.tag_name === selected) ?? releases[0]
  const groups = groupAssets(release.assets)
  const published = formatDate(release.published_at)

  return (
    <div className="not-prose">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <label className="text-sm text-zinc-950/70 dark:text-white/70" htmlFor={`dsh-release-${lang}`}>
          {copy.version}
        </label>
        <select
          id={`dsh-release-${lang}`}
          className="rounded-lg border border-zinc-950/15 dark:border-white/20 bg-transparent px-2.5 py-1.5 text-sm font-medium text-zinc-950 dark:text-white"
          value={release.tag_name}
          onChange={event => setSelected(event.target.value)}
        >
          {releases.map(item => (
            <option key={item.tag_name} value={item.tag_name}>
              {item.tag_name}
              {item.prerelease ? ` · ${copy.previewTag}` : ""}
            </option>
          ))}
        </select>
        {published
          ? <span className="text-sm text-zinc-950/60 dark:text-white/60">{`${copy.published} ${published}`}</span>
          : null}
        <a
          className="text-sm text-zinc-950/60 dark:text-white/60 underline decoration-zinc-950/20 dark:decoration-white/20 underline-offset-2"
          href={release.html_url}
          target="_blank"
          rel="noreferrer"
        >
          {copy.releaseNotes}
        </a>
      </div>

      {groups.length === 0
        ? <p className="mt-4 text-sm text-zinc-950/60 dark:text-white/60">{copy.noAssets}</p>
        : groups.map(group => (
            <div key={group.platform} className="mt-6">
              <p className="text-sm font-medium text-zinc-950 dark:text-white">{group.label}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {group.items.map(item => (
                  <a
                    key={item.key}
                    className="inline-flex items-baseline gap-2 rounded-lg border border-zinc-950/15 dark:border-white/20 px-3 py-2 text-sm font-medium text-zinc-950 dark:text-white hover:border-zinc-950/30 dark:hover:border-white/40"
                    href={item.url}
                    title={item.name}
                  >
                    <span>{item.label}</span>
                    {item.size
                      ? <span className="text-xs font-normal text-zinc-950/50 dark:text-white/50">{item.size}</span>
                      : null}
                  </a>
                ))}
              </div>
            </div>
          ))}
    </div>
  )
}
