const pool = require("../config/db");

/**
 * 🟢 RUN DAILY INCOME
 * Rule: Pays daily for 365 days, STARTING ONLY after the batch is full.
 */
exports.runDailyIncome = async() => {
    console.log("🔄 Starting Daily Income Distribution (Catch-Up Mode)...");

    try {
        // 1. Fetch all active DAILY seats with days remaining
        // We join with packages to get the default daily_income if the seat doesn't have one
        const activeSeats = await pool.query(
            `SELECT s.id, s.user_id, s.package_id, s.daily_income as seat_daily, 
                    s.last_payout, s.days_remaining, p.daily_income as pkg_daily
             FROM seats s
             JOIN packages p ON s.package_id = p.id
             WHERE s.status = 'OCCUPIED' 
             AND s.income_type = 'DAILY' 
             AND s.days_remaining > 0`
        );

        for (const seat of activeSeats.rows) {
            const lastPayout = new Date(seat.last_payout);
            const today = new Date();

            // 2. Calculate missed days (24-hour gaps)
            const diffTime = Math.abs(today - lastPayout);
            const missedDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (missedDays > 0) {
                // Determine how many days we can actually pay based on contract limit
                const daysToPay = Math.min(missedDays, seat.days_remaining);
                const dailyAmount = Number(seat.seat_daily) > 0 ? Number(seat.seat_daily) : Number(seat.pkg_daily);
                const totalAmount = dailyAmount * daysToPay;

                if (totalAmount > 0) {
                    // 3. Update User Wallet (Total sum for all missed days)
                    await pool.query(
                        "UPDATE wallets SET balance = COALESCE(balance, 0) + $1 WHERE user_id = $2", [totalAmount, seat.user_id]
                    );

                    // 4. Create separate logs for EVERY missed day so they show in History
                    for (let i = 1; i <= daysToPay; i++) {
                        // Calculate the specific date for each log entry
                        const logDate = new Date(lastPayout);
                        logDate.setDate(logDate.getDate() + i);
                        const logDateString = logDate.toISOString().split('T')[0];

                        // Insert into income_logs for the History page
                        await pool.query(
                            `INSERT INTO income_logs (user_id, package_id, seat_id, income_type, amount, created_at)
                             VALUES ($1, $2, $3, 'DAILY', $4, $5)`, [seat.user_id, seat.package_id, seat.id, dailyAmount, logDate]
                        );

                        // Insert into income_cycles to prevent duplicate payout for this specific date
                        await pool.query(
                            `INSERT INTO income_cycles (user_id, seat_id, income_type, cycle_date)
                             VALUES ($1, $2, 'DAILY', $3)`, [seat.user_id, seat.id, logDateString]
                        );
                    }

                    // 5. Update the seat's contract progress and timestamp
                    await pool.query(
                        `UPDATE seats 
                         SET days_remaining = days_remaining - $1, 
                             last_payout = NOW() 
                         WHERE id = $2`, [daysToPay, seat.id]
                    );

                    console.log(`✅ Paid ${daysToPay} day(s) to User ${seat.user_id} for Seat ${seat.id}`);
                }
            }
        }
        console.log("✅ Daily Income Distribution Completed.");
    } catch (err) {
        console.error("❌ Daily Income Failed:", err.message);
    }
};

/**
 * 🟡 RUN MONTHLY INCOME
 * Rule: 12 payments total, starting 30 days after Batch Completion.
 */
