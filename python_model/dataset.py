"""
Lost and Found Multimodal Dataset
Provides training pairs and database items with text descriptions,
categories, locations, and image feature vectors.
"""

import torch
from torch.utils.data import Dataset
import numpy as np

CAMPUS_CATEGORIES = [
    "Electronics",
    "ID Cards & Wallets",
    "Laptops & Accessories",
    "Keys & Badges",
    "Books & Stationery",
    "Clothing & Bags",
    "Jewelry & Watches",
    "Eyewear",
    "Sports Gear",
    "Other"
]

CAMPUS_LOCATIONS = [
    "Library 2nd Floor",
    "Student Center Cafeteria",
    "Engineering Hall B-104",
    "North Parking Lot",
    "Main Auditorium",
    "Sports Complex Gymnasium",
    "Science Block C Ground",
    "Administrative Counter 1",
    "Computer Center Lab 3",
    "Bus Stand Terminal"
]

# Sample realistic database items
ITEMS_DATABASE = [
    {
        "id": 1,
        "title": "Apple Watch SE Silver with Midnight Blue Sport Loop",
        "category": "Electronics",
        "location": "Library 2nd Floor",
        "description": "Silver aluminum watch case, small scuff on upper bevel, blue fabric velcro strap.",
        "type": "lost"
    },
    {
        "id": 2,
        "title": "Smart Watch Silver Case Blue Strap",
        "category": "Electronics",
        "location": "Library 2nd Floor",
        "description": "Found on study desk 14. Silver smart watch with magnetic woven band.",
        "type": "found"
    },
    {
        "id": 3,
        "title": "Black Leather Bifold Wallet with Metro Card",
        "category": "ID Cards & Wallets",
        "location": "Student Center Cafeteria",
        "description": "Black matte leather bifold with student gym pass, bank card, and metro pass inside.",
        "type": "lost"
    },
    {
        "id": 4,
        "title": "Dark Brown/Black Wallet with Cards",
        "category": "ID Cards & Wallets",
        "location": "Student Center Cafeteria",
        "description": "Handed over at counter 2. Contains cards and college membership slip.",
        "type": "found"
    },
    {
        "id": 5,
        "title": "Dell XPS 15 Charger 130W USB-C with Dongle",
        "category": "Laptops & Accessories",
        "location": "Engineering Hall B-104",
        "description": "Original Dell 130 Watt power brick connected with a 7-port gray aluminum USB adapter.",
        "type": "lost"
    },
    {
        "id": 6,
        "title": "USB-C High Wattage Laptop Charger Adapter",
        "category": "Laptops & Accessories",
        "location": "Engineering Hall B-104",
        "description": "Left on table row 4. Black charger with USB-C connector and attached hub dongle.",
        "type": "found"
    },
    {
        "id": 7,
        "title": "Honda Key Fob with Dorm Room 204 Tag",
        "category": "Keys & Badges",
        "location": "North Parking Lot",
        "description": "Automotive 3-button black remote key attached to red campus tag.",
        "type": "lost"
    },
    {
        "id": 8,
        "title": "Car Remote Key with Red Lanyard Tag",
        "category": "Keys & Badges",
        "location": "North Parking Lot",
        "description": "Found near bike stand. Black car electronic fob key with red lanyard.",
        "type": "found"
    },
    {
        "id": 9,
        "title": "Blue Spiral Notebook Data Structures",
        "category": "Books & Stationery",
        "location": "Computer Center Lab 3",
        "description": "Classmate blue cover notebook with handwritten DBMS and DSA notes.",
        "type": "lost"
    },
    {
        "id": 10,
        "title": "Blue Notebook with Coding Notes",
        "category": "Books & Stationery",
        "location": "Computer Center Lab 3",
        "description": "Spiral bound book with computer engineering notes left on PC station 12.",
        "type": "found"
    },
    {
        "id": 11,
        "title": "HP Victus Black Gaming Laptop",
        "category": "Laptops & Accessories",
        "location": "Library 2nd Floor",
        "description": "Black 15.6-inch HP Victus gaming laptop with backlit keyboard and Intel Core i7.",
        "type": "lost"
    },
    {
        "id": 12,
        "title": "HP Victus 15 Gaming Laptop (Mica Silver / Black)",
        "category": "Laptops & Accessories",
        "location": "Library 2nd Floor",
        "description": "Found on study desk 14. Black HP Victus 15 gaming laptop with blue backlit keyboard and desktop wallpaper.",
        "type": "found"
    },
    {
        "id": 13,
        "title": "Sony WH-1000XM4 Over-Ear Bluetooth Headset",
        "category": "Electronics",
        "location": "Library 2nd Floor",
        "description": "Black noise cancelling audio headset with plush earcups and padded headband left in cubicle.",
        "type": "lost"
    },
    {
        "id": 14,
        "title": "Sony WH-1000XM4 Wireless Noise Cancelling Headset (Black)",
        "category": "Electronics",
        "location": "Library 2nd Floor",
        "description": "Black over-ear Bluetooth headphones with cushioned leather earcups found on reading desk.",
        "type": "found"
    },
    {
        "id": 15,
        "title": "Logitech MX Master 3S Ergonomic Mouse",
        "category": "Laptops & Accessories",
        "location": "Computer Center Lab 3",
        "description": "Graphite dark gray wireless mouse with thumb wheel and quiet click buttons.",
        "type": "lost"
    },
    {
        "id": 16,
        "title": "Logitech MX Master 3S Wireless Performance Mouse (Graphite)",
        "category": "Laptops & Accessories",
        "location": "Computer Center Lab 3",
        "description": "Ergonomic Bluetooth optical mouse with MagSpeed electromagnetic scroll wheel found at terminal 18.",
        "type": "found"
    }
]

