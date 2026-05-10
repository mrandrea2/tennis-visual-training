
import { useState, useEffect, useRef } from "react";

const G="#00FF88",B="#00D4FF",Y="#FFE000",R="#FF2D55",O="#FF6B00",P="#CC88FF";

const FIELD_COLORS=[
  {hex:R,name:"DRITTO",zone:"DESTRA"},
  {hex:G,name:"ROVESCIO",zone:"SINISTRA"},
  {hex:Y,name:"SMORZATA",zone:"AVANTI"},
  {hex:B,name:"LOB",zone:"INDIETRO"},
  {hex:O,name:"VOLÉE",zone:"RETE"},
];
const ARROWS=["↖","↑","↗","←","→","↙","↓","↘"];
const ARROW_LABELS=["Cross Sx","Lungo Centro","Cross Dx","Sinistra","Destra","Lungo Sx","Fondo","Lungo Dx"];
const SHOTS=[
  {text:"DRITTO",color:R},{text:"ROVESCIO",color:G},{text:"VOLÉE D",color:B},
  {text:"VOLÉE R",color:O},{text:"SMASH",color:Y},{text:"PALLONETTO",color:P},{text:"SLICE",color:"#88DDFF"},
];
const FOOTWORK=[
  {text:"SPRINT DX",color:R,icon:"→⚡"},{text:"SPRINT SX",color:G,icon:"⚡←"},
  {text:"AVANTI",color:Y,icon:"⚡↑"},{text:"INDIETRO",color:B,icon:"↓⚡"},
  {text:"DIAG. DX",color:O,icon:"↗⚡"},{text:"DIAG. SX",color:P,icon:"⚡↖"},
  {text:"SPLIT STEP",color:"#fff",icon:"✦"},
];
const TACTICS=[
  {text:"APRI IL CAMPO",sub:"Cross + inside-out",color:R},
  {text:"CAMBIA RITMO",sub:"Slice basso + avanza",color:B},
  {text:"ATTACCA RETE",sub:"Approach + volée",color:G},
  {text:"DIFESA",sub:"Cedi campo + lob",color:Y},
  {text:"INSIDE-IN",sub:"Dritto inside-in",color:O},
  {text:"SMASH",sub:"Posizionati + smash",color:P},
];

const FIELD_EX=[
  {id:"f_color",icon:"🟥",name:"Colore → Colpo",desc:"Il colore indica il colpo"},
  {id:"f_arrow",icon:"🏹",name:"Freccia → Dir.",desc:"La freccia = dove colpire"},
  {id:"f_shot",icon:"🎾",name:"Nome Colpo",desc:"Leggi ed esegui"},
  {id:"f_foot",icon:"👟",name:"Footwork",desc:"Movimento da fare"},
  {id:"f_tactic",icon:"♟️",name:"Tattica",desc:"Situazione tattica"},
  {id:"f_light",icon:"🚦",name:"Semaforo",desc:"Verde=rete · Rosso=fondo"},
  {id:"f_num",icon:"🔢",name:"Numero Zona",desc:"Zona dove colpire"},
  {id:"f_combo",icon:"⚡",name:"Colpo+Dir.",desc:"Colpo e direzione insieme"},
];
const COGN_EX=[
  {id:"c_even",icon:"🔢",name:"Pari/Dispari",desc:"Verde=pari · Rosso=dispari"},
  {id:"c_color",icon:"🎨",name:"Colore Giusto",desc:"Tocca il colore nominato"},
  {id:"c_stroop",icon:"🧠",name:"Stroop Test",desc:"Tocca il COLORE del testo"},
  {id:"c_math",icon:"➕",name:"Calcolo Rapido",desc:">10=DX · ≤10=SX"},
  {id:"c_opposite",icon:"🚀",name:"Contrario",desc:"Fai sempre il contrario!"},
  {id:"c_seq",icon:"🔗",name:"Memoria Flash",desc:"Memorizza e riproduci"},
];

function rnd(arr){return arr[Math.floor(Math.random()*arr.length)];}

function genField(id){
  if(id==="f_color")return{k:"f_color",d:rnd(FIELD_COLORS)};
  if(id==="f_arrow"){const i=Math.floor(Math.random()*ARROWS.length);return{k:"f_arrow",d:{a:ARROWS[i],l:ARROW_LABELS[i]}};}
  if(id==="f_shot")return{k:"f_shot",d:rnd(SHOTS)};
  if(id==="f_foot")return{k:"f_foot",d:rnd(FOOTWORK)};
  if(id==="f_tactic")return{k:"f_tactic",d:rnd(TACTICS)};
  if(id==="f_light"){const go=Math.random()>.5;return{k:"f_light",d:{go,col:go?G:R,label:go?"VAI A RETE":"RIMANI FONDO",sub:go?"avanza e concludi":"difendi da fondo"}};}
  if(id==="f_num")return{k:"f_num",d:Math.floor(Math.random()*9)+1};
  if(id==="f_combo")return{k:"f_combo",d:{shot:rnd(SHOTS),arrow:rnd(ARROWS)}};
  return{k:"f_color",d:rnd(FIELD_COLORS)};
}

