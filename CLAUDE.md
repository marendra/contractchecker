# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ContractChecker.net - A SvelteKit application with Firebase backend that helps users analyze contracts for red flags. The system uses AI workers (Python Cloud Run) for OCR, entity investigation, and contract auditing.

## Tech Stack

**Frontend**: SvelteKit 5, Svelte 5, TailwindCSS v4, TypeScript, deployed on Cloudflare
**Backend**: Firebase Functions v2 (Node.js 24), TypeScript
**Auth**: Firebase Auth (magic link + Google OAuth)
**Database**: Firestore (`contract-checker`)
**Storage**: Cloudflare R2 (via signed URLs)
**Queue**: Google Cloud Tasks → triggers Python Cloud Run AI workers
**Email**: Resend

## Project Structure

```
contractchecker/
├── src/                    # SvelteKit frontend
│   ├── routes/            # SvelteKit file-based routing
│   │   ├── (protected)/   # Protected routes (require session cookie)
│   │   ├── (public)/      # Public marketing/auth pages
│   │   ├── api/           # Internal API endpoints
│   │   └── sitemap.xml/   # Dynamic sitemap
│   ├── lib/               # Shared utilities and components
│   │   ├── components/ui/ # shadcn-svelte-style UI components
│   │   └── firebaseclient.ts # Firebase client SDK lazy-loading
│   └── hooks.server.ts    # Session-based auth middleware
├── functions/             # Firebase Cloud Functions (Backend API)
│   └── src/index.ts       # All Firebase functions (waitlist, OTP, R2, orchestration)
├── static/               # Static assets
└── firebase.json         # Firebase Functions config
```

## Commands

### Frontend (SvelteKit)
```sh
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview production build
npm run check            # TypeScript type checking
npm run check:watch      # Watch mode type checking
```

### Backend (Firebase Functions)
```sh
cd functions
npm run build            # Compile TypeScript
npm run lint             # Lint code
npm run serve            # Local Firebase emulator
npm run deploy           # Deploy functions
npm run logs             # View function logs
```

## Key Architecture Decisions

### Route Protection
- `(protected)/` routes are guarded by `src/hooks.server.ts`
- Protected routes require a `session_uid` cookie
- Unauthenticated users are redirected to `/login`

### Auth Flow
1. Magic link emails sent via Firebase Auth (`sendSignInLinkToEmail`)
2. After sign-in, Firebase sets an HTTP-only cookie (`session_uid`)
3. `hooks.server.ts` validates this cookie on protected routes

### Contract Processing Pipeline
Contracts flow through Firestore document status updates:
1. **uploaded** → User uploads PDF to R2 via signed URL
2. **queued** → Triggers `contractOrchestrator` → Cloud Tasks → OCR worker
3. **investigating** → User confirms entity name → Perplexity background check
4. **auditing** → Perplexity report complete → Final audit
5. **completed** / **error**

The `contractOrchestrator` Firebase Function listens to `users/{userId}/contracts/{contractId}` Firestore documents and dispatches tasks to Python Cloud Run workers via Google Cloud Tasks.

### Firebase Functions Secrets
Required secrets (set via `firebase functions:secrets:set`):
- `CLOUD_RUN_URL` - Python AI workers base URL
- `SERVICE_ACCOUNT_EMAIL` - Service account for Cloud Tasks OIDC
- `RESEND_API_KEY` - Email delivery
- `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`, `R2_BUCKET_NAME` - R2 uploads

### Firestore Data Model
```
users/{userId}/
  contracts/{contractId}/  # Contract documents with status field
        {fileName)         # pdf file name
        {ocr_result}       #content of contractokay 
  devices/{deviceId}       # Trusted devices for OTP auth

waitlist/{docId}          # Waitlist entries

otp_codes/{uid}          # Temporary OTP codes (5 min expiry)
```

## Environment Variables

Frontend reads from `.env` (not committed):
- `PUBLIC_*` vars exposed to client
- Firebase config values

Functions read from Firebase Secrets (not `.env`).

## UI Components

Components in `src/lib/components/ui/` follow shadcn-svelte patterns. Run `npm run check` after modifying to catch type errors.