# Trained model output folder

This folder deliberately does **not** include a fake pretrained classifier.

After running `training/train_colab.py` against the real Google Drive photographs, copy these generated assets here:

- `model.json`
- all referenced `.bin` weight shards
- `classes.json`

The browser application will detect and load them automatically on next refresh.
The model is trained on **eight visual waste categories**, not plastic polymer chemistry.
