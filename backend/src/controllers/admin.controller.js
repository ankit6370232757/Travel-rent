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
exports.getAllUsers = async(req, res) => {
    try {
        const query = `
            SELECT u.id, u.name, u.email, u.role, u.created_at, w.balance 
            FROM users u 
            LEFT JOIN wallets w ON u.id = w.user_id 
            ORDER BY u.id DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch users" });
    }
};
exports.addPaymentMethod = async(req, res) => {
    try {
        // Now accepting qrCode from body
        const { methodName, details, qrCode } = req.body;

        await pool.query(
            "INSERT INTO payment_methods (method_name, details, qr_code) VALUES ($1, $2, $3)", [methodName, details, qrCode] // Save the Base64 string or URL
        );

        res.json({ success: true, message: "Payment Method Added" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// 2. Get All Payment Methods (For Admin & User)
exports.getPaymentMethods = async(req, res) => {
    try {
        const result = await pool.query("SELECT * FROM payment_methods WHERE status = true ORDER BY id DESC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

// 3. Delete Payment Method
exports.deletePaymentMethod = async(req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM payment_methods WHERE id = $1", [id]);
        res.json({ success: true, message: "Method Deleted" });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};