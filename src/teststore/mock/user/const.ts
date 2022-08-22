enum AccountType {
  Mobile = 'mobile',
  Email = 'email',
  Google = 'google'
}
enum API {
  SIGNUP = '/user/v1/signup',
  LOGIN = '/user/v1/login',
  LOGIN_VERIFY = '/user/v1/loginverify',
  LOGOUT = '/user/v1/logout',
  UPDATE_USER = '/user/v1/update/user',
}
export { API, AccountType }
