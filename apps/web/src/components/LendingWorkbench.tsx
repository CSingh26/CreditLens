'use client';

import { useState, type FormEvent } from 'react';
import { analyze, type LendingResult, type CohortResult } from '@/lib/analysis';

const money = (n: number) => n.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
const pct = (n: number | null) => n === null ? 'Undefined' : `${(100*n).toFixed(1)}%`;
const demo = {
  source: 'DEMO DATA — four invented observations for arithmetic verification',
  observation_period: 'Illustrative one-year cohort; no real borrowers', horizon_months: 12,
  rows: [.1,.4,.6,.9].map((pd,i) => ({id: `demo-${i+1}`, pd, defaulted: i%2, ead: 10000, lgd: .4})),
};
const initial = { pd: '10', lgd: '40', ead: '10000', annual_rate: '12', funding_rate: '4', operating_cost: '100',
  pd_multiplier: '1.5', lgd_stress: '10', rate_shock: '2', monthly_income: '5000', monthly_debt: '1000', credit_balance: '5000', credit_limit: '10000' };
const fields: {key: keyof typeof initial; label: string; max?: number; min?: number}[] = [
  {key:'pd',label:'Annual PD (%)',max:100}, {key:'lgd',label:'LGD (%)',max:100},
  {key:'ead',label:'Exposure at default',min:.01}, {key:'annual_rate',label:'Annual coupon (%)',max:100},
  {key:'funding_rate',label:'Annual funding cost (%)',max:100}, {key:'operating_cost',label:'Annual operating cost'},
  {key:'monthly_income',label:'Monthly gross income',min:.01}, {key:'monthly_debt',label:'Existing monthly debt payments'},
  {key:'credit_balance',label:'Revolving balance'}, {key:'credit_limit',label:'Revolving credit limit',min:.01},
  {key:'pd_multiplier',label:'Stress PD multiplier',max:10}, {key:'lgd_stress',label:'Stress LGD increase (pp)',max:100},
  {key:'rate_shock',label:'Coupon + funding shock (pp)',max:100},
];
const inputStyle = 'mt-1 w-full rounded-lg border border-[var(--border)] bg-white p-2 text-sm';
const panel = 'rounded-xl border border-[var(--border)] bg-white p-5 shadow-sm';

