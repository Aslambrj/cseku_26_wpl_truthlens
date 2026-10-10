# Image-model setup

TruthLens uses the included `Image Model/truthlens_b0_v4.pt` EfficientNet-B0 checkpoint for image detection.

Install both models' runtime packages in the same Python interpreter that the API will invoke:

```powershell
python -m pip install -r "Image Model/requirements.txt" -r "Video Model/requirements.txt"
```

If `python` is not the correct interpreter, point the backend at the intended one before starting it:

```powershell
$env:PYTHON_EXECUTABLE = "C:\path\to\python.exe"
npm run dev
```

`POST /api/analyses/image` is authenticated and accepts a JSON data URL for PNG, JPG, or WEBP images up to 8 MB. It returns the model's real-image and AI-generated probabilities and saves them with the user's history.

An image is labeled AI-generated when its AI-generated probability reaches the 0.3 (30%) decision threshold. The displayed confidence is the AI-generated probability for AI-generated results and the real-image probability for real results.

If image analysis fails, the API response includes the underlying model error. Confirm the backend is using the Python interpreter where the image-model requirements are installed.

Video analysis uses OpenCV (`opencv-python-headless`) to read video frames and `facenet-pytorch` for face detection. Both are included in `Video Model/requirements.txt`; install that file with the same interpreter configured through `PYTHON_EXECUTABLE` if the API reports a missing `cv2` dependency.
