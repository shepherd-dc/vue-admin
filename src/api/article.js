import request from '@/utils/request'

export function fetchList(query = '') {
  return request({
    url: `/article`,
    method: 'get',
    params: query
  })
}

export function fetchArticle(id) {
  return request({
    url: `/article/${id}`,
    method: 'get'
  })
}

export function createArticle(data) {
  return request({
    url: '/article/publish',
    method: 'post',
    data
  })
}

export function editArticle(data) {
  return request({
    url: '/article/edit',
    method: 'put',
    data
  })
}

export function deleteArticle(data) {
  return request({
    url: '/article/delete',
    method: 'delete',
    data
  })
}
