import request from '@/utils/request'

export function menuList(query = '') {
  return request({
    url: `/menu`,
    method: 'get',
    params: query
  })
}

export function submenuList(query = '') {
  return request({
    url: `/menu/submenu`,
    method: 'get',
    params: query
  })
}

export function menuDetail(query = '') {
  return request({
    url: `/menu/detail`,
    method: 'get',
    params: query
  })
}

export function addMenu(data) {
  return request({
    url: `/menu/add`,
    method: 'post',
    data
  })
}

export function editMenu(data) {
  return request({
    url: `/menu/edit`,
    method: 'put',
    data
  })
}

export function disableMenu(data) {
  return request({
    url: `/menu/disable`,
    method: 'post',
    data
  })
}

export function deleteMenu(data) {
  return request({
    url: `/menu/delete`,
    method: 'delete',
    data
  })
}

export function saveSubmenu(data) {
  return request({
    url: `/menu/submenu/save`,
    method: 'post',
    data
  })
}

export function deleteSubmenu(data) {
  return request({
    url: `/menu/submenu/delete`,
    method: 'post',
    data
  })
}

export function hardDeleteSubmenu(data) {
  return request({
    url: `/menu/submenu/delete`,
    method: 'delete',
    data
  })
}
