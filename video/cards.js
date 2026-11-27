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
 '01-title':wrap(`<span class=pill>Gnome Tavern hackathon · Gno.land</span><h1>Taproom</h1><p class=l>An escrowed bounty board.<br>Pin a quest, lock the reward, pay the best answer.</p><p class=l style="color:#78716c;font-size:20px;margin-top:30px">Realm deployed on the Onyx testnet (onyx-1) · web UI reads the chain live</p>`),
 '02-why':wrap(`<span class=pill>The problem</span><h2>Small bounties run on trust</h2><div class=glass><ul><li>Poster promises to pay. Hunter hopes.</li><li><b>Taproom locks the reward in the realm</b> when the quest is pinned.</li><li>Only an address that actually submitted can be paid.</li><li>A silent poster cannot take the money back while hunters wait.</li></ul></div>`),
 '03-tests':wrap(`<span class=pill>Step 1 · Tested</span><h2>12 Gno tests, all passing</h2><pre>${esc(rd('gno-test-output.txt').replace(/--- PASS: /g,'<PASS> ').replace(/\n/g,'\n'))}</pre>`,'gno test -v ./realm — escrow rules, validation, markdown/JSON escaping.'),
 '04-deploy':(()=>{const a=tx('tx-deploy.txt');return wrap(`<span class=pill>Step 2 · Deployed on Onyx</span><h2>gnokey maketx addpkg</h2><pre>$ scripts/deploy-onyx.sh taproom-poster
Deploying gno.land/r/g1jacahne0v3s27d6g872s8qu30ryvuec3lzsjej/taproom
OK!
GAS USED:   25730774
HEIGHT:     ${a.h}
TX HASH:    ${a.x}</pre>`,'Package path: gno.land/r/g1jacahne0v3s27d6g872s8qu30ryvuec3lzsjej/taproom · chain onyx-1')})(),
 '05-flow':(()=>{const s=tx('tx-submit-1.txt'),a=tx('tx-award-1.txt'),r=tx('tx-reclaim-2.txt'),q=tx('tx-postquest-1.txt');return wrap(`<span class=pill>Step 3 · The full flow on-chain</span><h2>Post → Submit → Award → Reclaim</h2><pre><span class=d># poster pins quest #1 with 5 GNOT locked in escrow</span>
PostQuest   h${q.h}  ${q.x}
<span class=d># hunter (second key) answers</span>
Submit      h${s.h}  ${s.x}
<span class=d># poster awards: escrow paid in the same tx</span>
Award       h${a.h}  ${a.x}
<span class=d># quest #2 had no answers: poster takes the 3 GNOT back</span>
Reclaim     h${r.h}  ${r.x}</pre>`,'Every hash above is a real transaction on onyx-1.')})(),
 '06-safety':wrap(`<span class=pill>Design</span><h2>Built to be safe</h2><div class=glass><ul><li>Funds only from a direct user call, one coin type (ugnot), min 1 GNOT</li><li>State changes before coins move; every payout checks the escrow invariant</li><li>Hunters protected by a 7-day review window before a poster can reclaim</li><li>User text escaped for markdown and JSON; links must be plain https</li></ul></div>`),
 '07-end':wrap(`<span class=pill>Try it</span><h1>Taproom</h1><p class=l><b>Live UI:</b> taproom-gno.vercel.app</p><p class=l><b>Realm:</b> gno.land/r/g1jacahne0v3s27d6g872s8qu30ryvuec3lzsjej/taproom</p><p class=l><b>Code:</b> github.com/yunnaysy/taproom-gno (MIT)</p><p class=l style="color:#78716c;font-size:20px;margin-top:26px">Rewards are native ugnot on the Onyx testnet. No real funds are involved.</p>`),
};
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox']});const pg=await b.newPage();await pg.setViewport({width:1280,height:720});
 for(const [k,v] of Object.entries(cards)){await pg.setContent(v);await pg.screenshot({path:`work/card-${k}.png`});}
 await b.close();})();
