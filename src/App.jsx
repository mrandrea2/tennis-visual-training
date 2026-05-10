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

function rnd(a){return a[Math.floor(Math.random()*a.length)];}

function genField(id){
  if(id==="f_color")return{k:"f_color",d:rnd(FIELD_COLORS)};
  if(id==="f_arrow"){const i=Math.floor(Math.random()*ARROWS.length);return{k:"f_arrow",d:{a:ARROWS[i],l:ARROW_LABELS[i]}};}
  if(id==="f_shot")return{k:"f_shot",d:rnd(SHOTS)};
  if(id==="f_foot")return{k:"f_foot",d:rnd(FOOTWORK)};
  if(id==="f_tactic")return{k:"f_tactic",d:rnd(TACTICS)};
  if(id==="f_light"){const go=Math.random()>.5;return{k:"f_light",d:{col:go?G:R,label:go?"VAI A RETE":"RIMANI FONDO",sub:go?"avanza e concludi":"difendi da fondo"}};}
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
    return{k:"c_stroop",d:{word:wi.w,displayColor:ci.h,correctColor:ci.h}};
  }
  if(id==="c_math"){const a=Math.floor(Math.random()*9)+1,b=Math.floor(Math.random()*9)+1;return{k:"c_math",d:{a,b,ans:a+b>10?"right":"left"}};}
  if(id==="c_opposite"){return{k:"c_opposite",d:rnd([{a:"←",opp:"right"},{a:"→",opp:"left"},{a:"↑",opp:"down"},{a:"↓",opp:"up"}])};}
  if(id==="c_seq"){const cols=[{h:R,id:"r"},{h:G,id:"g"},{h:B,id:"b"},{h:Y,id:"y"}];return{k:"c_seq",d:{seq:Array.from({length:4},()=>rnd(cols))}};}
  return{k:"c_even",d:{n:4,ans:"green"}};
}

