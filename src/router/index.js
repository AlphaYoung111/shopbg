import Vue from 'vue'
import VueRouter from 'vue-router'
const Login = () => import('@/components/Login')
const Home = () => import('@/components/Home')
const Welcome = () => import('@/components/Welcome')
const Users = () => import('@/views/users/Users')
const Rights = () => import('@/views/power/Rights')
const Roles = () => import('@/views/power/Roles')
const Categories = () => import('@/views/goods/Categories')
const GoodParams = () => import('@/views/goods/GoodParams')

Vue.use(VueRouter)

const routes = [{
    path: '/login',
    component: Login
  },
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [{
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/users',
        component: Users
      },
      {
        path: '/rights',
        component: Rights
      },
      {
        path: '/roles',
        component: Roles
      },
      {
        path: '/categories',
        component: Categories
      },
      {
        path: '/params',
        component: GoodParams
      }
    ]
  },

]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

//路由守卫
router.beforeEach((to, from, next) => {
  //从登录页面来的
  if (to.path === '/login') return next()
  //从其他页面来的
  const haveToken = window.sessionStorage.getItem('token')
  if (!haveToken) return next('/login')
  next()
})

export default router
