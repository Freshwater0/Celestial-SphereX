class UserService {
  static createUser(userData) {
    console.log('Creating user:', userData);
    return userData;
  }

  static verifyEmail(user, token) {
    console.log('Verifying email for user:', user.email);
    return true;
  }
}

module.exports = UserService;
