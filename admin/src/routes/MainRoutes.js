import { lazy } from 'react'

import MainLayout from 'layout/MainLayout'
import Loadable from 'ui-component/Loadable'

const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')))

const Companies = Loadable(lazy(() => import('views/company/List')))
const Company = Loadable(lazy(() => import('views/company/company')))

const Invoices = Loadable(lazy(() => import('views/invoices/List')))
const Invoice = Loadable(lazy(() => import('views/invoices/invoice')))

const ScometDocument = Loadable(lazy(() => import('views/templates/ScometDocument')))

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
      path: 'invoices/:id',
      element: <Invoice/>
    },
    {
      path: 'invoices',
      element: <Invoices/>
    },
    {
      path: 'company/:id',
      element: <Company/>
    },
    {
      path: 'company',
      element: <Companies/>
    },
    {
      path: 'scomet-document',
      element: <ScometDocument/>
    }
  ]
}

export default MainRoutes
