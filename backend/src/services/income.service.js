const pool = require("../config/db");

/**
 * 🟢 RUN DAILY INCOME
 * Rule: Pays daily for 365 days, STARTING ONLY after the batch is full.
 */
exports.runDailyIncome = async() => {
    console.log("🔄 Starting Daily Income Distribution...");

    try {
        const packages = await pool.query("SELECT * FROM packages");

        for (const pkg of packages.rows) {
            const BATCH_SIZE = pkg.total_seats || 180;

            // 1. Identify Full Batches and find the Completion Date (Max booked_at)
            const fullBatchesRes = await pool.query(
                `SELECT batch_number, MAX(booked_at) as completion_date 
                 FROM seats 
                 WHERE package_id = $1 AND status = 'OCCUPIED' 
                 GROUP BY batch_number 
                 HAVING COUNT(*)::int >= $2::int`, [pkg.id, BATCH_SIZE]
            );

            for (const batch of fullBatchesRes.rows) {
                const batchNum = batch.batch_number;
                const completionDate = new Date(batch.completion_date);
                const today = new Date();

                // Calculate days passed since the BATCH was finalized
                const diffTime = Math.abs(today - completionDate);
                const daysSinceCompletion = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                // 🟢 RULE: Only pay if within the 365-day window of batch completion
                // Starts paying 1 day after the batch is full
                if (daysSinceCompletion > 365 || daysSinceCompletion < 1) continue;

                // 2. Fetch Daily-plan seats in this specific finalized batch
                const seatRes = await pool.query(
                    `SELECT id, user_id, daily_income 
                     FROM seats 
                     WHERE package_id = $1 AND batch_number = $2
                     AND status = 'OCCUPIED' AND income_type = 'DAILY'`, [pkg.id, batchNum]
                );

                for (const seat of seatRes.rows) {
                    const incomeAmount = Number(seat.daily_income) > 0 ?
                        Number(seat.daily_income) :
                        Number(pkg.daily_income);

                    const exists = await pool.query(
                        `SELECT 1 FROM income_cycles 
                         WHERE seat_id = $1 AND income_type = 'DAILY' 
                         AND cycle_date = CURRENT_DATE`, [seat.id]
                    );

                    if (exists.rows.length > 0) continue;

                    if (incomeAmount > 0) {
                        await pool.query(
                            "UPDATE wallets SET balance = COALESCE(balance, 0) + $1 WHERE user_id = $2", [incomeAmount, seat.user_id]
                        );

                        await pool.query(
                            `INSERT INTO income_logs (user_id, package_id, seat_id, income_type, amount, created_at)
                             VALUES ($1, $2, $3, 'DAILY', $4, NOW())`, [seat.user_id, pkg.id, seat.id, incomeAmount]
                        );

                        await pool.query(
                            `INSERT INTO income_cycles (user_id, seat_id, income_type, cycle_date)
                             VALUES ($1, $2, 'DAILY', CURRENT_DATE)`, [seat.user_id, seat.id]
                        );
                    }
                }
            }
        }
        console.log("✅ Daily Income Completed.");
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