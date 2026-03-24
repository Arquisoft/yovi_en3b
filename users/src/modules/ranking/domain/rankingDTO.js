const toRankingResponseDto = (ranking) => {
  return {
    username: user.username,
    email: user.email,
    photo: user.photo,
    nickname: user.nickname
  };
};
const toUserInputDto = (user) => {
  return {
    username: user.username,
    email: user.email,
    photo: user.photo,
    nickname: user.nickname,
    password: user.password,
    newPassword: user.newPassword
  };
};

module.exports = { 
  toRankingResponseDto,
  toUserInputDto 
};