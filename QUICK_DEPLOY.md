# EcoSort AI 2.0 — deploy in minutes

1. Unzip `EcoSort_AI_Camera_Research_Ready.zip`.
2. Push the extracted **contents of `EcoSort_AI_Complete`** (not the parent ZIP folder) to a new GitHub repository.
3. At https://vercel.com/new choose **Import Git Repository** and select that repository.
4. Choose **Framework Preset: Other**, **Root Directory: repository root**, **Build Command: leave empty**. Deploy.
5. Open the `https://...vercel.app/#scanner` link **on your mobile phone**, grant camera permission, point toward an embossed resin code and either capture a frame or enable **Auto-scan marking** (OCR refreshes approximately every 8 seconds).
6. Tap **Read resin marking (OCR)**. Review the OCR suggestion yourself, select the code, tick the physical-confirmation checkbox. The app will display source-linked *literature scenarios per 100 g of hypothetical feed*; optionally enter the item's measured grams.
7. Optional: tap **Recognize visible object (AI)** to run a publicly pretrained **ImageNet** MobileNet classifier that returns visual object hints (not polymer identification). This option and OCR require internet connection to load external model libraries.

## Research integrity

- **Camera does not scientifically identify polymer chemistry on its own.** OCR detects text, not polymer composition, and needs visual checking.
- **No custom-trained EcoSort plastic-polymer model is shipped**. The earlier 450-sample dataset contains 419 provisional waste-form labels and no verified polymer-by-image ground truth; training a PET-vs-PP model with it would mislead judges.
- The optional pretrained MobileNet model gives object-category hints, **not resin type or validated local model accuracy**.
- Yields are **conditional published industrial experimental examples** from Kabeyi & Olanrewaju (2023), DOI 10.1155/2023/1821129, Table 3. They are *not* measured production from the scanned item, predictive confidence intervals, or an endorsement of fuel production.
- PET, PVC, code 7, unknown polymer and hazardous residues block an oil yield estimate. Recycling should be evaluated before industrial thermal recovery.
- The scanner does not transmit photographs to EcoSort servers; external libraries load in the browser. Browser data may be saved locally only when you choose to export or save an assessment.

## Tests

`node --test tests/*.test.mjs`

The tests validate the dataset, model-availability signaling, yield mass balances, chemical-evidence gates and safety rules. The browser's direct navigation was blocked in the build environment, so camera and external CDN/OCR/network loading **must be checked on the deployed HTTPS site**.

## Improvements needed before an ISEF research claim

- Manually verify specimen labels and resin markings, or validate polymer with FTIR/NIR testing.
- Obtain consent/licensing information for any public image datasets used in later custom training.
- Train custom category recognition with specimen-level isolation, external held-out photographs, per-class F1, confusion matrix and calibration/rejection threshold.
- Measure actual pyrolysis yield *only in a supervised approved laboratory*, if ever pursued. Never report literature yields as your own experiments.
- Under ISEF rules, independently write your final research submission and disclose generative-AI assistance as required.
