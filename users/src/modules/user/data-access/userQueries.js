module.exports = {
  createUser: `
    INSERT INTO users (username, email, password, photo)
    VALUES ($1, $2, $3, $4)
    RETURNING id, username, email, photo, created_at; 
  `
};