const userService = require('../domain/userService');

// POST /users/createuser
const createUser = async (req, res) => {
    try {
        const result = await userService.createUser(req.body);
        const message = `Welcome ${result.username}`;
        res.status(200).json({message});
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message });
    }
};



module.exports = {
    createUser,
};