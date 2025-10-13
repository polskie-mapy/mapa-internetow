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

[ ! -d "$ENCRYPTED_DIR" ] && echo "Error: $ENCRYPTED_DIR not found" && exit 1

mkdir -p "$NODE_MODULES/@fortawesome"

for package in "${FA_PACKAGES[@]}"; do
  encrypted="$ENCRYPTED_DIR/$(echo $package | tr '/' '-').tar.gz.enc"
  [ ! -f "$encrypted" ] && echo "Error: $encrypted not found" && exit 1
  openssl enc -aes-256-cbc -d -salt -pbkdf2 -pass env:FA_ENCRYPTION_KEY -in "$encrypted" | (cd "$NODE_MODULES" && tar -xzf -)
done