exports.runMonthlyIncome = async() => {
    console.log("🔄 Starting Monthly Income Distribution...");

    try {
        const packagesRes = await pool.query("SELECT * FROM packages");

        for (const pkg of packagesRes.rows) {
            const BATCH_SIZE = pkg.total_seats || 180;

            const fullBatchesRes = await pool.query(
                `SELECT batch_number, MAX(booked_at) as completion_date 
                 FROM seats 
                 WHERE package_id = $1 AND status = 'OCCUPIED' 
                 GROUP BY batch_number 
                 HAVING COUNT(*)::int >= $2::int`, [pkg.id, BATCH_SIZE]
            );

            for (const batch of fullBatchesRes.rows) {
                const completionDate = new Date(batch.completion_date);
                const today = new Date();

                const diffTime = Math.abs(today - completionDate);
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                const diffMonths = Math.floor(diffDays / 30);

                // 🟡 RULE: 12 payments (1 year limit) starting 30 days AFTER batch completion
                if (diffMonths >= 12 || diffDays === 0 || diffDays % 30 !== 0) continue;

                const seatsRes = await pool.query(
                    `SELECT id, user_id, monthly_income FROM seats 
                     WHERE package_id = $1 AND batch_number = $2
                     AND status = 'OCCUPIED' AND income_type = 'MONTHLY'`, [pkg.id, batch.batch_number]
                );

                for (const seat of seatsRes.rows) {
                    const incomeAmount = Number(seat.monthly_income) > 0 ?
                        Number(seat.monthly_income) :
                        Number(pkg.monthly_income);

                    const exists = await pool.query(
                        `SELECT 1 FROM income_cycles
                         WHERE seat_id = $1 AND income_type = 'MONTHLY'
                         AND cycle_date = CURRENT_DATE`, [seat.id]
                    );
                    if (exists.rows.length) continue;

                    if (incomeAmount > 0) {
                        await pool.query(
                            "UPDATE wallets SET balance = COALESCE(balance, 0) + $1 WHERE user_id = $2", [incomeAmount, seat.user_id]
                        );

                        await pool.query(
                            `INSERT INTO income_logs (user_id, package_id, seat_id, income_type, amount, created_at)
                             VALUES ($1, $2, $3, 'MONTHLY', $4, NOW())`, [seat.user_id, pkg.id, seat.id, incomeAmount]
                        );

                        await pool.query(
                            `INSERT INTO income_cycles (user_id, seat_id, income_type, cycle_date)
                             VALUES ($1, $2, 'MONTHLY', CURRENT_DATE)`, [seat.user_id, seat.id]
                        );
                    }
                }
            }
        }
        console.log("✅ Monthly Income Completed.");
    } catch (err) {
        console.error("❌ Monthly Income Failed:", err.message);
    }
};

/**
 * 🔵 RUN YEARLY INCOME
 * Logic: Pays lump sum exactly 365 days after the Batch is finalized.
 */
exports.runYearlyIncome = async() => {
    console.log("🔄 Starting Yearly Income Distribution...");

    try {
        const packagesRes = await pool.query("SELECT * FROM packages");

        for (const pkg of packagesRes.rows) {
            const BATCH_SIZE = pkg.total_seats || 180;

            const fullBatchesRes = await pool.query(
                `SELECT batch_number, MAX(booked_at) as completion_date 
                 FROM seats 
                 WHERE package_id = $1 AND status = 'OCCUPIED' 
                 GROUP BY batch_number 
                 HAVING COUNT(*)::int >= $2::int`, [pkg.id, BATCH_SIZE]
            );

            for (const batch of fullBatchesRes.rows) {
                const completionDate = new Date(batch.completion_date);
                const today = new Date();
                const diffTime = Math.abs(today - completionDate);
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                // 🔵 Logic: Pays exactly on day 365 after the batch was completed
                if (diffDays !== 365) continue;

                const seatsRes = await pool.query(
                    `SELECT id, user_id, yearly_income FROM seats 
                     WHERE package_id = $1 AND batch_number = $2
                     AND status = 'OCCUPIED' AND income_type = 'YEARLY'`, [pkg.id, batch.batch_number]
                );

                for (const seat of seatsRes.rows) {
                    const incomeAmount = Number(seat.yearly_income) > 0 ?
                        Number(seat.yearly_income) :
                        Number(pkg.yearly_income);

                    const exists = await pool.query(
                        `SELECT 1 FROM income_cycles
                         WHERE seat_id = $1 AND income_type = 'YEARLY'
                         AND cycle_date = CURRENT_DATE`, [seat.id]
                    );
                    if (exists.rows.length) continue;

                    if (incomeAmount > 0) {
                        await pool.query(
                            "UPDATE wallets SET balance = COALESCE(balance, 0) + $1 WHERE user_id = $2", [incomeAmount, seat.user_id]
                        );

                        await pool.query(
                            `INSERT INTO income_logs (user_id, package_id, seat_id, income_type, amount, created_at)
                             VALUES ($1, $2, $3, 'YEARLY', $4, NOW())`, [seat.user_id, pkg.id, seat.id, incomeAmount]
                        );

                        await pool.query(
                            `INSERT INTO income_cycles (user_id, seat_id, income_type, cycle_date)
                             VALUES ($1, $2, 'YEARLY', CURRENT_DATE)`, [seat.user_id, seat.id]
                        );
                    }
                }
            }
        }
        console.log("✅ Yearly Income Completed.");
    } catch (err) {
        console.error("❌ Yearly Income Failed:", err.message);
    }
};