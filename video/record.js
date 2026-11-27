const p=require('/tmp/pp/node_modules/puppeteer-core');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await p.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--disable-gpu']});
 const pg=await b.newPage(); await pg.setViewport({width:1280,height:720});
 await pg.goto('https://taproom-gno.vercel.app/',{waitUntil:'networkidle0'}); await sleep(1000);
 await pg.addStyleTag({content:'#capbar{position:fixed;z-index:99;left:50%;bottom:22px;transform:translateX(-50%);max-width:1100px;background:rgba(28,25,23,.92);color:#fff;padding:12px 26px;border-radius:999px;font:600 18px/1.4 system-ui,sans-serif;text-align:center}'});
 const cap=async t=>{await pg.evaluate(t=>{let c=document.getElementById('capbar');if(!c){c=document.createElement('div');c.id='capbar';document.body.append(c)}c.textContent=t},t)};
 const rec=await pg.screencast({path:'work/live.mp4',fps:25});
 await cap('Live web UI (taproom-gno.vercel.app) reading the Onyx realm over RPC'); await sleep(4500);
 await pg.evaluate(()=>document.querySelector('#board').scrollIntoView({behavior:'smooth'})); await sleep(1500);
 await cap('Live read of the Onyx realm: quest #3 open, #2 reclaimed, #1 awarded'); await pg.click('#filter button[data-f=all]'); await sleep(4000);
 for(const c of await pg.$$('.card')){const t=await c.evaluate(e=>e.textContent); if(t.includes('report one real bug')){await c.click();break;}}
 await cap('Quest #1: the recorded answer and the winner marked after the poster\u2019s Award'); await sleep(5500);
 await pg.keyboard.press('Escape'); await sleep(600);
 await cap('Settled quests: one paid out, one reclaimed'); await pg.click('#filter button[data-f=settled]'); await sleep(3000);
 await pg.evaluate(()=>document.querySelector('#post').scrollIntoView({behavior:'smooth'})); await sleep(1500);
 await cap('Read-only UI: it generates a gnokey command; signing happens outside the browser'); 
 await pg.type('input[name=title]','Review my Gno realm',{delay:55}); await pg.type('textarea[name=details]','Find a real bug and send a failing test.',{delay:35}); await sleep(500);
 await pg.click('#composer button[type=submit]'); await sleep(5000);
 await pg.evaluate(()=>document.querySelector('#how').scrollIntoView({behavior:'smooth'})); await cap('Lifecycle: Pin, Answer, Award, Reclaim'); await sleep(4000);
 await rec.stop(); await b.close();
})();
