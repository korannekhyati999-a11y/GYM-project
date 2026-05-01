#!/usr/bin/env bash
# Generates a release keystore and prints the base64 value to add as a GitHub secret.
# Run ONCE locally, then never again — keep the .jks file safe.
# Usage: bash scripts/generate-keystore.sh

set -e

KEYSTORE="android/app/release.keystore"
ALIAS="skyfit"
STOREPASS="skyfit2025"
KEYPASS="skyfit2025"
DNAME="CN=SkyFit, OU=Mobile, O=SkyFit Gym, L=Mumbai, ST=MH, C=IN"
VALIDITY=10000

echo "Generating keystore at $KEYSTORE..."

keytool -genkeypair \
  -v \
  -keystore "$KEYSTORE" \
  -alias "$ALIAS" \
  -keyalg RSA \
  -keysize 2048 \
  -validity "$VALIDITY" \
  -storepass "$STOREPASS" \
  -keypass "$KEYPASS" \
  -dname "$DNAME"

echo ""
echo "✅ Keystore generated."
echo ""
echo "─── GitHub Secrets to add ───────────────────────────────────────────────"
echo "KEYSTORE_BASE64 (copy the full output below):"
base64 -w 0 "$KEYSTORE"
echo ""
echo ""
echo "KEYSTORE_PASSWORD: $STOREPASS"
echo "KEY_ALIAS:         $ALIAS"
echo "KEY_PASSWORD:      $KEYPASS"
echo ""
echo "─────────────────────────────────────────────────────────────────────────"
echo "Add these 4 secrets at: GitHub repo → Settings → Secrets → Actions"
echo "⚠️  Keep $KEYSTORE safe — losing it means you can't update your app!"
