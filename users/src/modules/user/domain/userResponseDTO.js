const toUserResponseDto = (user) => {
  return {
    username: user.username,
    email: user.email,
    photo: user.photo,
    nickname: user.nickname
  };
};

module.exports = { toUserResponseDto };