# VoiceCanvas

A voice-first, AI-powered graphic design editor. Speak what you want; a validated command engine builds it on the canvas. Manual editing and voice share one document.

> **Status:** Sprint 1 — frontend editor foundation. No AI/voice/backend yet.

## Quick start
```bash
git clone <repo-url> voicecanvas
cd voicecanvas/frontend
npm install
npm run dev
```

## Stack
React · TypeScript · Vite · Tailwind CSS v4 · Fabric.js · Zustand · Lucide
Planned: FastAPI · WebSockets · PostgreSQL · Cloudflare R2 · Web Speech API · Cloud LLM

## Core idea
`AI proposes -> command engine validates & executes -> document model stores truth -> Fabric.js renders`

## Repo layout
```
frontend/   React editor
backend/    FastAPI service (later)
docs/       product + architecture docs
CLAUDE.md   instructions for AI coding assistants
```

## Docs
See [`docs/`](docs/): PRODUCT_SPEC, ARCHITECTURE, COMMAND_REGISTRY, SPRINT_1, ROADMAP, TESTING, DESIGN_SYSTEM, DECISIONS.

## Git workflow
Single dev branch `feat/sprint-1-editor`, small meaningful commits (`chore:`, `feat:`, `test:`).
