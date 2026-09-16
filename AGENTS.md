# DeepSeek Harness Desktop documentation guidelines

This standalone Mint repository documents DeepSeek Harness Desktop. These rules apply to all files in the repository and are intentionally portable: never assume a fixed checkout path or machine layout.

## Purpose

- Write task-oriented software documentation for users first; architecture and contributor material follow the user journey.
- Use the `mint` package with `docs.json`; never add deprecated `mint.json`.
- Keep `zh-CN/` and `en/` as complete mirrored trees.
- Treat Simplified Chinese as the default locale and primary editorial source unless a direct request says otherwise.
- Base current-feature claims on current source and released artifacts, not plans, tests, or memory.

## Source discovery: never depend on local absolute paths

When asked to “update,” “sync,” “refresh,” or add documentation, discover current sources before editing.

### Discover local repositories

1. Determine the docs repository root from the current working directory and `docs.json`.
2. Inspect the parent directory and sibling Git repositories by repository identity, not folder name alone.
3. Use `git remote -v`, `git config --get remote.origin.url`, package manifests, and repository metadata to identify:
   - `dsh-tauri-desk/deepseek-harness-desktop` — desktop implementation.
   - `dsh-tauri-desk/dsh-tauri-plugins` — first-party desktop plugins.
   - `dsh-tauri-desk/deepseek-harness-pkg` — packaged Harness distribution.
4. A sibling checkout is an optimization, not a requirement. If a source is absent or stale, read the public GitHub repository with `gh` or GitHub API.
5. Never write an absolute workstation path into documentation or agent instructions.

### Canonical remote sources

- Desktop source: <https://github.com/dsh-tauri-desk/deepseek-harness-desktop>
- First-party plugins: <https://github.com/dsh-tauri-desk/dsh-tauri-plugins>
- Packaged core: <https://github.com/dsh-tauri-desk/deepseek-harness-pkg>
- Upstream Harness: <https://github.com/deepseek-ai/deepseek-harness>
- Releases: <https://github.com/dsh-tauri-desk/deepseek-harness-desktop/releases>
- Roadmap: <https://github.com/orgs/dsh-tauri-desk/projects/3/views/2>

Use the current desktop source and release assets to determine desktop behavior. Upstream Harness documentation explains Harness capabilities but does not prove that the desktop exposes them.

## What “update” means

A generic request such as “update the docs” is authorization to perform source discovery and reconcile documentation with current facts. Do not merely edit the named paragraph.

For every update:

1. Discover relevant local or remote sources.
2. Compare source facts with the current Chinese page, English mirror, `docs.json`, overview pages, comparison tables, and roadmap text.
3. Identify additions, removals, renames, version changes, platform changes, and status changes.
4. Update Chinese first unless the user directly edited Chinese; in that case preserve their text and use it as the baseline.
5. Synchronize the English page naturally while preserving exact technical identifiers.
6. Update navigation and related pages when the source inventory changes.
7. Run all quality checks.

Never assume the documented inventory is still current.

## Dynamic inventory workflows

### Built-in plugins

Do not maintain the built-in plugin list from memory.

1. Read the desktop repository's current internal-plugin manifest, normally `src-tauri/resources/internal-plugins.json`.
2. Read the current package inventory and READMEs in `dsh-tauri-plugins`.
3. Compare manifest IDs, package names, descriptions, versions, and repository URLs with:
   - both locale navigation groups;
   - `built-in-plugins/overview.mdx`;
   - each locale's plugin detail pages;
   - architecture and comparison pages.
4. For a newly added built-in plugin:
   - add mirrored detail pages at the same relative path;
   - add matching navigation entries in the same order;
   - add an overview card;
   - document user-visible behavior, protocol, fallback, data, and security boundaries from source;
   - update comparison tables only when it creates a meaningful product difference.
5. For a removed plugin:
   - verify removal in current desktop source and release behavior;
   - remove it from current inventory/navigation;
   - delete or explicitly mark pages obsolete only when historical documentation is still useful;
   - repair all links and comparison claims.
6. For renamed or merged plugins, migrate both locale paths and verify language page keys remain identical.

Current documentation may cover `dsh-tauri`, `dsh-tauri-ui`, `dsh-tauri-worktree`, `dsh-tauri-panel-extension`, and `dsh-tauri-panel-scheduler`, but this list is not permanent. Re-discover it every time.

### Desktop releases and platform support

For release-sensitive updates:

1. Read the latest GitHub Release metadata and actual asset names.
2. Read package/Tauri/Cargo manifests and release workflows when platform or architecture support matters.
3. Update version numbers, dates, installer names, supported architectures, signing/notarization claims, runtime versions, and update behavior only from current evidence.
4. Do not infer support from dormant source branches. An implementation path is not release support without current artifacts.
5. Keep installation, release, troubleshooting, comparison, and architecture pages consistent.

