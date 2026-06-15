// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  TABLE OF CONTENTS  —  app.js                                           ║
// ╠══════════════════════════════════════════════════════════════════════════╣
// ║  L.43    SUPABASE (client init)                                          ║
// ║  L.48    SUPABASE: TRADES (sbLoadTrades, sbSaveTrade…)                  ║
// ║  L.63    SUPABASE: ACCOUNTS (sbLoadAccounts, sbSaveAccount…)            ║
// ║  L.82    SUPABASE: CASHFLOW (sbLoadCashflow, sbSaveCashflow…)           ║
// ║  L.111   STATE / CONSTANTS                                               ║
// ║  L.137   LOCAL DB (loadApp, DB object)                                   ║
// ║  L.177   HELPERS (fmtD, fmtN, esc, stats…)                              ║
// ║  L.183   RR / SESSION CALC (calcRR, calcSession, calcHorsZone…)         ║
// ║  L.261   NAVIGATION / SIDEBAR (showPage, toggleSidebar…)                ║
// ║  L.290   DASHBOARD (renderDash, renderPills, renderDashFilter…)         ║
// ║  L.379     renderDash()                                                  ║
// ║  L.452     getDisciplineAudit()                                          ║
// ║  L.468     renderDisciplineBanner()                                      ║
// ║  L.588   THEME (setTheme, toggleTheme, _applyChartTheme)                ║
// ║  L.610   CHARTS SETUP                                                    ║
// ║  L.617     getChartTheme()                                               ║
// ║  L.712   AI COACH (fetchAIInterpretation, renderAICoach…)               ║
// ║  L.932   renderCharts()                                                  ║
// ║  L.1224  DASHBOARD BOTTOM (renderEnCours, renderDashBottom…)            ║
// ║  L.1439  JOURNAL (renderJournal, renderJTable, getFT…)                  ║
// ║  L.1588    renderJTable()                                                ║
// ║  L.1650  TRADE MODAL (openTradeModal, saveTradeModal…)                  ║
// ║  L.1685    buildForm()                                                   ║
// ║  L.1894  DETAIL MODAL (openDetailModal)                                  ║
// ║  L.1926  CALENDAR (renderCalendar)                                       ║
// ║  L.2043  CASHFLOW PAGE (renderCashflow)                                  ║
// ║  L.2158  ACCOUNTS PAGE (renderAccounts)                                  ║
// ║  L.2219  RULES PAGE (renderRules)                                        ║
// ║  L.2244  SETTINGS PAGE (renderSettings)                                  ║
// ║  L.2375  CSV / JSON EXPORT                                               ║
// ║  L.2411  ALBUM VIEW (renderAlbum)                                        ║
// ║  L.2543  AUTH (login, logout)                                            ║
// ║  L.2578  INIT (DOMContentLoaded)                                         ║
// ║  L.2600  LOADING (startLoadingCycle, hideLoadingScreen)                  ║
// ╚══════════════════════════════════════════════════════════════════════════╝

// ── SUPABASE ──────────────────────────────────────────────────────────────
const SUPABASE_URL='https://nakykfuduehcwsjuicpb.supabase.co';
const SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ha3lrZnVkdWVoY3dzanVpY3BiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MTM0MjAsImV4cCI6MjA4ODk4OTQyMH0.dGd4UnYdzOZRrExSW22AJE4RJEtU8y4U4SuXvOY-MMQ';
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);

// ── SUPABASE: TRADES ──────────────────────────────────────────────────────
async function sbLoadTrades(){
  const{data,error}=await sb.from('trades').select('data');
  if(error){console.error('sbLoadTrades:',error.message);return[];}
  return(data||[]).map(r=>r.data);
}
async function sbUpsertTrade(t){
  const{error}=await sb.from('trades').upsert({id:t.id,data:t,updated_at:new Date().toISOString()});
  if(error)console.error('sbUpsertTrade:',error.message);
}
async function sbDeleteTrade(id){
  const{error}=await sb.from('trades').delete().eq('id',id);
  if(error)console.error('sbDeleteTrade:',error.message);
}

// ── SUPABASE: ACCOUNTS ────────────────────────────────────────────────────
async function sbLoadAccounts(){
  const{data,error}=await sb.from('accounts').select('*');
  if(error){console.error('sbLoadAccounts:',error.message);return null;}
  return data||[];
}
async function sbUpsertAccount(acc){
  const{error}=await sb.from('accounts').upsert({
    id:String(acc.id),name:acc.name,
    start_capital:acc.startCapital||0,
    color:acc.color,updated_at:new Date().toISOString()
  });
  if(error)console.error('sbUpsertAccount:',error.message);
}
async function sbDeleteAccount(id){
  const{error}=await sb.from('accounts').delete().eq('id',String(id));
  if(error)console.error('sbDeleteAccount:',error.message);
}

// ── SUPABASE: CASHFLOW ────────────────────────────────────────────────────
async function sbLoadCashflow(){
  const{data,error}=await sb.from('cashflow').select('*').order('date',{ascending:false});
  if(error){console.error('sbLoadCashflow:',error.message);return null;}
  return data||[];
}
async function sbUpsertCF(cf){
  const{error}=await sb.from('cashflow').upsert({
    id:String(cf.id),type:cf.type,date:cf.date,
    compte:cf.compte,montant_usd:cf.montantUSD,
    montant_mur:cf.montantMUR,taux:cf.taux,
    note:cf.note,updated_at:new Date().toISOString()
  });
  if(error)console.error('sbUpsertCF:',error.message);
}
async function sbDeleteCF(id){
  const{error}=await sb.from('cashflow').delete().eq('id',String(id));
  if(error)console.error('sbDeleteCF:',error.message);
}
async function sbLoadTags(){
  const{data,error}=await sb.from('tags').select('name').order('name');
  if(error){console.error('sbLoadTags:',error.message);return[];}
  return(data||[]).map(r=>r.name);
}
async function sbUpsertTag(name){
  const{error}=await sb.from('tags').upsert({name},{onConflict:'name'});
  if(error)console.error('sbUpsertTag:',error.message);
}

// ── STATE ─────────────────────────────────────────────────────────────────
const KEY='tradelog_v3';
const SESSIONS=['Asian','London','New York','Hors session'];
const ETATS=['Calme','Confiant','Stressé','Impatient','Focalisé','Fatigue'];
const STRUCTURES=['BOS haussier','BOS baissier','ChoCH haussier','ChoCH baissier','Range','Tendance','Autre'];
const RESULTATS=['Win','Loss','Breakeven','En cours'];
// Tags : chargés dynamiquement depuis DB.tags
const LIQUIDITES=['Inducement','ChoCH','EQL (Equal Lows)','EQH (Equal Highs)'];
const FORM_INSTRUMENTS=['EURUSD','GBPUSD','XAUUSD','GBPJPY','EURJPY','USDJPY','NZDUSD','NASDAQ'];
const WARN_INSTRUMENTS=['USDJPY','EURJPY'];
const ACC_COLORS=['#2558CE','#8E6B1E','#2B8A4E','#8A5E12','#1E6A9A','#6B4F8A','#B05020','#4A6880'];
const SH=['ID','Compte','Date','Heure','Session','Instrument','Direction','Confiance (★)','Structure','Hors Zone','Montant Risqué','Gain/Perte','Capital','Résultat','RR','État','Pourquoi Entrer','Doute/Hésitation'];

let DB=loadLocalDB(),curPage='dashboard';
let dashFilters=new Set(['all']),jAccFilters=new Set(['all']),calAccFilters=new Set(['all']),cfAccFilters=new Set(['all']);
let dashPeriod='all',dashCustomFrom='',dashCustomTo='';
let dashWeekOffset=0,dashMonthOffset=0,dashYearOffset=0;
let jFilters={session:'',instrument:'',resultat:'',dateFrom:'',dateTo:'',period:'week',rNonProfitable:'',horsSession:''};
let jViewMode='table'; // 'table' | 'cards'
let cfFilters={type:''};
let calY=new Date().getFullYear(),calM=new Date().getMonth(),calFilter='all';
let activeTab='rules',checkedItems={},selColor=ACC_COLORS[0]||'#2558CE';
let editId=null,ss=null,tConf=3,tScrHTF='',tScrMTF='',tScrLTF='',tTags=[],tDir='';
let albumTrades=[],albumIdx=0,albumImgMode='htf';
let editCapId=null,renameAccId=null,editCFId=null;
let charts={};

function loadLocalDB(){
  try{
    const d=localStorage.getItem(KEY);
    const db=d?JSON.parse(d):defDB();
    if(db.accounts)db.accounts=db.accounts.map(a=>({...a,id:String(a.id)}));
    if(!db.cashflow)db.cashflow=[];
    if(!db.tags)db.tags=[];
    const defaultInstrs=['EURUSD','GBPUSD','USDJPY','AUDUSD','USDCAD','EURCAD','GBPJPY','EURJPY','XAUUSD'];
    if(!db.instruments)db.instruments=defaultInstrs;
    else defaultInstrs.forEach(i=>{if(!db.instruments.includes(i))db.instruments.push(i);});
    return db;
  }catch{return defDB();}
}
function defDB(){
  return{
    trades:[],
    accounts:[
      {id:'1',name:'Compte Principal',startCapital:10000,color:'#B8963E'},
      {id:'2',name:'Prop Firm',startCapital:50000,color:'#2D7A4F'}
    ],
    cashflow:[],
    tags:[],
    instruments:['EURUSD','GBPUSD','USDJPY','AUDUSD','USDCAD','EURCAD','GBPJPY','EURJPY','XAUUSD'],
    rules:[
      {id:1,text:"Ne jamais trader sans confluence de structure"},
      {id:2,text:"Attendre la liquidité avant d'entrer"},
      {id:3,text:"RR minimum 1:2"},
      {id:4,text:"Maximum 2 trades par session"},
      {id:5,text:"Pas de revenge trading"}
    ],
    checklists:[
      {id:1,text:"Structure identifiée sur HTF"},
      {id:2,text:"Liquidité visible et définie"},
      {id:3,text:"POI clairement marqué"},
      {id:4,text:"Confluences alignées (≥3)"},
      {id:5,text:"News vérifiées"},
      {id:6,text:"SL / TP définis avant entrée"}
    ]
  };
}
function saveDB(){localStorage.setItem(KEY,JSON.stringify(DB));}
function fmtD(d){if(!d)return'—';const[y,m,day]=d.split('-');return`${day}/${m}/${y}`;}
function fmtN(n,dec=2){return(n===''||n===null||n===undefined||isNaN(n))?'—':Number(n).toFixed(dec);}
function fmtMoney(n,sym='$'){if(n===null||n===undefined||isNaN(n))return'—';return`${n>=0?'+':''}${sym}${Math.abs(Number(n)).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})}`;}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

// ── RR CALCULATION ────────────────────────────────────────────────────────
function calcSession(heure){
  if(!heure)return'';
  const h=parseInt(heure.split(':')[0],10);
  if(h>=0&&h<7)return'Asian';
  if(h>=7&&h<13)return'London';
  if(h>=13&&h<18)return'New York';
  return'Hors session';
}
function updateSessionDisplay(){
  const h=document.getElementById('f_h')?.value;
  const el=document.getElementById('f_session_display');
  if(el)el.textContent=h?'Session : '+calcSession(h):'';
}
function calcRR(t){
  const gp=parseFloat(t.gainPerte);
  const mr=parseFloat(t.montantRisque);
  if(isNaN(gp)||isNaN(mr)||mr===0)return null;
  return gp/Math.abs(mr);
}
function calcPnl(t){
  const gp=parseFloat(t.gainPerte);
  if(!isNaN(gp))return gp;
  return 0;
}
function stats(trades){
  if(!trades.length)return{total:0,wins:0,losses:0,be:0,winRate:0,avgRR:0,pnl:0};
  const closed=trades.filter(t=>t.resultat!=='En cours');
  const w=closed.filter(t=>t.resultat==='Win').length;
  const l=closed.filter(t=>t.resultat==='Loss').length;
  const b=closed.filter(t=>t.resultat==='Breakeven').length;
  const rrTrades=closed.map(t=>calcRR(t)).filter(r=>r!==null&&isFinite(r));
  const avgRR=rrTrades.length?rrTrades.reduce((s,r)=>s+r,0)/rrTrades.length:0;
  const pnl=closed.reduce((s,t)=>s+calcPnl(t),0);
  return{total:closed.length,wins:w,losses:l,be:b,winRate:closed.length?Math.round(w/closed.length*100):0,avgRR,pnl};
}

function maxDrawdown(trades,startCap){
  const sorted=[...trades]
    .filter(t=>t.resultat!=='En cours'&&!isNaN(parseFloat(t.gainPerte))&&t.date)
    .sort((a,b)=>a.date.localeCompare(b.date)||(a.heure||'').localeCompare(b.heure||''));
  if(!sorted.length)return{abs:0,pct:0};
  let eq=startCap||0,peak=eq,maxDD=0,maxDDPct=0;
  sorted.forEach(t=>{
    eq+=parseFloat(t.gainPerte);
    if(eq>peak)peak=eq;
    const dd=peak-eq;
    if(dd>maxDD){maxDD=dd;maxDDPct=peak>0?(dd/peak)*100:0;}
  });
  return{abs:parseFloat(maxDD.toFixed(2)),pct:parseFloat(maxDDPct.toFixed(1))};
}
function expectancy(trades){
  const closed=trades.filter(t=>t.resultat!=='En cours'&&!isNaN(parseFloat(t.gainPerte)));
  if(!closed.length)return 0;
  const wins=closed.filter(t=>t.resultat==='Win');
  const losses=closed.filter(t=>t.resultat==='Loss');
  const wr=wins.length/closed.length,lr=losses.length/closed.length;
  const avgW=wins.length?wins.reduce((s,t)=>s+parseFloat(t.gainPerte),0)/wins.length:0;
  const avgL=losses.length?Math.abs(losses.reduce((s,t)=>s+parseFloat(t.gainPerte),0)/losses.length):0;
  return parseFloat(((wr*avgW)-(lr*avgL)).toFixed(2));
}

function toast(msg,type='info'){const t=document.getElementById('toast');t.textContent=msg;t.className='show '+type;clearTimeout(t._t);t._t=setTimeout(()=>t.className='',3000);}
function closeModal(id){document.getElementById(id).classList.remove('open');if(id==='albumModal'){const m=document.querySelector('#albumModal .album-modal');if(m)m.classList.remove('img-zoomed');}}

// Hide tooltip on scroll
document.addEventListener('scroll',()=>hideAuditTip(),true);

// ESC close modals + album keyboard nav
document.addEventListener('keydown',function(e){
  const album=document.getElementById('albumModal');
  if(album&&album.classList.contains('open')){
    if(e.key==='ArrowLeft'){e.preventDefault();albumNav(-1);return;}
    if(e.key==='ArrowRight'){e.preventDefault();albumNav(1);return;}
  }
  if(e.key==='Escape'){
    ['tradeModal','cfModal','accModal','renameAccModal','editCapModal','detailModal','imgModal','albumModal'].forEach(id=>{
      const el=document.getElementById(id);
      if(el&&el.classList.contains('open'))el.classList.remove('open');
    });
  }
});
// Click outside modal to close (all except tradeModal — risque de fermeture accidentelle)
['cfModal','accModal','renameAccModal','editCapModal','detailModal','imgModal','albumModal'].forEach(id=>{
  const el=document.getElementById(id);
  if(el)el.addEventListener('click',function(e){if(e.target===this)closeModal(id);});
});

// ── REFRESH ───────────────────────────────────────────────────────────────
async function refreshApp(){
  const btn=document.getElementById('refreshBtn');
  btn.classList.add('spinning');btn.disabled=true;
  try{
    const[trades,accounts,cashflow,tags]=await Promise.all([sbLoadTrades(),sbLoadAccounts(),sbLoadCashflow(),sbLoadTags()]);
    if(trades&&trades.length>0)DB.trades=trades;
    if(accounts&&accounts.length>0){DB.accounts=accounts.map(a=>({id:String(a.id),name:a.name,startCapital:a.start_capital,color:a.color}));}
    if(cashflow&&cashflow.length>0){DB.cashflow=cashflow.map(c=>({id:c.id,type:c.type,date:c.date,compte:c.compte,montantUSD:c.montant_usd,montantMUR:c.montant_mur,taux:c.taux,note:c.note}));}
    if(tags&&tags.length>0)DB.tags=tags;
    saveDB();showPage(curPage);toast('Données rafraîchies ✓','success');
  }catch(e){console.error('Refresh error:',e);toast('Erreur lors du rafraîchissement','error');}
  finally{btn.classList.remove('spinning');btn.disabled=false;}
}

// ── SIDEBAR MOBILE ────────────────────────────────────────────────────────
function toggleSidebar(){const open=document.getElementById('sidebar').classList.toggle('open');document.getElementById('sidebarOverlay').classList.toggle('open');document.body.classList.toggle('sidebar-open',open);}
function closeSidebar(){document.getElementById('sidebar').classList.remove('open');document.getElementById('sidebarOverlay').classList.remove('open');document.body.classList.remove('sidebar-open');}

// ── NAVIGATION ────────────────────────────────────────────────────────────
const PTitles={dashboard:'Dashboard',report:'Rapport & Analyse',journal:'Journal de trades',calendar:'Calendrier',cashflow:'Dépôts & Retraits',accounts:'Gestion des comptes',rules:'Règles & Checklist',settings:'Paramètres'};
function showPage(p){
  document.querySelectorAll('.page').forEach(e=>e.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(e=>e.classList.remove('active'));
  document.getElementById('page-'+p).classList.add('active');
  const navEl=document.querySelector('[data-page="'+p+'"]');
  if(navEl)navEl.classList.add('active');
  curPage=p;
  document.getElementById('pageTitle').textContent=PTitles[p]||p;
  document.getElementById('pageSub').textContent=`${DB.trades.length} trade${DB.trades.length>1?'s':''} · ${DB.accounts.length} compte${DB.accounts.length>1?'s':''}`;
  // Header actions — only non-journal/dashboard pages show button here (journal/dashboard use FAB)
  document.getElementById('headerActions').innerHTML=
    p==='accounts'?'<button class="btn btn-primary" onclick="openAccModal()">+ Nouveau compte</button>':
    p==='cashflow'?'<button class="btn btn-primary" onclick="openCFModal()">+ Nouveau mouvement</button>':
    p==='settings'?`<button class="btn btn-secondary btn-sm" onclick="exportJSON()">↓ Export JSON</button>`:'';
  if(p==='dashboard')renderDash();
  if(p==='report')renderReport();
  if(p==='journal')renderJournal();
  if(p==='calendar')renderCal();
  if(p==='cashflow')renderCashflow();
  if(p==='accounts')renderAccounts();
  if(p==='rules')renderRules();
  if(p==='settings')renderSettings();
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────
function renderDashFilter(){
  const el=document.getElementById('dashFilterBar');if(!el)return;
  const periods=[
    {v:'today',l:"Auj."},
    {v:'week',l:'Semaine'},
    {v:'month',l:'Mois'},
    {v:'3months',l:'3 mois'},
    {v:'year',l:'Année'},
    {v:'all',l:'Tout'},
    {v:'custom',l:'···'},
  ];
  const pills=periods.map(p=>`<button class="dash-period-pill${dashPeriod===p.v?' active':''}" onclick="setDashPeriod('${p.v}')">${p.l}</button>`).join('');
  let extra='';
  if(dashPeriod==='week'||dashPeriod==='month'||dashPeriod==='year'){
    const lbl=getDashNavLabel();
    const off=dashPeriod==='week'?dashWeekOffset:dashPeriod==='month'?dashMonthOffset:dashYearOffset;
    extra=`<div class="dash-nav-row"><button class="dash-nav-btn" onclick="navigateDash(-1)" title="Période précédente">&#8592;</button><span class="dash-nav-label">${lbl}</span><button class="dash-nav-btn" onclick="navigateDash(1)"${off>=0?' disabled':''} title="Période suivante">&#8594;</button></div>`;
  } else if(dashPeriod==='custom'){
    extra=`<div class="dash-nav-row"><span style="font-size:11px;color:var(--text4)">du</span><input type="date" class="dash-date-input" value="${dashCustomFrom}" onchange="setDashCustomDate('from',this.value)"/><span style="font-size:11px;color:var(--text4)">au</span><input type="date" class="dash-date-input" value="${dashCustomTo}" onchange="setDashCustomDate('to',this.value)"/></div>`;
  }
  el.innerHTML=`<div><div class="dash-period-pills">${pills}</div>${extra}</div>`;
}
function setDashPeriod(v){
  if(v!==dashPeriod){dashWeekOffset=0;dashMonthOffset=0;dashYearOffset=0;}
  dashPeriod=v;
  if(v==='custom'&&(!dashCustomFrom||!dashCustomTo)){const r=getPeriodRange('month');dashCustomFrom=r.from;dashCustomTo=r.to;}
  if(curPage==='report')renderReport();else renderDash();
}
function setDashCustomDate(k,v){
  if(k==='from')dashCustomFrom=v;else dashCustomTo=v;
  if(curPage==='report')renderReport();else renderDash();
}
function navigateDash(dir){
  if(dashPeriod==='week')dashWeekOffset=Math.min(0,dashWeekOffset+dir);
  else if(dashPeriod==='month')dashMonthOffset=Math.min(0,dashMonthOffset+dir);
  else if(dashPeriod==='year')dashYearOffset=Math.min(0,dashYearOffset+dir);
  if(curPage==='report')renderReport();else renderDash();
}
function getISOWeek(d){
  const dt=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));
  const day=dt.getUTCDay()||7;dt.setUTCDate(dt.getUTCDate()+4-day);
  const y0=new Date(Date.UTC(dt.getUTCFullYear(),0,1));
  return Math.ceil(((dt-y0)/86400000+1)/7);
}
function getDashRange(){
  const fmt=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const now=new Date();
  if(dashPeriod==='week'){
    const day=now.getDay(),diff=day===0?-6:1-day;
    const mon=new Date(now);mon.setDate(now.getDate()+diff+dashWeekOffset*7);
    const sun=new Date(mon);sun.setDate(mon.getDate()+6);
    return{from:fmt(mon),to:fmt(sun)};
  }
  if(dashPeriod==='month'){
    const d=new Date(now.getFullYear(),now.getMonth()+dashMonthOffset,1);
    const last=new Date(d.getFullYear(),d.getMonth()+1,0);
    return{from:fmt(d),to:fmt(dashMonthOffset===0?now:last)};
  }
  if(dashPeriod==='year'){
    const y=now.getFullYear()+dashYearOffset;
    return{from:`${y}-01-01`,to:fmt(dashYearOffset===0?now:new Date(y,11,31))};
  }
  if(dashPeriod==='custom')return{from:dashCustomFrom,to:dashCustomTo};
  return getPeriodRange(dashPeriod);// today, 3months, lastmonth, all
}
function getDashNavLabel(){
  const MOIS=['janv','févr','mars','avr','mai','juin','juil','août','sept','oct','nov','déc'];
  const now=new Date();
  if(dashPeriod==='week'){
    const day=now.getDay(),diff=day===0?-6:1-day;
    const mon=new Date(now);mon.setDate(now.getDate()+diff+dashWeekOffset*7);
    const sun=new Date(mon);sun.setDate(mon.getDate()+6);
    const wn=getISOWeek(mon);
    const same=mon.getMonth()===sun.getMonth();
    const range=same?`${mon.getDate()}–${sun.getDate()} ${MOIS[sun.getMonth()]}`:
      `${mon.getDate()} ${MOIS[mon.getMonth()]}–${sun.getDate()} ${MOIS[sun.getMonth()]}`;
    return `S${wn} · ${range} ${sun.getFullYear()}`;
  }
  if(dashPeriod==='month'){
    const d=new Date(now.getFullYear(),now.getMonth()+dashMonthOffset,1);
    return d.toLocaleDateString('fr-FR',{month:'long',year:'numeric'}).replace(/^\w/,c=>c.toUpperCase());
  }
  if(dashPeriod==='year'){
    return String(now.getFullYear()+dashYearOffset);
  }
  return '';
}

