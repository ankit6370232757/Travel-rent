const pool = require("../config/db");

// 1. Get Pending Requests
exports.getPendingRequests = async(req, res) => {
    try {
        // Deposits logic
        const deposits = await pool.query(
            `SELECT d.id, d.user_id, u.name as user_name, d.amount, d.transaction_id, 'DEPOSIT' as type, d.created_at 
             FROM deposits d 
             JOIN users u ON d.user_id = u.id 
             WHERE d.status = 'PENDING'`
        );

        // Withdrawals logic - Joining with withdrawal_accounts to get details
        const withdrawals = await pool.query(
            `SELECT w.id, w.user_id, u.name as user_name, w.net_amount as amount, 
             wa.method_name, wa.address, wa.qr_code, 
             'WITHDRAW' as type, w.id as withdrawal_id 
             FROM withdrawals w
             JOIN users u ON w.user_id = u.id
             LEFT JOIN withdrawal_accounts wa ON w.user_id = wa.user_id
             WHERE w.status = 'PENDING'`
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
        // 🟢 Ensure 'password' is explicitly selected here
        const query = `
            SELECT id, name, email, password, role, is_active, created_at 
            FROM users 
            ORDER BY created_at DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
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
        const { name, code, total_seats, ticket_price, daily_income, monthly_income, yearly_income, ots_income, description } = req.body;

        if (!name || !ticket_price || !code) {
            return res.status(400).json({ message: "Name, Code and Price are required" });
        }

        const query = `
            INSERT INTO packages 
            (name, code, total_seats, ticket_price, daily_income, monthly_income, yearly_income, ots_income, created_at, is_active, description) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), TRUE, $9) 
            RETURNING *`;

        // Ensure all 9 values are mapped correctly
        const values = [
            name, 
            code, 
            total_seats || 180, 
            ticket_price, 
            daily_income || 0, 
            monthly_income || 0, 
            yearly_income || 0, 
            ots_income || 0, 
            description
        ];

        const newPkg = await pool.query(query, values);
        res.json(newPkg.rows[0]);

    } catch (err) {
        console.error("ADD PACKAGE ERROR:", err);
        res.status(500).json({ message: err.message });
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
                d.transaction_id, 
                NULL as method_name, NULL as address, NULL as qr_code,
                d.status, d.created_at as date 
            FROM deposits d
            JOIN users u ON d.user_id = u.id
            UNION ALL
            SELECT 
                w.id, w.user_id, u.name as user_name, w.net_amount as amount, 'WITHDRAW' as type, 
                NULL as transaction_id,
                wa.method_name, wa.address, wa.qr_code,
                w.status, NOW() as date 
            FROM withdrawals w
            JOIN users u ON w.user_id = u.id
            LEFT JOIN withdrawal_accounts wa ON w.user_id = wa.user_id
            ORDER BY date DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("All Requests Error:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
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
        // Fetches all configuration including the new announcement_image field
        const result = await pool.query("SELECT * FROM system_settings WHERE id = 1");
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Fetch Settings Error:", err);
        res.status(500).json({ message: "Error fetching settings" });
    }
};

// Update Global Settings
exports.updateSettings = async(req, res) => {
    try {
        const {
            upi_id,
            min_withdraw,
            withdraw_fee,
            withdraw_status,
            deposit_status,
            maintenance_mode,
            announcement_text,
            announcement_image // 🟢 New field added here
        } = req.body;

        const query = `
            UPDATE system_settings 
            SET upi_id = $1, 
                min_withdraw = $2, 
                withdraw_fee = $3, 
                withdraw_status = $4, 
                deposit_status = $5, 
                maintenance_mode = $6, 
                announcement_text = $7,
                announcement_image = $8, -- 🟢 Added column mapping
                updated_at = NOW()
            WHERE id = 1
            RETURNING *;
        `;

        const values = [
            upi_id,
            min_withdraw,
            withdraw_fee,
            withdraw_status,
            deposit_status,
            maintenance_mode,
            announcement_text,
            announcement_image // 🟢 New value passed to query
        ];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Settings record not found" });
        }

        res.json({
            success: true,
            message: "System parameters synced successfully",
            data: result.rows[0]
        });
    } catch (err) {
        console.error("Update Settings Error:", err);
        res.status(500).json({ message: "Failed to update settings" });
    }
};

exports.getAllPackages = async(req, res) => {
    try {
        const query = `
            SELECT 
                p.*, 
                COALESCE(s.occupied_count, 0) as filled_seats,
                -- Logic: floor(occupied / total_seats) + 1
                CASE 
                    WHEN p.total_seats > 0 THEN FLOOR(COALESCE(s.occupied_count, 0) / p.total_seats) + 1 
                    ELSE 1 
                END as current_batch
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
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: "Server error fetching tracker" });
    }
};

