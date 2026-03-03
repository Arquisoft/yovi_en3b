const db = require('../../../db/db.js');

//Access the data base to create a new User with the params passed to the query
// and returns some attributes to confirm the addition
const createUser = async (userData) => {
    const query = `
        INSERT INTO users (username, email, password, photo)
        VALUES ($1, $2, $3, $4)
        RETURNING id, username, email, photo, created_at; 
    `;
    const values = [userData.username, userData.email, userData.password, userData.photo];
    const { rows } = await db.query(query, values);
    return rows[0];
};


// const findUserByEmail = async (email) => {
//     const query = 'SELECT * FROM users WHERE email = $1';
//     const { rows } = await db.query(query, [email]);
//     return rows[0];
// };


// const findUserById = async (id) => {
//     const query = 'SELECT id, username, email, created_at FROM users WHERE id = $1';
//     const { rows } = await db.query(query, [id]);
//     return rows[0];
// };

module.exports = {
    createUser,
    // findUserByEmail,
    // findUserById
};