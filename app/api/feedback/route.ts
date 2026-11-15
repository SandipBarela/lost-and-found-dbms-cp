import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

async function ensureFeedbackTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        feedback_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        claim_id INT NULL,
        found_id INT NULL,
        rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        category VARCHAR(60) NOT NULL DEFAULT 'Platform Experience',
        comments TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'Submitted',
        admin_notes VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        CONSTRAINT fk_feedback_claim FOREIGN KEY (claim_id) REFERENCES claim(claim_id) ON DELETE SET NULL,
        CONSTRAINT fk_feedback_found FOREIGN KEY (found_id) REFERENCES found_item(found_id) ON DELETE SET NULL
      ) ENGINE=InnoDB AUTO_INCREMENT=1;
    `);
  } catch (err) {
    console.error("ensureFeedbackTable error:", err);
  }
}

export async function GET(request: Request) {
  try {
    await ensureFeedbackTable();

    const [rows]: any = await pool.query(`
      SELECT 
        f.feedback_id,
        f.user_id,
        f.claim_id,
        f.found_id,
        f.rating,
        f.category,
        f.comments,
        f.status,
        f.admin_notes,
        f.created_at,
        u.full_name AS student_name,
        u.prn_number,
        u.department,
        fi.title AS item_title,
        c.claim_code
      FROM feedback f
      LEFT JOIN users u ON f.user_id = u.user_id
      LEFT JOIN found_item fi ON f.found_id = fi.found_id
      LEFT JOIN claim c ON f.claim_id = c.claim_id
      ORDER BY f.created_at DESC
      LIMIT 100;
    `);

    // Calculate aggregated statistics
    let totalRating = 0;
    let fiveStarCount = 0;
    const categoryCounts: Record<string, number> = {};

    rows.forEach((row: any) => {
      totalRating += Number(row.rating) || 0;
      if (Number(row.rating) === 5) fiveStarCount++;
      const cat = row.category || "General";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const totalFeedback = rows.length;
    const averageRating = totalFeedback > 0 ? (totalRating / totalFeedback).toFixed(1) : "5.0";

    return NextResponse.json({
      success: true,
      feedback: rows,
      stats: {
        totalFeedback,
        averageRating: Number(averageRating),
        fiveStarCount,
        categoryCounts
      }
    });
  } catch (error: any) {
    console.error("GET /api/feedback error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureFeedbackTable();
    const body = await request.json();

    const {
      prnNumber,
      email,
      fullName,
      rating,
      category = "Platform Experience",
      comments,
      claimId = null,
      foundId = null
    } = body;

    const numericRating = Math.max(1, Math.min(5, Number(rating) || 5));

    if (!comments || comments.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Please enter your feedback comments." },
        { status: 400 }
      );
    }

    // Resolve user_id from users table
    let userId: number | null = null;

    if (prnNumber || email) {
      const [userRows]: any = await pool.query(
        "SELECT user_id FROM users WHERE prn_number = ? OR email = ? LIMIT 1",
        [prnNumber || "", email || ""]
      );
      if (userRows.length > 0) {
        userId = userRows[0].user_id;
      }
    }

    // If user not found, find any existing user or create student
    if (!userId) {
      if (email || prnNumber) {
        try {
          const defaultEmail = email || `student.${prnNumber || Date.now()}@reunite.edu`;
          const defaultName = fullName || `Student ${prnNumber || ""}`.trim() || "Campus Student";
          const [insertUser]: any = await pool.query(
            `INSERT INTO users (email, password_hash, full_name, prn_number, role, department) 
             VALUES (?, 'pbkdf2_hash_placeholder', ?, ?, 'student', 'General')`,
            [defaultEmail, defaultName, prnNumber || null]
          );
          userId = insertUser.insertId;
        } catch (e) {
          // Fallback to first existing user
          const [firstUser]: any = await pool.query("SELECT user_id FROM users LIMIT 1");
          userId = firstUser.length > 0 ? firstUser[0].user_id : 260001;
        }
      } else {
        const [firstUser]: any = await pool.query("SELECT user_id FROM users LIMIT 1");
        userId = firstUser.length > 0 ? firstUser[0].user_id : 260001;
      }
    }

    // Insert into feedback table
    const [result]: any = await pool.query(
      `INSERT INTO feedback (user_id, claim_id, found_id, rating, category, comments, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'Submitted')`,
      [userId, claimId || null, foundId || null, numericRating, category, comments.trim()]
    );

    // Create user notification acknowledging feedback
    try {
      await pool.query(
        `INSERT INTO notification (user_id, title, message, type) 
         VALUES (?, 'Feedback Submitted', ?, 'system')`,
        [
          userId,
          `Thank you for rating ReUnite with ${numericRating} stars! Your review helps make our campus lost & found network faster and more trustworthy.`
        ]
      );
    } catch (notifErr) {
      console.warn("Could not insert acknowledgment notification:", notifErr);
    }

    return NextResponse.json({
      success: true,
      feedbackId: result.insertId,
      message: "Feedback submitted successfully! Thank you for helping improve ReUnite."
    });
  } catch (error: any) {
    console.error("POST /api/feedback error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit feedback" },
      { status: 500 }
    );
  }
}
