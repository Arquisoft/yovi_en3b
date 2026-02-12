const db = require('../../../db/db.js');

const createUser = async (userData) => {
    const query = `
        INSERT INTO users (username, email, password)
        VALUES ($1, $2, $3)
        RETURNING id, username, email, created_at; 
    `;
    const values = [userData.username, userData.email, userData.password];
    const { rows } = await db.query(query, values);
    return rows[0];
};


const findUserByEmail = async (email) => {
    const query = 'SELECT * FROM users WHERE email = $1';
    const { rows } = await db.query(query, [email]);
    return rows[0];
};


const findUserById = async (id) => {
    const query = 'SELECT id, username, email, created_at FROM users WHERE id = $1';
    const { rows } = await db.query(query, [id]);
    return rows[0];
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById
};