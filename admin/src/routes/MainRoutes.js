import { lazy } from 'react'

import MainLayout from 'layout/MainLayout'
import Loadable from 'ui-component/Loadable'

const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')))

const Companies = Loadable(lazy(() => import('views/company/List')))
const Company = Loadable(lazy(() => import('views/company/company')))

const Invoices = Loadable(lazy(() => import('views/invoices/List')))
const Invoice = Loadable(lazy(() => import('views/invoices/invoice')))

const ScometDocument = Loadable(lazy(() => import('views/templates/ScometDocument')))
const PackingListDocument = Loadable(lazy(() => import('views/templates/PackingListDocument')))
const PerformaInvoiceDocument = Loadable(lazy(() => import('views/templates/PerformaInvoiceDocument')))
const PackagingDocument = Loadable(lazy(() => import('views/templates/PackagingDocument')))

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
      path: 'scomet/:id',
      element: <ScometDocument/>
    },
    {
      path: 'scomet',
      element: <ScometDocument/>
    },
    {
      path: 'packing/:id',
      element: <PackingListDocument/>
    },
    {
      path: 'packing',
      element: <PackingListDocument/>
    },
    {
      path: 'performa/:id',
      element: <PerformaInvoiceDocument/>
    },
    {
      path: 'performa',
      element: <PerformaInvoiceDocument/>
    },
    {
      path: 'delivery/:id',
      element: <PackagingDocument/>
    },
    {
      path: 'delivery',
      element: <PackagingDocument/>
    }
  ]
}

export default MainRoutes
