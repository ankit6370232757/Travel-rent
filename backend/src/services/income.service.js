const pool = require("../config/db");

/**
 * 🟢 RUN DAILY INCOME
 * Logic: Runs every 24h. Pays the specific 'daily_income' value attached to the seat.
 */
exports.runDailyIncome = async() => {
    console.log("🔄 Starting Daily Income Distribution...");
    const packages = await pool.query("SELECT * FROM packages");

    for (const pkg of packages.rows) {
        // 1. Check if Package is FULL (Income only starts when full)
        const filledRes = await pool.query(
            "SELECT COUNT(*) FROM seats WHERE package_id = $1 AND status = 'BOOKED'", [pkg.id]
        );

        if (Number(filledRes.rows[0].count) !== pkg.total_seats) {
            continue; // Skip if not full
        }

        // 2. Fetch booked seats with their SPECIFIC income values
        const seatRes = await pool.query(
            "SELECT id, user_id, daily_income FROM seats WHERE package_id = $1 AND status = 'BOOKED'", [pkg.id]
        );

        for (const seat of seatRes.rows) {
            const incomeAmount = Number(seat.daily_income);

            // 3. SAFETY CHECK: Did we already pay this seat today?
            const exists = await pool.query(
                `SELECT 1 FROM income_cycles 
                 WHERE seat_id = $1 AND income_type = 'DAILY' 
                 AND cycle_date = CURRENT_DATE`, [seat.id]
            );

            if (exists.rows.length > 0) continue; // Already paid today

            if (incomeAmount > 0) {
                // Pay User
                await pool.query(
                    "UPDATE wallets SET balance = balance + $1 WHERE user_id = $2", [incomeAmount, seat.user_id]
                );

                // Log Transaction
                await pool.query(
                    `INSERT INTO income_logs (user_id, package_id, seat_id, income_type, amount)
                     VALUES ($1, $2, $3, 'DAILY', $4)`, [seat.user_id, pkg.id, seat.id, incomeAmount]
                );

                // Record Cycle (To prevent double payment)
                await pool.query(
                    `INSERT INTO income_cycles (user_id, seat_id, income_type, cycle_date)
                     VALUES ($1, $2, 'DAILY', CURRENT_DATE)`, [seat.user_id, seat.id]
                );
            }
        }
    }
    console.log("✅ Daily Income Completed.");
};

/**
 * 🟡 RUN MONTHLY INCOME
 * Logic: Pays 'monthly_income' exactly every 30 days (Day 30, 60, 90...)
 */
exports.runMonthlyIncome = async() => {
    console.log("🔄 Starting Monthly Income Distribution...");
    const packagesRes = await pool.query("SELECT * FROM packages");

    for (const pkg of packagesRes.rows) {
        // 1. Check Full
        const filledRes = await pool.query(
            "SELECT COUNT(*) FROM seats WHERE package_id = $1 AND status = 'BOOKED'", [pkg.id]
        );

        if (Number(filledRes.rows[0].count) !== pkg.total_seats) continue;

        // 2. Get Seats with MONTHLY income
        const seatsRes = await pool.query(
            `SELECT id, user_id, booked_at, monthly_income 
             FROM seats 
             WHERE package_id = $1 AND status = 'BOOKED'`, [pkg.id]
        );

        for (const seat of seatsRes.rows) {
            const incomeAmount = Number(seat.monthly_income);

            // Calculate days since booking
            const bookedDate = new Date(seat.booked_at);
            const today = new Date();
            const diffTime = Math.abs(today - bookedDate);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            // Pay only on Day 30, 60, 90, etc.
            if (diffDays === 0 || diffDays % 30 !== 0) continue;

            // Check if already paid TODAY
            const exists = await pool.query(
                `SELECT 1 FROM income_cycles
                 WHERE seat_id = $1 AND income_type = 'MONTHLY'
                 AND cycle_date = CURRENT_DATE`, [seat.id]
            );

            if (exists.rows.length) continue;

            if (incomeAmount > 0) {
                // Pay
                await pool.query(
                    "UPDATE wallets SET balance = balance + $1 WHERE user_id = $2", [incomeAmount, seat.user_id]
                );

                // Log
                await pool.query(
                    `INSERT INTO income_logs (user_id, package_id, seat_id, income_type, amount)
                     VALUES ($1, $2, $3, 'MONTHLY', $4)`, [seat.user_id, pkg.id, seat.id, incomeAmount]
                );

                // Record Cycle
                await pool.query(
                    `INSERT INTO income_cycles (user_id, seat_id, income_type, cycle_date)
                     VALUES ($1, $2, 'MONTHLY', CURRENT_DATE)`, [seat.user_id, seat.id]
                );
            }
        }
    }
    console.log("✅ Monthly Income Completed.");
};

