// Transparent routing guidance; resin codes are user-asserted until verified physically.
export const RESINS = {
  '1': {name:'PET / PETE',symbol:'PET',route:'recycle',why:'Commonly mechanically recycled where accepted and sufficiently clean.',thermal:'Low priority; prefer mechanical recycling.',risk:'Check that the marking belongs to this item.'},
  '2': {name:'High-density polyethylene',symbol:'HDPE',route:'recycle',why:'Often has established recycling value when clean and sorted.',thermal:'Research-only: potentially suitable in specialized controlled facilities.',risk:'Containers may retain chemicals or other residues.'},
  '3': {name:'Polyvinyl chloride',symbol:'PVC',route:'specialist',why:'Chlorinated polymer; do not mix into ordinary thermal-conversion feedstock.',thermal:'Avoid in thermal-conversion screening due to chlorine and additives.',risk:'Specialist sorting and local disposal guidance required.'},
  '4': {name:'Low-density polyethylene',symbol:'LDPE',route:'check',why:'Flexible films may be collected separately; local recycling routes vary.',thermal:'Research-only: sometimes evaluated in controlled industrial systems.',risk:'Films may be multilayer or mixed polymers.'},
  '5': {name:'Polypropylene',symbol:'PP',route:'recycle',why:'Mechanical recovery can be appropriate where local PP collection exists.',thermal:'Research-only: candidate for controlled specialist processing.',risk:'Additives, residues and end-use affect suitability.'},
  '6': {name:'Polystyrene',symbol:'PS',route:'check',why:'Recycling access is inconsistent, especially for contaminated foam.',thermal:'Research-only: requires controlled facility and feedstock validation.',risk:'Styrene-related hazards require professional processes.'},
  '7': {name:'Other / mixed',symbol:'Other',route:'manual',why:'Code 7 does not identify a single polymer. Composition must be verified.',thermal:'Not established; no thermal recommendation.',risk:'May be multilayer, blended or contain additives.'}
};
export const ROUTES={recycle:'Check local recycling',check:'Check specialist collection',specialist:'Specialist handling',manual:'Manual material verification'};
export function assess({resinCode='unknown',condition='unknown',resinEvidence='claimed',confidence=null}={}) {
 const code=String(resinCode).trim().replace('#','');
 const r=RESINS[code];const cond=String(condition).toLowerCase();
 const materialKnown=Boolean(r);
 let route=materialKnown?r.route:'manual';
 let notes=[];
 if(!materialKnown) notes.push('A photograph or item shape cannot confirm the plastic polymer. Look for a resin code or use a verified test.');
 else notes.push(r.why);
 const unsafe=['chemical','oily','hazardous','unknown contents','medical'].some(x=>cond.includes(x));
 const dirty=['food','dirty','contaminated','wet'].some(x=>cond.includes(x));
 if(unsafe){route='specialist';notes.push('Potentially hazardous residue: do not handle as ordinary household recycling or burn.');}
 else if(dirty && route==='recycle'){route='check';notes.push('Contamination may prevent recycling. Check facility acceptance and safe cleaning requirements.');}
 if(confidence!==null && Number(confidence)<0.65){route='manual';notes.push('Model confidence is insufficient for an automated routing decision.');}
 if(resinEvidence==='image-only'){route='manual';notes.push('Visual category predictions cannot confirm polymer chemistry.');}
 if(resinEvidence==='claimed'&&materialKnown){notes.push('Resin code is user-entered and has not been independently verified.');}
 return {route,label:ROUTES[route],polymer:materialKnown?r.name:'Not verified',code:materialKnown?code:null,
  notes,thermal:materialKnown?r.thermal:'Unknown material: no thermal screening recommendation.',
  risk:materialKnown?r.risk:'Mixed-material and contamination uncertainty.',
  verified:resinEvidence==='verified'&&materialKnown&&!unsafe};
}
export function confidenceBand(prob){if(prob===null||!Number.isFinite(prob))return 'Unavailable';if(prob>=.85)return 'Higher model score';if(prob>=.65)return 'Moderate model score';return 'Low model score';}
export function aggregate(samples){let byCategory={},bySplit={},byProvenance={},mass=0;for(const r of samples){byCategory[r.category]=(byCategory[r.category]||0)+1;bySplit[r.split]=(bySplit[r.split]||0)+1;byProvenance[r.label_provenance]=(byProvenance[r.label_provenance]||0)+1;mass+=Number(r.weight_g)||0;}return{n:samples.length,mass_g:Math.round(mass*100)/100,byCategory,bySplit,byProvenance};}
export function csvEncode(rows,columns){return [columns.join(','),...rows.map(row=>columns.map(c=>'"'+String(row[c]??'').replaceAll('"','""')+'"').join(','))].join('\r\n');}
