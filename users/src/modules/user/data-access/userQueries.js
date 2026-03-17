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
  `,
  findUserByEmail: `
    SELECT username, nickname, photo, email, password
    FROM users 
    WHERE email = $1; 
  `,
  updateUserPassword: `
    UPDATE users
    SET password = $1
    WHERE username = $2 
    RETURNING username, email, photo, nickname;
  `
};