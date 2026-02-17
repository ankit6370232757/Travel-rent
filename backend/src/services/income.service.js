const pool = require("../config/db");

/**
 * 🟢 RUN DAILY INCOME
 * Logic: Runs every 24h. 
 * Condition 1: Pays ONLY if the specific BATCH is full.
 * Condition 2: Pays ONLY seats with income_type = 'DAILY'.
 */
exports.runDailyIncome = async() => {
    console.log("🔄 Starting Daily Income Distribution...");

    try {
        const packages = await pool.query("SELECT * FROM packages");

        for (const pkg of packages.rows) {
            const BATCH_SIZE = pkg.total_seats || 180;

            // 1. Identify which Batches are FULL (Strict numeric comparison)
            const fullBatchesRes = await pool.query(
                `SELECT batch_number 
                 FROM seats 
                 WHERE package_id = $1 AND status = 'OCCUPIED' 
                 GROUP BY batch_number 
                 HAVING COUNT(*)::int >= $2::int`, [pkg.id, BATCH_SIZE]
            );

            const fullBatches = fullBatchesRes.rows.map(r => r.batch_number);

            if (fullBatches.length === 0) continue;

            // 2. Fetch seats belonging ONLY to these FULL batches + DAILY Plan
            const seatRes = await pool.query(
                `SELECT id, user_id, batch_number, daily_income 
                 FROM seats 
                 WHERE package_id = $1 
                 AND status = 'OCCUPIED'
                 AND income_type = 'DAILY'
                 AND batch_number = ANY($2::int[])`, [pkg.id, fullBatches]
            );

            for (const seat of seatRes.rows) {
                // Priority: Seat-specific rate > Package rate
                const incomeAmount = Number(seat.daily_income) > 0 ?
                    Number(seat.daily_income) :
                    Number(pkg.daily_income);

                // 3. SAFETY CHECK: Already paid today?
                const exists = await pool.query(
                    `SELECT 1 FROM income_cycles 
                     WHERE seat_id = $1 AND income_type = 'DAILY' 
                     AND cycle_date = CURRENT_DATE`, [seat.id]
                );

                if (exists.rows.length > 0) continue;

                if (incomeAmount > 0) {
                    // Update Wallet with NULL protection (COALESCE)
                    await pool.query(
                        "UPDATE wallets SET balance = COALESCE(balance, 0) + $1 WHERE user_id = $2", [incomeAmount, seat.user_id]
                    );

                    // Log Transaction
                    await pool.query(
                        `INSERT INTO income_logs (user_id, package_id, seat_id, income_type, amount, created_at)
                         VALUES ($1, $2, $3, 'DAILY', $4, NOW())`, [seat.user_id, pkg.id, seat.id, incomeAmount]
                    );

                    // Record Cycle
                    await pool.query(
                        `INSERT INTO income_cycles (user_id, seat_id, income_type, cycle_date)
                         VALUES ($1, $2, 'DAILY', CURRENT_DATE)`, [seat.user_id, seat.id]
                    );
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
 * Logic: Runs every 30 days.
 */
exports.runMonthlyIncome = async() => {
    console.log("🔄 Starting Monthly Income Distribution...");

    try {
        const packagesRes = await pool.query("SELECT * FROM packages");

        for (const pkg of packagesRes.rows) {
            const BATCH_SIZE = pkg.total_seats || 180;

            const fullBatchesRes = await pool.query(
                `SELECT batch_number 
                 FROM seats 
                 WHERE package_id = $1 AND status = 'OCCUPIED' 
                 GROUP BY batch_number 
                 HAVING COUNT(*)::int >= $2::int`, [pkg.id, BATCH_SIZE]
            );

            const fullBatches = fullBatchesRes.rows.map(r => r.batch_number);
            if (fullBatches.length === 0) continue;

            const seatsRes = await pool.query(
                `SELECT id, user_id, booked_at, monthly_income 
                 FROM seats 
                 WHERE package_id = $1 
                 AND status = 'OCCUPIED'
                 AND income_type = 'MONTHLY'
                 AND batch_number = ANY($2::int[])`, [pkg.id, fullBatches]
            );

            for (const seat of seatsRes.rows) {
                const incomeAmount = Number(seat.monthly_income) > 0 ?
                    Number(seat.monthly_income) :
                    Number(pkg.monthly_income);

                const bookedDate = new Date(seat.booked_at);
                const today = new Date();
                const diffTime = Math.abs(today - bookedDate);
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                // Check 30-day cycle
                if (diffDays === 0 || diffDays % 30 !== 0) continue;

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
        console.log("✅ Monthly Income Completed.");

    } catch (err) {
        console.error("❌ Monthly Income Failed:", err.message);
    }
};

/**
 * 🔵 RUN YEARLY INCOME
 * Logic: Runs every 365 days.
 */
exports.runYearlyIncome = async() => {
    console.log("🔄 Starting Yearly Income Distribution...");

    try {
        const packagesRes = await pool.query("SELECT * FROM packages");

        for (const pkg of packagesRes.rows) {
            const BATCH_SIZE = pkg.total_seats || 180;

            const fullBatchesRes = await pool.query(
                `SELECT batch_number 
                 FROM seats 
                 WHERE package_id = $1 AND status = 'OCCUPIED' 
                 GROUP BY batch_number 
                 HAVING COUNT(*)::int >= $2::int`, [pkg.id, BATCH_SIZE]
            );

            const fullBatches = fullBatchesRes.rows.map(r => r.batch_number);
            if (fullBatches.length === 0) continue;

            const seatsRes = await pool.query(
                `SELECT id, user_id, booked_at, yearly_income 
                 FROM seats 
                 WHERE package_id = $1 
                 AND status = 'OCCUPIED'
                 AND income_type = 'YEARLY'
                 AND batch_number = ANY($2::int[])`, [pkg.id, fullBatches]
            );

            for (const seat of seatsRes.rows) {
                const incomeAmount = Number(seat.yearly_income) > 0 ?
                    Number(seat.yearly_income) :
                    Number(pkg.yearly_income);

                const bookedDate = new Date(seat.booked_at);
                const today = new Date();
                const diffTime = Math.abs(today - bookedDate);
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                // Check 365-day cycle
                if (diffDays === 0 || diffDays % 365 !== 0) continue;

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
        console.log("✅ Yearly Income Completed.");

    } catch (err) {
        console.error("❌ Yearly Income Failed:", err.message);
    }
};