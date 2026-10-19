#!/usr/bin/env bash
# Sync GitHub Actions env vars → SST secrets for the given stage.
# Usage: STAGE=production bash .github/scripts/ci-set-sst-secrets.sh
set -euo pipefail

STAGE="${STAGE:?Set STAGE (e.g. production or staging)}"
SST_BIN=(pnpm exec sst)

require_var() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    echo "::error::Missing required secret/env: $name (add it in GitHub Actions secrets)"
    exit 1
  fi
}

set_secret() {
  local sst_name="$1"
  local value="$2"
  echo "Setting SST secret ${sst_name} (stage=${STAGE})"
  "${SST_BIN[@]}" secret set "$sst_name" "$value" --stage="$STAGE" --print-logs
}

require_var GROQ_API_KEY
require_var SKRIBBY_API_KEY
require_var CLERK_SECRET_KEY
require_var CLERK_WEBHOOK_SECRET
require_var DEEPGRAM_API_KEY
require_var SKRIBBY_WEBHOOK_SECRET
require_var WEBHOOK_ACCESS_TOKEN
require_var GOOGLE_OAUTH_CLIENT_ID
require_var GOOGLE_OAUTH_CLIENT_SECRET
require_var TOKEN_ENCRYPTION_KEY
require_var PRIVACY_DELETION_SECRET

set_secret GroqApiKey "$GROQ_API_KEY"
set_secret SkribbyApiKey "$SKRIBBY_API_KEY"
set_secret ClerkSecretKey "$CLERK_SECRET_KEY"
set_secret ClerkWebhookSecret "$CLERK_WEBHOOK_SECRET"
set_secret DeepgramApiKey "$DEEPGRAM_API_KEY"
set_secret SkribbyWebhookSecret "$SKRIBBY_WEBHOOK_SECRET"
set_secret WebhookAccessToken "$WEBHOOK_ACCESS_TOKEN"
set_secret GoogleOauthClientId "$GOOGLE_OAUTH_CLIENT_ID"
set_secret GoogleOauthClientSecret "$GOOGLE_OAUTH_CLIENT_SECRET"
set_secret TokenEncryptionKey "$TOKEN_ENCRYPTION_KEY"
set_secret PrivacyDeletionSecret "$PRIVACY_DELETION_SECRET"

echo "All SST secrets set for stage ${STAGE}"