/**
 * 🔵 RUN YEARLY INCOME
 * Logic: Pays 'yearly_income' exactly every 365 days (Day 365, 730...)
 */
exports.runYearlyIncome = async() => {
    console.log("🔄 Starting Yearly Income Distribution...");
    const packagesRes = await pool.query("SELECT * FROM packages");

    for (const pkg of packagesRes.rows) {
        const filledRes = await pool.query(
            "SELECT COUNT(*) FROM seats WHERE package_id = $1 AND status = 'BOOKED'", [pkg.id]
        );

        if (Number(filledRes.rows[0].count) !== pkg.total_seats) continue;

        const seatsRes = await pool.query(
            `SELECT id, user_id, booked_at, yearly_income 
             FROM seats 
             WHERE package_id = $1 AND status = 'BOOKED'`, [pkg.id]
        );

        for (const seat of seatsRes.rows) {
            const incomeAmount = Number(seat.yearly_income);

            // Calculate days since booking
            const bookedDate = new Date(seat.booked_at);
            const today = new Date();
            const diffTime = Math.abs(today - bookedDate);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            // Pay only on Day 365, 730, etc.
            if (diffDays === 0 || diffDays % 365 !== 0) continue;

            // Check if paid today
            const exists = await pool.query(
                `SELECT 1 FROM income_cycles
                 WHERE seat_id = $1 AND income_type = 'YEARLY'
                 AND cycle_date = CURRENT_DATE`, [seat.id]
            );

            if (exists.rows.length) continue;

            if (incomeAmount > 0) {
                // Pay
                await pool.query(
                    "UPDATE wallets SET balance = balance + $1 WHERE user_id = $2", [incomeAmount, seat.user_id]
                );

                // Log
                await pool.query(
                    `INSERT INTO income_logs (user_id, package_id, seat_id, income_type, amount)
                     VALUES ($1, $2, $3, 'YEARLY', $4)`, [seat.user_id, pkg.id, seat.id, incomeAmount]
                );

                // Record Cycle
                await pool.query(
                    `INSERT INTO income_cycles (user_id, seat_id, income_type, cycle_date)
                     VALUES ($1, $2, 'YEARLY', CURRENT_DATE)`, [seat.user_id, seat.id]
                );
            }
        }
    }
    console.log("✅ Yearly Income Completed.");
};

/**
 * 🟣 RUN OTS (ONE TIME SCHOLARSHIP) INCOME
 * Logic: Pays 'ots_income' ONCE when the package is filled.
 */
exports.runOTSIncome = async() => {
    console.log("🔄 Starting OTS Income Distribution...");
    const packages = await pool.query("SELECT * FROM packages");

    for (const pkg of packages.rows) {
        const filledRes = await pool.query(
            "SELECT COUNT(*) FROM seats WHERE package_id = $1 AND status = 'BOOKED'", [pkg.id]
        );

        if (Number(filledRes.rows[0].count) !== pkg.total_seats) continue;

        const seatRes = await pool.query(
            "SELECT id, user_id FROM seats WHERE package_id = $1 AND status = 'BOOKED'", [pkg.id]
        );

        for (const seat of seatRes.rows) {
            const incomeAmount = Number(pkg.ots_income); // OTS is fixed per package

            // Check if already paid OTS ever
            const exists = await pool.query(
                `SELECT 1 FROM income_cycles 
                 WHERE seat_id = $1 AND income_type = 'OTS'`, [seat.id]
            );

            if (exists.rows.length > 0) continue;

            if (incomeAmount > 0) {
                // Pay
                await pool.query(
                    "UPDATE wallets SET balance = balance + $1 WHERE user_id = $2", [incomeAmount, seat.user_id]
                );

                // Log
                await pool.query(
                    `INSERT INTO income_logs (user_id, package_id, seat_id, income_type, amount)
                     VALUES ($1, $2, $3, 'OTS', $4)`, [seat.user_id, pkg.id, seat.id, incomeAmount]
                );

                // Record Cycle (Permanent Lock)
                await pool.query(
                    `INSERT INTO income_cycles (user_id, seat_id, income_type, cycle_date)
                     VALUES ($1, $2, 'OTS', CURRENT_DATE)`, [seat.user_id, seat.id]
                );
            }
        }
    }
    console.log("✅ OTS Income Completed.");
};