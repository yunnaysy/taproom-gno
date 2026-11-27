# **Taproom — strict Gno.land judge review**

Strong concept

Needs technical proof

Submission credibility risks

My verdict: **Taproom has a legitimate hackathon concept, a reasonably clear on-chain mechanism, and something many hackathon submissions lack: an actual deployed application with transaction evidence.** However, the current presentation is more confident about its security guarantees than the documentation allows a judge to verify.

The biggest opportunity isn't adding more features. It's making the existing implementation easier to audit, demonstrating why the Gno realm is essential, and removing language that sounds like a security guarantee without explaining its boundaries.

I'm judging the supplied README, submission draft, and video outline as written. I haven't independently inspected the repository or executed the tests, so I won't certify the underlying implementation.

## **1. Judge's scorecard**

These are my provisional scores for the presentation and evidence, not verified implementation scores.

| Criterion         | Weight   | Provisional score | Assessment                                                       |
| ----------------- | -------- | ----------------- | ---------------------------------------------------------------- |
| Technical quality | 40%      | 29/40             | Good escrow design, but security claims need stronger proof      |
| User appeal       | 20%      | 14/20             | Clear use case, but CLI-based interaction creates friction       |
| Creativity        | 20%      | 15/20             | Review-window mechanism is a meaningful design decision          |
| Docs and demo     | 20%      | 14/20             | Good structure and evidence, but missing reproducibility details |
| **Total**         | **100%** | **72/100**        | **Competitive foundation, not yet a top-tier presentation**      |

The score assumes the described tests, deployment, and transaction history are genuine.

### **What I like as a judge**

1. The escrow is funded when the quest is created, rather than relying on a poster's promise.
2. The poster cannot simply reclaim funds immediately after someone submits an answer.
3. The contract has explicit restrictions around payment denomination and replay.
4. There is a deployed Onyx testnet application.
5. You acknowledge that the second hunter account is controlled by the author. That's good disclosure.

The review period is particularly interesting. It addresses a real weakness in simple bounty marketplaces: a poster can receive work and then disappear.

That is a stronger differentiator than simply calling Taproom an escrowed bounty board.

## **2. Claims that are overstated or unsupported**

This is the most important section. A technical judge will distinguish between a mechanism that exists, a mechanism that has been tested, and a guarantee that has actually been established.

| Current claim                                                       | Judge's concern                                                                                                                                | Recommended correction                                                                  |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| "Taproom removes [trust]."                                          | It removes some payment risk, not all trust requirements. The poster still chooses the winner.                                                 | "Taproom removes the need to trust a poster to fund a bounty before work begins."       |
| "The poster can only release it to someone who actually submitted." | Good, but doesn't establish that the answer is useful or deserves payment.                                                                     | "The realm restricts awards to addresses with a recorded submission."                   |
| "A silent poster cannot starve people who delivered."               | Too strong. Reclaim becomes possible after the review period, even when submissions exist.                                                     | "Submissions prevent immediate reclamation and trigger a seven-day review delay."       |
| "No stranded funds."                                                | Accepting one denomination prevents unsupported denominations from being trapped, but doesn't establish that every possible state has an exit. | "The realm accepts only native ugnot and tracks outstanding escrow liabilities."        |
| "Escrow invariant."                                                 | A balance check is not automatically proof of a complete accounting invariant.                                                                 | Show the actual invariant and how each transition preserves it.                         |
| "Each point is covered by a test."                                  | A test can cover an intended case without establishing that the implementation is secure against all variants.                                 | List the exact test names and their coverage.                                           |
| "No injection."                                                     | Escaping HTML/Markdown and JSON is good defensive engineering, but this isn't proof against every injection or rendering issue.                | "Output handling includes Markdown escaping, HTTPS validation and JSON escaping."       |
| "The full flow is on-chain."                                        | This is plausible, but the judge needs to distinguish actual transaction history from locally simulated activity.                              | Give each transaction hash, action, amount and resulting state.                         |
| "Private keys never touch the page."                                | This describes the frontend architecture, not a complete security audit.                                                                       | "The frontend generates CLI commands; transaction signing remains outside the browser." |

### **Three particularly important technical issues**

