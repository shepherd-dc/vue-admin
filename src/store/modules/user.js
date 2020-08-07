import { login, getInfo, logout } from '@/api/login'
import { fetchKeyCode } from '@/api/user'
import { getToken, setToken, removeToken, setLocalStorage, getLocalStorage } from '@/utils/auth'
import { desDecrypt } from '@/utils/crypto'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    key: getLocalStorage('sn_code'),
    name: getLocalStorage('nickname'),
    avatar: '',
    roles: ''
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SAVE_KEY: (state, key) => {
    state.key = key
  }
}

const actions = {
  // save code key
  async saveCodeKey({ commit }) {
    const res = await fetchKeyCode()
    if (res.error_code === 0) {
      const { data } = res
      commit('SAVE_KEY', data)
      setLocalStorage('sn_code', data)
    }
  },
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
        const key = atob(state.key)
        scope = desDecrypt(scope, key)
        nickname = desDecrypt(nickname, key)
        if (scope) { // verify permission scope
          commit('SET_ROLES', scope)
        } else {
          reject('getInfo: no permission scope !')
        }

        setLocalStorage('nickname', nickname)
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