### Competing desktop clients

The comparison tracks:

- <https://github.com/dsh-tauri-desk/deepseek-harness-desktop>
- <https://github.com/anywhere-labs/dsh-desktop>
- <https://github.com/dataelement/dsh-desktop>
- <https://github.com/zouyuxuan122/Deepseek-Harness-EAC>

Every comparison refresh must:

1. Re-read each current public README.
2. Inspect the relevant package/Cargo/Tauri/Electron manifest for technology claims.
3. Inspect the latest Release and actual assets for platform claims.
4. Update the research date.
5. Re-evaluate every table row; do not copy prior values forward without checking.
6. Use `✅` only for explicit current support, `◐` for partial/plugin/separate-line support, `—` only for explicit non-support, and “未确认” / “Not confirmed” when public material is silent.
7. Describe positioning and tradeoffs without inferring motives or ranking projects.

If a comparison repository disappears, is archived, changes ownership, or changes product scope, record that fact and revise the comparison rather than silently preserving stale claims.

### Roadmap

Always query the current GitHub Project instead of relying on copied roadmap text.

- Read items, Status, Priority, Quarter, title, body, issue/repository linkage, and view context from Project 3 View 2.
- Keep roadmap items in a separate section from shipped capabilities.
- Only `Shipped` belongs in current-feature tables.
- `In Progress`, `Planned`, and `Idea` remain clearly labeled and do not guarantee delivery dates.
- Add new items and remove or reclassify changed items in both languages.
- When an item becomes shipped, verify released source or artifacts before rewriting current-feature documentation.

### Upstream Harness changes

When upstream changes models, sessions, settings, tools, Skills, MCP, workspace, or plugin semantics:

1. Read current upstream user documentation and source.
2. Verify whether the desktop's bundled/current core contains or exposes the change.
3. Update desktop docs only for behavior users can access in the documented desktop version.
4. Preserve the boundary between Harness UI settings and native desktop Configuration.

## Documentation structure

- `docs.json` is the navigation source of truth.
- Every `zh-CN/**/*.mdx` page has an `en/**/*.mdx` mirror with the same relative path.
- Public pages appear in both language navigations in matching order.
- Keep `zh-CN` first in `navigation.languages` with `"default": true`.
- Do not use locale `index.mdx` as an ordinary sidebar page. Mint reserves `index` for locale/root routing. Use explicit slugs such as `quickstart.mdx`.
- Keep navigation shallow and task-oriented: Introduction, Use Harness, Built-in plugins, Troubleshooting and data, Architecture, and Development.

## Frontmatter and headings

Every MDX page requires:

```yaml
---
title: 页面标题
description: 用一句话说明读者能完成什么。
---
```

- Keep frontmatter `title` and `description`.
- Do not add a body H1 (`# Title`); Mint renders the frontmatter title.
- Begin the body with useful context, not a title restatement.
- Body sections begin at `##`; keep heading levels sequential.
- Use sentence case in English headings.

## Bilingual workflow

- Chinese is the editorial baseline.
- When a user edits Chinese, read the current file and never overwrite their changes while synchronizing English.
- Translate meaning and structure, not word order.
- Preserve commands, package names, signatures, API and slot identifiers, paths, URLs, versions, errors, and configuration keys exactly.
- Keep sections, tables, callouts, examples, claims, and links aligned.
- Use `/images/zh-CN/` and `/images/en/` for locale-specific media.
- After a file move or rename, change both locales, both navigation entries, and all links.

## Writing style

Write software product documentation, not a repository README or marketing page.

### Voice and structure

- Address the reader directly and use active voice.
- Lead with the task, result, or boundary.
- Prefer short paragraphs, concrete steps, meaningful tables, and copyable commands.
- Distinguish the embedded Harness UI from the native desktop shell.
- Put prerequisites before procedures and verification after them.
- Use symptom-oriented troubleshooting.

### Tone and claims

- Be restrained, factual, and explicit about limitations.
- Do not use unsupported “best,” “fastest,” “safest,” or “lightest” claims.
- Do not use stars, plugin counts, or feature-list length as a quality proxy.
- State that Harness and plugins can execute local code and that profiles are not OS sandboxes.
- Preserve the project position:
  - open-source organization without commercial bundling;
  - a small, maintainable, verifiable first-party default set rather than a community-plugin bundle;
  - lightweight Tauri shell with an independent local Harness service;
  - Codex-level completeness as a goal across functionality, responsiveness, stability, consistency, and recovery—not a claim already achieved;
  - promises remain within current team, test, and release capability.

## Style references

Use references for information architecture and presentation, never copied wording or branding:

