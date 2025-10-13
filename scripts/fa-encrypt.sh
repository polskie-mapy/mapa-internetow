#!/bin/bash
set -e

if [ -z "$FA_ENCRYPTION_KEY" ]; then
  echo "Error: FA_ENCRYPTION_KEY not set"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENCRYPTED_DIR="$PROJECT_DIR/.fontawesome-encrypted"
NODE_MODULES="$PROJECT_DIR/node_modules"

FA_PACKAGES=("@fortawesome/pro-regular-svg-icons" "@fortawesome/pro-solid-svg-icons")

mkdir -p "$ENCRYPTED_DIR"

for package in "${FA_PACKAGES[@]}"; do
  [ ! -d "$NODE_MODULES/$package" ] && echo "Error: $package not found" && exit 1
  output="$ENCRYPTED_DIR/$(echo $package | tr '/' '-').tar.gz.enc"
  (cd "$NODE_MODULES" && tar -czf - "./$package") | openssl enc -aes-256-cbc -salt -pbkdf2 -pass env:FA_ENCRYPTION_KEY -out "$output"
  echo "✓ $package"
done

echo "Done. Commit .fontawesome-encrypted/ to repo"
