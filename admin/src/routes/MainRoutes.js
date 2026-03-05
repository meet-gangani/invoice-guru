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
const ExportCommercialInvoiceDocument = Loadable(lazy(() => import('views/templates/ExportCommercialInvoiceDocument')))

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
      path: 'scomet-document/:id',
      element: <ScometDocument/>
    },
    {
      path: 'scomet-document',
      element: <ScometDocument/>
    },
    {
      path: 'packaging/:id',
      element: <PackingListDocument/>
    },
    {
      path: 'packaging',
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
      element: <ExportCommercialInvoiceDocument/>
    },
    {
      path: 'delivery',
      element: <ExportCommercialInvoiceDocument/>
    }
  ]
}

export default MainRoutes
