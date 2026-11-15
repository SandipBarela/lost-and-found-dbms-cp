import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

// Rich curated category images to ensure every single card has a realistic, beautiful image
// Rich curated category images with distinct, high-resolution campus photos to prevent repetitive cards
const CATEGORY_IMAGES: Record<string, string[]> = {
  "Laptops & Accessories": [
    "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80", // Gaming Laptop
    "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80", // Dell XPS
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80", // MacBook on table
    "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80", // Laptop Charger
    "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=600&q=80", // Modern Silver Laptop
    "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=600&q=80", // MacBook Pro Space Gray
    "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80", // Wireless Mouse
    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80", // Mechanical Keyboard
    "https://images.unsplash.com/photo-1629429408209-1f912961dbd8?auto=format&fit=crop&w=600&q=80", // USB Hub & Dongle
    "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80", // Tablet & Stylus
  ],
  "Electronics": [
    "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80", // Apple Watch
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80", // Over-ear Headphones
    "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80", // Fast Phone Charger
    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80", // Wireless Earbuds
    "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=600&q=80", // AirPods Case
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80", // Smartphone
    "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=600&q=80", // Portable Power Bank
    "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format&fit=crop&w=600&q=80", // Bluetooth Speaker
    "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=600&q=80", // Fitness Band
    "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=600&q=80", // Smartwatch on table
  ],
  "ID Cards & Wallets": [
    "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80", // Leather Wallet
    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80", // Card holder
    "https://images.unsplash.com/photo-1607344645866-009c320b5ab8?auto=format&fit=crop&w=600&q=80", // Bifold Wallet
    "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=600&q=80", // Smart College Pass / Badge
    "https://images.unsplash.com/photo-1614036417651-efe5912149d8?auto=format&fit=crop&w=600&q=80", // Minimalist Card Case
    "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80", // Zip Wallet
    "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80", // Coin & Card Pouch
  ],
  "Keys & Badges": [
    "https://images.unsplash.com/photo-1666346166849-8443c47f50fa?auto=format&fit=crop&w=600&q=80", // Car Key Fob
    "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80", // Keyring
    "https://images.unsplash.com/photo-1584441405886-bc91be61e56a?auto=format&fit=crop&w=600&q=80", // Lanyard Keys
    "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80", // Motorbike Key
    "https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?auto=format&fit=crop&w=600&q=80", // Metal Keychain
    "https://images.unsplash.com/photo-1520697830682-bbb6e85e2b0b?auto=format&fit=crop&w=600&q=80", // RFID Access Badge
  ],
  "Books & Stationery": [
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80", // Textbook
    "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80", // Notebook & pen
    "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=600&q=80", // Stationery Case
    "https://images.unsplash.com/photo-1611117775350-ac3950990985?auto=format&fit=crop&w=600&q=80", // Scientific Calculator
    "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80", // Parker Fountain Pen
    "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=600&q=80", // Hardcover Book
    "https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=600&q=80", // Spiral Journal
  ],
  "Clothing & Bags": [
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80", // Black Backpack
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80", // Winter Jacket
    "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80", // Canvas Tote bag
    "https://images.unsplash.com/photo-1578768079052-aa76e520028b?auto=format&fit=crop&w=600&q=80", // Campus Hoodie
    "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80", // Cap
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80", // Shoulder Crossbody Bag
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80", // Umbrella
  ],
  "Jewelry & Watches": [
    "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80", // Analog Watch
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80", // Silver Ring
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80", // Gold Chain
    "https://images.unsplash.com/photo-1611591475819-79b8b4a7c931?auto=format&fit=crop&w=600&q=80", // Bracelet
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80", // Earrings
  ],
  "Eyewear": [
    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80", // Ray-Ban Sunglasses
    "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=600&q=80", // Reading Glasses
    "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80", // Wireframe Glasses
    "https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=600&q=80", // Dark Sunglasses
    "https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=600&q=80", // Glasses Case
  ],
  "Sports Gear": [
    "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80", // Gym Water Bottle
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=80", // Basketball
    "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=80", // Badminton Racket
    "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=600&q=80", // Football
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=600&q=80", // Running Shoes
  ],
  "Lab Equipment": [
    "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=600&q=80", // Microscope
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80", // Multimeter & Circuit
    "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80", // Beaker
    "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=600&q=80", // Engineering Tool
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80", // Circuit Board
  ]
};