// ─── STIMOLO CAMPO — enorme, leggibile a distanza ────────────────────────────
function FieldView({stim,prog}){
  if(!stim)return <div style={{color:"#555",fontWeight:800,letterSpacing:4,fontSize:20,animation:"blink 1s infinite"}}>PRONTO…</div>;
  const bar=(
    <div style={{position:"absolute",bottom:0,left:0,right:0,height:8,background:"#0a0a14"}}>
      <div style={{height:"100%",background:G,width:`${prog*100}%`,transition:"width .08s linear",boxShadow:`0 0 12px ${G}99`}}/>
    </div>
  );
  const w={display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
    textAlign:"center",padding:"20px 12px 28px",width:"100%",position:"relative",
    animation:"popin .25s ease"};

  if(stim.k==="f_color")return(
    <div style={w}>
      <div style={{width:"clamp(140px,42vw,220px)",height:"clamp(140px,42vw,220px)",borderRadius:"50%",
        background:stim.d.hex,margin:"0 auto 18px",
        boxShadow:`0 0 60px ${stim.d.hex}, 0 0 120px ${stim.d.hex}55`}}/>
      <div style={{fontSize:"clamp(38px,11vw,80px)",fontWeight:900,color:"#fff",letterSpacing:4,lineHeight:1,
        textShadow:`0 0 30px ${stim.d.hex}, 0 3px 6px #000`}}>{stim.d.name}</div>
      <div style={{fontSize:"clamp(16px,4.5vw,26px)",color:"#ccc",marginTop:10,fontWeight:700,letterSpacing:2}}>
        zona: {stim.d.zone}
      </div>
      {bar}
    </div>
  );
  if(stim.k==="f_arrow")return(
    <div style={w}>
      <div style={{fontSize:"clamp(110px,30vw,200px)",lineHeight:1,color:Y,
        filter:`drop-shadow(0 0 40px ${Y}) drop-shadow(0 0 80px ${Y}44)`}}>{stim.d.a}</div>
      <div style={{fontSize:"clamp(24px,7vw,50px)",fontWeight:900,color:"#fff",marginTop:10,letterSpacing:2,
        textShadow:`0 0 20px ${Y}, 0 2px 4px #000`}}>{stim.d.l}</div>
      {bar}
    </div>
  );
  if(stim.k==="f_shot")return(
    <div style={w}>
      <div style={{fontSize:"clamp(52px,15vw,110px)",fontWeight:900,color:stim.d.color,letterSpacing:4,lineHeight:1,
        textShadow:`0 0 40px ${stim.d.color}, 0 3px 6px #000`}}>{stim.d.text}</div>
      <div style={{fontSize:"clamp(16px,4.5vw,26px)",color:"#ccc",marginTop:14,fontWeight:700,letterSpacing:2}}>esegui il colpo</div>
      {bar}
    </div>
  );
  if(stim.k==="f_foot")return(
    <div style={w}>
      <div style={{fontSize:"clamp(60px,18vw,120px)",marginBottom:10,
        filter:`drop-shadow(0 0 24px ${stim.d.color})`}}>{stim.d.icon}</div>
      <div style={{fontSize:"clamp(36px,11vw,80px)",fontWeight:900,color:stim.d.color,letterSpacing:3,lineHeight:1,
        textShadow:`0 0 30px ${stim.d.color}, 0 3px 6px #000`}}>{stim.d.text}</div>
      {bar}
    </div>
  );
  if(stim.k==="f_tactic")return(
    <div style={w}>
      <div style={{fontSize:"clamp(30px,9vw,64px)",fontWeight:900,color:stim.d.color,letterSpacing:2,
        textShadow:`0 0 30px ${stim.d.color}, 0 2px 4px #000`,marginBottom:14,lineHeight:1.1}}>{stim.d.text}</div>
      <div style={{fontSize:"clamp(18px,5vw,32px)",color:"#ddd",background:"#ffffff14",
        padding:"10px 22px",borderRadius:12,fontWeight:700}}>{stim.d.sub}</div>
      {bar}
    </div>
  );
  if(stim.k==="f_light")return(
    <div style={w}>
      <div style={{width:"clamp(130px,38vw,200px)",height:"clamp(130px,38vw,200px)",borderRadius:"50%",
        background:stim.d.col,margin:"0 auto 18px",
        boxShadow:`0 0 80px ${stim.d.col}, 0 0 160px ${stim.d.col}55`}}/>
      <div style={{fontSize:"clamp(28px,9vw,60px)",fontWeight:900,color:"#fff",letterSpacing:3,lineHeight:1,
        textShadow:`0 0 30px ${stim.d.col}, 0 2px 4px #000`}}>{stim.d.label}</div>
      <div style={{fontSize:"clamp(16px,4.5vw,26px)",color:"#ccc",marginTop:10,fontWeight:700}}>{stim.d.sub}</div>
      {bar}
    </div>
  );
  if(stim.k==="f_num")return(
    <div style={w}>
      <div style={{fontSize:"clamp(110px,34vw,240px)",fontWeight:900,color:Y,lineHeight:1,
        textShadow:`0 0 60px ${Y}, 0 4px 8px #000`}}>{stim.d}</div>
      <div style={{fontSize:"clamp(16px,4.5vw,26px)",color:"#ccc",marginTop:8,fontWeight:700,letterSpacing:2}}>zona di campo</div>
      {bar}
    </div>
  );
  if(stim.k==="f_combo")return(
    <div style={w}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"clamp(10px,3vw,20px)",flexWrap:"wrap"}}>
        <div style={{background:stim.d.shot.color+"33",border:`3px solid ${stim.d.shot.color}`,
          borderRadius:20,padding:"clamp(12px,3vw,20px) clamp(16px,4vw,28px)",
          boxShadow:`0 0 30px ${stim.d.shot.color}66`}}>
          <div style={{fontSize:"clamp(30px,9vw,60px)",fontWeight:900,color:stim.d.shot.color,
            textShadow:`0 0 20px ${stim.d.shot.color}`}}>{stim.d.shot.text}</div>
        </div>
        <div style={{fontSize:"clamp(26px,7vw,44px)",color:"#fff",opacity:.4,fontWeight:900}}>+</div>
        <div style={{background:Y+"33",border:`3px solid ${Y}`,borderRadius:20,
          padding:"clamp(12px,3vw,20px) clamp(16px,4vw,28px)",boxShadow:`0 0 30px ${Y}66`}}>
          <div style={{fontSize:"clamp(60px,18vw,120px)",color:Y,lineHeight:1,
            textShadow:`0 0 30px ${Y}`}}>{stim.d.arrow}</div>
        </div>
      </div>
      {bar}
    </div>
  );
  return null;
}