function renderDash(){
  renderPills();renderDashFilter();
  let f=dashFilters.has('all')?DB.trades:DB.trades.filter(t=>dashFilters.has(t.compte));
  const _dr=getDashRange();if(_dr.from)f=f.filter(t=>t.date>=_dr.from);if(_dr.to)f=f.filter(t=>t.date<=_dr.to);
  const s=stats(f);window._dashF=f;

  // ── Hero command bar ──
  const heroEl=document.getElementById('dashHero');
  if(heroEl){
    const pnlAbs=Math.abs(s.pnl).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2});
    const pnlStr=(s.pnl>=0?'+$':'-$')+pnlAbs;
    const pnlCls=s.pnl>0?'pos':s.pnl<0?'neg':'';
    const closed=f.filter(t=>t.resultat!=='En cours');
    const totalWin=closed.filter(t=>t.resultat==='Win').reduce((a,t)=>a+(parseFloat(t.gainPerte)||0),0);
    const totalLoss=Math.abs(closed.filter(t=>t.resultat==='Loss').reduce((a,t)=>a+(parseFloat(t.gainPerte)||0),0));
    const pf=totalLoss>0?(totalWin/totalLoss):0;
    const pfStr=pf>0?fmtN(pf,2):'—';
    const pfCls=pf>=1.5?'pos':pf>=1?'gold':'neg';
    const rrCls=s.avgRR>=1.5?'pos':s.avgRR>=0?'gold':'neg';
    const wrCls=s.winRate>=60?'pos':s.winRate>=40?'gold':'neg';
    // find or create hero-body
    let body=heroEl.querySelector('.dash-hero-body');
    if(!body){body=document.createElement('div');body.className='dash-hero-body';heroEl.appendChild(body);}
    body.innerHTML=`
      <div>
        <div class="dash-hero-pnl-label">P&amp;L NET RÉALISÉ</div>
        <div class="dash-hero-pnl-value ${pnlCls}">${pnlStr}</div>
        <div class="dash-hero-pnl-sub">${s.total} trades · ${s.wins} wins · ${s.losses} losses · ${s.be} BE</div>
      </div>
      <div class="dash-hero-divider"></div>
      <div class="dash-hero-kpis">
        <div class="dash-hero-kpi">
          <span class="dash-hero-kpi-v ${wrCls}">${s.winRate}%</span>
          <span class="dash-hero-kpi-l">Win Rate</span>
        </div>
        <div class="dash-hero-kpi">
          <span class="dash-hero-kpi-v ${rrCls}">${s.avgRR>=0?'+':''}${fmtN(s.avgRR,2)}R</span>
          <span class="dash-hero-kpi-l">RR Moyen</span>
        </div>
        <div class="dash-hero-kpi">
          <span class="dash-hero-kpi-v ${pfCls}">${pfStr}</span>
          <span class="dash-hero-kpi-l">Profit Factor</span>
        </div>
        <div class="dash-hero-kpi">
          ${(()=>{const disc=getDisciplineAudit(f);const dCls=disc.score>=80?'pos':disc.score>=60?'gold':'neg';return`<span class="dash-hero-kpi-v ${dCls}">${disc.score}%</span><span class="dash-hero-kpi-l">Discipline</span>`;})()}
        </div>
      </div>`;
  }

  // ── Secondary stat cards ──
  const _singleAccObj=dashFilters.has('all')||dashFilters.size!==1?null:DB.accounts.find(a=>a.name===[...dashFilters][0]);
  const _startCap=_singleAccObj?.startCapital?parseFloat(_singleAccObj.startCapital):0;
  const _dd=maxDrawdown(f,_startCap);
  const _exp=expectancy(f);
  const _expCls=_exp>0?'green':_exp<0?'red':'';
  const _ddCls=_dd.pct===0?'':_dd.pct<5?'green':_dd.pct<15?'gold':'red';
  const statDefs=[
    {l:'Win Rate',v:`${s.winRate}%`,sub:`${s.wins}W · ${s.losses}L · ${s.be}BE`,c:s.winRate>=60?'green':s.winRate>=40?'':'red',dk:'Win',bar:s.winRate,barCol:s.winRate>=60?'var(--green)':s.winRate>=40?'var(--accent)':'var(--red)'},
    {l:'Expectancy',v:_exp===0?'—':(_exp>0?'+$':'-$')+Math.abs(_exp).toFixed(2),sub:'par trade fermé',c:_expCls,extra:'expectancy'},
    {l:'Max Drawdown',v:_dd.pct>0?`${_dd.pct}%`:'—',sub:_dd.abs>0?`-$${_dd.abs.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})}`:'aucun drawdown',c:_ddCls,extra:'maxdd'},
    {l:'Total Trades',v:s.total,sub:`RR moy. ${s.avgRR>=0?'+':''}${fmtN(s.avgRR,2)}R`,c:'',dk:'all'},
  ];
  document.getElementById('dashStats').innerHTML=statDefs.map(x=>{
    const click=x.dk?` onclick="onStatCard(this)" data-dk="${x.dk}" style="cursor:pointer"`:'';
    const progressBar=x.bar!==undefined?`<div style="margin-top:9px;height:3px;background:var(--border2);border-radius:3px;overflow:hidden"><div style="width:${Math.min(x.bar,100)}%;height:100%;background:${x.barCol};border-radius:3px;transition:width .4s"></div></div>`:'';
    const extraCls=x.extra?` ${x.extra}`:'';
    return `<div class="stat-card ${x.c}${extraCls}"${click}>
      <div class="stat-label">${x.l}</div>
      <div class="stat-value ${x.c}">${x.v}</div>
      <div class="stat-delta">${x.sub}</div>
      ${progressBar}
    </div>`;
  }).join('');

  renderDisciplineBanner(f);
  renderCharts(f);
  renderEnCours(f);
  renderAICoach(f);
}
function getDisciplineAudit(f){
  const closed=f.filter(t=>t.resultat!=='En cours');
  if(!closed.length)return{score:100,leak:0,total:0,undisciplined:[],cntHz:0,cntConf:0,cntFrag:0,cntNoReason:0};
  const undisciplined=closed.filter(t=>{
    const sv=t.stars||(t.confiance?Math.max(1,Math.min(5,Math.round(t.confiance/2))):null);
    return t.horsZone===true||t.structure==='fragile'||(sv!==null&&sv<3);
  });
  const score=Math.round((1-undisciplined.length/closed.length)*100);
  const leak=Math.abs(undisciplined.reduce((s,t)=>{const gp=parseFloat(t.gainPerte)||0;return s+(gp<0?gp:0);},0));
  // Compteurs détaillés (sur tous trades fermés, pas seulement les indisciplinés)
  const cntHz=closed.filter(t=>t.horsZone===true).length;
  const cntFrag=closed.filter(t=>t.structure==='fragile').length;
  const cntConf=closed.filter(t=>{const sv=t.stars||(t.confiance?Math.max(1,Math.min(5,Math.round(t.confiance/2))):null);return sv!==null&&sv<3;}).length;
  const cntNoReason=closed.filter(t=>!t.pourquoiEntrer||!t.pourquoiEntrer.trim()).length;
  return{score,leak,total:closed.length,undisciplined,cntHz,cntFrag,cntConf,cntNoReason};
}
function renderDisciplineBanner(f){
  const el=document.getElementById('dashDiscipline');if(!el)return;
  const d=getDisciplineAudit(f);
  if(!d.total){el.innerHTML='';return;}
  const scoreCls=d.score>=80?'var(--green)':d.score>=60?'var(--text)':'var(--red)';
  const totalPnl=f.filter(t=>t.resultat!=='En cours').reduce((s,t)=>s+(parseFloat(t.gainPerte)||0),0);
  const potential=totalPnl+d.leak;
  const pct=totalPnl!==0?((d.leak/Math.abs(totalPnl))*100).toFixed(0):0;
  const msg=d.leak>0
    ?`Votre indiscipline coûte $${fmtN(d.leak,2)} — avec un plan respecté, votre capital serait ${pct}% plus élevé`
    :`Discipline parfaite sur la période — continuez sur cette lancée`;
  // Bullets de détail
  const T=d.total;
  const bullets=[
    d.cntHz>0?`${d.cntHz} trade${d.cntHz>1?'s':''} sur ${T} pris hors killzone (Londres 11h–14h / NY 16h30–19h30 GMT+4)`:'',
    d.cntConf>0?`${d.cntConf} trade${d.cntConf>1?'s':''} sur ${T} avec une conviction faible (inférieure à 3★)`:'',
    d.cntFrag>0?`${d.cntFrag} trade${d.cntFrag>1?'s':''} sur ${T} forcés sur une structure jugée "Fragile"`:'',
    d.cntNoReason>0?`${d.cntNoReason} trade${d.cntNoReason>1?'s':''} sur ${T} sans raison d'entrée documentée (trading impulsif)`:'',
  ].filter(Boolean);
  const bulletsHtml=bullets.length?`<ul style="margin:8px 0 0;padding-left:16px;list-style:disc;display:flex;flex-direction:column;gap:3px">${bullets.map(b=>`<li style="font-size:11px;color:var(--amber);opacity:.85">${b}</li>`).join('')}</ul>`:'';
  el.innerHTML=`<div class="disc-banner">
    <div class="disc-banner-item">
      <div class="disc-banner-label">Discipline Score</div>
      <div class="disc-banner-value" style="color:${scoreCls}">${d.score}%</div>
      <div class="disc-banner-sub">${d.total-d.undisciplined.length}/${d.total} trades conformes</div>
    </div>
    <div class="disc-banner-item">
      <div class="disc-banner-label">Equity Leak</div>
      <div class="disc-banner-value" style="color:var(--amber)">-$${fmtN(d.leak,2)}</div>
      <div class="disc-banner-sub">pertes sur trades indisciplinés</div>
    </div>
    <div class="disc-banner-item">
      <div class="disc-banner-label">Capital théorique</div>
      <div class="disc-banner-value" style="color:var(--green)">${potential>=0?'+':''}$${fmtN(Math.abs(potential),2)}</div>
      <div class="disc-banner-sub">si plan respecté</div>
    </div>
    <div class="disc-banner-msg">⚡ ${msg}${bulletsHtml}</div>
  </div>`;
}
function onStatCard(el){
  const dk=el.dataset.dk;if(!window._dashF)return;
  if(dk==='all')openTradeListModal(window._dashF,'Tous les trades');
  else openTradeListModal(window._dashF.filter(t=>t.resultat===dk),dk==='Win'?'Trades gagnants':'Trades perdants');
}
function renderPills(){
  const allSel=dashFilters.has('all');
  let h=`<span style="font-size:10px;font-weight:600;color:var(--text3);letter-spacing:.5px;text-transform:uppercase;margin-right:4px">Compte :</span>`;
  h+=`<button class="acc-pill ${allSel?'active':''}" style="${allSel?'background:var(--text);border-color:var(--text)':''}" onclick="toggleDF('all')">Tous</button>`;
  DB.accounts.forEach(a=>{const ok=!allSel&&dashFilters.has(a.name);h+=`<button class="acc-pill ${ok?'active':''}" style="${ok?`background:${a.color};border-color:${a.color}`:''}" onclick="toggleDF('${esc(a.name)}')"><span style="width:7px;height:7px;border-radius:50%;background:${a.color};display:inline-block"></span>${esc(a.name)}</button>`;});
  document.getElementById('dashPills').innerHTML=h;
}
function toggleDF(name){
  if(name==='all'){dashFilters=new Set(['all']);}
  else{dashFilters.delete('all');if(dashFilters.has(name))dashFilters.delete(name);else dashFilters.add(name);if(dashFilters.size===0)dashFilters=new Set(['all']);}
  if(curPage==='report')renderReport();else renderDash();
}
function renderEnCours(f){
  const el=document.getElementById('dashEnCours');
  if(!el)return;
  const encours=(f||DB.trades).filter(t=>t.resultat==='En cours').sort((a,b)=>b.date.localeCompare(a.date)||(b.heure||'').localeCompare(a.heure||''));
  if(!encours.length){el.innerHTML='';return;}
  const isMobile=window.innerWidth<=768;
  let h=`<div class="table-wrap">
    <div class="encours-header">
      <div style="display:flex;align-items:center;gap:9px">
        <div style="width:7px;height:7px;border-radius:50%;background:var(--blue);animation:pulse 2s ease-in-out infinite;flex-shrink:0"></div>
        <span style="font-size:12.5px;font-weight:600;letter-spacing:.2px">Trades en cours</span>
        <span class="badge badge-encours">${encours.length}</span>
      </div>
    </div>`;
  if(isMobile){
    h+=`<div style="display:flex;flex-direction:column">`;
    encours.forEach(t=>{
      const ac=DB.accounts.find(a=>a.name===t.compte);
      const mr=t.montantRisque?'$'+parseFloat(t.montantRisque).toFixed(2):'—';
      h+=`<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--border2);cursor:pointer;gap:10px" onclick="openDetail('${t.id}')">
        <div style="display:flex;align-items:center;gap:7px;min-width:0">
          ${ac?`<span style="width:7px;height:7px;border-radius:50%;background:${ac.color};display:inline-block;flex-shrink:0"></span>`:''}
          <span style="font-weight:700;font-family:'DM Mono',monospace;font-size:13px;flex-shrink:0">${esc(t.instrument||'—')}</span>
          <span style="font-size:11px;color:var(--text3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${fmtD(t.date)}${t.heure?' '+t.heure:''}</span>
        </div>
        <div style="display:flex;align-items:center;gap:7px;flex-shrink:0">
          <span style="font-family:'DM Mono',monospace;font-size:12px;font-weight:400">${mr}</span>
          <div onclick="event.stopPropagation()" style="display:flex;gap:0">
            <button class="btn-ghost btn-sm" onclick="openEdit('${t.id}')">✎</button>
            <button class="btn-ghost btn-sm" style="color:var(--red)" onclick="delTrade('${t.id}')">🗑</button>
          </div>
        </div>
      </div>`;
    });
    h+=`</div>`;
  }else{
    h+=`<table style="width:100%;min-width:540px"><thead><tr>
      <th>Instrument</th><th>Date / Heure</th><th>Session</th><th>Compte</th><th>Direction</th><th>Risque</th><th></th>
    </tr></thead><tbody>`;
    encours.forEach(t=>{
      const ac=DB.accounts.find(a=>a.name===t.compte);
      const mr=t.montantRisque?'$'+parseFloat(t.montantRisque).toFixed(2):'—';
      h+=`<tr class="tr-data row-encours" onclick="openDetail('${t.id}')">
        <td><div style="display:flex;align-items:center;gap:7px">
          ${ac?`<span style="width:7px;height:7px;border-radius:50%;background:${ac.color};display:inline-block;flex-shrink:0"></span>`:''}
          <span style="font-weight:700;font-family:'DM Mono',monospace;font-size:13px">${esc(t.instrument||'—')}</span>
        </div></td>
        <td style="font-family:'DM Mono',monospace;font-size:12px;color:var(--text3)">${fmtD(t.date)}${t.heure?' '+t.heure:''}</td>
        <td style="color:var(--text3);font-size:12px">${esc(t.session||'—')}</td>
        <td style="font-size:12px;color:var(--text3);max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(t.compte||'—')}</td>
        <td style="font-size:12px;color:var(--text3)">${t.direction?`<span class="badge" style="background:${t.direction==='Long'?'var(--green-bg)':'var(--red-bg)'};color:${t.direction==='Long'?'var(--green)':'var(--red)'};border:1px solid ${t.direction==='Long'?'var(--green-bd)':'var(--red-bd)'}">${t.direction==='Long'?'↑':'↓'} ${t.direction}</span>`:'—'}</td>
        <td style="font-family:'DM Mono',monospace;font-size:12px;font-weight:400">${mr}</td>
        <td onclick="event.stopPropagation()" style="white-space:nowrap">
          <button class="btn-ghost btn-sm" onclick="openEdit('${t.id}')">✎</button>
          <button class="btn-ghost btn-sm" style="color:var(--red)" onclick="delTrade('${t.id}')">🗑</button>
        </td>
      </tr>`;
    });
    h+=`</tbody></table>`;
  }
  h+=`</div>`;
  el.innerHTML=h;
}

// ── THEME ─────────────────────────────────────────────────────────────────
function setTheme(t){
  document.body.dataset.theme=(t==='light'?'':t);
  localStorage.setItem('tl_theme',t);
  // Sync chart text color with current CSS theme (--text3 is calibrated per theme)
  const cs=getComputedStyle(document.body);
  Chart.defaults.color=cs.getPropertyValue('--text3').trim()||'#4A6080';
  Chart.defaults.borderColor=cs.getPropertyValue('--border').trim()||'rgba(30,50,100,.1)';
  Object.values(Chart.instances||{}).forEach(c=>{try{c.update();}catch(e){}});
}
(function(){
  const saved=localStorage.getItem('tl_theme')||'light';
  document.body.dataset.theme=(saved==='light'?'':saved);
})();

// ── CHARTS ────────────────────────────────────────────────────────────────
Chart.defaults.font.family="'DM Mono','Inter',system-ui,sans-serif";
Chart.defaults.font.size=11;
Chart.defaults.font.weight='400';
// Lire --text3 depuis le CSS (correct pour tous les thèmes, y.c. au chargement)
Chart.defaults.color=getComputedStyle(document.body).getPropertyValue('--text3').trim()||'#4A6080';

function dc(id){if(charts[id]){charts[id].destroy();delete charts[id];}}
function getChartTheme(){
  const t=document.body.dataset.theme||'light';
  const dk=t==='dark',gd=t==='gold';
  return{
    win:       dk?'#26a69a':gd?'#26a69a':'#276A44',
    loss:      dk?'#ef5350':gd?'#ef5350':'#8A3530',
    winBg:     dk?'rgba(38,166,154,.80)':gd?'rgba(38,166,154,.75)':'rgba(39,106,68,.82)',
    lossBg:    dk?'rgba(239,83,80,.75)':gd?'rgba(239,83,80,.72)':'rgba(138,53,48,.78)',
    winFill:   dk?'rgba(38,166,154,.12)':gd?'rgba(38,166,154,.10)':'rgba(39,106,68,.10)',
    lossFill:  dk?'rgba(239,83,80,.12)':gd?'rgba(239,83,80,.10)':'rgba(138,53,48,.12)',
    midBg:     dk?'rgba(255,152,0,.70)':gd?'rgba(197,160,89,.70)':'rgba(138,94,18,.75)',
    emptyBg:   dk?'rgba(255,255,255,.08)':gd?'rgba(197,160,89,.12)':'rgba(180,180,180,.25)',
    grid:      dk?'rgba(42,46,57,.9)':gd?'rgba(45,38,26,.9)':'rgba(28,24,16,.06)',
    ttBorder:  dk?'rgba(77,126,255,.32)':gd?'rgba(197,160,89,.35)':'rgba(37,88,206,.15)'
  };
}

function mkBar(id,labels,data,colors,onClickFn){
  dc(id);
  const ctx=document.getElementById(id)?.getContext('2d');
  if(!ctx)return;
  const ct=getChartTheme();
  const isArr=Array.isArray(colors);
  const bgs=isArr?colors:labels.map((_,i)=>{
    const palette=['#2558CE','#8E6B1E','#2B8A4E','#8A5E12','#1E6A9A','#6B4F8A','#B05020'];
    return palette[i%palette.length]+'CC';
  });
  charts[id]=new Chart(ctx,{
    type:'bar',
    data:{labels,datasets:[{data,backgroundColor:bgs,borderRadius:2,borderSkipped:false}]},
    options:{
      responsive:true,maintainAspectRatio:false,
      onClick:onClickFn||null,
      plugins:{
        legend:{display:false},
        tooltip:{
          backgroundColor:getComputedStyle(document.body).getPropertyValue('--sb-bg').trim()||'#0C0E14',
          titleColor:'#FFFFFF',bodyColor:'rgba(255,255,255,.7)',
          borderColor:ct.ttBorder,borderWidth:1,
          cornerRadius:3,padding:8,
          callbacks:{label:v=>`  ${v.parsed.y}%`}
        }
      },
      scales:{
        x:{grid:{display:false},border:{display:false},ticks:{font:{size:10},padding:4}},
        y:{
          grid:{color:ct.grid,lineWidth:1},border:{display:false},
          ticks:{font:{size:10},callback:v=>`${v}%`,padding:6},
          max:100,beginAtZero:true
        }
      }
    }
  });
}

// Graphique gain net $ par catégorie
function mkBarGain(id,labels,data,colors,onClickFn){
  dc(id);
  const ctx=document.getElementById(id)?.getContext('2d');
  if(!ctx)return;
  const ct=getChartTheme();
  const bgs=data.map((v,i)=>{
    if(Array.isArray(colors))return colors[i]||colors[i%colors.length];
    return v>=0?ct.winBg:ct.lossBg;
  });
  charts[id]=new Chart(ctx,{
    type:'bar',
    data:{labels,datasets:[{data,backgroundColor:bgs,borderRadius:2,borderSkipped:false}]},
    options:{
      responsive:true,maintainAspectRatio:false,
      onClick:onClickFn||null,
      plugins:{
        legend:{display:false},
        tooltip:{
          backgroundColor:getComputedStyle(document.body).getPropertyValue('--sb-bg').trim()||'#0C0E14',
          titleColor:'#FFFFFF',bodyColor:'rgba(255,255,255,.7)',
          borderColor:getChartTheme().ttBorder,borderWidth:1,cornerRadius:3,padding:8,
          callbacks:{
            label:v=>{const val=v.parsed.y;return`${val>=0?'+':''}$${val.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})}`},
            afterLabel:ctx2=>{const idx=ctx2.dataIndex;const n=ctx2.dataset._counts?ctx2.dataset._counts[idx]:null;return n!=null?`${n} trade${n>1?'s':''}`:''}
          }
        }
      },
      scales:{
        x:{grid:{display:false},ticks:{font:{size:10}},border:{display:false}},
        y:{
          grid:{color:'rgba(28,24,16,.05)',drawBorder:false},
          ticks:{font:{size:10},callback:v=>`$${v>=0?'+':''}${v.toLocaleString()}`},
          border:{display:false},beginAtZero:true
        }
      }
    }
  });
}

// ── AI COACH ──────────────────────────────────────────────────────────────
const GEMINI_MODEL='gemini-2.5-flash';
const GEMINI_ENDPOINT=`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const AI_CACHE_KEY='tl_ai_cache';
const AI_CACHE_TTL=6*3600*1000; // 6h

function saveGeminiKey(){
  const k=document.getElementById('geminiKeyInput')?.value.trim();
  if(!k)return;
  localStorage.setItem('gemini_api_key',k);
  // Reset status badge
  const s=document.getElementById('geminiStatus');if(s)s.textContent='✓ Clé configurée';
  toast('Clé Gemini enregistrée ✓','success');
  // Si le dashboard est ouvert, relancer l'analyse
  if(curPage==='dashboard')renderAICoach(window._dashF||DB.trades);
}

function refreshAICoach(){
  localStorage.removeItem(AI_CACHE_KEY);
  if(curPage==='dashboard')renderAICoach(window._dashF||DB.trades);
  else toast('Cache IA effacé','info');
}

function _buildAIPrompt(trades){
  const closed=trades.filter(t=>t.resultat!=='En cours')
    .sort((a,b)=>b.date.localeCompare(a.date)||(b.heure||'').localeCompare(a.heure||''))
    .slice(0,20);

  // Stats rapides pour le contexte
  const wins=closed.filter(t=>t.resultat==='Win').length;
  const losses=closed.filter(t=>t.resultat==='Loss').length;
  const be=closed.filter(t=>t.resultat==='Breakeven').length;
  const totalPnl=closed.reduce((s,t)=>s+(parseFloat(t.gainPerte)||0),0);
  const hzCount=closed.filter(t=>t.horsZone===true).length;
  const fragCount=closed.filter(t=>t.structure==='fragile').length;

  const tradeLines=closed.map((t,i)=>{
    const sv=t.stars||(t.confiance?Math.max(1,Math.min(5,Math.round(t.confiance/2))):null);
    const gp=parseFloat(t.gainPerte)||0;
    const rr=parseFloat(t.rr)||null;
    const parts=[
      `#${i+1}`,
      t.date+(t.heure?' '+t.heure:''),
      t.instrument||'?',
      t.direction||'?',
      t.resultat,
      `PnL:${gp>=0?'+':''}$${gp.toFixed(2)}`,
      rr!==null?`RR:${rr>=0?'+':''}${rr.toFixed(2)}R`:null,
      sv?`Confiance:${sv}★`:null,
      t.structure?`Structure:${t.structure.toUpperCase()}`:null,
      t.horsZone?'HORS-ZONE':null,
      t.pourquoiEntrer?`Raison:"${t.pourquoiEntrer.slice(0,100)}"`:null,
    ].filter(Boolean);
    return parts.join(' | ');
  }).join('\n');

  const systemPrompt=`Tu es un coach de trading spécialisé en Price Action et Smart Money Concepts. Tu analyses les données brutes de trades et fournis des retours précis, directs, et basés uniquement sur les données fournies.

RÈGLES ABSOLUES :
- Commence DIRECTEMENT par "### Ce qui a bien fonctionné" sans introduction ni formule de politesse
- Cite chaque trade par son numéro (#1, #2, etc.) quand tu l'analyses
- Si une donnée est manquante ("?"), dis-le clairement
- Ne devine pas, ne généralise pas — base-toi uniquement sur les chiffres fournis
- Réponds en français, ton coach professionnel

STRUCTURE OBLIGATOIRE (respecte ces 5 sections exactement, dans cet ordre) :
### Ce qui a bien fonctionné
### Points faibles détectés
### Analyse discipline
### Recommandations (liste de 3 à 5 points actionnables)
### Synthèse & Score de rigueur /10`;

  const userMessage=`Voici les ${closed.length} derniers trades fermés à analyser :

${tradeLines}

Contexte global : ${wins}W / ${losses}L / ${be}BE | PnL net : ${totalPnl>=0?'+':''}$${totalPnl.toFixed(2)} | ${hzCount} trades hors killzone | ${fragCount} trades structure fragile

Règles de discipline du trader :
- Killzones GMT+4 : Londres 11h–14h, New York 16h30–19h30
- Confiance minimum : 3★/5
- Structure préférée : SOLIDE (tendance alignée)`;

  return {systemPrompt, userMessage};
}

async function fetchAIInterpretation(trades){
  const key=localStorage.getItem('gemini_api_key');
  if(!key)throw new Error('NO_KEY');

  // Vérifier cache
  try{
    const c=JSON.parse(localStorage.getItem(AI_CACHE_KEY)||'null');
    if(c&&Date.now()-c.ts<AI_CACHE_TTL)return{text:c.text,cached:true,ts:c.ts,truncated:c.truncated||false};
  }catch(e){localStorage.removeItem(AI_CACHE_KEY);}

  const {systemPrompt,userMessage}=_buildAIPrompt(trades);
  const resp=await fetch(`${GEMINI_ENDPOINT}?key=${key}`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      systemInstruction:{parts:[{text:systemPrompt}]},
      contents:[{role:'user',parts:[{text:userMessage}]}],
      generationConfig:{temperature:0.4,maxOutputTokens:4000,topP:0.9}
    })
  });

  if(!resp.ok){
    const err=await resp.json().catch(()=>({}));
    throw new Error(err?.error?.message||`HTTP ${resp.status}`);
  }
  const data=await resp.json();
  const candidate=data?.candidates?.[0];
  const text=candidate?.content?.parts?.[0]?.text;
  if(!text)throw new Error('Réponse vide de Gemini — vérifie ta clé API et les quotas');
  const truncated=candidate?.finishReason==='MAX_TOKENS';

  localStorage.setItem(AI_CACHE_KEY,JSON.stringify({text,ts:Date.now(),truncated,promptVer:'v2'}));
  return{text,cached:false,ts:Date.now(),truncated};
}

