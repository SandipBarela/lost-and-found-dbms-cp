import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

const SEED_NOTIFICATIONS = [
  {
    id: "notif-1",
    type: "match",
    title: "AI Match Alert: 92% Match Found!",
    message: "A 'Smart Watch Silver Case' was registered at Library 2nd Floor matching your reported Apple Watch SE.",
    timestamp: "5 minutes ago",
    read: false,
    itemId: 2
  },
  {
    id: "notif-2",
    type: "handover",
    title: "Handover Token Generated",
    message: "Security Handover Pass 'RET-482910-0084' is approved for pick up at Central Security Desk Counter 2.",
    timestamp: "25 minutes ago",
    read: false,
    token: "RET-482910-0084"
  },
  {
    id: "notif-3",
    type: "item_found",
    title: "New Item Handed In: Dell Charger",
    message: "A 130W USB-C Dell adapter was registered at Engineering Hall B-104. Check if this is yours.",
    timestamp: "2 hours ago",
    read: true,
    itemId: 3
  },
  {
    id: "notif-4",
    type: "system",
    title: "Database Sync Successful",
    message: "Campus database synchronized 4 new lost and found logs across lecture halls.",
    timestamp: "Yesterday",
    read: true
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  try {
    try {
      let query = `
        SELECT 
          CONCAT('notif-', notification_id) as id,
          type,
          title,
          message,
          DATE_FORMAT(created_at, '%b %d, %h:%i %p') as timestamp,
          is_read as \`read\`,
          related_item_id as itemId
        FROM notification
      `;
      const params: any[] = [];

      if (userId) {
        query += " WHERE user_id = ?";
        params.push(userId);
      }
      query += " ORDER BY created_at DESC LIMIT 20";

      const [rows]: any = await pool.query(query, params);

      if (rows && rows.length > 0) {
        return NextResponse.json({ success: true, notifications: rows, source: "mysql" });
      }
    } catch (dbErr: any) {
      console.warn("MySQL Notification GET Error:", dbErr.message);
    }

    return NextResponse.json({ success: true, notifications: SEED_NOTIFICATIONS, source: "seed" });
  } catch (error: any) {
    return NextResponse.json({ success: false, notifications: SEED_NOTIFICATIONS, error: error.message }, { status: 500 });
  }
}

// Mark notifications as read or clear
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { action, notificationId } = body;

    try {
      if (action === "mark_all_read") {
        await pool.query("UPDATE notification SET is_read = TRUE");
      } else if (notificationId) {
        const numId = parseInt(notificationId.replace(/[^0-9]/g, ""), 10);
        await pool.execute("UPDATE notification SET is_read = TRUE WHERE notification_id = ?", [numId]);
      }

      return NextResponse.json({ success: true });
    } catch (dbErr: any) {
      console.warn("MySQL Notification PATCH Error:", dbErr.message);
      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

