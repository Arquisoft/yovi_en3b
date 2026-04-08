const bcrypt = require('bcrypt');
const userRepository = require('../data-access/userRepository');
const rankingService = require('../../ranking/domain/rankingService');

//Service of the creation of a user.
//It checks that all the fields have been written, the email is not used yet for another user and the password fullfills the requirements.
//Here the password is encrypted to be saved.

const createUser = async (data) => {
    
    if (!data.username || !data.email || !data.password || !data.nickname || !data.photo) {
        throw new Error("Missing fields");
    }
    //1. Check password constraints
    if (data.password.length < 8) {
        throw new Error("The password must have at least 8 characters");
    }

    // 2.1 Check non-repeted username
    const existingUsername = await userRepository.findUserByUsername(data.username);
    if (existingUsername) {
        throw new Error("The username already exists");
    }


    // 2.2 Check non-repeted email
    const existingEmail = await userRepository.findUserByEmail(data.email);
    if (existingEmail) {
        throw new Error("The email already exists");
    }

    // 3. Encript password (future modifications)
    // data.password = "123"
    const hash = await bcrypt.hash(data.password, 10); 

    // 4. Call the repo to save
    const newUser = await userRepository.createUser({
        username: data.username,
        email: data.email, //data.email
        password: hash, //securePassword
        photo: data.photo, 
        nickname:data.nickname,
    });

    // 5. Initialize ranking for the new user
    try {
        await rankingService.addStats(newUser.id, { totalMatches: 0, winMatches: 0 });
    } catch (rankingError) {
        console.error('Failed to initialize ranking for new user:', rankingError);
        // Don't fail user creation if ranking initialization fails
    }
    
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

// Changes the password of a user
const changePassword = async (data) => {
    // 1. Search the username
    const user = await userRepository.findUserByUsername(data.username);
    
    // 2. Check if the password and user are correct
    
    if (!user||!await bcrypt.compare(data.currentPassword, user.password)) {
        throw new Error('Invalid username or password');
    }

    // 3. Encrypt the new password
    const hashedNewPassword = await bcrypt.hash(data.newPassword, 10);

    // 4. Save the new password in the db
    const updatedUser = await userRepository.updateUserPassword(data.username, hashedNewPassword);

    return updatedUser;
};

// Changes the password of a user
const changeNickname = async (data) => {
    // 1. Search the username
    const user = await userRepository.findUserByUsername(data.username);
    
    // 2. Check if the user exists
    
    if (!user) {
        throw new Error('User not found');
    }

    // 3. Save the new nickname and photo in the db
    const updatedUser = await userRepository.updateUserNicknameAndPhoto(data.username, data.nickname, data.photo);

    return updatedUser;
};
module.exports = {
    createUser,
    findUserByUsername,
    loginUser,
    changePassword,
    changeNickname
};