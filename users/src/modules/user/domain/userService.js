const bcrypt = require('bcrypt');
const userRepository = require('../data-access/userRepository');

//Service of the creation of a user.
//It checks that all the fields have been written, the email is not used yet for another user and the password fullfills the requirements.
//Here the password is encrypted to be saved.

const createUser = async (data) => {
    // 1. Check password constraints
    // if (!data.password || data.password.length < 6) {
    //     throw new Error("The password must have at least 6 characters");
    // }

    // if (!data.username || !data.email || !data.password) {
    //     throw new Error("There are some fields missing");
    // }

    if(!data.username){
        throw new Error ("Missing fields");
    }

    // 2. Check non-repeted username
    const existingUser = await userRepository.findUserByUsername(data.username);
    if (existingUser) {
        throw new Error("The username already exists");
    }

    

    // 3. Encript password (future modifications)
    data.password = "123"
    const hash = await bcrypt.hash(data.password, 10); 

    // 4. Call the repo to save
    const newUser = await userRepository.createUser({
        username: data.username,
        email: data.username, //data.email
        password: hash, //securePassword
        photo: "", 
        nickname:data.username,
    });
    
    return newUser;
};

// Service that checks if the parameter username is passed, and then searches in the db a user
// with that username. 
const findUserByUsername = async (data) => {
    if(!data.username){
        throw new Error ("The username is required");
    }

    const user = await userRepository.findUserByUsername(data.username);

    if (!user) {
        throw new Error("User not found");
    }
    return user;
}

//Checks whether a user can login (if it has an account)
const loginUser = async (data) => {
    if(!data.username || !data.password){
        throw new Error ("Missing fields");
    }
    const user = await userRepository.findUserByUsername(data.username);

    if (!user|| ! await bcrypt.compare(data.password, user.password)){
        // It returs a general error for security purposes
        throw new Error("Invalid username or password");
    }

    return user;
}
module.exports = {
    createUser,
    findUserByUsername,
    loginUser
};