const pool = require("../config/db");

// 1. Get Pending Requests
exports.getPendingRequests = async(req, res) => {
    try {
        const deposits = await pool.query(
            "SELECT id, user_id, amount, 'DEPOSIT' as type, created_at FROM deposits WHERE status = 'PENDING'"
        );
        const withdrawals = await pool.query(
            "SELECT id, user_id, amount, 'WITHDRAW' as type, created_at FROM withdrawals WHERE status = 'PENDING'"
        );
        res.json([...deposits.rows, ...withdrawals.rows]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 2. Approve/Reject Request
exports.handleRequest = async(req, res) => {
    const client = await pool.connect();
    try {
        const { id, type, action } = req.body; // action = 'APPROVE' | 'REJECT'
        await client.query("BEGIN");

        if (type === 'DEPOSIT') {
            const dep = await client.query("SELECT * FROM deposits WHERE id = $1 FOR UPDATE", [id]);
            if (!dep.rows.length) throw new Error("Deposit not found");

            if (action === 'APPROVE') {
                await client.query("UPDATE wallets SET balance = balance + $1 WHERE user_id = $2", [dep.rows[0].amount, dep.rows[0].user_id]);
            }
            await client.query("UPDATE deposits SET status = $1 WHERE id = $2", [action, id]);

        } else if (type === 'WITHDRAW') {
            const wd = await client.query("SELECT * FROM withdrawals WHERE id = $1 FOR UPDATE", [id]);
            if (!wd.rows.length) throw new Error("Withdrawal not found");

            if (action === 'REJECT') {
                // Refund money if rejected
                await client.query("UPDATE wallets SET balance = balance + $1, locked_balance = locked_balance - $1 WHERE user_id = $2", [wd.rows[0].amount, wd.rows[0].user_id]);
            } else {
                // If Approved, just unlock the locked_balance (money is already gone from balance)
                await client.query("UPDATE wallets SET locked_balance = locked_balance - $1 WHERE user_id = $2", [wd.rows[0].amount, wd.rows[0].user_id]);
            }
            await client.query("UPDATE withdrawals SET status = $1 WHERE id = $2", [action, id]);
        }

        await client.query("COMMIT");
        res.json({ message: `Request ${action}ED` });

    } catch (error) {
        await client.query("ROLLBACK");
        res.status(500).json({ message: error.message });
    } finally {
        client.release();
    }
};