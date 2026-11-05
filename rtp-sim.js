// Pemakaian: node rtp-sim.js <jumlah_spin> [payScale] [path/game.js]   contoh: node rtp-sim.js 3000000
// Mengukur RTP (spin utama + Free Spin), hit rate, frekuensi bonus, dan distribusi menang dari Engine di game.js.
const fs=require('fs');
let src=fs.readFileSync(process.argv[4]||'./game.js','utf8');
const a=src.indexOf('const CONFIG'), b=src.indexOf('/* ---------- SOUND');
let code=src.slice(a,b).replace(/const Assets[\s\S]*?\n\};\n/,'');
if(process.env.FASTRNG)code=code.replace(/const RNG = [\s\S]*?\}\)\(\);/,'const RNG={next:Math.random};'); // FASTRNG=1: pakai Math.random hanya untuk kalibrasi cepat
const ps=process.argv[3]||'';
if(ps)code=code.replace(/payScale: [0-9.]+,/,'payScale: '+ps+',');
const N=+process.argv[2], B=20, BATCH=100000;
const run=new Function(code+`
 const N=${N}, bet=${B}, BATCH=${BATCH}, cap=CONFIG.maxWinX*bet;
 let W=0,base=0,fs=0,hit=0,trig=0,capHits=0,maxWin=0,fsSpins=0, sumsq=0, batches=[],bw=0;
 const th=[1,2,5,10,20,50,100,500,1000,3000], cnt=th.map(()=>0);
 let multMax=0;
 for(let i=0;i<N;i++){
   W+=bet; let roundWin=0;
   let r=Engine.play(bet,{n:0},cap); roundWin+=r.total; base+=r.total; if(r.total>0)hit++; if(r.capped)capHits++;
   multMax=Math.max(multMax,r.multiplier);
   let f=0;
   if(r.freeSpins>0){ trig++; let left=r.freeSpins, mult={n:0};
     while(left>0){ left--; fsSpins++; const x=Engine.play(bet,mult,cap-roundWin); mult=x.mult; roundWin+=x.total; f+=x.total; multMax=Math.max(multMax,x.multiplier); left+=x.freeSpins; if(x.capped){capHits++;break;} } }
   fs+=f; if(roundWin>maxWin)maxWin=roundWin; sumsq+=(roundWin/bet)**2;
   th.forEach((t,k)=>{ if(roundWin>=t*bet)cnt[k]++; });
   bw+=roundWin; if((i+1)%BATCH===0){batches.push(bw/(BATCH*bet)); bw=0;}
 }
 const mean=batches.reduce((x,y)=>x+y,0)/batches.length, sd=Math.sqrt(batches.reduce((x,y)=>x+(y-mean)**2,0)/(batches.length-1));
 const rtp=(base+fs)/W, varr=sumsq/N-rtp*rtp;
 return {N,payScale:CONFIG.payScale,RTP:rtp,baseRTP:base/W,fsRTP:fs/W,ci95:1.96*sd/Math.sqrt(batches.length),hitRate:hit/N,trigOneIn:N/trig,avgFsSpins:fsSpins/trig,capHitsOneIn:capHits?N/capHits:null,maxWinX:maxWin/bet,maxMult:multMax,sd:Math.sqrt(varr),
   dist:Object.fromEntries(th.map((t,k)=>[t+'x',cnt[k]?'1 dari '+(N/cnt[k]).toFixed(1):'0']))};
`);
console.log(JSON.stringify(run(),null,1));