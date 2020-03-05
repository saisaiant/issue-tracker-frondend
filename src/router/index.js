import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Middleswares from '../middlewares/index';

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'login',
    component: () => import(/* webpackChunkName: "about" */ '../views/auth/Login.vue'),
    meta: {
      middleware: [Middleswares.guest]
    }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/auth/Register.vue'),
    meta: {
      middleware: [Middleswares.guest]
    }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/pages/Dashboard.vue'),
    meta: {
      middleware: [Middleswares.auth]
    }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

function nextCheck(context, middleware, index) {
  const nextMiddleware = middleware[index];

  if(!nextMiddleware) return context.next;

  return (...paramenter) => {
    context.next(...paramenter);
    const nextMidd = nextCheck(context, middleware, index + 1);
    nextMiddleware({...context, next: nextMidd});
  }
}

router.beforeEach((to,from,next) => {
  if(to.meta.middleware) {
    const middleware = Array.isArray(to.meta.middleware) ? to.meta.middleware : [to.meta.middleware];
    const context = {
        from,
        next,
        router,
        to
    }
    const nextMiddleware = nextCheck(context, middleware, 1);
    return middleware[0]({...context, next:nextMiddleware});
  }
  return next();
});

export default router
