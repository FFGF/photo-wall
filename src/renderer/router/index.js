import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'photo-wall',
      component: require('@/components/photoWall').default
    },
    {
      path: '*',
      redirect: '/'
    },
    {
      path: '/upload-img',
      name: 'uplaod-img',
      component: require('@/components/uploadImg').default
    },
    {
      path: '/show-img',
      name: 'show-img',
      component: require('@/components/showImg').default
    }
  ]
})