**A. The reclaim mechanism weakens your strongest marketing claim.**

Consider this scenario:

1. Alice posts a bounty and deposits 5 GNOT.
2. Bob submits a valid answer.
3. Alice disappears.
4. The deadline passes.
5. The seven-day review period passes.
6. Alice can reclaim the 5 GNOT.

Bob has completed the work but hasn't received payment.

This is not necessarily a contract bug. It is a product-design trade-off. But your current messaging implies stronger hunter protection than the mechanism actually provides.

I'd make the distinction explicit:

- Immediate withdrawal is blocked once submissions exist.
- The review period gives the poster time to evaluate submissions.
- There is no automatic award, dispute resolution, or guaranteed payment to a hunter if the poster disappears.

That last point belongs in the README and the submission's honest limitations.

**B. The direct-user-call funding restriction needs precise proof.**

This is where I would pay particular attention as a Gno.land judge.

Gno's security guidance distinguishes between checking the original transaction's attached coins and checking whether the immediate caller is actually a user account.

`OriginSend()` alone is not sufficient. An intermediary or ephemeral user-run realm can create situations where the original transaction's attached coins are not the coins actually received by your realm.

The documented defensive pattern pairs the original-send check with `cur.Previous().IsUserCall()`.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://docs.gno.land\&sz=32)

gno.land Documentation+1



Your README says:

> rejects anything that is not a direct maketx call

Good. But I would want to see the exact implementation and a regression test proving that an ephemeral `maketx run` cannot bypass the funding check.

**Judge's question:** Does the implementation explicitly verify the immediate caller is a pure EOA, or does it merely inspect `OriginSend()`?

Do not assume the README's wording proves the implementation.

**C. Twelve passing tests are not equivalent to twelve security guarantees.**

Gno's documented `gno test` runner uses a mocked GnoVM. It is useful for testing realm logic, but it isn't a real-chain integration test.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://docs.gno.land\&sz=32)

gno.land Documentation+1



You have two different kinds of evidence:

- Local tests: demonstrate expected behavior under the test environment.
- Onyx transactions: demonstrate that selected operations actually executed on a deployed network.

Present them separately. This distinction will make your technical credibility stronger, not weaker.

## **3. What a strict judge will look for but currently cannot easily find**

These are the missing explanations and evidence I'd prioritize.

### **A. Technical quality — 40%**

Highest priority

**1. Explicit escrow accounting**

You mention `totalEscrow`, but don't show the accounting model.

Add a small table explaining:

| Operation | Escrow effect                |
| --------- | ---------------------------- |
| PostQuest | Increase by deposited reward |
| Award     | Decrease by awarded reward   |
| Reclaim   | Decrease by refunded reward  |
| Submit    | No change                    |

Then state the actual invariant in terms of realm balance and outstanding liabilities.

For example, if your implementation enforces it:

\\[ \text{RealmBalance} \geq \text{TotalEscrow} \\]

Do not claim equality unless the code actually guarantees equality.

**2. Lifecycle and edge cases**

A judge will want to understand:

- Can a poster award after the submission deadline?
- Can the poster award any submitted hunter or only one?
- Can a hunter submit more than once?
- Can the poster submit to their own quest?
- What happens when there are no submissions?
- What happens when there are submissions but no award?
- Can a quest be awarded and then reclaimed?
- Can the same hunter receive multiple awards from different quests?

Your README answers some of these, but not all.

Add a lifecycle diagram:

