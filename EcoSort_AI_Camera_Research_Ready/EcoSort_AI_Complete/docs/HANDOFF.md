# Teacher/Coach handoff: EcoSort build status

**Functional today:** searchable 450-record dataset, study quality dashboard, labeling correction and CSV export, photo upload/preview, explainable sorting decision engine, safe unknown-material fallback, local field log, responsive static Vercel application.

**Needs real data analysis:** actual MobileNetV2 classifier training, photo-quality inspection, independent test label verification, externally measured accuracy. Dataset originally labels only 31 specimens as manually verified.

**Recommended next 90 minutes for the student:**

1. Deploy ZIP to Vercel, choosing **Other** framework and no build command (10–20 min).
2. Upload `EcoSort_Train_and_Export.ipynb` to Google Colab, mount Drive, copy image manifest CSV into existing EcoSort Drive root (10 min).
3. Have a reviewer physically inspect at least the held-out test samples. Their labels must not be decided by the model output.
4. Train the first model. Time depends on Drive speed, runtime hardware and data quality; do not promise a duration or accuracy.
5. Copy exported `model.json`, `classes.json` and weight shards into the Vercel project and redeploy.
6. Test inference and record actual validation/test metrics. Present the label-provenance limitation to judges honestly.

**Disclosure:** Source code was AI-assisted. Review applicable competition rules and disclosure requirements before submitting research or code as student work. Do not substitute generated research writing for independently authored scientific writing.
