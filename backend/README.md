# VoiceCanvas Backend

Not implemented in Sprint 1. Placeholder for the planned service.

## Planned stack
Python · FastAPI · WebSockets · PostgreSQL · Cloudflare R2

## Planned responsibilities
- Receive transcribed instructions + compact `EditorContext`
- Call the configured cloud LLM (provider abstraction) and return an `AgentResponse`
  (`ready` | `clarification_required` | `unsupported`) with allowlisted operations
- Persist documents and user data; store uploads/exports in R2

## Rules
- LLM API keys stay server-side only
- Validate all incoming requests; rate-limit; restrict upload size/type
- Never execute LLM-generated code; only return structured operations
