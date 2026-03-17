const pool = require("../config/db");

/**
 * DEPTH REFERRAL (D1–D6)
 * Logic: Pays a % of ticket price to uplines 6 levels up.
 */
exports.processDepthReferral = async(buyerId, ticketPrice) => {
    let currentUserId = buyerId;

    for (let level = 1; level <= 6; level++) {
        // Find the parent (referrer) of the current user
        const userRes = await pool.query(
            "SELECT referred_by FROM users WHERE id = $1", [currentUserId]
        );

        if (userRes.rows.length === 0 || !userRes.rows[0].referred_by) {
            break; // Stop if no referrer (Root user reached)
        }

        const parentId = userRes.rows[0].referred_by;

        // Get the rule for this level (e.g., Level 1 = 10%)
        const ruleRes = await pool.query(
            "SELECT percentage FROM referral_depth_rules WHERE level = $1", [level]
        );

        if (ruleRes.rows.length === 0) break;

        const percent = Number(ruleRes.rows[0].percentage);
        const amount = (ticketPrice * percent) / 100;

        if (amount > 0) {
            // 1. Pay the Upline
            await pool.query(
                "UPDATE wallets SET balance = balance + $1 WHERE user_id = $2", [amount, parentId]
            );

            // 2. Log the Transaction
            await pool.query(
                `INSERT INTO income_logs (user_id, income_type, amount)
                 VALUES ($1, $2, $3)`, [parentId, `REFERRAL_D${level}`, amount]
            );
        }

        // Move up to the next parent
        currentUserId = parentId;
    }
};

/**
 * WIDTH REFERRAL (W1–W9)
 * Logic: Pays a fixed bonus when a user reaches a specific count of direct referrals.
 * ✅ UPDATE: Added check to prevent paying the same bonus twice.
 */
exports.processWidthReferral = async(userId) => {
    // 1. Count how many direct referrals this user has
    const refCountRes = await pool.query(
        "SELECT COUNT(*) FROM users WHERE referred_by = $1", [userId]
    );

    const count = Number(refCountRes.rows[0].count);

    // 2. Check if there is a reward for this specific count
    const ruleRes = await pool.query(
        "SELECT reward_amount FROM referral_width_rules WHERE required_referrals = $1", [count]
    );

    if (ruleRes.rows.length === 0) return; // No reward for this count

    const reward = Number(ruleRes.rows[0].reward_amount);
    const incomeType = `REFERRAL_WIDTH_L${count}`; // Unique tag, e.g., "REFERRAL_WIDTH_L5"

    // 3. SAFETY CHECK: Has this specific milestone been paid already?
    const exists = await pool.query(
        "SELECT 1 FROM income_logs WHERE user_id = $1 AND income_type = $2", [userId, incomeType]
    );

    if (exists.rows.length > 0) return; // Already paid!

    // 4. Pay the Reward
    await pool.query(
        "UPDATE wallets SET balance = balance + $1 WHERE user_id = $2", [reward, userId]
    );

    // 5. Log the Transaction
    await pool.query(
        `INSERT INTO income_logs (user_id, income_type, amount)
         VALUES ($1, $2, $3)`, [userId, incomeType, reward]
    );
};
exports.processReferralBonuses = async(buyerId, ticketPrice, seatId, packageId) => {
    let currentUserId = buyerId;

    for (let level = 1; level <= 6; level++) {
        // Find the parent (referrer)
        const userRes = await pool.query(
            "SELECT referred_by FROM users WHERE id = $1", [currentUserId]
        );

        if (userRes.rows.length === 0 || !userRes.rows[0].referred_by) break;

        const parentId = userRes.rows[0].referred_by;
        let bonusAmount = 0;
        let logType = `REFERRAL_L${level}`;

        // --- LEVEL 1: LINEAR PACKAGE WIDTH (10% -> 18%) ---
        if (level === 1) {
            // Count total seats of THIS package already owned by YOUR direct referrals
            const countRes = await pool.query(
                `SELECT COUNT(s.id)::int FROM seats s
                 JOIN users u ON s.user_id = u.id
                 WHERE u.referred_by = $1 AND s.package_id = $2 
                 AND s.status = 'OCCUPIED' AND s.id != $3`, [parentId, packageId, seatId]
            );

            const previousSales = countRes.rows[0].count;

            // Logic: Start 10%. Add 1% for every previous sale.
            // 1st sale (0 prev): 10%
            // 2nd sale (1 prev): 11%
            // 9th sale (8 prev): 18%
            let percent = 10 + previousSales;

            // Cap at 18% max
            if (percent > 18) percent = 18;

            bonusAmount = (ticketPrice * percent) / 100;
            logType = `REFERRAL_WIDTH_P${packageId}_S${previousSales + 1}`;
        }

        // --- LEVELS 2-6: STANDARD DEPTH ---
        else {
            const depthRule = await pool.query(
                "SELECT percentage FROM referral_depth_rules WHERE level = $1", [level]
            );
            if (depthRule.rows.length > 0) {
                bonusAmount = (ticketPrice * Number(depthRule.rows[0].percentage)) / 100;
            }
        }

        if (bonusAmount > 0) {
            await pool.query("UPDATE wallets SET balance = balance + $1 WHERE user_id = $2", [bonusAmount, parentId]);
            await pool.query(
                `INSERT INTO income_logs (user_id, income_type, amount, seat_id, created_at) 
                 VALUES ($1, $2, $3, $4, NOW())`, [parentId, logType, bonusAmount, seatId]
            );
        }
        currentUserId = parentId;
    }
};