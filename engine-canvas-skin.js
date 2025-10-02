
const DPR = Math.max(1, Math.min(3, window.devicePixelRatio||1));
const Files=9, Ranks=10, Squares=90;
const P={E:0, RK:1,RA:2,RB:3,RN:4,RR:5,RC:6,RP:7, BK:8,BA:9,BB:10,BN:11,BR:12,BC:13,BP:14};
const isRed=p=>p>=P.RK&&p<=P.RP, isBlack=p=>p>=P.BK&&p<=P.BP;
const F=i=>i%Files, R=i=>(i/Files|0), I=(f,r)=>r*Files+f;

class Pos{ constructor(){this.b=new Array(Squares).fill(0); this.red=true; this.hist=[];}
  setStart(){this.b.fill(0);
    this.b[I(0,0)]=P.RR; this.b[I(8,0)]=P.RR; this.b[I(1,0)]=P.RN; this.b[I(7,0)]=P.RN;
    this.b[I(2,0)]=P.RB; this.b[I(6,0)]=P.RB; this.b[I(3,0)]=P.RA; this.b[I(5,0)]=P.RA; this.b[I(4,0)]=P.RK;
    this.b[I(1,2)]=P.RC; this.b[I(7,2)]=P.RC; for(let f=0;f<9;f+=2) this.b[I(f,3)]=P.RP;
    this.b[I(0,9)]=P.BR; this.b[I(8,9)]=P.BR; this.b[I(1,9)]=P.BN; this.b[I(7,9)]=P.BN;
    this.b[I(2,9)]=P.BB; this.b[I(6,9)]=P.BB; this.b[I(3,9)]=P.BA; this.b[I(5,9)]=P.BA; this.b[I(4,9)]=P.BK;
    this.b[I(1,7)]=P.BC; this.b[I(7,7)]=P.BC; for(let f=0;f<9;f+=2) this.b[I(f,6)]=P.BP;
    this.red=true; this.hist=[];} make(m){m.cap=this.b[m.to]; this.hist.push(m); this.b[m.to]=this.b[m.from]; this.b[m.from]=0; this.red=!this.red;} unmake(){const m=this.hist.pop(); this.b[m.from]=this.b[m.to]; this.b[m.to]=m.cap||0; this.red=!this.red;}}

function genMoves(p){const arr=[]; for(let i=0;i<Squares;i++){const pc=p.b[i]; if(!pc)continue; if(p.red&&!isRed(pc))continue; if(!p.red&&!isBlack(pc))continue;
  switch(pc){case P.RR:case P.BR:genRook(p,i,arr);break; case P.RC:case P.BC:genCannon(p,i,arr);break; case P.RN:case P.BN:genKnight(p,i,arr);break;
  case P.RB:case P.BB:genBishop(p,i,arr);break; case P.RA:case P.BA:genAdvisor(p,i,arr);break; case P.RK:case P.BK:genKing(p,i,arr);break; case P.RP:case P.BP:genPawn(p,i,arr);break;}}
  for(let k=arr.length-1;k>=0;k--){const m=arr[k]; p.make(m); if(inCheck(p,p.red?1:0)||kingsFace(p)){p.unmake(); arr.splice(k,1);} else p.unmake();} return arr;}
function inCheck(p,side){const target=side===0?P.RK:P.BK; let ki=-1; for(let i=0;i<Squares;i++) if(p.b[i]===target){ki=i;break;} if(ki<0)return true;
  const f=F(ki), r=R(ki), D=[[1,0],[-1,0],[0,1],[0,-1]]; for(const[df,dr] of D){let cf=f+df,cr=r+dr,screen=false;
  while(cf>=0&&cf<Files&&cr>=0&&cr<Ranks){const idx=I(cf,cr), pc=p.b[idx]; if(pc){if(!screen){ if((side===0&&isBlack(pc)&&(pc===P.BR||pc===P.BK))||(side===1&&isRed(pc)&&(pc===P.RR||pc===P.RK))) return true; screen=true;} else { if((side===0&&pc===P.BC)||(side===1&&pc===P.RC)) return true; break; } } cf+=df; cr+=dr; } }
  const K=[[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]]; for(const[df,dr] of K){const nf=f+df,nr=r+dr; if(nf<0||nf>=Files||nr<0||nr>=Ranks)continue; const lf=f+(df/2)|0, lr=r+(dr/2)|0; if(p.b[I(lf,lr)])continue; const pc=p.b[I(nf,nr)]; if(side===0&&pc===P.BN) return true; if(side===1&&pc===P.RN) return true;}
  const er=r+(side===0?1:-1); if(er>=0&&er<Ranks){for(const ef of [f-1,f,f+1]){if(ef<0||ef>=Files)continue; const pc=p.b[I(ef,er)]; if(side===0&&pc===P.BP) return true; if(side===1&&pc===P.RP) return true;}} return false;}
