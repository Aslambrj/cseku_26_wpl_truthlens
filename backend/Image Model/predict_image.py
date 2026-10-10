"""Run the TruthLens EfficientNet checkpoint against a base64 encoded image."""

import base64
import io
import json
import sys
from pathlib import Path

try:
    import timm
    import torch
    from PIL import Image
    from torchvision import transforms
except ImportError as error:
    print(json.dumps({"error": f"Image model dependency is missing: {error.name}"}))
    sys.exit(2)

MODEL_PATH = Path(__file__).with_name("truthlens_b0_v4.pt")
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
DECISION_THRESHOLD = 0.3

def load_model():
    checkpoint = torch.load(MODEL_PATH, map_location=DEVICE)
    image_size = checkpoint["img_size"]
    threshold = DECISION_THRESHOLD
    model = timm.create_model(checkpoint["arch"], pretrained=False, num_classes=2).to(DEVICE)
    model.load_state_dict(checkpoint["model_state"])
    model.eval()
    return model, image_size, threshold

def predict(image_data):
    model, image_size, threshold = load_model()
    image = Image.open(io.BytesIO(image_data)).convert("RGB")
    transform = transforms.Compose([
        transforms.Resize((image_size, image_size)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])
    image_tensor = transform(image).unsqueeze(0).to(DEVICE)
    with torch.inference_mode():
        views = [image_tensor, torch.flip(image_tensor, [3])]
        crop = image_tensor[:, :, int(image_size * 0.05):int(image_size * 0.95), int(image_size * 0.05):int(image_size * 0.95)]
        views.append(torch.nn.functional.interpolate(crop, size=(image_size, image_size), mode="bilinear", align_corners=False))
        shrunken = torch.nn.functional.interpolate(image_tensor, scale_factor=0.9, mode="bilinear", align_corners=False)
        views.append(torch.nn.functional.pad(shrunken, [12, 12, 12, 12], mode="reflect"))
        probabilities = torch.stack([torch.softmax(model(view), dim=1)[0] for view in views]).mean(0).cpu()
    ai_probability = probabilities[1].item()
    return {
        "label": "AI-Generated" if ai_probability >= threshold else "Real",
        "aiProbability": round(ai_probability * 100, 2),
        "realProbability": round(probabilities[0].item() * 100, 2),
        "threshold": threshold,
    }

def main():
    try:
        encoded_image = sys.stdin.read().strip()
        if not encoded_image:
            raise ValueError("No image data was provided")
        print(json.dumps(predict(base64.b64decode(encoded_image, validate=True))))
    except Exception as error:
        print(json.dumps({"error": str(error)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
