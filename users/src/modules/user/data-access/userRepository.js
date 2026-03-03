const db = require('../../../db/db.js');
const queries = require("./userQueries.js");

//Access the data base to create a new User with the params passed to the query
// and returns some attributes to confirm the addition
const createUser = async (userData) => {
    
    const values = [userData.username, userData.email, userData.password, userData.photo];
    const result = await db.query(queries.createUser, values);
    return result.rows[0];
};

module.exports = {
    createUser,
};