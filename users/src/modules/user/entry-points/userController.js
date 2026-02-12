const userService = require('../domain/userService');

// POST /users/createuser
const createUser = async (req, res) => {
    try {
        const result = await userService.createUser(req.body);
        res.status(201).json(result);
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message });
    }
};



module.exports = {
    createUser,
};