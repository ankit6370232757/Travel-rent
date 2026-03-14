const pool = require("../config/db");

// --- USER SIDE ---

// 1. Create Ticket
exports.createTicket = async (req, res) => {
    try {
        const { subject, message } = req.body;
        const userId = req.user.id; // From auth middleware

        const query = `
            INSERT INTO support_tickets (user_id, subject, message, status, created_at)
            VALUES ($1, $2, $3, 'OPEN', NOW()) RETURNING *;
        `;
        const result = await pool.query(query, [userId, subject, message]);
        res.json({ success: true, ticket: result.rows[0] });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

// 2. Get My Tickets
exports.getMyTickets = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            "SELECT * FROM support_tickets WHERE user_id = $1 ORDER BY created_at DESC", 
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

// --- ADMIN SIDE ---

// 3. Get All Tickets (Admin)
exports.getAllTickets = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT t.*, u.name as user_name FROM support_tickets t JOIN users u ON t.user_id = u.id ORDER BY created_at DESC"
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

// 4. Reply to Ticket (Admin)
exports.replyTicket = async (req, res) => {
    try {
        const { ticketId, reply } = req.body;
        const query = `
            UPDATE support_tickets 
            SET admin_reply = $1, status = 'CLOSED' 
            WHERE id = $2 RETURNING *;
        `;
        await pool.query(query, [reply, ticketId]);
        res.json({ success: true, message: "Reply sent and ticket closed" });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};