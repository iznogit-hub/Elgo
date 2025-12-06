# Contributing Protocol

**System Status:** `ACCEPTING_PRs`

First off, thanks for taking the time to contribute to the codebase.

## 📡 Establishment of Connection

1. **Fork the Repository:** Create your own copy of the system.
2. **Clone:** `git clone https://github.com/t7sen/portfolio.git`
3. **Install Dependencies:** `npm install`
4. **Environment:** Copy `.env.example` to `.env.local` and populate credentials.

## 💻 Development Standards

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4. No arbitrary values unless necessary.
- **Type Safety:** Strict TypeScript. No `any`.
- **Linting:** Ensure `npm run lint` passes before committing.

## 🧪 Testing Protocols

Before opening a Pull Request, ensure all systems are nominal:

```bash
# Run E2E Smoke Tests
npm run test:e2e
```
