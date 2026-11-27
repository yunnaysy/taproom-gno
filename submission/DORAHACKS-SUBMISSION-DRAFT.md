# Gnome Tavern submission draft (NOT submitted)

**Project name:** Taproom   (no "Gno" prefix)
**Tagline:** An escrowed bounty board on Gno.land: pin a quest, lock the reward, pay the best answer.

**Links**
- Deployment (Onyx testnet, onyx-1): gno.land/r/g1jacahne0v3s27d6g872s8qu30ryvuec3lzsjej/taproom
  gnoweb: https://onyx.testnets.gno.land/r/g1jacahne0v3s27d6g872s8qu30ryvuec3lzsjej/taproom
- Live UI: https://taproom-gno.vercel.app
- Repo: https://github.com/yunnaysy/taproom-gno (currently PRIVATE; must be public at submission)
- Demo video: <YouTube URL after upload; file: video/taproom-demo.mp4, 101 s>

**Short description**
Small bounties usually run on trust. Taproom removes it. A poster pins a quest and locks a GNOT reward in the realm. Hunters send one answer each. The poster awards a winner and the escrow is paid in the same transaction. If nobody answers, the poster can take the reward back; if hunters have answered, the poster must wait for the deadline plus a 7-day review window, so a silent poster cannot starve people who delivered.

The realm enforces direct-user-call funding, a single coin type, a minimum reward, checks-effects-interactions ordering and an escrow invariant checked on every payout. User text is escaped for markdown and JSON. 12 Gno tests cover the rules, including replay, wrong-caller and injection cases. A dependency-free web UI reads the realm over JSON-RPC and generates ready-to-run gnokey commands, so keys never touch the page.

On Onyx the full flow is on-chain: 3 quests posted, 1 answered and awarded (5 GNOT paid out), 1 reclaimed (3 GNOT refunded), 1 left open. Transaction hashes: onchain/DEPLOYMENT.md.

**Honest notes for judges:** the hunter answer on quest #1 comes from a second test key controlled by the author to demonstrate the flow; rewards are testnet GNOT; no GRC20 rewards or wallet extension yet.
