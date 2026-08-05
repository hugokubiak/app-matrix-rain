<!-- Titre : type(scope): description, même convention que les commits (voir CLAUDE.md) -->

## Résumé

<!-- 1 à 3 phrases : objectif de la PR -->

## Packages et fichiers

<!-- packages/core, packages/react, demo : fichiers ajoutés, modifiés ou supprimés -->

## API / Config

<!-- Surface publique touchée : options de MatrixRainConfig, nouveaux charsets, exports index.ts -->

## Animations

<!-- GSAP : ticker, easing, nouveaux effets (glitch, scramble) -->

## Accessibilité

<!-- prefers-reduced-motion, contraste, RTL -->

## Performance

<!-- FPS, taille du bundle npm, canvas vs DOM -->

## Docs

<!-- README, CLAUDE.md, packages/*/README.md -->

## Test plan

- [ ] `npm run build` passe (toutes les workspaces)
- [ ] `npm run lint` passe
- [ ] `npm run test` passe (vitest)
- [ ] Vérification visuelle de la démo (`npm run dev`), desktop et mobile
- [ ] Vérification manuelle des fonctionnalités impactées
