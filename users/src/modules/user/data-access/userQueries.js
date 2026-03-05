// File to write the queries required for the users management
module.exports = {
  createUser: `
    INSERT INTO users (username, email, password, photo, nickname)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING nickname, username, photo, email; 
  `,
  findUserByUsername: `
    SELECT username, nickname, photo, email, password
    FROM users 
    WHERE username = $1; 
  `
  
};