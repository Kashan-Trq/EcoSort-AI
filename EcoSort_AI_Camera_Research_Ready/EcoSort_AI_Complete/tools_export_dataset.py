"""Reads the user-supplied master XLSX with artifact_tool and creates a privacy-aware web snapshot."""
from artifact_tool import Blob,SpreadsheetFile
import csv,json,collections,pathlib
HERE=pathlib.Path(__file__).resolve().parent
DEFAULT='/mnt/data/EcoSort_AI_Master_P001_P450_With_ML_Categories.xlsx'
XLSX=DEFAULT
MANIFEST='/mnt/data/ecosort_work/EcoSort_Final_ML_Package/EcoSort_sample_manifest.csv'
wb=SpreadsheetFile.import_xlsx(Blob.load(XLSX))
rows=wb.worksheets.get_item('Data Entry').get_range('A1:AC451').values
headers=rows[0]
md={r['Sample ID']:r for r in csv.DictReader(open(MANIFEST,encoding='utf-8-sig',newline=''))}
data=[]
for values in rows[1:]:
 item=dict(zip(headers,values));sid=item['Sample ID'];m=md.get(sid)
 if not sid or not m:continue
 data.append({
  'id':sid,'item':str(item.get('Item Type') or ''),'category':m['Final Waste Category'],
  'weight_g':float(item.get('Weight (g)') or 0),
  'resin_code':str(item.get('Resin Code') or 'unknown'),
  'resin_family':str(item.get('Final Plastic Type') or 'Unknown'),
  'resin_mark_visible':str(item.get('Resin Code Visible?') or 'not recorded'),
  'condition':str(item.get('Condition') or 'Unrecorded'),
  'color':str(item.get('Color') or ''),'location':str(item.get('Source / Location') or ''),
  'split':m['ML Split'],'label_provenance':m['Label Provenance'],
  'id_confidence':str(item.get('Identification Confidence') or 'Unrecorded'),
  'source_verified':(str(item.get('Site Provenance') or '').lower().find('not confirmed')<0),
  'image_paths':[m['Image 1'],m['Image 2'],m['Image 3']]
 })
assert len(data)==450,len(data)
assert len({r['id'] for r in data})==450
stats={'samples':len(data),'expectedImages':3*len(data),'imagesIncluded':0,'mass_g':round(sum(r['weight_g'] for r in data),2),'categories':dict(collections.Counter(r['category'] for r in data)),'splits':dict(collections.Counter(r['split'] for r in data)),'labelProvenance':dict(collections.Counter(r['label_provenance'] for r in data))}
(HERE/'dataset'/'samples.json').write_text(json.dumps({'version':'2026-10-21','note':'Source values may be unverified; derived from supplied spreadsheet and manifest. Photos are not included.','stats':stats,'samples':data},ensure_ascii=False,separators=(',',':')),encoding='utf-8')
print('Exported:',stats)
