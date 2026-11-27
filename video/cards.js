// Renders title/terminal cards (1280x720) from REAL command output files.
const p=require('/tmp/pp/node_modules/puppeteer-core'); const fs=require('fs');
const O='/workspace/contests/taproom/onchain/';
const css=`*{box-sizing:border-box}body{margin:0;width:1280px;height:720px;background:#fff;color:#1C1917;font:20px/1.5 ui-sans-serif,system-ui,Segoe UI,Roboto,Arial,sans-serif;position:relative;overflow:hidden}
.bg i{position:absolute;border-radius:50%;filter:blur(70px);opacity:.55}.bg i:nth-child(1){width:420px;height:420px;left:-100px;top:60px;background:#e5e7eb}.bg i:nth-child(2){width:380px;height:380px;right:-80px;top:0;background:#dbe3ec}.bg i:nth-child(3){width:420px;height:420px;left:40%;top:420px;background:#eceff3}
.wrap{position:relative;padding:64px 80px}.pill{display:inline-block;font-size:14px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;padding:6px 16px;border:1px solid rgba(28,25,23,.12);border-radius:999px;background:rgba(255,255,255,.7)}
h1{font-size:64px;line-height:1.05;letter-spacing:-.03em;margin:22px 0 18px}h2{font-size:42px;letter-spacing:-.02em;margin:18px 0 22px}
p.l{font-size:24px;color:#44403c;max-width:900px;margin:0 0 10px}
.glass{background:rgba(255,255,255,.7);border:1px solid rgba(28,25,23,.1);border-radius:28px;box-shadow:0 18px 40px -24px rgba(28,25,23,.3);padding:26px 30px}
pre{background:#1C1917;color:#f5f5f4;border-radius:28px;padding:28px 34px;font:17px/1.55 ui-monospace,Menlo,monospace;margin:0;white-space:pre-wrap;word-break:break-all}
.g{color:#86efac}.d{color:#a8a29e}ul{margin:0;padding-left:26px}li{margin:10px 0;font-size:24px;color:#292524}.cap{position:absolute;left:80px;right:80px;bottom:40px;font-size:20px;color:#57534e}`;
const wrap=(inner,cap)=>`<style>${css}</style><div class=bg><i></i><i></i><i></i></div><div class=wrap>${inner}</div>${cap?`<div class=cap>${cap}</div>`:''}`;
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
const rd=f=>fs.readFileSync(O+f,'utf8').trim();
const tx=(f)=>{const t=rd(f);const h=(t.match(/HEIGHT:\s+(\d+)/)||[])[1],x=(t.match(/TX HASH:\s+(\S+)/)||[])[1];return {h,x}};
const cards={
 '01-title':wrap(`<span class=pill>Gnome Tavern hackathon · Gno.land</span><h1>Taproom</h1><p class=l>A funded-at-creation bounty board.<br>The reward is locked in the realm when the quest is posted.</p><p class=l style="color:#78716c;font-size:20px;margin-top:30px">Realm on the Onyx testnet (onyx-1) · CLI-signed transactions · live web view</p>`),
 '02-why':wrap(`<span class=pill>The problem</span><h2>Bounties depend on a promise</h2><div class=glass><ul><li>The poster promises to pay. The hunter hopes.</li><li><b>Taproom locks the reward in a Gno realm</b> when the quest is created.</li><li>Only an address with a recorded submission can be awarded; the payout is on-chain.</li><li>Not a guarantee: the poster still decides, and there is no dispute process.</li></ul></div>`),
 '03-deploy':(()=>{const a=tx('tx-deploy.txt'),q=tx('tx-postquest-1.txt'),q3=tx('tx-postquest-3.txt');return wrap(`<span class=pill>LIVE ON ONYX · onyx-1 · funded escrow</span><h2>Deploy and post</h2><pre><span class=d># addpkg: realm path gno.land/r/g1jacahne0v3s27d6g872s8qu30ryvuec3lzsjej/taproom</span>
addpkg       h${a.h}  ${a.x}
<span class=d># PostQuest #1: 5 GNOT attached and locked (escrow 5)</span>
PostQuest    h${q.h}  ${q.x}
<span class=d># later, PostQuest #3: 2 GNOT locked, left open</span>
PostQuest    h${q3.h}  ${q3.x}</pre>`,'Real transactions. Each hash is queryable on the Onyx RPC; links are in the README.')})(),
 '04-award':(()=>{const s=tx('tx-submit-1.txt'),a=tx('tx-award-1.txt');return wrap(`<span class=pill>LIVE ON ONYX · onyx-1 · submit and award</span><h2>Hunter answers, poster awards</h2><pre><span class=d># hunter key submits an answer to quest #1 (escrow unchanged)</span>
Submit       h${s.h}  ${s.x}
<span class=d># poster awards: 5 GNOT paid to the hunter in the same tx (escrow 8 to 3)</span>
Award        h${a.h}  ${a.x}</pre><p class=l style="margin-top:22px;font-size:22px"><b>Disclosure:</b> poster and hunter are two throwaway test keys, both controlled by the author. This demonstrates the flow; it is not an independent bounty result.</p>`)})(),
 '05-reclaim':(()=>{const r=tx('tx-reclaim-2.txt');return wrap(`<span class=pill>LIVE ON ONYX · onyx-1 · reclaim</span><h2>Reclaim with no answers</h2><pre><span class=d># quest #2 had no answers: poster takes the 3 GNOT back (escrow 3 to 0)</span>
Reclaim      h${r.h}  ${r.x}</pre><div class=glass style="margin-top:24px"><ul><li>With no answers a poster can withdraw at any time.</li><li>With answers, reclaim is blocked until deadline + 7 days (the review window). That wait was <b>not</b> demonstrated live; it is covered by a local test.</li></ul></div>`)})(),
 '06-tests':wrap(`<span class=pill>LOCAL GnoVM TESTS · mocked chain, not Onyx</span><h2>13 Gno tests, all passing</h2><pre>${esc(rd('gno-test-output.txt').replace(/--- PASS: /g,'PASS ').replace(/ \(\d+\.\d+s\)/g,''))}</pre>`,'gno test -v ./realm. Rules, validation, escrow, Markdown and JSON escaping. Names and coverage: README.'),
 '07-limits':wrap(`<span class=pill>Design and limits</span><h2>What is enforced, and what is not</h2><div class=glass><ul><li>Funding needs a direct user call (IsUserCall), one coin: ugnot, at least 1 GNOT</li><li>Before each payout: realm balance &ge; totalEscrow</li><li>Output: Markdown and JSON escaping, https-only links</li><li>Not included: dispute process, auto-award, hunter guarantee, wallet extension</li></ul></div>`),
 '08-end':wrap(`<span class=pill>Links</span><h1>Taproom</h1><p class=l><b>Live UI:</b> taproom-gno.vercel.app</p><p class=l><b>Realm:</b> gno.land/r/g1jacahne0v3s27d6g872s8qu30ryvuec3lzsjej/taproom</p><p class=l><b>Code and tx table:</b> github.com/yunnaysy/taproom-gno (MIT)</p><p class=l style="color:#78716c;font-size:20px;margin-top:26px">Testnet GNOT only. CLI-signed with gnokey.</p>`),
};
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox']});const pg=await b.newPage();await pg.setViewport({width:1280,height:720});
 for(const [k,v] of Object.entries(cards)){await pg.setContent(v);await pg.screenshot({path:`work/card-${k}.png`});}
 await b.close();})();