- AstrBot: software-first Chinese onboarding, configuration, plugins, and practical troubleshooting.
- Cursor Docs: concise task paths and progressive disclosure for AI coding workflows.
- TRAE SOLO: direct product workflow guidance.
- Tauri Docs: platform tabs, native prerequisites, architecture boundaries, mirrored localization.
- Astro: task cards and separation of learning paths from reference.
- Vitest comparisons: explain fit, then present factual matrices instead of one winner.
- antfu.me: restrained visual hierarchy only, not blog-first organization.

When these sites evolve, consult their current documentation rather than relying on remembered layouts.

## Mint rules

Consult current <https://mintlify.com/docs> or `mintlify/docs` source before using a component or configuration field.

Preferred components:

- `Steps` / `Step` for procedures.
- `Tabs` / `Tab` for platform or mutually exclusive choices.
- `AccordionGroup` / `Accordion` for optional details.
- `CardGroup` / `Card` for navigation.
- `Frame` for real images, video, or diagrams.
- `Note`, `Info`, `Tip`, and `Warning` by severity.
- `Tree` for useful file hierarchies.

Do not invent components. Mint currently has `Frame`, image zoom, and image actions, but no built-in `Gallery` or `Carousel`. For several screenshots, prefer `Tabs + Frame` or `Columns + Frame`. Re-check this statement before future media work because Mint may add components.

Critical instructions must not be hidden in an accordion. Components should add structure, not decoration.

## Screenshots and media

Before reviewed assets exist, preserve the exact placeholder inside valid MDX JSX comments:

```mdx
{/* <!-- [清晰描述](/images/zh-CN/example.webp) --> */}
```

```mdx
{/* <!-- [Clear description](/images/en/example.webp) --> */}
```

- Keep the inner `<!-- [description](path) -->` exact.
- The JSX wrapper is required because Mint rejects bare HTML comments in MDX.
- Do not use Markdown image syntax for placeholders, create fake screenshots, or reference missing files as live images.
- Real images require descriptive alt text and must be free of secrets and private data.
- Once an asset exists, use `Frame` where appropriate.

## Links and routes

- Use relative same-locale page links without `.mdx`, such as `../help/troubleshooting` or `./dsh-tauri`.
- Do not prefix body links with `/en/` or `/zh-CN/`.
- Use absolute URLs for official external sources.
- `groups[].pages` accepts documentation page paths or nested groups, not arbitrary external-link objects. Create a local page that links to an external project.
- Avoid ordinary sidebar pages named `index.mdx`.

## Code examples

- Add a language identifier to every code block.
- Base examples on current public types and at least one real consumer.
- Keep exact identifiers such as `definePanel`, `PanelEntry`, `PanelHandle`, `sidebar.panellist`, and `main`.
- Show safe fallback when optional services may be absent.
- Put authorization warnings next to destructive operations such as `checkout_worktree`.
- Avoid non-compiling placeholder code unless clearly labeled pseudocode.

## Update procedure

For every nontrivial change:

1. Read this `AGENTS.md`, `docs.json`, and related pages.
2. Discover current source repositories locally or remotely.
3. Inspect source, README, manifests, releases, or Project fields needed for each claim.
4. Diff source inventories and statuses against both locale trees and navigation.
5. Edit Chinese first, preserving user edits and frontmatter without adding H1.
6. Synchronize natural English at the identical relative path.
7. Update navigation, overview cards, cross-links, comparison tables, roadmap, and media placeholders.
8. Run:

```bash
pnpm links
pnpm a11y
pnpm validate
```

Or:

```bash
pnpm check
```

9. Require:
   - equal mirrored page counts and no navigation/placeholder issues;
   - no broken links;
   - successful accessibility check (AA required; non-failing AAA suggestions are acceptable);
   - `success build validation passed`.
10. For navigation/layout changes, restart a stale preview, clear `.mintlify/` if needed, and verify both locales and all renamed pages after a fresh load.

## Toolchain

- Use the repository's `packageManager` value; currently `pnpm@10.28.2`.
- Use the `mint` package, not legacy `mintlify`.
- Use an LTS Node version compatible with current Mint; do not hard-code a machine-specific executable path.
- Local content preview does not require authentication. Built-in local-preview search may require `mint login` because it uses Mint's hosted index; never store credentials in this repository.
- `AGENTS.md` is excluded from Mint builds through `.mintignore` and remains agent guidance only.

## Do not

- Do not depend on absolute local paths or a particular workspace layout.
- Do not remove frontmatter titles or add body H1 headings.
- Do not let locale trees or navigation order drift.
- Do not preserve stale plugin, release, comparison, or roadmap inventories without re-checking sources.
- Do not publish roadmap plans as shipped.
- Do not turn test expectations into user promises.
- Do not claim platform/architecture support without current release artifacts.
- Do not describe `dsh-win-terminal-inspector` as bundled source; verify its current delivery before documenting it.
- Do not create a remote repository, push, publish, or deploy without an explicit user request.