\#chatgpt-mermaid-\_r_i5\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_i5\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_i5\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_i5\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_i5\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_i5\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_i5\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_i5\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_i5\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_i5\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_i5\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_i5\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_i5\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_i5\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-\_r_i5\_ p{margin:0;}#chatgpt-mermaid-\_r_i5\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_i5\_ .cluster-label text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_i5\_ .cluster-label span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_i5\_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-\_r_i5\_ .label text,#chatgpt-mermaid-\_r_i5\_ span{fill:rgb(13, 13, 13);color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_i5\_ .node rect,#chatgpt-mermaid-\_r_i5\_ .node circle,#chatgpt-mermaid-\_r_i5\_ .node ellipse,#chatgpt-mermaid-\_r_i5\_ .node polygon,#chatgpt-mermaid-\_r_i5\_ .node path{fill:rgb(251, 232, 240);stroke:rgb(246, 142, 188);stroke-width:1px;}#chatgpt-mermaid-\_r_i5\_ .rough-node .label text,#chatgpt-mermaid-\_r_i5\_ .node .label text,#chatgpt-mermaid-\_r_i5\_ .image-shape .label,#chatgpt-mermaid-\_r_i5\_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-\_r_i5\_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-\_r_i5\_ .rough-node .label,#chatgpt-mermaid-\_r_i5\_ .node .label,#chatgpt-mermaid-\_r_i5\_ .image-shape .label,#chatgpt-mermaid-\_r_i5\_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-\_r_i5\_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-\_r_i5\_ .root .anchor path{fill:rgb(143, 143, 143)!important;stroke-width:0;stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_i5\_ .arrowheadPath{fill:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_i5\_ .edgePath .path{stroke:rgb(143, 143, 143);stroke-width:1px;}#chatgpt-mermaid-\_r_i5\_ .flowchart-link{stroke:rgb(143, 143, 143);fill:none;}#chatgpt-mermaid-\_r_i5\_ .edgeLabel{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_i5\_ .edgeLabel p{background-color:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_i5\_ .edgeLabel rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_i5\_ .labelBkg{background-color:rgba(252, 252, 252, 0.5);}#chatgpt-mermaid-\_r_i5\_ .cluster rect{fill:rgb(243, 243, 243);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_i5\_ .cluster text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_i5\_ .cluster span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_i5\_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:12px;background:rgb(243, 243, 243);border:1px solid rgba(0, 0, 0, 0.1);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-\_r_i5\_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_i5\_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-\_r_i5\_ .icon-shape,#chatgpt-mermaid-\_r_i5\_ .image-shape{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_i5\_ .icon-shape p,#chatgpt-mermaid-\_r_i5\_ .image-shape p{background-color:rgb(252, 252, 252);padding:2px;}#chatgpt-mermaid-\_r_i5\_ .icon-shape .label rect,#chatgpt-mermaid-\_r_i5\_ .image-shape .label rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_i5\_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-\_r_i5\_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-\_r_i5\_ .node .neo-node{stroke:rgb(246, 142, 188);}#chatgpt-mermaid-\_r_i5\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_i5\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_i5\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_i5\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_i5\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_i5\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_i5\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_i5\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_i5\_ [data-look="neo"].node .neo-line path{stroke:rgb(246, 142, 188);filter:none;}#chatgpt-mermaid-\_r_i5\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_i5\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_i5\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_i5\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_i5\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_i5\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_i5\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_i5\_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(150, 60, 103);}#chatgpt-mermaid-\_r_i5\_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(150, 60, 103);}#chatgpt-mermaid-\_r_i5\_ .node tspan[font-weight="normal"],#chatgpt-mermaid-\_r_i5\_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-\_r_i5\_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(255, 244, 249);stroke:rgb(229, 209, 219);stroke-width:1px;}#chatgpt-mermaid-\_r_i5\_ .node rect,#chatgpt-mermaid-\_r_i5\_ .node circle,#chatgpt-mermaid-\_r_i5\_ .node ellipse,#chatgpt-mermaid-\_r_i5\_ .node polygon,#chatgpt-mermaid-\_r_i5\_ .node path{fill:rgb(255, 232, 243);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_i5\_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-\_r_i5\_ .mermaid-decision .label-container{fill:rgb(255, 244, 249);stroke:rgb(229, 209, 219);stroke-dasharray:2,2;}#chatgpt-mermaid-\_r_i5\_ .edgePaths .flowchart-link{stroke:rgb(143, 143, 143);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-\_r_i5\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_i5\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}Quest posted + GNOTescrowedSubmission window openHunter submits answerDeadline passesReview period: 7 daysPoster awards a submittedhunterReview period expiresNo submissions: reclaimallowedPoster may reclaim

This is a conceptual diagram, not a verified representation of every implementation transition. Make sure the final diagram reflects actual function guards.

**3. Security test coverage**

Don't just say "12 passing tests."

