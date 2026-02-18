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
// Toggle Payment Method Status
exports.togglePaymentMethod = async(req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Expecting boolean (true/false)

        await pool.query(
            "UPDATE payment_methods SET status = $1 WHERE id = $2", [status, id]
        );
        res.json({ success: true, message: "Status Updated" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};
// --- WITHDRAWAL METHODS MANAGEMENT ---

// 1. Get All Withdrawal Methods (Admin & User)
exports.getWithdrawalMethods = async(req, res) => {
    try {
        const result = await pool.query("SELECT * FROM withdrawal_methods ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// 2. Add New Withdrawal Method
exports.addWithdrawalMethod = async(req, res) => {
    try {
        const { methodName } = req.body;
        if (!methodName) return res.status(400).json({ message: "Method Name Required" });

        await pool.query("INSERT INTO withdrawal_methods (method_name) VALUES ($1)", [methodName]);
        res.json({ success: true, message: "Method Added" });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

// 3. Toggle Status (Active/Inactive)
exports.toggleWithdrawalMethod = async(req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await pool.query("UPDATE withdrawal_methods SET status = $1 WHERE id = $2", [status, id]);
        res.json({ success: true, message: "Status Updated" });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

// 4. Delete Method
exports.deleteWithdrawalMethod = async(req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM withdrawal_methods WHERE id = $1", [id]);
        res.json({ success: true, message: "Method Deleted" });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};
// --- PACKAGE MANAGEMENT ---

// 1. Get All Packages (Admin sees all, Users see only active)
exports.getPackages = async(req, res) => {
    try {
        const result = await pool.query("SELECT * FROM packages ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

// 2. Add New Package (Matches your DB columns)
exports.addPackage = async(req, res) => {
    try {
        const { name, total_seats, ticket_price, daily_income, monthly_income, yearly_income, ots_income } = req.body;

        // Simple validation
        if (!name || !ticket_price) {
            return res.status(400).json({ message: "Name and Price are required" });
        }

        const query = `
      INSERT INTO packages 
      (name, total_seats, ticket_price, daily_income, monthly_income, yearly_income, ots_income, created_at, is_active) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), TRUE) 
      RETURNING *`;

        const values = [name, total_seats, ticket_price, daily_income, monthly_income, yearly_income, ots_income];

        const newPkg = await pool.query(query, values);
        res.json(newPkg.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to add package" });
    }
};

// 3. Toggle Package Status (Active/Inactive)
exports.togglePackageStatus = async(req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body; // Expecting boolean

        await pool.query("UPDATE packages SET is_active = $1 WHERE id = $2", [is_active, id]);
        res.json({ success: true, message: "Package status updated" });
    } catch (err) {
        res.status(500).json({ message: "Update failed" });
    }
};

// 4. Delete Package
exports.deletePackage = async(req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM packages WHERE id = $1", [id]);
        res.json({ success: true, message: "Package deleted" });
    } catch (err) {
        res.status(500).json({ message: "Delete failed" });
    }
};
exports.getAllRequests = async(req, res) => {
    try {
        const query = `
            SELECT 
                d.id, d.user_id, u.name as user_name, d.amount, 'DEPOSIT' as type, 
                d.status, d.created_at as date 
            FROM deposits d
            JOIN users u ON d.user_id = u.id
            UNION ALL
            SELECT 
                w.id, w.user_id, u.name as user_name, w.amount, 'WITHDRAW' as type, 
                w.status, w.created_at as date 
            FROM withdrawals w
            JOIN users u ON w.user_id = u.id
            ORDER BY date DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

// admin.controller.js - handleRequest function

exports.handleRequest = async(req, res) => {
    const client = await pool.connect();
    try {
        const { id, type, action } = req.body;
        await client.query("BEGIN");

        // 🛡️ Standardize the final status string
        const finalStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

        if (type === 'DEPOSIT') {
            const dep = await client.query("SELECT * FROM deposits WHERE id = $1 FOR UPDATE", [id]);
            if (!dep.rows.length) throw new Error("Deposit not found");

            if (action === 'APPROVE') {
                await client.query("UPDATE wallets SET balance = balance + $1 WHERE user_id = $2", [dep.rows[0].amount, dep.rows[0].user_id]);
            }
            // ✅ Change 'action' to 'finalStatus'
            await client.query("UPDATE deposits SET status = $1 WHERE id = $2", [finalStatus, id]);

        } else if (type === 'WITHDRAW') {
            const wd = await client.query("SELECT * FROM withdrawals WHERE id = $1 FOR UPDATE", [id]);
            if (!wd.rows.length) throw new Error("Withdrawal not found");

            if (action === 'REJECT') {
                await client.query("UPDATE wallets SET balance = balance + $1, locked_balance = locked_balance - $1 WHERE user_id = $2", [wd.rows[0].amount, wd.rows[0].user_id]);
            } else {
                await client.query("UPDATE wallets SET locked_balance = locked_balance - $1 WHERE user_id = $2", [wd.rows[0].amount, wd.rows[0].user_id]);
            }
            // ✅ Change 'action' to 'finalStatus'
            await client.query("UPDATE withdrawals SET status = $1 WHERE id = $2", [finalStatus, id]);
        }

        await client.query("COMMIT");
        res.json({ message: `Request ${finalStatus}` });

    } catch (error) {
        await client.query("ROLLBACK");
        res.status(500).json({ message: error.message });
    } finally {
        client.release();
    }
};
exports.getPendingRequests = async(req, res) => {
    try {
        const deposits = await pool.query(
            `SELECT d.id, d.user_id, u.name as user_name, d.amount, 'DEPOSIT' as type, d.created_at 
             FROM deposits d 
             JOIN users u ON d.user_id = u.id 
             WHERE d.status = 'PENDING'`
        );
        const withdrawals = await pool.query(
            `SELECT w.id, w.user_id, u.name as user_name, w.amount, 'WITHDRAW' as type, w.created_at 
             FROM withdrawals w 
             JOIN users u ON w.user_id = u.id 
             WHERE w.status = 'PENDING'`
        );
        res.json([...deposits.rows, ...withdrawals.rows]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Toggle User Active Status (Deactivate/Activate)
exports.toggleUserStatus = async(req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body; // Expecting the new boolean status

        // Update the user's status in the users table
        const result = await pool.query(
            "UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, name, is_active", [is_active, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const statusLabel = is_active ? "Activated" : "Deactivated";
        res.json({
            success: true,
            message: `User ${result.rows[0].name} has been ${statusLabel}`,
            user: result.rows[0]
        });
    } catch (err) {
        console.error("Toggle Status Error:", err);
        res.status(500).json({ message: "Failed to update user status" });
    }
};

// Get Global Settings
exports.getSettings = async(req, res) => {
    try {
        const result = await pool.query("SELECT * FROM system_settings WHERE id = 1");
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: "Error fetching settings" });
    }
};

// Update Global Settings
exports.updateSettings = async(req, res) => {
    try {
        const { upi_id, min_withdraw, withdraw_fee, withdraw_status, deposit_status, maintenance_mode, announcement_text } = req.body;

        const query = `
            UPDATE system_settings 
            SET upi_id = $1, min_withdraw = $2, withdraw_fee = $3, 
                withdraw_status = $4, deposit_status = $5, 
                maintenance_mode = $6, announcement_text = $7,
                updated_at = NOW()
            WHERE id = 1
            RETURNING *;
        `;

        const values = [upi_id, min_withdraw, withdraw_fee, withdraw_status, deposit_status, maintenance_mode, announcement_text];
        const result = await pool.query(query, values);

        res.json({ success: true, message: "Settings updated", data: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update settings" });
    }
};
// controllers/admin.controller.js

exports.getAllPackages = async(req, res) => {
    try {
        // This query counts how many seats are 'OCCUPIED' for each package
        // by joining the packages table with the seats table.
        const query = `
            SELECT 
                p.*, 
                COALESCE(s.occupied_count, 0) as filled_seats
            FROM packages p
            LEFT JOIN (
                SELECT package_id, COUNT(*) as occupied_count 
                FROM seats 
                WHERE status = 'OCCUPIED' 
                GROUP BY package_id
            ) s ON p.id = s.package_id
            ORDER BY p.id ASC
        `;

        const result = await pool.query(query);

        // Return the rows to the frontend
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching package inventory:", err);
        res.status(500).json({ message: "Server error" });
    }
};