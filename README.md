# DeepSeek Harness Desktop Docs

Official bilingual documentation for
[DeepSeek Harness Desktop](https://github.com/dsh-tauri/deepseek-harness-desktop),
built with [Mintlify](https://mintlify.com/).

## Local development

```bash
pnpm install
pnpm dev
```

The preview is available at `http://localhost:3000` by default.

## Quality checks

```bash
pnpm docs:audit
pnpm validate
pnpm links
pnpm a11y
pnpm check
```

English content lives in `en/`; Simplified Chinese content lives in `zh-CN/`.
Keep both trees structurally aligned. Product screenshots preserve the required comment
placeholder inside valid MDX, for example
`{/* <!-- [Settings overview](/images/en/settings-overview.webp) --> */}`. Replace it
only after reviewed assets are available.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

Documentation content follows the licensing terms of the main project. See the
[desktop repository](https://github.com/dsh-tauri/deepseek-harness-desktop)
for details.
