Project-specific Copilot guidance

This file contains short, actionable guidance for AI coding agents working on this repository. Keep answers specific and reference concrete files when suggesting edits.

- Big picture
  - This is a mobile-first Expo React Native project using TypeScript and file-based routing from `expo-router` (the `app/` folder drives routes).
  - Main UI surface: `app/(tabs)/_layout.tsx` defines the primary tab layout (Reels / Upload / Profile). `app/index.tsx` redirects to `/reels`.
  - Authentication is provided via `src/context/AuthContext.tsx`. The `AuthProvider` wraps tab navigation in `_layout.tsx`.

- Where backend/API is configured
  - The canonical backend host is set in `src/config/api.ts` (`API_URL`). AuthContext also constructs API paths (note a placeholder in `AuthContext.tsx`).
  - When adding or fixing API calls, prefer using `src/config/api.ts` as the single source of truth for base URLs.

- Auth flow & storage
  - `AuthContext.tsx` stores `token` and `user` in `AsyncStorage` under the keys `token` and `user`.
  - Login uses `axios.post(
    `${API_BASE}/signin` ...)
    `; register sends multipart/form-data to `${API_BASE}/register`.
  - UI screens under `app/(auth)/login.tsx` and `app/(auth)/register.tsx` call `useAuth()` and `router.replace("/(tabs)/profile")` on success.

- Routing & file layout conventions
  - File-based routing: add screens by creating files in `app/`—subfolders map to route segments.
  - Grouping convention: parentheses folders like `(auth)` and `(tabs)` are used for route groups. Use the same grouping for new routes.

- Tooling / common commands
  - Use npm scripts in `package.json`:
    - `npm install` to install deps
    - `npm start` (or `npx expo start`) to run Metro/Expo
    - `npm run ios|android|web` to open platforms
    - `npm run reset-project` will scaffold a blank `app/` (used by the starter)
    - `npm run lint` runs the Expo lint preset
  - TypeScript is installed as a devDependency. For a type check run `npx tsc --noEmit`.

- Styling & patterns
  - Project uses `nativewind` but several components use inline styles; follow the existing style in the file you're editing.
  - Iconography uses `@expo/vector-icons` (see `_layout.tsx` for Ionicons usage).

- Examples of safe, common edits
  - To add an API helper: import `API_URL` from `src/config/api.ts` and create axios helpers in a new `src/services/` file.
  - To add a screen under tabs: create `app/<screen>/index.tsx` and register a `Tabs.Screen` in `app/(tabs)/_layout.tsx` using the same `name` path.
  - To change auth storage keys or shape, update `src/context/AuthContext.tsx` and migrate any code reading `AsyncStorage.getItem("user")`.

- What not to change
  - Do not modify files inside `node_modules/`.
  - Avoid changing `expo`/React/native versions unless paired with careful testing across iOS, Android, and web.

- References (concrete files to inspect)
  - `app/index.tsx` — root redirect
  - `app/(tabs)/_layout.tsx` — tab layout and `AuthProvider` wrapper
  - `app/(auth)/login.tsx`, `app/(auth)/register.tsx` — auth UI examples
  - `src/context/AuthContext.tsx` — token/user handling, axios usage
  - `src/config/api.ts` — API_URL constant (backend host)
  - `package.json` — scripts and dependencies

If any of the above paths are unclear or you want more examples (e.g., how to add a new Tab screen or wire a new API endpoint), say which area and I'll add a compact, copy-pasteable snippet.
