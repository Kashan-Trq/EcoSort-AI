"""EcoSort AI: train on real Drive images. Designed for Google Colab CPU/GPU.

DO NOT report test metrics as independent ground truth if labels remain text-derived.
Split unit: physical sample ID (three images per sample).
Model target: visual waste form, NOT resin/polymer identity.
"""
from pathlib import Path
import json, os, warnings, sys
import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.metrics import classification_report,confusion_matrix,accuracy_score,f1_score
from sklearn.utils.class_weight import compute_class_weight
import matplotlib.pyplot as plt

# ---- EDIT JUST THIS PATH ----
PROJECT_DIR = Path(os.environ.get('ECOSORT_DRIVE_ROOT','/content/drive/MyDrive/EcoSort'))
CSV = PROJECT_DIR/'EcoSort_image_manifest.csv'
REVIEW_CSV = PROJECT_DIR/'ecosort_verified_label_corrections.csv'  # optional export from web review
OUTPUT_DIR = PROJECT_DIR/'trained_outputs'
OUTPUT_DIR.mkdir(parents=True,exist_ok=True)
SEED=42
np.random.seed(SEED)
tf.random.set_seed(SEED)

if not CSV.exists():
    raise SystemExit(f'Missing {CSV}. Copy EcoSort_image_manifest.csv from the project ZIP into the EcoSort Drive root folder.')
frame=pd.read_csv(CSV,keep_default_na=False)
required={'Sample ID','Relative Image Path','Final Waste Category','ML Split','Label Provenance'}
assert required.issubset(frame.columns),f'Missing manifest headers: {required-set(frame.columns)}'
assert len(frame)==1350, f'Expected 1,350 photo rows, got {len(frame)}. Inspect your CSV before training.'
assert frame['Sample ID'].nunique()==450
assert frame.groupby('Sample ID')['ML Split'].nunique().max()==1,'DATA LEAKAGE: a sample appears in multiple splits.'
assert frame.groupby('Sample ID').size().eq(3).all(),'Each physical sample must have exactly three image rows.'
if REVIEW_CSV.exists():
    edits=pd.read_csv(REVIEW_CSV,keep_default_na=False)
    assert {'id','category','checkedAt'}.issubset(edits.columns)
    assert not edits['id'].duplicated().any()
    valid_ids=set(frame['Sample ID'])
    assert set(edits['id']).issubset(valid_ids),'Review CSV has unknown specimen IDs.'
    patch=edits.set_index('id')['category'].to_dict()
    frame.loc[frame['Sample ID'].isin(patch),'Final Waste Category']=frame.loc[frame['Sample ID'].isin(patch),'Sample ID'].map(patch)
    frame.loc[frame['Sample ID'].isin(patch),'Label Provenance']='User-reviewed'
    print(f'Applied {len(patch)} user-reviewed label changes.')
frame['full_path']=frame['Relative Image Path'].apply(lambda p:str(PROJECT_DIR/str(p)))
missing=frame.loc[~frame.full_path.map(os.path.isfile),['Sample ID','Relative Image Path']]
if len(missing):
    print('First missing photographs:')
    print(missing.head(16).to_string(index=False))
    raise SystemExit(f'Image train aborted: {len(missing)} / 1350 photographs absent. Confirm Google Drive is mounted and batch folders match manifest paths exactly.')
classes=sorted(frame['Final Waste Category'].unique())
assert len(classes)==8,f'Expected eight visual classes; got {classes}'
class_to_id={c:i for i,c in enumerate(classes)}
frame['label_id']=frame['Final Waste Category'].map(class_to_id)
labels_summary=frame.groupby(['Sample ID','ML Split'])['Label Provenance'].first().reset_index()
print('Sample-label provenance:',labels_summary['Label Provenance'].value_counts().to_dict())
print('Sample-split counts:',labels_summary['ML Split'].value_counts().to_dict())
provisional=(labels_summary['Label Provenance']=='Auto-assigned').sum()
if provisional:
 warnings.warn(f'{provisional} of 450 labels are auto-assigned. Test accuracy on these labels is NOT independent scientific validation.')

IMG_SIZE=(224,224);BATCH=24;AUTOTUNE=tf.data.AUTOTUNE

def decode(path,label):
    image=tf.io.read_file(path)
    image=tf.io.decode_jpeg(image,channels=3)
    image=tf.image.resize(image,IMG_SIZE)
    return image,tf.cast(label,tf.int32)

def ds_for(split,shuffle=False):
    d=frame[frame['ML Split']==split]
    assert len(d)>0,split
    ds=tf.data.Dataset.from_tensor_slices((d['full_path'].to_numpy(),d['label_id'].astype('int32').to_numpy()))
    if shuffle:ds=ds.shuffle(len(d),seed=SEED,reshuffle_each_iteration=True)
    return ds.map(decode,num_parallel_calls=AUTOTUNE).batch(BATCH).prefetch(AUTOTUNE)

tr=ds_for('train',True);va=ds_for('validation');te=ds_for('test')
trdf=frame[frame['ML Split']=='train']
cw=compute_class_weight('balanced',classes=np.arange(len(classes)),y=trdf['label_id'].to_numpy())
class_weights={int(i):float(x) for i,x in enumerate(cw)}
try:
    base=tf.keras.applications.MobileNetV2(weights='imagenet',include_top=False,input_shape=(224,224,3))
except Exception as exc:
    raise SystemExit(f'Could not download ImageNet pretrained weights ({exc}). Colab runtime needs internet for this initial download.')
