const pool = require("../config/db");

/**
 * DEPTH REFERRAL (D1–D6)
 */
exports.processDepthReferral = async(buyerId, ticketPrice) => {
    let currentUserId = buyerId;

    for (let level = 1; level <= 6; level++) {
        const userRes = await pool.query(
            "SELECT referred_by FROM users WHERE id = $1", [currentUserId]
        );

        // ✅ BULLETPROOF CHECK (no optional chaining)
        if (!userRes.rows.length || !userRes.rows[0].referred_by) {
            break;
        }

        const parentId = userRes.rows[0].referred_by;

        const ruleRes = await pool.query(
            "SELECT percentage FROM referral_depth_rules WHERE level = $1", [level]
        );

        if (!ruleRes.rows.length) break;

        const percent = Number(ruleRes.rows[0].percentage);
        const amount = (ticketPrice * percent) / 100;

        // Update wallet
        await pool.query(
            "UPDATE wallets SET balance = balance + $1 WHERE user_id = $2", [amount, parentId]
        );

        // Log income
        await pool.query(
            `INSERT INTO income_logs (user_id, income_type, amount)
       VALUES ($1, $2, $3)`, [parentId, `REFERRAL_D${level}`, amount]
        );

        currentUserId = parentId;
    }
};

/**
 * WIDTH REFERRAL (W1–W9)
 */
exports.processWidthReferral = async(userId) => {
    const refCountRes = await pool.query(
        "SELECT COUNT(*) FROM users WHERE referred_by = $1", [userId]
    );

    const count = Number(refCountRes.rows[0].count);

    const ruleRes = await pool.query(
        "SELECT reward_amount FROM referral_width_rules WHERE required_referrals = $1", [count]
    );

    if (!ruleRes.rows.length) return;

    const reward = Number(ruleRes.rows[0].reward_amount);

    // Update wallet
    await pool.query(
        "UPDATE wallets SET balance = balance + $1 WHERE user_id = $2", [reward, userId]
    );

    // Log income
    await pool.query(
        `INSERT INTO income_logs (user_id, income_type, amount)
     VALUES ($1, $2, $3)`, [userId, "REFERRAL_WIDTH", reward]
    );
};