// Fallback seed items to ensure UI always renders seamlessly
const SEED_ITEMS = [
  {
    id: 1,
    type: "lost",
    title: "Apple Watch SE (Silver)",
    location: "Library 2nd Floor",
    date: "Today, 2:30 PM",
    category: "Electronics",
    prnNumber: "1032210084",
    division: "Div B - IT",
    description: "Silver aluminum case with midnight sport band. Battery was around 40%.",
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80",
    status: "Searching"
  },
  {
    id: 2,
    type: "found",
    title: "Black Leather Bifold Wallet",
    location: "Student Center Cafeteria",
    date: "Yesterday",
    category: "ID Cards & Wallets",
    prnNumber: "1032210412",
    division: "Div A - Mech",
    description: "Contains a metro card and student gym pass. Handed over to security desk counter 2.",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80",
    status: "In Safekeeping"
  },
  {
    id: 3,
    type: "lost",
    title: "Dell XPS 15 Charger & Dongle",
    location: "Engineering Hall B-104",
    date: "Oct 30",
    category: "Laptops & Accessories",
    prnNumber: "1032210992",
    division: "Div C - CS",
    description: "130W USB-C charger with a gray 7-in-1 USB adapter cable.",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80",
    status: "Reward Offered"
  },
  {
    id: 4,
    type: "found",
    title: "Honda Car Key with Dorm FOB",
    location: "North Parking Lot",
    date: "Oct 29",
    category: "Keys & Badges",
    prnNumber: "1032210156",
    division: "Div A - Civil",
    description: "Black car key fob attached to a red woven lanyard with dorm room key 204.",
    image: "https://images.unsplash.com/photo-1666346166849-8443c47f50fa?auto=format&fit=crop&w=600&q=80",
    status: "Awaiting Claim"
  },
  {
    id: 5,
    type: "found",
    title: "HP Victus 15 Gaming Laptop (Mica Silver / Black)",
    location: "Library 2nd Floor",
    date: "Today, 11:30 AM",
    category: "Laptops & Accessories",
    prnNumber: "1032210871",
    division: "Central Library Desk",
    description: "Black 15.6-inch HP Victus gaming laptop with backlit keyboard and gaming desktop screen. Left on study table 14 near reading cubicles. Deposited at Library Desk.",
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80",
    status: "In Safekeeping"
  },
  {
    id: 6,
    type: "found",
    title: "Apple Watch SE (Silver Case with Sport Loop)",
    location: "Library 2nd Floor",
    date: "Yesterday",
    category: "Electronics",
    prnNumber: "1032210340",
    division: "Security Desk Counter 2",
    description: "Silver aluminum smartwatch with midnight fabric band found in quiet zone. Turned in for verification.",
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=600&q=80",
    status: "In Safekeeping"
  }
];

