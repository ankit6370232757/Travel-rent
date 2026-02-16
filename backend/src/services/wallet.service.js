const pool = require("../config/db");

const MIN_WITHDRAW = 300;
const FEE_PERCENT = 3;

/**
 * Get Wallet Balance
 */
exports.getWallet = async(userId) => {
    const res = await pool.query(
        "SELECT balance, locked_balance FROM wallets WHERE user_id = $1", [userId]
    );

    return res.rows[0] || { balance: 0, locked_balance: 0 };
};

/**
 * Request a Deposit (User uploads proof, Admin approves later)
 * ✅ NEW FUNCTION
 */
exports.requestDeposit = async(userId, amount) => {
    if (!amount || amount <= 0) {
        throw new Error("Invalid amount");
    }

    // Insert into deposits table (Status: PENDING)
    await pool.query(
        `INSERT INTO deposits (user_id, amount, status)
         VALUES ($1, $2, 'PENDING')`, [userId, amount]
    );

    return { message: "Deposit request submitted. Waiting for admin approval." };
};

/**
 * Withdraw Funds
 */
e
/**
 * Withdraw Funds via Admin-Defined Payment Method
 */
exports.withdraw = async(userId, amount, methodName, address) => {
    // 1. Minimum withdrawal validation
    if (!amount || amount < 300) {
        throw new Error("Minimum withdrawal amount is ₹300");
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // 2. Lock Wallet and check balance
        const walletRes = await client.query(
            "SELECT balance FROM wallets WHERE user_id = $1 FOR UPDATE", [userId]
        );

        if (!walletRes.rows.length) throw new Error("Wallet not found");

        const balance = Number(walletRes.rows[0].balance);
        if (balance < amount) throw new Error("Insufficient balance");

        // 3. Calculate Fee and Net Amount
        const fee = (amount * 3) / 100; // 3% Admin Fee
        const netAmount = amount - fee;

        // 4. Update Wallets: Move from balance to locked
        await client.query(
            `UPDATE wallets 
             SET balance = balance - $1, 
                 locked_balance = locked_balance + $1 
             WHERE user_id = $2`, [amount, userId]
        );

        // 5. Create Withdrawal Record with Method Details
        // Note: 'method_name' and 'address' columns must exist in your 'withdrawals' table
        await client.query(
            `INSERT INTO withdrawals (user_id, amount, fee, net_amount, status)
             VALUES ($1, $2, $3, $4, 'PENDING')`, [userId, amount, fee, netAmount]
        );

        await client.query("COMMIT");
        return { message: "Withdrawal submitted for admin review", status: "PENDING" };

    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};
/**
 * Get Withdrawal History
 */
exports.withdrawHistory = async(userId) => {
    const res = await pool.query(
        `SELECT amount, fee, net_amount, status, created_at
         FROM withdrawals
         WHERE user_id = $1
         ORDER BY created_at DESC`, [userId]
    );

    return res.rows;
};