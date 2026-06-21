## TODO

## ESLint fixes
- [ ] Refactor `src/app/onboarding.tsx` to eliminate `react-hooks/refs` “Cannot access refs during render” errors (full rewrite of ref wiring + FlatList callback/ config props, no `.current` in render).
- [ ] Fix `src/app/tabs/forum-detail.tsx` `react-hooks/set-state-in-effect` error.
- [x] Fix `src/app/tabs/index.tsx` breathing effect lint error via deferred start/stop.
- [x] Fix `src/hooks/use-color-scheme.web.ts` via deferred hydration.
- [ ] Re-run `npx -s eslint .` until there are zero errors.

## Build / SDK 56 compatibility
- [x] Remove `@react-navigation/native` from `src/app/_layout.tsx` (expo-router SDK 56 check)
- [ ] Verify Android bundling succeeds (no expo-router/react-navigation compatibility error)


