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
exports.processReferralBonuses = async(buyerId, ticketPrice) => {
    let currentUserId = buyerId;

    for (let level = 1; level <= 6; level++) {
        const userRes = await pool.query(
            "SELECT referred_by FROM users WHERE id = $1", [currentUserId]
        );

        if (userRes.rows.length === 0 || !userRes.rows[0].referred_by) {
            break;
        }

        const parentId = userRes.rows[0].referred_by;

        // 🟢 1. Fetch Depth Percentage
        const depthRule = await pool.query(
            "SELECT percentage FROM referral_depth_rules WHERE level = $1", [level]
        );

        // 🔒 AUTO-SAVE SAFE: Using standard check instead of ?.
        let percent = 0;
        if (depthRule.rows && depthRule.rows.length > 0) {
            percent = Number(depthRule.rows[0].percentage);
        }

        let bonusAmount = (ticketPrice * percent) / 100;

        // 🟢 2. Apply Width Fixed Bonus (Direct Referrer Only)
        if (level === 1) {
            const countRes = await pool.query(
                "SELECT COUNT(*) FROM users WHERE referred_by = $1", [parentId]
            );
            const refCount = parseInt(countRes.rows[0].count);

            const widthRule = await pool.query(
                "SELECT reward_amount FROM referral_width_rules WHERE required_referrals = $1", [refCount]
            );

            // 🔒 AUTO-SAVE SAFE: Using standard check instead of ?.
            let widthBonus = 0;
            if (widthRule.rows && widthRule.rows.length > 0) {
                widthBonus = Number(widthRule.rows[0].reward_amount);
            }

            bonusAmount += widthBonus;
        }

        if (bonusAmount > 0) {
            // 3. Update Wallet
            await pool.query(
                "UPDATE wallets SET balance = balance + $1 WHERE user_id = $2", [bonusAmount, parentId]
            );

            // 4. Log Transaction
            await pool.query(
                "INSERT INTO income_logs (user_id, income_type, amount, created_at) VALUES ($1, $2, $3, NOW())", [parentId, "REFERRAL_L" + level, bonusAmount]
            );
        }

        currentUserId = parentId;
    }
};