const article = {
  namespaced: true,
  state: {
    article: {
      content: ''
    }
  },
  mutations: {
    saveArticleContent: (state, payload) => {
      console.log(payload)
      state.article.content = payload.content
    }
  }
}

export default article
