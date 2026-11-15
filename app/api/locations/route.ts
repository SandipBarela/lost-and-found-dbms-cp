import { NextResponse } from "next/server";
import pool from "@/lib/db";

// Fallback campus locations if MySQL connection is offline
const FALLBACK_LOCATIONS = [
  { location_id: 1, building_name: "Library", floor_room: "Floor 2, Room 101", campus_zone: "Central Campus" },
  { location_id: 2, building_name: "Student Center", floor_room: "Floor 3, Room 102", campus_zone: "North Campus" },
  { location_id: 3, building_name: "Engineering Hall", floor_room: "Floor 4, Room 103", campus_zone: "East Wing" },
  { location_id: 4, building_name: "Science Complex", floor_room: "Floor 1, Room 104", campus_zone: "South Campus" },
  { location_id: 5, building_name: "Management Block", floor_room: "Floor 2, Room 105", campus_zone: "West Wing" },
  { location_id: 6, building_name: "Central Security Desk", floor_room: "Floor 3, Room 106", campus_zone: "Main Gate" },
  { location_id: 7, building_name: "Sports Complex", floor_room: "Floor 4, Room 107", campus_zone: "Central Campus" },
  { location_id: 8, building_name: "Auditorium", floor_room: "Floor 1, Room 108", campus_zone: "North Campus" },
  { location_id: 9, building_name: "Hostel Block A", floor_room: "Floor 2, Room 109", campus_zone: "East Wing" },
  { location_id: 10, building_name: "Hostel Block B", floor_room: "Floor 3, Room 110", campus_zone: "South Campus" },
  { location_id: 11, building_name: "Computer Center Lab", floor_room: "Floor 4, Room 111", campus_zone: "West Wing" },
  { location_id: 12, building_name: "Cafeteria Wing", floor_room: "Floor 1, Room 112", campus_zone: "Main Gate" },
  { location_id: 13, building_name: "Civil Engineering Lab", floor_room: "Floor 2, Room 113", campus_zone: "Central Campus" },
  { location_id: 14, building_name: "Robotics Center", floor_room: "Floor 3, Room 114", campus_zone: "North Campus" },
  { location_id: 15, building_name: "Design Studio", floor_room: "Floor 4, Room 115", campus_zone: "East Wing" }
];

export async function GET() {
  try {
    const [rows]: any = await pool.query(`
      SELECT 
        location_id, 
        building_name, 
        floor_room, 
        campus_zone, 
        description,
        CONCAT(building_name, IF(floor_room IS NOT NULL AND floor_room != '' AND floor_room != 'General Area', CONCAT(' - ', floor_room), ''), IF(campus_zone IS NOT NULL AND campus_zone != '', CONCAT(' (', campus_zone, ')'), '')) AS full_display_name
      FROM location 
      ORDER BY building_name ASC, floor_room ASC
    `);

    if (rows && rows.length > 0) {
      return NextResponse.json({ success: true, locations: rows, source: "mysql" });
    }
    return NextResponse.json({ success: true, locations: FALLBACK_LOCATIONS, source: "fallback" });
  } catch (error: any) {
    console.warn("MySQL Location Fetch Error, using fallbacks:", error.message);
    return NextResponse.json({ success: true, locations: FALLBACK_LOCATIONS, source: "fallback" });
  }
}