// Rendu Markdown minimal (bold, italic, h3, listes, paragraphes)
function _mdToHtml(md){
  const lines=md.split('\n');
  let html='',inUl=false,inOl=false;
  const closeList=()=>{if(inUl){html+='</ul>';inUl=false;}if(inOl){html+='</ol>';inOl=false;}};
  const inline=s=>s
    .replace(/\*\*\*(.+?)\*\*\*/g,'<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/`(.+?)`/g,'<code style="background:var(--surface3);padding:1px 5px;border-radius:3px;font-family:\'DM Mono\',monospace;font-size:11px">$1</code>');
  lines.forEach(raw=>{
    const l=raw.trimEnd();
    if(/^###\s/.test(l)){closeList();html+=`<h3>${inline(l.replace(/^###\s/,''))}</h3>`;return;}
    if(/^##\s/.test(l)){closeList();html+=`<h3>${inline(l.replace(/^##\s/,''))}</h3>`;return;}
    if(/^#\s/.test(l)){closeList();html+=`<h3>${inline(l.replace(/^#\s/,''))}</h3>`;return;}
    if(/^[-*]\s/.test(l)){if(!inUl){closeList();html+='<ul>';inUl=true;}html+=`<li>${inline(l.replace(/^[-*]\s/,''))}</li>`;return;}
    if(/^\d+\.\s/.test(l)){if(!inOl){closeList();html+='<ol>';inOl=true;}html+=`<li>${inline(l.replace(/^\d+\.\s/,''))}</li>`;return;}
    closeList();
    if(l===''){html+='';return;}
    html+=`<p>${inline(l)}</p>`;
  });
  closeList();
  return html;
}

function renderAICoach(f){
  const el=document.getElementById('dashAICoach');if(!el)return;
  const key=localStorage.getItem('gemini_api_key');
  const closed=f.filter(t=>t.resultat!=='En cours');

  if(!key){
    el.innerHTML=`<div class="ai-coach-card">
      <div class="ai-coach-head">
        <div class="ai-coach-title">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          Coach IA — Gemini
        </div>
      </div>
      <div class="ai-coach-empty">
        <div style="font-size:28px;margin-bottom:8px">🤖</div>
        <div style="font-weight:600;color:var(--text2);margin-bottom:5px">Coach IA non configuré</div>
        <div>Ajoute ta clé API Gemini dans <strong>Paramètres</strong> pour activer l'analyse de tes trades.</div>
      </div>
    </div>`;
    return;
  }
  if(closed.length<3){
    el.innerHTML=`<div class="ai-coach-card"><div class="ai-coach-empty">Pas assez de trades fermés (minimum 3) pour une analyse IA.</div></div>`;
    return;
  }

  // Afficher état loading
  el.innerHTML=`<div class="ai-coach-card">
    <div class="ai-coach-head">
      <div class="ai-coach-title">
        <div class="ai-spin"></div>
        Coach IA — Gemini
      </div>
      <span class="ai-coach-meta">Analyse en cours…</span>
    </div>
    <div class="ai-coach-body" style="display:flex;align-items:center;gap:10px;padding:18px">
      <div class="ai-spin"></div>
      <span style="color:var(--text4);font-size:12px">Gemini analyse tes ${Math.min(closed.length,20)} derniers trades…</span>
    </div>
  </div>`;

  // Appel async
  fetchAIInterpretation(f).then(({text,cached,ts,truncated})=>{
    const age=cached?Math.round((Date.now()-ts)/60000)+'min':'maintenant';
    const cacheLabel=cached?`<span style="color:var(--text4);font-size:10px">· cache ${age}</span>`:'<span style="color:var(--green);font-size:10px">· fraîche</span>';
    const truncWarn=truncated?`<div style="margin:0 18px 12px;padding:7px 11px;background:var(--amber-bg);border:1px solid var(--amber-bd);border-radius:6px;font-size:11px;color:var(--amber)">⚠ Réponse tronquée (quota tokens atteint) — clique sur ↺ Actualiser pour relancer</div>`:'';
    el.innerHTML=`<div class="ai-coach-card">
      <div class="ai-coach-head">
        <div class="ai-coach-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          Coach IA — Gemini 2.5 Flash
          ${cacheLabel}
        </div>
        <button class="btn btn-secondary btn-sm" onclick="refreshAICoach()" style="font-size:10px;padding:3px 9px" title="Vider le cache et relancer">↺ Actualiser</button>
      </div>
      ${truncWarn}
      <div class="ai-coach-body">${_mdToHtml(text)}</div>
    </div>`;
  }).catch(err=>{
    const isNoKey=err.message==='NO_KEY';
    const msg=isNoKey?'Clé API manquante — configure-la dans Paramètres.':err.message;
    el.innerHTML=`<div class="ai-coach-card">
      <div class="ai-coach-head">
        <div class="ai-coach-title" style="color:var(--red)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Coach IA — Erreur
        </div>
        <button class="btn btn-secondary btn-sm" onclick="refreshAICoach()" style="font-size:10px;padding:3px 9px">Réessayer</button>
      </div>
      <div class="ai-coach-empty" style="color:var(--red)">${esc(msg)}</div>
    </div>`;
  });
}

function renderCharts(f){
  const singleAcc=!dashFilters.has('all')&&dashFilters.size===1?[...dashFilters][0]:null;
  const acc=singleAcc?DB.accounts.find(a=>a.name===singleAcc):null;
  const ac=acc?.color||'#2558CE';

  dc('cCapital');
  const ctx=document.getElementById('cCapital')?.getContext('2d');
  if(!ctx)return;

  const closedF=[...f].filter(t=>t.resultat!=='En cours'&&t.gainPerte!==''&&t.gainPerte!==undefined&&!isNaN(parseFloat(t.gainPerte))&&t.date)
    .sort((a,b)=>a.date.localeCompare(b.date)||((a.heure||'').localeCompare(b.heure||'')));
  const cl=[],cv=[],cvR=[];
  const startCap=acc&&acc.startCapital?parseFloat(acc.startCapital):0;
  let running=startCap,runningR=startCap;
  cl.push('Départ');cv.push(running);cvR.push(runningR);
  closedF.forEach(t=>{
    running+=parseFloat(t.gainPerte);
    cl.push(fmtD(t.date));cv.push(parseFloat(running.toFixed(2)));
    const isUndisciplined=t.horsZone===true||t.structure==='fragile'||(t.stars||t.confiance||5)<3;
    if(!isUndisciplined){runningR+=parseFloat(t.gainPerte);}
    cvR.push(parseFloat(runningR.toFixed(2)));
  });
  const lastVal=cv.length>1?cv[cv.length-1]:startCap;
  const isUp=lastVal>=startCap;
  const _cct=getChartTheme();
  // Subtitle: net P&L + % change
  const sub=document.getElementById('capitalSubtitle');
  if(sub&&cv.length>1){
    const start=cv[0],end=cv[cv.length-1],delta=end-start;
    const pct=start!==0?((delta/Math.abs(start))*100):0;
    const col=delta>=0?'var(--green)':'var(--red)';
    sub.innerHTML=`<span style="color:${col};font-weight:600">${delta>=0?'+':''}$${Math.abs(delta).toFixed(2)}</span><span style="color:var(--text4);margin-left:5px">${pct>=0?'+':''}${pct.toFixed(1)}%</span>`;
  }else if(sub){sub.textContent='';}

  // Plugin: ligne de référence horizontale pointillée au capital de départ
  const capRefPlugin={id:'capRef',afterDraw(chart){
    const{ctx:c,chartArea,scales}=chart;
    const yPx=scales.y.getPixelForValue(startCap);
    if(yPx<chartArea.top||yPx>chartArea.bottom)return;
    c.save();
    c.strokeStyle='rgba(180,180,180,.25)';c.lineWidth=1;c.setLineDash([5,5]);
    c.beginPath();c.moveTo(chartArea.left,yPx);c.lineTo(chartArea.right,yPx);c.stroke();
    c.setLineDash([]);
    // Label "Départ $X" à droite
    if(startCap>0){
      c.font='500 10px "Inter",system-ui';c.fillStyle='rgba(180,180,180,.45)';
      c.textAlign='right';c.textBaseline='bottom';
      c.fillText('$'+startCap.toLocaleString('fr-FR'),chartArea.right-4,yPx-2);
    }
    c.restore();
  }};

  charts['cCapital']=new Chart(ctx,{
    type:'line',
    plugins:[capRefPlugin],
    data:{labels:cl,datasets:[
      {label:'Courbe Réelle',data:cv,
       borderColor:isUp?_cct.win:_cct.loss,borderWidth:2,tension:0.35,
       pointRadius:0,pointHoverRadius:4,
       fill:{target:{value:startCap},above:_cct.winFill,below:_cct.lossFill},
       segment:{borderColor:ctx2=>ctx2.p1.parsed.y<startCap?_cct.loss:_cct.win}},
      {label:'Courbe Rigueur',data:cvR,borderColor:'#2558CE',borderWidth:1.5,borderDash:[5,4],tension:0.35,pointRadius:0,pointHoverRadius:4,fill:false}
    ]},
    options:{
      responsive:true,maintainAspectRatio:false,
      interaction:{intersect:false,mode:'index'},
      plugins:{
        legend:{display:true,position:'top',align:'end',labels:{boxWidth:16,boxHeight:2,font:{size:10},padding:10,usePointStyle:true,pointStyle:'line'}},
        tooltip:{
          backgroundColor:getComputedStyle(document.body).getPropertyValue('--sb-bg').trim()||'#0C0E14',
          titleColor:'#FFFFFF',bodyColor:'rgba(255,255,255,.7)',
          borderColor:getChartTheme().ttBorder,borderWidth:1,cornerRadius:3,padding:8,
          callbacks:{label:v=>`${v.dataset.label}  $${v.parsed.y.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})}`}
        }
      },
      scales:{
        x:{grid:{display:false},border:{display:false},ticks:{font:{size:10},maxTicksLimit:7,padding:4}},
        y:{
          grid:{color:_cct.grid,lineWidth:1},border:{display:false},
          ticks:{font:{size:10},padding:6,maxTicksLimit:5,
            callback:v=>{const a=Math.abs(v);return(v<0?'-':'')+'$'+(a>=1000?(a/1000).toFixed(0)+'k':a.toFixed(0));}}
        }
      }
    }
  });

  // ── Drawdown sous-graphe ──────────────────────────────────────────────────
  dc('cDrawdown');
  const ctxDD=document.getElementById('cDrawdown')?.getContext('2d');
  if(ctxDD&&cv.length>1){
    let ddPk=cv[0];
    const ddData=cv.map(v=>{if(v>ddPk)ddPk=v;return parseFloat((v-ddPk).toFixed(2));});
    const hasDd=ddData.some(v=>v<0);
    charts['cDrawdown']=new Chart(ctxDD,{
      type:'line',
      data:{labels:cl,datasets:[{
        data:ddData,
        borderColor:hasDd?_cct.loss:'rgba(100,200,150,.5)',
        borderWidth:1.5,tension:0.3,pointRadius:0,
        fill:{target:{value:0},below:'rgba(239,83,80,.18)'}
      }]},
      options:{
        responsive:true,maintainAspectRatio:false,
        interaction:{intersect:false,mode:'index'},
        layout:{padding:{top:4,bottom:0}},
        plugins:{
          legend:{display:false},
          tooltip:{
            backgroundColor:getComputedStyle(document.body).getPropertyValue('--sb-bg').trim()||'#0C0E14',
            titleColor:'#FFFFFF',bodyColor:'rgba(255,255,255,.7)',
            borderColor:getChartTheme().ttBorder,borderWidth:1,cornerRadius:3,padding:8,
            callbacks:{
              title:items=>cl[items[0].dataIndex]||'',
              label:v=>{const val=v.parsed.y;return val===0?' DD : —':` DD : -$${Math.abs(val).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})}`;}
            }
          }
        },
        scales:{
          x:{display:false},
          y:{
            max:0,
            grid:{color:_cct.grid,lineWidth:1},border:{display:false},
            ticks:{font:{size:9},padding:5,maxTicksLimit:3,
              callback:v=>v===0?'0':'-$'+(Math.abs(v)>=1000?(Math.abs(v)/1000).toFixed(0)+'k':Math.abs(v).toFixed(0))
            }
          }
        }
      }
    });
  }

  // ── P&L par trade (trade-by-trade)
  dc('cTrades');
  const ctxTr=document.getElementById('cTrades')?.getContext('2d');
  if(ctxTr){
    const ct_tr=getChartTheme();
    const trTrades=[...f].filter(t=>t.resultat!=='En cours'&&t.gainPerte!==''&&t.gainPerte!==undefined&&!isNaN(parseFloat(t.gainPerte))&&t.date)
      .sort((a,b)=>a.date.localeCompare(b.date)||((a.heure||'').localeCompare(b.heure||'')));
    const trData=trTrades.map(t=>parseFloat(t.gainPerte));
    const trBgs=trTrades.map(t=>t.resultat==='Win'?ct_tr.winBg:t.resultat==='Loss'?ct_tr.lossBg:ct_tr.midBg);
    const trLabels=trTrades.map((t,i)=>`#${i+1}`);
    const showLbl=trTrades.length<=35;
    const dlTr={id:'dl_cTrades',afterDatasetsDraw(chart){
      if(!showLbl)return;
      const{ctx:c,data}=chart;
      data.datasets[0].data.forEach((val,i)=>{
        if(!val)return;
        const bar=chart.getDatasetMeta(0).data[i];if(!bar)return;
        const isPos=val>=0,a=Math.abs(val);
        const lbl=a>=1000?`${isPos?'+':'-'}$${(a/1000).toFixed(1)}k`:`${isPos?'+':'-'}$${a.toFixed(0)}`;
        c.save();c.font='400 10px "Inter",system-ui,sans-serif';
        c.fillStyle=isPos?ct_tr.win:ct_tr.loss;
        c.textAlign='center';c.textBaseline=isPos?'bottom':'top';
        c.fillText(lbl,bar.x,isPos?bar.y-3:bar.y+3);c.restore();
      });
    }};
    charts['cTrades']=new Chart(ctxTr,{
      type:'bar',plugins:[dlTr],
      data:{labels:trLabels,datasets:[{data:trData,backgroundColor:trBgs,borderRadius:2,borderSkipped:false,barPercentage:.85,categoryPercentage:.85}]},
      options:{
        responsive:true,maintainAspectRatio:false,
        layout:{padding:{top:showLbl?22:8,bottom:2}},
        onClick:(e,els)=>{if(!els.length)return;const t=trTrades[els[0].index];if(t)openDetail(t.id);},
        plugins:{
          legend:{display:false},
          tooltip:{
            backgroundColor:getComputedStyle(document.body).getPropertyValue('--sb-bg').trim()||'#0C0E14',
            titleColor:'#FFFFFF',bodyColor:'rgba(255,255,255,.7)',
            borderColor:getChartTheme().ttBorder,borderWidth:1,cornerRadius:3,padding:8,
            callbacks:{
              title:items=>{const t=trTrades[items[0].dataIndex];return t?`${fmtD(t.date)}${t.heure?' · '+t.heure:''}`:'' ;},
              label:v=>{const t=trTrades[v.dataIndex];const val=v.parsed.y;return[` ${t?.instrument||''}  ${t?.direction||''}`,` ${val>=0?'+':'-'}$${Math.abs(val).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})}`];}
            }
          }
        },
        scales:{
          x:{grid:{display:false},border:{display:false},ticks:{font:{size:9},padding:3,maxTicksLimit:trTrades.length<=60?trTrades.length:20}},
          y:{grid:{color:ct_tr.grid,lineWidth:1},border:{display:false},
            ticks:{font:{size:10},padding:6,maxTicksLimit:5,callback:v=>{const a=Math.abs(v);return(v<0?'-':'')+'$'+(a>=1000?(a/1000).toFixed(0)+'k':a.toFixed(0));}}}
        }
      }
    });
    const sub=document.getElementById('cTradesSub');
    if(sub){
      const wins=trTrades.filter(t=>t.resultat==='Win').length;
      const losses=trTrades.filter(t=>t.resultat==='Loss').length;
      sub.innerHTML=`<span style="color:var(--green)">${wins}W</span> · <span style="color:var(--red)">${losses}L</span> · ${trTrades.length} trades`;
    }
  }

  // ── Distribution R multiples ──────────────────────────────────────────────
  dc('cRDist');
  const ctxRD=document.getElementById('cRDist')?.getContext('2d');
  if(ctxRD){
    const rBuckets=[
      {l:'< −3R',  min:-Infinity,max:-3},
      {l:'−3 à −2',min:-3,       max:-2},
      {l:'−2 à −1',min:-2,       max:-1},
      {l:'−1 à 0', min:-1,       max:0},
      {l:'0 à 1R', min:0,        max:1},
      {l:'1 à 2R', min:1,        max:2},
      {l:'2 à 3R', min:2,        max:3},
      {l:'> 3R',   min:3,        max:Infinity},
    ];
    const rdTrades=closedF.filter(t=>{const rr=calcRR(t);return rr!==null&&isFinite(rr);});
    const rdCounts=rBuckets.map(b=>rdTrades.filter(t=>{const rr=calcRR(t);return rr>=b.min&&rr<b.max;}).length);
    const _ctrd=getChartTheme();
    const rdBgs=rBuckets.map(b=>b.min>=0?_ctrd.winBg:_ctrd.lossBg);
    const rdMax=Math.max(...rdCounts,1);
    const dlRD={id:'dl_cRDist',afterDatasetsDraw(chart){
      const{ctx:c,data}=chart;
      data.datasets[0].data.forEach((val,i)=>{
        if(!val)return;
        const bar=chart.getDatasetMeta(0).data[i];if(!bar)return;
        const pct=rdTrades.length?Math.round(val/rdTrades.length*100):0;
        c.save();c.font=`600 10px 'Inter',system-ui,sans-serif`;
        c.fillStyle=rBuckets[i].min>=0?_ctrd.win:_ctrd.loss;
        c.textAlign='center';c.textBaseline='bottom';
        c.fillText(`${val} (${pct}%)`,bar.x,bar.y-3);
        c.restore();
      });
    }};
    charts['cRDist']=new Chart(ctxRD,{
      type:'bar',plugins:[dlRD],
      data:{labels:rBuckets.map(b=>b.l),datasets:[{data:rdCounts,backgroundColor:rdBgs,borderRadius:2,borderSkipped:false,barPercentage:.75,categoryPercentage:.85}]},
      options:{
        responsive:true,maintainAspectRatio:false,
        layout:{padding:{top:26,bottom:2}},
        plugins:{
          legend:{display:false},
          tooltip:{
            backgroundColor:getComputedStyle(document.body).getPropertyValue('--sb-bg').trim()||'#0C0E14',
            titleColor:'#FFFFFF',bodyColor:'rgba(255,255,255,.7)',
            borderColor:getChartTheme().ttBorder,borderWidth:1,cornerRadius:3,padding:8,
            callbacks:{
              label:v=>{const n=v.parsed.y;const pct=rdTrades.length?Math.round(n/rdTrades.length*100):0;return` ${n} trade${n>1?'s':''} (${pct}%)`;}
            }
          }
        },
        scales:{
          x:{grid:{display:false},border:{display:false},ticks:{font:{size:10,weight:'500'},padding:3}},
          y:{display:false,beginAtZero:true,max:Math.ceil(rdMax*1.35)}
        }
      }
    });
    const sub=document.getElementById('cRDistSub');
    if(sub){
      const withRR=rdTrades.length,avgRR=withRR?rdTrades.reduce((s,t)=>s+(calcRR(t)||0),0)/withRR:0;
      sub.innerHTML=`${withRR} trades · RR moy. <span style="color:${avgRR>=0?'var(--green)':'var(--red)'}">${avgRR>=0?'+':''}${fmtN(avgRR,2)}R</span>`;
    }
  }
}

// ── MODULE-LEVEL CHART HELPERS ────────────────────────────────────────────
function gainNet(arr){return arr.reduce((s,t)=>s+(parseFloat(t.gainPerte)||0),0);}
function mkGainChart(id,dispLabels,vals,counts,colorFn,filterFn,horizontal){
  const ct=getChartTheme();
  const bgs=vals.map((v,i)=>colorFn?colorFn(v,i):v>=0?ct.winBg:ct.lossBg);
  dc(id);const ctx=document.getElementById(id)?.getContext('2d');if(!ctx)return;
  const dlPlugin={id:'dl_'+id,afterDatasetsDraw(chart){
    const{ctx:c,data}=chart;
    data.datasets[0].data.forEach((val,i)=>{
      if(!val)return;
      const bar=chart.getDatasetMeta(0).data[i];if(!bar)return;
      const isPos=val>=0,a=Math.abs(val);
      const lbl=a>=1000?`${isPos?'+':'-'}$${(a/1000).toFixed(1)}k`:`${isPos?'+':'-'}$${a.toFixed(0)}`;
      c.save();c.font='400 11px "Inter",system-ui,sans-serif';
      c.fillStyle=isPos?ct.win:ct.loss;
      if(horizontal){
        c.textAlign=isPos?'left':'right';c.textBaseline='middle';
        c.fillText(lbl,isPos?bar.x+5:bar.x-5,bar.y);
      } else {
        c.textAlign='center';c.textBaseline=isPos?'bottom':'top';
        c.fillText(lbl,bar.x,isPos?bar.y-4:bar.y+4);
      }
      c.restore();
    });
  }};
  const pAxis=horizontal?'x':'y';const cAxis=horizontal?'y':'x';
  charts[id]=new Chart(ctx,{type:'bar',plugins:[dlPlugin],
    data:{labels:dispLabels,datasets:[{data:vals,backgroundColor:bgs,borderRadius:2,borderSkipped:false}]},
    options:{responsive:true,maintainAspectRatio:false,
      indexAxis:horizontal?'y':'x',
      layout:{padding:horizontal?{right:64,left:8,top:4,bottom:4}:{top:24,bottom:2}},
      onClick:(e,els)=>{if(!els.length||!filterFn)return;filterFn(els[0].index);},
      plugins:{legend:{display:false},tooltip:{
        backgroundColor:getComputedStyle(document.body).getPropertyValue('--sb-bg').trim()||'#0C0E14',
        titleColor:'#FFFFFF',bodyColor:'rgba(255,255,255,.7)',
        borderColor:getChartTheme().ttBorder,borderWidth:1,cornerRadius:3,padding:8,
        callbacks:{
          label:v=>{const val=horizontal?v.parsed.x:v.parsed.y;return` ${val>=0?'+':'-'}$${Math.abs(val).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})}`;},
          afterLabel:ctx2=>{const n=counts[ctx2.dataIndex];return` ${n} trade${n>1?'s':''}`;}
        }
      }},
      scales:{
        [cAxis]:{grid:{display:false},border:{display:false},ticks:{font:{size:10,weight:'500'},maxRotation:0,padding:4}},
        [pAxis]:{grid:{color:ct.grid,lineWidth:1},border:{display:false},beginAtZero:true,
          ticks:{font:{size:10},maxTicksLimit:5,padding:6,
            callback:v=>{if(v===0)return'0';const a=Math.abs(v);return(v>0?'+':'-')+'$'+(a>=1000?(a/1000).toFixed(0)+'k':a.toFixed(0));}
          }
        }
      }
    }
  });
}

// ── REPORT CHARTS ─────────────────────────────────────────────────────────
function renderReportCharts(f){
  // ── Par instrument — barres horizontales
  const im={};f.forEach(t=>{if(!t.instrument)return;if(!im[t.instrument])im[t.instrument]=[];im[t.instrument].push(t);});
  const imKeys=Object.keys(im).sort((a,b)=>gainNet(im[b])-gainNet(im[a]));
  const instrPalette=['#2558CE','#8E6B1E','#2B8A4E','#8A5E12','#1E6A9A','#6B4F8A','#B05020'];
  // Ajuste la hauteur dynamiquement selon le nombre d'instruments
  const instrWrap=document.getElementById('rInstrWrap');
  if(instrWrap)instrWrap.style.height=Math.max(140,imKeys.length*34+28)+'px';
  mkGainChart('rInstr',imKeys,imKeys.map(k=>gainNet(im[k])),imKeys.map(k=>im[k].length),(v,i)=>instrPalette[i%instrPalette.length]+'CC',idx=>openTradeListModal(im[imKeys[idx]],`Instrument — ${imKeys[idx]}`),true);

  // ── WinRate par niveau de confiance (étoiles 1-5)
  dc('rStars');
  const ctxSt=document.getElementById('rStars')?.getContext('2d');
  if(ctxSt){
    const starLevels=[1,2,3,4,5];
    const stClosed=f.filter(t=>t.resultat!=='En cours');
    const stWR=starLevels.map(lvl=>{
      const grp=stClosed.filter(t=>{const sv=t.stars||(t.confiance?Math.max(1,Math.min(5,Math.round(t.confiance/2))):null);return sv===lvl;});
      if(!grp.length)return null;
      return Math.round(grp.filter(t=>t.resultat==='Win').length/grp.length*100);
    });
    const stCounts=starLevels.map(lvl=>stClosed.filter(t=>{const sv=t.stars||(t.confiance?Math.max(1,Math.min(5,Math.round(t.confiance/2))):null);return sv===lvl;}).length);
    const _ct=getChartTheme();
    const stBgs=stWR.map(v=>v===null?_ct.emptyBg:v>=60?_ct.winBg:v>=40?_ct.midBg:_ct.lossBg);
    const dlSt={id:'dl_rStars',afterDatasetsDraw(chart){
      const{ctx:c,data}=chart;
      data.datasets[0].data.forEach((val,i)=>{
        if(val===null)return;
        const bar=chart.getDatasetMeta(0).data[i];if(!bar)return;
        c.save();c.font='600 11px "Inter",system-ui,sans-serif';
        c.fillStyle=stBgs[i].replace(/[\d.]+\)$/,'1)');
        c.textAlign='center';c.textBaseline='bottom';
        c.fillText(val+'%',bar.x,bar.y-4);c.restore();
      });
    }};
    charts['rStars']=new Chart(ctxSt,{type:'bar',plugins:[dlSt],
      data:{labels:starLevels.map(n=>'★'.repeat(n)),datasets:[{data:stWR.map(v=>v??0),backgroundColor:stBgs,borderRadius:2,borderSkipped:false}]},
      options:{responsive:true,maintainAspectRatio:false,
        layout:{padding:{top:22,bottom:2}},
        plugins:{legend:{display:false},tooltip:{
          backgroundColor:getComputedStyle(document.body).getPropertyValue('--sb-bg').trim()||'#0C0E14',
          titleColor:'#FFFFFF',bodyColor:'rgba(255,255,255,.7)',
          borderColor:getChartTheme().ttBorder,borderWidth:1,cornerRadius:3,padding:8,
          callbacks:{
            label:v=>`  WinRate : ${v.parsed.y}%`,
            afterLabel:(_,i)=>`  ${stCounts[_?.dataIndex??0]} trade(s)`
          }
        }},
        scales:{
          x:{grid:{display:false},border:{display:false},ticks:{font:{size:13},padding:4}},
          y:{grid:{color:_ct.grid},border:{display:false},beginAtZero:true,max:100,
            ticks:{font:{size:10},maxTicksLimit:5,padding:6,callback:v=>v+'%'}}
        }
      }
    });
  }

  // ── Distribution W/L/BE
  dc('rDist');
  const ctxDist=document.getElementById('rDist')?.getContext('2d');
  if(ctxDist){
    const s=stats(f);
    const distDL={id:'dl_rDist',afterDatasetsDraw(chart){
      const{ctx:c,data}=chart;
      data.datasets[0].data.forEach((val,i)=>{
        if(!val)return;
        const bar=chart.getDatasetMeta(0).data[i];if(!bar)return;
        c.save();c.font='400 11px "Inter",system-ui,sans-serif';
        c.fillStyle=['#276A44','#8A3530','#8A5E12'][i];
        c.textAlign='center';c.textBaseline='bottom';
        c.fillText(val,bar.x,bar.y-4);c.restore();
      });
    }};
    charts['rDist']=new Chart(ctxDist,{type:'bar',plugins:[distDL],
      data:{labels:['Win','Loss','BE'],datasets:[{data:[s.wins,s.losses,s.be],backgroundColor:['rgba(39,106,68,.85)','rgba(138,53,48,.8)','rgba(138,94,18,.75)'],borderRadius:2,borderSkipped:false}]},
      options:{
        responsive:true,maintainAspectRatio:false,
        layout:{padding:{top:24,bottom:2}},
        onClick:(e,els)=>{if(!els.length)return;const r=['Win','Loss','Breakeven'][els[0].index];openTradeListModal(f.filter(t=>t.resultat===r),`Résultat — ${r}`);},
        plugins:{legend:{display:false},tooltip:{
          backgroundColor:getComputedStyle(document.body).getPropertyValue('--sb-bg').trim()||'#0C0E14',
          titleColor:'#FFFFFF',bodyColor:'rgba(255,255,255,.7)',
          borderColor:getChartTheme().ttBorder,borderWidth:1,cornerRadius:3,padding:8,
          callbacks:{label:v=>`  ${v.parsed.y} trades`}
        }},
        scales:{
          x:{grid:{display:false},border:{display:false},ticks:{font:{size:10},padding:4}},
          y:{grid:{color:'rgba(28,24,16,.06)',lineWidth:1},border:{display:false},beginAtZero:true,
            ticks:{font:{size:10},padding:6,maxTicksLimit:5}}
        }
      }
    });
  }

  // ── Gain Net par Heure (heures tradées uniquement, triées 00→23)
  dc('rHour');
  const ctxH=document.getElementById('rHour')?.getContext('2d');
  if(ctxH){
    const hm={};
    f.forEach(t=>{
      if(!t.heure||t.resultat==='En cours'||t.gainPerte===''||t.gainPerte===undefined||isNaN(parseFloat(t.gainPerte)))return;
      const h=t.heure.slice(0,2);
      if(!hm[h])hm[h]=[];
      hm[h].push(t);
    });
    // Trier chronologiquement
    const hKeys=Object.keys(hm).sort();
    const hVals=hKeys.map(k=>gainNet(hm[k]));
    const hCounts=hKeys.map(k=>hm[k].length);
    const hLabels=hKeys.map(h=>h+'h');
    const _cth=getChartTheme();
    const hBgs=hVals.map(v=>v>=0?_cth.winBg:_cth.lossBg);
    const dlH={id:'dl_rHour',afterDatasetsDraw(chart){
      const{ctx:c,data}=chart;
      data.datasets[0].data.forEach((val,i)=>{
        if(!val)return;
        const bar=chart.getDatasetMeta(0).data[i];if(!bar)return;
        const isPos=val>=0,a=Math.abs(val);
        const lbl=a>=1000?`${isPos?'+':'-'}$${(a/1000).toFixed(1)}k`:`${isPos?'+':'-'}$${a.toFixed(0)}`;
        c.save();c.font='400 10px "Inter",system-ui,sans-serif';
        c.fillStyle=isPos?_cth.win:_cth.loss;
        c.textAlign='center';c.textBaseline=isPos?'bottom':'top';
        c.fillText(lbl,bar.x,isPos?bar.y-4:bar.y+4);c.restore();
      });
    }};
    charts['rHour']=new Chart(ctxH,{type:'bar',plugins:[dlH],
      data:{labels:hLabels,datasets:[{data:hVals,backgroundColor:hBgs,borderRadius:2,borderSkipped:false}]},
      options:{responsive:true,maintainAspectRatio:false,
        layout:{padding:{top:22,bottom:2}},
        onClick:(e,els)=>{if(!els.length)return;const k=hKeys[els[0].index];openTradeListModal(hm[k],`Heure — ${k}h`);},
        plugins:{legend:{display:false},tooltip:{
          backgroundColor:getComputedStyle(document.body).getPropertyValue('--sb-bg').trim()||'#0C0E14',
          titleColor:'#FFFFFF',bodyColor:'rgba(255,255,255,.7)',
          borderColor:_cth.ttBorder,borderWidth:1,cornerRadius:3,padding:8,
          callbacks:{
            label:v=>{const val=v.parsed.y;return` ${val>=0?'+':'-'}$${Math.abs(val).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})}`;},
            afterLabel:ctx2=>{const n=hCounts[ctx2.dataIndex];return` ${n} trade${n>1?'s':''}`;}
          }
        }},
        scales:{
          x:{grid:{display:false},border:{display:false},ticks:{font:{size:11},padding:4}},
          y:{grid:{color:_cth.grid,lineWidth:1},border:{display:false},beginAtZero:true,
            ticks:{font:{size:10},maxTicksLimit:5,padding:6,
              callback:v=>{if(v===0)return'0';const a=Math.abs(v);return(v>0?'+':'-')+'$'+(a>=1000?(a/1000).toFixed(0)+'k':a.toFixed(0));}
            }
          }
        }
      }
    });
  }

  // ── Performance par Jour — table
  const DAYS_FULL=['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
  const dm={0:[],1:[],2:[],3:[],4:[],5:[],6:[]};
  f.forEach(t=>{if(!t.date)return;const d=new Date(t.date).getDay();const idx=d===0?6:d-1;dm[idx].push(t);});
  (function(){
    const el=document.getElementById('rDay');if(!el)return;
    const rows=Object.keys(dm).map(i=>{
      const trades=dm[i];
      const closed=trades.filter(t=>t.resultat!=='En cours');
      const wins=closed.filter(t=>t.resultat==='Win');
      const losses=closed.filter(t=>t.resultat==='Loss');
      const grossWin=wins.reduce((s,t)=>s+(parseFloat(t.gainPerte)||0),0);
      const grossLoss=losses.reduce((s,t)=>s+(parseFloat(t.gainPerte)||0),0);
      const netPnl=grossWin+grossLoss;
      const wr=closed.length?Math.round(wins.length/closed.length*100):0;
      const lr=closed.length?Math.round(losses.length/closed.length*100):0;
      const dayJS=(parseInt(i)+1)%7;
      return{label:DAYS_FULL[i],n:trades.length,closed:closed.length,wins:wins.length,losses:losses.length,grossWin,grossLoss,netPnl,wr,lr,dayJS};
    }).filter(r=>r.n>0);
    if(!rows.length){el.innerHTML='<div style="text-align:center;padding:24px;color:var(--text4);font-size:12px">Aucun trade</div>';return;}
    const tot={label:'Total',n:0,closed:0,wins:0,losses:0,grossWin:0,grossLoss:0,netPnl:0,wr:0,lr:0};
    rows.forEach(r=>{tot.n+=r.n;tot.closed+=r.closed;tot.wins+=r.wins;tot.losses+=r.losses;tot.grossWin+=r.grossWin;tot.grossLoss+=r.grossLoss;tot.netPnl+=r.netPnl;});
    tot.wr=tot.closed?Math.round(tot.wins/tot.closed*100):0;
    tot.lr=tot.closed?Math.round(tot.losses/tot.closed*100):0;
    const thS='padding:5px 10px;font-size:9px;font-weight:700;color:var(--text4);letter-spacing:.6px;text-transform:uppercase;white-space:nowrap;text-align:';
    const mkRow=(r,isTotal)=>{
      const nc=r.netPnl>0?'var(--green)':r.netPnl<0?'var(--red)':'var(--text3)';
      const tdS=`padding:${isTotal?'7px':'5px'} 10px;font-size:11px;border-bottom:${isTotal?'none':'1px solid var(--border2)'};white-space:nowrap;`;
      const bar=r.closed>0?`
        <div style="display:flex;align-items:center;gap:5px">
          <span style="font-size:9px;font-family:'DM Mono',monospace;color:var(--red);min-width:22px;text-align:right">${r.lr}%</span>
          <div style="position:relative;flex:1;height:5px;background:var(--border2);border-radius:3px;overflow:hidden;min-width:50px">
            <div style="position:absolute;left:0;top:0;height:100%;width:${r.lr}%;background:var(--red);border-radius:3px 0 0 3px"></div>
            <div style="position:absolute;right:0;top:0;height:100%;width:${r.wr}%;background:var(--green);border-radius:0 3px 3px 0"></div>
          </div>
          <span style="font-size:9px;font-family:'DM Mono',monospace;color:var(--green);min-width:22px">${r.wr}%</span>
        </div>`:'<span style="color:var(--text4)">—</span>';
      return`<tr class="${isTotal?'day-total-row':'day-data-row'}" style="cursor:${isTotal?'default':'pointer'};${isTotal?'background:var(--surface3);':''}">
        <td style="${tdS}font-weight:${isTotal?700:600};color:var(--text);padding-left:12px">${r.label}</td>
        <td style="${tdS}text-align:right;font-family:'DM Mono',monospace;font-weight:700;color:${nc}">${r.netPnl===0&&!r.closed?'—':(r.netPnl>=0?'+':'')+'$'+fmtN(Math.abs(r.netPnl),2)}</td>
        <td style="${tdS}min-width:120px">${bar}</td>
        <td style="${tdS}text-align:right;font-family:'DM Mono',monospace;color:var(--green)">${r.grossWin>0?'+$'+fmtN(r.grossWin,2):'—'}</td>
        <td style="${tdS}text-align:right;font-family:'DM Mono',monospace;color:${r.grossLoss<0?'var(--red)':'var(--text4)'}">${r.grossLoss<0?'-$'+fmtN(Math.abs(r.grossLoss),2):'—'}</td>
        <td style="${tdS}text-align:center;color:var(--text3);padding-right:12px">${r.n}</td>
      </tr>`;
    };
    el.innerHTML=`<table style="width:100%;border-collapse:collapse">
      <thead style="background:var(--surface3);border-bottom:1px solid var(--border)"><tr>
        <th style="${thS}left;padding-left:12px">Jour</th>
        <th style="${thS}right">P&L net</th>
        <th style="${thS}center">Winning %</th>
        <th style="${thS}right">Gains bruts</th>
        <th style="${thS}right">Pertes brutes</th>
        <th style="${thS}center;padding-right:12px">Trades</th>
      </tr></thead>
      <tbody>
        ${rows.map(r=>mkRow(r,false)).join('')}
        ${rows.length>1?mkRow(tot,true):''}
      </tbody>
    </table>`;
    el.querySelectorAll('tr.day-data-row').forEach((tr,i)=>{
      if(rows[i]){
        tr.onclick=()=>openTradeListModal(f.filter(t=>{if(!t.date)return false;return new Date(t.date).getDay()===rows[i].dayJS;}),`Jour — ${rows[i].label}`);
        tr.onmouseover=()=>{tr.style.background='var(--surface2)';};
        tr.onmouseout=()=>{tr.style.background='';};
      }
    });
  })();
}

// ── DASHBOARD BOTTOM ──────────────────────────────────────────────────────
function renderDashBottom(f,s){
  // ── Extra mini-metrics row: Profit Factor, Avg Win, Avg Loss, Expectancy
  const closed=f.filter(t=>t.resultat!=='En cours');
  const wins=closed.filter(t=>t.resultat==='Win');
  const losses=closed.filter(t=>t.resultat==='Loss');
  const totalWinAmt=wins.reduce((s,t)=>s+(parseFloat(t.gainPerte)||0),0);
  const totalLossAmt=Math.abs(losses.reduce((s,t)=>s+(parseFloat(t.gainPerte)||0),0));
  const avgWin=wins.length?totalWinAmt/wins.length:0;
  const avgLoss=losses.length?totalLossAmt/losses.length:0;
  const pf=totalLossAmt>0?(totalWinAmt/totalLossAmt):0;
  const wr=closed.length?(wins.length/closed.length):0;
  const expectancy=closed.length?(wr*avgWin-(1-wr)*avgLoss):0;

  // Consistency : % jours tradés qui sont positifs
  const dayMap={};closed.forEach(t=>{if(!t.date)return;if(!dayMap[t.date])dayMap[t.date]=0;dayMap[t.date]+=(parseFloat(t.gainPerte)||0);});
  const tradedDays=Object.keys(dayMap);
  const posDays=tradedDays.filter(d=>dayMap[d]>0).length;
  const consistency=tradedDays.length?Math.round(posDays/tradedDays.length*100):0;

  const mRow=document.getElementById('reportMetricsRow');
  if(!mRow)return;
  mRow.style.gridTemplateColumns='repeat(5,minmax(0,1fr))';
  const mDefs=[
    {l:'Profit Factor',v:pf>0?fmtN(pf,2):'—',c:pf>=1.5?'green':pf>=1?'gold':'red',hint:'Gains bruts / Pertes brutes'},
    {l:'Gain moyen',v:avgWin>0?`+$${fmtN(avgWin,2)}`:'—',c:'green',hint:'/ trade gagnant'},
    {l:'Perte moyenne',v:avgLoss>0?`-$${fmtN(avgLoss,2)}`:'—',c:'red',hint:'/ trade perdant'},
    {l:'Espérance',v:expectancy!==0?`${expectancy>=0?'+':''}$${fmtN(expectancy,2)}`:'—',c:expectancy>=0?'green':'red',hint:'Par trade en moyenne'},
    {l:'Consistance',v:tradedDays.length?`${consistency}%`:'—',c:consistency>=60?'green':consistency>=40?'gold':'red',hint:`${posDays} j+ / ${tradedDays.length} j tradés`},
  ];
  mRow.innerHTML=mDefs.map(m=>`
    <div class="stat-card ${m.c}" style="padding:13px 15px">
      <div class="stat-label">${m.l}</div>
      <div class="stat-value ${m.c}" style="font-size:19px;margin-top:4px">${m.v}</div>
      <div class="stat-delta" style="margin-top:3px">${m.hint}</div>
    </div>`).join('');

  // ── Streak card
  const sc=document.getElementById('reportStreakCard');
  if(sc){
    let cur=0,best=0,curType='',tmp=0,tmpType='';
    const sorted=[...closed].sort((a,b)=>a.date.localeCompare(b.date)||(a.heure||'').localeCompare(b.heure||''));
    sorted.forEach(t=>{
      const res=t.resultat;
      if(res==='Win'){
        if(tmpType==='Win'){tmp++;}else{tmp=1;tmpType='Win';}
        if(tmp>best)best=tmp;
      } else if(res==='Loss'){
        if(tmpType==='Loss'){tmp++;}else{tmp=1;tmpType='Loss';}
      }
    });
    // Current streak from end
    let cStreak=0,cType='';
    for(let i=sorted.length-1;i>=0;i--){
      const r=sorted[i].resultat;
      if(i===sorted.length-1){cType=r;cStreak=1;}
      else if(r===cType){cStreak++;}
      else break;
    }
    const streakCol=cType==='Win'?'var(--green)':cType==='Loss'?'var(--red)':'var(--amber)';
    const last20=sorted.slice(-20);
    const dotsHtml=last20.length?`<div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:10px">${last20.map(t=>{
      const col=t.resultat==='Win'?'var(--green)':t.resultat==='Loss'?'var(--red)':'var(--amber)';
      const lbl=`${t.resultat} — ${t.instrument||'?'} ${fmtD(t.date)}`;
      return `<div title="${lbl}" onclick="openDetail('${t.id}')" style="width:13px;height:13px;border-radius:2px;background:${col};cursor:pointer;flex-shrink:0;opacity:.85;transition:opacity .1s" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity='.85'"></div>`;
    }).join('')}</div>`:'';
    sc.innerHTML=`
      <div class="chart-title">Streaks <span class="chart-hint">20 derniers</span></div>
      ${dotsHtml}
      <div style="display:flex;flex-direction:column;gap:8px">
        <div style="background:var(--surface3);border-radius:9px;padding:12px;text-align:center">
          <div style="font-size:9.5px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px">Série actuelle</div>
          <div style="font-size:28px;font-weight:600;font-family:'DM Mono',monospace;color:${streakCol};line-height:1">${cStreak||'—'}</div>
          <div style="font-size:11px;color:${streakCol};margin-top:3px;font-weight:500">${cType||''}</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div style="background:var(--green-bg);border:1px solid var(--green-bd);border-radius:8px;padding:9px;text-align:center">
            <div style="font-size:9px;font-weight:600;color:var(--green);text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px">Best Win</div>
            <div style="font-size:20px;font-weight:600;font-family:'DM Mono',monospace;color:var(--green)">${best||0}</div>
          </div>
          <div style="background:var(--surface3);border-radius:8px;padding:9px;text-align:center">
            <div style="font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px">Fermés</div>
            <div style="font-size:20px;font-weight:600;font-family:'DM Mono',monospace;color:var(--text)">${closed.length}</div>
          </div>
        </div>
      </div>`;
  }

  // ── Best/Worst trade card
  const pc=document.getElementById('reportPerfCard');
  if(pc){
    const byRR=[...closed].filter(t=>calcRR(t)!==null).sort((a,b)=>(calcRR(b)||0)-(calcRR(a)||0));
    const best5=byRR.slice(0,3);
    const worst5=byRR.slice(-3).reverse();
    const trRow=(t,col)=>{
      const rr=calcRR(t);const ac=DB.accounts.find(a=>a.name===t.compte);
      return `<div style="display:flex;align-items:center;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--border2)">
        <div style="display:flex;align-items:center;gap:6px;min-width:0">
          ${ac?`<span style="width:6px;height:6px;border-radius:50%;background:${ac.color};flex-shrink:0;display:inline-block"></span>`:''}
          <span style="font-weight:600;font-family:'DM Mono',monospace;font-size:11.5px;color:var(--text2)">${esc(t.instrument||'—')}</span>
          <span style="font-size:10px;color:var(--text4)">${fmtD(t.date)}</span>
        </div>
        <span style="font-family:'DM Mono',monospace;font-size:11.5px;font-weight:600;color:${col};flex-shrink:0">${rr>=0?'+':''}${fmtN(rr,2)}R</span>
      </div>`;
    };
    pc.innerHTML=`
      <div class="chart-title">Meilleurs & Pires</div>
      <div style="margin-bottom:10px">
        <div style="font-size:9.5px;font-weight:700;color:var(--green);text-transform:uppercase;letter-spacing:.6px;margin-bottom:5px">▲ Top 3 (RR)</div>
        ${best5.length?best5.map(t=>trRow(t,'var(--green)')).join(''):'<div style="font-size:11px;color:var(--text4);padding:4px 0">Aucun trade</div>'}
      </div>
      <div>
        <div style="font-size:9.5px;font-weight:700;color:var(--red);text-transform:uppercase;letter-spacing:.6px;margin-bottom:5px">▼ Flop 3 (RR)</div>
        ${worst5.length?worst5.map(t=>trRow(t,'var(--red)')).join(''):'<div style="font-size:11px;color:var(--text4);padding:4px 0">Aucun trade</div>'}
      </div>`;
  }

  // ── Instrument Leaderboard (avec tendance vs période précédente)
  const tic=document.getElementById('reportTopInstrCard');
  if(tic){
    // Stats période courante
    const im={};
    f.forEach(t=>{
      if(!t.instrument)return;
      if(!im[t.instrument])im[t.instrument]={wins:0,losses:0,be:0,pnl:0,rrs:[],n:0};
      const m=im[t.instrument];m.n++;
      if(t.resultat==='Win')m.wins++;
      else if(t.resultat==='Loss')m.losses++;
      else if(t.resultat==='Breakeven')m.be++;
      m.pnl+=parseFloat(t.gainPerte)||0;
      const rr=calcRR(t);if(rr!==null&&isFinite(rr))m.rrs.push(rr);
    });

    // Période précédente équivalente pour les tendances
    const prevIm={};
    const range=getDashRange();
    if(dashPeriod!=='all'&&range.from&&range.to){
      const msFrom=new Date(range.from).getTime();
      const msTo=new Date(range.to).getTime();
      const dur=msTo-msFrom;
      const pTo=new Date(msFrom-86400000); // veille du début courant
      const pFrom=new Date(pTo.getTime()-dur);
      const pfStr=pFrom.toISOString().split('T')[0];
      const ptStr=pTo.toISOString().split('T')[0];
      DB.trades.filter(t=>t.date>=pfStr&&t.date<=ptStr&&(dashFilters.has('all')||dashFilters.has(t.compte)))
        .forEach(t=>{
          if(!t.instrument)return;
          if(!prevIm[t.instrument])prevIm[t.instrument]={pnl:0,wins:0,n:0};
          prevIm[t.instrument].pnl+=parseFloat(t.gainPerte)||0;
          prevIm[t.instrument].n++;
          if(t.resultat==='Win')prevIm[t.instrument].wins++;
        });
    }
    const hasPrev=Object.keys(prevIm).length>0;

    // Construction des lignes triées par P&L
    const rows=Object.entries(im).map(([k,v])=>{
      const closed=v.wins+v.losses+v.be;
      const wr=closed?Math.round(v.wins/closed*100):0;
      const avgRR=v.rrs.length?v.rrs.reduce((s,r)=>s+r,0)/v.rrs.length:null;
      const prev=prevIm[k];
      const prevPnl=prev?.pnl??null;
      const threshold=Math.max(5,Math.abs(v.pnl)*0.08); // seuil 8% ou 5$
      const trend=prevPnl===null?null:v.pnl>prevPnl+threshold?'up':v.pnl<prevPnl-threshold?'down':'flat';
      return{k,closed,wr,avgRR,trend,prevPnl,...v};
    }).sort((a,b)=>b.pnl-a.pnl);

    const barMax=rows.length?Math.max(...rows.map(r=>Math.abs(r.pnl)),1):1;
    const medals=['🥇','🥈','🥉'];
    const trendIcon=t=>t==='up'
      ?`<span style="color:var(--green);font-weight:700;font-size:12px">↑</span>`
      :t==='down'
      ?`<span style="color:var(--red);font-weight:700;font-size:12px">↓</span>`
      :t==='flat'?`<span style="color:var(--text4);font-size:11px">→</span>`:'';

    const best=rows[0];
    const bestCol=best&&best.pnl>=0?'var(--green)':'var(--red)';
    const bestBg=best&&best.pnl>=0?'var(--green-bg)':'var(--red-bg)';
    const bestBd=best&&best.pnl>=0?'var(--green-bd)':'var(--red-bd)';

    const thS='padding:5px 8px;font-size:9px;font-weight:700;color:var(--text4);letter-spacing:.6px;text-transform:uppercase;text-align:';
    const tdS='padding:6px 8px;font-size:11.5px;border-bottom:1px solid var(--border2);';

    tic.innerHTML=`
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div class="chart-title" style="margin-bottom:0">Classement Instruments</div>
        ${hasPrev?`<span style="font-size:9px;font-weight:600;color:var(--text4);letter-spacing:.3px;text-transform:uppercase">vs période préc.</span>`:''}
      </div>
      ${best?`
      <div style="background:${bestBg};border:1px solid ${bestBd};border-left:3px solid ${bestCol};border-radius:var(--r);padding:9px 12px;margin-bottom:10px;display:flex;align-items:center;gap:10px;cursor:pointer" onclick="openTradeListModal([],'')">
        <div style="font-size:20px;line-height:1;flex-shrink:0">🥇</div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap">
            <span style="font-family:'DM Mono',monospace;font-weight:700;font-size:14px;color:var(--text)">${esc(best.k)}</span>
            <span style="font-size:10.5px;color:var(--text3)">${best.wr}% WR · ${best.n} trades${best.avgRR!==null?' · '+(best.avgRR>0?'+':'')+fmtN(best.avgRR,2)+'R':''}</span>
          </div>
          <div style="font-family:'DM Mono',monospace;font-size:16px;font-weight:700;color:${bestCol};margin-top:1px;line-height:1.2">${best.pnl>=0?'+':''}$${fmtN(Math.abs(best.pnl),2)}</div>
        </div>
        ${hasPrev?`<div style="flex-shrink:0">${trendIcon(best.trend)}</div>`:''}
      </div>`:''}
      ${rows.length===0?`<div style="text-align:center;padding:24px;color:var(--text4);font-size:12px">Aucun trade sur cette période</div>`:`
      <div style="overflow-x:auto;-webkit-overflow-scrolling:touch">
      <table style="width:100%;border-collapse:collapse">
        <thead style="background:var(--surface3)"><tr>
          <th style="${thS}left;padding-left:10px">Pair</th>
          <th style="${thS}center">Trades</th>
          <th style="${thS}center">WR</th>
          <th style="${thS}right">Moy RR</th>
          <th style="${thS}right">P&L net</th>
          ${hasPrev?`<th style="${thS}center">↕</th>`:''}
        </tr></thead>
        <tbody>
          ${rows.map((r,i)=>{
            const barW=Math.round(Math.abs(r.pnl)/barMax*52);
            const col=r.pnl>=0?'var(--green)':'var(--red)';
            const wrCol=r.wr>=60?'var(--green)':r.wr>=40?'var(--text2)':'var(--red)';
            const rrCol=r.avgRR===null?'var(--text4)':r.avgRR>0?'var(--accent)':'var(--red)';
            return`<tr class="instr-lb-row" style="cursor:pointer;transition:background .08s" onmouseover="this.style.background='var(--surface2)'" onmouseout="this.style.background=''">
              <td style="${tdS}padding-left:10px">
                <div style="display:flex;align-items:center;gap:6px">
                  <span style="font-size:12px;flex-shrink:0">${medals[i]||`<span style='font-family:DM Mono,monospace;font-size:10px;color:var(--text4)'>#${i+1}</span>`}</span>
                  <span style="font-family:'DM Mono',monospace;font-weight:700;font-size:12px;color:var(--text)">${esc(r.k)}</span>
                </div>
              </td>
              <td style="${tdS}text-align:center;color:var(--text3)">${r.n}</td>
              <td style="${tdS}text-align:center;font-weight:600;color:${wrCol}">${r.wr}%</td>
              <td style="${tdS}text-align:right;font-family:'DM Mono',monospace;color:${rrCol}">${r.avgRR!==null?(r.avgRR>0?'+':'')+fmtN(r.avgRR,2)+'R':'—'}</td>
              <td style="${tdS}text-align:right">
                <div style="display:flex;align-items:center;justify-content:flex-end;gap:6px">
                  <div style="width:52px;height:2px;background:var(--border2);border-radius:2px;overflow:hidden;flex-shrink:0">
                    <div style="width:${barW}px;height:100%;background:${col}"></div>
                  </div>
                  <span style="font-family:'DM Mono',monospace;font-size:11.5px;font-weight:600;color:${col};min-width:58px;text-align:right">${r.pnl>=0?'+':''}$${fmtN(Math.abs(r.pnl),2)}</span>
                </div>
              </td>
              ${hasPrev?`<td style="${tdS}text-align:center;width:28px">${trendIcon(r.trend)}</td>`:''}
            </tr>`;
          }).join('')}
        </tbody>
      </table></div>`}`;

    // Patch onclick → ouvre modal filtré par instrument
    tic.querySelectorAll('tr.instr-lb-row').forEach((tr,i)=>{
      if(rows[i])tr.onclick=()=>openTradeListModal(f.filter(t=>t.instrument===rows[i].k),`Instrument — ${rows[i].k}`);
    });
    // Best banner click
    const bestBanner=tic.querySelector('[onclick="openTradeListModal([],\'\')"]');
    if(bestBanner&&best)bestBanner.onclick=()=>openTradeListModal(f.filter(t=>t.instrument===best.k),`Instrument — ${best.k}`);
  }
}

// ── REPORT PAGE ───────────────────────────────────────────────────────────
function renderReportPills(){
  const el=document.getElementById('reportPills');if(!el)return;
  const allSel=dashFilters.has('all');
  let h=`<span style="font-size:10px;font-weight:600;color:var(--text3);letter-spacing:.5px;text-transform:uppercase;margin-right:4px">Compte :</span>`;
  h+=`<button class="acc-pill ${allSel?'active':''}" style="${allSel?'background:var(--text);border-color:var(--text)':''}" onclick="toggleDF('all')">Tous</button>`;
  DB.accounts.forEach(a=>{const ok=!allSel&&dashFilters.has(a.name);h+=`<button class="acc-pill ${ok?'active':''}" style="${ok?`background:${a.color};border-color:${a.color}`:''}" onclick="toggleDF('${esc(a.name)}')"><span style="width:7px;height:7px;border-radius:50%;background:${a.color};display:inline-block"></span>${esc(a.name)}</button>`;});
  el.innerHTML=h;
}
function renderReportFilter(){
  const el=document.getElementById('reportFilterBar');if(!el)return;
  const periods=[
    {v:'today',l:"Auj."},
    {v:'week',l:'Semaine'},
    {v:'month',l:'Mois'},
    {v:'3months',l:'3 mois'},
    {v:'year',l:'Année'},
    {v:'all',l:'Tout'},
    {v:'custom',l:'···'},
  ];
  const pills=periods.map(p=>`<button class="dash-period-pill${dashPeriod===p.v?' active':''}" onclick="setDashPeriod('${p.v}')">${p.l}</button>`).join('');
  let extra='';
  if(dashPeriod==='week'||dashPeriod==='month'||dashPeriod==='year'){
    const lbl=getDashNavLabel();
    const off=dashPeriod==='week'?dashWeekOffset:dashPeriod==='month'?dashMonthOffset:dashYearOffset;
    extra=`<div class="dash-nav-row"><button class="dash-nav-btn" onclick="navigateDash(-1)" title="Période précédente">&#8592;</button><span class="dash-nav-label">${lbl}</span><button class="dash-nav-btn" onclick="navigateDash(1)"${off>=0?' disabled':''} title="Période suivante">&#8594;</button></div>`;
  } else if(dashPeriod==='custom'){
    extra=`<div class="dash-nav-row"><span style="font-size:11px;color:var(--text4)">du</span><input type="date" class="dash-date-input" value="${dashCustomFrom}" onchange="setDashCustomDate('from',this.value)"/><span style="font-size:11px;color:var(--text4)">au</span><input type="date" class="dash-date-input" value="${dashCustomTo}" onchange="setDashCustomDate('to',this.value)"/></div>`;
  }
  el.innerHTML=`<div><div class="dash-period-pills">${pills}</div>${extra}</div>`;
}
function renderReport(){
  const el=document.getElementById('page-report');if(!el)return;
  let f=dashFilters.has('all')?DB.trades:DB.trades.filter(t=>dashFilters.has(t.compte));
  const _dr=getDashRange();if(_dr.from)f=f.filter(t=>t.date>=_dr.from);if(_dr.to)f=f.filter(t=>t.date<=_dr.to);
  const s=stats(f);
  renderReportPills();
  renderReportFilter();
  renderReportCharts(f);
  renderDashBottom(f,s);
}

function openTradeListModal(trades,title){
  if(!trades||!trades.length){toast('Aucun trade dans cette catégorie','info');return;}
  const s=stats(trades);
  document.getElementById('detailHead').innerHTML=`<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><span class="modal-title">${esc(title)}</span><span style="font-size:12px;color:var(--text3)">${trades.length} trade${trades.length>1?'s':''}</span></div>`;
  let h=`<div class="detail-grid" style="margin-bottom:14px">
    <div class="dc"><div class="dcl">Win rate</div><div class="dcv" style="color:${s.winRate>=50?'var(--green)':'var(--red)'}">${s.winRate}%</div></div>
    <div class="dc"><div class="dcl">RR moyen</div><div class="dcv" style="color:var(--accent)">${s.avgRR>=0?'+':''}${fmtN(s.avgRR,2)}R</div></div>
    <div class="dc"><div class="dcl">P&L</div><div class="dcv" style="color:${s.pnl>=0?'var(--green)':'var(--red)'};font-family:'DM Mono',monospace">${s.pnl>=0?'+':''}${s.pnl.toFixed(2)}$</div></div>
  </div>`;
  trades.slice(0,30).forEach(t=>{
    const bdg=t.resultat?`<span class="badge badge-${t.resultat==='Win'?'win':t.resultat==='Loss'?'loss':t.resultat==='En cours'?'encours':'be'}">${t.resultat}</span>`:'';
    const ac=DB.accounts.find(a=>a.name===t.compte);
    const rr=calcRR(t);
    h+=`<div style="display:flex;align-items:center;gap:9px;padding:8px 0;border-bottom:1px solid var(--border2);cursor:pointer" onclick="closeModal('detailModal');openDetail('${t.id}')">
      <div style="flex:1;display:flex;align-items:center;gap:7px">
        ${ac?`<span style="width:7px;height:7px;border-radius:50%;background:${ac.color};flex-shrink:0;display:inline-block"></span>`:''}
        <span style="font-weight:600;font-family:'DM Mono',monospace;font-size:12px">${esc(t.instrument||'—')}</span>
        <span style="color:var(--text3);font-size:11px">${fmtD(t.date)}</span>
      </div>${bdg}
      <span style="font-family:'DM Mono',monospace;font-size:12px;font-weight:400;color:${rr!==null&&rr>0?'var(--green)':rr!==null&&rr<0?'var(--red)':'var(--text3)'}">${rr!==null?(rr>0?'+':'')+fmtN(rr,2)+'R':'—'}</span>
    </div>`;
  });
  if(trades.length>30)h+=`<div style="text-align:center;padding:10px;font-size:12px;color:var(--text3)">… et ${trades.length-30} trades de plus</div>`;
  h+=`<div style="display:flex;justify-content:flex-end;margin-top:14px"><button class="btn btn-secondary" onclick="closeModal('detailModal')">Fermer</button></div>`;
  document.getElementById('detailBody').innerHTML=h;
  document.getElementById('detailModal').classList.add('open');
}

// ── JOURNAL ───────────────────────────────────────────────────────────────
function getWeekRange(){
  const now=new Date();
  const day=now.getDay();
  const diffToMon=day===0?-6:1-day;
  const mon=new Date(now);mon.setDate(now.getDate()+diffToMon);
  const sun=new Date(mon);sun.setDate(mon.getDate()+6);
  const fmt=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  return{from:fmt(mon),to:fmt(sun)};
}
function getPeriodRange(p){
  const fmt=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const now=new Date();
  if(p==='today')return{from:fmt(now),to:fmt(now)};
  if(p==='week')return getWeekRange();
  if(p==='month'){return{from:`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`,to:fmt(now)};}
  if(p==='lastmonth'){const f=new Date(now.getFullYear(),now.getMonth()-1,1),t=new Date(now.getFullYear(),now.getMonth(),0);return{from:fmt(f),to:fmt(t)};}
  if(p==='3months'){const f=new Date(now);f.setMonth(f.getMonth()-3);return{from:fmt(f),to:fmt(now)};}
  if(p==='year')return{from:`${now.getFullYear()}-01-01`,to:fmt(now)};
  return{from:'',to:''};// 'all'
}
function setJPeriod(v){
  jFilters.period=v;
  if(v!=='custom'){const r=getPeriodRange(v);jFilters.dateFrom=r.from;jFilters.dateTo=r.to;}
  renderJournal();
}

function renderJournal(){
  if(!jFilters.dateFrom&&!jFilters.dateTo&&jFilters.period!=='custom'){
    const r=getPeriodRange(jFilters.period||'week');
    jFilters.dateFrom=r.from;jFilters.dateTo=r.to;
  }
  renderJAccPills();renderJFilters();renderJSummary();renderJTable();
}
function renderJAccPills(){
  const allSel=jAccFilters.has('all');
  let h=`<span style="font-size:10px;font-weight:600;color:var(--text3);letter-spacing:.5px;text-transform:uppercase;margin-right:4px">Compte :</span>`;
  h+=`<button class="acc-pill ${allSel?'active':''}" style="${allSel?'background:var(--text);border-color:var(--text)':''}" onclick="toggleJAF('all')">Tous</button>`;
  DB.accounts.forEach(a=>{const ok=!allSel&&jAccFilters.has(a.name);h+=`<button class="acc-pill ${ok?'active':''}" style="${ok?`background:${a.color};border-color:${a.color}`:''}" onclick="toggleJAF('${esc(a.name)}')"><span style="width:7px;height:7px;border-radius:50%;background:${a.color};display:inline-block"></span>${esc(a.name)}</button>`;});
  const el=document.getElementById('jAccPills');if(el)el.innerHTML=h;
}
function toggleJAF(name){
  if(name==='all'){jAccFilters=new Set(['all']);}
  else{jAccFilters.delete('all');if(jAccFilters.has(name))jAccFilters.delete(name);else jAccFilters.add(name);if(jAccFilters.size===0)jAccFilters=new Set(['all']);}
  renderJournal();
}
function renderJFilters(){
  const so=SESSIONS.map(s=>`<option value="${s}" ${jFilters.session===s?'selected':''}>${s}</option>`).join('');
  const io=DB.instruments.map(i=>`<option value="${i}" ${jFilters.instrument===i?'selected':''}>${i}</option>`).join('');
  const ro=RESULTATS.map(r=>`<option value="${r}" ${jFilters.resultat===r?'selected':''}>${r}</option>`).join('');
  const periods=[
    {v:'today',l:"Aujourd'hui"},
    {v:'week',l:'Cette semaine'},
    {v:'month',l:'Mois en cours'},
    {v:'lastmonth',l:'Mois dernier'},
    {v:'3months',l:'3 derniers mois'},
    {v:'year',l:'Cette année'},
    {v:'all',l:'Tout afficher'},
    {v:'custom',l:'Personnalisé'},
  ];
  const po=periods.map(p=>`<option value="${p.v}" ${jFilters.period===p.v?'selected':''}>${p.l}</option>`).join('');
  const isCustom=jFilters.period==='custom';
  document.getElementById('jFilters').innerHTML=`
    <select onchange="setJPeriod(this.value)" style="font-weight:500;color:var(--accent);border-color:var(--accent-bd);background:var(--accent-bg)">${po}</select>
    <select onchange="setJF('session',this.value)"><option value="">Toutes sessions</option>${so}</select>
    <select onchange="setJF('instrument',this.value)"><option value="">Tous instruments</option>${io}</select>
    <select onchange="setJF('resultat',this.value)"><option value="">Tous résultats</option>${ro}</select>
    ${isCustom?`<input type="date" value="${jFilters.dateFrom}" onchange="setJF('dateFrom',this.value)" title="Date début"/>
    <input type="date" value="${jFilters.dateTo}" onchange="setJF('dateTo',this.value)" title="Date fin"/>`:''}
    <select onchange="setJF('rNonProfitable',this.value)" style="${jFilters.rNonProfitable?'color:var(--blue);border-color:var(--blue-bd);background:var(--blue-bg)':''}">
      <option value="">Toutes confiances</option>
      <option value="rnp" ${jFilters.rNonProfitable==='rnp'?'selected':''}>R non profitable (≤3★)</option>
      <option value="profitable" ${jFilters.rNonProfitable==='profitable'?'selected':''}>Profitable (>3★)</option>
    </select>
    <select onchange="setJF('horsSession',this.value)" style="${jFilters.horsSession?'color:var(--blue);border-color:var(--blue-bd);background:var(--blue-bg)':''}">
      <option value="">Toutes sessions</option>
      <option value="hors" ${jFilters.horsSession==='hors'?'selected':''}>Hors session</option>
      <option value="en" ${jFilters.horsSession==='en'?'selected':''}>En session</option>
    </select>
    <button class="btn btn-ghost btn-sm" onclick="resetJF()">✕ Reset</button>
    <div style="margin-left:auto;display:flex;gap:7px;align-items:center">
      <div class="j-view-toggle">
        <button class="j-view-btn ${jViewMode==='table'?'active':''}" onclick="toggleJView('table')" title="Vue liste">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><rect y="1" width="16" height="2.5" rx="1.2"/><rect y="6.5" width="16" height="2.5" rx="1.2"/><rect y="12" width="16" height="2.5" rx="1.2"/></svg>
        </button>
        <button class="j-view-btn ${jViewMode==='cards'?'active':''}" onclick="toggleJView('cards')" title="Vue cartes">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1.2"/><rect x="9" y="1" width="6" height="6" rx="1.2"/><rect x="1" y="9" width="6" height="6" rx="1.2"/><rect x="9" y="9" width="6" height="6" rx="1.2"/></svg>
        </button>
      </div>
      <button class="btn btn-secondary btn-sm" onclick="exportCSV()">↓ CSV</button>
    </div>`;
}
function setJF(k,v){if(k==='dateFrom'||k==='dateTo')jFilters.period='custom';jFilters[k]=v;renderJournal();}
function resetJF(){
  const r=getPeriodRange('week');
  jFilters={session:'',instrument:'',resultat:'',dateFrom:r.from,dateTo:r.to,period:'week',rNonProfitable:'',horsSession:''};
  renderJournal();
}
function isRNonProfitable(t){const sv=t.stars||(t.confiance?Math.max(1,Math.min(5,Math.round(t.confiance/2))):null);return sv!==null&&sv<=3;}
function isHorsSession(heure){
  if(!heure)return false;
  const[h,m]=heure.split(':').map(Number);
  const mins=h*60+m;
  const inLondres=mins>=10*60&&mins<13*60;
  const inNY=mins>=16*60+30&&mins<19*60;
  return!(inLondres||inNY);
}
function getFT(){return DB.trades.filter(t=>{if(!jAccFilters.has('all')&&!jAccFilters.has(t.compte))return false;const f=jFilters;if(f.session&&t.session!==f.session)return false;if(f.instrument&&t.instrument!==f.instrument)return false;if(f.resultat&&t.resultat!==f.resultat)return false;if(f.dateFrom&&t.date<f.dateFrom)return false;if(f.dateTo&&t.date>f.dateTo)return false;if(f.rNonProfitable==='rnp'&&!isRNonProfitable(t))return false;if(f.rNonProfitable==='profitable'&&isRNonProfitable(t))return false;if(f.horsSession==='hors'&&!isHorsSession(t.heure))return false;if(f.horsSession==='en'&&isHorsSession(t.heure))return false;return true;}).sort((a,b)=>b.date.localeCompare(a.date)||(b.heure||'').localeCompare(a.heure||''));}

function renderJSummary(){
  const trades=getFT();
  const el=document.getElementById('jSummary');if(!el)return;
  if(!trades.length){el.innerHTML='';return;}
  const closed=trades.filter(t=>t.resultat!=='En cours');
  const open=trades.filter(t=>t.resultat==='En cours').length;
  const wins=closed.filter(t=>t.resultat==='Win').length;
  const losses=closed.filter(t=>t.resultat==='Loss').length;
  const be=closed.filter(t=>t.resultat==='Breakeven').length;
  const wr=closed.length?Math.round(wins/closed.length*100):0;
  const pnl=closed.reduce((s,t)=>s+calcPnl(t),0);
  const rrArr=closed.map(t=>calcRR(t)).filter(r=>r!==null&&isFinite(r));
  const avgRR=rrArr.length?rrArr.reduce((s,r)=>s+r,0)/rrArr.length:null;
  const grossWins=closed.filter(t=>t.resultat==='Win').reduce((s,t)=>s+(parseFloat(t.gainPerte)||0),0);
  const grossLosses=Math.abs(closed.filter(t=>t.resultat==='Loss').reduce((s,t)=>s+(parseFloat(t.gainPerte)||0),0));
  const pf=grossLosses>0?grossWins/grossLosses:grossWins>0?Infinity:0;
  const pfStr=pf===Infinity?'∞':pf>0?fmtN(pf,2):'—';
  const pfCol=pf>=1.5?'var(--green)':pf>=1?'var(--accent)':pf>0?'var(--red)':'var(--text4)';
  const pnlCol=pnl>0?'var(--green)':pnl<0?'var(--red)':'var(--text)';
  const rrCol=avgRR===null?'var(--text)':avgRR>0?'var(--green)':avgRR<0?'var(--red)':'var(--text3)';
  el.innerHTML=`<div class="j-summary">
    <div class="j-sum-item">
      <div class="j-sum-lbl">Trades</div>
      <div class="j-sum-val">${trades.length}</div>
      <div class="j-sum-sub">${open>0?`${open} en cours · `:''}${closed.length} fermé${closed.length>1?'s':''}</div>
    </div>
    <div class="j-sum-item">
      <div class="j-sum-lbl">P&L Net</div>
      <div class="j-sum-val" style="color:${pnlCol}">${pnl>=0?'+':''}$${Math.abs(pnl).toFixed(2)}</div>
      <div class="j-sum-sub">gains − pertes</div>
    </div>
    <div class="j-sum-item">
      <div class="j-sum-lbl">Win Rate</div>
      <div class="j-sum-val" style="color:${wr>=60?'var(--green)':wr>=40?'var(--text)':'var(--red)'}">${wr}%</div>
      <div class="j-sum-sub">${wins}W · ${losses}L${be?' · '+be+'BE':''}</div>
    </div>
    <div class="j-sum-item">
      <div class="j-sum-lbl">RR Moyen</div>
      <div class="j-sum-val" style="color:${rrCol}">${avgRR!==null?(avgRR>0?'+':'')+fmtN(avgRR,2)+'R':'—'}</div>
      <div class="j-sum-sub">${rrArr.length} trade${rrArr.length>1?'s':''} avec RR</div>
    </div>
    <div class="j-sum-item">
      <div class="j-sum-lbl">Profit Factor</div>
      <div class="j-sum-val" style="color:${pfCol}">${pfStr}</div>
      <div class="j-sum-sub">+$${fmtN(grossWins,2)} · -$${fmtN(grossLosses,2)}</div>
    </div>
  </div>`;
}
function toggleJView(mode){jViewMode=mode;renderJFilters();renderJTable();}
function renderJTable(){
  if(jViewMode==='cards'){renderJCards();return;}
  const trades=getFT();
  if(!trades.length){document.getElementById('jTable').innerHTML='<div class="empty"><h3>Aucun trade trouvé</h3><p>Ajustez les filtres ou ajoutez un trade</p></div>';return;}
  let h=`<div class="jl-wrap">
  <div class="jl-head jl-cols">
    <div class="jl-hcell jl-hide-xs"></div>
    <div class="jl-hcell">Instrument</div>
    <div class="jl-hcell jl-hide-md">Date / Heure</div>
    <div class="jl-hcell jl-hide-sm">Compte</div>
    <div class="jl-hcell jl-hide-sm">Session</div>
    <div class="jl-hcell jl-hide-xs">RR</div>
    <div class="jl-hcell">Gain / Perte</div>
    <div class="jl-hcell"></div>
  </div>`;
  trades.forEach(t=>{
    const ac=DB.accounts.find(a=>a.name===t.compte);
    const rr=calcRR(t);
    const cls=t.resultat==='Win'?'row-win':t.resultat==='Loss'?'row-loss':t.resultat==='Breakeven'?'row-be':t.resultat==='En cours'?'row-encours':'';
    const bdg=t.resultat?`<span class="badge badge-${t.resultat==='Win'?'win':t.resultat==='Loss'?'loss':t.resultat==='En cours'?'encours':'be'}" style="font-size:10px;padding:1px 7px">${t.resultat}</span>`:'';
    const sv=t.stars||(t.confiance?Math.max(1,Math.min(5,Math.round(t.confiance/2))):null);
    const isUndisciplined=t.horsZone===true||t.structure==='fragile'||(sv!==null&&sv<3);
    const auditReasons=isUndisciplined&&t.resultat!=='En cours'?getAuditReasons(t):[];
    const auditTipLines=auditReasons.map(r=>`• ${r}`).join('\n');
    const disciplineBdg=auditReasons.length?`<span class="_audit-badge" style="display:inline-flex;align-items:center;gap:3px;padding:1px 6px;border-radius:3px;font-size:9px;font-weight:700;background:var(--amber-bg);border:1px solid var(--amber-bd);color:var(--amber);white-space:nowrap;cursor:help" data-audit="${esc(auditTipLines)}" onmouseenter="showAuditTip(this,this.dataset.audit)" onmouseleave="hideAuditTip()">⚠ INDISCIPLINE</span>`:'';
    const rnpBdg=isRNonProfitable(t)?`<span style="display:inline-flex;align-items:center;gap:3px;padding:1px 6px;border-radius:3px;font-size:9px;font-weight:700;background:var(--blue-bg);border:1px solid var(--blue-bd);color:var(--blue);white-space:nowrap" title="Confiance ≤ 3 étoiles — setup R non profitable">R NON PROFITABLE</span>`:'';
    const horsSessBdg=isHorsSession(t.heure)?`<span style="display:inline-flex;align-items:center;gap:3px;padding:1px 6px;border-radius:3px;font-size:9px;font-weight:700;background:var(--red-bg);border:1px solid var(--red-bd);color:var(--red);white-space:nowrap" title="Trade pris hors session de Londres (10-13h) ou New York (16:30-19h) GMT+4">HORS SESSION</span>`:'';
    const gp=parseFloat(t.gainPerte)||0;
    const gpStr=t.gainPerte!==undefined&&t.gainPerte!==''
      ?(gp>=0?`<span style="color:var(--green);font-family:'DM Mono',monospace;font-size:12px">+$${Math.abs(gp).toFixed(2)}</span>`
        :`<span style="color:var(--red);font-family:'DM Mono',monospace;font-size:12px">-$${Math.abs(gp).toFixed(2)}</span>`)
      :`<span style="color:var(--text4)">—</span>`;
    const rrColor=rr===null?'var(--text4)':rr>0?'var(--green)':rr<0?'var(--red)':'var(--text3)';
    const rrStr=rr!==null?`<span style="font-family:'DM Mono',monospace;font-size:12px;color:${rrColor}">${(rr>0?'+':'')+fmtN(rr,2)}R</span>`:`<span style="color:var(--text4)">—</span>`;
    const scrUrl=(t.screenshotHTF||t.screenshotMTF||t.screenshotLTF||t.screenshotAvant||t.screenshot||'').trim();
    const hasImg=scrUrl&&(scrUrl.startsWith('http')||scrUrl.startsWith('//')||scrUrl.startsWith('data:'));
    const safeUrl=scrUrl.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    const safeLabel=esc(t.instrument||'Trade')+' — '+fmtD(t.date);
    const thumbHtml=hasImg
      ?`<div class="j-thumb" onclick="event.stopPropagation();openImgPreview('${safeUrl}','${safeLabel}')"><img src="${scrUrl}" alt="" onerror="this.parentElement.className='j-thumb-empty';this.parentElement.innerHTML='<svg width=14 height=14 viewBox=\\'0 0 24 24\\' fill=none stroke=currentColor stroke-width=1.5><rect x=3 y=3 width=18 height=18 rx=2/><circle cx=8.5 cy=8.5 r=1.5/><polyline points=\\'21 15 16 10 5 21\\'/></svg>'"/></div>`
      :`<div class="j-thumb-empty"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`;
    h+=`<div class="jl-row jl-cols ${cls}" onclick="openAlbumView('${t.id}')">
      <div class="jl-thumb-cell jl-hide-xs">${thumbHtml}</div>
      <div class="jl-cell jl-instr">
        ${ac?`<span style="width:7px;height:7px;border-radius:50%;background:${ac.color};flex-shrink:0;display:inline-block"></span>`:''}
        <span style="font-weight:600;font-family:'DM Mono',monospace;font-size:12.5px;flex-shrink:0">${esc(t.instrument||'—')}</span>
        ${bdg}${disciplineBdg}${rnpBdg}${horsSessBdg}
      </div>
      <div class="jl-cell jl-hide-md"><span style="font-family:'DM Mono',monospace;font-size:11px;color:var(--text3)">${fmtD(t.date)}${t.heure?' <span style="opacity:.6">'+t.heure+'</span>':''}</span></div>
      <div class="jl-cell jl-hide-sm" style="font-size:11.5px;color:var(--text3)">${esc(t.compte||'—')}</div>
      <div class="jl-cell jl-hide-sm" style="font-size:11.5px;color:var(--text3)">${esc(t.session||'—')}</div>
      <div class="jl-cell jl-hide-xs">${rrStr}</div>
      <div class="jl-cell">${gpStr}</div>
      <div class="jl-actions" onclick="event.stopPropagation()">
        <button class="btn-ghost btn-sm" onclick="openEdit('${t.id}')" title="Modifier" style="padding:4px 6px">✎</button>
        <button class="btn-ghost btn-sm" style="color:var(--red);padding:4px 6px" onclick="delTrade('${t.id}')" title="Supprimer">🗑</button>
      </div>
    </div>`;
  });
  h+='</div>';
  document.getElementById('jTable').innerHTML=h;
}

function renderJCards(){
  const trades=getFT();
  const el=document.getElementById('jTable');
  if(!trades.length){el.innerHTML='<div class="empty"><h3>Aucun trade trouvé</h3><p>Ajustez les filtres ou ajoutez un trade</p></div>';return;}
  let h='<div class="j-cards-grid">';
  trades.forEach(t=>{
    const ac=DB.accounts.find(a=>a.name===t.compte);
    const rr=calcRR(t);
    const gp=parseFloat(t.gainPerte)||0;
    const sv=t.stars||(t.confiance?Math.max(1,Math.min(5,Math.round(t.confiance/2))):null);
    const isUndisciplined=t.horsZone===true||t.structure==='fragile'||(sv!==null&&sv<3);
    // Screenshot priority: LTF > MTF > HTF > avant
    const scrLTF=(t.screenshotLTF||'').trim();
    const scrMTF=(t.screenshotMTF||t.screenshotApres||'').trim();
    const scrHTF=(t.screenshotHTF||t.screenshotAvant||t.screenshot||'').trim();
    const scrUrl=scrLTF||scrMTF||scrHTF;
    const scrLabel=scrLTF?'LTF':scrMTF?'MTF':scrHTF?'HTF':'';
    const hasImg=scrUrl&&(scrUrl.startsWith('http')||scrUrl.startsWith('//')||scrUrl.startsWith('data:'));
    const safeUrl=scrUrl.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    const resClass=t.resultat==='Win'?'jc-win':t.resultat==='Loss'?'jc-loss':t.resultat==='Breakeven'?'jc-be':t.resultat==='En cours'?'jc-encours':'';
    const resColor=t.resultat==='Win'?'var(--green)':t.resultat==='Loss'?'var(--red)':t.resultat==='Breakeven'?'var(--amber)':'var(--blue)';
    const gpColor=gp>0?'var(--green)':gp<0?'var(--red)':'var(--text3)';
    const gpStr=t.gainPerte!==undefined&&t.gainPerte!==''?(gp>=0?`+$${Math.abs(gp).toFixed(2)}`:`-$${Math.abs(gp).toFixed(2)}`):'—';
    const dirIcon=t.direction==='Long'?'↑':t.direction==='Short'?'↓':'';
    const dirColor=t.direction==='Long'?'var(--green)':t.direction==='Short'?'var(--red)':'';
    const starsHtml=sv?[1,2,3,4,5].map(n=>`<span style="color:${n<=sv?'var(--amber)':'var(--border2)'};font-size:11px;line-height:1">★</span>`).join(''):'';
    const rrStr=rr!==null?`<span style="font-size:11px;color:${rr>0?'var(--green)':rr<0?'var(--red)':'var(--text3)'};font-family:'DM Mono',monospace;font-weight:600">${(rr>0?'+':'')+fmtN(rr,2)}R</span>`:'';
    const auditReasons=isUndisciplined&&t.resultat!=='En cours'?getAuditReasons(t):[];
    const disciplineBdg=auditReasons.length?`<span class="_audit-badge" style="font-size:9px;padding:1px 5px;border-radius:3px;font-weight:700;background:var(--amber-bg);border:1px solid var(--amber-bd);color:var(--amber);cursor:help;white-space:nowrap" data-audit="${esc(auditReasons.map(r=>'• '+r).join('\n'))}" onmouseenter="showAuditTip(this,this.dataset.audit)" onmouseleave="hideAuditTip()">⚠ INDISCIPLINE</span>`:'';
    const rnpBdg=isRNonProfitable(t)?`<span style="font-size:9px;padding:1px 5px;border-radius:3px;font-weight:700;background:var(--blue-bg);border:1px solid var(--blue-bd);color:var(--blue);white-space:nowrap">R NON PROFIT.</span>`:'';
    const resTagStyle=`background:${resColor}14;border:1px solid ${resColor}30;color:${resColor}`;
    h+=`<div class="j-card ${resClass}" onclick="openAlbumView('${t.id}')">
      <div class="j-card-thumb">
        ${hasImg
          ?`<img src="${scrUrl}" alt="" loading="lazy" onerror="this.parentElement.classList.add('j-card-thumb-err');this.remove()"/>`
          :`<div class="j-card-no-img"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2.5"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><span>Pas de capture</span></div>`
        }
        <div class="j-card-thumb-overlay"></div>
        ${scrLabel?`<div class="j-card-scr-label">${scrLabel}</div>`:''}
      </div>
      <div class="j-card-body">
        <div class="j-card-top">
          <div class="j-card-instr">
            ${ac?`<span class="j-card-acc-dot" style="background:${ac.color}"></span>`:''}
            <span class="j-card-instr-name">${esc(t.instrument||'—')}</span>
            ${dirIcon?`<span class="j-card-dir" style="color:${dirColor}">${dirIcon}</span>`:''}
          </div>
          ${starsHtml?`<div class="j-card-stars">${starsHtml}</div>`:''}
        </div>
        <div class="j-card-pnl" style="color:${gpColor}">${gpStr}</div>
        <div class="j-card-meta">
          <span>${fmtD(t.date)}${t.heure?` · ${t.heure}`:''}</span>
          ${t.session?`<span class="j-card-dot">·</span><span>${esc(t.session)}</span>`:''}
        </div>
        ${(disciplineBdg||rnpBdg)?`<div class="j-card-badges">${disciplineBdg}${rnpBdg}</div>`:''}
        <div class="j-card-footer" onclick="event.stopPropagation()">
          <div style="display:flex;align-items:center;gap:6px">
            ${t.resultat?`<span class="j-card-result-tag" style="${resTagStyle}">${t.resultat}</span>`:''}
            ${rrStr}
          </div>
          <div class="j-card-actions">
            <button class="btn-ghost btn-sm" onclick="openEdit('${t.id}')" title="Modifier" style="padding:4px 9px">✎</button>
            <button class="btn-ghost btn-sm" style="color:var(--red);padding:4px 9px" onclick="delTrade('${t.id}')" title="Supprimer">🗑</button>
          </div>
        </div>
      </div>
    </div>`;
  });
  h+='</div>';
  el.innerHTML=h;
}

// ── TRADE MODAL ───────────────────────────────────────────────────────────
function openNew(){
  editId=null;ss=null;tConf=3;tScrHTF='';tScrMTF='';tScrLTF='';tDir='';
  document.getElementById('tmTitle').textContent='Nouveau trade';
  buildForm({id:Date.now().toString(),compte:'',date:new Date().toISOString().split('T')[0],heure:new Date().toTimeString().slice(0,5),session:'',instrument:'',direction:'',structure:null,montantRisque:'',gainPerte:'',resultat:'',etat:'',stars:3,horsZone:false,pourquoiEntrer:'',douteHesitation:'',screenshotHTF:'',screenshotMTF:'',screenshotLTF:''});
  document.getElementById('tradeModal').classList.add('open');
}
function openEdit(id){
  const t=DB.trades.find(t=>t.id===id);if(!t)return;
  editId=id;
  // backward compat: structureSolide bool → structure string
  ss=t.structure||(t.structureSolide===true?'solide':t.structureSolide===false?'fragile':null);
  // backward compat: confiance 1-10 → stars 1-5
  tConf=t.stars||(t.confiance?Math.max(1,Math.min(5,Math.round(t.confiance/2))):3);
  tScrHTF=t.screenshotHTF||t.screenshotAvant||t.screenshot||'';tScrMTF=t.screenshotMTF||t.screenshotApres||'';tScrLTF=t.screenshotLTF||'';tDir=t.direction||'';
  document.getElementById('tmTitle').textContent='Modifier le trade';
  buildForm(t);
  document.getElementById('tradeModal').classList.add('open');
}
function scrBlock(idPrefix,label,url){
  const hasImg=url&&(url.startsWith('http')||url.startsWith('//')||url.startsWith('data:'));
  return `<div style="flex:1;min-width:0">
    <div style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px">${label}</div>
    ${hasImg?`<div style="position:relative;border:1px solid var(--border);border-radius:8px;overflow:hidden;background:var(--surface3)">
      <img src="${url}" style="width:100%;height:110px;object-fit:cover;cursor:pointer;display:block" onclick="openImgPreview('${url.replace(/'/g,"\\'")}','${label}')" onerror="this.parentElement.innerHTML='<div style=\\'padding:12px;font-size:11px;color:var(--red)\\'>Image inaccessible</div>'"/>
      <div style="position:absolute;top:6px;right:6px;display:flex;gap:3px">
        <button class="btn btn-secondary btn-sm" style="padding:3px 7px;font-size:11px" onclick="openImgPreview('${url.replace(/'/g,"\\'")}','${label}')">🔍</button>
        <button class="btn btn-secondary btn-sm" style="padding:3px 7px;font-size:11px;color:var(--red)" onclick="clearScrField('${idPrefix}')">✕</button>
      </div>
    </div>`:`<div style="display:flex;flex-direction:column;gap:6px">
      <input id="${idPrefix}_url" type="url" placeholder="https://www.tradingview.com/…" style="width:100%;padding:7px 11px;border:1.5px solid var(--border);border-radius:7px;font-size:12px;font-family:inherit;outline:none;color:var(--text);background:var(--surface)" oninput="previewScrUrl('${idPrefix}')"/>
      <div id="${idPrefix}_prev" style="display:none"></div>
    </div>`}
  </div>`;
}
function buildForm(t){
  tScrHTF=t.screenshotHTF||t.screenshotAvant||t.screenshot||'';tScrMTF=t.screenshotMTF||t.screenshotApres||'';tScrLTF=t.screenshotLTF||'';
  tConf=t.stars||(t.confiance?Math.max(1,Math.min(5,Math.round(t.confiance/2))):3);
  ss=t.structure||(t.structureSolide===true?'solide':t.structureSolide===false?'fragile':null);
  tDir=t.direction||'';
  const ao=DB.accounts.map(a=>`<option value="${esc(a.name)}" ${t.compte===a.name?'selected':''}>${esc(a.name)}</option>`).join('');
  const currentRR=calcRR(t);
  const rrDisplay=currentRR!==null?(currentRR>0?'+':'')+fmtN(currentRR,2)+'R':'— R';
  const rrColor=currentRR===null?'var(--text3)':currentRR>0?'var(--green)':currentRR<0?'var(--red)':'var(--text3)';
  const hzNow=calcHorsZone(t.heure||new Date().toTimeString().slice(0,5));
  const hzBadge=hzNow?`<div class="hz-alert">⚠ HORS ZONE</div>`:'';

  document.getElementById('tmBody').innerHTML=`
    <div class="sdiv"><span>Informations générales</span></div>
    <div class="form-grid-3">
      <div class="field"><label>Compte</label><select id="f_c"><option value="">Sélectionner</option>${ao}</select></div>
      <div class="field"><label>Date</label><input type="date" id="f_d" value="${t.date}"/></div>
      <div class="field"><label>Heure</label>
        <input type="time" id="f_h" value="${t.heure||''}" oninput="updateSessionDisplay();updateHorsZoneDisplay()"/>
        <div id="f_session_display" style="margin-top:4px;font-size:11px;color:var(--text4);font-family:'DM Mono',monospace;letter-spacing:.3px">${t.heure?'Session : '+calcSession(t.heure):''}</div>
        <div id="f_hz_badge">${hzBadge}</div>
      </div>
      <div class="field"><label>Instrument</label><select id="f_i" onchange="handleInstrSelect(this)"><option value="">Sélectionner</option>${FORM_INSTRUMENTS.map(i=>`<option value="${i}" ${t.instrument===i?'selected':''}>${WARN_INSTRUMENTS.includes(i)?'⚠️ ':''}${i}</option>`).join('')}<option value="Autre" ${!FORM_INSTRUMENTS.includes(t.instrument)&&t.instrument?'selected':''}>Autre</option></select><input id="f_i_custom" type="text" placeholder="Ex: NZDCAD" style="display:${!FORM_INSTRUMENTS.includes(t.instrument)&&t.instrument?'block':'none'};margin-top:6px;text-transform:uppercase" value="${!FORM_INSTRUMENTS.includes(t.instrument)&&t.instrument?esc(t.instrument):''}" oninput="this.value=this.value.toUpperCase();document.getElementById('f_i_err')&&(document.getElementById('f_i_err').style.display='none')"/><div id="f_i_warn" style="display:${WARN_INSTRUMENTS.includes(t.instrument)?'flex':'none'};align-items:center;gap:6px;margin-top:6px;padding:7px 10px;background:rgba(192,57,43,.08);border:1px solid rgba(192,57,43,.25);border-radius:5px;font-size:11.5px;color:var(--red)">⚠️ Edge non prouvé sur cette paire</div><div id="f_i_err" style="display:none;margin-top:5px;font-size:11.5px;color:var(--red);font-weight:500">Instrument requis</div></div>
      <div class="field"><label>État</label><select id="f_e"><option value="">Sélectionner</option>${ETATS.map(e=>`<option ${t.etat===e?'selected':''}>${e}</option>`).join('')}</select></div>
    </div>
    <div class="sdiv"><span>Analyse & Setup</span></div>
    <div class="form-grid">
      <div class="field"><label>Direction</label>
        <div class="toggle-group" style="margin-top:5px">
          <button type="button" class="toggle-btn ${tDir==='Long'?'along':''}" id="dirL" onclick="togDir('Long')">↑ Long</button>
          <button type="button" class="toggle-btn ${tDir==='Short'?'ashort':''}" id="dirS" onclick="togDir('Short')">↓ Short</button>
        </div>
      </div>
      <div class="field"><label>Confiance — <span id="cVal">${tConf}</span>/5</label>
        <div class="star-rating" id="confStars">${[1,2,3,4,5].map(n=>`<span data-v="${n}" class="${tConf>=n?'lit':''}" onclick="setConfStars(${n})" onmouseover="previewConfStars(${n})" onmouseout="resetConfStars()">★</span>`).join('')}</div>
      </div>
    </div>
    <div class="field" style="margin-top:12px"><label>Structure du trade</label>
      <div class="struct-seg">
        <button type="button" class="struct-btn ${ss==='solide'?'active-solide':''}" id="struS" onclick="setStructure('solide')">✓ SOLIDE (Alignée)</button>
        <button type="button" class="struct-btn ${ss==='fragile'?'active-fragile':''}" id="struF" onclick="setStructure('fragile')">⚠ FRAGILE (Contre-tendance)</button>
      </div>
    </div>
    <div class="field" style="margin-top:12px"><label>Pourquoi entrer ?</label><textarea id="f_p" placeholder="Décris ta raison d'entrer...">${esc(t.pourquoiEntrer||'')}</textarea></div>
    <div class="field" style="margin-top:10px"><label>Doute ou hésitation</label><textarea id="f_dh" placeholder="Qu'est-ce qui t'a fait hésiter ?">${esc(t.douteHesitation||'')}</textarea></div>
    <div class="sdiv"><span>Gestion & Résultat</span></div>
    <div class="form-grid-3">
      <div class="field"><label>Montant risqué ($)</label><input type="number" id="f_m" value="${t.montantRisque||''}" placeholder="0.00" oninput="updateRRDisplay()"/></div>
      <div class="field"><label>Gain / Perte ($)</label><input type="number" id="f_gp" value="${t.gainPerte!==undefined&&t.gainPerte!==''?t.gainPerte:''}" placeholder="ex: 150 ou -50" step="0.01" oninput="updateRRDisplay()"/></div>
      <div class="field"><label>Résultat</label><select id="f_r"><option value="">Sélectionner</option>${RESULTATS.map(r=>`<option ${t.resultat===r?'selected':''}>${r}</option>`).join('')}</select></div>
    </div>
    <div style="margin-top:10px">
      <div style="font-size:10px;font-weight:600;color:var(--text3);letter-spacing:.5px;text-transform:uppercase;margin-bottom:6px">RR calculé automatiquement</div>
      <div class="rr-display" id="rrDisplay">
        <div>
          <div class="rr-display-val" id="rrAutoVal" style="color:${rrColor}">${rrDisplay}</div>
          <div class="rr-display-lbl">= Gain/Perte ÷ |Montant risqué| (signé)</div>
        </div>
      </div>
    </div>
    <div class="sdiv"><span>Captures d'écran (liens TradingView)</span></div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px" id="scrSec">
      ${scrBlock('scr_htf','HTF — Vue macro',tScrHTF)}
      ${scrBlock('scr_mtf','MTF — Vue intermédiaire',tScrMTF)}
      ${scrBlock('scr_ltf','LTF — Entrée précise',tScrLTF)}
    </div>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:22px;padding-top:16px;border-top:1px solid var(--border2)">
      <button class="btn btn-secondary" onclick="closeModal('tradeModal')">Annuler</button>
      <button class="btn btn-primary" onclick="saveTrade()">Enregistrer</button>
    </div>`;
  // Apply modal hz border
  updateHorsZoneDisplay();
}

function updateRRDisplay(){
  const gp=parseFloat(document.getElementById('f_gp')?.value);
  const mr=parseFloat(document.getElementById('f_m')?.value);
  const rrEl=document.getElementById('rrAutoVal');
  if(!rrEl)return;
  if(isNaN(mr)||mr===0||isNaN(gp)){rrEl.textContent='— R';rrEl.style.color='var(--text3)';return;}
  const rr=gp/Math.abs(mr);
  rrEl.textContent=(rr>0?'+':'')+fmtN(rr,2)+'R';
  rrEl.style.color=rr>0?'var(--green)':rr<0?'var(--red)':'var(--text3)';
}
function handleInstrSelect(sel){
  const ci=document.getElementById('f_i_custom');
  const warn=document.getElementById('f_i_warn');
  const err=document.getElementById('f_i_err');
  if(sel.value==='Autre'){ci.style.display='block';ci.focus();}else{ci.style.display='none';}
  if(warn)warn.style.display=WARN_INSTRUMENTS.includes(sel.value)?'flex':'none';
  if(err)err.style.display='none';
}
function getInstrValue(){const sel=document.getElementById('f_i');const ci=document.getElementById('f_i_custom');if(sel&&sel.value==='Autre')return(ci&&ci.value.trim().toUpperCase())||'';return sel?sel.value:'';}
function setStructure(v){
  ss=(ss===v)?null:v;
  const s=document.getElementById('struS'),f=document.getElementById('struF');
  if(s)s.className='struct-btn'+(ss==='solide'?' active-solide':'');
  if(f)f.className='struct-btn'+(ss==='fragile'?' active-fragile':'');
}
function setConfStars(n){tConf=n;document.getElementById('cVal').textContent=n;document.querySelectorAll('#confStars span').forEach(s=>s.className=parseInt(s.dataset.v)<=n?'lit':'');}
function previewConfStars(n){document.querySelectorAll('#confStars span').forEach(s=>s.style.color=parseInt(s.dataset.v)<=n?'#F59E0B':'');}
function resetConfStars(){document.querySelectorAll('#confStars span').forEach(s=>s.style.color='');}
function calcHorsZone(heure){
  if(!heure)return false;
  const [h,m]=heure.split(':').map(Number);
  const mins=h*60+m;
  // Killzones GMT+4 : Londres 11h00–14h00, New York 16h30–19h30
  const inLondres=mins>=11*60&&mins<14*60;
  const inNY=mins>=16*60+30&&mins<19*60+30;
  return!(inLondres||inNY);
}
// Retourne la liste des raisons d'indiscipline pour un trade (texte tooltip)
function getAuditReasons(t){
  const sv=t.stars||(t.confiance?Math.max(1,Math.min(5,Math.round(t.confiance/2))):null);
  const reasons=[];
  if(t.horsZone===true)reasons.push(`Hors Session (saisie à ${t.heure||'?'})`);
  if(t.structure==='fragile')reasons.push('Structure Fragile (contre-tendance)');
  if(sv!==null&&sv<3)reasons.push(`Confiance Faible (${sv}★ < 3★)`);
  if(!t.pourquoiEntrer||!t.pourquoiEntrer.trim())reasons.push('Aucune raison documentée (impulsif)');
  return reasons;
}
// Tooltip flottant — accepte une string multi-lignes ou un tableau
function showAuditTip(el,content){
  const tip=document.getElementById('audit-tip');if(!tip)return;
  tip.textContent=Array.isArray(content)?content.join('\n'):content;
  tip.classList.add('show');
  _posAuditTip(el);
}
function _posAuditTip(el){
  const tip=document.getElementById('audit-tip');if(!tip)return;
  const r=el.getBoundingClientRect();
  let top=r.bottom+6,left=r.left;
  if(left+tip.offsetWidth>window.innerWidth-10)left=window.innerWidth-tip.offsetWidth-10;
  if(top+tip.offsetHeight>window.innerHeight-10)top=r.top-tip.offsetHeight-6;
  tip.style.top=top+'px';tip.style.left=Math.max(8,left)+'px';
}
function hideAuditTip(){const tip=document.getElementById('audit-tip');if(tip)tip.classList.remove('show');}
function updateHorsZoneDisplay(){
  const heure=document.getElementById('f_h')?.value||'';
  const hz=calcHorsZone(heure);
  const badge=document.getElementById('f_hz_badge');
  if(badge)badge.innerHTML=hz?`<div class="hz-alert">⚠ HORS ZONE — Trade hors killzone</div>`:'';
  const modal=document.querySelector('#tradeModal .modal');
  if(modal)modal.className='modal'+(hz?' modal-hz':'');
}
function togDir(v){tDir=(tDir===v)?'':v;const l=document.getElementById('dirL'),s=document.getElementById('dirS');if(l)l.className='toggle-btn'+(tDir==='Long'?' along':'');if(s)s.className='toggle-btn'+(tDir==='Short'?' ashort':'');}
function previewScrUrl(pfx){const url=document.getElementById(pfx+'_url').value.trim();const prev=document.getElementById(pfx+'_prev');if(!url){prev.style.display='none';return;}prev.style.display='block';prev.innerHTML=`<img src="${url}" style="width:100%;height:90px;object-fit:cover;border-radius:7px;border:1px solid var(--border);cursor:pointer" onclick="openImgPreview('${url.replace(/'/g,"\\'")}','Aperçu')" onerror="this.style.display='none'"/>`;}
function clearScrField(pfx){
  if(pfx==='scr_htf')tScrHTF='';else if(pfx==='scr_mtf')tScrMTF='';else if(pfx==='scr_ltf')tScrLTF='';
  document.getElementById('scrSec').innerHTML=
    scrBlock('scr_htf','HTF — Vue macro',tScrHTF)+
    scrBlock('scr_mtf','MTF — Vue intermédiaire',tScrMTF)+
    scrBlock('scr_ltf','LTF — Entrée précise',tScrLTF);
}
function openImgPreview(url,label){document.getElementById('imgModalSrc').src=url;document.getElementById('imgModalLabel').textContent=label;document.getElementById('imgModal').classList.add('open');}

async function saveTrade(){
  const htfEl=document.getElementById('scr_htf_url'),mtfEl=document.getElementById('scr_mtf_url'),ltfEl=document.getElementById('scr_ltf_url');
  if(htfEl&&htfEl.value.trim())tScrHTF=htfEl.value.trim();
  if(mtfEl&&mtfEl.value.trim())tScrMTF=mtfEl.value.trim();
  if(ltfEl&&ltfEl.value.trim())tScrLTF=ltfEl.value.trim();
  const montantRisque=document.getElementById('f_m').value;
  const gainPerte=document.getElementById('f_gp').value;
  const gpVal=parseFloat(gainPerte);
  const mrVal=parseFloat(montantRisque);
  const rr=(!isNaN(gpVal)&&!isNaN(mrVal)&&mrVal!==0)?gpVal/Math.abs(mrVal):null;
  const existing=editId?DB.trades.find(x=>x.id===editId):null;
  const t={
    ...(existing||{}),
    id:editId||Date.now().toString(),
    compte:document.getElementById('f_c').value,
    date:document.getElementById('f_d').value,
    heure:document.getElementById('f_h').value,
    session:calcSession(document.getElementById('f_h').value),
    instrument:getInstrValue(),
    direction:tDir,
    structure:ss,
    horsZone:calcHorsZone(document.getElementById('f_h').value),
    stars:tConf,
    montantRisque,gainPerte,
    rr:rr!==null?String(rr.toFixed(4)):'',
    resultat:document.getElementById('f_r').value,
    etat:document.getElementById('f_e').value,
    pourquoiEntrer:document.getElementById('f_p').value,
    douteHesitation:document.getElementById('f_dh').value,
    screenshotHTF:tScrHTF,screenshotMTF:tScrMTF,screenshotLTF:tScrLTF,
    tags:existing?existing.tags||[]:[]
  };
  // Avertissement instrument manquant (inline + toast, non-bloquant)
  const instrErrEl=document.getElementById('f_i_err');
  const instrMissing=!t.instrument;
  if(instrErrEl)instrErrEl.style.display=instrMissing?'block':'none';

  if(editId){const i=DB.trades.findIndex(x=>x.id===editId);if(i>=0)DB.trades[i]=t;}else DB.trades.unshift(t);
  saveDB();closeModal('tradeModal');
  if(instrMissing)toast('⚠️ Instrument non renseigné','warning');
  else toast('Enregistrement…','info');
  await sbUpsertTrade(t);
  toast('Trade sauvegardé ✓','success');
  if(curPage==='journal')renderJournal();if(curPage==='dashboard')renderDash();if(curPage==='calendar')renderCal();
}

async function delTrade(id){
  if(!confirm('Supprimer ce trade ?'))return;
  DB.trades=DB.trades.filter(t=>t.id!==id);saveDB();
  toast('Suppression…','info');await sbDeleteTrade(id);toast('Trade supprimé','info');
  if(curPage==='journal')renderJournal();if(curPage==='dashboard')renderDash();if(curPage==='calendar')renderCal();
}

// ── DETAIL MODAL ──────────────────────────────────────────────────────────
function openDetail(id){
  const t=DB.trades.find(t=>t.id===id);if(!t)return;
  const bdg=t.resultat?`<span class="badge badge-${t.resultat==='Win'?'win':t.resultat==='Loss'?'loss':t.resultat==='En cours'?'encours':'be'}">${t.resultat}</span>`:'';
  document.getElementById('detailHead').innerHTML=`<div style="display:flex;align-items:center;gap:10px"><span class="modal-title">${esc(t.instrument||'Trade')} — ${fmtD(t.date)}</span>${bdg}</div>`;
  const gp=parseFloat(t.gainPerte)||0;
  const gpStr=t.gainPerte!==undefined&&t.gainPerte!==''?(gp>=0?`+$${Math.abs(gp).toFixed(2)}`:`-$${Math.abs(gp).toFixed(2)}`):'—';
  const rr=calcRR(t);
  const rrStr=rr!==null?(rr>0?'+':'')+fmtN(rr,2)+'R':'—';
  const starsVal=t.stars||(t.confiance?Math.max(1,Math.min(5,Math.round(t.confiance/2))):null);
  const structStr=t.structure==='solide'?'✓ SOLIDE (Alignée)':t.structure==='fragile'?'⚠ FRAGILE (Contre-tendance)':t.structureSolide===true?'✓ Solide':t.structureSolide===false?'⚠ Fragile':'—';
  const cells=[
    ['Compte',t.compte],['Session',t.session],['Heure',t.heure],
    ['Direction',t.direction||'—'],['Hors Zone',t.horsZone?'⚠ Hors killzone':'✓ En zone'],
    ['Confiance',starsVal?'★'.repeat(starsVal)+'☆'.repeat(5-starsVal):'—'],
    ['Structure',structStr],
    ['Montant risqué',t.montantRisque?`$${t.montantRisque}`:'—'],
    ['Gain / Perte',gpStr],
    ['RR',rrStr],
    ['État',t.etat]
  ];
  let h=`<div class="detail-grid">${cells.map(([l,v])=>`<div class="dc"><div class="dcl">${l}</div><div class="dcv">${esc(v||'—')}</div></div>`).join('')}</div>`;
  if(t.pourquoiEntrer)h+=`<div style="margin-bottom:11px"><div style="font-size:9.5px;font-weight:600;color:var(--text3);letter-spacing:.5px;text-transform:uppercase;margin-bottom:5px">Pourquoi entrer</div><p style="font-size:13px;line-height:1.6;background:var(--surface3);padding:11px 13px;border-radius:7px">${esc(t.pourquoiEntrer)}</p></div>`;
  if(t.tags&&t.tags.length)h+=`<div style="margin-bottom:11px"><div style="font-size:9.5px;font-weight:600;color:var(--text3);letter-spacing:.5px;text-transform:uppercase;margin-bottom:7px">Tags setup</div><div style="display:flex;flex-wrap:wrap;gap:5px">${t.tags.map(tag=>`<span style="padding:3px 10px;border-radius:20px;background:var(--accent-bg);border:1.5px solid var(--accent-bd);color:var(--accent);font-size:11.5px;font-weight:600">${esc(tag)}</span>`).join('')}</div></div>`;
  if(t.douteHesitation)h+=`<div style="margin-bottom:11px"><div style="font-size:9.5px;font-weight:600;color:var(--text3);letter-spacing:.5px;text-transform:uppercase;margin-bottom:5px">Doute / Hésitation</div><p style="font-size:13px;line-height:1.6;background:var(--surface3);padding:11px 13px;border-radius:7px">${esc(t.douteHesitation)}</p></div>`;
  const scrHTF=t.screenshotHTF||t.screenshotAvant||t.screenshot||'',scrMTF=t.screenshotMTF||t.screenshotApres||'',scrLTF=t.screenshotLTF||'';
  const scrs=[['HTF',scrHTF],['MTF',scrMTF],['LTF',scrLTF]].filter(([,u])=>u&&(u.startsWith('http')||u.startsWith('//')||u.startsWith('data:')));
  if(scrs.length){h+=`<div><div style="font-size:9.5px;font-weight:600;color:var(--text3);letter-spacing:.5px;text-transform:uppercase;margin-bottom:9px">Captures d'écran</div><div style="display:flex;gap:9px;flex-wrap:wrap">`;scrs.forEach(([lbl,url])=>{h+=`<div style="flex:1;min-width:130px"><div style="font-size:10.5px;color:var(--text3);margin-bottom:4px">${lbl}</div><img src="${url}" style="width:100%;border-radius:7px;border:1px solid var(--border);cursor:pointer;object-fit:cover;height:120px" onclick="openImgPreview('${url.replace(/'/g,"\\'")}','${lbl}')" onerror="this.style.opacity='.3'"/></div>`;});h+=`</div></div>`;}
  h+=`<div style="display:flex;gap:7px;justify-content:flex-end;margin-top:18px;padding-top:14px;border-top:1px solid var(--border2)"><button class="btn btn-secondary" onclick="closeModal('detailModal');openEdit('${t.id}')">✎ Modifier</button><button class="btn btn-secondary" onclick="closeModal('detailModal')">Fermer</button></div>`;
  document.getElementById('detailBody').innerHTML=h;document.getElementById('detailModal').classList.add('open');
}

// ── CALENDAR ──────────────────────────────────────────────────────────────
function getCalTrades(){return calAccFilters.has('all')?DB.trades:DB.trades.filter(t=>calAccFilters.has(t.compte));}
function renderCal(){
  renderCalAccPills();
  const allTrades=getCalTrades();
  const bd={};allTrades.forEach(t=>{if(!t.date)return;if(!bd[t.date])bd[t.date]=[];bd[t.date].push(t);});
  const fd=(new Date(calY,calM,1).getDay()+6)%7,dim=new Date(calY,calM+1,0).getDate(),pd=new Date(calY,calM,0).getDate();
  const cells=[];
  for(let i=fd-1;i>=0;i--)cells.push({d:pd-i,cur:false});
  for(let d=1;d<=dim;d++)cells.push({d,cur:true});
  while(cells.length%7!==0)cells.push({d:cells.length-fd-dim+1,cur:false});
  const mTrades=allTrades.filter(t=>{if(!t.date)return false;const[y,m]=t.date.split('-');return parseInt(y)===calY&&parseInt(m)-1===calM;});
  const ms=stats(mTrades),mPnl=mTrades.reduce((s,t)=>s+calcPnl(t),0);
  const pnlCol=mPnl>0?'var(--green)':mPnl<0?'var(--red)':'var(--text3)';
  const mn=new Date(calY,calM,1).toLocaleString('fr-FR',{month:'long',year:'numeric'});
  const td=new Date();
  let h=`<div class="cal-toolbar">
    <div class="cal-nav-group">
      <button class="btn btn-secondary btn-sm" onclick="calNav(-1)">‹</button>
      <div class="cal-title">${mn}</div>
      <button class="btn btn-secondary btn-sm" onclick="calNav(1)">›</button>
      <button class="btn btn-secondary btn-sm" onclick="calToday()">Aujourd'hui</button>
    </div>
    <div class="cal-hdr-stats">
      <div class="cal-hdr-stat"><span class="val">${ms.total||'—'}</span><span class="lbl">Trades</span></div>
      <div class="cal-hdr-stat"><span class="val" style="color:${ms.total?(ms.winRate>=50?'var(--green)':'var(--red)'):'var(--text2)'}">${ms.total?ms.winRate+'%':'—'}</span><span class="lbl">Win Rate</span></div>
      <div class="cal-hdr-stat"><span class="val" style="color:${ms.total?pnlCol:'var(--text2)'}">${ms.total?(mPnl>=0?'+':'')+mPnl.toFixed(2)+'$':'—'}</span><span class="lbl">P&L</span></div>
      <div class="cal-hdr-stat"><span class="val" style="color:${ms.total?'var(--accent)':'var(--text2)'}">${ms.total?(ms.avgRR>=0?'+':'')+fmtN(ms.avgRR,2)+'R':'—'}</span><span class="lbl">RR moy.</span></div>
    </div>
  </div>`;
  h+=`<div class="cal-hrow">${['L','M','M','J','V','S','D'].map(d=>`<div class="cal-dl">${d}</div>`).join('')}</div><div class="cal-grid">`;
  cells.forEach(c=>{
    if(!c.cur){h+=`<div class="cal-day other"><div class="cal-date">${c.d}</div></div>`;return;}
    const ds=`${calY}-${String(calM+1).padStart(2,'0')}-${String(c.d).padStart(2,'0')}`;
    const dt=bd[ds]||[];
    const it=c.d===td.getDate()&&calM===td.getMonth()&&calY===td.getFullYear();
    const pnl=dt.reduce((s,t)=>s+calcPnl(t),0);
    const wins=dt.filter(t=>t.resultat==='Win').length;
    const winPct=dt.length?Math.round(wins/dt.length*100):0;
    const dayClass=dt.length?(pnl>0?' day-win':pnl<0?' day-loss':''):'';
    const dpnlCol=pnl>0?'var(--green)':pnl<0?'var(--red)':'var(--text3)';
    const barCol=winPct>=50?'var(--green)':'var(--red)';
    h+=`<div class="cal-day${it?' today':''}${dayClass}${dt.length?' hast':''}"${dt.length?` onclick="openDayDetail('${ds}')"`:''}>`+
      `<div class="cal-date">${c.d}</div>`+
      (dt.length?
        `<div class="cal-pnl" style="color:${dpnlCol}">${pnl>=0?'+':''}${pnl.toFixed(1)}$</div>`+
        `<div class="cal-meta"><span>${dt.length}T</span><span style="color:${barCol}">${winPct}%</span></div>`+
        `<div class="cal-win-bar"><div class="cal-win-fill" style="width:${winPct}%;background:${barCol}"></div></div>`
      :'')+
    `</div>`;
  });
  h+=`</div>`;
  const firstDay=new Date(calY,calM,1),fdow=(firstDay.getDay()+6)%7;
  let wStart=new Date(firstDay);wStart.setDate(1-fdow);
  const weeks=[];
  for(let w=0;w<6;w++){
    const wEnd=new Date(wStart);wEnd.setDate(wStart.getDate()+6);
    const wTrades=mTrades.filter(t=>{const d=new Date(t.date);return d>=wStart&&d<=wEnd;});
    if(wStart.getMonth()===calM||wEnd.getMonth()===calM){
      weeks.push({n:weeks.length+1,trades:wTrades,pnl:wTrades.reduce((s,t)=>s+calcPnl(t),0),start:new Date(wStart),end:new Date(wEnd)});
    }
    wStart.setDate(wStart.getDate()+7);
  }
  if(weeks.length){
    const maxAbs=Math.max(...weeks.map(w=>Math.abs(w.pnl)),1);
    h+=`<div class="cal-weeks-section"><div class="cal-weeks-title">Performance par semaine</div><div class="cal-weeks-rows">`;
    weeks.forEach(w=>{
      const pct=Math.round(Math.abs(w.pnl)/maxAbs*100);
      const col=w.pnl>0?'var(--green)':w.pnl<0?'var(--red)':'var(--border)';
      const ws=w.start.toLocaleDateString('fr-FR',{day:'numeric',month:'short'});
      const we=w.end.toLocaleDateString('fr-FR',{day:'numeric',month:'short'});
      h+=`<div class="cal-wrow"><span class="cal-wrow-n">S${w.n}</span><span class="cal-wrow-dates">${ws} – ${we}</span><span class="cal-wrow-ct">${w.trades.length}T</span><div class="cal-wrow-track"><div class="cal-wrow-fill" style="width:${pct}%;background:${col}"></div></div><span class="cal-wrow-val" style="color:${col}">${w.pnl>=0?'+':''}${w.pnl.toFixed(2)}$</span></div>`;
    });
    h+=`</div></div>`;
  }
  document.getElementById('calCard').innerHTML=h;
  document.getElementById('calSummary').innerHTML='';
}
function renderCalAccPills(){
  const allSel=calAccFilters.has('all');
  let h=`<span style="font-size:10px;font-weight:600;color:var(--text3);letter-spacing:.5px;text-transform:uppercase;margin-right:4px">Compte :</span>`;
  h+=`<button class="acc-pill ${allSel?'active':''}" style="${allSel?'background:var(--text);border-color:var(--text)':''}" onclick="toggleCAF('all')">Tous</button>`;
  DB.accounts.forEach(a=>{const ok=!allSel&&calAccFilters.has(a.name);h+=`<button class="acc-pill ${ok?'active':''}" style="${ok?`background:${a.color};border-color:${a.color}`:''}" onclick="toggleCAF('${esc(a.name)}')"><span style="width:7px;height:7px;border-radius:50%;background:${a.color};display:inline-block"></span>${esc(a.name)}</button>`;});
  const el=document.getElementById('calAccPills');if(el)el.innerHTML=h;
}
function toggleCAF(name){
  if(name==='all'){calAccFilters=new Set(['all']);}
  else{calAccFilters.delete('all');if(calAccFilters.has(name))calAccFilters.delete(name);else calAccFilters.add(name);if(calAccFilters.size===0)calAccFilters=new Set(['all']);}
  renderCal();
}
function calNav(d){calM+=d;if(calM>11){calM=0;calY++;}if(calM<0){calM=11;calY--;}renderCal();}
function calToday(){calY=new Date().getFullYear();calM=new Date().getMonth();renderCal();}
function openDayDetail(ds){
  const trades=getCalTrades().filter(t=>t.date===ds);if(!trades.length)return;
  const pnl=trades.reduce((s,t)=>s+calcPnl(t),0);
  const s=stats(trades);
  document.getElementById('detailHead').innerHTML=`<div style="display:flex;align-items:center;gap:10px"><span class="modal-title">${fmtD(ds)}</span><span style="font-size:12px;color:var(--text3)">${trades.length} trade${trades.length>1?'s':''}</span></div>`;
  let h=`<div class="detail-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:14px">
    <div class="dc"><div class="dcl">P&L</div><div class="dcv" style="color:${pnl>=0?'var(--green)':'var(--red)'};font-family:'DM Mono',monospace">${pnl>=0?'+':''}${pnl.toFixed(2)}$</div></div>
    <div class="dc"><div class="dcl">Win rate</div><div class="dcv">${s.winRate}%</div></div>
    <div class="dc"><div class="dcl">RR moyen</div><div class="dcv" style="color:var(--accent)">${s.avgRR>=0?'+':''}${fmtN(s.avgRR,2)}R</div></div>
  </div>`;
  trades.forEach(t=>{
    const bdg=t.resultat?`<span class="badge badge-${t.resultat==='Win'?'win':t.resultat==='Loss'?'loss':t.resultat==='En cours'?'encours':'be'}">${t.resultat}</span>`:'';
    const rr=calcRR(t);
    h+=`<div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border2);cursor:pointer" onclick="closeModal('detailModal');openDetail('${t.id}')">
      <div style="flex:1"><span style="font-weight:600;font-family:'DM Mono',monospace">${esc(t.instrument||'—')}</span> <span style="color:var(--text3);font-size:12px">${t.heure||''}</span></div>
      ${bdg}
      <span style="font-family:'DM Mono',monospace;font-size:12.5px;font-weight:400;color:${rr!==null&&rr>0?'var(--green)':rr!==null&&rr<0?'var(--red)':'var(--text3)'}">${rr!==null?(rr>0?'+':'')+fmtN(rr,2)+'R':'—'}</span>
    </div>`;
  });
  h+=`<div style="display:flex;justify-content:flex-end;margin-top:16px"><button class="btn btn-secondary" onclick="closeModal('detailModal')">Fermer</button></div>`;
  document.getElementById('detailBody').innerHTML=h;document.getElementById('detailModal').classList.add('open');
}

// renderCalSummary replaced — now inline in renderCal()

// ── CASHFLOW ──────────────────────────────────────────────────────────────
function openCFModal(id){
  editCFId=id||null;
  const now=new Date().toISOString().split('T')[0];
  const ao=DB.accounts.map(a=>`<option value="${esc(a.name)}">${esc(a.name)}</option>`).join('');
  document.getElementById('cf_compte').innerHTML=`<option value="">Sélectionner</option>${ao}`;
  if(id){
    const cf=DB.cashflow.find(c=>String(c.id)===String(id));if(!cf)return;
    document.getElementById('cfModalTitle').textContent='Modifier le mouvement';
    document.getElementById('cf_type').value=cf.type;document.getElementById('cf_date').value=cf.date;
    document.getElementById('cf_compte').value=cf.compte;document.getElementById('cf_usd').value=cf.montantUSD||'';
    document.getElementById('cf_mur').value=cf.montantMUR||'';document.getElementById('cf_rate').value=cf.taux||'';
    document.getElementById('cf_note').value=cf.note||'';
  }else{
    document.getElementById('cfModalTitle').textContent='Nouveau mouvement';
    document.getElementById('cf_type').value='depot';document.getElementById('cf_date').value=now;
    document.getElementById('cf_compte').value='';document.getElementById('cf_usd').value='';
    document.getElementById('cf_mur').value='';document.getElementById('cf_rate').value='';document.getElementById('cf_note').value='';
  }
  document.getElementById('cfModal').classList.add('open');
}
function cfTypeChange(){}
function cfCalcMUR(){const usd=parseFloat(document.getElementById('cf_usd').value)||0;const rate=parseFloat(document.getElementById('cf_rate').value)||0;if(usd&&rate)document.getElementById('cf_mur').value=(usd*rate).toFixed(2);}
function cfCalcRate(){const usd=parseFloat(document.getElementById('cf_usd').value)||0;const mur=parseFloat(document.getElementById('cf_mur').value)||0;if(usd&&mur)document.getElementById('cf_rate').value=(mur/usd).toFixed(4);}
async function saveCF(){
  const type=document.getElementById('cf_type').value,date=document.getElementById('cf_date').value,compte=document.getElementById('cf_compte').value,montantUSD=parseFloat(document.getElementById('cf_usd').value)||0,montantMUR=parseFloat(document.getElementById('cf_mur').value)||0,taux=parseFloat(document.getElementById('cf_rate').value)||0,note=document.getElementById('cf_note').value.trim();
  if(!date||!compte||!montantUSD){toast('Date, compte et montant USD requis','error');return;}
  const cf={id:editCFId||Date.now().toString(),type,date,compte,montantUSD,montantMUR,taux,note};
  if(editCFId){const i=DB.cashflow.findIndex(c=>String(c.id)===String(editCFId));if(i>=0)DB.cashflow[i]=cf;else DB.cashflow.unshift(cf);}
  else DB.cashflow.unshift(cf);
  saveDB();closeModal('cfModal');toast('Enregistrement…','info');
  await sbUpsertCF(cf);toast('Mouvement sauvegardé ✓','success');
  if(curPage==='cashflow')renderCashflow();
}
async function delCF(id){
  if(!confirm('Supprimer ce mouvement ?'))return;
  DB.cashflow=DB.cashflow.filter(c=>String(c.id)!==String(id));saveDB();toast('Suppression…','info');
  await sbDeleteCF(id);toast('Mouvement supprimé','info');
  if(curPage==='cashflow')renderCashflow();
}
function renderCFAccPills(){
  const allSel=cfAccFilters.has('all');
  let h=`<span style="font-size:10px;font-weight:600;color:var(--text3);letter-spacing:.5px;text-transform:uppercase;margin-right:4px">Compte :</span>`;
  h+=`<button class="acc-pill ${allSel?'active':''}" style="${allSel?'background:var(--text);border-color:var(--text)':''}" onclick="toggleCFAF('all')">Tous</button>`;
  DB.accounts.forEach(a=>{const ok=!allSel&&cfAccFilters.has(a.name);h+=`<button class="acc-pill ${ok?'active':''}" style="${ok?`background:${a.color};border-color:${a.color}`:''}" onclick="toggleCFAF('${esc(a.name)}')"><span style="width:7px;height:7px;border-radius:50%;background:${a.color};display:inline-block"></span>${esc(a.name)}</button>`;});
  const el=document.getElementById('cfAccPills');if(el)el.innerHTML=h;
}
function toggleCFAF(name){
  if(name==='all'){cfAccFilters=new Set(['all']);}
  else{cfAccFilters.delete('all');if(cfAccFilters.has(name))cfAccFilters.delete(name);else cfAccFilters.add(name);if(cfAccFilters.size===0)cfAccFilters=new Set(['all']);}
  renderCashflow();
}
function getCFFiltered(){
  return(DB.cashflow||[]).filter(c=>{
    if(!cfAccFilters.has('all')&&!cfAccFilters.has(c.compte))return false;
    if(cfFilters.type&&c.type!==cfFilters.type)return false;
    return true;
  }).sort((a,b)=>b.date.localeCompare(a.date));
}
function renderCashflow(){
  renderCFAccPills();
  if(!DB.cashflow)DB.cashflow=[];
  const all=cfAccFilters.has('all')?DB.cashflow:DB.cashflow.filter(c=>cfAccFilters.has(c.compte));
  const totalDepots=all.filter(c=>c.type==='depot').reduce((s,c)=>s+(c.montantUSD||0),0);
  const totalPayouts=all.filter(c=>c.type==='payout').reduce((s,c)=>s+(c.montantUSD||0),0);
  const totalDepotsMUR=all.filter(c=>c.type==='depot').reduce((s,c)=>s+(c.montantMUR||0),0);
  const totalPayoutsMUR=all.filter(c=>c.type==='payout').reduce((s,c)=>s+(c.montantMUR||0),0);
  document.getElementById('cfSummary').innerHTML=`
    <div class="cf-sum-card"><div class="cf-sum-lbl">Total dépôts</div><div class="cf-sum-val" style="color:var(--green)">$${totalDepots.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})}</div><div class="cf-sum-sub">₨ ${totalDepotsMUR.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})}</div></div>
    <div class="cf-sum-card"><div class="cf-sum-lbl">Total retraits</div><div class="cf-sum-val" style="color:var(--blue)">$${totalPayouts.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})}</div><div class="cf-sum-sub">₨ ${totalPayoutsMUR.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})}</div></div>
    <div class="cf-sum-card"><div class="cf-sum-lbl">Solde net USD</div><div class="cf-sum-val" style="color:${totalPayouts-totalDepots>=0?'var(--green)':'var(--red)'}">${totalPayouts-totalDepots>=0?'+':''}$${Math.abs(totalPayouts-totalDepots).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})}</div><div class="cf-sum-sub">Payouts − Dépôts</div></div>
    <div class="cf-sum-card"><div class="cf-sum-lbl">Solde net MUR</div><div class="cf-sum-val" style="color:${totalPayoutsMUR-totalDepotsMUR>=0?'var(--green)':'var(--red)'};font-size:18px">${totalPayoutsMUR-totalDepotsMUR>=0?'+':''}₨ ${Math.abs(totalPayoutsMUR-totalDepotsMUR).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})}</div><div class="cf-sum-sub">Payouts − Dépôts</div></div>`;
  document.getElementById('cfFilters').innerHTML=`
    <select onchange="setCFF('type',this.value)">
      <option value="">Tous les types</option>
      <option value="depot" ${cfFilters.type==='depot'?'selected':''}>Dépôts</option>
      <option value="payout" ${cfFilters.type==='payout'?'selected':''}>Retraits</option>
    </select>
    ${Object.values(cfFilters).some(Boolean)?'<button class="btn btn-ghost btn-sm" onclick="resetCFF()">✕ Réinitialiser</button>':''}
    <div style="margin-left:auto"><button class="btn btn-primary btn-sm" onclick="openCFModal()">+ Nouveau mouvement</button></div>`;
  const rows=getCFFiltered();
  if(!rows.length){
    document.getElementById('cfBody').innerHTML=`<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--text3)">Aucun mouvement. Ajoutez votre premier dépôt ou retrait.</td></tr>`;
    document.getElementById('cfCards').innerHTML=`<div class="empty"><h3>Aucun mouvement</h3><p>Ajoutez votre premier dépôt ou retrait.</p></div>`;
    return;
  }
  document.getElementById('cfBody').innerHTML=rows.map(c=>{
    const isDepot=c.type==='depot';const acc=DB.accounts.find(a=>a.name===c.compte);
    return `<tr class="tr-data">
      <td style="font-family:'DM Mono',monospace;font-size:12px">${fmtD(c.date)}</td>
      <td><span class="badge badge-${isDepot?'depot':'payout'}">${isDepot?'Dépôt':'Payout'}</span></td>
      <td><div style="display:flex;align-items:center;gap:6px">${acc?`<span style="width:7px;height:7px;border-radius:50%;background:${acc.color};display:inline-block;flex-shrink:0"></span>`:''}<span>${esc(c.compte||'—')}</span></div></td>
      <td style="font-family:'DM Mono',monospace;font-weight:400;color:${isDepot?'var(--green)':'var(--blue)'}">$${(c.montantUSD||0).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
      <td style="font-family:'DM Mono',monospace;font-weight:400;color:${isDepot?'var(--green)':'var(--blue)'}">₨ ${(c.montantMUR||0).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
      <td style="font-family:'DM Mono',monospace;color:var(--text3);font-size:12px">${c.taux?c.taux.toFixed(4):'—'}</td>
      <td style="color:var(--text2);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(c.note)}">${esc(c.note||'—')}</td>
      <td><div style="display:flex;gap:3px"><button class="btn-ghost btn-sm" onclick="openCFModal('${c.id}')">✎</button><button class="btn-ghost btn-sm" style="color:var(--red)" onclick="delCF('${c.id}')">🗑</button></div></td>
    </tr>`;
  }).join('');
  document.getElementById('cfCards').innerHTML=rows.map(c=>{
    const isDepot=c.type==='depot';const acc=DB.accounts.find(a=>a.name===c.compte);
    return `<div class="cf-card ${isDepot?'cf-depot':'cf-payout'}">
      <div class="cf-card-top">
        <div style="display:flex;align-items:center;gap:6px"><span class="badge badge-${isDepot?'depot':'payout'}">${isDepot?'Dépôt':'Payout'}</span><span style="font-family:'DM Mono',monospace;font-size:11px;color:var(--text3)">${fmtD(c.date)}</span></div>
        <div style="display:flex;gap:3px"><button class="btn-ghost btn-sm" onclick="openCFModal('${c.id}')">✎</button><button class="btn-ghost btn-sm" style="color:var(--red)" onclick="delCF('${c.id}')">🗑</button></div>
      </div>
      <div class="cf-card-row"><span class="cf-card-lbl">Compte</span><span class="cf-card-val">${acc?`<span style="width:6px;height:6px;border-radius:50%;background:${acc.color};display:inline-block;margin-right:3px;vertical-align:middle"></span>`:''} ${esc(c.compte||'—')}</span><span class="cf-card-lbl">USD</span><span class="cf-card-val" style="font-family:'DM Mono',monospace;font-weight:600;color:${isDepot?'var(--green)':'var(--blue)'}">$${(c.montantUSD||0).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})}</span></div>
      <div class="cf-card-row"><span class="cf-card-lbl">MUR</span><span class="cf-card-val" style="font-family:'DM Mono',monospace;color:${isDepot?'var(--green)':'var(--blue)'}">₨ ${(c.montantMUR||0).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})}</span><span class="cf-card-lbl">Taux</span><span class="cf-card-val" style="font-family:'DM Mono',monospace;color:var(--text3)">${c.taux?c.taux.toFixed(4):'—'}</span></div>
      ${c.note?`<div style="margin-top:5px;font-size:11.5px;color:var(--text3);padding-top:5px;border-top:1px solid var(--border2)">${esc(c.note)}</div>`:''}
    </div>`;
  }).join('');
}
function setCFF(k,v){cfFilters[k]=v;renderCashflow();}
function resetCFF(){cfFilters={type:''};renderCashflow();}

// ── ACCOUNTS ──────────────────────────────────────────────────────────────
function renderAccounts(){
  let h='';
  DB.accounts.forEach(acc=>{
    const at=DB.trades.filter(t=>t.compte===acc.name);
    const s=stats(at);
    const totalPnl=at.reduce((sum,t)=>sum+calcPnl(t),0);
    const pp=acc.startCapital&&totalPnl!==0?(totalPnl/parseFloat(acc.startCapital)*100).toFixed(1):null;
    h+=`<div class="acc-card" style="border-color:${acc.color}40">
      <div class="acc-bar" style="background:linear-gradient(90deg,${acc.color},${acc.color}80)"></div>
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:4px">
        <div style="flex:1;min-width:0">
          <div style="font-size:15px;font-weight:700;letter-spacing:-.3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(acc.name)}</div>
          <div style="display:flex;align-items:center;gap:6px;margin-top:3px;flex-wrap:wrap">
            ${acc.startCapital?`<div style="font-size:11px;color:var(--text3)">Départ : <span style="font-family:'DM Mono',monospace;font-weight:500">$${parseFloat(acc.startCapital).toLocaleString()}</span></div>`:'<div style="font-size:11px;color:var(--text3)">Capital non défini</div>'}
            <button class="btn btn-secondary btn-sm" style="padding:2px 8px;font-size:10px" onclick="openEditCap('${acc.id}')">Modifier</button>
          </div>
        </div>
        <button class="btn btn-secondary btn-sm" style="font-size:11px;margin-left:8px;flex-shrink:0" onclick="openRenameAcc('${acc.id}')">✎ Renommer</button>
      </div>
      ${pp!==null?`<div class="pnl-badge" style="background:${parseFloat(pp)>=0?'var(--green-bg)':'var(--red-bg)'};border:1px solid ${parseFloat(pp)>=0?'var(--green-bd)':'var(--red-bd)'};color:${parseFloat(pp)>=0?'var(--green)':'var(--red)'}">${parseFloat(pp)>=0?'+':''}${pp}% P&L</div>`:''}
      <div class="acc-sg">${[['Trades',s.total],['Win rate',s.winRate+'%'],['RR moyen',(s.avgRR>=0?'+':'')+fmtN(s.avgRR,2)+'R'],['P&L total',(totalPnl>=0?'+':'')+totalPnl.toFixed(2)+'$']].map(([l,v])=>`<div class="acc-sb"><div class="acc-sl">${l}</div><div class="acc-sv">${v}</div></div>`).join('')}</div>
    </div>`;
  });
  h+=`<div class="acc-card" style="border:2px dashed var(--border);display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:200px;cursor:pointer;background:var(--surface3)" onclick="openAccModal()">
    <div style="width:36px;height:36px;border-radius:10px;background:var(--accent-bg);display:flex;align-items:center;justify-content:center;margin-bottom:9px;font-size:20px;color:var(--accent)">+</div>
    <span style="font-size:13px;font-weight:600;color:var(--accent)">Ajouter un compte</span>
  </div>`;
  document.getElementById('accGrid').innerHTML=h;
}
function openAccModal(){selColor=ACC_COLORS[0];document.getElementById('accName').value='';document.getElementById('accCapital').value='';buildSwatches();document.getElementById('accModal').classList.add('open');}
function buildSwatches(){document.getElementById('accSwatches').innerHTML=ACC_COLORS.map(c=>`<div class="swatch ${c===selColor?'sel':''}" style="background:${c}" onclick="selC('${c}')"></div>`).join('');}
function selC(c){selColor=c;buildSwatches();}
async function saveAccount(){
  const n=document.getElementById('accName').value.trim();if(!n)return;
  const acc={id:String(Date.now()),name:n,startCapital:parseFloat(document.getElementById('accCapital').value)||0,color:selColor};
  DB.accounts.push(acc);saveDB();closeModal('accModal');toast('Création…','info');
  await sbUpsertAccount(acc);renderAccounts();toast('Compte créé ✓','success');
}
function openEditCap(id){editCapId=String(id);const acc=DB.accounts.find(a=>String(a.id)===editCapId);if(!acc)return;document.getElementById('editCapVal').value=acc.startCapital||'';document.getElementById('editCapModal').classList.add('open');}
async function saveEditCap(){
  const acc=DB.accounts.find(a=>String(a.id)===String(editCapId));if(!acc)return;
  acc.startCapital=parseFloat(document.getElementById('editCapVal').value)||0;
  saveDB();closeModal('editCapModal');toast('Mise à jour…','info');
  await sbUpsertAccount(acc);renderAccounts();toast('Capital mis à jour ✓','success');
}
function openRenameAcc(id){renameAccId=String(id);const acc=DB.accounts.find(a=>String(a.id)===renameAccId);if(!acc)return;document.getElementById('renameAccVal').value=acc.name;document.getElementById('renameAccModal').classList.add('open');}
async function saveRenameAcc(){
  const acc=DB.accounts.find(a=>String(a.id)===String(renameAccId));if(!acc)return;
  const newName=document.getElementById('renameAccVal').value.trim();
  if(!newName){toast('Le nom ne peut pas être vide','error');return;}
  const oldName=acc.name;if(newName===oldName){closeModal('renameAccModal');return;}
  acc.name=newName;
  DB.trades.forEach(t=>{if(t.compte===oldName)t.compte=newName;});
  DB.cashflow.forEach(c=>{if(c.compte===oldName)c.compte=newName;});
  saveDB();closeModal('renameAccModal');toast('Renommage…','info');
  await sbUpsertAccount(acc);
  await Promise.all([...DB.trades.filter(t=>t.compte===newName).map(t=>sbUpsertTrade(t)),...DB.cashflow.filter(c=>c.compte===newName).map(c=>sbUpsertCF(c))]);
  renderAccounts();toast('Compte renommé ✓','success');
}

// ── RULES ─────────────────────────────────────────────────────────────────
function renderRules(){renderRTab();renderCTab();}
function switchTab(t){activeTab=t;document.querySelectorAll('.tab').forEach((e,i)=>e.classList.toggle('active',(i===0&&t==='rules')||(i===1&&t==='checklist')));document.getElementById('tab-rules').style.display=t==='rules'?'block':'none';document.getElementById('tab-checklist').style.display=t==='checklist'?'block':'none';}
function renderRTab(){
  let h=`<div class="card" style="margin-bottom:14px">`;
  if(!DB.rules.length)h+='<div class="empty"><p>Aucune règle définie</p></div>';
  DB.rules.forEach((r,i)=>{h+=`<div class="rule-item"><div class="rule-num">${i+1}</div><div style="flex:1;font-size:13px;line-height:1.6">${esc(r.text)}</div><button class="btn-ghost btn-sm" style="color:var(--red)" onclick="delRule(${r.id})">🗑</button></div>`;});
  h+=`</div><div class="card" style="padding:14px"><div style="font-size:12px;font-weight:600;margin-bottom:9px">Nouvelle règle</div><div class="inline-add"><input id="nri" placeholder="Ex: Ne jamais trader pendant les news…" onkeydown="if(event.key==='Enter')addRule()"/><button class="btn btn-primary btn-sm" onclick="addRule()">+ Ajouter</button></div></div>`;
  document.getElementById('tab-rules').innerHTML=h;
}
function addRule(){const v=document.getElementById('nri').value.trim();if(!v)return;DB.rules.push({id:Date.now(),text:v});saveDB();renderRTab();}
function delRule(id){DB.rules=DB.rules.filter(r=>r.id!==id);saveDB();renderRTab();}
function renderCTab(){
  const done=Object.values(checkedItems).filter(Boolean).length,pct=DB.checklists.length?done/DB.checklists.length*100:0;
  let h=`<div class="card" style="margin-bottom:12px"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:9px"><span style="font-size:13px;font-weight:600">${done} / ${DB.checklists.length} validés</span><div style="display:flex;gap:5px"><button class="btn-ghost btn-sm" onclick="resetChk()">Réinitialiser</button><button class="btn-ghost btn-sm" onclick="chkAll()">Tout cocher</button></div></div><div class="prog-bar"><div class="prog-fill" style="width:${pct}%;background:${pct===100?'var(--green)':'var(--accent)'}"></div></div><div style="margin-top:12px">`;
  DB.checklists.forEach(c=>{const on=checkedItems[c.id];h+=`<div class="check-item" onclick="togChk(${c.id})"><div class="check-box ${on?'on':''}">${on?'✓':''}</div><span style="font-size:13px;flex:1;${on?'color:var(--text3);text-decoration:line-through':''}">${esc(c.text)}</span><button class="btn-ghost btn-sm" style="color:var(--red)" onclick="event.stopPropagation();delChk(${c.id})">🗑</button></div>`;});
  h+=`</div></div><div class="card" style="padding:14px"><div style="font-size:12px;font-weight:600;margin-bottom:9px">Nouvel élément</div><div class="inline-add"><input id="nci" placeholder="Ex: Confirmation sur M15…" onkeydown="if(event.key==='Enter')addChk()"/><button class="btn btn-primary btn-sm" onclick="addChk()">+ Ajouter</button></div></div>`;
  document.getElementById('tab-checklist').innerHTML=h;
}
function togChk(id){checkedItems[id]=!checkedItems[id];renderCTab();}
function resetChk(){checkedItems={};renderCTab();}
function chkAll(){DB.checklists.forEach(c=>checkedItems[c.id]=true);renderCTab();}
function addChk(){const v=document.getElementById('nci').value.trim();if(!v)return;DB.checklists.push({id:Date.now(),text:v});saveDB();renderCTab();}
function delChk(id){DB.checklists=DB.checklists.filter(c=>c.id!==id);saveDB();renderCTab();}

// ── SETTINGS ──────────────────────────────────────────────────────────────
function renderSettings(){
  const it=DB.instruments.map(i=>`<span class="tag">${esc(i)}<button onclick="rmInstr('${i}')">×</button></span>`).join('');
  const sidebarLight=localStorage.getItem('sidebarLight')==='1';
  const sidebarCollapsed=localStorage.getItem('sidebarCollapsed')==='1';
  const curTheme=localStorage.getItem('tl_theme')||'light';

  function toggleBtn(on,onClick,id=''){
    return `<button ${id?`id="${id}"`:''}onclick="${onClick}" class="toggle-switch" style="background:${on?'var(--accent)':'var(--bg2)'}">
      <span class="toggle-knob" style="left:${on?'23px':'3px'}"></span>
    </button>`;
  }

  const themes=[
    {id:'light',name:'Light',   sb:'#1C3461',bg:'#F5F7FA',accent:'#2558CE',bar:'#60A5FA'},
    {id:'dark', name:'Sombre',  sb:'#080A0F',bg:'#0C0E14',accent:'#3B82F6',bar:'#3B82F6'},
    {id:'gold', name:'Gold',    sb:'#3A2208',bg:'#F7F3EA',accent:'#D4A84C',bar:'#D4A84C'},
  ];
  const themeCards=themes.map(t=>`
    <div class="theme-card ${curTheme===t.id?'active':''}" onclick="setTheme('${t.id}');renderSettings()" title="${t.name}">
      <div class="theme-card-preview" style="background:${t.bg}">
        <div class="theme-card-preview-sidebar" style="background:${t.sb}">
          <div style="width:10px;height:2px;background:${t.bar};border-radius:2px;margin:4px auto 3px"></div>
          <div style="width:14px;height:2px;background:rgba(255,255,255,.2);border-radius:2px;margin:0 auto 3px"></div>
          <div style="width:14px;height:2px;background:rgba(255,255,255,.2);border-radius:2px;margin:0 auto 3px"></div>
        </div>
        <div class="theme-card-preview-body">
          <div class="theme-card-preview-row" style="background:${t.accent};opacity:.35"></div>
          <div class="theme-card-preview-row"></div>
          <div class="theme-card-preview-row" style="width:60%"></div>
        </div>
      </div>
      <div class="theme-card-label">${t.name}${curTheme===t.id?' ✓':''}</div>
    </div>`).join('');

  document.getElementById('settingsContent').innerHTML=`
    <div class="card" style="margin-bottom:14px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div style="display:flex;align-items:center;gap:9px">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
          <span style="font-size:14px;font-weight:700">Coach IA — Gemini</span>
        </div>
        <span id="geminiStatus" style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;background:var(--surface3);color:var(--text4)">${localStorage.getItem('gemini_api_key')?'✓ Clé configurée':'Non configuré'}</span>
      </div>
      <div style="font-size:12px;color:var(--text3);margin-bottom:12px">Connecte Gemini 2.5 Flash pour analyser tes 20 derniers trades et recevoir des recommandations personnalisées. La clé est stockée uniquement dans ton navigateur.</div>
      <div style="display:flex;gap:8px;align-items:center">
        <input type="password" id="geminiKeyInput" placeholder="AIza…" value="${localStorage.getItem('gemini_api_key')||''}"
          style="flex:1;padding:7px 11px;border:1.5px solid var(--border);border-radius:var(--r);font-size:12px;font-family:'DM Mono',monospace;background:var(--surface);color:var(--text);outline:none"
          onfocus="this.type='text'" onblur="this.type='password'"/>
        <button class="btn btn-primary btn-sm" onclick="saveGeminiKey()">Enregistrer</button>
        <button class="btn btn-secondary btn-sm" onclick="refreshAICoach()" title="Vider le cache et relancer l'analyse">↺ Relancer</button>
      </div>
      <div style="margin-top:9px;font-size:10.5px;color:var(--text4)">Obtenir une clé gratuite sur <span style="color:var(--accent);font-weight:600">aistudio.google.com</span> · Cache de 6h pour économiser les appels</div>
    </div>

    <div class="card" style="margin-bottom:14px">
      <div style="display:flex;align-items:center;gap:9px;margin-bottom:5px">
        <div style="width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 6px rgba(45,122,79,.4)"></div>
        <span style="font-size:14px;font-weight:700">Supabase connecté</span>
      </div>
      <div style="font-size:12px;color:var(--text3);margin-bottom:10px">Données synchronisées automatiquement</div>
      <div style="padding:9px 12px;background:var(--surface3);border-radius:7px;font-family:'DM Mono',monospace;font-size:11px;color:var(--text2);word-break:break-all">${SUPABASE_URL}</div>
    </div>

    <div class="card" style="margin-bottom:14px">
      <div style="font-size:14px;font-weight:700;margin-bottom:6px">Apparence</div>
      <div style="font-size:11.5px;color:var(--text3);margin-bottom:14px">Personnalisez l'interface selon vos préférences visuelles.</div>

      <div style="font-size:10px;font-weight:700;color:var(--text4);text-transform:uppercase;letter-spacing:1.4px;margin-bottom:10px">Thème de couleur</div>
      <div style="display:flex;gap:10px;margin-bottom:20px">${themeCards}</div>

      <div style="font-size:10px;font-weight:700;color:var(--text4);text-transform:uppercase;letter-spacing:1.4px;margin-bottom:10px">Menu latéral</div>
      <div class="settings-toggle-row">
        <div class="settings-toggle-info">
          <span class="settings-toggle-label">Menu compact</span>
          <span class="settings-toggle-sub">Réduire la sidebar aux icônes uniquement</span>
        </div>
        ${toggleBtn(sidebarCollapsed,'toggleSidebarCollapsed()')}
      </div>
      <div class="settings-toggle-row">
        <div class="settings-toggle-info">
          <span class="settings-toggle-label">Menu fond clair</span>
          <span class="settings-toggle-sub">Afficher la sidebar en mode light</span>
        </div>
        ${toggleBtn(sidebarLight,'toggleSidebarLight()')}
      </div>
    </div>

    <div class="card" style="margin-bottom:14px">
      <div style="font-size:14px;font-weight:700;margin-bottom:6px">Export des données</div>
      <div style="font-size:12px;color:var(--text3);margin-bottom:12px">Télécharger une sauvegarde complète de tous vos trades, comptes et configurations.</div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-secondary btn-sm" onclick="exportCSV()">↓ Exporter en CSV</button>
        <button class="btn btn-primary btn-sm" onclick="exportJSON()">↓ Exporter en JSON</button>
      </div>
    </div>
    <div class="card">
      <div style="font-size:14px;font-weight:700;margin-bottom:12px">Instruments</div>
      <div class="tag-list">${it}</div>
      <div class="inline-add" style="margin-top:9px">
        <input id="nii" placeholder="Ex: GBPCHF" oninput="this.value=this.value.toUpperCase()" onkeydown="if(event.key==='Enter')addInstr()"/>
        <button class="btn btn-primary btn-sm" onclick="addInstr()">+ Ajouter</button>
      </div>
    </div>`;
}
function toggleSidebarLight(){
  const on=localStorage.getItem('sidebarLight')==='1';
  localStorage.setItem('sidebarLight',on?'0':'1');
  applySidebarLight();
  renderSettings();
}
function applySidebarLight(){
  if(localStorage.getItem('sidebarLight')==='1'){
    document.body.classList.add('sidebar-light');
  }else{
    document.body.classList.remove('sidebar-light');
  }
}
function toggleSidebarCollapsed(){
  const collapsed=document.body.classList.toggle('sidebar-collapsed');
  localStorage.setItem('sidebarCollapsed',collapsed?'1':'0');
  renderSettings();
}
function applySidebarCollapsed(){
  if(localStorage.getItem('sidebarCollapsed')==='1'){
    document.body.classList.add('sidebar-collapsed');
  }
}
function addInstr(){const v=document.getElementById('nii').value.trim().toUpperCase();if(!v||DB.instruments.includes(v))return;DB.instruments.push(v);saveDB();renderSettings();}
function rmInstr(i){DB.instruments=DB.instruments.filter(x=>x!==i);saveDB();renderSettings();}

// ── CSV EXPORT ────────────────────────────────────────────────────────────
function exportCSV(){
  const t=getFT();
  const rows=t.map(t=>{
    const rr=calcRR(t);
    const sv=t.stars||(t.confiance?Math.max(1,Math.min(5,Math.round(t.confiance/2))):null);
    const structStr=t.structure||(t.structureSolide===true?'Solide':t.structureSolide===false?'Fragile':'');
    return [t.id,t.compte,t.date,t.heure,t.session,t.instrument,t.direction||'',sv?sv+'★':'',structStr,t.horsZone?'Oui':'Non',t.montantRisque,t.gainPerte,t.capital,t.resultat,rr!==null?(rr>0?'+':'')+fmtN(rr,4):'',t.etat,t.pourquoiEntrer,t.douteHesitation].map(v=>`"${String(v||'').replace(/"/g,'""')}"`);
  });
  const csv=[SH,...rows].map(r=>r.join(',')).join('\n');
  const b=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'});
  const u=URL.createObjectURL(b);
  const a=document.createElement('a');a.href=u;a.download=`tradelog_${new Date().toISOString().split('T')[0]}.csv`;a.click();
  URL.revokeObjectURL(u);
}

// ── JSON EXPORT ───────────────────────────────────────────────────────────
function exportJSON(){
  const exportData={
    exportDate:new Date().toISOString(),
    version:'tradelog_v3',
    trades:DB.trades,
    accounts:DB.accounts,
    cashflow:DB.cashflow,
    instruments:DB.instruments,
    rules:DB.rules,
    checklists:DB.checklists
  };
  const json=JSON.stringify(exportData,null,2);
  const b=new Blob([json],{type:'application/json;charset=utf-8'});
  const u=URL.createObjectURL(b);
  const a=document.createElement('a');a.href=u;a.download=`tradelog_backup_${new Date().toISOString().split('T')[0]}.json`;a.click();
  URL.revokeObjectURL(u);
  toast('Export JSON téléchargé ✓','success');
}

// ── ALBUM VIEW ────────────────────────────────────────────────────────────
function openAlbumView(id){
  albumTrades=getFT();
  albumIdx=albumTrades.findIndex(t=>t.id===id);
  if(albumIdx<0)albumIdx=0;
  albumImgMode='htf';
  _renderAlbum();
  document.getElementById('albumModal').classList.add('open');
}
function albumNav(dir){
  albumIdx=Math.max(0,Math.min(albumTrades.length-1,albumIdx+dir));
  albumImgMode='htf';
  const m=document.querySelector('#albumModal .album-modal');if(m)m.classList.remove('img-zoomed');
  _renderAlbum();
}
function albumSetImg(mode){
  albumImgMode=mode;
  _renderAlbum();
}
function _renderAlbum(){
  const t=albumTrades[albumIdx];if(!t)return;
  // ── Header ──
  document.getElementById('albumInstr').textContent=t.instrument||'—';
  document.getElementById('albumDate').textContent=fmtD(t.date)+(t.heure?' · '+t.heure:'');
  const bdgCls=t.resultat==='Win'?'win':t.resultat==='Loss'?'loss':t.resultat==='En cours'?'encours':'be';
  document.getElementById('albumBadge').innerHTML=t.resultat?`<span class="badge badge-${bdgCls}">${t.resultat}</span>`:'';
  document.getElementById('albumCounter').textContent=`${albumIdx+1} / ${albumTrades.length}`;
  // ── Nav buttons ──
  const prev=document.getElementById('albumPrevBtn'),next=document.getElementById('albumNextBtn');
  if(prev)prev.disabled=albumIdx===0;
  if(next)next.disabled=albumIdx===albumTrades.length-1;
  // ── Edit button ──
  const eb=document.getElementById('albumEditBtn');
  if(eb)eb.onclick=()=>{closeModal('albumModal');openEdit(t.id);};
  // ── Screenshot ──
  const okUrl=u=>u&&(u.startsWith('http')||u.startsWith('//')||u.startsWith('data:'));
  const scrHTF=t.screenshotHTF||t.screenshotAvant||t.screenshot||'';
  const scrMTF=t.screenshotMTF||t.screenshotApres||'';
  const scrLTF=t.screenshotLTF||'';
  const hasHTF=okUrl(scrHTF),hasMTF=okUrl(scrMTF),hasLTF=okUrl(scrLTF);
  // Auto-fallback: find first available if requested mode is empty
  const modeMap={htf:hasHTF,mtf:hasMTF,ltf:hasLTF};
  let mode=albumImgMode;
  if(!modeMap[mode]){mode=hasHTF?'htf':hasMTF?'mtf':hasLTF?'ltf':mode;}
  const urlMap={htf:scrHTF,mtf:scrMTF,ltf:scrLTF};
  const activeUrl=urlMap[mode]||'';
  const hasImg=okUrl(activeUrl);
  const safeUrl=activeUrl.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
  const imgLabel=esc(t.instrument||'Trade')+' — '+fmtD(t.date);
  const imgHtml=hasImg
    ?`<img class="album-img-main" src="${activeUrl}" alt=""
        onclick="albumToggleZoom()"
        onerror="this.style.display='none';document.getElementById('_albPh').style.display='flex'"/>
      <div id="_albPh" class="album-img-placeholder" style="display:none;position:absolute;inset:0;justify-content:center;align-items:center;flex-direction:column;gap:14px">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        <span>Image inaccessible</span>
      </div>`
    :`<div class="album-img-placeholder">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        <span>Aucune capture d'écran</span>
      </div>`;
  const anyImg=hasHTF||hasMTF||hasLTF;
  const toggleHtml=anyImg?`<div class="album-img-toggle">
    ${hasHTF?`<button class="album-img-tab ${mode==='htf'?'active':''}" onclick="albumSetImg('htf')">HTF</button>`:''}
    ${hasMTF?`<button class="album-img-tab ${mode==='mtf'?'active':''}" onclick="albumSetImg('mtf')">MTF</button>`:''}
    ${hasLTF?`<button class="album-img-tab ${mode==='ltf'?'active':''}" onclick="albumSetImg('ltf')">LTF</button>`:''}
  </div>`:'';
  // ── Trade data ──
  const gp=parseFloat(t.gainPerte)||0;
  const hasGP=t.gainPerte!==undefined&&t.gainPerte!=='';
  const gpStr=hasGP?(gp>=0?`+$${Math.abs(gp).toFixed(2)}`:`-$${Math.abs(gp).toFixed(2)}`):'—';
  const gpCls=gp>0?'green':gp<0?'red':'';
  const gpColor=gp>0?'var(--green)':gp<0?'var(--red)':'var(--text)';
  const rr=calcRR(t);
  const rrStr=rr!==null?(rr>0?'+':'')+fmtN(rr,2)+'R':'—';
  const rrCls=rr!==null?(rr>0?'green':rr<0?'red':''):'';
  const rrColor=rr!==null?(rr>0?'var(--green)':rr<0?'var(--red)':'var(--text3)'):'var(--text3)';
  const sv=t.stars||(t.confiance?Math.max(1,Math.min(5,Math.round(t.confiance/2))):null);
  const starsHtml=sv?`${'★'.repeat(sv)}<span style="opacity:.2">${'★'.repeat(5-sv)}</span>`:'—';
  const dirStr=t.direction==='Long'?'↑ Long':t.direction==='Short'?'↓ Short':'—';
  const dirColor=t.direction==='Long'?'var(--green)':t.direction==='Short'?'var(--red)':'var(--text3)';
  const structStr=t.structure==='solide'?'✓ Solide':t.structure==='fragile'?'⚠ Fragile':'—';
  const structColor=t.structure==='solide'?'var(--green)':t.structure==='fragile'?'var(--amber)':'var(--text3)';
  const hzStr=t.horsZone?'⚠ Hors zone':'✓ En zone';
  const hzColor=t.horsZone?'var(--amber)':'var(--green)';
  const ac=DB.accounts.find(a=>a.name===t.compte);
  const acDot=ac?`<span style="width:7px;height:7px;border-radius:50%;background:${ac.color};flex-shrink:0;display:inline-block"></span>`:'';
  // ── Detail panel ──
  let det=`<div class="album-kpis">
    <div class="album-kpi ${gpCls}">
      <div class="album-kpi-lbl">P&amp;L Net</div>
      <div class="album-kpi-val" style="color:${gpColor}">${gpStr}</div>
    </div>
    <div class="album-kpi ${rrCls}">
      <div class="album-kpi-lbl">Ratio R:R</div>
      <div class="album-kpi-val" style="color:${rrColor}">${rrStr}</div>
    </div>
    <div class="album-kpi">
      <div class="album-kpi-lbl">Direction</div>
      <div class="album-kpi-val" style="color:${dirColor};font-size:16px">${dirStr}</div>
    </div>
  </div>
  <div class="album-field-grid">
    <div class="album-field"><div class="album-field-lbl">Session</div><div class="album-field-val">${esc(t.session||'—')}</div></div>
    <div class="album-field"><div class="album-field-lbl">Heure</div><div class="album-field-val" style="font-family:'DM Mono',monospace">${t.heure||'—'}</div></div>
    <div class="album-field"><div class="album-field-lbl">Compte</div><div class="album-field-val" style="display:flex;align-items:center;gap:5px">${acDot}${esc(t.compte||'—')}</div></div>
    <div class="album-field"><div class="album-field-lbl">Risque</div><div class="album-field-val" style="font-family:'DM Mono',monospace">${t.montantRisque?'$'+t.montantRisque:'—'}</div></div>
    <div class="album-field"><div class="album-field-lbl">Confiance</div><div class="album-field-val" style="color:#F59E0B;letter-spacing:2px;font-size:13px">${starsHtml}</div></div>
    <div class="album-field"><div class="album-field-lbl">Structure</div><div class="album-field-val" style="color:${structColor}">${structStr}</div></div>
    <div class="album-field"><div class="album-field-lbl">Zone</div><div class="album-field-val" style="color:${hzColor};font-size:11px">${hzStr}</div></div>
    <div class="album-field"><div class="album-field-lbl">État</div><div class="album-field-val">${esc(t.etat||'—')}</div></div>
  </div>`;
  if(t.pourquoiEntrer){det+=`<div class="album-text-block"><div class="album-text-lbl">Pourquoi entrer</div><div class="album-text-content">${esc(t.pourquoiEntrer)}</div></div>`;}
  if(t.douteHesitation){det+=`<div class="album-text-block"><div class="album-text-lbl">Doute / Hésitation</div><div class="album-text-content">${esc(t.douteHesitation)}</div></div>`;}
  if(t.tags&&t.tags.length){
    det+=`<div><div style="font-size:8px;font-weight:700;color:var(--text4);text-transform:uppercase;letter-spacing:.9px;margin-bottom:6px">Tags</div>
    <div style="display:flex;flex-wrap:wrap;gap:4px">${t.tags.map(tag=>`<span style="padding:2px 9px;border-radius:20px;background:var(--accent-bg);border:1px solid var(--accent-bd);color:var(--accent);font-size:11px;font-weight:600">${esc(tag)}</span>`).join('')}</div></div>`;
  }
  // ── Inject ──
  document.getElementById('albumBody').innerHTML=`
    <div class="album-img-panel">
      ${imgHtml}
      ${toggleHtml}
      <button class="album-zoom-close" onclick="albumToggleZoom()">✕ Réduire</button>
    </div>
    <div class="album-detail-panel">${det}</div>`;
}

function albumToggleZoom(){
  const m=document.querySelector('#albumModal .album-modal');
  if(m)m.classList.toggle('img-zoomed');
}
// ── AUTH ───────────────────────────────────────────────────────────────────
async function doLogin(){
  const email=document.getElementById('loginEmail').value.trim();
  const password=document.getElementById('loginPassword').value;
  const btn=document.getElementById('loginBtn');
  const errEl=document.getElementById('loginError');
  errEl.textContent='';
  if(!email||!password){errEl.textContent='Veuillez remplir tous les champs.';return;}
  btn.disabled=true;btn.textContent='Connexion…';
  const{error}=await sb.auth.signInWithPassword({email,password});
  if(error){
    errEl.textContent='Email ou mot de passe incorrect.';
    btn.disabled=false;btn.textContent='Se connecter';
    return;
  }
  // Login OK → hide login screen, load app
  const ls=document.getElementById('loginScreen');
  ls.classList.add('hidden');
  setTimeout(()=>ls.style.display='none',300);
  await loadApp();
}

async function doLogout(){
  await sb.auth.signOut();
  // Show login screen again
  const ls=document.getElementById('loginScreen');
  ls.style.display='flex';
  ls.classList.remove('hidden');
  document.getElementById('loginEmail').value='';
  document.getElementById('loginPassword').value='';
  document.getElementById('loginError').textContent='';
  document.getElementById('loginBtn').disabled=false;
  document.getElementById('loginBtn').textContent='Se connecter';
}

// ── INIT ──────────────────────────────────────────────────────────────────
async function loadApp(){
  const w=getWeekRange();
  jFilters.dateFrom=w.from;
  jFilters.dateTo=w.to;
  try{
    const[trades,accounts,cashflow,tags]=await Promise.all([sbLoadTrades(),sbLoadAccounts(),sbLoadCashflow(),sbLoadTags()]);
    if(trades&&trades.length>0)DB.trades=trades;
    if(accounts&&accounts.length>0){DB.accounts=accounts.map(a=>({id:String(a.id),name:a.name,startCapital:a.start_capital,color:a.color}));}
    if(cashflow&&cashflow.length>0){DB.cashflow=cashflow.map(c=>({id:c.id,type:c.type,date:c.date,compte:c.compte,montantUSD:c.montant_usd,montantMUR:c.montant_mur,taux:c.taux,note:c.note}));}
    if(tags&&tags.length>0)DB.tags=tags;
    saveDB();
  }catch(e){
    console.error('Init error:',e);
    document.getElementById('syncDot').className='sync-dot err';
    document.getElementById('syncLbl').textContent='Mode local';
    toast('Supabase indisponible — mode local','error');
  }
  hideLoadingScreen();
  showPage('dashboard');
}

function startLoadingCycle(){
  const msgs=['Connexion à Supabase…','Synchronisation des trades…','Chargement du dashboard…','Presque prêt…'];
  const el=document.getElementById('lsStatus');if(!el)return;
  let i=0;
  window._lsCycleTm=setInterval(()=>{
    i=(i+1)%msgs.length;
    if(!el)return;
    el.classList.add('fading');
    setTimeout(()=>{if(el){el.textContent=msgs[i];el.classList.remove('fading');}},175);
  },1400);
}
function hideLoadingScreen(){
  clearInterval(window._lsCycleTm);
  const loading=document.getElementById('loadingScreen');
  if(loading){loading.classList.add('hidden');setTimeout(()=>loading.remove(),700);}
}
async function init(){
  startLoadingCycle();
  // Vider le cache IA si le prompt a changé de version
  const AI_PROMPT_VER='v2';
  const cached=JSON.parse(localStorage.getItem(AI_CACHE_KEY)||'null');
  if(cached&&cached.promptVer!==AI_PROMPT_VER)localStorage.removeItem(AI_CACHE_KEY);
  applySidebarLight();
  applySidebarCollapsed();
  // Check if already logged in (existing session)
  const{data:{session}}=await sb.auth.getSession();
  if(session){
    // Session active → hide login, load app directly
    const ls=document.getElementById('loginScreen');
    ls.classList.add('hidden');
    setTimeout(()=>ls.style.display='none',300);
    await loadApp();
  } else {
    // No session → show login, hide loading
    hideLoadingScreen();
  }
}
// iOS standalone PWA : le backdrop-filter du header peut intercepter les
// touch events sur le bouton hamburger. On force un listener touchend.
(function(){
  const btn=document.getElementById('hamburger');
  if(btn)btn.addEventListener('touchend',function(e){
    e.preventDefault(); // empêche le click fantôme iOS 300ms
    toggleSidebar();
  },{passive:false});
})();

let _resizeTm;
window.addEventListener('resize',()=>{
  clearTimeout(_resizeTm);
  _resizeTm=setTimeout(()=>{
    if(curPage==='dashboard')renderDash();
    else if(curPage==='journal')renderJournal();
    else if(curPage==='cashflow')renderCashflow();
    else if(curPage==='calendar')renderCal();
  },150);
});
init();