function kingsFace(p){let rf=-1,rr=-1,bf=-1,br=-1; for(let i=0;i<Squares;i++){if(p.b[i]===P.RK){rf=F(i); rr=R(i);} if(p.b[i]===P.BK){bf=F(i); br=R(i);} } if(rf!==bf) return false; for(let r=Math.min(rr,br)+1;r<Math.max(rr,br);r++){ if(p.b[I(rf,r)]) return false; } return true; }
function tryAdd(p,from,to,a){const mv={from,to,cap:p.b[to]}; const mover=p.b[from], t=p.b[to]; if(!t||(isRed(mover)&&isBlack(t))||(isBlack(mover)&&isRed(t))) a.push(mv);}
function genRook(p,i,a){const f=F(i),r=R(i), D=[[1,0],[-1,0],[0,1],[0,-1]]; for(const[df,dr] of D){let cf=f+df,cr=r+dr; while(cf>=0&&cf<Files&&cr>=0&&cr<Ranks){const to=I(cf,cr); if(!p.b[to]) tryAdd(p,i,to,a); else { tryAdd(p,i,to,a); break; } cf+=df; cr+=dr; }}}
function genCannon(p,i,a){const f=F(i),r=R(i), D=[[1,0],[-1,0],[0,1],[0,-1]]; for(const[df,dr] of D){let cf=f+df,cr=r+dr,jumped=false; while(cf>=0&&cf<Files&&cr>=0&&cr<Ranks){const to=I(cf,cr); if(!jumped){ if(!p.b[to]) tryAdd(p,i,to,a); else jumped=true; } else { if(p.b[to]){ tryAdd(p,i,to,a); break; } } cf+=df; cr+=dr; } }}
function genKnight(p,i,a){const f=F(i),r=R(i), K=[[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]]; for(const[df,dr] of K){const nf=f+df,nr=r+dr; if(nf<0||nf>=Files||nr<0||nr>=Ranks)continue; const lf=f+(df/2)|0, lr=r+(dr/2)|0; if(p.b[I(lf,lr)])continue; tryAdd(p,i,I(nf,nr),a);}}
function genBishop(p,i,a){const f=F(i),r=R(i), B=[[2,2],[2,-2],[-2,2],[-2,-2]], red=isRed(p.b[i]); for(const[df,dr] of B){const nf=f+df,nr=r+dr; if(nf<0||nf>=Files||nr<0||nr>=Ranks)continue; if(red&&nr>4)continue; if(!red&&nr<5)continue; const ef=f+df/2, er=r+dr/2; if(p.b[I(ef,er)])continue; tryAdd(p,i,I(nf,nr),a);}}
function genAdvisor(p,i,a){const f=F(i),r=R(i), D=[[1,1],[1,-1],[-1,1],[-1,-1]], red=isRed(p.b[i]); for(const[df,dr] of D){const nf=f+df,nr=r+dr; if(nf<3||nf>5)continue; if(red){ if(nr<0||nr>2)continue; } else { if(nr<7||nr>9)continue; } tryAdd(p,i,I(nf,nr),a);}}
function genKing(p,i,a){const f=F(i),r=R(i), D=[[1,0],[-1,0],[0,1],[0,-1]], red=isRed(p.b[i]); for(const[df,dr] of D){const nf=f+df,nr=r+dr; if(nf<3||nf>5)continue; if(red){ if(nr<0||nr>2)continue; } else { if(nr<7||nr>9)continue; } tryAdd(p,i,I(nf,nr),a);}}
function genPawn(p,i,a){const f=F(i),r=R(i), red=isRed(p.b[i]), fw=red?1:-1; const nr=r+fw; if(nr>=0&&nr<Ranks) tryAdd(p,i,I(f,nr),a); if((red&&r>=5)||(!red&&r<=4)){ if(f>0) tryAdd(p,i,I(f-1,r),a); if(f<8) tryAdd(p,i,I(f+1,r),a);}}
const val=[0,10000,20,20,45,90,50,10,10000,20,20,45,90,50,10];
function evalPos(p){let s=0; for(let i=0;i<Squares;i++){const pc=p.b[i]; if(!pc)continue; let v=val[pc]; if(pc===P.RP)v+=2*R(i); if(pc===P.BP)v+=2*(9-R(i)); s+=isRed(pc)?v:-v;} return p.red?s:-s;}
function searchBest(p, depth, maxNodes=350000){let nodes=0,b=null;
  function q(alpha,beta){let stand=evalPos(p); if(stand>=beta)return beta; if(alpha<stand)alpha=stand; const list=genMoves(p).filter(m=>p.b[m.to]); for(const m of list){p.make(m); const sc=-q(-beta,-alpha); p.unmake(); if(sc>=beta)return beta; if(sc>alpha)alpha=sc;} return alpha;}
  function ab(d,alpha,beta){nodes++; if(nodes>maxNodes) return evalPos(p); if(d===0) return q(alpha,beta); const list=genMoves(p); if(!list.length){return inCheck(p,p.red?0:1)?-20000+d:0;} list.sort((a,b)=>(p.b[b.to]?1:0)-(p.b[a.to]?1:0)); let bestLocal=null; for(const m of list){p.make(m); const sc=-ab(d-1,-beta,-alpha); p.unmake(); if(sc>alpha){alpha=sc; bestLocal=m;} if(alpha>=beta) break;} if(d===depth) b=bestLocal; return alpha;}
  ab(depth,-1e9,1e9); return b;}

