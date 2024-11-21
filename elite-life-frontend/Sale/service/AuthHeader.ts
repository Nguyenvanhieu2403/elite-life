
export default function authHeader() {
  if (typeof window !== 'undefined') {
    if (localStorage.getItem('jwt') !== null && localStorage.getItem('jwt') !== 'undefined') {
      const jwt = localStorage.getItem("jwt");
      let jwtUser
      if (jwt)
        jwtUser = JSON.parse(jwt);
      if (jwt) {
        return { Authorization: 'Bearer ' + jwtUser };
      } else {
        return { Authorization: '' };
      }
    }
  }
}