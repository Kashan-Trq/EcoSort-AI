# EcoSort AI 2.0 — Camera-Supported Waste Research

A **complete, deployable static research application** built around the user's real EcoSort dataset. **No fabricated model output. No advertisements, accounts, or analytics.** All field-log and label-review changes remain in browser localStorage unless the user exports them.

## New in 2.0

- **Live mobile camera** view with safe capture/stop, image upload alternative, and browser-local frame preview (HTTPS required).
- **Real OCR integration** (Tesseract.js loaded from CDN on demand), suggesting resin abbreviations/codes from stamped labels for **human verification**.
- **Optional online ImageNet MobileNet** visual-object hints, not chemical resin classification. Its runtime must be tested after deployment.
- **Citation-linked pyrolysis product scenario explorer** for clean, confirmed HDPE/LDPE/PP/PS, with source reactor context and oil/gas/residue mass balance. Without mass input shows per 100 g hypothetical reference, not item-specific yield.
- **Explicit no-yield safeguards** for PET, PVC, #7, unknown polymer, hazardous contents, and absent verification.
- **Installable PWA** with cached local dashboard and yield calculations; OCR/visual AI engines require internet.

See `QUICK_DEPLOY.md` for deployment and limitations.

## What works right now

- Seven responsive pages: Overview, Sorting Studio, Field Dataset, Research Evidence, My Field Log, How It Works.
- Real dataset dashboard: 450 physical specimens, total recorded weight 2,465.7 g, eight **visual waste-form categories**.
- Sample-level train/validation/test split: **315 / 68 / 67 samples**.
- Searchable, filterable sample register with CSV export, pagination, and provenance flags.
- Label correction workflow requiring the reviewer to confirm they inspected the original item/images; exports `ecosort_verified_label_corrections.csv`.
- Image uploads/camera selection and preview (processed locally). Real machine-learning inference automatically activates **only after** a trained TensorFlow.js model is installed.
- Resin-evidence and contamination-aware recycling review; unknown chemistry and PVC are conservatively flagged.
- Local field log and CSV export; no external backend required.
- Unit/data validation tests runnable with Node.js, without npm installation.

## Evidence limitations you must preserve

- Your XLSX and ZIP contain **metadata and expected paths, not the 1,350 image files**. The photographs exist in the connected Google Drive EcoSort batch folders. Do not describe them as bundled with this app.
- **419/450 visual category labels are text-auto-assigned**; 31/450 are marked manually verified. Auto-assigned category agreement is not independently verified model accuracy.
- Reported resin codes in source spreadsheet are **not confirmed by this software**. Visual waste category != polymer chemistry.
- Many source-location descriptions in the master XLSX are explicitly example categories, and actual per-sample dates were not documented. Do not present them as verified geographic data.
- The application contains **no trained classifier checkpoint** because the uploaded ZIP had a notebook and manifests only. Do not present a model accuracy or confidence claim before genuine training/evaluation.
- A later custom-trained classifier could predict bottle/cup/wrapper categories. The optional pretrained MobileNet object hint already provided is an unvalidated generic ImageNet object classifier, **not** a plastic resin identifier.
- Pyrolysis suitability is for research discussion **only**; it is not household disposal advice. Never burn or thermally process plastics outside approved specialist facilities.

## Quick start (works without installing packages)

1. Unzip this project.
2. From the folder, run `python3 -m http.server 8080`.
3. Open `http://localhost:8080/#scanner`.
4. The initial model status will correctly show **Not deployed**. Other features are usable immediately.
5. Optionally run `node --test tests/*.test.mjs`.

Do not open `index.html` with `file://`; browsers prevent module/JSON loading that way.

## Deploy on Vercel

**Recommended:** Push the project folder to a new GitHub repo, then use Vercel → Add New → Project → Import GitHub Repository.

- Framework Preset: **Other**.
- Root Directory: repository root (where `index.html` lives).
- Build Command: **leave empty**.
- Output Directory: **leave empty** or `.` depending on dashboard fields.
- Environment variables: none.
- All routes use URL hashes (`/#overview`, `/#studio`, etc.) to work on a static host.

Or install Vercel CLI on your own computer and run `vercel --prod` from this directory.

The project does **not** require npm dependencies, a database, a paid API, or a server runtime.

## Training with your actual Google Drive images

1. In Google Drive, find the root **EcoSort** folder containing:
   - `EcoSort 0-100/` ... `EcoSort 401-450/`, each with sample folders (`P001` etc.) and `1.jpg`, `2.jpg`, `3.jpg`.
2. Copy `EcoSort_image_manifest.csv` (provided in `training/EcoSort_image_manifest.csv`) to that EcoSort root folder.
3. Review and correct the auto-assigned category labels using real images. Export corrections using **Research Evidence → Export reviewed labels CSV** (or Field Dataset review), and upload the resulting `ecosort_verified_label_corrections.csv` into the **same Drive root**. The source image manifest is never silently overwritten.
4. Open `training/EcoSort_Train_and_Export.ipynb` in **Google Colab** (File → Upload notebook). Run the cells; mount your Drive. Edit `ECOSORT_DRIVE_ROOT` only if EcoSort is not directly in My Drive root.
5. The script verifies all 1,350 image paths, checks sample-level split leakage, trains a MobileNetV2 category classifier, evaluates on 67 held-out physical items by averaging their three photos, writes metrics/confusion matrix, and tries to export a browser-ready TensorFlow.js model.
6. Copy `trained_outputs/web_model/model.json`, **every** `*.bin` shard, and `classes.json` into this project's `models/ecosort/` folder. Commit/redeploy.
7. Refresh EcoSort. Its Sorting Studio will detect the model and enable genuine predictions.

**Critical:** Existing test labels are mostly auto-assigned, so metrics measure agreement with provisional labels. Have a reviewer verify **all 67 test items** before reporting accuracy as independent evaluation. Fix the labels without allowing the model to influence your review.

## Tests

```sh
npm test
npm run check
python -m py_compile training/train_colab.py
```

No `npm install` is needed. Code and dataset tests run with Node's built-in test runner. Browser visual smoke tests should still be performed after Vercel deployment because the current build environment blocks Chromium's local/network navigation.

## Research documentation

The original source PDF recommends image classification + transparent decision rules, and explicitly warns against claiming that all recycled plastic should go to pyrolysis. The downloaded package preserves that distinction. Do not treat the model as certified material-identification equipment.

**Scientific integrity:** If you submit the research to NSEF/ISEF, check the fair's AI-assistance rules, independently write your research text, disclose tool assistance as required, and provide only measured, independently traceable results.


## Independent research and reference verification

Review `docs/SCIENTIFIC_SOURCES.md` and `docs/RELEASE_NOTES_V2.md` before any competition presentation.