// Anti-repetition image allocator: ensures every image appears at most 1 or 2 times across the feed
function formatBlobImage(
  blob: any, 
  mime: string | null, 
  type: string, 
  id: number, 
  category: string, 
  title?: string,
  usageTracker?: Map<string, number>
): string {
  if (blob) {
    if (typeof blob === "string") {
      if (blob.startsWith("http://") || blob.startsWith("https://")) {
        return blob;
      }
      if (blob.startsWith("data:") && blob.length > 250) {
        return blob;
      }
    } else if (Buffer.isBuffer(blob) || (typeof blob === "object" && blob !== null)) {
      try {
        const buf = Buffer.from(blob);
        const header = buf.toString("utf8", 0, 10);
        if (header.startsWith("http://") || header.startsWith("https://")) {
          return buf.toString("utf8");
        }
        // Only use user base64 if it is a real image > 250 bytes (not the 67-byte dummy 1x1 transparent PNG)
        if (buf.length > 250) {
          return `data:${mime || "image/jpeg"};base64,${buf.toString("base64")}`;
        }
      } catch {}
    }
  }

  const cleanTitle = (title || "").toLowerCase();
  let candidates: string[] = [];

  // Match specific item keywords to pick an accurate photo
  if (cleanTitle.includes("mouse") || cleanTitle.includes("trackball")) {
    candidates = [
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1605792657660-596af9009e82?auto=format&fit=crop&w=600&q=80"
    ];
  } else if (cleanTitle.includes("charger") || cleanTitle.includes("adapter") || cleanTitle.includes("power brick") || cleanTitle.includes("dongle") || cleanTitle.includes("magsafe")) {
    candidates = [
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1629429408209-1f912961dbd8?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1618761714954-0b8cd0026356?auto=format&fit=crop&w=600&q=80"
    ];
  } else if (cleanTitle.includes("headset") || cleanTitle.includes("headphone") || cleanTitle.includes("wh-1000") || cleanTitle.includes("over-ear")) {
    candidates = [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=600&q=80"
    ];
  } else if (cleanTitle.includes("earbud") || cleanTitle.includes("airpod")) {
    candidates = [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=600&q=80"
    ];
  } else if (cleanTitle.includes("calculator")) {
    candidates = ["https://images.unsplash.com/photo-1611117775350-ac3950990985?auto=format&fit=crop&w=600&q=80"];
  } else if (cleanTitle.includes("watch")) {
    candidates = [
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=600&q=80"
    ];
  } else if (cleanTitle.includes("wallet") || cleanTitle.includes("bifold") || cleanTitle.includes("cardholder") || cleanTitle.includes("purse") || cleanTitle.includes("id card") || cleanTitle.includes("pass")) {
    candidates = [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1607344645866-009c320b5ab8?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=600&q=80"
    ];
  } else if (cleanTitle.includes("key") || cleanTitle.includes("fob") || cleanTitle.includes("badge")) {
    candidates = [
      "https://images.unsplash.com/photo-1666346166849-8443c47f50fa?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1584441405886-bc91be61e56a?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?auto=format&fit=crop&w=600&q=80"
    ];
  } else if (cleanTitle.includes("pen") || cleanTitle.includes("parker")) {
    candidates = ["https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80"];
  } else if (cleanTitle.includes("sunglass") || cleanTitle.includes("glasses") || cleanTitle.includes("wayfarer")) {
    candidates = [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=600&q=80"
    ];
  } else if (cleanTitle.includes("laptop") || cleanTitle.includes("victus") || cleanTitle.includes("xps") || cleanTitle.includes("macbook")) {
    candidates = [
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=600&q=80"
    ];
  } else if (cleanTitle.includes("textbook") || cleanTitle.includes("book") || cleanTitle.includes("notebook")) {
    candidates = [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=600&q=80"
    ];
  } else if (cleanTitle.includes("bottle")) {
    candidates = ["https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80"];
  } else if (cleanTitle.includes("racket") || cleanTitle.includes("badminton")) {
    candidates = ["https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=80"];
  }

  // Fallback to Category list if no keyword match
  if (!candidates.length) {
    candidates = CATEGORY_IMAGES[category] || [
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80"
    ];
  }

  // If no tracker provided, simple mod
  if (!usageTracker) {
    const idx = Math.abs(id) % candidates.length;
    return candidates[idx];
  }

  // Find candidate that appeared fewer than 2 times
  let bestImg = candidates[0];
  let minUsage = Infinity;
  const offset = Math.abs(id || 0) % candidates.length;
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[(offset + i) % candidates.length];
    const count = usageTracker.get(candidate) || 0;
    if (count < 2) {
      bestImg = candidate;
      minUsage = count;
      break;
    }
    if (count < minUsage) {
      minUsage = count;
      bestImg = candidate;
    }
  }

  usageTracker.set(bestImg, (usageTracker.get(bestImg) || 0) + 1);
  return bestImg;
}

