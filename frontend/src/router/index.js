import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/category',
    name: 'Category',
    component: () => import('../views/Category.vue')
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('../views/Cart.vue')
  },
  {
    path: '/user',
    name: 'User',
    component: () => import('../views/User.vue')
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import('../views/ProductDetail.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/addresses',
    name: 'AddressList',
    component: () => import('../views/AddressList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/address/edit',
    name: 'AddressEdit',
    component: () => import('../views/AddressEdit.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/order/confirm',
    name: 'OrderConfirm',
    component: () => import('../views/OrderConfirm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'OrderList',
    component: () => import('../views/OrderList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/order/:id',
    name: 'OrderDetail',
    component: () => import('../views/OrderDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/payment/:orderId',
    name: 'Payment',
    component: () => import('../views/Payment.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/refund/apply',
    name: 'RefundApply',
    component: () => import('../views/RefundApply.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/refunds',
    name: 'RefundList',
    component: () => import('../views/RefundList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/refund/:id',
    name: 'RefundDetail',
    component: () => import('../views/RefundDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/coupons',
    name: 'CouponCenter',
    component: () => import('../views/CouponCenter.vue')
  },
  {
    path: '/my-coupons',
    name: 'MyCoupons',
    component: () => import('../views/MyCoupons.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/distributor/apply',
    name: 'DistributorApply',
    component: () => import('../views/DistributorApply.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/distributor/center',
    name: 'DistributorCenter',
    component: () => import('../views/DistributorCenter.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫 - 检查登录状态
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !token) {
    // 需要登录但未登录，跳转到登录页
    next('/login')
  } else {
    next()
  }
})

export default router
