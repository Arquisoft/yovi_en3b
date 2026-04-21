const toUserResponseDto = (user) => {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatarId: user.photo,
    nickname: user.nickname
  };
};
const toUserInputDto = (user) => {
  return {
    username: user.username,
    email: user.email,
    photo: user.avatarId,
    nickname: user.nickname,
    password: user.password,
    newPassword: user.newPassword
  };
};

module.exports = { 
  toUserResponseDto,
  toUserInputDto 
};
