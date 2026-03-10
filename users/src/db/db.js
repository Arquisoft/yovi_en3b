// imports the library to run PostgreSQL
const {Pool} = require('pg');
//imports the data of the file .env to connect with the db
require('dotenv').config();


//Creates a pool of connections to optimize the access to the database
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});
//exports the service
module.exports = {
  query: (text, params) => pool.query(text, params),
};