const pool = require("../config/db");

exports.runDailyIncome = async() => {
    const packages = await pool.query("SELECT * FROM packages");

    for (const pkg of packages.rows) {
        const filledRes = await pool.query(
            "SELECT COUNT(*) FROM seats WHERE package_id = $1 AND status = 'BOOKED'", [pkg.id]
        );

        if (Number(filledRes.rows[0].count) !== pkg.total_seats) continue;

        const seatRes = await pool.query(
            "SELECT user_id FROM seats WHERE package_id = $1", [pkg.id]
        );

        for (const seat of seatRes.rows) {
            await pool.query(
                "UPDATE wallets SET balance = balance + $1 WHERE user_id = $2", [pkg.daily_income, seat.user_id]
            );

            await pool.query(
                `INSERT INTO income_logs (user_id, package_id, income_type, amount)
         VALUES ($1, $2, 'DAILY', $3)`, [seat.user_id, pkg.id, pkg.daily_income]
            );
        }
    }
};
exports.runMonthlyIncome = async() => {
    const packagesRes = await pool.query("SELECT * FROM packages");

    for (const pkg of packagesRes.rows) {
        // check full seats
        const filledRes = await pool.query(
            "SELECT COUNT(*) FROM seats WHERE package_id = $1 AND status = 'BOOKED'", [pkg.id]
        );

        if (Number(filledRes.rows[0].count) !== pkg.total_seats) continue;

        const seatsRes = await pool.query(
            `SELECT id, user_id, booked_at 
       FROM seats 
       WHERE package_id = $1`, [pkg.id]
        );

        for (const seat of seatsRes.rows) {
            const eligibleDate = new Date(seat.booked_at);
            eligibleDate.setDate(eligibleDate.getDate() + 27);

            if (new Date() < eligibleDate) continue;

            // safety check
            const exists = await pool.query(
                `SELECT 1 FROM income_cycles
         WHERE seat_id = $1 AND income_type = 'MONTHLY'
           AND cycle_date = CURRENT_DATE`, [seat.id]
            );

            if (exists.rows.length) continue;

            // pay income
            await pool.query(
                "UPDATE wallets SET balance = balance + $1 WHERE user_id = $2", [pkg.monthly_income, seat.user_id]
            );

            await pool.query(
                `INSERT INTO income_logs (user_id, package_id, income_type, amount)
         VALUES ($1, $2, 'MONTHLY', $3)`, [seat.user_id, pkg.id, pkg.monthly_income]
            );

            await pool.query(
                `INSERT INTO income_cycles (user_id, seat_id, income_type, cycle_date)
         VALUES ($1, $2, 'MONTHLY', CURRENT_DATE)`, [seat.user_id, seat.id]
            );
        }
    }
};
exports.runYearlyIncome = async() => {
    const packagesRes = await pool.query("SELECT * FROM packages");

    for (const pkg of packagesRes.rows) {
        const filledRes = await pool.query(
            "SELECT COUNT(*) FROM seats WHERE package_id = $1 AND status = 'BOOKED'", [pkg.id]
        );

        if (Number(filledRes.rows[0].count) !== pkg.total_seats) continue;

        const seatsRes = await pool.query(
            `SELECT id, user_id, booked_at 
       FROM seats 
       WHERE package_id = $1`, [pkg.id]
        );

        for (const seat of seatsRes.rows) {
            const eligibleDate = new Date(seat.booked_at);
            eligibleDate.setDate(eligibleDate.getDate() + 365);

            if (new Date() < eligibleDate) continue;

            const exists = await pool.query(
                `SELECT 1 FROM income_cycles
         WHERE seat_id = $1 AND income_type = 'YEARLY'`, [seat.id]
            );

            if (exists.rows.length) continue;

            await pool.query(
                "UPDATE wallets SET balance = balance + $1 WHERE user_id = $2", [pkg.yearly_income, seat.user_id]
            );

            await pool.query(
                `INSERT INTO income_logs (user_id, package_id, income_type, amount)
         VALUES ($1, $2, 'YEARLY', $3)`, [seat.user_id, pkg.id, pkg.yearly_income]
            );

            await pool.query(
                `INSERT INTO income_cycles (user_id, seat_id, income_type, cycle_date)
         VALUES ($1, $2, 'YEARLY', CURRENT_DATE)`, [seat.user_id, seat.id]
            );
        }
    }
};