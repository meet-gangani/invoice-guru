import { lazy } from 'react'
import { Navigate } from 'react-router-dom'

import MainLayout from 'layout/MainLayout'
import Loadable from 'ui-component/Loadable'
import encryptStorage from 'services/storage'

const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')))

const Companies = Loadable(lazy(() => import('views/company/List')))
const Company = Loadable(lazy(() => import('views/company/company')))

const Invoices = Loadable(lazy(() => import('views/invoices/List')))
const Invoice = Loadable(lazy(() => import('views/invoices/invoice')))

const ScometDocument = Loadable(lazy(() => import('views/templates/ScometDocument')))
const PackingListDocument = Loadable(lazy(() => import('views/templates/PackingListDocument')))
const PerformaInvoiceDocument = Loadable(lazy(() => import('views/templates/PerformaInvoiceDocument')))
const PackagingDocument = Loadable(lazy(() => import('views/templates/PackagingDocument')))

const RequireAdmin = ({ children }) => {
  const token = encryptStorage.getItem('token')
  const role = encryptStorage.getItem('role')

  if (!token) return <Navigate to="/login" replace/>
  if (role !== 'admin') return <Navigate to="/dashboard" replace/>
  return children
}

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
      element: (
          <RequireAdmin>
            <Company/>
          </RequireAdmin>
      )
    },
    {
      path: 'company',
      element: (
          <RequireAdmin>
            <Companies/>
          </RequireAdmin>
      )
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
