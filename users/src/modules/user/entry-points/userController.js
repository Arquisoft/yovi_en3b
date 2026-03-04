const userService = require('../domain/userService');
const userResponseDto = require('../domain/userResponseDTO');

// POST /users/createuser
//Here the service for creating a user is called. 
// In case of a successful creation, a message is returned.
// STATUS:
    //201: resource successfully created
    //400: input error
    //500: server error
const createUser = async (req, res) => {
    try {
        const result = await userService.createUser(req.body);
        const message = `Welcome ${result.username}`;
        res.status(201).json({message});
    } catch (error) {
        console.log(error);
        if (error.message === "Missing fields" || error.message.includes("already exists")) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: "Internal server error"});
    }
};

// POST /users/findUserByUsername
//Here the service for finding  a user is called. 
// STATUS:
    //200: resource successfully read
    //400: input error
    //404: resource not found
    //500: server error
const findUserByUsername = async (req, res) => {
    try {
        const user =await userService.findUserByUsername(req.body);
        res.status(200).json(userResponseDto.toUserResponseDto(user));
    } catch (error) {
        console.log(error);
        if (error.message === "The username is required") {
            return res.status(400).json({ error: error.message });
        }
        
        if (error.message === "User not found") {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: "Internal server error"});
    }
};

// POST /users/loginUser
//Checks whether a user can log in (has an account)
// STATUS:
    //200: resource successfully read
    //400: input error
    //401: unauthorized
    //500: server error
const loginUser = async (req, res) => {
    try {
        const user =await userService.loginUser(req.body);
        res.status(200).json(userResponseDto.toUserResponseDto(user));
    } catch (error) {
        console.log(error);
        if (error.message === "Missing fields") {
            return res.status(400).json({ error: error.message });
        }
        
        if (error.message === "Invalid username or password") {
            return res.status(401).json({ error: error.message });
        }
        return res.status(500).json({ error: "Internal server error"});
    }
};



module.exports = {
    createUser,
    findUserByUsername,
    loginUser
};