Show the test names, what each proves, and whether it is a positive or negative case.

Especially important:

- Wrong caller.
- Wrong denomination.
- Insufficient reward.
- Duplicate submission.
- Self-submission.
- Expired submission window.
- Unauthorized award.
- Award to a non-submitter.
- Double award.
- Award followed by reclaim.
- Double reclaim.
- Markdown/JSON escaping.
- Ephemeral realm funding bypass, if covered.

That's a coverage checklist, not a claim that all these tests currently exist. Only include the ones actually present.

**4. Gno-specific engineering**

A judge may ask: why does this need Gno.land rather than a conventional backend?

Your strongest answer is:

- The realm owns the escrowed funds.
- State transitions are enforced by Gno functions.
- Funding, awarding and reclaiming are transactions rather than administrator-controlled database updates.
- Realm state is publicly queryable.

Make the relationship between the Gno realm and the web frontend explicit.

**5. Reproducibility**

Your README has a good starting point, but add:

- Exact Gno version and commit, if available.
- Exact test command and expected output.
- Test count and test names.
- Onyx chain ID.
- RPC endpoint.
- Realm package path.
- Deployment transaction hash.
- How to reproduce one complete local flow.

The current Onyx documentation identifies `onyx-1` as the current testnet chain ID.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://docs.gno.land\&sz=32)

gno.land Documentation+1



### **B. User appeal — 20%**

The biggest weakness is the interaction model.

Your frontend is visually appealing by description, but the user still has to copy and execute `gnokey` commands.

That's acceptable for a technical prototype. However, it isn't frictionless bounty participation.

I would explicitly position Taproom as:

**A working on-chain bounty board with CLI-based transaction signing.**

Don't describe it as a fully integrated consumer marketplace.

Also demonstrate these three things in the video:

1. A hunter can understand what the quest requires.
2. A hunter can see who submitted and the reward involved.
3. A poster can distinguish awarding from reclaiming.

The visual experience should communicate the escrow state, not just display attractive cards.

### **C. Creativity — 20%**

The review window is your strongest creative decision.

But right now, it is buried inside a list of contract restrictions.

Give it a name and explain the motivation.

For example:

**The Seven-Day Review Window**

A funded bounty shouldn't become instantly refundable after someone submits work. Taproom introduces a seven-day review period after the submission deadline before a poster can reclaim funds from a quest with submissions.

This gives the poster time to evaluate answers while delaying immediate withdrawal.

Don't call it a dispute mechanism or hunter guarantee. It isn't either.

### **D. Documentation and demo — 20%**

The documentation needs to answer one question:

**Can another developer understand, verify and reproduce what you built without asking you?**

Your current video outline is promising, but it is too vague.

A judge should see:

- The actual Onyx realm.
- The transaction hashes, not just a statement that hashes exist.
- The state before and after each operation.
- The GNOT amount deposited and paid/refunded.
- The frontend reading live realm data.
- The local test output.

Also, disclose that the second hunter is controlled by the author before showing the award transaction. That's a credibility advantage when handled transparently.

## **4. The five highest-impact edits**

These are the changes I'd make before submitting, in order of importance.

### **Edit 1 — Fix the core promise**

Critical

Current:

> Taproom removes the trust. The reward is locked in the realm when the quest is pinned, the poster can only release it to someone who actually submitted, and a poster who goes silent cannot take the money back while hunters are waiting.

Problem: It overpromises hunter protection.

Replace with:

Small bounties often depend on an informal promise: the poster promises to pay, and the hunter hopes they will.

Taproom changes that arrangement. A poster funds the bounty when creating a quest, locking the reward in a Gno.land realm. Only a recorded submitter can receive the award, and the payout happens on-chain.

If submissions exist, the poster cannot reclaim the reward immediately. They must wait until the submission deadline and a further seven-day review period have passed.

Taproom doesn't guarantee that every submission gets paid. It makes the funding, award and refund rules explicit and enforceable on-chain.

Why this is better:

- More technically honest.
- Explains the actual value proposition.
- Doesn't pretend the contract solves disputes.
- Establishes why escrow matters.

### **Edit 2 — Replace the generic security claims with verifiable engineering**

