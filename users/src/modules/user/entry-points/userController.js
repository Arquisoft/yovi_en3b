const userService = require('../domain/userService');
const userDto = require('../domain/userDTO');

// POST /users/createuser
//Here the service for creating a user is called. 
// In case of a successful creation, the user object is returned.
// STATUS:
    //201: resource successfully created
    //400: input error
    //500: server error
const createUser = async (req, res) => {
    try {
        const result = await userService.createUser(req.body);
        res.type('application/json').status(201).send(JSON.stringify(userDto.toUserResponseDto(result)));
    } catch (error) {
        console.log(error);
        if (error.message === "Missing fields" || error.message.includes("already exists")||error.message.includes("password")) {
            res.type('application/json').status(400).send(JSON.stringify({ error: error.message }));
        } else {
            res.type('application/json').status(500).send(JSON.stringify({ error: "Internal server error"}));
        }
    }
};

// GET /users/findUserByUsername
//Here the service for finding  a user is called. 
// STATUS:
    //200: resource successfully read
    //400: input error
    //404: resource not found
    //500: server error
const findUserByUsername = async (req, res) => {
    try {
        const user =await userService.findUserByUsername(req.query);
        res.type('application/json').status(200).send(JSON.stringify(userDto.toUserResponseDto(user)));
    } catch (error) {
        console.log(error);
        if (error.message === "The username is required") {
            return res.type('application/json').status(400).send(JSON.stringify({ error: error.message }));
        }
        
        if (error.message === "User not found") {
            return res.type('application/json').status(404).send(JSON.stringify({ error: error.message }));
        }
        return res.type('application/json').status(500).send(JSON.stringify({ error: "Internal server error"}));
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
        res.type('application/json').status(200).send(JSON.stringify(userDto.toUserResponseDto(user)));
    } catch (error) {
        console.log(error);
        if (error.message === "Missing fields") {
            return res.type('application/json').status(400).send(JSON.stringify({ error: error.message }));
        }
        
        if (error.message === "Invalid username or password") {
            return res.type('application/json').status(401).send(JSON.stringify({ error: error.message }));
        }
        return res.type('application/json').status(500).send(JSON.stringify({ error: "Internal server error"}));
    }
};

// POST /users/changePassword
//Changes the password of the indicated user
// STATUS:
    //200: resource successfully updated
    //401: unauthorized
    //500: server error
const changePassword = async (req, res) => {
    try {
        const user =await userService.changePassword(req.body);
        res.type('application/json').status(200).send(JSON.stringify(userDto.toUserResponseDto(user)));
    } catch (error) {
        console.log(error);
        if (error.message === "Invalid username or password") {
            return res.type('application/json').status(401).send(JSON.stringify({ error: error.message }));
        }
        return res.type('application/json').status(500).send(JSON.stringify({ error: "Internal server error"}));
    }
};
// POST /users/changeNickname
//Changes the nickname of the indicated user
// STATUS:
    //200: resource successfully updated
    //404: resource not found 
    //500: server error
const changeNickname = async (req, res) => {
    try {
        const user =await userService.changeNickname(req.body);
        res.type('application/json').status(200).send(JSON.stringify(userDto.toUserResponseDto(user)));
    } catch (error) {
        console.log(error);
        if (error.message === "User not found") {
            return res.type('application/json').status(404).send(JSON.stringify({ error: error.message }));
        }
        return res.type('application/json').status(500).send(JSON.stringify({ error: "Internal server error"}));
    }
};

module.exports = {
    createUser,
    findUserByUsername,
    loginUser,
    changePassword,
    changeNickname
};
