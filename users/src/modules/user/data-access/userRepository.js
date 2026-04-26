const db = require('../../../db/db.js');
const queries = require("./userQueries.js");

//Access the data base to create a new User with the params passed to the query
// and returns some attributes to confirm the addition
const createUser = async (userData) => {
    const values = [userData.username, userData.email, userData.password, userData.photo, userData.nickname];
    const result = await db.query(queries.createUser, values);
    return result.rows[0];
};

//Searches a user with the username indicated in the parameter
const findUserByUsername = async (username) => {
    const result = await db.query(queries.findUserByUsername, [username]);
    return result.rows[0];
}

//Searches a user with the email indicated in the parameter
const findUserByEmail = async (email) => {
    const result = await db.query(queries.findUserByEmail, [email]);
    return result.rows[0];
}
//Changes the password of the user
const updateUserPassword = async (username, newHashedPassword) => {
    const result = await db.query(queries.updateUserPassword, [newHashedPassword, username]);
    return result.rows[0];
}

//Changes the nickname and photo of the user
const updateUserNicknameAndPhoto = async (username, nickname, photo) => {
    const result = await db.query(queries.updateUserNicknameAndPhoto, [nickname, photo, username]);
    return result.rows[0];
}

//Changes the photo of the user
const updateUserPhoto = async (username, photo) => {
    const result = await db.query(queries.updateUserPhoto, [photo, username]);
    return result.rows[0];
}

//Searches a user with the id indicated in the parameter
const findUserById = async (id) => {
    const result = await db.query(queries.findUserById, [id]);
    return result.rows[0];
}
module.exports = {
    createUser,
    findUserByUsername,
    findUserByEmail,
    updateUserPassword,
    updateUserNicknameAndPhoto,
    updateUserPhoto,
    findUserById,
};
