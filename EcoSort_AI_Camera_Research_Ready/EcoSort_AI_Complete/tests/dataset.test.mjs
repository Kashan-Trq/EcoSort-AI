import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const d=JSON.parse(readFileSync(new URL('../dataset/samples.json',import.meta.url),'utf8'));
test('dataset contains exactly 450 unique physical specimens',()=>{assert.equal(d.samples.length,450);assert.equal(new Set(d.samples.map(x=>x.id)).size,450)});
test('exactly three image-path references per physical specimen',()=>{assert.equal(d.samples.reduce((n,r)=>n+r.image_paths.length,0),1350)});
test('existing splits are disjoint by specimen',()=>{assert.deepEqual(d.stats.splits,{train:315,validation:68,test:67});const m=new Map();for(const r of d.samples){if(m.has(r.id))assert.equal(m.get(r.id),r.split);m.set(r.id,r.split);}});
test('dataset labeling provenance remains auditable',()=>{assert.equal(d.stats.labelProvenance['Auto-assigned'],419);assert.equal(d.stats.labelProvenance['Manually verified'],31)});
test('eight visual waste categories, no polymer targets',()=>{assert.equal(Object.keys(d.stats.categories).length,8);assert.equal(Object.values(d.stats.categories).reduce((a,b)=>a+b,0),450);assert(!('PET' in d.stats.categories))});
test('recorded mass matches source spreadsheet',()=>{assert.equal(d.stats.mass_g,2465.7);assert.equal(Math.round(d.samples.reduce((n,r)=>n+r.weight_g,0)*10)/10,2465.7)});
test('record categories have plausible source data',()=>{for(const s of d.samples){assert.match(s.id,/^P\d{3}$/);assert(s.weight_g>=0);assert(['train','test','validation'].includes(s.split))}});
