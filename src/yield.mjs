/**
 * EcoSort evidence-linked conditional industrial pyrolysis research estimates.
 * Selected internally mass-balanced examples reported in Table 3:
 * Kabeyi & Olanrewaju (2023), Journal of Energy, doi:10.1155/2023/1821129.
 * These are HISTORICAL EXPERIMENTAL SCENARIOS, not predictions or home instructions.
 */
export const YIELD_SOURCE = {
  title:'Review and Design Overview of Plastic Waste-to-Pyrolysis Oil Conversion with Implications on the Energy Transition',
  authors:'Kabeyi & Olanrewaju',year:2023,
  url:'https://doi.org/10.1155/2023/1821129',detail:'Table 3, literature-reported pyrolysis experiments'
};
export const CONTEXT_SOURCE={
  title:'Plastic waste as pyrolysis feedstock for plastic oil production: A review',
  url:'https://doi.org/10.1016/j.scitotenv.2023.162719',
  detail:'Review distinguishing polyolefins/PS from PET/PVC'
};
// All three fractions are mass percentages. Values are as reported by the review,
// not normalized or interpolated, and are preserved only when their sum is ~100.
export const SCENARIOS={
 '2':[
  {id:'hdpe-batch450',name:'Batch reactor example',temperature:450,oil:74.5,gas:5.8,residue:19.7,context:'Batch reactor; reported 60 min; process details differ across studies.'},
  {id:'hdpe-fluid500',name:'Fluidized-bed example',temperature:500,oil:85,gas:10,residue:5,context:'Fluidized-bed; reported 60 min; separate published study.'}
 ],
 '4':[
  {id:'ldpe-batch425',name:'Pressurized-batch example',temperature:425,oil:89.5,gas:10,residue:0.5,context:'Pressurized-batch conditions in cited study; not generalizable to household equipment.'},
  {id:'ldpe-atm500',name:'Atmospheric example',temperature:500,oil:80.4,gas:19.43,residue:0.16,context:'Atmospheric conditions as summarized by review; total 99.99% after rounding.'}
 ],
 '5':[
  {id:'pp-atm500',name:'Atmospheric example',temperature:500,oil:82.12,gas:17.76,residue:0.12,context:'Atmospheric study; reactor conditions specific to source.'},
  {id:'pp-batch740',name:'Batch example',temperature:740,oil:48.8,gas:49.6,residue:1.6,context:'Separate batch study; higher temperature produced different distribution.'}
 ],
 '6':[
  {id:'ps-pressure425',name:'Pressurized-batch example',temperature:425,oil:97,gas:2.5,residue:0.5,context:'Pressurized-batch study; high liquid fraction not a guaranteed fuel yield.'},
  {id:'ps-batch581',name:'Batch example',temperature:581,oil:89.5,gas:9.9,residue:0.6,context:'Separate published batch example; liquid contains chemical products, not automatically ready-to-use fuel.'}
 ]
};
export const POLYMERS={'1':'PET / PETE','2':'HDPE','3':'PVC','4':'LDPE','5':'PP','6':'PS','7':'Other / mixed'};
const SAFE_MASS=10_000_000;
export function getScenarios(resinCode){return SCENARIOS[String(resinCode)]||[];}
export function estimateYield({resinCode,weightGrams,scenarioId,confirmed=false,condition='clean'}={}){
 const code=String(resinCode||''); const weight=Number(weightGrams);
 const blocked=['3','7','1'].includes(code);
 if(!confirmed) return {ok:false,reason:'Confirm the actual resin marking or laboratory-verified polymer before calculating yield.'};
 if(blocked) return {ok:false,reason:code==='3'?'PVC: do not generate a pyrolysis-oil estimate for chlorinated plastic.':code==='1'?'PET: recycling/chemical-recovery routes take priority; generic oil-yield estimates are unsuitable.':'Other/multilayer plastic: no defensible single-polymer yield estimate.'};
 if(['oily','chemical','medical','hazardous','unknown contents','food-contaminated','dirty'].some(x=>String(condition).toLowerCase().includes(x)))return {ok:false,reason:'Contamination or hazardous contents make pure-polymer literature yields inapplicable. Specialist evaluation required.'};
 if(!Number.isFinite(weight)||weight<=0||weight>SAFE_MASS) return {ok:false,reason:'Enter a valid measured plastic mass in grams.'};
 const scenarios=getScenarios(code);if(!scenarios.length)return {ok:false,reason:'No applicable verified pure-polymer example in the reference database.'};
 const s=scenarios.find(x=>x.id===scenarioId)||scenarios[0];
 return {ok:true,code,weightGrams:weight,scenario:s,liquid_g:weight*s.oil/100,gas_g:weight*s.gas/100,residue_g:weight*s.residue/100,source:YIELD_SOURCE,
  warning:'Literature demonstration only. Not a predictive model, measured product performance, fuel-quality certification, or permission to conduct pyrolysis. Depends on feedstock purity and specialized industrial conditions.'};
}
export function extractResinCandidates(ocrText){
 const text=String(ocrText||'').toUpperCase();const candidates=[];let m;
 const labeled=/\b(?:PETE?|HDPE|LDPE|PVC|PP|PS|OTHER)\b|\bRESIN\s*(?:CODE)?\s*#?\s*[1-7]\b|\b(?:RIC|PLASTIC)\s*#?\s*[1-7]\b/g;
 const map={PET:'1',PETE:'1',HDPE:'2',PVC:'3',LDPE:'4',PP:'5',PS:'6',OTHER:'7'};
 while((m=labeled.exec(text))!==null){let c=map[m[0]];if(!c){let match=m[0].match(/[1-7]/);c=match?.[0];}if(c&&!candidates.includes(c))candidates.push(c);}
 // Bare digits are deliberately ignored: dates, prices and batch codes can resemble resin numbers.
 return candidates;
}
export const YIELD_EXPLANATION='Oil/liquid is a condensable mixture (which may include wax and monomers), not verified diesel or petrol. Yields are fractions of polymer feed mass, not liters. The scenarios are from different published apparatuses and cannot be combined into one physical process.';
