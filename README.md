# Taproom

**An escrowed bounty board on Gno.land.** Pin a quest, lock the reward in the realm, pay the best answer.

Built for the [Gnome Tavern hackathon](https://dorahacks.io/hackathon/gnome-tavern/). Written in Gno, with a dependency-free web front end that reads the chain live.

> Status: realm, tests and front end are finished and verified on a local `gnodev` chain. Deployment to the Onyx testnet is the one remaining step (see [DEPLOY.md](DEPLOY.md)). Screenshots in `screenshots/` come from a local chain seeded with example quests, not from the testnet.

## Why

Small bounties ("translate this page", "review my realm", "design a 32px logo") usually run on trust: the poster promises to pay, the hunter hopes. Taproom removes the trust. The reward is locked in the realm when the quest is pinned, the poster can only release it to someone who actually submitted, and a poster who goes silent cannot take the money back while hunters are waiting.

## How it works

| Step | Call | Rule |
| --- | --- | --- |
| Pin | `PostQuest(title, details, days)` with `-send` ugnot | direct user call only, exactly one coin type (ugnot), at least 1 GNOT, 1–60 day window |
| Answer | `Submit(id, note, link)` | one answer per address, poster cannot answer own quest, window must be open, link must be plain `https://` |
| Award | `Award(id, hunter)` | poster only, hunter must have submitted, escrow is paid in the same transaction |
| Reclaim | `Reclaim(id)` | poster only. No answers: any time. With answers: after the window plus a 7-day review period |

`Render("")` gives a board in gnoweb. `Render("quest/<id>")`, `Render("hunter/<addr>")` (reputation card), `Render("about")` and `Render("json")` (machine-readable, used by the web front end) are also served.

## Safety design

Each point is covered by a test in [`realm/taproom_test.gno`](realm/taproom_test.gno):

- **Only real payments count.** `PostQuest` rejects anything that is not a direct `maketx call`, because `OriginSend()` only describes a real receipt for a pure EOA caller.
- **No stranded funds.** Exactly one coin (ugnot) is accepted, so no other denomination can get stuck in the realm.
- **Checks, effects, interactions.** State changes before coins move, so a payout cannot be replayed (`Award` twice, `Award` then `Reclaim`, `Reclaim` twice all abort).
- **Escrow invariant.** `totalEscrow` is tracked, and every payout asserts the realm balance covers everything it owes.
- **Hunters are protected.** A poster cannot reclaim while answers exist until the review period is over.
- **No injection.** Titles, details and notes are escaped before markdown rendering; links must pass a strict `https://` allow-list; JSON output escapes quotes, backslashes and control characters.
- **No aliasing.** The public API returns values (ints, strings), never pointers into realm state.

## Repo layout

```
realm/      the Gno realm (taproom.gno, render.gno) and 12 tests
web/        static front end (no build step): index.html, styles.css, app.js, config.js
scripts/    local-e2e.sh (local chain), deploy-onyx.sh (testnet)
screenshots/  front end against a local chain
```

## Run it

```sh
# toolchain
curl -fsSL https://raw.githubusercontent.com/gnolang/gno/master/misc/install.sh | sh
export PATH=$HOME/.gno/bin:$PATH

# tests (needs a Gno checkout for GNOROOT/examples; the installed binary alone also works on recent versions)
cd realm && gno test -v .

# local chain + gnoweb at http://localhost:8888/r/dev/taproom
gnodev .

# front end (reads the local chain by default; pick "Onyx testnet" after deploying)
cd ../web && python3 -m http.server 4173
```

## Front end

Pure white page, charcoal text, frosted-glass cards and a floating pill nav. It calls the node's JSON-RPC (`vm/qrender` with the `json` route), shows live stats, a filterable board and a detail sheet with answers. Posting, answering, awarding and reclaiming generate a ready-to-run `gnokey maketx call` command: private keys never touch the page. All user text is inserted with `textContent`.

## Known limits

- Rewards are native ugnot only. GRC20 rewards are a natural next step.
- No dispute process: the poster decides, and the only protection for hunters is the review period. That is deliberate for a first version.
- No in-browser wallet integration yet (commands are copied for `gnokey`).
- Verified against the Gno v1.8.0 toolchain; the Onyx testnet reports v1.0.0-rc.0, whose stdlib surface (`chain/banker`, `chain/runtime/unsafe`, `cur realm`) matches what this realm uses, but the deployment itself has not been done yet.

## License

MIT