const cvs=document.getElementById('game'), ctx=cvs.getContext('2d');
const msgBox=document.getElementById('msg');
const modal=document.getElementById('modal'), btnOptions=document.getElementById('options'), btnClose=document.getElementById('close');
const diffSel=document.getElementById('difficulty'), btnRestart=document.getElementById('restart'), btnUndo=document.getElementById('undo');

const pos=new Pos(); pos.setStart(); let selected=-1;

function fitCanvas(){
  const parent=cvs.parentElement.getBoundingClientRect();
  let w=parent.width, h=parent.height;
  const ar=9/14; // reference layout aspect
  let targetW=w, targetH=w/ar;
  if(targetH>h){ targetH=h; targetW=h*ar; }
  cvs.style.width=targetW+'px'; cvs.style.height=targetH+'px';
  cvs.width=Math.round(targetW*DPR); cvs.height=Math.round(targetH*DPR);
  drawAll();
}
window.addEventListener('resize', fitCanvas); fitCanvas();

function gridToPx(f,r){ const cw=(cvs.width/DPR)/(Files-1), ch=(cvs.height/DPR)/(Ranks-1); return [f*cw, r*ch]; }
function pxToIndex(x,y){ const cw=(cvs.width/DPR)/(Files-1), ch=(cvs.height/DPR)/(Ranks-1); const f=Math.round(x/cw), r=Math.round(y/ch); return I(Math.max(0,Math.min(8,f)), Math.max(0,Math.min(9,r))); }

function drawBoard(){
  const W=cvs.width, H=cvs.height; ctx.save(); ctx.scale(DPR,DPR);
  // inner margins similar to screenshot
  const m=12; const w=W/DPR-2*m, h=H/DPR-2*m;
  ctx.translate(m,m);
  // wooden bg already from CSS; draw grid lines
  ctx.strokeStyle='#3b2b1a'; ctx.lineWidth=2;
  const cw=w/(Files-1), ch=h/(Ranks-1);
  for(let r=0;r<Ranks;r++){ ctx.beginPath(); ctx.moveTo(0,r*ch); ctx.lineTo(w, r*ch); ctx.stroke(); }
  for(let f=0;f<Files;f++){ ctx.beginPath(); ctx.moveTo(f*cw,0); ctx.lineTo(f*cw, h); ctx.stroke(); }
  // palace diagonals
  ctx.beginPath(); ctx.moveTo(3*cw,0*ch); ctx.lineTo(5*cw,2*ch); ctx.moveTo(5*cw,0); ctx.lineTo(3*cw,2*ch); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(3*cw,7*ch); ctx.lineTo(5*cw,9*ch); ctx.moveTo(5*cw,7*ch); ctx.lineTo(3*cw,9*ch); ctx.stroke();
  // river characters
  ctx.fillStyle='#3b2b1a'; ctx.font=`${Math.floor(ch*0.6)}px serif`; ctx.textAlign='center';
  ctx.fillText('楚河', w/2 - 2*cw, 5*ch - ch*0.2);
  ctx.fillText('漢界', w/2 + 2*cw, 5*ch - ch*0.2);
  ctx.restore();
}

