# Gnome Tavern submission draft (ready to paste; NOT yet submitted)

**Project name:** Taproom
**Tagline:** A funded-at-creation bounty board on Gno.land. The reward is locked in the realm when the quest is posted.

## Links
- Repo (public): https://github.com/yunnaysy/taproom-gno
- Deployment (Onyx testnet, onyx-1): `gno.land/r/g1jacahne0v3s27d6g872s8qu30ryvuec3lzsjej/taproom`
- gnoweb: https://onyx.testnets.gno.land/r/g1jacahne0v3s27d6g872s8qu30ryvuec3lzsjej/taproom
- Live UI: https://taproom-gno.vercel.app
- Demo video: <YOUTUBE_URL_PLACEHOLDER> (file: `video/taproom-demo.mp4`)

## Short description
Small bounties often depend on an informal promise: the poster promises to pay, and the hunter hopes they will. Taproom changes that arrangement. A poster funds the bounty when creating a quest, locking the reward in a Gno.land realm. Only a recorded submitter can receive the award, and the payout is an on-chain transfer in the same transaction.

Taproom does not guarantee that every submission gets paid. The poster alone chooses whether and whom to award, there is no dispute resolution, and a poster can reclaim the reward after the deadline plus a **Seven-Day Review Window**, even when answers exist. The window only stops a poster from withdrawing immediately after someone submits; with no answers, a poster can withdraw at any time.

## Contract safety and accounting
- **Funding:** `PostQuest` requires `cur.Previous().IsUserCall()` and exactly one attached coin of `ugnot`, at least 1 GNOT.
- **Authorization:** only the poster can award or reclaim. The award recipient must have a recorded submission.
- **Replay:** award and reclaim need status Open, so double award, double reclaim and award-then-reclaim abort.
- **Accounting:** `totalEscrow` rises by the reward on post and falls by the reward on award or reclaim. Before each payout the realm checks that its ugnot balance is at least the escrow it owed before that payout (`balance >= totalEscrow`). It is not an equality and is not checked at post time.
- **Output handling:** user text is escaped for Markdown and JSON; links must be plain `https://`.

## Evidence
**Local GnoVM tests (mocked chain):** 13 tests in `realm/taproom_test.gno` (`gno test -v`), listed by name with what each checks in the README. One test covers a code-realm caller being rejected; a real `maketx run` ephemeral realm is not simulated.

