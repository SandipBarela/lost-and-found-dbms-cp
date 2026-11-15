"""
Inference & Recommendation Engine for Lost & Found Items
Takes an uploaded item image, title, category, location, and description,
and queries the trained multimodal model to return ranked candidate matches.
"""

import os
import json
import torch
import numpy as np
from PIL import Image
from model import MultimodalItemMatcher
from dataset import CAMPUS_CATEGORIES, CAMPUS_LOCATIONS, ITEMS_DATABASE, generate_pseudo_image_features

class ItemMatchRecommender:
    def __init__(self, weights_path=None):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = MultimodalItemMatcher().to(self.device)
        
        if weights_path is None:
            weights_path = os.path.join(os.path.dirname(__file__), "item_matcher_weights.pt")
            
        if os.path.exists(weights_path):
            self.model.load_state_dict(torch.load(weights_path, map_location=self.device))
            self.model.eval()
            print(f"[Loaded] Model weights loaded from: {weights_path}")
        else:
            print("[Warning] Trained weights not found. Using initialized network.")
            self.model.eval()
            
    def extract_image_features(self, image_path: str = None, category_idx: int = 0) -> np.ndarray:
        """Extract visual representation vector (512-dim) from image or visual fallback."""
        if image_path and os.path.exists(image_path):
            try:
                img = Image.open(image_path).convert("RGB").resize((128, 128))
                arr = np.array(img).astype(np.float32) / 255.0
                # Color histogram and spatial projection
                r_hist = np.histogram(arr[:, :, 0], bins=170, range=(0, 1))[0]
                g_hist = np.histogram(arr[:, :, 1], bins=171, range=(0, 1))[0]
                b_hist = np.histogram(arr[:, :, 2], bins=171, range=(0, 1))[0]
                feat = np.concatenate([r_hist, g_hist, b_hist]).astype(np.float32)
                norm = np.linalg.norm(feat)
                return feat / (norm if norm > 0 else 1.0)
            except Exception as e:
                print(f"[Image Error] Could not process image ({e}), using category fallback.")
        return generate_pseudo_image_features(category_idx, item_id=999)

    def match_item(self, query: dict, top_k: int = 5):
        """
        query dict format:
        {
            "title": str,
            "category": str,
            "location": str,
            "description": str,
            "image_path": str (optional)
        }
        """
        cat_idx = CAMPUS_CATEGORIES.index(query["category"]) if query.get("category") in CAMPUS_CATEGORIES else 9
        loc_idx = CAMPUS_LOCATIONS.index(query["location"]) if query.get("location") in CAMPUS_LOCATIONS else 0
        desc_len = float(len(query.get("description", "")))
        
        query_img = self.extract_image_features(query.get("image_path"), cat_idx)
        
        # Candidate found items
        candidates = [item for item in ITEMS_DATABASE if item["type"] == "found"]
        results = []
        
        with torch.no_grad():
            t_img_a = torch.tensor(query_img, dtype=torch.float32).unsqueeze(0).to(self.device)
            t_cat_a = torch.tensor([cat_idx], dtype=torch.long).to(self.device)
            t_loc_a = torch.tensor([loc_idx], dtype=torch.long).to(self.device)
            t_len_a = torch.tensor([[desc_len]], dtype=torch.float32).to(self.device)
            
            for item in candidates:
                cand_cat = CAMPUS_CATEGORIES.index(item["category"]) if item["category"] in CAMPUS_CATEGORIES else 9
                cand_loc = CAMPUS_LOCATIONS.index(item["location"]) if item["location"] in CAMPUS_LOCATIONS else 0
                cand_len = float(len(item["description"]))
                cand_img = generate_pseudo_image_features(cand_cat, item["id"])
                
                t_img_b = torch.tensor(cand_img, dtype=torch.float32).unsqueeze(0).to(self.device)
                t_cat_b = torch.tensor([cand_cat], dtype=torch.long).to(self.device)
                t_loc_b = torch.tensor([cand_loc], dtype=torch.long).to(self.device)
                t_len_b = torch.tensor([[cand_len]], dtype=torch.float32).to(self.device)
                
                out = self.model(t_img_a, t_cat_a, t_loc_a, t_len_a, t_img_b, t_cat_b, t_loc_b, t_len_b)
                
                prob = out["match_prob"].item() * 100.0
                vis_sim = max(0.0, min(100.0, (out["visual_similarity"].item() + 1.0) / 2.0 * 100.0))
                
                # Semantic lexical overlap check
                words_q = set(query.get("title", "").lower().split() + query.get("description", "").lower().split())
                words_c = set(item["title"].lower().split() + item["description"].lower().split())
                overlap = len(words_q.intersection(words_c))
                text_score = min(98.0, 40.0 + overlap * 15.0) if overlap > 0 else 30.0
                
                # Calibrated overall score
                final_score = int(np.clip(prob * 0.5 + text_score * 0.3 + (20.0 if cat_idx == cand_cat else 0.0), 35.0, 98.0))
                
                results.append({
                    "item": item,
                    "match_score": final_score,
                    "breakdown": {
                        "visual_similarity": f"{int(vis_sim)}%",
                        "text_overlap": f"{int(text_score)}%",
                        "category_match": cat_idx == cand_cat,
                        "location_match": loc_idx == cand_loc
                    }
                })
                
        results.sort(key=lambda x: x["match_score"], reverse=True)
        return results[:top_k]

if __name__ == "__main__":
    recommender = ItemMatchRecommender()
    sample_query = {
        "title": "Silver Apple Watch with Sport Loop",
        "category": "Electronics",
        "location": "Library 2nd Floor",
        "description": "Silver finish smart watch lost around study desk area.",
    }
    
    print("\n--- SAMPLE QUERY ---")
    print(json.dumps(sample_query, indent=2))
    
    matches = recommender.match_item(sample_query)
    print("\n--- TOP RECOMMENDED MATCHES ---")
    for idx, m in enumerate(matches, 1):
        print(f"#{idx} [{m['match_score']}% Match] {m['item']['title']}")
        print(f"    Category: {m['item']['category']} | Location: {m['item']['location']}")
        print(f"    Breakdown: {m['breakdown']}\n")

