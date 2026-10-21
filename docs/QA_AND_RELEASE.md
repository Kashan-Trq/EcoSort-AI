# EcoSort QA and release status — 21 October 2026

## Tested in this build environment

- Source spreadsheet parsed using `artifact_tool`; all 450 specimens exported to JSON.
- Every `P001`–`P450` record is unique; all 1,350 expected relative image paths are mapped.
- Original sample-level splits: 315 train / 68 validation / 67 test.
- Original waste categories: eight visual forms, not polymer labels.
- Original field weights total 2,465.7 grams.
- 419 auto-assigned label origins and 31 marked manually verified are exposed.
- JavaScript parse checks and built-in unit tests pass.
- HTTP local static server returns correct file content and MIME types.
- Colab training Python syntax compilation passes. It is *not* trained or evaluated here.

## Not yet tested / not possible from available data

- Browser E2E click tests: Chromium browser navigation is blocked by the execution environment's administrator for localhost, file:// and data: URLs; must be run in deployed browser.
- Training/model performance: 1,350 images are on Google Drive, but they were not part of the upload and no checkpoint was supplied.
- TensorFlow.js model loading or inference: requires actual model files exported after training.
- Real waste disposal recommendations: region-specific municipal rules are outside this dataset.

## Release checklist for Vercel

- [ ] Open all six pages and inspect browser console for errors.
- [ ] Upload 1–3 photos; see local preview; check oversized/invalid file rejection.
- [ ] Change resin marking to #3 and confirm specialist-handling warning.
- [ ] Set polymer evidence to "visual appearance only" and confirm manual review.
- [ ] Search P001, filter categories, navigate pages, and export CSV.
- [ ] Review an actual sample photo, save corrected class, export label corrections.
- [ ] Save a decision, visit Field Log, export CSV, and delete saved records.
- [ ] Run Colab training on images and validate all test labels before claiming accuracy.
- [ ] Copy trained model JSON, weight shards and classes JSON; redeploy; verify visual-class prediction and no claims about chemistry.
- [ ] Run a Lighthouse accessibility/responsiveness review on an actual deployment.