export function LendingWorkbench() {
  const [values,setValues] = useState(initial);
  const [lending,setLending] = useState<LendingResult | null>(null);
  const [cohort,setCohort] = useState<CohortResult | null>(null);
  const [json,setJson] = useState(JSON.stringify(demo,null,2));
  const [threshold,setThreshold] = useState('50');
  const [error,setError] = useState('');
  const [busy,setBusy] = useState(false);
  const [dirty,setDirty] = useState(false);
  const getTerms = () => Object.fromEntries(Object.entries(values).map(([k,v]) => [k, Number(v) / (['pd','lgd','annual_rate','funding_rate','lgd_stress','rate_shock'].includes(k) ? 100 : 1)]));
  async function lendingSubmit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setLending(null);
    try { setLending(await analyze<LendingResult>('lending',getTerms())); setDirty(false); }
    catch(e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  async function cohortSubmit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setCohort(null);
    try {
      let input; try { input = JSON.parse(json); } catch { throw new Error('Invalid cohort JSON. Use the documented row schema.'); }
      const terms = getTerms();
      setCohort(await analyze<CohortResult>('cohort',{...input, threshold:Number(threshold)/100,
        annual_rate:terms.annual_rate,funding_rate:terms.funding_rate,operating_cost:terms.operating_cost}));
    } catch(e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  return <div className="space-y-6">
    <div><p className="text-xs font-semibold uppercase tracking-widest text-teal-700">Lending economics · 12-month horizon</p>
      <h1 className="mt-2 text-3xl font-semibold">What does this risk cost?</h1>
      <p className="mt-2 max-w-3xl text-sm text-slate-600">Connect default probability to loss and pricing. Explore assumptions and evaluate evidence before interpreting a risk score.</p>
    </div>
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">DEMO DATA initializes the controls. Replace it with your assumptions. Annual PD is supplied by you; it is not the historical UCI model’s next-month prediction. This is research, not an approval recommendation.</div>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-800">{error}</p>}
    <form onSubmit={lendingSubmit} className={panel}>
      <h2 className="text-xl font-semibold">Borrower & loan assumptions</h2>
      <p className="mt-1 text-sm text-slate-500">All monetary inputs use one consistent currency. Interest-only exposure stays constant for one year; income excludes the new loan’s payment.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{fields.map(f => <label key={f.key} className="text-xs font-medium">{f.label}
        <input disabled={busy} className={inputStyle} type="number" required min={f.min ?? 0} max={f.max ?? 1e12} step="any" value={values[f.key]} onChange={e=>{setValues({...values,[f.key]:e.target.value});setDirty(true);setCohort(null);}} />
      </label>)}</div>
      <button disabled={busy} className="mt-5 rounded-lg bg-teal-700 px-5 py-2 font-medium text-white disabled:opacity-50">{busy ? 'Calculating…' : 'Analyze lending'}</button>
      {dirty && lending && <span className="ml-3 text-sm text-amber-800">Inputs changed. Recalculate to update results.</span>}
    </form>
    {lending && <section aria-label="Lending results" className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className={panel}><p className="text-sm text-slate-500">Expected loss · currency units</p><p data-testid="expected-loss" className="mt-2 text-3xl font-semibold">{money(lending.expected_loss)}</p><p className="mt-2 text-xs">PD × LGD × EAD; an expectation across outcomes.</p></div>
        <div className={panel}><p className="text-sm text-slate-500">Expected annual contribution</p><p className="mt-2 text-3xl font-semibold">{money(lending.expected_contribution)}</p><p className="mt-2 text-xs">Survival-weighted interest less losses and costs.</p></div>
        <div className={panel}><p className="text-sm text-slate-500">Break-even annual coupon</p><p className="mt-2 text-3xl font-semibold">{pct(lending.break_even_rate)}</p><p className="mt-2 text-xs">No capital charge, taxes or discounting. At PD=100%, no finite coupon breaks even.</p></div>
      </div>
      <div className={panel}><h2 className="text-xl font-semibold">What changes under stress?</h2><div className="overflow-x-auto"><table className="mt-4 w-full text-left text-sm"><thead><tr><th>Annual currency units</th><th>Base</th><th>Stress</th></tr></thead><tbody>{([
        ['Expected loss','expected_loss'],['Expected interest','expected_interest'],['Funding cost','funding_cost'],['Operating cost','operating_cost'],['Expected contribution','expected_contribution']
      ] as const).map(([label,key])=><tr key={key} className="border-t border-slate-100"><td className="py-2">{label}</td><td>{money(lending[key])}</td><td>{money(lending.stress[key])}</td></tr>)}</tbody></table></div>
        <p className="mt-4 text-sm">Debt-to-income: {pct(lending.debt_to_income)} · Utilization: {pct(lending.credit_utilization)} · Monthly income after existing debt and new interest: {lending.monthly_cash_after_debt_and_interest === null ? 'Unavailable' : money(lending.monthly_cash_after_debt_and_interest)}</p>
        <p className="mt-2 text-xs text-slate-500">Residual income excludes living costs and taxes. Stress is a chosen scenario, not a statistical forecast.</p>
        <details className="mt-4 text-sm"><summary className="cursor-pointer font-medium">Explain the calculation</summary><ul className="mt-2 list-disc space-y-1 pl-5">{lending.explanations.map(e=><li key={e}>{e}</li>)}</ul></details>
      </div>
    </section>}
    <form onSubmit={cohortSubmit} className={panel}>
      <h2 className="text-xl font-semibold">Does calibration change lending economics?</h2>
      <p className="mt-2 text-sm text-slate-600">Import a labeled one-year cohort. Each row requires id, pd (decimal), defaulted (0/1), ead and lgd (decimal). Probabilities must have been estimated before the outcomes. Coupon, funding and cost use the current controls above.</p>
      <label className="mt-4 block text-sm">Import cohort JSON file<input disabled={busy} type="file" accept=".json,application/json" className="ml-3" onChange={async e=>{const file=e.target.files?.[0];if(file){if(file.size>900000){setError('File exceeds 900 KB');return;}setJson(await file.text());setCohort(null);}}}/></label>
      <label className="mt-4 block text-sm">Cohort JSON<textarea aria-label="Cohort JSON" disabled={busy} className={`${inputStyle} font-mono`} rows={7} value={json} onChange={e=>{setJson(e.target.value);setCohort(null);}}/></label>
      <label className="mt-3 block max-w-xs text-sm">Default flag threshold (%)<input disabled={busy} className={inputStyle} required type="number" min="0" max="100" step="1" value={threshold} onChange={e=>{setThreshold(e.target.value);setCohort(null);}}/></label>
      <p className="mt-2 text-xs text-slate-500">PD ≥ threshold flags default risk; PD below it is treated as approved for this scenario. This does not define a lending policy.</p>
      <button disabled={busy} className="mt-4 rounded-lg bg-teal-700 px-5 py-2 font-medium text-white disabled:opacity-50">Evaluate cohort</button>
    </form>
    {cohort && <section aria-label="Cohort results" className={panel}>
      <h2 className="text-xl font-semibold">Evidence & threshold trade-offs</h2><p className="mt-1 text-sm text-slate-500">{cohort.source} · {cohort.observation_period} · {cohort.count} observations</p>
      <div className="my-4 grid gap-3 sm:grid-cols-3"><p>Approved: <strong data-testid="approved-count">{cohort.approved_count}</strong></p><p>Brier score: <strong>{cohort.brier_score.toFixed(4)}</strong></p><p>Cohort-rate baseline: <strong>{cohort.baseline_brier_score.toFixed(4)}</strong></p></div>
      <p className="text-sm">Lower Brier is better. The constant-rate baseline uses this cohort’s realized prevalence; it is a descriptive benchmark, not a trained forecast.</p>
      <div className="my-4 grid gap-3 sm:grid-cols-4">{Object.entries(cohort.confusion).map(([key,n])=><div key={key} className="rounded-lg bg-slate-50 p-3"><strong>{key.toUpperCase()}: {n}</strong><p className="text-xs">{({tn:'Approved, repaid',fp:'Flagged, repaid',fn:'Approved, defaulted',tp:'Flagged, defaulted'} as Record<string,string>)[key]}</p></div>)}</div>
      <p className="text-sm">Precision: {pct(cohort.precision)} · Recall: {pct(cohort.recall)} · Approved expected loss: {money(cohort.expected_approved_loss)} · Scenario realized contribution: {money(cohort.realized_approved_contribution)}</p>
      <h3 className="mt-6 font-semibold">Calibration by forecast probability band</h3><p className="text-xs text-slate-500">Count matters: sparse bins are noisy. Empty bins are omitted below.</p>
      <div className="overflow-x-auto"><table className="mt-3 w-full text-left text-sm"><thead><tr><th>PD band</th><th>Count</th><th>Mean forecast</th><th>Observed default rate</th></tr></thead><tbody>{cohort.calibration.filter(b=>b.count).map(b=><tr key={b.lower} className="border-t"><td className="py-2">{pct(b.lower)}–{pct(b.upper)}</td><td>{b.count}</td><td>{pct(b.mean_pd)}</td><td><div className="flex items-center gap-2"><span className="inline-block h-2 bg-teal-600" style={{width:`${(b.default_rate ?? 0)*100}px`}}/>{pct(b.default_rate)}</div></td></tr>)}</tbody></table></div>
      <h3 className="mt-6 font-semibold">Threshold sensitivity · annual currency units</h3><div className="overflow-x-auto"><table className="mt-3 w-full text-left text-sm"><thead><tr><th>Flag threshold</th><th>Approved</th><th>Expected contribution</th><th>Scenario realized contribution</th></tr></thead><tbody>{cohort.threshold_sweep.map(r=><tr key={r.threshold} className="border-t"><td className="py-2">{pct(r.threshold)}</td><td>{r.approved_count}</td><td>{money(r.expected_approved_contribution)}</td><td>{money(r.realized_approved_contribution)}</td></tr>)}</tbody></table></div>
      <p className="mt-4 text-sm text-amber-900">{cohort.limitations}</p>
    </section>}
  </div>;
}
