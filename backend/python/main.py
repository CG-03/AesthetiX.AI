from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ultralytics import YOLO
import base64
import cv2
import numpy as np

app = FastAPI(title="YOLO11-seg Microservice")

# Allow CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model instance
try:
    print("Loading YOLO11x-seg model...")
    model = YOLO("yolo11x-seg.pt") # auto-downloads
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading x model, falling back to l model: {e}")
    try:
        model = YOLO("yolo11l-seg.pt")
    except Exception as e2:
        model = None

class DetectRequest(BaseModel):
    image: str # Base64 encoded image

# Authorized classes as requested by user. Note: YOLO COCO may not map all of these perfectly natively.
ALLOWED_CLASSES = {
    "curtain", "rug", "carpet", "cushion", "pillow", "vase", "lamp", "shelf", 
    "cabinet", "wardrobe", "bed", "sofa", "couch", "dining table", "chair", 
    "plant", "potted plant", "tv", "mirror", "painting"
}

@app.post("/detect")
async def detect(req: DetectRequest):
    if not model:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        # Decode base64
        image_data = req.image
        if image_data.startswith("data:image"):
            image_data = image_data.split(",")[1]
            
        img_bytes = base64.b64decode(image_data)
        np_arr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image")

        h, w = img.shape[:2]

        results = model.predict(img, imgsz=640, conf=0.25)
        result = results[0]

        best_detections = {}

        for i, box in enumerate(result.boxes):
            cls_id = int(box.cls[0].item())
            conf = float(box.conf[0].item())
            label = result.names[cls_id]
            
            # Map standard COCO labels to user preferred names if needed
            if label == "potted plant": label = "plant"

            if label not in ALLOWED_CLASSES:
                continue

            # Deduplication: keep only the highest confidence detection per class
            if label in best_detections and best_detections[label]['confidence'] >= conf:
                continue
                
            # [x1, y1, x2, y2]
            xyxy = box.xyxy[0].tolist()
            # Bounding box as percentages (to remain partly compatible with frontend)
            bx = ((xyxy[0] + xyxy[2]) / 2) / w * 100
            by = ((xyxy[1] + xyxy[3]) / 2) / h * 100
            bw = (xyxy[2] - xyxy[0]) / w * 100
            bh = (xyxy[3] - xyxy[1]) / h * 100

            segmentation_mask = []
            if result.masks is not None and len(result.masks) > i:
                coords = result.masks.xy[i]
                if len(coords) > 0:
                    segmentation_mask = [{"x": float(pt[0]), "y": float(pt[1])} for pt in coords]

            best_detections[label] = {
                "id": i + 1,
                "label": label,
                "confidence": round(conf, 2),
                "boundingBox": { "x": bx, "y": by, "width": bw, "height": bh },
                "originalBox": {"x1": xyxy[0], "y1": xyxy[1], "x2": xyxy[2], "y2": xyxy[3]},
                "segmentationMask": segmentation_mask,
                "imageWidth": w,
                "imageHeight": h,
                "color": "matching",
                "style": "modern",
                "category": label
            }

        return list(best_detections.values())

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
