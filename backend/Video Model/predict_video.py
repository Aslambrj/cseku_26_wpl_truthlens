"""Run the TruthLens EfficientNet video detector on a local video file."""

import base64
import io
import json
import math
import sys
import time
from pathlib import Path

try:
    import cv2
    import numpy as np
    import torch
    from PIL import Image
    from torchvision import models, transforms
except ImportError as error:
    print(json.dumps({"error": f"Video model dependency is missing: {error.name}"}))
    sys.exit(2)

MODEL_PATH = Path(__file__).with_name("truthlens_video_efficientnet_b0.pt")
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
MEAN = [0.485, 0.456, 0.406]
STD = [0.229, 0.224, 0.225]
DECISION_THRESHOLD = 0.20


def load_model():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Video model checkpoint not found: {MODEL_PATH.name}")
    try:
        checkpoint = torch.load(MODEL_PATH, map_location=DEVICE, weights_only=True)
    except TypeError:
        checkpoint = torch.load(MODEL_PATH, map_location=DEVICE)

    model = models.efficientnet_b0(weights=None)
    model.classifier[1] = torch.nn.Linear(model.classifier[1].in_features, 1)
    model.load_state_dict(checkpoint["state_dict"])
    model.to(DEVICE).eval()

    try:
        from facenet_pytorch import MTCNN
        mtcnn = MTCNN(keep_all=True, device=DEVICE, thresholds=[0.6, 0.7, 0.7], post_process=False)
    except Exception as error:
        raise RuntimeError(
            "The trained video model requires facenet-pytorch's MTCNN face detector. "
            "Install backend/Video Model/requirements.txt in the Python environment used by the backend."
        ) from error

    preprocessing = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize(checkpoint.get("mean", MEAN), checkpoint.get("std", STD)),
    ])
    return model, checkpoint, mtcnn, preprocessing


