import { login, getInfo, logout } from '@/api/login'
import { getToken, setToken, removeToken, setLocalStorage, getLocalStorage, removeLocalStorage } from '@/utils/auth'
import { desDecrypt } from '@/utils/crypto'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: getLocalStorage('nickname'),
    roles: getLocalStorage('roles'),
    avatar: ''
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    removeLocalStorage('nickname')
    removeLocalStorage('roles')
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
    setLocalStorage('nickname', name)
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
    setLocalStorage('roles', roles)
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username: account, password: secret } = userInfo
    return new Promise((resolve, reject) => {
      login({ account, secret, type: 100 }).then(response => {
        const { data } = response
        commit('SET_TOKEN', data.token)
        setToken(data.token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo({ token: state.token }).then(response => {
        const { data } = response

        if (!data) {
          reject('Verification failed, please Login again.')
        }

        let { scope, nickname } = data
        scope = desDecrypt(scope)
        nickname = desDecrypt(nickname)
        if (scope) { // verify permission scope
          commit('SET_ROLES', scope)
        } else {
          reject('getInfo: no permission scope !')
        }

        commit('SET_NAME', nickname)
        // commit('SET_AVATAR', avatar)

        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      // mock api
      logout(state.token).then(() => {
        removeToken() // must remove token first
        resetRouter()
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', '')
      removeToken()
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