function genCogn(id){
  if(id==="c_even"){const n=Math.floor(Math.random()*20)+1;return{k:"c_even",d:{n,ans:n%2===0?"green":"red"}};}
  if(id==="c_color"){
    const pool=[{hex:R,name:"ROSSO"},{hex:G,name:"VERDE"},{hex:B,name:"BLU"},{hex:Y,name:"GIALLO"}];
    const shown=[];const used=new Set();
    while(shown.length<3){const c=rnd(pool);if(!used.has(c.name)){used.add(c.name);shown.push(c);}}
    return{k:"c_color",d:{shown,correct:rnd(shown)}};
  }
  if(id==="c_stroop"){
    const pool=[{w:"ROSSO",h:R},{w:"VERDE",h:G},{w:"BLU",h:B},{w:"GIALLO",h:Y}];
    const wi=rnd(pool),ci=rnd(pool.filter(x=>x.h!==wi.h));
    return{k:"c_stroop",d:{word:wi.w,displayColor:ci.h,correctColor:ci.h,correctName:ci.w}};
  }
  if(id==="c_math"){const a=Math.floor(Math.random()*9)+1,b=Math.floor(Math.random()*9)+1;return{k:"c_math",d:{a,b,ans:a+b>10?"right":"left"}};}
  if(id==="c_opposite"){const dirs=[{a:"←",opp:"right"},{a:"→",opp:"left"},{a:"↑",opp:"down"},{a:"↓",opp:"up"}];return{k:"c_opposite",d:rnd(dirs)};}
  if(id==="c_seq"){const cols=[{h:R,id:"r"},{h:G,id:"g"},{h:B,id:"b"},{h:Y,id:"y"}];return{k:"c_seq",d:{seq:Array.from({length:4},()=>rnd(cols))}};}
  return{k:"c_even",d:{n:4,ans:"green"}};
}

function FieldView({stim,prog}){
  if(!stim)return<div style={{color:"#444",fontWeight:700,letterSpacing:3,animation:"blink 1s infinite",fontSize:18}}>PRONTO…</div>;
  const bar=<div style={{position:"absolute",bottom:0,left:0,height:6,background:G,width:`${prog*100}%`,transition:"width .08s linear",borderRadius:"0 4px 4px 0",boxShadow:`0 0 8px ${G}99`}}/>;
  const w={textAlign:"center",padding:"20px 20px 18px",animation:"popin .3s ease",width:"100%",position:"relative"};
  if(stim.k==="f_color")return(<div style={w}><div style={{width:155,height:155,borderRadius:"50%",background:stim.d.hex,margin:"0 auto 16px",boxShadow:`0 0 80px ${stim.d.hex}cc`}}/><div style={{fontSize:40,fontWeight:900,color:stim.d.hex,letterSpacing:3,textShadow:`0 0 20px ${stim.d.hex}`}}>{stim.d.name}</div><div style={{fontSize:13,color:"#555",marginTop:6}}>zona: {stim.d.zone}</div>{bar}</div>);
  if(stim.k==="f_arrow")return(<div style={w}><div style={{fontSize:120,lineHeight:1,color:Y,filter:`drop-shadow(0 0 30px ${Y})`}}>{stim.d.a}</div><div style={{fontSize:22,fontWeight:800,color:Y,marginTop:8,letterSpacing:2}}>{stim.d.l}</div>{bar}</div>);
  if(stim.k==="f_shot")return(<div style={w}><div style={{fontSize:56,fontWeight:900,color:stim.d.color,textShadow:`0 0 30px ${stim.d.color}`,letterSpacing:4}}>{stim.d.text}</div><div style={{fontSize:13,color:"#555",marginTop:10}}>esegui il colpo</div>{bar}</div>);
  if(stim.k==="f_foot")return(<div style={w}><div style={{fontSize:52,marginBottom:8,filter:`drop-shadow(0 0 16px ${stim.d.color})`}}>{stim.d.icon}</div><div style={{fontSize:36,fontWeight:900,color:stim.d.color,textShadow:`0 0 20px ${stim.d.color}`,letterSpacing:2}}>{stim.d.text}</div>{bar}</div>);
  if(stim.k==="f_tactic")return(<div style={w}><div style={{fontSize:30,fontWeight:900,color:stim.d.color,letterSpacing:2,textShadow:`0 0 20px ${stim.d.color}`,marginBottom:10}}>{stim.d.text}</div><div style={{fontSize:16,color:"#aaa",background:"#ffffff11",padding:"8px 18px",borderRadius:10,display:"inline-block"}}>{stim.d.sub}</div>{bar}</div>);
  if(stim.k==="f_light")return(<div style={w}><div style={{width:130,height:130,borderRadius:"50%",background:stim.d.col,margin:"0 auto 14px",boxShadow:`0 0 80px ${stim.d.col}ee`}}/><div style={{fontSize:30,fontWeight:900,color:stim.d.col,letterSpacing:3}}>{stim.d.label}</div><div style={{fontSize:13,color:"#666",marginTop:6}}>{stim.d.sub}</div>{bar}</div>);
  if(stim.k==="f_num")return(<div style={w}><div style={{fontSize:120,fontWeight:900,color:Y,textShadow:`0 0 50px ${Y}aa`,lineHeight:1}}>{stim.d}</div><div style={{fontSize:13,color:"#555",marginTop:6}}>zona di campo</div>{bar}</div>);
  if(stim.k==="f_combo")return(<div style={w}><div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16,flexWrap:"wrap"}}><div style={{background:stim.d.shot.color+"22",border:`2px solid ${stim.d.shot.color}`,borderRadius:16,padding:"14px 22px"}}><div style={{fontSize:28,fontWeight:900,color:stim.d.shot.color}}>{stim.d.shot.text}</div></div><div style={{fontSize:32,color:"#fff",opacity:.4}}>+</div><div style={{background:Y+"22",border:`2px solid ${Y}`,borderRadius:16,padding:"14px 22px"}}><div style={{fontSize:60,color:Y,lineHeight:1}}>{stim.d.arrow}</div></div></div>{bar}</div>);
  return null;
}