def sample_frames(video_path, n_frames):
    capture = cv2.VideoCapture(str(video_path))
    if not capture.isOpened():
        capture.release()
        return []

    total = int(capture.get(cv2.CAP_PROP_FRAME_COUNT))
    frames = []
    if total > 0:
        indexes = (
            np.linspace(0, total - 1, n_frames + 2)[1:-1].astype(int)
            if total > n_frames + 2 else np.arange(total)
        )
        for index in np.unique(indexes):
            capture.set(cv2.CAP_PROP_POS_FRAMES, int(index))
            ok, frame = capture.read()
            if ok and frame is not None:
                frames.append(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    else:
        frames_buffer = []
        while True:
            ok, frame = capture.read()
            if not ok:
                break
            frames_buffer.append(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        if frames_buffer:
            indexes = np.unique(np.linspace(0, len(frames_buffer) - 1, n_frames).astype(int))
            frames = [frames_buffer[index] for index in indexes]

    capture.release()
    return frames


def detect_face(rgb, mtcnn):
    height, width = rgb.shape[:2]
    scale = min(1.0, 960 / max(height, width))
    small = cv2.resize(rgb, (int(width * scale), int(height * scale))) if scale < 1 else rgb
    boxes, _, points = mtcnn.detect(small, landmarks=True)
    if boxes is None or len(boxes) == 0:
        return None, None
    areas = (boxes[:, 2] - boxes[:, 0]) * (boxes[:, 3] - boxes[:, 1])
    index = int(np.argmax(areas))
    return boxes[index] / scale, points[index] / scale if points is not None else None


def crop_square(image, center_x, center_y, side):
    height, width = image.shape[:2]
    half = side // 2
    x1, y1 = center_x - half, center_y - half
    x2, y2 = x1 + side, y1 + side
    padding = max(0, -x1, -y1, x2 - width, y2 - height)
    if padding:
        image = cv2.copyMakeBorder(image, padding, padding, padding, padding, cv2.BORDER_CONSTANT, value=0)
        x1 += padding
        x2 += padding
        y1 += padding
        y2 += padding
    return image[y1:y2, x1:x2]


def prepare_frames(frames, checkpoint, mtcnn):
    size = int(checkpoint["img_size"])
    margin = float(checkpoint["face_margin"])
    face_crops = []
    for rgb in frames:
        box, points = detect_face(rgb, mtcnn)
        if box is None:
            continue

        x1, y1, x2, y2 = box
        center_x, center_y = (x1 + x2) / 2, (y1 + y2) / 2
        if points is not None:
            (left_x, left_y), (right_x, right_y) = points[0], points[1]
            angle = math.degrees(math.atan2(right_y - left_y, right_x - left_x))
            matrix = cv2.getRotationMatrix2D((float(center_x), float(center_y)), angle, 1.0)
            rgb = cv2.warpAffine(rgb, matrix, (rgb.shape[1], rgb.shape[0]), flags=cv2.INTER_LINEAR,
                                 borderMode=cv2.BORDER_CONSTANT)

        side = int(max(x2 - x1, y2 - y1) * (1 + 2 * margin))
        crop = crop_square(rgb, int(center_x), int(center_y), max(side, 16))
        face_crops.append(cv2.resize(crop, (size, size), interpolation=cv2.INTER_AREA))

    detected_faces = len(face_crops)
    if not face_crops and frames:
        for rgb in frames:
            height, width = rgb.shape[:2]
            side = min(height, width)
            square = rgb[(height - side) // 2:(height - side) // 2 + side,
                         (width - side) // 2:(width - side) // 2 + side]
            face_crops.append(cv2.resize(square, (size, size), interpolation=cv2.INTER_AREA))
    return face_crops, detected_faces


def decision_confidence(score, threshold):
    if score >= threshold:
        return 0.5 + 0.5 * (score - threshold) / max(1e-9, 1 - threshold)
    return 0.5 + 0.5 * (threshold - score) / max(1e-9, threshold)


def predict(video_path):
    started_at = time.time()
    model, checkpoint, mtcnn, preprocessing = load_model()
    frames_per_video = int(checkpoint.get("frames_per_video", 12))
    # The application decision threshold is 0.20. Some saved checkpoints
    # contain the earlier validation-selected value (0.70), so use the final
    # configured decision threshold here for both labels and reported results.
    threshold = DECISION_THRESHOLD
    frames = sample_frames(video_path, frames_per_video)
    if not frames:
        raise ValueError("Could not read any frames from this video. Try an MP4, MOV, MKV, AVI, or WEBM file.")

    crops, faces_detected = prepare_frames(frames, checkpoint, mtcnn)
    batch = torch.stack([preprocessing(Image.fromarray(crop)) for crop in crops]).to(DEVICE)
    with torch.inference_mode():
        frame_probabilities = torch.sigmoid(model(batch)).float().cpu().numpy().reshape(-1)

    fake_score = float(frame_probabilities.mean())
    prediction = "FAKE" if fake_score >= threshold else "REAL"
    sampled_frames = []
    for index, (crop, probability) in enumerate(zip(crops, frame_probabilities), start=1):
        preview = io.BytesIO()
        Image.fromarray(crop).save(preview, format="JPEG", quality=72, optimize=True)
        encoded_preview = base64.b64encode(preview.getvalue()).decode("ascii")
        sampled_frames.append({
            "frame": index,
            "fake_probability": round(float(probability), 4),
            "preview": f"data:image/jpeg;base64,{encoded_preview}",
        })
    return {
        "status": "ok",
        "prediction": prediction,
        "confidence": round(float(decision_confidence(fake_score, threshold)), 4),
        "fake_score": round(fake_score, 4),
        "threshold": threshold,
        "frames_analyzed": len(frame_probabilities),
        "frames_with_face": faces_detected,
        "face_fallback_used": faces_detected == 0,
        "frame_probabilities": [round(float(probability), 4) for probability in frame_probabilities],
        "sampled_frames": sampled_frames,
        "model": "EfficientNet-B0 (FaceForensics++ subset)",
        "processing_seconds": round(time.time() - started_at, 2),
    }


def main():
    try:
        video_path = sys.argv[1]
        print(json.dumps(predict(video_path)))
    except Exception as error:
        print(json.dumps({"error": str(error)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
