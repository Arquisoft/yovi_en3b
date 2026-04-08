const { updateUserNickName } = require("./userRepository");

// File to write the queries required for the users management
module.exports = {
  createUser: `
    INSERT INTO users (username, email, password, photo, nickname)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, nickname, username, photo, email; 
  `,
  findUserByUsername: `
    SELECT id, username, nickname, photo, email, password
    FROM users 
    WHERE username = $1; 
  `,
  findUserByEmail: `
    SELECT id, username, nickname, photo, email, password
    FROM users 
    WHERE email = $1; 
  `,
  updateUserPassword: `
    UPDATE users
    SET password = $1
    WHERE username = $2 
    RETURNING id, username, email, photo, nickname;
  `,
  updateUserNickname: `
    UPDATE users
    SET nickname = $1
    WHERE username = $2 
    RETURNING id, username, email, photo, nickname;
  `,
  updateUserNicknameAndPhoto: `
    UPDATE users
    SET nickname = $1, photo = $2
    WHERE username = $3 
    RETURNING id, username, email, photo, nickname;
  `
};
