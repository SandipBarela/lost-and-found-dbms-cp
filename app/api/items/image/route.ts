import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

const CATEGORY_IMAGES: Record<string, string[]> = {
  "Laptops & Accessories": [
    "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80"
  ],
  "Electronics": [
    "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"
  ],
  "ID Cards & Wallets": [
    "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80"
  ],
  "Keys & Badges": [
    "https://images.unsplash.com/photo-1666346166849-8443c47f50fa?auto=format&fit=crop&w=600&q=80"
  ],
  "Books & Stationery": [
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"
  ],
  "Clothing & Bags": [
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80"
  ],
  "Jewelry & Watches": [
    "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80"
  ],
  "Eyewear": [
    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80"
  ],
  "Sports Gear": [
    "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80"
  ],
  "Lab Equipment": [
    "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=600&q=80"
  ]
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type") || "found"; // "lost" or "found"

  if (!id) {
    return new NextResponse("Item ID required", { status: 400 });
  }

  try {
    const table = type === "lost" ? "lost_item" : "found_item";
    const idCol = type === "lost" ? "lost_id" : "found_id";

    const [rows]: any = await pool.execute(
      `SELECT category, image_data, image_mime FROM ${table} WHERE ${idCol} = ? LIMIT 1`,
      [id]
    );

    if (rows && rows.length > 0) {
      const { category, image_data, image_mime } = rows[0];

      if (image_data && Buffer.isBuffer(image_data)) {
        const str = image_data.toString("utf8", 0, 10);
        if (str.startsWith("http://") || str.startsWith("https://")) {
          return NextResponse.redirect(image_data.toString("utf8"));
        }

        // Only stream if it's a real photo (> 250 bytes, not the 1x1 dummy transparent pixel)
        if (image_data.length > 250) {
          return new NextResponse(new Uint8Array(image_data), {
            status: 200,
            headers: {
              "Content-Type": image_mime || "image/jpeg",
              "Cache-Control": "public, max-age=86400, immutable",
              "Content-Length": String(image_data.length)
            }
          });
        }
      }

      // Fallback category photo
      const list = CATEGORY_IMAGES[category] || [
        "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80"
      ];
      const idx = Math.abs(parseInt(id, 10) || 0) % list.length;
      return NextResponse.redirect(list[idx]);
    }

    return NextResponse.redirect(
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80"
    );
  } catch (error: any) {
    return NextResponse.redirect(
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80"
    );
  }
}
