import { lazy } from 'react'

import MainLayout from 'layout/MainLayout'
import Loadable from 'ui-component/Loadable'

const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')))

const Games = Loadable(lazy(() => import('views/games/List')))
const Game = Loadable(lazy(() => import('views/games/game')))

const Categories = Loadable(lazy(() => import('views/categories/List')))
const Category = Loadable(lazy(() => import('views/categories/category')))

const Blogs = Loadable(lazy(() => import('views/blogs/List')))
const Blog = Loadable(lazy(() => import('views/blogs/blog')))

const AdsSetup = Loadable(lazy(() => import('views/AdsSetUps/AdsSetup')))

const Privacy = Loadable(lazy(() => import('views/privacy/Privacy')))
const TermsAndCondition = Loadable(lazy(() => import('views/termsOfService/TermsOfService')))
const CookiePolicy = Loadable(lazy(() => import('views/cookiePolicy/CookiePolicy')))

const Feature = Loadable(lazy(() => import('views/feature/List')))
const Trending = Loadable(lazy(() => import('views/trending/List')))

const MainRoutes = {
  path: '/',
  element: <MainLayout/>,
  children: [
    {
      path: '/',
      element: <DashboardDefault/>
    },
    {
      path: 'dashboard',
      element: <DashboardDefault/>
    },
    {
      path: 'feature',
      element: <Feature/>
    },
    {
      path: 'trending',
      element: <Trending/>
    },
    {
      path: 'games/:id',
      element: <Game/>
    },
    {
      path: 'games',
      element: <Games/>
    },
    {
      path: 'categories/:id',
      element: <Category/>
    },
    {
      path: 'categories',
      element: <Categories/>
    },
    {
      path: 'blogs/:id',
      element: <Blog/>
    },
    {
      path: 'blogs',
      element: <Blogs/>
    },

    {
      path: 'ads-setup',
      element: <AdsSetup/>
    },
    {
      path: 'privacy',
      element: <Privacy/>
    },
    {
      path: 'terms-of-service',
      element: <TermsAndCondition/>
    },
    {
      path: 'cookie-policy',
      element: <CookiePolicy/>
    }
  ]
}

export default MainRoutes
