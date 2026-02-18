
const userRepository = require('../data-access/userRepository');

const createUser = async (data) => {
    // 1. Check password constraints
    // if (!data.password || data.password.length < 6) {
    //     throw new Error("The password must have at least 6 characters");
    // }

    // if (!data.username || !data.email || !data.password) {
    //     throw new Error("There are some fields missing");
    // }

    // 2. Check non-repeted e-mail
    // const existingUser = await userRepository.findUserByEmail(data.email);
    // if (existingUser) {
    //     throw new Error("The email is already used");
    // }

    // 3. Encript password (future modifications)
    // const hash = await bcrypt.hash(data.password, 10);
    //const fakeHash = `encrypted_${data.password}`; 

    // 4. Call the repo to save
    const newUser = await userRepository.createUser({
        username: data.username,
        email: "" + Math.random(), //data.email
        password: "", //securePassword
    });
    
    return newUser;
};

module.exports = {
    createUser
};