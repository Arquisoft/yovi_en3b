const userService = require('./userService');

// POST /users/createuser
const createUser = async (req, res) => {
    try {
        const result = await userService.createUser(req.body);
        res.status(201).json(result);
    } catch (error) {
        console.log(error);
        // Si es error de negocio (400) o de servidor (500)
        // Por simplicidad devolvemos 400
        res.status(400).json({ error: error.message });
    }
};



module.exports = {
    createUser,
};