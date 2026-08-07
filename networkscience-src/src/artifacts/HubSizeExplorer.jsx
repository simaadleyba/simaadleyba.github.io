import { useMemo, useState } from 'react';
import { ComposedChart, Line, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const GAMMAS = [2.1, 2.5, 3, 4, 5];
const REAL = [{name:'WWW',n:2e8,k:1e6},{name:'Internet',n:1.1e4,k:2400},{name:'Actors',n:4.5e5,k:2258},{name:'Metabolic',n:778,k:110}];

export default function HubSizeExplorer() {
  const [gamma, setGamma] = useState(2.5), [kmin, setKmin] = useState(1), [logN, setLogN] = useState(6);
  const curves = useMemo(() => Array.from({ length: 29 }, (_, i) => 2 + i / 4).map(x => {
    const row = { x };
    GAMMAS.forEach(g => { row[`g${g}`] = Math.log10(kmin * 10 ** (x / (g - 1))); });
    return row;
  }), [kmin]);
  const moments = useMemo(() => Array.from({ length: 40 }, (_, i) => 1 + i * 3).map(K => {
    const out = { x: Math.log10(K) };
    [1,2,3].forEach(m => { let s=0,z=0; for(let k=kmin;k<=K;k++){z+=k**-gamma;s+=k**(m-gamma);} out[`m${m}`]=z?Math.log10(s/z):0; });
    return out;
  }), [gamma,kmin]);
  const kmax = kmin * 10 ** (logN / (gamma - 1));
  const need = (1000 / kmin) ** (gamma - 1);
  return <div>
    <div style={{display:'flex',flexWrap:'wrap',gap:'1rem',marginBottom:'1rem'}}>
      {[['γ',gamma,2,6,.1,setGamma],['k_min',kmin,1,10,1,setKmin],['log₁₀ N',logN,2,9,.1,setLogN]].map(([name,v,min,max,step,set],i)=><div key={i} style={{flex:'1 1 180px'}}><label style={{fontSize:'.8rem',color:'var(--muted)'}}>{name} = {v}</label><input type="range" min={min} max={max} step={step} value={v} onChange={e=>set(+e.target.value)} style={{width:'100%',accentColor:'var(--accent)'}}/></div>)}
    </div>
    <div style={{display:'flex',gap:'.7rem',flexWrap:'wrap',marginBottom:'1rem'}}>{[
      ['k_max',kmax.toExponential(2)],['⟨k⟩',gamma>2?'finite':'∞'],['⟨k²⟩',gamma>3?'finite':'∞'],['N for 3 decades',need.toExponential(2)]
    ].map(([a,b])=><div key={a} style={{flex:'1 1 130px',padding:'.7rem',background:'var(--accent-bg)',border:'1px solid var(--border)',borderRadius:'8px'}}><small style={{color:'var(--muted)'}}>{a}</small><div style={{fontFamily:'monospace',color:a.startsWith('N ')&&need>1e9?'#c1121f':'var(--text)'}}>{b}</div></div>)}</div>
    <ResponsiveContainer width="100%" height={230}><ComposedChart data={curves}><XAxis dataKey="x" type="number" tick={{fontSize:10}} label={{value:'log₁₀ N',position:'insideBottomRight',fontSize:10}}/><YAxis tick={{fontSize:10}} label={{value:'log₁₀ k_max',angle:-90,position:'insideLeft',fontSize:10}}/><Tooltip contentStyle={{fontSize:'.75rem'}}/>{GAMMAS.map(g=><Line key={g} dataKey={`g${g}`} dot={false} stroke={Math.abs(g-gamma)<.11?'#245cff':'#aebfff'} strokeWidth={Math.abs(g-gamma)<.11?3:1} name={`γ=${g}`}/>) }<Scatter data={REAL.map(d=>({x:Math.log10(d.n),real:Math.log10(d.k),name:d.name}))} dataKey="real" fill="#c1121f" name="real networks"/></ComposedChart></ResponsiveContainer>
    <h5 style={{marginBottom:'.2rem'}}>Partial moments as the cutoff K grows</h5><ResponsiveContainer width="100%" height={170}><ComposedChart data={moments}><XAxis dataKey="x" tick={{fontSize:10}}/><YAxis tick={{fontSize:10}}/><Tooltip contentStyle={{fontSize:'.75rem'}}/><Line dataKey="m1" stroke="#4a90d9" dot={false}/><Line dataKey="m2" stroke="#e85d04" dot={false}/><Line dataKey="m3" stroke="#7b2cbf" dot={false}/></ComposedChart></ResponsiveContainer>
  </div>;
}
