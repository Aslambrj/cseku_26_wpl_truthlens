# Image-model setup

TruthLens uses the included `Image Model/truthlens_b0_v4.pt` EfficientNet-B0 checkpoint for image detection.

Install the runtime packages in the same Python interpreter that the API will invoke:

```powershell
python -m pip install -r "Image Model/requirements.txt"
```

If `python` is not the correct interpreter, point the backend at the intended one before starting it:

```powershell
$env:PYTHON_EXECUTABLE = "C:\path\to\python.exe"
npm run dev
```

`POST /api/analyses/image` is authenticated and accepts a JSON data URL for PNG, JPG, or WEBP images up to 8 MB. It returns the model's real-image and AI-generated probabilities and saves them with the user's history.
