"""
Multimodal Deep Neural Network for Lost & Found Item Matching
Combines Image representations, Text descriptions, Category embeddings,
and Location features to predict match probability between lost and found items.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F

class ItemEncoder(nn.Module):
    def __init__(self, num_categories=10, num_locations=10, vision_dim=512, hidden_dim=128):
        super().__init__()
        # Vision projection head
        self.vision_proj = nn.Sequential(
            nn.Linear(vision_dim, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(256, hidden_dim)
        )
        
        # Category and Location Embeddings
        self.category_emb = nn.Embedding(num_categories, 32)
        self.location_emb = nn.Embedding(num_locations, 32)
        
        # Dense metadata processor
        self.meta_linear = nn.Linear(32 + 32 + 1, 64)
        
        # Multimodal fusion layer
        self.fusion = nn.Sequential(
            nn.Linear(hidden_dim + 64, hidden_dim),
            nn.BatchNorm1d(hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim)
        )
        
    def forward(self, img_feat, cat_idx, loc_idx, text_len):
        v = self.vision_proj(img_feat)
        v = F.normalize(v, p=2, dim=-1)
        
        c = self.category_emb(cat_idx)
        l = self.location_emb(loc_idx)
        
        # Normalize text length feature
        t = text_len / 100.0
        meta = torch.cat([c, l, t], dim=-1)
        meta_feat = F.relu(self.meta_linear(meta))
        
        combined = torch.cat([v, meta_feat], dim=-1)
        embedding = self.fusion(combined)
        return F.normalize(embedding, p=2, dim=-1), v

class MultimodalItemMatcher(nn.Module):
    def __init__(self, num_categories=10, num_locations=10, vision_dim=512, hidden_dim=128):
        super().__init__()
        self.encoder = ItemEncoder(
            num_categories=num_categories,
            num_locations=num_locations,
            vision_dim=vision_dim,
            hidden_dim=hidden_dim
        )
        
        # Scoring classification head
        self.comparator = nn.Sequential(
            nn.Linear(hidden_dim * 2 + 1, 64),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(64, 1)
        )
        
    def forward(self, img_a, cat_a, loc_a, text_len_a, img_b, cat_b, loc_b, text_len_b):
        emb_a, vis_a = self.encoder(img_a, cat_a, loc_a, text_len_a)
        emb_b, vis_b = self.encoder(img_b, cat_b, loc_b, text_len_b)
        
        # Multimodal Cosine similarity
        cos_sim = torch.sum(emb_a * emb_b, dim=-1, keepdim=True)
        
        # Visual similarity
        vis_sim = torch.sum(vis_a * vis_b, dim=-1, keepdim=True)
        
        # Pair features
        pair_feat = torch.cat([emb_a, emb_b, cos_sim], dim=-1)
        logits = self.comparator(pair_feat)
        prob = torch.sigmoid(logits)
        
        return {
            "logits": logits,
            "match_prob": prob,
            "cosine_similarity": cos_sim,
            "visual_similarity": vis_sim
        }

