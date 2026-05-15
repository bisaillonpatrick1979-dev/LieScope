import { useState, useEffect, useRef, useCallback } from "react";

// ── FONTS ──────────────────────────────────────────────────────────────────
(() => {
  if (document.getElementById('is-fonts')) return;
  const l = document.createElement('link'); l.id='is-fonts'; l.rel='stylesheet';
  l.href='https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&display=swap';
  document.head.appendChild(l);
  const s = document.createElement('style'); s.textContent = `
    *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
    @keyframes pulse{0%,100%{opacity:.6}50%{opacity:1}}
    @keyframes flicker{0%{opacity:0;transform:scaleY(.95)}15%{opacity:.3}20%{opacity:1}25%{opacity:.6}30%{opacity:1}100%{opacity:1}}
    @keyframes glow{0%,100%{text-shadow:0 0 8px currentColor}50%{text-shadow:0 0 24px currentColor,0 0 48px currentColor}}
    @keyframes scanBar{0%{transform:translateY(-100%)}100%{transform:translateY(600%)}}
    @keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
    @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
    @keyframes devBadge{0%{opacity:0;transform:scale(.8)}50%{opacity:1;transform:scale(1.1)}100%{opacity:1;transform:scale(1)}}
  `; document.head.appendChild(s);
})();

// ── SCAN CATALOGUE ─────────────────────────────────────────────────────────
const SCANS = [
  {
    id:'standard', name:'INTERROGATION', sub:'STANDARD PROTOCOL', level:'BASIC', price:null,
    col:{ p:'#7ab52a', a:'#c8a227', truth:'#a8d63c', lie:'#d93228', bg:'#060907' },
    op:'OPERATION TRUTHFINDER', opId:'7X-22A19',
    desc:'Protocole d\'analyse biométrique standard. Détection de déception multi-canal.',
    aiCtx:'standard CIA interrogation cold clinical analysis',
    emoji:'🎯',
  },
  {
    id:'romantic', name:'ROMANTIC TRUTH', sub:'EMOTIONAL SCAN', level:'PRO', price:1.99,
    col:{ p:'#d94060', a:'#ff80a0', truth:'#ff6090', lie:'#d93228', bg:'#090407' },
    op:'OPERATION HEARTBEAT', opId:'HB-33X7',
    desc:'Analyse micro-expressions émotionnelles. Détecte l\'amour, la jalousie, la trahison.',
    aiCtx:'romantic relationship emotional micro-expression lie detection, love betrayal jealousy',
    emoji:'💘',
  },
  {
    id:'corporate', name:'CORPORATE SCAN', sub:'BUSINESS INTEL', level:'PRO', price:1.99,
    col:{ p:'#4080c8', a:'#80b8ff', truth:'#60a0ff', lie:'#d93228', bg:'#040709' },
    op:'OPERATION BOARDROOM', opId:'BR-91K4',
    desc:'Intelligence corporative. Analyse stress financier, négociation, fraude d\'entreprise.',
    aiCtx:'corporate deception executive financial stress negotiation fraud behavioral patterns',
    emoji:'💼',
  },
  {
    id:'criminal', name:'CRIMINAL PROFILE', sub:'FORENSIC ANALYSIS', level:'ELITE', price:2.99,
    col:{ p:'#c83228', a:'#ff8040', truth:'#ff5040', lie:'#ff1a00', bg:'#090403' },
    op:'OPERATION DARKROOM', opId:'DR-66Z1',
    desc:'Profil criminel forensique. Évaluation de menace haute intensité. Niveau maximum.',
    aiCtx:'criminal forensic behavioral profiling high stakes deception threat assessment FBI style',
    emoji:'🔎',
  },
  {
    id:'deepcover', name:'DEEP COVER', sub:'COVERT ANALYSIS', level:'ELITE', price:2.99,
    col:{ p:'#9060d0', a:'#c090ff', truth:'#b080ff', lie:'#d93228', bg:'#060409' },
    op:'OPERATION PHANTOM', opId:'PH-11A9',
    desc:'Analyse agent infiltré. Contre-espionnage. Détection couverture légendée.',
    aiCtx:'deep cover spy counter-intelligence psychological warfare operative assessment covert ops',
    emoji:'👁️',
  },
  {
    id:'social', name:'SOCIAL STRESS', sub:'BEHAVIORAL SCAN', level:'PRO', price:1.99,
    col:{ p:'#20c8c0', a:'#80ffe8', truth:'#40e8e0', lie:'#d93228', bg:'#040909' },
    op:'OPERATION SOCIAL', opId:'SC-44T2',
    desc:'Dynamiques sociales et comportementales. Pression de groupe, rumeurs, manipulation.',
    aiCtx:'social behavioral dynamics group pressure interpersonal deception manipulation stress patterns',
    emoji:'🧠',
  },
];

const LEVELS = { BASIC:{label:'BASIC',col:'#7ab52a'}, PRO:{label:'PRO',col:'#c8a227'}, ELITE:{label:'ELITE',col:'#d93228'} };

// ── HELPERS ────────────────────────────────────────────────────────────────
const ls = { get:(k)=>{ try{ return JSON.parse(localStorage.getItem(k)) }catch{return null} }, set:(k,v)=>{ try{ localStorage.setItem(k,JSON.stringify(v)) }catch{} } };

// ── CANVAS WAVEFORMS ───────────────────────────────────────────────────────
const Wave = ({ w=72, h=22, speed=0.05, color='#7ab52a', kind='sine' }) => {
  const cvs=useRef(null), raf=useRef(null), t=useRef(0);
  useEffect(()=>{
    const c=cvs.current; if(!c) return;
    const ctx=c.getContext('2d');
    const draw=()=>{
      ctx.clearRect(0,0,w,h); ctx.strokeStyle=color; ctx.lineWidth=1.4; ctx.beginPath();
      for(let x=0;x<=w;x++){
        let y;
        if(kind==='ecg'){
          const cy=((x/w*1.5)+t.current)%1;
          const v=cy<.08?0:cy<.12?-6:cy<.16?11:cy<.20?-5:cy<.28?0:cy<.36?2:0;
          y=h/2-v*(h/26);
        } else if(kind==='voice'){
          y=h/2+Math.sin(x*.28+t.current*3)*3+Math.sin(x*.65+t.current*2)*2+Math.sin(x*1.1+t.current)*.8;
        } else {
          y=h/2+Math.sin(x*.18+t.current*2)*4+Math.sin(x*.42+t.current*1.4)*1.5;
        }
        x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.stroke(); t.current+=speed; raf.current=requestAnimationFrame(draw);
    };
    draw(); return ()=>cancelAnimationFrame(raf.current);
  },[w,h,speed,color,kind]);
  return <canvas ref={cvs} width={w} height={h} style={{display:'block'}}/>;
};

// ── FACIAL MESH ────────────────────────────────────────────────────────────
const Mesh = ({ on, anim, col='#7ab52a' }) => {
  const [j,setJ]=useState(0);
  useEffect(()=>{ if(!anim) return; const id=setInterval(()=>setJ(Math.random()*.35),140); return()=>clearInterval(id); },[anim]);
  const pts=[[50,18],[62,21],[73,28],[80,40],[80,55],[75,68],[65,78],[50,82],[35,78],[25,68],[20,55],[20,40],[27,28],[38,21],[38,42],[44,40],[50,41],[56,40],[62,42],[38,52],[44,50],[50,52],[56,50],[62,52],[50,62],[46,67],[50,70],[54,67],[40,75],[50,79],[60,75]];
  const conn=[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,13],[13,0],[14,15],[15,16],[16,17],[17,18],[19,20],[20,21],[21,22],[22,23],[25,26],[26,27],[27,28],[29,30],[30,31],[0,16],[7,16],[14,19],[18,23]];
  const jx=(x)=>x+(Math.random()-.5)*j, jy=(y)=>y+(Math.random()-.5)*j;
  return (
    <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
      {on && conn.map(([a,b],i)=><line key={i} x1={jx(pts[a][0])} y1={jy(pts[a][1])} x2={jx(pts[b][0])} y2={jy(pts[b][1])} stroke={col} strokeWidth=".35" opacity=".55"/>)}
      {on && pts.map(([x,y],i)=><circle key={i} cx={jx(x)} cy={jy(y)} r={i<14?.7:.9} fill={i<14?col:'#c8a227'} opacity=".9"/>)}
      {on && <>
        <path d="M3,3 L3,12 M3,3 L12,3" stroke={col} strokeWidth="1.2" fill="none"/>
        <path d="M97,3 L97,12 M97,3 L88,3" stroke={col} strokeWidth="1.2" fill="none"/>
        <path d="M3,97 L3,88 M3,97 L12,97" stroke={col} strokeWidth="1.2" fill="none"/>
        <path d="M97,97 L97,88 M97,97 L88,97" stroke={col} strokeWidth="1.2" fill="none"/>
        <line x1="50" y1="1" x2="50" y2="7" stroke={col} strokeWidth=".8"/>
        <line x1="50" y1="93" x2="50" y2="99" stroke={col} strokeWidth=".8"/>
        <line x1="1" y1="50" x2="7" y2="50" stroke={col} strokeWidth=".8"/>
        <line x1="93" y1="50" x2="99" y2="50" stroke={col} strokeWidth=".8"/>
      </>}
    </svg>
  );
};