exports.getAllFinanceLogs = async(req, res) => {
    try {
        const query = `
            WITH combined_logs AS (
                -- 1. Deposits (Confirmed columns: id, user_id, amount, status, created_at)
                SELECT 
                    id::text AS txn_id, 
                    user_id, 
                    'DEPOSIT' AS type, 
                    amount, 
                    status, 
                    created_at 
                FROM deposits
                
                UNION ALL
                
                -- 2. Withdrawals (Confirmed columns: id, user_id, amount, status, created_at)
                SELECT 
                    id::text AS txn_id, 
                    user_id, 
                    'WITHDRAW' AS type, 
                    amount, 
                    status, 
                    created_at 
                FROM withdrawals
                
                UNION ALL
                
                -- 3. Income Logs (Fixed: income_type used instead of type)
                SELECT 
                    id::text AS txn_id, 
                    user_id, 
                    income_type AS type, -- 🟢 Corrected based on image_d20408.png
                    amount, 
                    'Success' AS status, 
                    created_at 
                FROM income_logs
            )
            SELECT 
                cl.*, 
                u.name AS user_full_name
            FROM combined_logs cl
            -- 🟢 Joining on u.id (Confirmed as primary key in image_d207ad.png)
            INNER JOIN users u ON u.id = cl.user_id
            ORDER BY cl.created_at DESC;
        `;

        const result = await pool.query(query);

        const formattedData = result.rows.map(row => ({
            txn_id: row.txn_id,
            user_id: row.user_id, // This is your 6-digit integer ID
            user_name: row.user_full_name || "Unknown User",
            type: row.type, // Will show DEPOSIT, WITHDRAW, or the value from income_type
            amount: parseFloat(row.amount) || 0,
            status: row.status,
            created_at: row.created_at
        }));

        res.json(formattedData);
    } catch (err) {
        // Detailed logging for Render debugging
        console.error("FINANCE LEDGER CRASH:", {
            message: err.message,
            detail: err.detail,
            table_mismatch: "Check if all UNIONed columns match data types"
        });
        res.status(500).json({ success: false, error: err.message });
    }
};
exports.getPendingCount = async(req, res) => {
    try {
        const query = "SELECT COUNT(*) FROM deposits WHERE status = 'PENDING'";
        const result = await pool.query(query);

        res.json({
            success: true,
            count: parseInt(result.rows[0].count)
        });
    } catch (error) {
        console.error("Error fetching pending count:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
// Update Package Details (Inline Editing)
exports.updatePackage = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Strictly pull only these fields from the request body
        const { 
            name, code, ticket_price, total_seats, 
            daily_income, monthly_income, yearly_income, 
            ots_income, description 
        } = req.body;

        const query = `
            UPDATE packages 
            SET name = $1, 
                code = $2, 
                ticket_price = $3, 
                total_seats = $4, 
                daily_income = $5, 
                monthly_income = $6, 
                yearly_income = $7, 
                ots_income = $8, 
                description = $9
            WHERE id = $10 
            RETURNING *;`;

        const values = [
            name, 
            code, 
            ticket_price, 
            total_seats, 
            daily_income || 0, 
            monthly_income || 0, 
            yearly_income || 0, 
            ots_income || 0, 
            description || '', 
            id
        ];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Package not found" });
        }

        res.json({ success: true, data: result.rows[0] });

    } catch (err) {
        console.error("SQL UPDATE ERROR:", err.message);
        // This will send the ACTUAL database error to your frontend console
        res.status(500).json({ message: "DB Error: " + err.message });
    }
};