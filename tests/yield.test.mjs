import test from 'node:test';import assert from 'node:assert/strict';
import {SCENARIOS,estimateYield,extractResinCandidates,getScenarios,POLYMERS} from '../src/yield.mjs';
test('all published scenarios have plausible mass balance',()=>{for(const [code,rows] of Object.entries(SCENARIOS)){assert.ok(['2','4','5','6'].includes(code));for(const x of rows){assert.ok(Math.abs(x.oil+x.gas+x.residue-100)<0.03,`${x.id} must be mass balanced`);assert.ok([x.oil,x.gas,x.residue].every(n=>n>=0&&n<=100));}}});
test('can calculate one internally consistent research scenario',()=>{const x=estimateYield({resinCode:'5',weightGrams:25,confirmed:true,scenarioId:'pp-atm500'});assert.equal(x.ok,true);assert.ok(Math.abs(x.liquid_g-20.53)<1e-9);assert.ok(Math.abs(x.gas_g-4.44)<1e-9);assert.ok(Math.abs(x.residue_g-.03)<1e-9);});
test('no percentage without chemical evidence',()=>{assert.equal(estimateYield({resinCode:'2',weightGrams:100,confirmed:false}).ok,false);});
test('PVC/PET/Other/unknown must not yield industrial oil estimate',()=>{for(const resinCode of ['1','3','7','unknown'])assert.equal(estimateYield({resinCode,weightGrams:100,confirmed:true}).ok,false);});
test('hazardous/uncertain contents block yield',()=>{assert.equal(estimateYield({resinCode:'6',weightGrams:20,confirmed:true,condition:'oily'}).ok,false);});
test('invalid masses cannot get valid yield',()=>{for(const value of ['',undefined,null,0,-1,'bad',Infinity,10000001])assert.equal(estimateYield({resinCode:'4',weightGrams:value,confirmed:true}).ok,false,String(value));});
test('bare dates and item prices do not count as resin IDs',()=>{assert.deepEqual(extractResinCandidates('2026 PRICE 100 25 1 2 3'),[]);});
test('strong label or resin marker is suggested but not confirmed',()=>{assert.deepEqual(extractResinCandidates('PETE HDPE Resin Code #4 PP'),['1','2','4','5']);});
test('each catalog polymer is defined',()=>{assert.equal(Object.keys(POLYMERS).length,7);assert.equal(getScenarios('3').length,0);});

test('marketing text cannot impersonate standalone polymer abbreviations',()=>{assert.deepEqual(extractResinCandidates('APPLE HAPPY CARPET 2026'),[])});

test('pure-polymer yields should not be applied to food-contaminated waste',()=>assert.equal(estimateYield({resinCode:'2',weightGrams:10,confirmed:true,condition:'food-contaminated'}).ok,false));
