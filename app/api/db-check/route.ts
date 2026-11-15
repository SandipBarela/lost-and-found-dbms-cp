import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const [tables]: any = await pool.query("SHOW TABLES");
    
    // Check all tables including the central claim nexus table
    const [locationCount]: any = await pool.query("SELECT COUNT(*) as count FROM location").catch(() => [{ count: 0 }]);
    const [usersCount]: any = await pool.query("SELECT COUNT(*) as count FROM users").catch(() => [{ count: 0 }]);
    const [lostCount]: any = await pool.query("SELECT COUNT(*) as count FROM lost_item").catch(() => [{ count: 0 }]);
    const [foundCount]: any = await pool.query("SELECT COUNT(*) as count FROM found_item").catch(() => [{ count: 0 }]);
    const [matchCount]: any = await pool.query("SELECT COUNT(*) as count FROM item_matching").catch(() => [{ count: 0 }]);
    const [reviewCount]: any = await pool.query("SELECT COUNT(*) as count FROM review").catch(() => [{ count: 0 }]);
    const [handoverCount]: any = await pool.query("SELECT COUNT(*) as count FROM item_hand_over").catch(() => [{ count: 0 }]);
    const [notifCount]: any = await pool.query("SELECT COUNT(*) as count FROM notification").catch(() => [{ count: 0 }]);
    const [claimCount]: any = await pool.query("SELECT COUNT(*) as count FROM claim").catch(() => [{ count: 0 }]);

    return NextResponse.json({
      connected: true,
      database: process.env.MYSQL_DATABASE || "lost_and_found_db",
      tables: tables.map((t: any) => Object.values(t)[0]),
      records: {
        location: locationCount[0]?.count ?? 0,
        users: usersCount[0]?.count ?? 0,
        lost_item: lostCount[0]?.count ?? 0,
        found_item: foundCount[0]?.count ?? 0,
        item_matching: matchCount[0]?.count ?? 0,
        review: reviewCount[0]?.count ?? 0,
        item_hand_over: handoverCount[0]?.count ?? 0,
        notification: notifCount[0]?.count ?? 0,
        claim: claimCount[0]?.count ?? 0,
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      connected: false,
      database: process.env.MYSQL_DATABASE || "lost_and_found_db",
      error: error.message,
      help: "Ensure your MySQL server is running on localhost:3306 and password in .env.local matches your root password."
    }, { status: 500 });
  }
}

