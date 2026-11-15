"""
FastAPI Server for Multimodal Lost & Found Item Matching
Provides an HTTP POST /api/match endpoint to accept image & item details
and return top recommended matches.
"""

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import uvicorn
import shutil
import tempfile
import os
from inference import ItemMatchRecommender

app = FastAPI(title="Campus Lost & Found Multimodal AI Matcher")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

recommender = None

@app.on_event("startup")
def load_model():
    global recommender
    recommender = ItemMatchRecommender()

@app.get("/health")
def health_check():
    return {"status": "online", "model": "MultimodalItemMatcher (PyTorch)"}

@app.post("/api/match")
async def match_item_endpoint(
    title: str = Form(...),
    category: str = Form(...),
    location: str = Form(...),
    description: str = Form(""),
    file: Optional[UploadFile] = File(None)
):
    temp_img_path = None
    if file:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
            shutil.copyfileobj(file.file, tmp)
            temp_img_path = tmp.name
            
    query = {
        "title": title,
        "category": category,
        "location": location,
        "description": description,
        "image_path": temp_img_path
    }
    
    results = recommender.match_item(query)
    
    if temp_img_path and os.path.exists(temp_img_path):
        os.remove(temp_img_path)
        
    return {"query": query, "matches": results}

if __name__ == "__main__":
    uvicorn.run("api_server:app", host="127.0.0.1", port=8000, reload=True)

