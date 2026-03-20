import { createRouter, createWebHistory } from 'vue-router'
import IndexView from '../views/IndexView.vue'
import LoginView from '../views/LoginView.vue'
import AdminLayout from '../layout/AdminLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: IndexView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/dashboard',
      component: AdminLayout,
      // redirect: '/dashboard/detection', // 默认跳转到检测页
      children: [
        {
          path: '',
          redirect: { name: 'detection-image' },
        },
        {
          path: 'detection-image',
          name: 'detection-image',
          component: () => import('../views/dashboard/AnomalyDetectionImage.vue'),
        },
        {
          path: 'detection-video',
          name: 'detection-video',
          component: () => import('../views/dashboard/AnomalyDetectionVideo.vue'),
        },
        {
          path: 'detection',
          redirect: { name: 'detection-image' },
        },
        {
          path: 'statistics',
          name: 'statistics',
          component: () => import('../views/dashboard/DataStatistics.vue'),
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('../views/dashboard/UserProfile.vue'),
        },
        {
          path: 'user-management',
          name: 'user-management',
          component: () => import('../views/dashboard/UserManagement.vue'),
        },
      ],
    },
  ],
})

// 路由守卫：未登录不允许访问除 login 外的页面
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.name !== 'login' && !token) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router