Current:

> Each point is covered by a test in realm/taproom_test.gno.

This is too broad.

Replace the introductory paragraph with:

### Contract safety and accounting

Taproom enforces its escrow rules inside the realm rather than relying on frontend validation.

- **Funding:** Quest creation requires a direct user call and validates the attached ugnot payment.
- **Denomination:** Only ugnot is accepted, with a minimum reward of 1 GNOT.
- **Authorization:** Only the poster can award or reclaim a quest.
- **Award eligibility:** The recipient must have a recorded submission.
- **Replay protection:** Completed award and reclaim transitions cannot be executed again.
- **Accounting:** `totalEscrow` tracks outstanding rewards, and payout operations check that the realm holds sufficient funds.
- **Output handling:** User-controlled text is escaped for Markdown and JSON rendering, and submission links must use HTTPS.

The realm test suite contains 12 tests covering the implemented rules and selected failure cases. See `realm/taproom_test.gno` for the actual test cases.

These tests exercise the local GnoVM; the Onyx transaction history separately demonstrates the deployed workflow.

Important: Before using this, verify the direct-call implementation really uses the appropriate caller restriction, and ensure every statement matches the source code.

### **Edit 3 — Add a real transaction evidence table**

High impact

Your submission says:

> On Onyx the full flow is on-chain: 3 quests posted, 1 answered and awarded (5 GNOT paid out), 1 reclaimed (3 GNOT refunded), 1 left open.

This is good evidence, but a judge shouldn't have to open another file and hunt for hashes.

Put the evidence directly in the submission.

Use this structure and populate it from `onchain/DEPLOYMENT.md`:

| Action      | Evidence to provide                       |
| ----------- | ----------------------------------------- |
| Deploy      | Deployment transaction hash               |
| Post        | Three quest transaction hashes            |
| Submit      | Actual hunter submission transaction hash |
| Award       | Award transaction hash + 5 GNOT           |
| Reclaim     | Reclaim transaction hash + 3 GNOT         |
| Final state | Open quest ID and current escrow state    |

For each transaction, provide a clickable Onyx explorer link if a verified explorer URL is available.

Also provide:

- Chain ID: `onyx-1`
- Realm package path.
- Relevant quest IDs.
- Poster address.
- Hunter address.

The second hunter being controlled by you should remain disclosed.

**Why this matters:** A judge can independently inspect the transactions rather than trusting a video narrator.

### **Edit 4 — Make the README's technical section more useful**

Your current README has a good narrative but doesn't quite function as an audit guide.

I'd change the judging map:

## Judge's guide

| Criterion                    | Evidence                                                                                      |
| ---------------------------- | --------------------------------------------------------------------------------------------- |
| Technical quality (40%)      | `realm/taproom.gno`, `realm/taproom_test.gno`, escrow accounting and Onyx transaction history |
| User appeal (20%)            | Live web UI, quest board, quest details and hunter reputation cards                           |
| Creativity (20%)             | Funded-at-creation escrow and the seven-day review window                                     |
| Documentation and demo (20%) | This README, `DEPLOY.md`, `onchain/DEPLOYMENT.md` and the recorded demo                       |

## Verification

**Network:** Onyx testnet (`onyx-1`)

**Realm:** `gno.land/r/g1jacahne0v3s27d6g872s8qu30ryvuec3lzsjej/taproom`

