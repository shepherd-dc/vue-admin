const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  key: state => state.user.key,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  roles: state => state.user.roles,
  menus: state => state.menus.menus,
  content: state => state.article.article.content
}
export default getters