function drawPiece(i, pc){
  const [x,y]=gridToPx(F(i),R(i));
  const size=Math.min(cvs.width/DPR/9, cvs.height/DPR/10)*0.8;
  ctx.save(); ctx.scale(DPR,DPR);
  // gold disk with shadow
  ctx.translate(x,y);
  ctx.shadowColor='rgba(0,0,0,.35)'; ctx.shadowBlur=6; ctx.shadowOffsetY=2;
  const grd=ctx.createRadialGradient(0,-size*0.2, size*0.2, 0,0,size/2);
  grd.addColorStop(0,'#f5d890'); grd.addColorStop(1,'#b3893e');
  ctx.beginPath(); ctx.arc(0,0,size/2,0,Math.PI*2); ctx.fillStyle=grd; ctx.fill();
  ctx.lineWidth=3; ctx.strokeStyle='#7a5a25'; ctx.stroke();
  // text
  ctx.shadowColor='transparent'; ctx.fillStyle= isRed(pc)?'#c22b2b':'#1c5d34';
  ctx.font=`${Math.floor(size*0.6)}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(symbol(pc), 0, 2);
  ctx.restore();
}
function symbol(pc){switch(pc){case P.RR:return'車';case P.RN:return'馬';case P.RB:return'相';case P.RA:return'仕';case P.RK:return'帥';case P.RC:return'炮';case P.RP:return'兵';case P.BR:return'車';case P.BN:return'馬';case P.BB:return'象';case P.BA:return'士';case P.BK:return'將';case P.BC:return'炮';case P.BP:return'卒';} return '';}

function drawHints(idx){
  const moves=genMoves(pos).filter(m=>m.from===idx);
  ctx.save(); ctx.scale(DPR,DPR); ctx.fillStyle='rgba(0,0,0,.25)';
  for(const m of moves){ const [x,y]=gridToPx(F(m.to),R(m.to)); ctx.beginPath(); ctx.arc(x,y,6,0,Math.PI*2); ctx.fill(); }
  ctx.restore();
}

function drawAll(){
  ctx.clearRect(0,0,cvs.width,cvs.height);
  drawBoard(); if(selected>=0) drawHints(selected);
  for(let i=0;i<Squares;i++){ const pc=pos.b[i]; if(pc) drawPiece(i,pc); }
}

function handleTap(clientX, clientY){
  const rect=cvs.getBoundingClientRect();
  const x=clientX-rect.left, y=clientY-rect.top;
  const idx=pxToIndex(x,y);
  const pc=pos.b[idx];
  if(!pos.red) return; // red is player
  if(selected<0){
    if(pc&&isRed(pc)){ selected=idx; drawAll(); }
  }else{
    const mv = genMoves(pos).find(m=>m.from===selected && m.to===idx);
    if(mv){ pos.make(mv); selected=-1; msgBox.textContent='電腦思考中…'; drawAll(); setTimeout(aiMove, 40); }
    else if(pc&&isRed(pc)){ selected=idx; drawAll(); }
    else { selected=-1; drawAll(); }
  }
}

cvs.addEventListener('touchstart',e=>{ const t=e.changedTouches[0]; handleTap(t.clientX, t.clientY); e.preventDefault(); }, {passive:false});
cvs.addEventListener('mousedown',e=>{ handleTap(e.clientX, e.clientY); });

function aiMove(){ if(pos.red) return; const depth=parseInt(diffSel.value,10); const best=searchBest(pos, depth); if(best){ pos.make(best); } msgBox.textContent='現在該你走棋咯！'; drawAll(); checkEnd(); }
function checkEnd(){ const moves=genMoves(pos); if(!moves.length){ const msg=inCheck(pos,pos.red?0:1)?(pos.red?'黑方勝':'紅方勝'):'和棋'; setTimeout(()=>{ alert('對局結束：'+msg); pos.setStart(); selected=-1; msgBox.textContent='現在該你走棋咯！'; drawAll(); }, 50);} }

btnRestart.onclick=()=>{ pos.setStart(); selected=-1; msgBox.textContent='現在該你走棋咯！'; drawAll(); };
btnUndo.onclick=()=>{ if(pos.hist.length)pos.unmake(); if(pos.hist.length)pos.unmake(); selected=-1; msgBox.textContent='現在該你走棋咯！'; drawAll(); };
btnOptions.onclick=()=>{ modal.style.display='flex'; };
btnClose.onclick=()=>{ modal.style.display='none'; };