base.trainable=False
aug=tf.keras.Sequential([tf.keras.layers.RandomFlip('horizontal'),tf.keras.layers.RandomRotation(.06),tf.keras.layers.RandomZoom(.09)],name='train_augmentation')
# Training-only augmentation stays OUTSIDE the exported inference graph.
tr=tr.map(lambda images, y:(aug(images,training=True),y),num_parallel_calls=AUTOTUNE).prefetch(AUTOTUNE)
inp=tf.keras.Input(shape=(224,224,3),name='photo')
# Input normalization is INSIDE exported model. Web app must send raw 0–255 pixel values.
x=tf.keras.layers.Rescaling(1/127.5,offset=-1,name='mobilenet_input_scale')(inp)
x=base(x,training=False)
x=tf.keras.layers.GlobalAveragePooling2D()(x)
x=tf.keras.layers.Dropout(.35)(x)
out=tf.keras.layers.Dense(len(classes),activation='softmax',name='visual_category')(x)
model=tf.keras.Model(inp,out)
model.compile(optimizer=tf.keras.optimizers.Adam(1e-3),loss='sparse_categorical_crossentropy',metrics=['accuracy'])
cb=[tf.keras.callbacks.EarlyStopping(monitor='val_loss',patience=4,restore_best_weights=True),tf.keras.callbacks.ReduceLROnPlateau(monitor='val_loss',factor=.4,patience=2,min_lr=1e-6)]
print('Stage 1: train visual classification head...')
model.fit(tr,validation_data=va,epochs=15,class_weight=class_weights,callbacks=cb,verbose=2)
# Optional stage 2: modest learning-rate fine tuning on a small tail of MobileNetV2.
base.trainable=True
for l in base.layers[:-26]:l.trainable=False
model.compile(optimizer=tf.keras.optimizers.Adam(1e-5),loss='sparse_categorical_crossentropy',metrics=['accuracy'])
print('Stage 2: fine tune top backbone layers...')
model.fit(tr,validation_data=va,epochs=8,class_weight=class_weights,callbacks=cb,verbose=2)

# Final test: never use this set to choose architecture or thresholds.
testframe=frame[frame['ML Split']=='test'].reset_index(drop=True)
probs=model.predict(te,verbose=1)
assert len(probs)==len(testframe)
image_y=testframe.label_id.to_numpy(); image_pred=probs.argmax(axis=1)
records=[]
for sid,g in testframe.groupby('Sample ID',sort=True):
    ix=g.index.to_numpy()
    mean=probs[ix].mean(axis=0)
    records.append({'sample_id':sid,'true_id':int(g.label_id.iloc[0]),'pred_id':int(mean.argmax()),'max_probability':float(mean.max()),'label_provenance':g['Label Provenance'].iloc[0]})
sample_y=np.array([r['true_id'] for r in records]);sample_p=np.array([r['pred_id'] for r in records]);
summary={'research_warning':'Most dataset categories are text-derived: these performance metrics measure agreement with supplied provisional labels, not verified ground truth.','sample_count_test':len(records),'image_count_test':len(testframe),'label_provenance_test':pd.Series([r['label_provenance'] for r in records]).value_counts().to_dict(),'classes':classes,'sample_accuracy':float(accuracy_score(sample_y,sample_p)),'sample_macro_f1':float(f1_score(sample_y,sample_p,average='macro',zero_division=0)),'image_accuracy':float(accuracy_score(image_y,image_pred)),'image_macro_f1':float(f1_score(image_y,image_pred,average='macro',zero_division=0)),'sample_classification_report':classification_report(sample_y,sample_p,labels=list(range(len(classes))),target_names=classes,output_dict=True,zero_division=0)}
(OUTPUT_DIR/'metrics.json').write_text(json.dumps(summary,indent=2))
(OUTPUT_DIR/'sample_predictions.json').write_text(json.dumps(records,indent=2))
(OUTPUT_DIR/'classes.json').write_text(json.dumps(classes,indent=2))
print('SAMPLE ACCURACY',summary['sample_accuracy'],'SAMPLE MACRO-F1',summary['sample_macro_f1'])
print('CAUTION: Dataset labels require human verification before publication-quality claims.')
cm=confusion_matrix(sample_y,sample_p,labels=list(range(len(classes))))
fig,ax=plt.subplots(figsize=(11,8))
im=ax.imshow(cm,cmap='Greys')
ax.set_xticks(range(len(classes)),classes,rotation=50,ha='right',fontsize=8)
ax.set_yticks(range(len(classes)),classes,fontsize=8)
for i in range(len(classes)):
 for j in range(len(classes)):ax.text(j,i,int(cm[i,j]),ha='center',va='center',fontsize=8)
ax.set_xlabel('Predicted visual category');ax.set_ylabel('Provisional assigned visual category')
ax.set_title('Specimen-level test confusion matrix (three-view averaged)')
fig.tight_layout();fig.savefig(OUTPUT_DIR/'confusion_matrix.png',dpi=180);plt.close(fig)
model.save(OUTPUT_DIR/'model.keras')
try:
    import tensorflowjs as tfjs
    webdir=OUTPUT_DIR/'web_model'
    webdir.mkdir(parents=True,exist_ok=True)
    tfjs.converters.save_keras_model(model,str(webdir))
    (webdir/'classes.json').write_text(json.dumps(classes,indent=2))
    print('Browser-ready model created:',webdir)
    print('Copy model.json, *.bin, classes.json into WEBSITE/models/ecosort/')
except Exception as e:
    print('TFJS export not complete:',repr(e))
    print('The Keras model was saved successfully. Install tensorflowjs in Colab, then rerun the export block below:')
    print('  import tensorflowjs as tfjs')
    print('  tfjs.converters.save_keras_model(model, str(OUTPUT_DIR/"web_model"))')

print('DONE. Metrics and confusion matrix saved to',OUTPUT_DIR)
