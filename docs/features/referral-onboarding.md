# Referral Onboarding

## Overview

The Referral Onboarding feature gates access to the app behind a referral code from an existing user. New, authenticated users who are not yet present in the referral backend are prompted with a modal to enter a valid referral code. Upon successful validation and registration, the user gains full access and the onboarding flow completes.

## 🎯 Goals

-   **Gate access for new users**: Require a referral code for first-time users not found in the referral system.
-   **Deep-link support**: Accept `?ref=CODE` in the URL to prefill and use during onboarding.
-   **Code validation & registration**: Validate referral codes before registering users.
-   **Smooth UX**: Non-blocking checks, clear errors, and safe retries.

## 🚀 User Flow

1. User signs in (Privy). If the user is new to the referral system, show the “Referral Code Required” modal.
2. If the page URL contains `?ref=CODE`, it is auto-populated.
3. User enters a referral code and submits.
4. App validates the code via `/api/referral/validate`.
5. If valid, app registers the user via `/api/user/referral/register`.
6. On success, the modal closes and the user proceeds normally.

## 🔌 Integration Points

-   `app/layout.tsx`: mounts global `ReferralGate` component and sets up providers via `ContextProviders`.
-   `context/index.tsx`: wraps app with `ReferralGateProvider` so children can access gate state.
-   `context/ReferralGateContext.tsx`: stores referral code, modal visibility, and new-user state; reads `?ref` from URL.
-   `components/global/ReferralGate.tsx`: orchestrates checks, opens modal, and handles successful registration.
-   `components/modal/ReferralCodeRequiredModal.tsx`: UI and submission for referral code.

## 🧩 Key Components

### ReferralGateProvider

-   Provides:
    -   `referralCode`, `setReferralCode`
    -   `showReferralModal`, `setShowReferralModal`
    -   `isNewUser`, `setIsNewUser`
-   Reads `ref` from query params when authenticated and stores it in context.

### ReferralGate (Global)

-   On first authenticated session, calls `/api/user/referral` to determine if user exists.
-   If 404, sets `isNewUser` and opens the modal.
-   Tracks local state to avoid repeated checks and to sequence UI behavior.
-   Emits window events to coordinate other onboarding UIs:
    -   `referral-modal-open` when checking or modal is open
    -   `referral-completed` when registration succeeds

### ReferralCodeRequiredModal

-   Validates user input and calls validation mutation.
-   States reflected in the CTA: “Validating…”, “Registering…”.
-   On success, calls back to `ReferralGate` to register user and close the modal.

## 🧠 Hooks

-   `useUserReferralCheck`

    -   GET `/api/user/referral`
    -   Returns 404 for non-existent users, treated as new user flow.

-   `useReferralValidation`
    -   POST `/api/referral/validate` with `{ referralCode }`
    -   Expects `{ valid: boolean, data?.exists: boolean }`

## 🌐 API Endpoints (Next.js Route Handlers)

### Validate Referral Code

```typescript
POST /api/referral/validate

Request: { referralCode: string }
Success (200): { valid: true, referralCode: string, data: { exists: true, referCode: string, user: { privyId: string, referCode: string, isKol: boolean } } }
Error  (400/404): { valid: false, error: string }
```

Notes:

-   Proxies to `GET {REFERRAL_BACKEND_API_URL}/user/refer-code/{code}/exists` with `x-api-key`.

### Check User Referral Status

```typescript
GET /api/user/referral

Success (200): { data: BackendUserPayload }
Not Found (404): { error: 'User not found in referral system' }
Unauthorized (401): { error: 'Unauthorized' }
```

Notes:

-   Proxies to `GET {REFERRAL_BACKEND_API_URL}/user/{privyId}` with `Authorization: Bearer {accessToken}` and `x-api-key`.
-   Backend success code `0` indicates existence.

### Register User With Referral Code

```typescript
POST /api/user/referral/register

Request: { referrerCode: string }
Success (200): { data: BackendRegisterResponse }
Unauthorized (401): { error: 'Unauthorized' }
```

Notes:

-   Proxies to `POST {REFERRAL_BACKEND_API_URL}/user/register` with `{ privyId, referrerCode }`, and required headers.
-   Sentry captures failures and tags `referral_register_status`.

### Update User Refer Code (Customize)

```typescript
POST /api/user/referral/update-code

Request: { newReferCode: string }
Success (200): { data }
Errors: 401 unauthorized; 500 with message when code exists or generic error.
```

Notes:

-   Proxies to `POST {REFERRAL_BACKEND_API_URL}/user/{privyId}/refer-code`.
-   Errors mapped; 6016803003 surfaces as “Referral code already exists.”
-   Sentry tags `referral_update_code_status` on failure.

## 🔐 Authentication & Env

-   Auth via Privy; server routes call `getPrivyUser()` for `userId` and `accessToken`.
-   Required env vars:
    -   `REFERRAL_BACKEND_API_URL`
    -   `REFERRAL_BACKEND_API_KEY`

## 🧭 Deep Link Handling

-   `?ref=CODE` captured in `ReferralGateProviderInner` and stored in context.
-   Prefills modal input and can be directly used for registration after validation.

## 🧩 UX Details

-   Modal is non-dismissable by outside click to ensure completion or logout.
-   Top-right logout button allows user to exit and re-auth as needed.
-   Input disabled during validation/registration to prevent double submits.
-   Error toasts/messages for invalid code or failed registration.

## 📣 Cross-Feature Coordination

-   While the modal is open or checking, `localStorage['crush_intro_news_trading_page'] = 'true'` is set and `referral-modal-open` event fires to pause other tutorials.
-   After successful registration, the flag is cleared and `referral-completed` event fires to resume tutorials (e.g., News Trading Intro).

## 🧪 Edge Cases

-   User logs in with a different email: local state and `lastUserEmail` reset; flow re-evaluates.
-   User logs out: modal and local referral state reset.
-   Backend 404 on user check: treated as new user (expected for first-time users).
-   Network errors during validate/register: show error, allow retry.

## 📦 Implementation References

-   `app/layout.tsx` mounts `ReferralGate` and `ContextProviders`.
-   `context/index.tsx` includes `ReferralGateProvider` in the provider tree.
-   `context/ReferralGateContext.tsx` manages referral state and query param.
-   `components/global/ReferralGate.tsx` handles checks, modal control, registration, and events.
-   `components/modal/ReferralCodeRequiredModal.tsx` provides the UI and validate-submit.
-   API routes under `app/api/referral` and `app/api/user/referral/*` integrate with the backend.

## 🧰 Developer Notes

-   Prefer using `axiosLib` (configured client) for app-side calls.
-   Keep the referral modal shown only when strictly necessary; set `hasCheckedUser` to avoid loops.
-   Ensure Sentry environment is configured to capture referral failures.
-   When adding new UIs that depend on onboarding completion, listen for `referral-modal-open` / `referral-completed` events.

## 🚨 Troubleshooting

-   “Invalid referral code”: The backend returned not found or code ≠ 0 in validate; user should try a different code.
-   “Unauthorized”: Ensure user is authenticated; Privy token available server-side.
-   “Referral code already exists.” when updating code: choose a different unique code.
-   No modal appears for a new user: verify provider order and that `/api/user/referral` returns 404.
