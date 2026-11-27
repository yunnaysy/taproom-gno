#!/usr/bin/env bash
# End-to-end run against a LOCAL gnodev chain with throwaway keys.
# Usage: GNOHOME=/tmp/taproom-localkeys scripts/local-e2e.sh   (after: gnodev in ./realm)
set -euo pipefail
PKG=${PKG:-gno.land/r/dev/taproom}
REMOTE=${REMOTE:-127.0.0.1:26657}
CHAIN=${CHAIN:-dev}
call() { # key func send args...
  local key=$1 fn=$2 send=$3; shift 3
  local args=(); for a in "$@"; do args+=(-args "$a"); done
  local sendflag=(); [ -n "$send" ] && sendflag=(-send "$send")
  echo pw | gnokey maketx call -pkgpath "$PKG" -func "$fn" "${args[@]}" "${sendflag[@]}" \
    -gas-fee 1000000ugnot -gas-wanted 30000000 -broadcast -chainid "$CHAIN" -remote "$REMOTE" \
    -insecure-password-stdin "$key" 2>&1 | grep -E "^\(|OK!|panic|error|Error" || true
}
HUNTER1=$(gnokey list | awk '/hunter1/{print $6}')
HUNTER2=$(gnokey list | awk '/hunter2/{print $6}')
call poster PostQuest 5000000ugnot "Write a Bahasa Indonesia guide to deploying a first realm" "A clear 600-word walkthrough: install gnodev, write a realm, deploy it to the testnet. Plain markdown, original work." 14
call poster PostQuest 2000000ugnot "Design a logo for a local meetup" "Square SVG, monochrome, readable at 32px." 7
call poster PostQuest 1500000ugnot "Test the board and report a bug" "Break it on purpose. Report what you tried." 3
call hunter1 Submit "" 1 "Draft is in the doc linked here." "https://example.org/draft"
call hunter2 Submit "" 1 "Alternative walkthrough with screenshots." ""
call hunter1 Submit "" 2 "Two SVG options attached." "https://example.org/logos"
call poster Award "" 1 "$HUNTER1"
call poster Reclaim "" 3