**Live Onyx transactions (onyx-1, RPC https://rpc.onyx.testnets.gno.land:443):**

| Action | Signer | Height | Transaction | Effect |
| --- | --- | --- | --- | --- |
| addpkg (deploy) | poster | 1450746 | [`Cxi+V4K4BpeBdrNmzK2szlSOpN9+EbMAS9Al6Uz5dxQ=`](https://rpc.onyx.testnets.gno.land/tx?hash=0x0b18be5782b806978176b366ccadacce548ea4df7e11b3004bd025e94cf97714) | Realm published at the path below |
| PostQuest #1 | poster | 1450792 | [`Q+ThDj8gAuqSlkTGE45VJcLUbEB5T9lKSSc/GSy3DoA=`](https://rpc.onyx.testnets.gno.land/tx?hash=0x43e4e10e3f2002ea929644c6138e5525c2d46c40794fd94a49273f192cb70e80) | 5 GNOT locked; escrow 5 |
| PostQuest #2 | poster | 1450793 | [`g0GpXL617/jnQZXHykbWhmjg/2O5HmdMCW2VUSSffnc=`](https://rpc.onyx.testnets.gno.land/tx?hash=0x8341a95cbeb5eff8e74195c7ca46d68668e0ff63b91e674c096d9551249f7e77) | 3 GNOT locked; escrow 8 |
| Submit on #1 | hunter | 1458938 | [`jFw4BZQ2+ZQJzHGCGDhS4gqZcHxo9AtWF+D9X+wpYYM=`](https://rpc.onyx.testnets.gno.land/tx?hash=0x8c5c38059436f99409cc7182183852e20a99707c68f40b5617e0fd5fec296183) | 1 answer recorded; escrow unchanged (8) |
| Award #1 to hunter | poster | 1458941 | [`JivdF2ZLgOjME+Wc/04M6ebDyV+4JQ6BsFVLcS1UGY0=`](https://rpc.onyx.testnets.gno.land/tx?hash=0x262bdd17664b80e8cc13e59cff4e0ce9e6c3c95fb8250e81b0554b712d54198d) | 5 GNOT paid to hunter; escrow 3; paid total 5 |
| Reclaim #2 (no answers) | poster | 1458943 | [`YP4FU5N1rWv+bY7akwIGFOT1p45bvIBf63Sk2regz0s=`](https://rpc.onyx.testnets.gno.land/tx?hash=0x60fe05539375ad6bfe6d8eda93020614e4f5a78e5bbc805feb74a4dab7a0cf4b) | 3 GNOT refunded to poster; escrow 0 |
| PostQuest #3 | poster | 1458949 | [`U3p2xu3iwS7Au2zmjVD8oHFdRYRF5GyoWTHxCzSHABA=`](https://rpc.onyx.testnets.gno.land/tx?hash=0x537a76c6ede2c12ec0bb6ce68d50fca0715d458445e46ca85931f10b34870010) | 2 GNOT locked; escrow 2; quest left open |

Poster `g1jacahne0v3s27d6g872s8qu30ryvuec3lzsjej`, hunter `g1g4c3zh3vh7dvn9lvrcxemgfvfujtlkhw2vczk4`. Final state: quest #1 awarded, #2 reclaimed, #3 open with 2 GNOT escrowed, 5 GNOT paid out.

## Honest notes for judges
- Both accounts are throwaway test keys controlled by the author; the hunter answer on quest #1 demonstrates the flow and is not an independent result.
- The 7-day review window is covered by a local test only; it was not demonstrated on Onyx.
- The web UI is a live read-only view plus a generator of `gnokey` commands. Transactions are signed with gnokey, outside the browser. No wallet-extension integration, no GRC20 rewards.
- Rewards are testnet GNOT.

## Demo video script (about 99 s, no audio, English captions; matches `video/taproom-demo.mp4`)
| Time | On screen | Message |
| --- | --- | --- |
| 0:00-0:05 | Title card | Taproom: a funded-at-creation bounty board on Gno.land (Onyx testnet, CLI-signed, live web view) |
| 0:05-0:14 | Problem card | Bounties depend on a promise. Taproom locks the reward in the realm at creation and only pays a recorded submitter. It is not a guarantee: the poster decides and there is no dispute process. |
| 0:14-0:47 | Recording of the live UI (taproom-gno.vercel.app) | Live read of the Onyx realm: stats, board, quest #3 open, #2 reclaimed, #1 awarded; quest detail with the recorded answer; the UI generates a gnokey command and signing happens outside the browser; lifecycle section |
| 0:47-0:56 | Live Onyx card: deploy and post | addpkg and PostQuest transactions with heights and hashes |
| 0:56-1:07 | Live Onyx card: submit and award | Submit then Award (5 GNOT paid). Disclosure: both keys are throwaway test keys controlled by the author |
| 1:07-1:16 | Live Onyx card: reclaim | Reclaim of a quest with no answers (3 GNOT back). States that the 7-day window with answers was not demonstrated live and is covered by a local test |
| 1:16-1:24 | Local GnoVM tests card | 13 passing tests, labelled as local and mocked, not Onyx |
| 1:24-1:33 | Design and limits card | What is enforced (IsUserCall funding, one ugnot coin of at least 1 GNOT, balance >= escrow before payouts, escaping, https-only links) and what is not (no dispute process, auto-award, hunter guarantee or wallet extension) |
| 1:33-1:39 | End card | Live UI, realm path, repo URL, testnet only |