def generate_pseudo_image_features(category_idx: int, item_id: int, noise_scale: float = 0.05) -> np.ndarray:
    """Generate consistent visual feature vectors (512-dim) clustered by category with instance identity."""
    np.random.seed(category_idx * 1000 + (item_id // 2 if item_id % 2 == 0 else (item_id + 1) // 2))
    base_cluster = np.random.randn(512).astype(np.float32)
    base_cluster /= np.linalg.norm(base_cluster)
    
    # Add instance noise
    np.random.seed(item_id * 77)
    noise = np.random.randn(512).astype(np.float32) * noise_scale
    feat = base_cluster + noise
    return feat / np.linalg.norm(feat)

class MultimodalLostFoundDataset(Dataset):
    """
    Dataset generating pairs of (Query Item, Target Item, Label)
    Label = 1.0 for true matches, 0.0 for non-matches.
    """
    def __init__(self, num_samples: int = 1200):
        super().__init__()
        self.samples = []
        
        # Build match pairs: Watches, Wallets, Chargers, Keys, Books, Laptops, Headsets, Mice
        match_pairs = [(1, 2), (3, 4), (5, 6), (7, 8), (9, 10), (11, 12), (13, 14), (15, 16)]
        
        for _ in range(num_samples // 2):
            # Positive pairs
            pair = match_pairs[np.random.choice(len(match_pairs))]
            lost_item = next(i for i in ITEMS_DATABASE if i["id"] == pair[0])
            found_item = next(i for i in ITEMS_DATABASE if i["id"] == pair[1])
            self.samples.append((lost_item, found_item, 1.0))
            
            # Negative pairs (different items)
            neg_lost = ITEMS_DATABASE[np.random.choice(len(ITEMS_DATABASE))]
            neg_found = ITEMS_DATABASE[np.random.choice(len(ITEMS_DATABASE))]
            while neg_lost["id"] == neg_found["id"] or (neg_lost["id"], neg_found["id"]) in match_pairs:
                neg_found = ITEMS_DATABASE[np.random.choice(len(ITEMS_DATABASE))]
            self.samples.append((neg_lost, neg_found, 0.0))
            
    def __len__(self):
        return len(self.samples)
        
    def __getitem__(self, idx):
        item_a, item_b, label = self.samples[idx]
        
        cat_a = CAMPUS_CATEGORIES.index(item_a["category"]) if item_a["category"] in CAMPUS_CATEGORIES else 9
        cat_b = CAMPUS_CATEGORIES.index(item_b["category"]) if item_b["category"] in CAMPUS_CATEGORIES else 9
        
        loc_a = CAMPUS_LOCATIONS.index(item_a["location"]) if item_a["location"] in CAMPUS_LOCATIONS else 0
        loc_b = CAMPUS_LOCATIONS.index(item_b["location"]) if item_b["location"] in CAMPUS_LOCATIONS else 0
        
        img_a = generate_pseudo_image_features(cat_a, item_a["id"])
        img_b = generate_pseudo_image_features(cat_b, item_b["id"])
        
        return {
            "img_a": torch.tensor(img_a, dtype=torch.float32),
            "img_b": torch.tensor(img_b, dtype=torch.float32),
            "cat_a": torch.tensor(cat_a, dtype=torch.long),
            "cat_b": torch.tensor(cat_b, dtype=torch.long),
            "loc_a": torch.tensor(loc_a, dtype=torch.long),
            "loc_b": torch.tensor(loc_b, dtype=torch.long),
            "desc_len_a": torch.tensor([len(item_a["description"])], dtype=torch.float32),
            "desc_len_b": torch.tensor([len(item_b["description"])], dtype=torch.float32),
            "label": torch.tensor([label], dtype=torch.float32)
        }