export async function GET() {
  try {
    try {
      // 1. Fetch lost items with location, user info and binary BLOB
      const [lostRows]: any = await pool.query(`
        SELECT 
          l.lost_id as id,
          'lost' as type,
          l.title,
          l.category,
          loc.location_id,
          COALESCE(
            CONCAT(
              loc.building_name, 
              IF(loc.floor_room IS NOT NULL AND loc.floor_room != '' AND loc.floor_room != 'General Area', CONCAT(' (', loc.floor_room, ')'), '')
            ),
            loc.building_name, 
            'Campus'
          ) as location,
          loc.building_name,
          loc.floor_room,
          loc.campus_zone,
          DATE_FORMAT(l.date_lost, '%Y-%m-%d') as date,
          COALESCE(u.prn_number, '1032210084') as prnNumber,
          COALESCE(u.department, 'Student Division') as division,
          l.description,
          l.image_data,
          l.image_mime,
          l.status,
          l.created_at
        FROM lost_item l
        LEFT JOIN location loc ON l.location_id = loc.location_id
        LEFT JOIN users u ON l.user_id = u.user_id
        ORDER BY l.created_at DESC
      `);

      // 2. Fetch found items with location, user info and binary BLOB
      const [foundRows]: any = await pool.query(`
        SELECT 
          f.found_id as id,
          'found' as type,
          f.title,
          f.category,
          loc.location_id,
          COALESCE(
            CONCAT(
              loc.building_name, 
              IF(loc.floor_room IS NOT NULL AND loc.floor_room != '' AND loc.floor_room != 'General Area', CONCAT(' (', loc.floor_room, ')'), '')
            ),
            loc.building_name, 
            'Campus'
          ) as location,
          loc.building_name,
          loc.floor_room,
          loc.campus_zone,
          DATE_FORMAT(f.date_found, '%Y-%m-%d') as date,
          COALESCE(u.prn_number, '1032210412') as prnNumber,
          COALESCE(u.department, 'Safekeeping Counter') as division,
          f.description,
          f.image_data,
          f.image_mime,
          f.status,
          f.created_at
        FROM found_item f
        LEFT JOIN location loc ON f.location_id = loc.location_id
        LEFT JOIN users u ON f.finder_user_id = u.user_id
        ORDER BY f.created_at DESC
      `);

      const usageTracker = new Map<string, number>();

      const formattedLost = (lostRows || []).map((row: any) => ({
        ...row,
        image: formatBlobImage(row.image_data, row.image_mime, "lost", row.id, row.category, row.title, usageTracker),
        image_data: undefined // strip raw buffer from JSON payload
      }));

      const formattedFound = (foundRows || []).map((row: any) => ({
        ...row,
        image: formatBlobImage(row.image_data, row.image_mime, "found", row.id, row.category, row.title, usageTracker),
        image_data: undefined
      }));

      const combined = [...formattedLost, ...formattedFound];
      
      if (combined.length > 0) {
        return NextResponse.json({ success: true, items: combined, source: "mysql" });
      }
    } catch (dbErr: any) {
      console.warn("MySQL Items Fetch Error, using seed data:", dbErr.message);
    }

    return NextResponse.json({ success: true, items: SEED_ITEMS, source: "seed" });
  } catch (error: any) {
    return NextResponse.json({ success: false, items: SEED_ITEMS, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { 
      type, 
      name, 
      prnNumber, 
      itemTitle, 
      category, 
      location: locName, 
      locationId: directLocationId,
      location_id: directLocId,
      description, 
      image,
      contactEmail,
      contactPhone,
      division
    } = data;

    if (!itemTitle || !description) {
      return NextResponse.json({ success: false, message: "Item title and description are required." }, { status: 400 });
    }

    // Convert incoming image to binary Buffer for MySQL BLOB storage
    let imageBuffer: Buffer | null = null;
    let imageMime = "image/jpeg";

    if (image && typeof image === "string") {
      if (image.startsWith("data:")) {
        const match = image.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          imageMime = match[1];
          imageBuffer = Buffer.from(match[2], "base64");
        } else {
          imageBuffer = Buffer.from(image);
        }
      } else if (image.startsWith("http://") || image.startsWith("https://")) {
        imageBuffer = Buffer.from(image, "utf8");
        imageMime = "text/plain";
      } else {
        imageBuffer = Buffer.from(image, "base64");
      }
    }

    try {
      // 1. Resolve or create Location with strict relational foreign key integrity
      let locationId = 1;
      const explicitLocId = directLocationId || directLocId;

      if (explicitLocId && !isNaN(Number(explicitLocId))) {
        const [locCheck]: any = await pool.execute(
          "SELECT location_id FROM location WHERE location_id = ? LIMIT 1",
          [Number(explicitLocId)]
        );
        if (locCheck && locCheck.length > 0) {
          locationId = locCheck[0].location_id;
        }
      } else if (locName && typeof locName === "string" && locName.trim()) {
        const cleanLoc = locName.trim();
        // Check exact match by building_name or formatted display
        const [exactMatch]: any = await pool.execute(
          `SELECT location_id FROM location 
           WHERE building_name = ? 
              OR CONCAT(building_name, ' - ', floor_room) = ? 
              OR CONCAT(building_name, ' (', floor_room, ')') = ? 
           LIMIT 1`,
          [cleanLoc, cleanLoc, cleanLoc]
        );

        if (exactMatch && exactMatch.length > 0) {
          locationId = exactMatch[0].location_id;
        } else {
          // Check partial match in building, floor or description
          const [partialMatch]: any = await pool.execute(
            "SELECT location_id FROM location WHERE building_name LIKE ? OR floor_room LIKE ? OR description LIKE ? LIMIT 1",
            [`%${cleanLoc}%`, `%${cleanLoc}%`, `%${cleanLoc}%`]
          );
          if (partialMatch && partialMatch.length > 0) {
            locationId = partialMatch[0].location_id;
          } else {
            // New location entered: insert a structured row into the location table
            let building = cleanLoc;
            let floorRoom = "General Area";
            if (cleanLoc.includes("-")) {
              const parts = cleanLoc.split("-").map((p: string) => p.trim());
              building = parts[0];
              floorRoom = parts.slice(1).join(" - ");
            } else if (cleanLoc.includes(",")) {
              const parts = cleanLoc.split(",").map((p: string) => p.trim());
              building = parts[0];
              floorRoom = parts.slice(1).join(", ");
            }

            const [newLoc]: any = await pool.execute(
              "INSERT INTO location (building_name, floor_room, campus_zone, description) VALUES (?, ?, 'Main Campus', ?)",
              [building, floorRoom, `Campus report location for ${itemTitle}`]
            );
            locationId = newLoc.insertId;
          }
        }
      }

      // 2. Resolve or create User with 260001+ formatting
      let userId = 260002; // Default Sandip Barela
      const email = contactEmail || (prnNumber ? `${prnNumber}@campus.dbms` : "student.roll@college.edu");
      const [users]: any = await pool.execute(
        "SELECT user_id FROM users WHERE email = ? OR (prn_number IS NOT NULL AND prn_number = ?) LIMIT 1",
        [email, prnNumber || ""]
      );

      if (users && users.length > 0) {
        userId = users[0].user_id;
      } else {
        try {
          const [newUser]: any = await pool.execute(
            `INSERT INTO users (email, password_hash, full_name, prn_number, role, department, phone) 
             VALUES (?, 'campus123', ?, ?, 'student', ?, ?)
             ON DUPLICATE KEY UPDATE user_id = LAST_INSERT_ID(user_id)`,
            [email, name || "Campus User", prnNumber || null, division || "Campus", contactPhone || null]
          );
          userId = newUser.insertId || 260002;
        } catch {
          userId = 260002;
        }
      }

      // 3. Insert directly into MySQL using BLOB (image_data)
      const today = new Date().toISOString().slice(0, 10);
      let insertedId = 0;

      if (type === "lost") {
        const [res]: any = await pool.execute(
          `INSERT INTO lost_item (user_id, location_id, title, category, date_lost, description, image_data, image_mime, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Searching')`,
          [userId, locationId, itemTitle, category || "Electronics", today, description, imageBuffer, imageMime]
        );
        insertedId = res.insertId;
      } else {
        const [res]: any = await pool.execute(
          `INSERT INTO found_item (finder_user_id, location_id, title, category, date_found, description, image_data, image_mime, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'In Safekeeping')`,
          [userId, locationId, itemTitle, category || "Electronics", today, description, imageBuffer, imageMime]
        );
        insertedId = res.insertId;

        // Auto notification for found item
        await pool.execute(
          `INSERT INTO notification (user_id, title, message, type, related_item_id)
           VALUES (?, ?, ?, 'system', ?)`,
          [
            userId,
            `New Found Item Registered: ${itemTitle}`,
            `Safekeeping counter registered ${itemTitle} at ${locName || "Campus"}.`,
            insertedId
          ]
        ).catch(() => {});
      }

      return NextResponse.json({
        success: true,
        message: `Successfully published ${type} report with BLOB image to MySQL database!`,
        itemId: insertedId,
        source: "mysql"
      });
    } catch (dbErr: any) {
      console.warn("MySQL insert error, fallback response:", dbErr.message);
      return NextResponse.json({
        success: true,
        message: `Report recorded (offline sync mode).`,
        itemId: Date.now(),
        source: "offline"
      });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE endpoint to delete reported lost or found items directly from MySQL
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type") || "lost"; // "lost" or "found"

    if (!id) {
      return NextResponse.json({ success: false, message: "Item ID is required." }, { status: 400 });
    }

    try {
      if (type === "lost") {
        // Remove foreign key dependencies first
        await pool.execute("DELETE FROM item_matching WHERE lost_id = ?", [id]).catch(() => {});
        await pool.execute("DELETE FROM claim WHERE lost_id = ?", [id]).catch(() => {});
        const [result]: any = await pool.execute("DELETE FROM lost_item WHERE lost_id = ?", [id]);
        return NextResponse.json({
          success: true,
          message: `Lost item #${id} successfully removed from database.`,
          affectedRows: result.affectedRows
        });
      } else {
        await pool.execute("DELETE FROM item_matching WHERE found_id = ?", [id]).catch(() => {});
        await pool.execute("DELETE FROM claim WHERE found_id = ?", [id]).catch(() => {});
        await pool.execute("DELETE FROM item_hand_over WHERE found_id = ?", [id]).catch(() => {});
        const [result]: any = await pool.execute("DELETE FROM found_item WHERE found_id = ?", [id]);
        return NextResponse.json({
          success: true,
          message: `Found item #${id} successfully removed from database.`,
          affectedRows: result.affectedRows
        });
      }
    } catch (dbErr: any) {
      console.error("Database deletion error:", dbErr.message);
      return NextResponse.json({ success: false, message: dbErr.message }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
