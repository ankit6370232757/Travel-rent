const pool = require("../config/db");

/**
 * 🔒 HELPER: Check if a batch is finalized (Full)
 * Returns true only if the seats occupied match the package requirement.
 */
const isBatchFinalized = async(packageId, batchNumber) => {
    try {
        const pkgRes = await pool.query("SELECT total_seats FROM packages WHERE id = $1", [packageId]);
        const batchRes = await pool.query(
            `SELECT COUNT(*)::int as occupied_count 
             FROM seats 
             WHERE package_id = $1 AND batch_number = $2 AND status = 'OCCUPIED'`, [packageId, batchNumber]
        );

        const required = (pkgRes.rows[0] && pkgRes.rows[0].total_seats) || 180;
        const current = (batchRes.rows[0] && batchRes.rows[0].occupied_count) || 0;

        return current >= required;
    } catch (err) {
        console.error("❌ Error checking batch status:", err.message);
        return false;
    }
};

/**
 * 🟢 RUN DAILY INCOME
 * Rule: Pays daily for 365 days, ONLY after the batch is full.
 */
exports.runDailyIncome = async() => {
    console.log("🔄 Starting Daily Income Distribution (Strict Batch Mode)...");

    try {
        const activeSeats = await pool.query(
            `SELECT s.id, s.user_id, s.package_id, s.batch_number, s.daily_income as seat_daily, 
                    s.last_payout, s.days_remaining, p.daily_income as pkg_daily
             FROM seats s
             JOIN packages p ON s.package_id = p.id
             WHERE s.status = 'OCCUPIED' AND s.income_type = 'DAILY' AND s.days_remaining > 0`
        );

        for (const seat of activeSeats.rows) {
            // 🛑 BARRIER: Skip if batch is not full
            if (!(await isBatchFinalized(seat.package_id, seat.batch_number))) continue;

            const lastPayout = new Date(seat.last_payout);
            const today = new Date();
            const diffTime = Math.abs(today - lastPayout);
            const missedDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (missedDays > 0) {
                const daysToPay = Math.min(missedDays, seat.days_remaining);
                const dailyAmount = Number(seat.seat_daily) > 0 ? Number(seat.seat_daily) : Number(seat.pkg_daily);
                const totalAmount = dailyAmount * daysToPay;

                if (totalAmount > 0) {
                    await pool.query("UPDATE wallets SET balance = COALESCE(balance, 0) + $1 WHERE user_id = $2", [totalAmount, seat.user_id]);

                    for (let i = 1; i <= daysToPay; i++) {
                        const logDate = new Date(lastPayout);
                        logDate.setDate(logDate.getDate() + i);

                        await pool.query(
                            `INSERT INTO income_logs (user_id, package_id, seat_id, income_type, amount, created_at)
                             VALUES ($1, $2, $3, 'DAILY', $4, $5)`, [seat.user_id, seat.package_id, seat.id, dailyAmount, logDate]
                        );
                    }

                    await pool.query(
                        `UPDATE seats SET days_remaining = days_remaining - $1, last_payout = NOW() WHERE id = $2`, [daysToPay, seat.id]
                    );
                    console.log(`✅ Paid Daily: User ${seat.user_id}, Seat ${seat.id} (${daysToPay} days)`);
                }
            }
        }
        console.log("✅ Daily Income Distribution Completed.");
    } catch (err) { console.error("❌ Daily Income Failed:", err.message); }
};

/**
 * 🟡 RUN MONTHLY INCOME
 * Rule: Pays every 30 days, ONLY after the batch is full.
 */
exports.runMonthlyIncome = async() => {
    console.log("🔄 Starting Monthly Income (Strict Batch Mode)...");

    try {
        const activeSeats = await pool.query(
            `SELECT s.id, s.user_id, s.package_id, s.batch_number, s.monthly_income as seat_monthly, 
                    s.last_payout_monthly, s.booked_at, p.monthly_income as pkg_monthly
             FROM seats s
             JOIN packages p ON s.package_id = p.id
             WHERE s.status = 'OCCUPIED' AND s.income_type = 'MONTHLY'`
        );

        for (const seat of activeSeats.rows) {
            if (!(await isBatchFinalized(seat.package_id, seat.batch_number))) continue;

            const lastPayout = new Date(seat.last_payout_monthly || seat.booked_at);
            const today = new Date();
            const diffMonths = Math.floor(Math.abs(today - lastPayout) / (1000 * 60 * 60 * 24 * 30));

            if (diffMonths > 0) {
                const monthlyAmount = Number(seat.seat_monthly) > 0 ? Number(seat.seat_monthly) : Number(seat.pkg_monthly);
                const totalAmount = monthlyAmount * diffMonths;

                await pool.query("UPDATE wallets SET balance = COALESCE(balance, 0) + $1 WHERE user_id = $2", [totalAmount, seat.user_id]);

                await pool.query(
                    `INSERT INTO income_logs (user_id, package_id, seat_id, income_type, amount, created_at)
                     VALUES ($1, $2, $3, 'MONTHLY', $4, NOW())`, [seat.user_id, seat.package_id, seat.id, totalAmount]
                );

                await pool.query("UPDATE seats SET last_payout_monthly = NOW() WHERE id = $1", [seat.id]);
                console.log(`✅ Paid Monthly: User ${seat.user_id}`);
            }
        }
        console.log("✅ Monthly Income Completed.");
    } catch (err) { console.error("❌ Monthly Income Failed:", err.message); }
};

/**
 * 🔵 RUN YEARLY INCOME
 * Rule: Pays exactly 365 days after Batch Finalization.
 */
exports.runYearlyIncome = async() => {
    console.log("🔄 Starting Yearly Income...");

    try {
        const activeSeats = await pool.query(
            `SELECT s.id, s.user_id, s.package_id, s.batch_number, s.yearly_income as seat_yearly, 
                    s.booked_at, p.yearly_income as pkg_yearly
             FROM seats s
             JOIN packages p ON s.package_id = p.id
             WHERE s.status = 'OCCUPIED' AND s.income_type = 'YEARLY'`
        );

        for (const seat of activeSeats.rows) {
            if (!(await isBatchFinalized(seat.package_id, seat.batch_number))) continue;

            const completionDate = new Date(seat.booked_at);
            const today = new Date();
            const diffDays = Math.floor(Math.abs(today - completionDate) / (1000 * 60 * 60 * 24));

            if (diffDays >= 365) {
                const yearlyAmount = Number(seat.seat_yearly) > 0 ? Number(seat.seat_yearly) : Number(seat.pkg_yearly);

                const exists = await pool.query("SELECT 1 FROM income_logs WHERE seat_id = $1 AND income_type = 'YEARLY'", [seat.id]);
                if (exists.rows.length) continue;

                await pool.query("UPDATE wallets SET balance = COALESCE(balance, 0) + $1 WHERE user_id = $2", [yearlyAmount, seat.user_id]);
                await pool.query(
                    `INSERT INTO income_logs (user_id, package_id, seat_id, income_type, amount, created_at)
                     VALUES ($1, $2, $3, 'YEARLY', $4, NOW())`, [seat.user_id, seat.package_id, seat.id, yearlyAmount]
                );
                console.log(`✅ Paid Yearly: User ${seat.user_id}`);
            }
        }
        console.log("✅ Yearly Income Completed.");
    } catch (err) { console.error("❌ Yearly Income Failed:", err.message); }
};