// ── SEAL SVG ───────────────────────────────────────────────────────────────
const Seal = ({ size=44, col='#c8a227' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="48" fill="none" stroke={col} strokeWidth="1.5"/>
    <circle cx="50" cy="50" r="42" fill="none" stroke={col} strokeWidth=".5" opacity=".5"/>
    <circle cx="50" cy="50" r="34" fill="#0a0c08" stroke={col} strokeWidth=".5" opacity=".4"/>
    <text x="50" y="46" textAnchor="middle" fill={col} fontSize="18" fontFamily="serif">⚜</text>
    <text x="50" y="58" textAnchor="middle" fill={col} fontSize="6" fontFamily="Rajdhani,sans-serif" letterSpacing="1.5" fontWeight="700">COVERT</text>
    <text x="50" y="66" textAnchor="middle" fill={col} fontSize="5.5" fontFamily="Rajdhani,sans-serif" letterSpacing="1">ANALYTICS</text>
    <text x="50" y="78" textAnchor="middle" fill={col} fontSize="4.5" fontFamily="Rajdhani,sans-serif" opacity=".6">INTEL DIV.</text>
    {[0,60,120,180,240,300].map(a=><text key={a} x={50+44*Math.cos((a-90)*Math.PI/180)} y={50+44*Math.sin((a-90)*Math.PI/180)} textAnchor="middle" fill={col} fontSize="4" opacity=".7">★</text>)}
  </svg>
);

// ── SEGMENTED BAR ──────────────────────────────────────────────────────────
const SegBar = ({ val, segs=10, col='#7ab52a', danger=false, max=100 }) => {
  const filled=Math.round((val/max)*segs);
  return <div style={{display:'flex',gap:'2px'}}>
    {Array.from({length:segs},(_,i)=>{
      const on=i<filled, dc=danger&&on&&i>=segs*.6;
      return <div key={i} style={{width:10,height:10,background:on?(dc?'#d93228':col):'#111a0d',border:`1px solid ${on?(dc?'#d93228':col):'#1e2c18'}`,opacity:on?1:.35,transition:'all .2s'}}/>;
    })}
  </div>;
};

// ── THERMAL BODY ───────────────────────────────────────────────────────────
const Thermal = () => (
  <svg width="26" height="34" viewBox="0 0 26 34">
    <defs><radialGradient id="thg" cx="50%" cy="40%" r="55%"><stop offset="0%" stopColor="#ff4800"/><stop offset="40%" stopColor="#e8a000"/><stop offset="70%" stopColor="#2a8a2a"/><stop offset="100%" stopColor="#0a3060"/></radialGradient></defs>
    <ellipse cx="13" cy="8" rx="7" ry="7" fill="url(#thg)" opacity=".9"/>
    <rect x="6" y="13" width="14" height="14" rx="3" fill="url(#thg)" opacity=".7"/>
    <rect x="1" y="13" width="5" height="11" rx="2" fill="#2a8a2a" opacity=".6"/>
    <rect x="20" y="13" width="5" height="11" rx="2" fill="#2a8a2a" opacity=".6"/>
    <rect x="7" y="27" width="4" height="6" rx="1" fill="#0a3060" opacity=".6"/>
    <rect x="15" y="27" width="4" height="6" rx="1" fill="#0a3060" opacity=".6"/>
  </svg>
);

// ════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════════════════════════════════════
export default function IntelscanApp() {
  const [tab, setTab] = useState('scan');           // scan | store | info
  const [phase, setPhase] = useState('idle');        // idle | scanning | verdict
  const [verdict, setVerdict] = useState(null);      // truth | lie | null
  const [activeScan, setActiveScan] = useState(SCANS[0]);
  const [unlocked, setUnlocked] = useState(()=> ls.get('is_unlocked') || ['standard']);
  const [devMode, setDevMode] = useState(false);
  const [logoTaps, setLogoTaps] = useState(0);
  const [devToast, setDevToast] = useState(false);
  const [showWelcome, setShowWelcome] = useState(()=> !ls.get('is_welcomed'));
  const [showStore, setShowStore] = useState(false); // purchase modal
  const [buyTarget, setBuyTarget] = useState(null);
  const [buying, setBuying] = useState(false);
  const [buyDone, setBuyDone] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanSecs, setScanSecs] = useState(9);
  const [cameraOn, setCameraOn] = useState(false);
  const [question, setQuestion] = useState('');
  const [showQ, setShowQ] = useState(false);
  const [aiComment, setAiComment] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [recBlink, setRecBlink] = useState(true);
  const [metrics, setMetrics] = useState({ hr:72, pv:43, va:88, tr:0.82, br:14, ft:24, dr:18, cf:87 });

  const videoRef=useRef(null), streamRef=useRef(null), timerRef=useRef(null), metricRef=useRef(null), gammaRef=useRef(0);
  const sc = activeScan.col; // shorthand colors

  // REC blink
  useEffect(()=>{ const id=setInterval(()=>setRecBlink(b=>!b),900); return()=>clearInterval(id); },[]);

  // Gyroscope
  useEffect(()=>{
    const h=(e)=>{ gammaRef.current=e.gamma||0; };
    window.addEventListener('deviceorientation',h,true);
    return()=>window.removeEventListener('deviceorientation',h,true);
  },[]);

  // Metric animation during scan
  useEffect(()=>{
    if(phase==='scanning'){
      metricRef.current=setInterval(()=>{
        setMetrics(m=>({
          hr:Math.max(55,Math.min(130,m.hr+Math.round((Math.random()-.5)*6))),
          pv:Math.max(20,Math.min(85,m.pv+Math.round((Math.random()-.5)*5))),
          va:Math.max(50,Math.min(99,m.va+Math.round((Math.random()-.45)*4))),
          tr:parseFloat(Math.max(.5,Math.min(3.0,m.tr+(Math.random()-.5)*.15)).toFixed(2)),
          br:Math.max(8,Math.min(28,m.br+Math.round((Math.random()-.5)*2))),
          ft:Math.max(5,Math.min(95,m.ft+Math.round((Math.random()-.5)*10))),
          dr:Math.max(5,Math.min(90,m.dr+Math.round((Math.random()-.5)*12))),
          cf:Math.max(55,Math.min(99,m.cf+Math.round((Math.random()-.5)*4))),
        }));
      },260);
    } else clearInterval(metricRef.current);
    return()=>clearInterval(metricRef.current);
  },[phase]);

  // Logo tap → dev mode
  const handleLogoTap = () => {
    const n = logoTaps + 1;
    setLogoTaps(n);
    if(n >= 5){
      setLogoTaps(0);
      setDevMode(true);
      setDevToast(true);
      setTimeout(()=>setDevToast(false), 2800);
    }
  };

  const isUnlocked = (id) => devMode || unlocked.includes(id);

  // Camera
  const startCam = async () => {
    try {
      const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'}});
      streamRef.current=s;
      if(videoRef.current) videoRef.current.srcObject=s;
      setCameraOn(true);
    } catch { setCameraOn(false); }
  };
  const stopCam = () => { streamRef.current?.getTracks().forEach(t=>t.stop()); streamRef.current=null; setCameraOn(false); };

  // Begin scan
  const beginAnalysis = async () => {
    if(typeof DeviceOrientationEvent!=='undefined' && typeof DeviceOrientationEvent.requestPermission==='function'){
      try{ await DeviceOrientationEvent.requestPermission(); }catch{}
    }
    await startCam();
    setPhase('scanning'); setScanProgress(0); setScanSecs(9); setVerdict(null); setAiComment('');
    const t0=Date.now(), DUR=9000;
    timerRef.current=setInterval(()=>{
      const el=Date.now()-t0;
      setScanProgress(Math.min(100,(el/DUR)*100));
      setScanSecs(Math.max(0,Math.ceil((DUR-el)/1000)));
      if(el>=DUR){
        clearInterval(timerRef.current);
        const g=gammaRef.current;
        const res=g<-8?'lie':'truth';
        const lie=res==='lie';
        const fm={
          hr:lie?Math.round(90+Math.random()*22):Math.round(66+Math.random()*10),
          pv:lie?Math.round(66+Math.random()*18):Math.round(36+Math.random()*12),
          va:lie?Math.round(54+Math.random()*12):Math.round(84+Math.random()*10),
          tr:lie?parseFloat((1.5+Math.random()*.9).toFixed(2)):parseFloat((.55+Math.random()*.3).toFixed(2)),
          br:lie?Math.round(23+Math.random()*7):Math.round(11+Math.random()*5),
          ft:lie?Math.round(64+Math.random()*24):Math.round(10+Math.random()*18),
          dr:lie?Math.round(70+Math.random()*20):Math.round(7+Math.random()*16),
          cf:lie?Math.round(80+Math.random()*14):Math.round(84+Math.random()*11),
        };
        setMetrics(fm); setVerdict(res); setPhase('verdict'); stopCam();
        if(question.trim()) fetchAI(question, res);
      }
    },80);
  };

  const fetchAI = async (q, res) => {
    setAiLoading(true);
    try {
      const r=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          system:`You are INTELSCAN ${activeScan.name}, a classified AI biometric analysis system specialized in ${activeScan.aiCtx}. Generate exactly 2 sentences in cold clinical intelligence language. The scan has determined the subject is ${res==='truth'?'TELLING THE TRUTH':'ACTIVELY LYING AND DECEIVING'}. Reference specific biometric markers. Sound like a classified government report. Plain text only.`,
          messages:[{role:"user",content:`Subject was asked: "${q}"`}]
        })
      });
      const d=await r.json();
      setAiComment(d.content?.find(b=>b.type==='text')?.text||'NEURAL ANALYSIS COMPLETE. SIGNATURE CONFIRMED.');
    } catch { setAiComment('NEURAL PATTERN ANALYSIS COMPLETE. BIOMETRIC SIGNATURE CONFIRMED.'); }
    setAiLoading(false);
  };

  const reset = () => {
    clearInterval(timerRef.current); stopCam();
    setPhase('idle'); setVerdict(null); setScanProgress(0); setScanSecs(9);
    setAiComment(''); setQuestion(''); setShowQ(false);
    setMetrics({hr:72,pv:43,va:88,tr:0.82,br:14,ft:24,dr:18,cf:87});
  };

  // Secret tap zones (invisible, bottom corners during scan)
  const secretTap = (side) => { if(phase!=='scanning') return; gammaRef.current=side==='lie'?-20:20; };

  // Purchase flow
  const openBuy = (scan) => { setBuyTarget(scan); setShowStore(true); setBuyDone(false); setBuying(false); };
  const confirmBuy = async () => {
    setBuying(true);
    await new Promise(r=>setTimeout(r,2200)); // simulate Stripe
    const newUnlocked=[...unlocked, buyTarget.id];
    setUnlocked(newUnlocked); ls.set('is_unlocked',newUnlocked);
    setBuying(false); setBuyDone(true);
    setTimeout(()=>{ setShowStore(false); setBuyTarget(null); setBuyDone(false); },1800);
  };

  const isLie=verdict==='lie', isVerdict=phase==='verdict', isScanning=phase==='scanning';

  // ── WELCOME MODAL ────────────────────────────────────────────────────────
  const WelcomeModal = () => (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.95)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20,animation:'fadeIn .4s'}}>
      <div style={{background:'#060907',border:'2px solid #c8a227',maxWidth:380,width:'100%',padding:24,animation:'slideUp .4s'}}>
        <div style={{textAlign:'center',marginBottom:16}}>
          <Seal size={56}/>
          <div style={{fontFamily:'Orbitron',fontWeight:900,fontSize:20,color:'#c8a227',marginTop:8,letterSpacing:'.1em'}}>INTELSCAN</div>
          <div style={{fontSize:8,color:'#4a6020',letterSpacing:'2px',marginTop:2}}>CLASSIFIED OPERATOR BRIEFING</div>
        </div>
        <div style={{background:'#0a0f08',border:'1px solid #1e2c18',padding:14,marginBottom:14}}>
          <div style={{fontSize:9,color:'#c8a227',letterSpacing:'1.5px',fontFamily:'Share Tech Mono',marginBottom:10}}>◈ BRIEFING CONFIDENTIEL — NIVEAU ALPHA</div>
          <div style={{fontSize:11,color:'#8aab3a',fontFamily:'Rajdhani',lineHeight:1.7,fontWeight:600}}>
            INTELSCAN est une application <span style={{color:'#c8a227'}}>PRANK</span> — un faux détecteur de mensonges ultra-réaliste. <span style={{color:'#a8d63c'}}>C'est TOI qui contrôles le résultat, à l'insu du sujet.</span>
          </div>
        </div>
        <div style={{background:'#0a0f08',border:'1px solid #1e2c18',padding:14,marginBottom:14}}>
          <div style={{fontSize:9,color:'#d93228',letterSpacing:'1.5px',fontFamily:'Share Tech Mono',marginBottom:8}}>⚠ MÉCANISME SECRET DE CONTRÔLE</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {[
              {icon:'📱➡️', label:'INCLINE À DROITE', result:'LIKELY TRUTH', col:'#a8d63c'},
              {icon:'📱⬅️', label:'INCLINE À GAUCHE', result:'DECEPTION DETECTED', col:'#d93228'},
              {icon:'👆✅', label:'TAP BAS-DROITE (secret)', result:'FORCE TRUTH', col:'#a8d63c'},
              {icon:'👆🔴', label:'TAP BAS-GAUCHE (secret)', result:'FORCE LIE', col:'#d93228'},
            ].map(({icon,label,result,col},i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:16,width:32,textAlign:'center'}}>{icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:9,color:'#4a6020',fontFamily:'Share Tech Mono'}}>{label}</div>
                  <div style={{fontSize:10,color:col,fontFamily:'Orbitron',fontWeight:700}}>{result}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{fontSize:9,color:'#3a5018',fontFamily:'Share Tech Mono',textAlign:'center',marginBottom:14,lineHeight:1.6}}>
          Ces informations sont aussi disponibles<br/>dans l'onglet INFO de l'application.
        </div>
        <button onClick={()=>{ ls.set('is_welcomed',true); setShowWelcome(false); }}
          style={{width:'100%',background:'linear-gradient(135deg,#1a2c10,#2a4818)',border:'2px solid #7ab52a',color:'#a8d63c',fontFamily:'Orbitron',fontWeight:700,fontSize:12,padding:'12px',letterSpacing:'.1em',cursor:'pointer'}}>
          ✓ ACKNOWLEDGE — BEGIN MISSION
        </button>
      </div>
    </div>
  );

  // ── PURCHASE MODAL ───────────────────────────────────────────────────────
  const PurchaseModal = () => (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.92)',zIndex:900,display:'flex',alignItems:'center',justifyContent:'center',padding:20,animation:'fadeIn .3s'}} onClick={()=>{ if(!buying&&!buyDone){ setShowStore(false); setBuyTarget(null); }}}>
      <div style={{background:'#060907',border:`2px solid ${LEVELS[buyTarget?.level]?.col||'#c8a227'}`,maxWidth:340,width:'100%',padding:22,animation:'slideUp .3s'}} onClick={e=>e.stopPropagation()}>
        {buyDone ? (
          <div style={{textAlign:'center',padding:'20px 0'}}>
            <div style={{fontSize:40,marginBottom:12}}>✅</div>
            <div style={{fontFamily:'Orbitron',fontWeight:700,fontSize:14,color:'#a8d63c',letterSpacing:'.08em'}}>SCAN DÉBLOQUÉ</div>
            <div style={{fontSize:10,color:'#4a6020',fontFamily:'Share Tech Mono',marginTop:6}}>{buyTarget?.name} ACTIVÉ</div>
          </div>
        ) : buying ? (
          <div style={{textAlign:'center',padding:'24px 0'}}>
            <div style={{fontSize:28,marginBottom:10,animation:'spin 1s linear infinite',display:'inline-block'}}>⚙️</div>
            <div style={{fontFamily:'Share Tech Mono',fontSize:10,color:'#c8a227',letterSpacing:'1px',animation:'pulse 1s infinite'}}>TRAITEMENT PAIEMENT...</div>
          </div>
        ) : (
          <>
            <div style={{textAlign:'center',marginBottom:16}}>
              <div style={{fontSize:28,marginBottom:6}}>{buyTarget?.emoji}</div>
              <div style={{fontFamily:'Orbitron',fontWeight:900,fontSize:16,color:sc.p||'#7ab52a',letterSpacing:'.06em'}}>{buyTarget?.name}</div>
              <div style={{fontSize:9,color:'#4a6020',letterSpacing:'1px',marginTop:2}}>{buyTarget?.sub}</div>
              <div style={{marginTop:8,fontFamily:'Orbitron',fontWeight:900,fontSize:26,color:'#c8a227'}}>${buyTarget?.price}</div>
            </div>
            <div style={{fontSize:10,color:'#6a8c28',fontFamily:'Rajdhani',lineHeight:1.6,marginBottom:16,textAlign:'center'}}>{buyTarget?.desc}</div>
            <button onClick={confirmBuy} style={{width:'100%',background:'linear-gradient(135deg,#1a2c10,#2a4818)',border:`2px solid ${LEVELS[buyTarget?.level]?.col||'#c8a227'}`,color:'#fff',fontFamily:'Orbitron',fontWeight:700,fontSize:11,padding:'12px',letterSpacing:'.08em',cursor:'pointer',marginBottom:8}}>
              💳 ACHETER AVEC STRIPE
            </button>
            <button onClick={()=>{ setShowStore(false); setBuyTarget(null); }} style={{width:'100%',background:'transparent',border:'1px solid #1e2c18',color:'#3a5018',fontFamily:'Rajdhani',fontSize:10,padding:'8px',cursor:'pointer',letterSpacing:'1px'}}>
              ANNULER
            </button>
          </>
        )}
      </div>
    </div>
  );

  // ── SCAN SELECTOR ────────────────────────────────────────────────────────
  const ScanSelector = () => (
    <div style={{margin:'6px 10px',display:'flex',gap:6,overflowX:'auto',paddingBottom:4}}>
      {SCANS.map(scan=>{
        const unlk=isUnlocked(scan.id), active=activeScan.id===scan.id;
        const lv=LEVELS[scan.level];
        return (
          <button key={scan.id}
            onClick={()=>{ if(unlk){ setActiveScan(scan); reset(); } else openBuy(scan); }}
            style={{flexShrink:0,background:active?`${scan.col.bg}aa`:'#0a0c09',border:`1.5px solid ${active?scan.col.p:'#1e2c18'}`,padding:'6px 10px',cursor:'pointer',textAlign:'center',minWidth:72,position:'relative',transition:'all .2s',boxShadow:active?`0 0 12px ${scan.col.p}40`:'none'}}>
            <div style={{fontSize:16,marginBottom:2}}>{scan.emoji}</div>
            <div style={{fontSize:7,fontFamily:'Orbitron',fontWeight:700,color:active?scan.col.p:'#4a6020',letterSpacing:'.04em',lineHeight:1.3}}>{scan.name.split(' ')[0]}</div>
            <div style={{marginTop:3,display:'inline-block',padding:'1px 4px',background:active?lv.col+'22':'transparent',border:`1px solid ${active?lv.col:'#1e2c18'}`,fontSize:6,color:active?lv.col:'#3a5018',fontFamily:'Share Tech Mono',letterSpacing:'.5px'}}>{lv.label}</div>
            {!unlk && <div style={{position:'absolute',top:3,right:3,fontSize:8}}>🔒</div>}
            {!unlk && <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,.35)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <div style={{fontSize:8,color:'#c8a227',fontFamily:'Share Tech Mono',letterSpacing:'.5px'}}>${scan.price}</div>
            </div>}
          </button>
        );
      })}
    </div>
  );

  // ── STORE TAB ────────────────────────────────────────────────────────────
  const StoreTab = () => (
    <div style={{padding:'0 10px 80px',animation:'fadeIn .3s'}}>
      <div style={{textAlign:'center',padding:'14px 0 10px'}}>
        <div style={{fontSize:9,color:'#4a6020',letterSpacing:'2px',fontFamily:'Share Tech Mono'}}>INTEL STORE</div>
        <div style={{fontFamily:'Orbitron',fontWeight:700,fontSize:16,color:'#c8a227',letterSpacing:'.06em'}}>SCAN MODULES</div>
      </div>
      {/* Bundle */}
      <div style={{background:'linear-gradient(135deg,#0d1408,#0a1006)',border:'2px solid #c8a227',padding:'12px 14px',marginBottom:10,boxShadow:'0 0 20px rgba(200,162,39,.15)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontFamily:'Orbitron',fontWeight:900,fontSize:13,color:'#c8a227',letterSpacing:'.06em'}}>⚡ ALL ACCESS</div>
            <div style={{fontSize:9,color:'#6a8c28',fontFamily:'Rajdhani',marginTop:2}}>Tous les scans PRO + ELITE débloqués</div>
            <div style={{display:'flex',gap:4,marginTop:5}}>
              {SCANS.filter(s=>s.price).map(s=><span key={s.id} style={{fontSize:12}}>{s.emoji}</span>)}
            </div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontFamily:'Orbitron',fontWeight:900,fontSize:22,color:'#c8a227'}}>$6.99</div>
            <div style={{fontSize:8,color:'#7a6215',textDecoration:'line-through'}}>$10.97</div>
          </div>
        </div>
        <button style={{width:'100%',marginTop:10,background:'linear-gradient(135deg,#2a4010,#3a6018)',border:'1px solid #c8a227',color:'#c8a227',fontFamily:'Orbitron',fontWeight:700,fontSize:10,padding:'9px',letterSpacing:'.08em',cursor:'pointer'}}>
          💳 DÉBLOQUER TOUT
        </button>
      </div>
      {/* Individual scans */}
      {SCANS.filter(s=>s.price).map(scan=>{
        const unlk=isUnlocked(scan.id), lv=LEVELS[scan.level];
        return (
          <div key={scan.id} style={{background:'#080c07',border:`1px solid ${unlk?scan.col.p:'#1e2c18'}`,padding:'10px 12px',marginBottom:6,display:'flex',alignItems:'center',gap:12,position:'relative',boxShadow:unlk?`0 0 10px ${scan.col.p}20`:'none'}}>
            <div style={{fontSize:28}}>{scan.emoji}</div>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:2}}>
                <div style={{fontFamily:'Orbitron',fontWeight:700,fontSize:11,color:unlk?scan.col.p:'#4a6020',letterSpacing:'.04em'}}>{scan.name}</div>
                <div style={{padding:'1px 5px',background:lv.col+'22',border:`1px solid ${lv.col}`,fontSize:6,color:lv.col,fontFamily:'Share Tech Mono'}}>{lv.label}</div>
                {unlk && <div style={{fontSize:8,color:'#a8d63c'}}>✓ ACTIF</div>}
              </div>
              <div style={{fontSize:9,color:'#4a6020',fontFamily:'Rajdhani',lineHeight:1.4}}>{scan.desc}</div>
            </div>
            <div style={{textAlign:'right',flexShrink:0}}>
              {unlk
                ? <div style={{fontSize:10,color:'#a8d63c',fontFamily:'Share Tech Mono'}}>✓</div>
                : <>
                    <div style={{fontFamily:'Orbitron',fontWeight:700,fontSize:14,color:'#c8a227'}}>${scan.price}</div>
                    <button onClick={()=>openBuy(scan)} style={{marginTop:4,background:'transparent',border:`1px solid ${lv.col}`,color:lv.col,fontFamily:'Rajdhani',fontSize:9,padding:'4px 8px',cursor:'pointer',letterSpacing:'1px',fontWeight:700}}>UNLOCK</button>
                  </>
              }
            </div>
          </div>
        );
      })}
    </div>
  );

  // ── INFO TAB ─────────────────────────────────────────────────────────────
  const InfoTab = () => (
    <div style={{padding:'0 10px 80px',animation:'fadeIn .3s'}}>
      <div style={{textAlign:'center',padding:'14px 0 12px'}}>
        <Seal size={60}/>
        <div style={{fontFamily:'Orbitron',fontWeight:900,fontSize:18,color:'#c8a227',marginTop:8,letterSpacing:'.08em'}}>INTELSCAN</div>
        <div style={{fontSize:8,color:'#3a5018',letterSpacing:'2px',fontFamily:'Share Tech Mono',marginTop:2}}>v2.0 · COVERT LIE DETECTOR</div>
        {devMode && <div style={{marginTop:6,display:'inline-block',padding:'2px 10px',background:'rgba(217,50,40,.15)',border:'1px solid #d93228',fontSize:8,color:'#d93228',fontFamily:'Share Tech Mono',animation:'devBadge .4s ease'}}>⚡ DEV MODE ACTIF</div>}
      </div>
      {/* Secret reveal */}
      <div style={{background:'#0a0f08',border:'1px solid #c8a227',padding:'14px',marginBottom:10}}>
        <div style={{fontSize:9,color:'#c8a227',letterSpacing:'1.5px',fontFamily:'Share Tech Mono',marginBottom:10}}>◈ MÉCANISME SECRET — CLASSIFIÉ</div>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {[
            {icon:'📱➡️',label:'INCLINE À DROITE →',result:'LIKELY TRUTH',col:'#a8d63c'},
            {icon:'📱⬅️',label:'INCLINE À GAUCHE ←',result:'DECEPTION DETECTED',col:'#d93228'},
            {icon:'👆',label:'TAP BAS-DROITE (caché)',result:'FORCE TRUTH',col:'#a8d63c'},
            {icon:'👆',label:'TAP BAS-GAUCHE (caché)',result:'FORCE LIE',col:'#d93228'},
          ].map(({icon,label,result,col},i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'6px 8px',background:'#060907',border:'1px solid #1e2c18'}}>
              <span style={{fontSize:18,width:28,textAlign:'center'}}>{icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:8,color:'#4a6020',fontFamily:'Share Tech Mono'}}>{label}</div>
                <div style={{fontSize:10,color:col,fontFamily:'Orbitron',fontWeight:700}}>{result}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{marginTop:10,fontSize:8,color:'#3a5018',fontFamily:'Share Tech Mono',lineHeight:1.7}}>
          Pendant le scan, inclinez discrètement le téléphone ou tapez sur les zones cachées en bas pour contrôler le verdict. La victime ne verra rien.
        </div>
      </div>
      {/* Dev mode hint */}
      <div style={{background:'#0a0f08',border:'1px solid #1e2c18',padding:'10px 12px',marginBottom:10,fontSize:8,color:'#3a5018',fontFamily:'Share Tech Mono',lineHeight:1.7}}>
        🔧 MODE DÉVELOPPEUR : Tapez 5× sur le logo INTELSCAN pour débloquer tous les scans.
      </div>
      <div style={{fontSize:8,color:'#2a3c18',fontFamily:'Share Tech Mono',textAlign:'center',lineHeight:1.8}}>
        INTELSCAN · Pour divertissement uniquement<br/>© 2025 HailHits Digital · All rights reserved
      </div>
    </div>
  );

  // ── SCANNER TAB ──────────────────────────────────────────────────────────
  const ScanTab = () => (
    <div style={{animation:'fadeIn .3s'}}>
      <ScanSelector/>

      {/* Camera zone */}
      <div style={{position:'relative',margin:'0 10px',border:`1px solid ${sc.p}40`,background:'#050805',overflow:'hidden'}}>
        {/* Corner brackets */}
        {[[0,0,'right','bottom'],[0,'auto','left','bottom'],['auto',0,'right','top'],['auto','auto','left','top']].map(([t2,b,br,bl],idx)=>(
          <div key={idx} style={{position:'absolute',top:t2,bottom:b,[br]:0,[bl]:0,width:16,height:16,
            borderTop:idx<2?`2px solid ${sc.a}`:undefined, borderBottom:idx>=2?`2px solid ${sc.a}`:undefined,
            borderLeft:(idx===1||idx===3)?`2px solid ${sc.a}`:undefined, borderRight:(idx===0||idx===2)?`2px solid ${sc.a}`:undefined,
            zIndex:8,pointerEvents:'none'}}/>
        ))}
        <div style={{position:'absolute',top:8,left:10,zIndex:5,display:'flex',alignItems:'center',gap:5}}>
          <div style={{width:6,height:6,borderRadius:'50%',background:isScanning?sc.p:'#2a3520',boxShadow:isScanning?`0 0 8px ${sc.p}`:'none',animation:isScanning?'pulse 1s infinite':'none'}}/>
          <span style={{fontSize:9,color:sc.p,fontFamily:'Share Tech Mono',letterSpacing:'1px'}}>LIVE FEED</span>
        </div>
        <div style={{position:'absolute',top:8,right:10,zIndex:5,fontSize:9,color:sc.p,fontFamily:'Share Tech Mono'}}>CAM 01</div>
        <div style={{position:'relative',width:'100%',paddingBottom:'72%',background:'#030503'}}>
          <video ref={videoRef} autoPlay playsInline muted style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',filter:'grayscale(.3) contrast(1.1)'}}/>
          {!cameraOn && <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#030b04'}}>
            <div style={{fontSize:32,opacity:.1}}>👤</div>
            <div style={{fontSize:9,color:'#2a3c18',fontFamily:'Share Tech Mono',marginTop:6,letterSpacing:'1px'}}>AWAITING SUBJECT</div>
          </div>}
          <div style={{position:'absolute',inset:0,background:`linear-gradient(180deg,${sc.p}08 0%,transparent 50%,${sc.p}06 100%)`,pointerEvents:'none'}}/>
          {isScanning && <div style={{position:'absolute',left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${sc.p}80,transparent)`,animation:'scanBar 2.2s linear infinite',zIndex:6}}/>}
          <Mesh on={isScanning||isVerdict} anim={isScanning} col={sc.p}/>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',padding:'5px 10px',background:'#080c07',borderTop:`1px solid ${sc.p}20`}}>
          <div style={{fontSize:8,color:'#3a5018',fontFamily:'Share Tech Mono'}}>
            <div style={{marginBottom:2}}>SIGNAL QUALITY</div>
            <div style={{display:'flex',gap:'1px',alignItems:'flex-end',marginBottom:2}}>
              {[5,7,9,7,9,8,10,6,8,9].map((h,i)=><div key={i} style={{width:3,height:h,background:i<8?sc.p:'#1e2c18'}}/>)}
            </div>
            <div style={{color:sc.p,fontWeight:700}}>92%</div>
          </div>
          <div style={{fontSize:8,color:'#3a5018',fontFamily:'Share Tech Mono',textAlign:'right'}}>
            <div style={{marginBottom:2}}>FACIAL TRACKING</div>
            <div style={{color:isScanning?sc.p:'#2a3520',fontWeight:700,marginTop:4}}>{isScanning?'🔒 LOCKED':'STANDBY'}</div>
          </div>
        </div>
      </div>

      {/* Metrics grid */}
      <div style={{margin:'5px 10px',display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:4}}>
        {/* Heart Rate */}
        <div style={{background:'#0a0c09',border:`1px solid ${sc.p}30`,padding:'5px 7px'}}>
          <div style={{fontSize:7,color:'#3a5018',letterSpacing:'1px',fontWeight:700,marginBottom:2}}>HEART RATE</div>
          <div style={{display:'flex',alignItems:'baseline',gap:2}}>
            <span style={{fontSize:20,fontFamily:'Orbitron',fontWeight:700,color:metrics.hr>95?'#c8a227':sc.p,lineHeight:1}}>{metrics.hr}</span>
            <span style={{fontSize:8,color:'#3a5018'}}>BPM</span>
          </div>
          <Wave w={72} h={16} kind="ecg" speed={.09} color={metrics.hr>95?'#c8a227':sc.p}/>
          <div style={{fontSize:7,color:'#3a5018',marginTop:1}}>{metrics.hr>95?'ELEVATED':'OPTIMAL'}</div>
        </div>
        {/* Pulse */}
        <div style={{background:'#0a0c09',border:`1px solid ${sc.p}30`,padding:'5px 7px'}}>
          <div style={{fontSize:7,color:'#3a5018',letterSpacing:'1px',fontWeight:700,marginBottom:2}}>PULSE VAR.</div>
          <div style={{display:'flex',alignItems:'baseline',gap:2}}>
            <span style={{fontSize:20,fontFamily:'Orbitron',fontWeight:700,color:metrics.pv>65?'#c8a227':sc.p,lineHeight:1}}>{metrics.pv}</span>
            <span style={{fontSize:8,color:'#3a5018'}}>ms</span>
          </div>
          <Wave w={72} h={16} kind="sine" speed={.05} color={metrics.pv>65?'#c8a227':sc.p}/>
          <div style={{fontSize:7,color:'#3a5018',marginTop:1}}>{metrics.pv>65?'STRESS':'NORMAL'}</div>
        </div>
        {/* Voice */}
        <div style={{background:'#0a0c09',border:`1px solid ${sc.p}30`,padding:'5px 7px'}}>
          <div style={{fontSize:7,color:'#3a5018',letterSpacing:'1px',fontWeight:700,marginBottom:2}}>VOICE ANALYSIS</div>
          <div style={{display:'flex',alignItems:'baseline',gap:2}}>
            <span style={{fontSize:20,fontFamily:'Orbitron',fontWeight:700,color:metrics.va<62?'#c8a227':sc.p,lineHeight:1}}>{metrics.va}</span>
            <span style={{fontSize:8,color:'#3a5018'}}>%</span>
          </div>
          <Wave w={72} h={16} kind="voice" speed={.07} color={metrics.va<62?'#c8a227':sc.p}/>
          <div style={{fontSize:7,color:'#3a5018',marginTop:1}}>{metrics.va<62?'ANOMALY':'STABLE'}</div>
        </div>
        {/* Thermal */}
        <div style={{background:'#0a0c09',border:`1px solid ${sc.p}30`,padding:'5px 7px',display:'flex',alignItems:'center',gap:6}}>
          <div>
            <div style={{fontSize:7,color:'#3a5018',letterSpacing:'1px',fontWeight:700,marginBottom:4}}>THERMAL</div>
            <Thermal/>
          </div>
          <div>
            <div style={{fontSize:18,fontFamily:'Orbitron',fontWeight:700,color:'#c8a227',lineHeight:1}}>{metrics.tr}</div>
            <div style={{fontSize:7,color:'#3a5018'}}>°C DELTA</div>
          </div>
        </div>
        {/* Blink */}
        <div style={{background:'#0a0c09',border:`1px solid ${sc.p}30`,padding:'5px 7px'}}>
          <div style={{fontSize:7,color:'#3a5018',letterSpacing:'1px',fontWeight:700,marginBottom:2}}>BLINK RATE</div>
          <div style={{display:'flex',alignItems:'baseline',gap:2}}>
            <span style={{fontSize:20,fontFamily:'Orbitron',fontWeight:700,color:metrics.br>22?'#c8a227':sc.p,lineHeight:1}}>{metrics.br}</span>
            <span style={{fontSize:8,color:'#3a5018'}}>BPM</span>
          </div>
          <div style={{display:'flex',gap:'1px',alignItems:'flex-end',height:16,marginTop:1}}>
            {[4,7,5,9,6,8,4,7,5,8].map((h,i)=><div key={i} style={{width:5,height:h*(metrics.br/14),background:metrics.br>22?'#c8a227':sc.p,opacity:.85}}/>)}
          </div>
          <div style={{fontSize:7,color:'#3a5018',marginTop:1}}>{metrics.br>22?'ELEVATED':'NORMAL'}</div>
        </div>
        {/* Facial */}
        <div style={{background:'#0a0c09',border:`1px solid ${sc.p}30`,padding:'5px 7px'}}>
          <div style={{fontSize:7,color:'#3a5018',letterSpacing:'1px',fontWeight:700,marginBottom:2}}>FACIAL TENSION</div>
          <div style={{display:'flex',alignItems:'baseline',gap:2}}>
            <span style={{fontSize:20,fontFamily:'Orbitron',fontWeight:700,color:metrics.ft>58?'#d93228':metrics.ft>35?'#c8a227':sc.p,lineHeight:1}}>{metrics.ft}</span>
            <span style={{fontSize:8,color:'#3a5018'}}>%</span>
          </div>
          <svg width="36" height="30" viewBox="0 0 36 30" style={{display:'block',margin:'1px auto 0'}}>
            <ellipse cx="18" cy="12" rx="9" ry="10" fill="none" stroke={metrics.ft>58?'#d93228':sc.p} strokeWidth="1.3"/>
            <line x1="13" y1="10" x2="15" y2="10" stroke={sc.p} strokeWidth="1"/>
            <line x1="21" y1="10" x2="23" y2="10" stroke={sc.p} strokeWidth="1"/>
            <path d={metrics.ft>58?"M12,18 Q18,14 24,18":metrics.ft>35?"M12,18 Q18,18 24,18":"M12,18 Q18,22 24,18"} fill="none" stroke={metrics.ft>58?'#d93228':sc.p} strokeWidth="1"/>
          </svg>
          <div style={{fontSize:7,color:'#3a5018',marginTop:1}}>{metrics.ft>58?'HIGH':metrics.ft>35?'MODERATE':'LOW'}</div>
        </div>
      </div>

      {/* Deception risk */}
      <div style={{margin:'4px 10px',background:'#0a0c09',border:`1px solid ${sc.p}30`,padding:'7px 10px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:5}}>
          <span style={{fontSize:8,color:'#3a5018',letterSpacing:'1px',fontWeight:700}}>DECEPTION RISK</span>
          <div style={{display:'flex',alignItems:'baseline',gap:3}}>
            <span style={{fontFamily:'Orbitron',fontSize:18,fontWeight:700,color:metrics.dr>60?'#d93228':metrics.dr>35?'#c8a227':sc.p}}>{metrics.dr}</span>
            <span style={{fontSize:8,color:'#3a5018'}}>%</span>
          </div>
        </div>
        <SegBar val={metrics.dr} segs={14} col={sc.p} danger={true}/>
        <div style={{fontSize:7,color:metrics.dr>60?'#d93228':metrics.dr>35?'#c8a227':sc.p,marginTop:4,letterSpacing:'.5px',fontWeight:700}}>
          {metrics.dr>60?'⚠ HIGH RISK':metrics.dr>35?'MODERATE RISK':'LOW RISK'}
        </div>
      </div>

      {/* Analysis ID */}
      <div style={{margin:'4px 10px',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'5px 10px',background:'#0a0c09',border:`1px solid ${sc.p}20`}}>
        <div style={{fontSize:7,color:'#3a5018',fontFamily:'Share Tech Mono',lineHeight:1.8}}>
          <div>ANALYSIS ID: {activeScan.opId}-{String(Math.floor(metrics.cf*.1+1)).padStart(2,'0')}</div>
          <div>DURATION: 00:00:{String(9-scanSecs).padStart(2,'0')}</div>
          <div>MODE: {activeScan.name}</div>
        </div>
        <Seal size={36} col={sc.a}/>
      </div>

      {/* VERDICT */}
      <div style={{
        margin:'4px 10px',padding:'10px 14px',
        background:isVerdict?(isLie?'rgba(217,50,40,.08)':sc.p+'10'):'#0a0c09',
        border:`2px solid ${isVerdict?(isLie?'#d93228':sc.truth):`${sc.p}30`}`,
        textAlign:'center',
        boxShadow:isVerdict?`0 0 20px ${isLie?'#d93228':sc.truth}30`:'none',
        animation:isVerdict?'flicker .6s ease-out':'none',
        transition:'all .4s',
      }}>
        <div style={{fontSize:8,color:'#3a5018',letterSpacing:'2px',marginBottom:4}}>★ ANALYSIS VERDICT ★</div>
        <div style={{
          fontFamily:'Orbitron',fontWeight:900,
          fontSize:isVerdict?26:18,
          color:isVerdict?(isLie?'#d93228':sc.truth):'#2a3c18',
          letterSpacing:'.05em',
          textShadow:isVerdict?`0 0 20px ${isLie?'#d93228':sc.truth}`:'none',
          animation:isVerdict?'glow 2s ease infinite':'none',
          lineHeight:1,transition:'all .4s',
        }}>
          {phase==='idle'?'AWAITING DATA':isScanning?'ANALYZING...':isLie?'DECEPTION DETECTED':'LIKELY TRUTH'}
        </div>
        <div style={{marginTop:6,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
          <span style={{fontSize:8,color:'#3a5018'}}>CONFIDENCE</span>
          <span style={{fontFamily:'Orbitron',fontWeight:700,fontSize:15,color:isVerdict?(isLie?'#d93228':sc.truth):'#2a3c18'}}>{metrics.cf}%</span>
          <SegBar val={metrics.cf} segs={10} col={isVerdict?(isLie?'#d93228':sc.truth):'#2a3c18'}/>
        </div>
        {isVerdict&&aiLoading&&<div style={{marginTop:8,fontSize:8,color:'#4a6020',fontFamily:'Share Tech Mono',animation:'pulse 1s infinite'}}>◈ GENERATING INTELLIGENCE REPORT...</div>}
        {isVerdict&&aiComment&&!aiLoading&&(
          <div style={{marginTop:8,fontSize:9,color:'#5a7028',fontFamily:'Share Tech Mono',lineHeight:1.6,textAlign:'left',padding:'6px 8px',background:'#060907',border:`1px solid ${sc.p}20`}}>
            <div style={{color:'#7a6215',fontSize:7,letterSpacing:'1px',marginBottom:3}}>▶ INTEL ASSESSMENT</div>
            {aiComment}
          </div>
        )}
      </div>

      {/* Scan progress bar */}
      {isScanning&&(
        <div style={{margin:'4px 10px',padding:'6px 10px',background:'#0a0c09',border:`1px solid ${sc.p}30`}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:8,color:'#3a5018',marginBottom:4,fontFamily:'Share Tech Mono'}}>
            <span>BIOMETRIC SCAN IN PROGRESS</span>
            <span style={{color:sc.p}}>{scanSecs}s</span>
          </div>
          <div style={{height:4,background:'#1e2c18',position:'relative'}}>
            <div style={{position:'absolute',left:0,top:0,height:'100%',width:`${scanProgress}%`,background:`linear-gradient(90deg,${sc.p}60,${sc.truth})`,transition:'width .1s',boxShadow:`0 0 8px ${sc.p}`}}/>
          </div>
          <div style={{marginTop:4,fontSize:7,color:sc.p+'80',fontFamily:'Share Tech Mono',animation:'pulse 1s infinite'}}>◉ NEURAL PATTERN EXTRACTION ACTIVE</div>
        </div>
      )}

      {/* Question input */}
      {phase==='idle'&&(
        <div style={{margin:'4px 10px'}}>
          {!showQ
            ?<button onClick={()=>setShowQ(true)} style={{width:'100%',background:'transparent',border:`1px dashed ${sc.p}30`,color:'#3a5018',padding:'7px',fontSize:8,fontFamily:'Rajdhani',letterSpacing:'1px',cursor:'pointer'}}>+ ENTRER LA QUESTION POSÉE (OPTIONNEL)</button>
            :<div style={{background:'#0a0c09',border:`1px solid ${sc.p}30`,padding:'8px'}}>
              <div style={{fontSize:7,color:'#3a5018',letterSpacing:'1px',marginBottom:4,fontFamily:'Share Tech Mono'}}>QUESTION POSÉE AU SUJET:</div>
              <input value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Ex: Es-tu allé au gym hier soir?"
                style={{width:'100%',background:'#060907',border:`1px solid ${sc.p}20`,color:sc.p,padding:'6px 8px',fontSize:11,fontFamily:'Share Tech Mono',outline:'none'}}/>
            </div>
          }
        </div>
      )}

      {/* Bottom controls — BEGIN / RESET */}
      <div style={{margin:'6px 10px 10px',display:'flex',alignItems:'center',gap:8,position:'relative'}}>
        {/* Secret tap zones — INVISIBLE */}
        <div onClick={()=>secretTap('truth')} style={{position:'absolute',left:0,top:0,width:60,height:'100%',zIndex:10,cursor:'default'}}/>
        <div onClick={()=>secretTap('lie')} style={{position:'absolute',right:0,top:0,width:60,height:'100%',zIndex:10,cursor:'default'}}/>

        <div style={{flex:1}}/>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
          {isVerdict
            ?<button onClick={reset} style={{width:84,height:84,borderRadius:'50%',background:'radial-gradient(circle at 35% 35%,#1a2c10,#0d1508)',border:`3px solid ${sc.p}60`,color:sc.p,fontFamily:'Orbitron',fontWeight:700,fontSize:9,letterSpacing:'.05em',cursor:'pointer',lineHeight:1.3}}>RESET<br/>SYSTEM</button>
            :<button onClick={phase==='idle'?beginAnalysis:undefined} disabled={isScanning} style={{width:84,height:84,borderRadius:'50%',background:isScanning?'radial-gradient(circle at 35% 35%,#8a1a10,#4a0a08)':'radial-gradient(circle at 35% 35%,#e84030,#8a1a10)',border:`3px solid ${isScanning?'#6a1208':'#e84030'}`,color:'#fff',fontFamily:'Orbitron',fontWeight:900,fontSize:isScanning?18:10,letterSpacing:'.03em',cursor:isScanning?'not-allowed':'pointer',lineHeight:1.3,boxShadow:isScanning?'none':'0 0 20px rgba(232,64,48,.5),inset 0 2px 4px rgba(255,255,255,.15)',animation:isScanning?'pulse .8s infinite':'none'}}>
                {isScanning?`${scanSecs}s`:'BEGIN\nANALYSIS'}
              </button>
          }
        </div>
        <div style={{flex:1}}/>
      </div>
    </div>
  );

  // ── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div style={{background:'#030504',minHeight:'100vh',display:'flex',justifyContent:'center',fontFamily:"'Rajdhani',sans-serif"}}>
      <div style={{width:'100%',maxWidth:430,background:'#060907',minHeight:'100vh',position:'relative',display:'flex',flexDirection:'column',backgroundImage:'radial-gradient(ellipse at 50% 0%,#0d1808 0%,#060907 70%)'}}>

        {/* CRT scanlines */}
        <div style={{position:'fixed',inset:0,backgroundImage:'repeating-linear-gradient(0deg,rgba(0,0,0,.04) 0,rgba(0,0,0,.04) 1px,transparent 1px,transparent 4px)',pointerEvents:'none',zIndex:200}}/>

        {/* DEV TOAST */}
        {devToast&&<div style={{position:'fixed',top:60,left:'50%',transform:'translateX(-50%)',background:'rgba(217,50,40,.15)',border:'1px solid #d93228',color:'#d93228',padding:'6px 16px',fontSize:9,fontFamily:'Share Tech Mono',letterSpacing:'1px',zIndex:500,animation:'devBadge .4s ease'}}>⚡ DEV MODE ACTIVÉ — TOUS LES SCANS DÉBLOQUÉS</div>}

        {/* STATUS BAR */}
        <div style={{display:'flex',justifyContent:'space-between',padding:'8px 14px 4px',fontSize:10,color:'#2a3c18',fontFamily:'Share Tech Mono'}}>
          <span>9:41</span><div style={{display:'flex',gap:6,fontSize:9}}><span>▲▲▲</span><span>WiFi</span><span>▐▐▌</span></div>
        </div>

        {/* HEADER — tap logo 5× for dev mode */}
        <div style={{display:'flex',alignItems:'center',padding:'4px 12px 8px',gap:10,borderBottom:'1px solid #1e2c18'}}>
          <Seal size={44} col='#c8a227'/>
          <div style={{flex:1,textAlign:'center'}} onClick={handleLogoTap}>
            <div style={{fontFamily:'Orbitron',fontWeight:900,fontSize:24,color:'#c8a227',letterSpacing:'.08em',lineHeight:1,textShadow:'0 0 12px rgba(200,162,39,.4)',userSelect:'none'}}>INTELSCAN</div>
            <div style={{fontSize:9,letterSpacing:'.2em',color:'#3a5018',fontWeight:700}}>· COVERT LIE DETECTOR ·</div>
            <div style={{fontSize:8,color:activeScan.col.p,fontFamily:'Share Tech Mono',marginTop:2,letterSpacing:'1px'}}>{activeScan.op} · {activeScan.opId}</div>
          </div>
          <div style={{textAlign:'right',fontSize:7,color:'#3a5018',fontFamily:'Share Tech Mono',lineHeight:1.7}}>
            <div style={{display:'flex',alignItems:'center',gap:4,justifyContent:'flex-end'}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:'#d93228',opacity:recBlink?1:.2,boxShadow:recBlink?'0 0 6px #d93228':'none'}}/>
              <span style={{color:'#d93228',fontSize:8,fontWeight:700}}>REC</span>
            </div>
            <div style={{color:'#2a3c18',marginTop:2}}>{activeScan.level}</div>
            <div style={{color:LEVELS[activeScan.level].col,fontSize:6}}>{'★'.repeat(activeScan.level==='BASIC'?1:activeScan.level==='PRO'?2:3)}</div>
          </div>
        </div>

        {/* TAB CONTENT */}
        <div style={{flex:1,overflowY:'auto',paddingBottom:60}}>
          {tab==='scan'&&<ScanTab/>}
          {tab==='store'&&<StoreTab/>}
          {tab==='info'&&<InfoTab/>}
        </div>

        {/* BOTTOM NAV */}
        <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:430,background:'#060907',borderTop:'1px solid #1e2c18',display:'flex',zIndex:100}}>
          {[
            {id:'scan',icon:'📡',label:'SCAN'},
            {id:'store',icon:'🛒',label:'STORE'},
            {id:'info',icon:'ℹ️',label:'INFO'},
          ].map(({id,icon,label})=>(
            <button key={id} onClick={()=>setTab(id)} style={{flex:1,background:'transparent',border:'none',padding:'10px 0 8px',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
              <span style={{fontSize:18}}>{icon}</span>
              <span style={{fontSize:7,fontFamily:'Orbitron',fontWeight:700,letterSpacing:'1px',color:tab===id?'#c8a227':'#2a3c18'}}>{label}</span>
              {tab===id&&<div style={{width:20,height:1.5,background:'#c8a227',borderRadius:1}}/>}
            </button>
          ))}
        </div>

        {/* MODALS */}
        {showWelcome&&<WelcomeModal/>}
        {showStore&&buyTarget&&<PurchaseModal/>}
      </div>
    </div>
  );
}

