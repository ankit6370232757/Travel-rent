const pool = require("../config/db");

const MIN_WITHDRAW = 300;
const FEE_PERCENT = 3;

exports.getWallet = async(userId) => {
    const res = await pool.query(
        "SELECT balance, locked_balance FROM wallets WHERE user_id = $1", [userId]
    );

    return res.rows[0] || { balance: 0, locked_balance: 0 };
};

exports.withdraw = async(userId, amount) => {
    if (!amount || amount < MIN_WITHDRAW) {
        throw new Error(`Minimum withdrawal amount is ${MIN_WITHDRAW}`);
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

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

        // Lock amount
        await client.query(
            `UPDATE wallets
       SET balance = balance - $1,
           locked_balance = locked_balance + $1
       WHERE user_id = $2`, [amount, userId]
        );

        // Create withdrawal request
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

exports.withdrawHistory = async(userId) => {
    const res = await pool.query(
        `SELECT amount, fee, net_amount, status, created_at
     FROM withdrawals
     WHERE user_id = $1
     ORDER BY created_at DESC`, [userId]
    );

    return res.rows;
};