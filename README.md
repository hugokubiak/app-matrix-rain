# app-matrix-rain

🎬 Matrix-style digital rain, built with GSAP, packaged as a proper npm library. Twist: the falling characters shift with the script you pick. Katakana • Cyrillic • Thai • Arabic (RTL) • runic • binary/hex • even scrolling source code.

⚙️ Status: MVP done (canvas + GSAP, latin charset). Roadmap below.

🔗 Live demo: TBD (GitHub Pages)
📦 npm: TBD (not published)

## Structure

npm workspaces monorepo:

- `packages/core`: the actual library (vanilla TS, canvas + GSAP), published as `app-matrix-rain`
- `packages/react`: optional `<MatrixRain />` wrapper
- `demo`: Vite site, deployed to GitHub Pages

Full API + how to add a charset: [`packages/core/README.md`](./packages/core/README.md).

## Roadmap

- [x] MVP: canvas + GSAP, latin charset, basic config
- [ ] Every other charset: katakana • cyrillic • thai • arabic • runic • binary • hex • code
- [ ] RTL for arabic
- [ ] `prefers-reduced-motion` + sane contrast defaults
- [ ] Glitch on hover/click
- [ ] Text-scramble easter egg
- [ ] React wrapper
- [ ] Demo control panel
- [ ] CI/CD

## Workflow

`main` stays deployable. Everything else happens on `feat/*` / `fix/*` / `chore/*` branches, merged via PR. No pressure to knock out the whole roadmap in one sitting.

## License

MIT © Hugo Kubiak
