import request from '@/utils/request'

export function fetchMenu(query = '') {
  return request({
    url: `/menu?nav=${query}`,
    method: 'get'
  })
}

export function fetchImage(filename) {
  return request({
    url: `/upload/image/${filename}`,
    method: 'get'
  })
}

export function deleteImage(filename) {
  return request({
    url: `/upload/image/${filename}`,
    method: 'delete'
  })
}
