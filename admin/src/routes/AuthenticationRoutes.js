import { lazy } from 'react'

import Loadable from 'ui-component/Loadable'
import MinimalLayout from 'layout/MinimalLayout'

const AuthLogin = Loadable(lazy(() => import('views/pages/authentication/auth/Login')))
const AuthRegister = Loadable(lazy(() => import('views/pages/authentication/auth/Register')))
const ChangePassword = Loadable(lazy(() => import('views/pages/authentication/auth/ChangePassword')))
const NotFound = Loadable(lazy(() => import('views/utilities/404')))

const AuthenticationRoutes = {
  path: '/',
  element: <MinimalLayout/>,
  children: [
    {
      path: '/login',
      element: <AuthLogin/>
    },
    {
      path: '/change-password',
      element: <ChangePassword/>
    },
    {
      path: '/register',
      element: <AuthRegister/>
    },
    {
      path: '*',
      element: <NotFound/>
    }
  ]
}

export default AuthenticationRoutes
