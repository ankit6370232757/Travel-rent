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
exports.withdraw = async(userId, amount) => {
    if (!amount || amount < MIN_WITHDRAW) {
        throw new Error(`Minimum withdrawal amount is ${MIN_WITHDRAW}`);
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // 1. Lock Wallet Row
        const walletRes = await client.query(
            "SELECT balance FROM wallets WHERE user_id = $1 FOR UPDATE", [userId]
        );

        if (!walletRes.rows.length) {
            throw new Error("Wallet not found");
        }

        const balance = Number(walletRes.rows[0].balance);

        if (balance < amount) {
            throw new Error("Insufficient balance");
        }

        const fee = (amount * FEE_PERCENT) / 100;
        const netAmount = amount - fee;

        // 2. Deduct Balance & Move to Locked
        await client.query(
            `UPDATE wallets
             SET balance = balance - $1,
                 locked_balance = locked_balance + $1
             WHERE user_id = $2`, [amount, userId]
        );

        // 3. Create Withdrawal Record
        await client.query(
            `INSERT INTO withdrawals (user_id, amount, fee, net_amount)
             VALUES ($1, $2, $3, $4)`, [userId, amount, fee, netAmount]
        );

        await client.query("COMMIT");

        return {
            message: "Withdrawal request created",
            amount,
            fee,
            netAmount,
            status: "PENDING"
        };

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