import { useMemo, useState } from 'react';
import { ComposedChart, Scatter, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { mulberry32, samplePowerLaw } from '../utils/random';
import { ccdf, hillEstimator, logBin, olsFit } from '../utils/fit';

function fitRepresentation(values, mode, xmin) {
  const tail=values.filter(v=>v>=xmin); let pts=[];
  if(mode==='log') pts=logBin(tail,2);
  else if(mode==='ccdf') pts=ccdf(tail).filter((_,i)=>i%Math.max(1,Math.floor(tail.length/250))===0);
  else {const bins=new Map();tail.forEach(v=>{const k=Math.floor(v);bins.set(k,(bins.get(k)||0)+1)});pts=[...bins].map(([x,c])=>({x,y:c/tail.length}));}
  const clean=pts.filter(p=>p.x>0&&p.y>0), f=olsFit(clean.map(p=>Math.log10(p.x)),clean.map(p=>Math.log10(p.y)));
  return {points:clean.map(p=>({x:Math.log10(p.x),y:Math.log10(p.y)})),alpha:mode==='ccdf'?1-f.slope:-f.slope,fit:f};
}
export default function PowerLawFittingLab(){
  const [n,setN]=useState(3000),[alpha,setAlpha]=useState(2.5),[xmin,setXmin]=useState(1),[mode,setMode]=useState('mle'),[seed,setSeed]=useState(8),[compare,setCompare]=useState(false);
  const result=useMemo(()=>{const rng=mulberry32(seed),values=Array.from({length:n},()=>samplePowerLaw(rng,alpha,1));const reps={linear:fitRepresentation(values,'linear',xmin),log:fitRepresentation(values,'log',xmin),ccdf:fitRepresentation(values,'ccdf',xmin)};const mle=hillEstimator(values,xmin);return{values,reps,all:[{name:'Linear',error:Math.abs(reps.linear.alpha-alpha)},{name:'Log bin',error:Math.abs(reps.log.alpha-alpha)},{name:'CCDF',error:Math.abs(reps.ccdf.alpha-alpha)},{name:'MLE',error:Math.abs(mle-alpha)}],mle};},[n,alpha,xmin,seed]);
  const current=mode==='mle'?result.reps.ccdf:result.reps[mode],fitted=mode==='mle'?result.mle:current.alpha,error=Math.abs(fitted-alpha);
  const btn=a=>({padding:'.25rem .55rem',border:`1px solid ${mode===a?'var(--accent)':'var(--border)'}`,background:mode===a?'var(--accent)':'var(--bg)',color:mode===a?'white':'var(--muted)',borderRadius:'5px'});
  return <div><div style={{display:'flex',flexWrap:'wrap',gap:'1rem'}}>{[['n',n,200,20000,200,setN],['true α',alpha,1.8,3.5,.1,setAlpha],['x_min',xmin,1,20,1,setXmin]].map(([a,v,min,max,step,set])=><div key={a} style={{flex:'1 1 170px'}}><label style={{fontSize:'.8rem',color:'var(--muted)'}}>{a} = {v}</label><input type="range" min={min} max={max} step={step} value={v} onChange={e=>set(+e.target.value)} style={{width:'100%',accentColor:'var(--accent)'}}/></div>)}<button onClick={()=>setSeed(s=>s+1)} style={{alignSelf:'end',padding:'.45rem 1rem',background:'var(--accent)',color:'white',border:0,borderRadius:'6px'}}>New sample</button></div><div style={{display:'flex',gap:'.35rem',flexWrap:'wrap',margin:'.8rem 0'}}>{[['linear','Linear bins'],['log','Log bins'],['ccdf','CCDF'],['mle','MLE (Hill)']].map(([a,b])=><button key={a} onClick={()=>setMode(a)} style={btn(a)}>{b}</button>)}</div>
  <div style={{padding:'.55rem',border:`1px solid ${error<.05?'#2d6a4f':error<.2?'#e85d04':'#c1121f'}`,background:'var(--accent-bg)',marginBottom:'.6rem'}}>true α <b>{alpha.toFixed(2)}</b> · fitted α <b>{fitted.toFixed(3)}</b> · error <b>{error.toFixed(3)}</b></div>
  <ResponsiveContainer width="100%" height={220}><ComposedChart data={current.points}><XAxis dataKey="x" type="number" tick={{fontSize:10}}/><YAxis dataKey="y" type="number" tick={{fontSize:10}}/><Tooltip contentStyle={{fontSize:'.75rem'}}/><Scatter dataKey="y" fill="#245cff"/><Line data={current.points.map(p=>({x:p.x,y:(current.fit?.intercept||0)+(current.fit?.slope||-alpha)*p.x}))} dataKey="y" dot={false} stroke="#c1121f"/></ComposedChart></ResponsiveContainer>
  <button onClick={()=>setCompare(v=>!v)} style={{padding:'.35rem .7rem',background:'var(--bg)',border:'1px solid var(--border)'}}>Compare all four</button>{compare&&<ResponsiveContainer width="100%" height={150}><BarChart data={result.all}><XAxis dataKey="name" tick={{fontSize:10}}/><YAxis tick={{fontSize:10}}/><Tooltip/><Bar dataKey="error" fill="#e85d04"/></BarChart></ResponsiveContainer>}</div>;
}
