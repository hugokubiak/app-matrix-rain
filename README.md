# app-matrix-rain

🎬 Matrix-style digital rain, built with GSAP, packaged as a proper npm library. Twist: the falling characters shift with the script you pick. Katakana • Cyrillic • Thai • Arabic (RTL) • runic • binary/hex • even scrolling source code.

⚙️ Status: MVP + all charsets + RTL + reduced-motion + hover/click glitch + text-scramble + React wrapper + demo control panel + CI/CD done (canvas + GSAP, script switching wired). Roadmap 1-9 complete, only the exploratory 3D variant left. Roadmap below.

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
- [x] Every other charset: katakana • cyrillic • thai • arabic • runic • binary • hex • code
- [x] RTL for arabic
- [x] `prefers-reduced-motion` + sane contrast defaults
- [x] Glitch on hover/click
- [x] Text-scramble easter egg
- [x] React wrapper
- [x] Demo control panel
- [x] CI/CD
- [ ] Exploratory: scroll-driven 3D variant of the rain (not committed)

## Workflow

`main` stays deployable. Everything else happens on `feat/*` / `fix/*` / `chore/*` branches, merged via PR. No pressure to knock out the whole roadmap in one sitting.

## License

MIT © Hugo Kubiak
