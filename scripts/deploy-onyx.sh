#!/usr/bin/env bash
# Deploy Taproom to the Gno.land Onyx testnet (onyx-1).
# Needs a funded key in your local gnokey keybase (faucet: https://faucet.gno.land).
# Usage: scripts/deploy-onyx.sh <key-name>
set -euo pipefail
KEY=${1:?usage: deploy-onyx.sh <key-name>}
ADDR=$(gnokey list | awk -v k="$KEY" '$2==k {print $6}')
[ -n "$ADDR" ] || { echo "key '$KEY' not found in gnokey list"; exit 1; }
PKG="gno.land/r/$ADDR/taproom"
TMP=$(mktemp -d); cp realm/*.gno "$TMP"/
printf 'module = "%s"\ngno = "0.9"\n' "$PKG" > "$TMP/gnomod.toml"
rm -f "$TMP"/*_test.gno          # tests are not deployed
echo "Deploying $PKG as $KEY ..."
PWFLAG=(); [ -n "${GNOKEY_PW:-}" ] && PWFLAG=(-insecure-password-stdin)
echo "${GNOKEY_PW:-}" | gnokey maketx addpkg -pkgpath "$PKG" -pkgdir "$TMP" \
  -gas-fee 1000000ugnot -gas-wanted 100000000 -broadcast \
  -chainid onyx-1 -remote https://rpc.onyx.testnets.gno.land:443 "${PWFLAG[@]}" "$KEY"
echo
echo "Deployed. Put this in web/config.js (onyx.realm): $PKG"
echo "View it: https://onyx.testnets.gno.land/r/${ADDR}/taproom"
