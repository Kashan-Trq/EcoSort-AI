import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,existsSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const file=x=>readFileSync(new URL(x,root),'utf8');
test('all six routes have a corresponding page in app',()=>{const src=file('src/app.mjs');for(let name of ['overview','studio','dataset','evidence','log','about'])assert.match(src,new RegExp(`${name}:`));});
test('image preprocessing and exported model preprocessing do not double-normalize',()=>{const src=file('src/app.mjs');const train=file('training/train_colab.py');assert.match(src,/fromPixels\(bitmap\)\.resizeBilinear\(\[224,224\]\)\.toFloat\(\)\.expandDims/);assert.match(train,/Rescaling\(1\/127\.5,offset=-1/);assert.doesNotMatch(src,/fromPixels\(bitmap\).*div\(127\.5\)/)});
test('deployment is static and no API secret is needed',()=>{assert(existsSync(new URL('index.html',root)));assert(existsSync(new URL('vercel.json',root)));assert.doesNotMatch(file('index.html'),/adsense|google-analytics|gtag|pixel\.facebook/i)});
test('no falsified trained checkpoint committed',()=>{assert(!existsSync(new URL('models/ecosort/model.json',root)));assert(file('models/ecosort/README.md').includes('does **not** include a fake'))});
