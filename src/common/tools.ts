
export const uploadUrl = '/api/product/imageUpload'

// session storage
export function setStorage(key: any, value:any){
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function getStorage(key:any){
  let data = window.localStorage.getItem(key)
  return data && data !== 'undefined' ? JSON.parse(data) : ''
}

export default {
  setStorage, getStorage, uploadUrl,
}
