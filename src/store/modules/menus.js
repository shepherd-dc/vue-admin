const menus = {
  namespaced: true,
  state: {
    menus: []
  },
  mutations: {
    saveMenus: (state, payload) => {
      state.menus = payload
    }
  }
}

export default menus
