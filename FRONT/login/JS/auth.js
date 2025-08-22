function isLogado() {
  return !!localStorage.getItem('jwtToken');
}
function getUsuarioLogado() {
  const usuario = localStorage.getItem('usuario');
  return usuario ? JSON.parse(usuario) : null;
}