function CognView({stim,onAnswer,feedback,seqPhase,seqUser}){
  if(!stim)return<div style={{color:"#444",fontWeight:700,letterSpacing:3,animation:"blink 1s infinite",fontSize:18}}>PRONTO…</div>;
  const fb=(id)=>{if(!feedback||feedback.id!==id)return{};return feedback.correct?{boxShadow:`0 0 28px ${G}`,borderColor:G,background:G+"22"}:{boxShadow:`0 0 28px ${R}`,borderColor:R,background:R+"22"};};
  if(stim.k==="c_even")return(<div style={{textAlign:"center",padding:16,width:"100%",animation:"popin .3s ease"}}><div style={{fontSize:96,fontWeight:900,color:Y,textShadow:`0 0 40px ${Y}aa`,lineHeight:1,marginBottom:10}}>{stim.d.n}</div><div style={{fontSize:11,color:"#555",marginBottom:20,letterSpacing:2}}>PARI → VERDE · DISPARI → ROSSO</div><div style={{display:"flex",gap:16,justifyContent:"center"}}><button onClick={()=>onAnswer(stim.d.ans==="green","green")} style={{flex:1,maxWidth:150,padding:"20px 0",fontSize:18,fontWeight:900,background:G+"22",border:`2px solid ${G}`,borderRadius:16,color:G,cursor:"pointer",...fb("green")}}>PARI ✓</button><button onClick={()=>onAnswer(stim.d.ans==="red","red")} style={{flex:1,maxWidth:150,padding:"20px 0",fontSize:18,fontWeight:900,background:R+"22",border:`2px solid ${R}`,borderRadius:16,color:R,cursor:"pointer",...fb("red")}}>DISPARI ✓</button></div></div>);
  if(stim.k==="c_color")return(<div style={{textAlign:"center",padding:16,width:"100%",animation:"popin .3s ease"}}><div style={{fontSize:20,fontWeight:800,color:"#ccc",marginBottom:22,letterSpacing:2}}>Tocca: <span style={{color:"#fff"}}>{stim.d.correct.name}</span></div><div style={{display:"flex",gap:18,justifyContent:"center"}}>{stim.d.shown.map((c,i)=><button key={i} onClick={()=>onAnswer(c.name===stim.d.correct.name,c.name)} style={{width:90,height:90,borderRadius:"50%",background:c.hex,border:`4px solid ${c.hex}`,cursor:"pointer",boxShadow:`0 0 24px ${c.hex}88`,transition:"all .15s",...fb(c.name)}}/>)}</div></div>);
  if(stim.k==="c_stroop")return(<div style={{textAlign:"center",padding:16,width:"100%",animation:"popin .3s ease"}}><div style={{fontSize:11,color:"#555",letterSpacing:3,marginBottom:14}}>TOCCA IL COLORE DEL TESTO (non la parola!)</div><div style={{fontSize:68,fontWeight:900,color:stim.d.displayColor,textShadow:`0 0 20px ${stim.d.displayColor}`,marginBottom:18}}>{stim.d.word}</div><div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>{[{h:R,n:"ROSSO"},{h:G,n:"VERDE"},{h:B,n:"BLU"},{h:Y,n:"GIALLO"}].map((c,i)=><button key={i} onClick={()=>onAnswer(c.h===stim.d.correctColor,c.n)} style={{padding:"12px 16px",borderRadius:12,background:c.h+"22",border:`2px solid ${c.h}`,color:c.h,fontWeight:800,fontSize:14,cursor:"pointer",letterSpacing:1,...fb(c.n)}}>{c.n}</button>)}</div></div>);
  if(stim.k==="c_math")return(<div style={{textAlign:"center",padding:16,width:"100%",animation:"popin .3s ease"}}><div style={{fontSize:11,color:"#555",letterSpacing:2,marginBottom:10}}>&gt;10 → DESTRA · ≤10 → SINISTRA</div><div style={{fontSize:76,fontWeight:900,color:"#fff",marginBottom:18,lineHeight:1}}>{stim.d.a} + {stim.d.b}</div><div style={{display:"flex",gap:16,justifyContent:"center"}}><button onClick={()=>onAnswer(stim.d.ans==="left","left")} style={{flex:1,maxWidth:148,padding:"20px 0",fontSize:17,fontWeight:900,background:B+"22",border:`2px solid ${B}`,borderRadius:16,color:B,cursor:"pointer",...fb("left")}}>← ≤ 10</button><button onClick={()=>onAnswer(stim.d.ans==="right","right")} style={{flex:1,maxWidth:148,padding:"20px 0",fontSize:17,fontWeight:900,background:O+"22",border:`2px solid ${O}`,borderRadius:16,color:O,cursor:"pointer",...fb("right")}}>{">"} 10 →</button></div></div>);
  if(stim.k==="c_opposite")return(<div style={{textAlign:"center",padding:16,width:"100%",animation:"popin .3s ease"}}><div style={{fontSize:11,color:"#555",letterSpacing:3,marginBottom:10}}>TOCCA IL LATO OPPOSTO!</div><div style={{fontSize:110,color:Y,filter:`drop-shadow(0 0 24px ${Y})`,marginBottom:16,lineHeight:1}}>{stim.d.a}</div><div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>{[{l:"← SX",id:"left"},{l:"↑ SU",id:"up"},{l:"↓ GIÙ",id:"down"},{l:"DX →",id:"right"}].map(b=><button key={b.id} onClick={()=>onAnswer(b.id===stim.d.opp,b.id)} style={{padding:"14px 13px",borderRadius:12,background:"#ffffff0a",border:"1px solid #333",color:"#ccc",fontWeight:800,fontSize:14,cursor:"pointer",...fb(b.id)}}>{b.l}</button>)}</div></div>);
  if(stim.k==="c_seq"){
    if(seqPhase==="show")return(<div style={{textAlign:"center",padding:16,width:"100%",animation:"popin .3s ease"}}><div style={{fontSize:11,color:"#555",letterSpacing:3,marginBottom:18}}>MEMORIZZA LA SEQUENZA</div><div style={{display:"flex",gap:14,justifyContent:"center"}}>{stim.d.seq.map((c,i)=><div key={i} style={{width:62,height:62,borderRadius:14,background:c.h,boxShadow:`0 0 22px ${c.h}88`}}/>)}</div></div>);
    return(<div style={{textAlign:"center",padding:16,width:"100%"}}><div style={{fontSize:11,color:"#555",letterSpacing:3,marginBottom:10}}>TOCCA NELL'ORDINE ({seqUser.length}/{stim.d.seq.length})</div><div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:18}}>{stim.d.seq.map((_,i)=><div key={i} style={{width:20,height:20,borderRadius:"50%",background:i<seqUser.length?seqUser[i].h:"#222",border:"1px solid #444",transition:"background .2s"}}/>)}</div><div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap"}}>{[{h:R,id:"r"},{h:G,id:"g"},{h:B,id:"b"},{h:Y,id:"y"}].map(c=><button key={c.id} onClick={()=>onAnswer(null,c.id,c)} style={{width:70,height:70,borderRadius:14,background:c.h,boxShadow:`0 0 18px ${c.h}88`,border:"none",cursor:"pointer"}}/>)}</div></div>);
  }
  return null;
}

function Ring({pct,label}){
  const r=56,circ=2*Math.PI*r,col=pct<0.3?R:pct<0.6?Y:G;
  return(<div style={{position:"relative",width:132,height:132,marginBottom:16}}><svg width="132" height="132" viewBox="0 0 132 132" style={{transform:"rotate(-90deg)"}}><circle cx="66" cy="66" r={r} fill="none" stroke="#1a1a2e" strokeWidth="8"/><circle cx="66" cy="66" r={r} fill="none" stroke={col} strokeWidth="8" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ*(1-Math.max(0,pct))} style={{transition:"stroke-dashoffset 1s linear,stroke .4s"}}/></svg><div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center"}}><div style={{fontWeight:900,fontSize:28,color:col,textShadow:`0 0 14px ${col}`}}>{label}</div><div style={{fontSize:8,color:"#555",letterSpacing:2}}>SEC</div></div></div>);
}

function ExCard({ex,sel,onSel,ac}){
  const s=sel===ex.id;
  return(<div onClick={()=>onSel(ex.id)} style={{background:s?`${ac}0d`:"#0e0e1c",border:`2px solid ${s?ac:"#1e1e35"}`,borderRadius:14,padding:"14px 11px",cursor:"pointer",textAlign:"center",position:"relative",transition:"all .2s",boxShadow:s?`0 0 18px ${ac}33`:"none"}}>{s&&<div style={{position:"absolute",top:6,right:6,width:18,height:18,background:ac,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#000",fontWeight:900}}>✓</div>}<div style={{fontSize:26,marginBottom:6}}>{ex.icon}</div><div style={{fontSize:11,fontWeight:700,marginBottom:3,color:"#eee"}}>{ex.name}</div><div style={{fontSize:10,color:"#555",lineHeight:1.4}}>{ex.desc}</div></div>);
}

function Rng({label,val,min,max,step,set,fmt}){
  return(<div><div style={{fontSize:10,fontWeight:700,letterSpacing:2,color:"#666",textTransform:"uppercase",marginBottom:4}}>{label}: <span style={{color:G,fontSize:14,fontFamily:"monospace"}}>{fmt?fmt(val):val}</span></div><input type="range" min={min} max={max} step={step} value={val} onChange={e=>set(Number(e.target.value))} style={{width:"100%",accentColor:G,cursor:"pointer"}}/></div>);
}

function Stat({v,l,c}){
  return(<div style={{background:"#0e0e1c",border:"1px solid #1e1e35",borderRadius:13,padding:16,textAlign:"center"}}><div style={{fontWeight:900,fontSize:22,color:c,marginBottom:4}}>{v}</div><div style={{fontSize:9,color:"#555",letterSpacing:2,textTransform:"uppercase"}}>{l}</div></div>);
}

export default function App(){
  const [screen,setScreen]=useState("home");
  const [exId,setExId]=useState("f_color");
  const [interval,setIv]=useState(3);
  const [duration,setDur]=useState(60);
  const [countdown,setCountdown]=useState(null);
  const [fStim,setFStim]=useState(null);
  const [fProg,setFProg]=useState(1);
  const [fCount,setFCount]=useState(0);
  const [fTime,setFTime]=useState(60);
  const [cStim,setCStim]=useState(null);
  const [cFb,setCFb]=useState(null);
  const [cScore,setCScore]=useState(0);
  const [cOk,setCOk]=useState(0);
  const [cKo,setCKo]=useState(0);
  const [cRts,setCRts]=useState([]);
  const [cTime,setCTime]=useState(60);
  const [seqPhase,setSeqPhase]=useState("show");
  const [seqUser,setSeqUser]=useState([]);
  const [flash,setFlash]=useState(null);
  const [results,setResults]=useState(null);

  const tR=useRef(null),pR=useRef(null),sR=useRef(null);
  const cognAt=useRef(0),exR=useRef(exId),ivR=useRef(interval),fCR=useRef(0),fbL=useRef(false);

  useEffect(()=>{exR.current=exId;},[exId]);
  useEffect(()=>{ivR.current=interval;},[interval]);
  useEffect(()=>{fCR.current=fCount;},[fCount]);

  const stopAll=()=>{clearInterval(tR.current);clearInterval(pR.current);clearTimeout(sR.current);};
  const goHome=()=>{stopAll();setScreen("home");setFStim(null);setCStim(null);setResults(null);setCountdown(null);};

  useEffect(()=>{
    if(countdown===null)return;
    if(countdown===0){setCountdown(null);return;}
    const t=setTimeout(()=>setCountdown(c=>c-1),1000);
    return()=>clearTimeout(t);
  },[countdown]);

  const launchField=()=>{
    setFStim(genField(exR.current));setFProg(1);setFCount(c=>c+1);
    const ms=ivR.current*1000;let el=0;
    clearInterval(pR.current);
    pR.current=setInterval(()=>{el+=50;setFProg(1-el/ms);if(el>=ms){clearInterval(pR.current);launchField();}},50);
  };

  const startField=()=>{
    stopAll();setFStim(null);setFCount(0);setFProg(1);setFTime(duration);
    setScreen("trainingField");setCountdown(3);
    setTimeout(()=>{
      let tl=duration;
      tR.current=setInterval(()=>{tl--;setFTime(tl);if(tl<=0){stopAll();setResults({type:"field",count:fCR.current,dur:duration,iv:interval});setScreen("results");}},1000);
      launchField();
    },3300);
  };

  const launchCogn=()=>{
    const s=genCogn(exR.current);
    setCStim(s);setCFb(null);setSeqPhase("show");setSeqUser([]);
    cognAt.current=Date.now();fbL.current=false;
    if(s.k==="c_seq"){sR.current=setTimeout(()=>{setSeqPhase("input");cognAt.current=Date.now();},2200);}
  };

  const startCogn=()=>{
    stopAll();setCStim(null);setCScore(0);setCOk(0);setCKo(0);setCRts([]);setCTime(duration);
    setCFb(null);setSeqPhase("show");setSeqUser([]);
    setScreen("trainingCogn");setCountdown(3);
    setTimeout(()=>{
      let tl=duration;
      tR.current=setInterval(()=>{
        tl--;setCTime(tl);
        if(tl<=0){
          stopAll();
          setCRts(rts=>{setCScore(sc=>{setCOk(ok=>{setCKo(ko=>{
            const avg=rts.length?Math.round(rts.reduce((a,b)=>a+b,0)/rts.length):0;
            setResults({type:"cogn",score:sc,ok,ko,avg,total:ok+ko});return ko;});return ok;});return sc;});return rts;});
          setScreen("results");
        }
      },1000);
      launchCogn();
    },3300);
  };

  const handleCogn=(correct,id,extra)=>{
    if(fbL.current)return;
    if(cStim?.k==="c_seq"){
      const seq=cStim.d.seq,nu=[...seqUser,extra];
      setSeqUser(nu);
      if(nu[nu.length-1].id!==seq[nu.length-1].id){
        fbL.current=true;setCFb({correct:false,id});setCKo(k=>k+1);
        setFlash("red");setTimeout(()=>setFlash(null),250);
        sR.current=setTimeout(()=>launchCogn(),900);
      }else if(nu.length===seq.length){
        fbL.current=true;
        const rt=Date.now()-cognAt.current;
        setCRts(p=>[...p,rt]);setCOk(c=>c+1);setCScore(s=>s+15);
        setCFb({correct:true,id});setFlash("green");setTimeout(()=>setFlash(null),250);
        sR.current=setTimeout(()=>launchCogn(),700);
      }
      return;
    }
    fbL.current=true;
    const rt=Date.now()-cognAt.current;
    clearTimeout(sR.current);setCFb({correct,id});
    if(correct){
      setCRts(p=>[...p,rt]);setCOk(c=>c+1);
      setCScore(s=>s+(rt<400?10:rt<700?7:rt<1000?5:3));
      setFlash("green");setTimeout(()=>setFlash(null),250);
    }else{setCKo(k=>k+1);setFlash("red");setTimeout(()=>setFlash(null),250);}
    sR.current=setTimeout(()=>launchCogn(),700);
  };

  const avgRt=cRts.length?Math.round(cRts.reduce((a,b)=>a+b,0)/cRts.length):null;
  const card={background:"#0e0e1c",border:"1px solid #1e1e35",borderRadius:18,padding:20};
  const btn=(col=G,sm=false)=>({border:col==="gray"?"1px solid #333":"none",borderRadius:sm?8:12,padding:sm?"7px 13px":"11px 24px",fontSize:sm?12:14,fontWeight:800,cursor:"pointer",letterSpacing:1,textTransform:"uppercase",background:col==="gray"?"transparent":`linear-gradient(135deg,${col},${col}bb)`,color:col==="gray"?"#888":"#000",boxShadow:col==="gray"?"none":`0 4px 16px ${col}44`});

  return(
    <div style={{fontFamily:"'Inter',system-ui,sans-serif",background:"#07070f",color:"#eeeeff",minHeight:"100vh"}}>
      <style>{`
        @keyframes popin{from{transform:scale(.05);opacity:0}to{transform:scale(1);opacity:1}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
        @keyframes fadein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ping{from{transform:scale(1.7);opacity:0}to{transform:scale(1);opacity:1}}
        button:active{transform:scale(.93)!important}
      `}</style>

      {flash&&<div style={{position:"fixed",inset:0,background:flash==="green"?G:R,opacity:.15,pointerEvents:"none",zIndex:9999}}/>}
      {countdown!==null&&(
        <div style={{position:"fixed",inset:0,background:"rgba(7,7,15,.96)",zIndex:5000,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <div key={countdown} style={{fontSize:120,fontWeight:900,color:G,textShadow:`0 0 60px ${G}`,animation:"ping .8s ease"}}>{countdown}</div>
          <div style={{fontSize:15,color:"#555",letterSpacing:4,marginTop:12}}>PREPARATI</div>
        </div>
      )}

      <div style={{background:"linear-gradient(135deg,#07070f,#0d0d22,#07101f)",borderBottom:`2px solid ${G}`,padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:`0 4px 28px ${G}22`}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:42,height:42,background:G,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,boxShadow:`0 0 20px ${G}99`}}>🎾</div>
          <div>
            <div style={{fontWeight:900,fontSize:17,background:`linear-gradient(90deg,${G},${B})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:2}}>VISUAL TRAINING</div>
            <div style={{fontSize:9,color:"#444",letterSpacing:3}}>TENNIS PERFORMANCE SYSTEM</div>
          </div>
        </div>
        <div style={{background:"linear-gradient(135deg,#111122,#1a1a35)",border:`1px solid ${Y}`,borderRadius:20,padding:"5px 13px",fontSize:11,color:Y,fontWeight:700,letterSpacing:1}}>⚡ ANDREA BERTELLI</div>
      </div>

      <div style={{padding:18,maxWidth:960,margin:"0 auto"}}>

        {screen==="home"&&(
          <div style={{textAlign:"center",padding:"32px 12px 20px",animation:"fadein .4s ease"}}>
            <div style={{fontWeight:900,fontSize:32,background:`linear-gradient(135deg,#fff,${G})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:10}}>ALLENA LA MENTE</div>
            <div style={{color:"#555",fontSize:14,maxWidth:460,margin:"0 auto 28px",lineHeight:1.6}}>Visual training avanzato per tennisti. Stimoli automatici per il campo oppure esercizi cognitivi touch.</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16,maxWidth:760,margin:"0 auto"}}>
              {[
                {icon:"🏟️",title:"STIMOLI CAMPO",badge:"NO TOUCH",bc:G,sub:"Lo stimolo cambia automaticamente ogni X secondi. Metti il dispositivo sul carrello e allena in campo!",col:G,go:()=>{setExId("f_color");setScreen("setupField");}},
                {icon:"🧠",title:"COGNITIVO TOUCH",badge:"TOUCH",bc:B,sub:"Tocca la risposta giusta il più veloce possibile. Stroop, calcolo, memoria flash e molto altro.",col:B,go:()=>{setExId("c_even");setScreen("setupCogn");}},
              ].map(m=>(
                <div key={m.title} onClick={m.go} style={{...card,cursor:"pointer",transition:"all .3s",padding:28,position:"relative"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=m.col;e.currentTarget.style.boxShadow=`0 8px 28px ${m.col}33`;e.currentTarget.style.transform="translateY(-4px)"}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="#1e1e35";e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="none"}}>
                  <div style={{position:"absolute",top:14,right:14,fontSize:10,background:m.bc+"22",color:m.bc,border:`1px solid ${m.bc}44`,borderRadius:6,padding:"2px 8px",fontWeight:700,letterSpacing:1}}>{m.badge}</div>
                  <div style={{fontSize:52,marginBottom:14}}>{m.icon}</div>
                  <div style={{fontWeight:900,fontSize:15,color:m.col,letterSpacing:2,marginBottom:10}}>{m.title}</div>
                  <div style={{color:"#555",fontSize:13,lineHeight:1.6}}>{m.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {screen==="setupField"&&(
          <div style={{animation:"fadein .4s ease"}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
              <button style={btn("gray",true)} onClick={goHome}>← Indietro</button>
              <span style={{fontWeight:900,fontSize:15,color:G,letterSpacing:2}}>🏟️ STIMOLI CAMPO</span>
            </div>
            <div style={{background:`${G}0d`,border:`1px solid ${G}33`,borderRadius:12,padding:"10px 16px",marginBottom:18,fontSize:13,color:`${G}bb`,lineHeight:1.6}}>
              💡 <strong>No touch</strong> — lo stimolo cambia automaticamente ogni intervallo impostato. Posiziona il dispositivo su un supporto in campo!
            </div>
            <div style={{fontWeight:800,fontSize:10,letterSpacing:3,color:G,marginBottom:12}}>🎯 SCEGLI ESERCIZIO</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:10,marginBottom:20}}>
              {FIELD_EX.map(ex=><ExCard key={ex.id} ex={ex} sel={exId} onSel={setExId} ac={G}/>)}
            </div>
            <hr style={{border:"none",borderTop:"1px solid #1e1e35",margin:"18px 0"}}/>
            <div style={{...card,marginBottom:20}}>
              <div style={{fontWeight:800,fontSize:10,letterSpacing:3,color:G,marginBottom:18}}>⚙️ IMPOSTAZIONI</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16}}>
                <Rng label="Intervallo stimolo" val={interval} min={1} max={10} step={0.5} set={setIv} fmt={v=>v+"s"}/>
                <Rng label="Durata sessione" val={duration} min={20} max={300} step={10} set={setDur} fmt={v=>v+"s"}/>
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"center"}}>
              <button style={{...btn(G),padding:"13px 44px",fontSize:15}} onClick={startField}>▶ INIZIA SESSIONE CAMPO</button>
            </div>
          </div>
        )}

        {screen==="setupCogn"&&(
          <div style={{animation:"fadein .4s ease"}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
              <button style={btn("gray",true)} onClick={goHome}>← Indietro</button>
              <span style={{fontWeight:900,fontSize:15,color:B,letterSpacing:2}}>🧠 COGNITIVO TOUCH</span>
            </div>
            <div style={{background:`${B}0d`,border:`1px solid ${B}33`,borderRadius:12,padding:"10px 16px",marginBottom:18,fontSize:13,color:`${B}bb`,lineHeight:1.6}}>
              💡 Tocca la risposta corretta <strong>il più veloce possibile</strong>. Ogni esercizio allena un aspetto diverso della reattività cognitiva.
            </div>
            <div style={{fontWeight:800,fontSize:10,letterSpacing:3,color:B,marginBottom:12}}>🎯 SCEGLI ESERCIZIO</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:10,marginBottom:20}}>
              {COGN_EX.map(ex=><ExCard key={ex.id} ex={ex} sel={exId} onSel={setExId} ac={B}/>)}
            </div>
            <hr style={{border:"none",borderTop:"1px solid #1e1e35",margin:"18px 0"}}/>
            <div style={{...card,marginBottom:20}}>
              <div style={{fontWeight:800,fontSize:10,letterSpacing:3,color:B,marginBottom:18}}>⚙️ IMPOSTAZIONI</div>
              <Rng label="Durata sessione" val={duration} min={20} max={180} step={10} set={setDur} fmt={v=>v+"s"}/>
            </div>
            <div style={{display:"flex",justifyContent:"center"}}>
              <button style={{...btn(B),padding:"13px 44px",fontSize:15}} onClick={startCogn}>▶ INIZIA ESERCIZIO COGNITIVO</button>
            </div>
          </div>
        )}

        {screen==="trainingField"&&(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",minHeight:"80vh",justifyContent:"center",animation:"fadein .4s ease"}}>
            <div style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,padding:"0 4px"}}>
              <div style={{fontSize:11,color:"#555"}}>Stimoli: <span style={{color:G,fontWeight:700}}>{fCount}</span></div>
              <div style={{fontSize:11,color:"#555"}}>Ogni <span style={{color:G,fontWeight:700}}>{interval}s</span></div>
              <button style={btn("gray",true)} onClick={goHome}>■ Stop</button>
            </div>
            <Ring pct={fTime/duration} label={fTime}/>
            <div style={{width:"100%",maxWidth:640,minHeight:230,background:"#0e0e1c",border:"2px solid #1e1e35",borderRadius:22,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",margin:"16px 0"}}>
              <FieldView stim={fStim} prog={fProg}/>
            </div>
            <div style={{fontSize:12,color:"#444",textAlign:"center",maxWidth:380,lineHeight:1.6}}>
              🏟️ Stimolo automatico ogni <strong style={{color:G}}>{interval}s</strong> — esegui il movimento in campo, non toccare lo schermo!
            </div>
          </div>
        )}

        {screen==="trainingCogn"&&(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",minHeight:"80vh",justifyContent:"center",animation:"fadein .4s ease"}}>
            <div style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,padding:"0 4px"}}>
              <div style={{display:"flex",gap:14,alignItems:"center"}}>
                <span style={{fontSize:11,color:"#555"}}>✅ <span style={{color:G,fontWeight:700}}>{cOk}</span></span>
                <span style={{fontSize:11,color:"#555"}}>❌ <span style={{color:R,fontWeight:700}}>{cKo}</span></span>
                <span style={{fontSize:12,fontWeight:700,color:Y}}>⭐ {cScore}</span>
              </div>
              <div style={{fontSize:11,color:"#555"}}>⚡ <span style={{color:B}}>{avgRt?avgRt+" ms":"—"}</span></div>
              <button style={btn("gray",true)} onClick={goHome}>■ Stop</button>
            </div>
            <Ring pct={cTime/duration} label={cTime}/>
            <div style={{width:"100%",maxWidth:640,minHeight:240,background:"#0e0e1c",border:`2px solid ${cFb?(cFb.correct?G:R):"#1e1e35"}`,borderRadius:22,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",margin:"16px 0",transition:"border-color .2s"}}>
              <CognView stim={cStim} onAnswer={handleCogn} feedback={cFb} seqPhase={seqPhase} seqUser={seqUser}/>
            </div>
            <div style={{fontSize:16,fontWeight:800,color:cFb?(cFb.correct?G:R):"transparent",textAlign:"center",height:24,transition:"color .2s"}}>
              {cFb?(cFb.correct?"✓ CORRETTO!":"✗ SBAGLIATO"):"​"}
            </div>
          </div>
        )}

        {screen==="results"&&results&&(
          <div style={{animation:"fadein .4s ease"}}>
            <div style={{fontWeight:900,fontSize:28,textAlign:"center",background:`linear-gradient(135deg,${Y},${O})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:7}}>🏆 SESSIONE COMPLETATA</div>
            <div style={{textAlign:"center",color:"#555",marginBottom:24}}>{results.type==="field"?"Ottimo lavoro in campo! 🏟️":"Esercizio cognitivo completato! 🧠"}</div>
            {results.type==="field"&&(<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:12,maxWidth:500,margin:"0 auto 28px"}}><Stat v={results.count} l="Stimoli mostrati" c={G}/><Stat v={results.dur+"s"} l="Durata" c={Y}/><Stat v={results.iv+"s"} l="Intervallo" c={B}/></div>)}
            {results.type==="cogn"&&(<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))",gap:12,maxWidth:640,margin:"0 auto 28px"}}><Stat v={results.score} l="Punteggio" c={Y}/><Stat v={results.ok} l="Corrette" c={G}/><Stat v={results.ko} l="Sbagliate" c={R}/><Stat v={results.total} l="Totali" c={B}/><Stat v={results.avg?"~"+results.avg+"ms":"—"} l="React. Media" c={P}/><Stat v={results.total>0?Math.round(results.ok/results.total*100)+"%":"—"} l="Precisione" c={O}/></div>)}
            <hr style={{border:"none",borderTop:"1px solid #1e1e35",margin:"18px 0"}}/>
            <div style={{display:"flex",gap:11,justifyContent:"center"}}>
              <button style={btn(G)} onClick={()=>{setResults(null);setScreen(results.type==="field"?"setupField":"setupCogn");}}>🔄 Rivai</button>
              <button style={btn("gray")} onClick={goHome}>🏠 Home</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
