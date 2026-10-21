# Scientific sources, calculations and traceability

## Resin identification vs visual shape

ASTM International, D7611/D7611M, *Standard Practice for Coding Plastic Manufactured Articles for Resin Identification* (2021 edition): https://store.astm.org/d7611_d7611m-21.html. ASTM emphasizes that a resin code identifies the article's polymer; the marking **does not imply recyclability** or local collection availability.

Images of similar-looking containers do not reliably prove their chemical polymer. EcoSort uses Tesseract OCR to generate suggestions for visible resin markings, but **never treats OCR output or ImageNet object guesses as certified polymer chemistry**. User physical confirmation or spectroscopy is required for calculating yield.

## Pyrolysis source and included source data

Kabeyi, M. J. B., & Olanrewaju, O. A. (2023). *Review and Design Overview of Plastic Waste-to-Pyrolysis Oil Conversion with Implications on the Energy Transition*. **Journal of Energy**, article 1821129. https://doi.org/10.1155/2023/1821129. **Table 3** synthesizes published distinct laboratory experiments at varying temperatures/reactors.

Selected unaltered example values from Table 3 (wt% of plastic feed). We included only internally consistent triplets summing to approximately 100%:

| Polymer | Source scenario | Temp, °C | Liquid wt% | Gas wt% | Solid wt% |
|---|---|---:|---:|---:|---:|
| HDPE | Batch | 450 | 74.5 | 5.8 | 19.7 |
| HDPE | Fluidized bed | 500 | 85 | 10 | 5 |
| LDPE | Pressurized batch | 425 | 89.5 | 10 | 0.5 |
| LDPE | Atmospheric conditions | 500 | 80.4 | 19.43 | 0.16 |
| PP | Atmospheric conditions | 500 | 82.12 | 17.76 | 0.12 |
| PP | Batch | 740 | 48.8 | 49.6 | 1.6 |
| PS | Pressurized batch | 425 | 97 | 2.5 | 0.5 |
| PS | Batch | 581 | 89.5 | 9.9 | 0.6 |

**Important limitations**: The review brings together several independent experiments, not one standardized procedure. Some other rows in this review appear numerically inconsistent or have missing values, so they are **not included**. Values are not a statistically derived prediction interval, a forecast for a specific plastic item, or a demonstrated performance of EcoSort. Reported condensable products are not necessarily refined fuel. Material additives, feed contamination, polymer blends, pressure, equipment and temperature all affect products. No model prediction is made from photographs alone.

Related review: *Plastic waste as pyrolysis feedstock for plastic oil production: A review*, Science of The Total Environment 877 (2023), article 162719. https://doi.org/10.1016/j.scitotenv.2023.162719 (notes HDPE/LDPE/PP/PS more promising than PVC/PET as generic plastic-oil feedstock).

The calculation is simple proportional scaling of a **published example**:

`example_liquid_mass_g = hypothetical_pure_polymer_feed_mass_g × reported_liquid_wt_percent / 100`.

If weight is not entered, the app displays what the literature fraction implies for **100 g of hypothetical feed**, not the mass or yield of the pictured object.

The app does not offer any pyrolysis operation instructions. Laboratory or industrial studies require trained personnel, appropriate environmental controls and safety approvals.

## Computer-vision technology

- TensorFlow.js: https://www.tensorflow.org/js.
- TensorFlow Models MobileNet (pretrained ImageNet generic object labels): https://github.com/tensorflow/tfjs-models/tree/master/mobilenet.
- Tesseract.js browser OCR: https://github.com/naptha/tesseract.js.

These components download from their public hosts at runtime (where internet access allows). **No custom resin-ID classifier or measured model accuracy is included.** Generic ImageNet labels cannot validate a PET-vs-PP chemical distinction.

## EcoSort local data provenance

450 specimen records (P001–P450) imported from user-provided spreadsheet and ML package. 315/68/67 sample-level train/validation/test assignments preserved. 1,350 image paths are listed; image files are in the user's Google Drive, not shipped with this ZIP. 419 waste-form class labels were automatically assigned from source descriptions and 31 were flagged manually verified in the supplied package. Those are not independently validated polymer measurements. No fresh source images or training experiments were collected for this release.
