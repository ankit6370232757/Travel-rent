const pool = require("../config/db");

const generateSixDigitId = async (tableName) => {
    let isUnique = false;
    let newId;

    while (!isUnique) {
        // Generate random number between 100000 and 999999
        newId = Math.floor(100000 + Math.random() * 900000);

        // Check if ID exists
        const res = await pool.query(`SELECT id FROM ${tableName} WHERE id = $1`, [newId]);
        if (res.rows.length === 0) {
            isUnique = true;
        }
    }
    return newId;
};

module.exports = { generateSixDigitId };