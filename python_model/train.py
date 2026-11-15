"""
Training script for Multimodal Lost & Found Item Matching Model
Trains neural network on paired lost-found items and exports saved weights.
"""

import os
import json
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, random_split
from dataset import MultimodalLostFoundDataset, CAMPUS_CATEGORIES, CAMPUS_LOCATIONS
from model import MultimodalItemMatcher

def train_model(epochs=10, batch_size=32, lr=1e-3):
    print("=" * 60)
    print("  TRAINING MULTIMODAL LOST & FOUND ITEM MATCHING MODEL")
    print("=" * 60)
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[Device] Using compute device: {device}")
    
    # 1. Dataset & Loaders
    full_dataset = MultimodalLostFoundDataset(num_samples=1600)
    train_size = int(0.85 * len(full_dataset))
    val_size = len(full_dataset) - train_size
    train_ds, val_ds = random_split(full_dataset, [train_size, val_size])
    
    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False)
    
    print(f"[Data] Total Samples: {len(full_dataset)} | Train: {train_size} | Val: {val_size}")
    
    # 2. Model, Loss, Optimizer
    model = MultimodalItemMatcher().to(device)
    criterion = nn.BCEWithLogitsLoss()
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)
    
    best_val_loss = float("inf")
    save_path = os.path.join(os.path.dirname(__file__), "item_matcher_weights.pt")
    
    for epoch in range(1, epochs + 1):
        model.train()
        total_train_loss = 0.0
        correct_train = 0
        total_train = 0
        
        for batch in train_loader:
            img_a = batch["img_a"].to(device)
            img_b = batch["img_b"].to(device)
            cat_a = batch["cat_a"].to(device)
            cat_b = batch["cat_b"].to(device)
            loc_a = batch["loc_a"].to(device)
            loc_b = batch["loc_b"].to(device)
            len_a = batch["desc_len_a"].to(device)
            len_b = batch["desc_len_b"].to(device)
            labels = batch["label"].to(device)
            
            optimizer.zero_grad()
            out = model(img_a, cat_a, loc_a, len_a, img_b, cat_b, loc_b, len_b)
            loss = criterion(out["logits"], labels)
            loss.backward()
            optimizer.step()
            
            total_train_loss += loss.item() * len(labels)
            preds = (out["match_prob"] >= 0.5).float()
            correct_train += (preds == labels).sum().item()
            total_train += len(labels)
            
        scheduler.step()
        avg_train_loss = total_train_loss / total_train
        train_acc = (correct_train / total_train) * 100.0
        
        # Validation loop
        model.eval()
        total_val_loss = 0.0
        correct_val = 0
        total_val = 0
        
        with torch.no_grad():
            for batch in val_loader:
                img_a = batch["img_a"].to(device)
                img_b = batch["img_b"].to(device)
                cat_a = batch["cat_a"].to(device)
                cat_b = batch["cat_b"].to(device)
                loc_a = batch["loc_a"].to(device)
                loc_b = batch["loc_b"].to(device)
                len_a = batch["desc_len_a"].to(device)
                len_b = batch["desc_len_b"].to(device)
                labels = batch["label"].to(device)
                
                out = model(img_a, cat_a, loc_a, len_a, img_b, cat_b, loc_b, len_b)
                v_loss = criterion(out["logits"], labels)
                total_val_loss += v_loss.item() * len(labels)
                preds = (out["match_prob"] >= 0.5).float()
                correct_val += (preds == labels).sum().item()
                total_val += len(labels)
                
        avg_val_loss = total_val_loss / total_val
        val_acc = (correct_val / total_val) * 100.0
        
        print(f"Epoch [{epoch:02d}/{epochs:02d}] - Train Loss: {avg_train_loss:.4f} | Train Acc: {train_acc:.1f}% | Val Loss: {avg_val_loss:.4f} | Val Acc: {val_acc:.1f}%")
        
        if avg_val_loss < best_val_loss:
            best_val_loss = avg_val_loss
            torch.save(model.state_dict(), save_path)
            
    print(f"\n[Success] Best model weights saved to: {save_path}")
    
    # Save config
    config = {
        "categories": CAMPUS_CATEGORIES,
        "locations": CAMPUS_LOCATIONS,
        "vision_dim": 512,
        "hidden_dim": 128,
        "best_val_loss": best_val_loss
    }
    with open(os.path.join(os.path.dirname(__file__), "config.json"), "w") as f:
        json.dump(config, f, indent=2)

if __name__ == "__main__":
    train_model(epochs=8, batch_size=32)