**Frontend:** [Taproom Live](https://taproom-gno.vercel.app)

**Tests:**

```
cd realm
GNOROOT=/path/to/gno gno test -v .
```

**Deployment and transaction evidence:** See `onchain/DEPLOYMENT.md`.

The local test suite and deployed Onyx transactions serve as separate verification evidence. The former exercises contract logic; the latter demonstrates selected operations on the live testnet.

I'd additionally make sure the README's Markdown links render correctly in GitHub. If the backslashes shown in the supplied text are actually present in the source, clean them up.

### **Edit 5 — Improve the demo storytelling**

High impact

Your video outline currently reads like a checklist:

- Title
- Problem
- 12 passing tests
- Deploy transaction
- Post/submit/award/reclaim hashes
- Live UI
- Safety design
- Links

That demonstrates activity, but doesn't necessarily tell a compelling story.

I'd restructure the 100-second demo:

## **Recommended 100-second demo**

1. **0–10 seconds — The problem**

   Show the problem: someone completes a small bounty, but payment depends on the poster keeping their promise.

   Introduce Taproom in one sentence.
2. **10–25 seconds — The actual product**

   Show the live quest board, reward amounts, quest details and existing submissions.
3. **25–45 seconds — Funded escrow**

   Show the Onyx quest creation transaction and the deposited GNOT. Show the corresponding transaction hash.
4. **45–65 seconds — The hunter and award**

   Show the second test account submitting an answer, then the poster awarding it. Show the 5 GNOT payout transaction.

   Disclose that both accounts are controlled by the author.
5. **65–78 seconds — Reclaim**

   Show the 3 GNOT refund transaction and explain the no-submission reclaim path.

   Do not imply that this demonstrates the seven-day waiting period unless you actually demonstrate the elapsed-time condition.
6. **78–90 seconds — Technical credibility**

   Show the 12 passing tests and briefly explain direct-call funding validation, replay protection and escrow accounting.
7. **90–100 seconds — Close**

   Show the realm, repository, live UI and transaction documentation.

One particularly important detail: don't show a local-chain operation and imply that it happened on Onyx. Clearly label local tests versus live transactions.

## **5. What I would not change**

Some parts of your submission are already good. Don't over-edit them.

| Existing decision                    | My recommendation             |
| ------------------------------------ | ----------------------------- |
| Name: Taproom                        | Keep it                       |
| No "Gno" prefix                      | Keep it                       |
| Escrow at quest creation             | Keep as the central mechanism |
| Seven-day review window              | Keep; emphasize it            |
| Native ugnot only                    | Keep for this version         |
| Dependency-free frontend             | Keep                          |
| CLI-based transaction signing        | Keep and disclose             |
| No dispute mechanism                 | Disclose honestly             |
| Second test key controlled by author | Disclose prominently          |

In particular, don't suddenly introduce a wallet extension, dispute resolution, GRC20 support, automatic arbitration or other features in the written submission unless they're actually implemented.

A smaller, working, auditable realm is more convincing than a larger product roadmap.

## **6. Final submission checklist**

**Pre-submission checklist**

0/12 completed

Make the GitHub repository public.

Verify the deployed realm and live UI are accessible.

Verify every transaction hash against Onyx.

Publish the demo video and replace the placeholder URL.

Verify all 12 tests pass using the documented command.

Check the exact direct-caller and OriginSend implementation.

Add the escrow accounting explanation.

Clarify the seven-day reclaim limitation.

Add individual transaction links to the submission.

Check README rendering and remove broken Markdown.

Make sure the second test account disclosure is visible.

Verify that the DoraHacks submission contains the correct repository and video links.

## **My final verdict**

**The strongest version of Taproom is not "a revolutionary bounty marketplace." It's "a working Gno.land escrow primitive with a usable bounty-board interface and an explicit funding, award and reclaim lifecycle."**

That positioning is much more credible.

If I were judging, my biggest questions would be:

1. Does the funding restriction actually prevent indirect-call and ephemeral-realm bypasses?
2. Is the escrow accounting correct across every possible state transition?
3. Does the review-window mechanism genuinely protect hunters, or only delay refunds?
4. Can I independently reproduce the demonstrated Onyx workflow?
5. Does the application demonstrate why Gno.land is necessary rather than simply using Gno as a backend implementation detail?

Your biggest opportunity is technical credibility, not additional features.

**My priority order:** fix the hunter-protection wording → prove direct-call funding → document accounting and lifecycle → expose transaction evidence → improve the video narrative.

That is where I'd spend the remaining development time.

Useful Gno references for the final technical pass:

- [Effective Gno — security patterns and OriginSend](https://docs.gno.land/resources/effective-gno/?utm_source=chatgpt.com).
- [Running and Testing Gno Code](https://docs.gno.land/resources/gno-testing/?utm_source=chatgpt.com).
- [Gno.land network configurations and Onyx](https://docs.gno.land/resources/gnoland-networks/?utm_source=chatgpt.com).