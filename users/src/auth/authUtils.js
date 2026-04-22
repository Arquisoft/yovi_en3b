const jwt = require('jsonwebtoken');

const generateUserToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username }, 
        process.env.JWT_SECRET, 
        { expiresIn: '2h' }
    );
};


const verifyToken= (req, res, next) => {
    // 1. Search the token in the header
    const authHeader = req.headers['authorization'];
    
    // 2. Extract the token
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied: No token' });
    }

    try {
        // 3. Verify the token
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Safe the id and the username
        req.user = verified;
        next(); 

    } catch (error) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};


module.exports = { generateUserToken, verifyToken };