import axios from 'axios'

// export function  httpGet(url) {
//   const baseUrl = 'https://www.liulongbin.top:8888/api/private/v1/'
//   return new Promise((resolve, reject) => {
    
//      axios.get(baseUrl+url)
//        .then(res => {
      
//       resolve(res)
//       }).catch(err => {
//       reject(err)
//     })
//   })
// }

// export function httpPost(url, params) {
//   const baseUrl = 'https://www.liulongbin.top:8888/api/private/v1/'
//   return new Promise((resolve, reject) => {
//     axios.post(baseUrl + url,params)
//       .then(res => {
//         resolve(res)
//       }).catch(err => {
//         reject(err)
//       })
//   })
// }

export function request(config) {
  const instance = axios.create({
    baseURL: 'https://www.liulongbin.top:8888/api/private/v1/',
    timeout:5000
  })
  instance.interceptors.request.use(config => {
    //验证token令牌，添加Authorization
    config.headers.Authorization = window.sessionStorage.getItem('token')
       return config
     })
  return instance(config)
}