// ─── STIMOLO COGNITIVO ────────────────────────────────────────────────────────
function CognView({stim,onAnswer,feedback,seqPhase,seqUser}){
  if(!stim)return <div style={{color:"#555",fontWeight:800,letterSpacing:4,fontSize:20,animation:"blink 1s infinite"}}>PRONTO…</div>;
  const fb=(id)=>{
    if(!feedback||feedback.id!==id)return{};
    return feedback.correct
      ?{boxShadow:`0 0 32px ${G}`,borderColor:G,background:G+"33"}
      :{boxShadow:`0 0 32px ${R}`,borderColor:R,background:R+"33"};
  };

  if(stim.k==="c_even")return(
    <div style={{textAlign:"center",padding:"18px 14px",width:"100%"}}>
      <div style={{fontSize:"clamp(88px,26vw,160px)",fontWeight:900,color:"#fff",lineHeight:1,marginBottom:10,
        textShadow:`0 0 40px ${Y}88, 0 4px 8px #000`}}>{stim.d.n}</div>
      <div style={{fontSize:"clamp(13px,3.5vw,18px)",color:"#ccc",marginBottom:20,letterSpacing:2,fontWeight:800}}>
        PARI → VERDE &nbsp;·&nbsp; DISPARI → ROSSO
      </div>
      <div style={{display:"flex",gap:14,justifyContent:"center",maxWidth:380,margin:"0 auto"}}>
        <button onClick={()=>onAnswer(stim.d.ans==="green","green")} style={{flex:1,padding:"22px 0",
          fontSize:"clamp(16px,5vw,22px)",fontWeight:900,background:G+"22",border:`3px solid ${G}`,
          borderRadius:18,color:"#fff",cursor:"pointer",textShadow:"0 1px 3px #000",...fb("green")}}>PARI ✓</button>
        <button onClick={()=>onAnswer(stim.d.ans==="red","red")} style={{flex:1,padding:"22px 0",
          fontSize:"clamp(16px,5vw,22px)",fontWeight:900,background:R+"22",border:`3px solid ${R}`,
          borderRadius:18,color:"#fff",cursor:"pointer",textShadow:"0 1px 3px #000",...fb("red")}}>DISPARI ✓</button>
      </div>
    </div>
  );
  if(stim.k==="c_color")return(
    <div style={{textAlign:"center",padding:"18px 14px",width:"100%"}}>
      <div style={{fontSize:"clamp(20px,6vw,32px)",fontWeight:900,color:"#fff",marginBottom:22,
        textShadow:"0 2px 4px #000"}}>
        Tocca: <span style={{color:stim.d.correct.hex,textShadow:`0 0 16px ${stim.d.correct.hex}`}}>{stim.d.correct.name}</span>
      </div>
      <div style={{display:"flex",gap:"clamp(14px,5vw,26px)",justifyContent:"center"}}>
        {stim.d.shown.map((c,i)=>(
          <button key={i} onClick={()=>onAnswer(c.name===stim.d.correct.name,c.name)}
            style={{width:"clamp(80px,24vw,116px)",height:"clamp(80px,24vw,116px)",borderRadius:"50%",
              background:c.hex,border:`4px solid ${c.hex}`,cursor:"pointer",
              boxShadow:`0 0 28px ${c.hex}`,...fb(c.name)}}/>
        ))}
      </div>
    </div>
  );
  if(stim.k==="c_stroop")return(
    <div style={{textAlign:"center",padding:"18px 14px",width:"100%"}}>
      <div style={{fontSize:"clamp(12px,3vw,15px)",color:"#bbb",letterSpacing:3,marginBottom:12,fontWeight:800}}>
        TOCCA IL COLORE DEL TESTO
      </div>
      <div style={{fontSize:"clamp(64px,19vw,120px)",fontWeight:900,color:stim.d.displayColor,lineHeight:1,
        marginBottom:18,textShadow:`0 0 30px ${stim.d.displayColor}, 0 3px 6px #000`}}>{stim.d.word}</div>
      <div style={{display:"flex",gap:"clamp(8px,2.5vw,12px)",justifyContent:"center",flexWrap:"wrap",padding:"0 4px"}}>
        {[{h:R,n:"ROSSO"},{h:G,n:"VERDE"},{h:B,n:"BLU"},{h:Y,n:"GIALLO"}].map((c,i)=>(
          <button key={i} onClick={()=>onAnswer(c.h===stim.d.correctColor,c.n)}
            style={{padding:"clamp(12px,3.5vw,18px) clamp(14px,4vw,22px)",borderRadius:14,
              background:c.h+"22",border:`3px solid ${c.h}`,color:"#fff",fontWeight:900,
              fontSize:"clamp(14px,4vw,20px)",cursor:"pointer",letterSpacing:1,
              textShadow:"0 1px 3px #000",...fb(c.n)}}>{c.n}</button>
        ))}
      </div>
    </div>
  );
  if(stim.k==="c_math")return(
    <div style={{textAlign:"center",padding:"18px 14px",width:"100%"}}>
      <div style={{fontSize:"clamp(12px,3vw,16px)",color:"#bbb",letterSpacing:2,marginBottom:10,fontWeight:800}}>
        &gt;10 → DESTRA &nbsp;·&nbsp; ≤10 → SINISTRA
      </div>
      <div style={{fontSize:"clamp(72px,22vw,140px)",fontWeight:900,color:"#fff",marginBottom:18,lineHeight:1,
        textShadow:"0 4px 8px #000"}}>{stim.d.a} + {stim.d.b}</div>
      <div style={{display:"flex",gap:14,justifyContent:"center",maxWidth:380,margin:"0 auto"}}>
        <button onClick={()=>onAnswer(stim.d.ans==="left","left")} style={{flex:1,padding:"22px 0",
          fontSize:"clamp(16px,5vw,22px)",fontWeight:900,background:B+"22",border:`3px solid ${B}`,
          borderRadius:18,color:"#fff",cursor:"pointer",textShadow:"0 1px 3px #000",...fb("left")}}>← ≤ 10</button>
        <button onClick={()=>onAnswer(stim.d.ans==="right","right")} style={{flex:1,padding:"22px 0",
          fontSize:"clamp(16px,5vw,22px)",fontWeight:900,background:O+"22",border:`3px solid ${O}`,
          borderRadius:18,color:"#fff",cursor:"pointer",textShadow:"0 1px 3px #000",...fb("right")}}>{">"} 10 →</button>
      </div>
    </div>
  );
  if(stim.k==="c_opposite")return(
    <div style={{textAlign:"center",padding:"18px 14px",width:"100%"}}>
      <div style={{fontSize:"clamp(12px,3vw,16px)",color:"#bbb",letterSpacing:3,marginBottom:10,fontWeight:800}}>TOCCA IL LATO OPPOSTO!</div>
      <div style={{fontSize:"clamp(96px,28vw,190px)",color:Y,lineHeight:1,marginBottom:14,
        filter:`drop-shadow(0 0 30px ${Y}) drop-shadow(0 0 60px ${Y}55)`}}>{stim.d.a}</div>
      <div style={{display:"flex",gap:"clamp(8px,2.5vw,12px)",justifyContent:"center",flexWrap:"wrap"}}>
        {[{l:"← SX",id:"left"},{l:"↑ SU",id:"up"},{l:"↓ GIÙ",id:"down"},{l:"DX →",id:"right"}].map(b=>(
          <button key={b.id} onClick={()=>onAnswer(b.id===stim.d.opp,b.id)}
            style={{padding:"clamp(14px,4vw,18px) clamp(14px,3.5vw,18px)",borderRadius:14,
              background:"#ffffff0f",border:"2px solid #444",color:"#fff",fontWeight:900,
              fontSize:"clamp(15px,4.5vw,20px)",cursor:"pointer",textShadow:"0 1px 3px #000",...fb(b.id)}}>{b.l}</button>
        ))}
      </div>
    </div>
  );
  if(stim.k==="c_seq"){
    if(seqPhase==="show")return(
      <div style={{textAlign:"center",padding:"22px 14px",width:"100%"}}>
        <div style={{fontSize:"clamp(14px,4vw,20px)",color:"#bbb",letterSpacing:3,marginBottom:20,fontWeight:800}}>MEMORIZZA LA SEQUENZA</div>
        <div style={{display:"flex",gap:"clamp(12px,4vw,20px)",justifyContent:"center"}}>
          {stim.d.seq.map((c,i)=>(
            <div key={i} style={{width:"clamp(64px,18vw,90px)",height:"clamp(64px,18vw,90px)",
              borderRadius:16,background:c.h,boxShadow:`0 0 28px ${c.h}`}}/>
          ))}
        </div>
      </div>
    );
    return(
      <div style={{textAlign:"center",padding:"18px 14px",width:"100%"}}>
        <div style={{fontSize:"clamp(14px,4vw,18px)",color:"#bbb",letterSpacing:2,marginBottom:14,fontWeight:800}}>
          TOCCA NELL'ORDINE ({seqUser.length}/{stim.d.seq.length})
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:20}}>
          {stim.d.seq.map((_,i)=>(
            <div key={i} style={{width:24,height:24,borderRadius:"50%",
              background:i<seqUser.length?seqUser[i].h:"#2a2a40",border:"2px solid #444",transition:"background .2s"}}/>
          ))}
        </div>
        <div style={{display:"flex",gap:"clamp(14px,5vw,22px)",justifyContent:"center",flexWrap:"wrap"}}>
          {[{h:R,id:"r"},{h:G,id:"g"},{h:B,id:"b"},{h:Y,id:"y"}].map(c=>(
            <button key={c.id} onClick={()=>onAnswer(null,c.id,c)}
              style={{width:"clamp(76px,22vw,104px)",height:"clamp(76px,22vw,104px)",borderRadius:18,
                background:c.h,boxShadow:`0 0 24px ${c.h}`,border:"none",cursor:"pointer"}}/>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

// ─── RING TIMER ───────────────────────────────────────────────────────────────
function Ring({pct,label}){
  const r=44,circ=2*Math.PI*r,col=pct<0.3?R:pct<0.6?Y:G;
  return(
    <div style={{position:"relative",width:100,height:100,flexShrink:0}}>
      <svg width="100" height="100" viewBox="0 0 100 100" style={{transform:"rotate(-90deg)"}}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="#1a1a2e" strokeWidth="8"/>
        <circle cx="50" cy="50" r={r} fill="none" stroke={col} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ*(1-Math.max(0,pct))}
          style={{transition:"stroke-dashoffset 1s linear,stroke .4s"}}/>
      </svg>
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center"}}>
        <div style={{fontWeight:900,fontSize:24,color:col,textShadow:`0 0 10px ${col}`}}>{label}</div>
        <div style={{fontSize:8,color:"#666",letterSpacing:2}}>SEC</div>
      </div>
    </div>
  );
}

function ExCard({ex,sel,onSel,ac}){
  const s=sel===ex.id;
  return(
    <div onClick={()=>onSel(ex.id)} style={{background:s?`${ac}18`:"#111120",border:`2px solid ${s?ac:"#252540"}`,
      borderRadius:14,padding:"12px 8px",cursor:"pointer",textAlign:"center",position:"relative",
      transition:"all .2s",boxShadow:s?`0 0 18px ${ac}44`:"none",userSelect:"none"}}>
      {s&&<div style={{position:"absolute",top:5,right:5,width:17,height:17,background:ac,borderRadius:"50%",
        display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#000",fontWeight:900}}>✓</div>}
      <div style={{fontSize:22,marginBottom:5}}>{ex.icon}</div>
      <div style={{fontSize:11,fontWeight:800,marginBottom:2,color:"#fff"}}>{ex.name}</div>
      <div style={{fontSize:9,color:"#888",lineHeight:1.4}}>{ex.desc}</div>
    </div>
  );
}

function Rng({label,val,min,max,step,set,fmt}){
  return(
    <div>
      <div style={{fontSize:12,fontWeight:800,letterSpacing:2,color:"#bbb",textTransform:"uppercase",marginBottom:8}}>
        {label}: <span style={{color:G,fontSize:18,fontWeight:900}}>{fmt?fmt(val):val}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={val}
        onChange={e=>set(Number(e.target.value))} style={{width:"100%",cursor:"pointer"}}/>
    </div>
  );
}

function Stat({v,l,c}){
  return(
    <div style={{background:"#111120",border:"1px solid #252540",borderRadius:14,padding:14,textAlign:"center"}}>
      <div style={{fontWeight:900,fontSize:22,color:c,marginBottom:3,textShadow:`0 0 8px ${c}55`}}>{v}</div>
      <div style={{fontSize:9,color:"#888",letterSpacing:2,textTransform:"uppercase"}}>{l}</div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
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
      tR.current=setInterval(()=>{tl--;setFTime(tl);
        if(tl<=0){stopAll();setResults({type:"field",count:fCR.current,dur:duration,iv:interval});setScreen("results");}
      },1000);
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
      tR.current=setInterval(()=>{tl--;setCTime(tl);
        if(tl<=0){
          stopAll();
          setCRts(rts=>{setCScore(sc=>{setCOk(ok=>{setCKo(ko=>{
            const avg=rts.length?Math.round(rts.reduce((a,b)=>a+b,0)/rts.length):0;
            setResults({type:"cogn",score:sc,ok,ko,avg,total:ok+ko});return ko;
          });return ok;});return sc;});return rts;});
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
  const card={background:"#0d0d1e",border:"1px solid #252540",borderRadius:18,padding:16};
  const btn=(col=G,sm=false)=>({
    border:col==="gray"?"1px solid #444":"none",borderRadius:sm?8:14,
    padding:sm?"8px 14px":"14px 30px",fontSize:sm?13:16,fontWeight:900,cursor:"pointer",
    letterSpacing:1,textTransform:"uppercase",
    background:col==="gray"?"transparent":`linear-gradient(135deg,${col},${col}cc)`,
    color:col==="gray"?"#aaa":"#000",boxShadow:col==="gray"?"none":`0 4px 20px ${col}55`,
    WebkitTapHighlightColor:"transparent",userSelect:"none",
  });

  return(
    <div style={{fontFamily:"system-ui,-apple-system,sans-serif",background:"#07070f",color:"#f0f0ff",
      minHeight:"100vh",maxWidth:"100vw",overflowX:"hidden"}}>
      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        @keyframes popin{from{transform:scale(.05);opacity:0}to{transform:scale(1);opacity:1}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
        @keyframes fadein{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ping{from{transform:scale(1.8);opacity:0}to{transform:scale(1);opacity:1}}
        button{-webkit-tap-highlight-color:transparent}
        button:active{transform:scale(.92)!important}
        input[type=range]{-webkit-appearance:none;height:8px;border-radius:4px;background:#1e1e35;outline:none;width:100%}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:26px;height:26px;border-radius:50%;background:${G};cursor:pointer;box-shadow:0 0 10px ${G}88}
      `}</style>

      {flash&&<div style={{position:"fixed",inset:0,background:flash==="green"?G:R,opacity:.2,
        pointerEvents:"none",zIndex:9999}}/>}

      {countdown!==null&&(
        <div style={{position:"fixed",inset:0,background:"rgba(7,7,15,.97)",zIndex:5000,
          display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <div key={countdown} style={{fontSize:"min(38vw,170px)",fontWeight:900,color:G,
            textShadow:`0 0 60px ${G}, 0 0 120px ${G}44`,animation:"ping .8s ease",lineHeight:1}}>{countdown}</div>
          <div style={{fontSize:18,color:"#888",letterSpacing:4,marginTop:18,fontWeight:700}}>PREPARATI</div>
        </div>
      )}

      {/* HEADER */}
      <div style={{background:"linear-gradient(135deg,#07070f,#0d0d22)",borderBottom:`2px solid ${G}`,
        padding:"11px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",
        boxShadow:`0 4px 20px ${G}22`,position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:36,height:36,background:G,borderRadius:"50%",display:"flex",
            alignItems:"center",justifyContent:"center",fontSize:17,
            boxShadow:`0 0 14px ${G}88`,flexShrink:0}}>🎾</div>
          <div>
            <div style={{fontWeight:900,fontSize:14,background:`linear-gradient(90deg,${G},${B})`,
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:2}}>VISUAL TRAINING</div>
            <div style={{fontSize:8,color:"#555",letterSpacing:3}}>TENNIS PERFORMANCE SYSTEM</div>
          </div>
        </div>
        {/* LINK AL SITO DI ANDREA BERTELLI */}
        <a href="https://andrea-bertelli.vercel.app" target="_blank" rel="noopener noreferrer"
          style={{background:"#0f0f22",border:`1px solid ${Y}`,borderRadius:20,padding:"5px 11px",
            fontSize:10,color:Y,fontWeight:900,letterSpacing:1,textDecoration:"none",
            boxShadow:`0 0 10px ${Y}33`,whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:4}}>
          ⚡ A. BERTELLI ↗
        </a>
      </div>

      <div style={{padding:"14px 12px",maxWidth:960,margin:"0 auto"}}>

        {/* HOME */}
        {screen==="home"&&(
          <div style={{textAlign:"center",padding:"24px 6px 16px",animation:"fadein .4s ease"}}>
            <div style={{fontWeight:900,fontSize:"clamp(28px,9vw,48px)",lineHeight:1.1,marginBottom:10,
              background:`linear-gradient(135deg,#fff,${G})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
              ALLENA LA MENTE
            </div>
            <div style={{color:"#aaa",fontSize:"clamp(13px,3.5vw,16px)",maxWidth:400,margin:"0 auto 24px",lineHeight:1.7,fontWeight:500}}>
              Visual training avanzato per tennisti.<br/>Stimoli automatici o esercizi cognitivi touch.
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,maxWidth:640,margin:"0 auto"}}>
              {[
                {icon:"🏟️",title:"STIMOLI\nCAMPO",badge:"NO TOUCH",bc:G,
                  sub:"Stimolo automatico ogni X sec. Metti il tablet sul carrello!",col:G,
                  go:()=>{setExId("f_color");setScreen("setupField");}},
                {icon:"🧠",title:"COGNITIVO\nTOUCH",badge:"TOUCH",bc:B,
                  sub:"Tocca la risposta giusta il più veloce possibile.",col:B,
                  go:()=>{setExId("c_even");setScreen("setupCogn");}},
              ].map(m=>(
                <div key={m.title} onClick={m.go} style={{...card,cursor:"pointer",transition:"all .2s",
                  padding:"20px 12px",position:"relative",userSelect:"none",
                  WebkitTapHighlightColor:"transparent"}}>
                  <div style={{position:"absolute",top:9,right:9,fontSize:9,background:m.bc+"22",color:m.bc,
                    border:`1px solid ${m.bc}55`,borderRadius:6,padding:"2px 6px",fontWeight:900,letterSpacing:1}}>
                    {m.badge}
                  </div>
                  <div style={{fontSize:"clamp(34px,10vw,52px)",marginBottom:10}}>{m.icon}</div>
                  <div style={{fontWeight:900,fontSize:"clamp(14px,4vw,18px)",color:m.col,
                    letterSpacing:1,marginBottom:8,whiteSpace:"pre-line",lineHeight:1.2}}>{m.title}</div>
                  <div style={{color:"#999",fontSize:"clamp(11px,2.8vw,13px)",lineHeight:1.5}}>{m.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SETUP CAMPO */}
        {screen==="setupField"&&(
          <div style={{animation:"fadein .4s ease"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
              <button style={btn("gray",true)} onClick={goHome}>← Indietro</button>
              <span style={{fontWeight:900,fontSize:16,color:G}}>🏟️ STIMOLI CAMPO</span>
            </div>
            <div style={{background:`${G}10`,border:`1px solid ${G}44`,borderRadius:12,
              padding:"10px 14px",marginBottom:14,fontSize:"clamp(12px,3vw,14px)",color:"#ddd",lineHeight:1.6,fontWeight:500}}>
              💡 <strong style={{color:G}}>No touch</strong> — stimolo automatico. Metti il dispositivo su un supporto in campo!
            </div>
            <div style={{fontWeight:900,fontSize:10,letterSpacing:3,color:G,marginBottom:10}}>🎯 ESERCIZIO</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:8,marginBottom:16}}>
              {FIELD_EX.map(ex=><ExCard key={ex.id} ex={ex} sel={exId} onSel={setExId} ac={G}/>)}
            </div>
            <hr style={{border:"none",borderTop:"1px solid #252540",margin:"14px 0"}}/>
            <div style={{...card,marginBottom:16}}>
              <div style={{fontWeight:900,fontSize:10,letterSpacing:3,color:G,marginBottom:16}}>⚙️ IMPOSTAZIONI</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:18}}>
                <Rng label="Intervallo stimolo" val={interval} min={1} max={10} step={0.5} set={setIv} fmt={v=>v+"s"}/>
                <Rng label="Durata sessione" val={duration} min={20} max={300} step={10} set={setDur} fmt={v=>v+"s"}/>
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"center"}}>
              <button style={{...btn(G),padding:"16px 44px",fontSize:17}} onClick={startField}>▶ INIZIA</button>
            </div>
          </div>
        )}

        {/* SETUP COGNITIVO */}
        {screen==="setupCogn"&&(
          <div style={{animation:"fadein .4s ease"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
              <button style={btn("gray",true)} onClick={goHome}>← Indietro</button>
              <span style={{fontWeight:900,fontSize:16,color:B}}>🧠 COGNITIVO TOUCH</span>
            </div>
            <div style={{background:`${B}10`,border:`1px solid ${B}44`,borderRadius:12,
              padding:"10px 14px",marginBottom:14,fontSize:"clamp(12px,3vw,14px)",color:"#ddd",lineHeight:1.6,fontWeight:500}}>
              💡 Tocca la risposta corretta <strong style={{color:B}}>il più veloce possibile</strong>. Allena la reattività cognitiva.
            </div>
            <div style={{fontWeight:900,fontSize:10,letterSpacing:3,color:B,marginBottom:10}}>🎯 ESERCIZIO</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:8,marginBottom:16}}>
              {COGN_EX.map(ex=><ExCard key={ex.id} ex={ex} sel={exId} onSel={setExId} ac={B}/>)}
            </div>
            <hr style={{border:"none",borderTop:"1px solid #252540",margin:"14px 0"}}/>
            <div style={{...card,marginBottom:16}}>
              <div style={{fontWeight:900,fontSize:10,letterSpacing:3,color:B,marginBottom:16}}>⚙️ IMPOSTAZIONI</div>
              <Rng label="Durata sessione" val={duration} min={20} max={180} step={10} set={setDur} fmt={v=>v+"s"}/>
            </div>
            <div style={{display:"flex",justifyContent:"center"}}>
              <button style={{...btn(B),padding:"16px 44px",fontSize:17}} onClick={startCogn}>▶ INIZIA</button>
            </div>
          </div>
        )}

        {/* TRAINING CAMPO */}
        {screen==="trainingField"&&(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",animation:"fadein .3s ease"}}>
            <div style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:14,color:"#ccc",fontWeight:800}}>
                Stimoli: <span style={{color:G,fontSize:18}}>{fCount}</span>
              </div>
              <Ring pct={fTime/duration} label={fTime}/>
              <button style={btn("gray",true)} onClick={goHome}>■ Stop</button>
            </div>
            {/* STIMOLO — occupa tutto lo spazio disponibile */}
            <div style={{width:"100%",background:"#0a0a18",border:"2px solid #252540",borderRadius:24,
              display:"flex",alignItems:"center",justifyContent:"center",
              position:"relative",overflow:"hidden",
              minHeight:"clamp(300px,65vw,540px)"}}>
              <FieldView stim={fStim} prog={fProg}/>
            </div>
            <div style={{fontSize:13,color:"#666",textAlign:"center",marginTop:12,lineHeight:1.6,fontWeight:600}}>
              Stimolo ogni <strong style={{color:G}}>{interval}s</strong> — esegui in campo, non toccare!
            </div>
          </div>
        )}

        {/* TRAINING COGNITIVO */}
        {screen==="trainingCogn"&&(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",animation:"fadein .3s ease"}}>
            <div style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                <div style={{display:"flex",gap:12}}>
                  <span style={{fontSize:14,color:"#ccc",fontWeight:800}}>✅ <span style={{color:G,fontSize:18,fontWeight:900}}>{cOk}</span></span>
                  <span style={{fontSize:14,color:"#ccc",fontWeight:800}}>❌ <span style={{color:R,fontSize:18,fontWeight:900}}>{cKo}</span></span>
                </div>
                <div style={{fontSize:14,color:Y,fontWeight:900}}>⭐ {cScore} pt</div>
              </div>
              <Ring pct={cTime/duration} label={cTime}/>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                <div style={{fontSize:12,color:"#888",fontWeight:700}}>⚡ {avgRt?avgRt+" ms":"—"}</div>
                <button style={btn("gray",true)} onClick={goHome}>■ Stop</button>
              </div>
            </div>
            {/* STIMOLO GRANDE */}
            <div style={{width:"100%",background:"#0a0a18",
              border:`2px solid ${cFb?(cFb.correct?G:R):"#252540"}`,
              borderRadius:24,display:"flex",alignItems:"center",justifyContent:"center",
              overflow:"hidden",transition:"border-color .15s",
              minHeight:"clamp(300px,65vw,540px)"}}>
              <CognView stim={cStim} onAnswer={handleCogn} feedback={cFb} seqPhase={seqPhase} seqUser={seqUser}/>
            </div>
            <div style={{fontSize:20,fontWeight:900,marginTop:12,height:26,textAlign:"center",
              color:cFb?(cFb.correct?G:R):"transparent",transition:"color .15s",
              textShadow:cFb?(cFb.correct?`0 0 16px ${G}`:`0 0 16px ${R}`):"none"}}>
              {cFb?(cFb.correct?"✓ CORRETTO!":"✗ SBAGLIATO"):"​"}
            </div>
          </div>
        )}

        {/* RESULTS */}
        {screen==="results"&&results&&(
          <div style={{animation:"fadein .4s ease"}}>
            <div style={{fontWeight:900,fontSize:"clamp(24px,7vw,36px)",textAlign:"center",
              background:`linear-gradient(135deg,${Y},${O})`,WebkitBackgroundClip:"text",
              WebkitTextFillColor:"transparent",marginBottom:6}}>🏆 COMPLETATO!</div>
            <div style={{textAlign:"center",color:"#aaa",marginBottom:20,fontSize:15,fontWeight:600}}>
              {results.type==="field"?"Ottimo lavoro in campo! 🏟️":"Esercizio cognitivo completato! 🧠"}
            </div>
            {results.type==="field"&&(
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,maxWidth:420,margin:"0 auto 22px"}}>
                <Stat v={results.count} l="Stimoli" c={G}/><Stat v={results.dur+"s"} l="Durata" c={Y}/><Stat v={results.iv+"s"} l="Intervallo" c={B}/>
              </div>
            )}
            {results.type==="cogn"&&(
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,maxWidth:440,margin:"0 auto 22px"}}>
                <Stat v={results.score} l="Punteggio" c={Y}/><Stat v={results.ok} l="Corrette" c={G}/><Stat v={results.ko} l="Sbagliate" c={R}/>
                <Stat v={results.total} l="Totali" c={B}/><Stat v={results.avg?"~"+results.avg+"ms":"—"} l="React." c={P}/>
                <Stat v={results.total>0?Math.round(results.ok/results.total*100)+"%":"—"} l="Precisione" c={O}/>
              </div>
            )}
            <hr style={{border:"none",borderTop:"1px solid #252540",margin:"16px 0"}}/>
            <div style={{display:"flex",gap:12,justifyContent:"center"}}>
              <button style={btn(G)} onClick={()=>{setResults(null);setScreen(results.type==="field"?"setupField":"setupCogn");}}>🔄 Rivai</button>
              <button style={btn("gray")} onClick={goHome}>🏠 Home</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
