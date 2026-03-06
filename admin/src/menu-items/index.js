import { IconFileInvoice, IconDashboard, IconTemplate, IconBuilding, IconTruckDelivery, IconBuildingStore, IconPackages, IconChecklist, IconBuildingBank } from '@tabler/icons'

const QuickView = {
  id: 'quickView',
  title: 'Quick View',
  caption: 'Concise Overview',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard',
      icon: IconDashboard,
      breadcrumbs: false
    },
    {
      id: 'invoice',
      title: 'Invoices',
      type: 'item',
      url: '/invoices',
      icon: IconFileInvoice,
      breadcrumbs: false
    },
  ]
}

const pages = {
  id: 'pages',
  title: 'Pages',
  caption: 'Browse Pages',
  type: 'group',
  children: [
    {
      id: 'packaging',
      title: 'Packaging',
      type: 'item',
      url: '/packing',
      icon: IconPackages,
      breadcrumbs: false
    },
    {
      id: 'delivery',
      title: 'Delivery',
      type: 'item',
      url: '/delivery',
      icon: IconFileInvoice,
      breadcrumbs: false
    },
    {
      id: 'performa',
      title: 'Performa',
      type: 'item',
      url: '/performa',
      icon: IconBuildingBank,
      breadcrumbs: false
    },
    {
      id: 'scomet',
      title: 'Scomet Declaration',
      type: 'item',
      url: '/scomet',
      icon: IconTemplate,
      // icon: IconChecklist,
      breadcrumbs: false
    }
  ]
}

const Website = {
  id: 'website',
  type: 'group',
  children: [
    {
      id: 'company',
      title: 'Company',
      type: 'item',
      url: '/company',
      icon: IconBuilding,
      breadcrumbs: false,
      adminOnly: true
    }
  ]
}

const menuItems = {
  items: [
    QuickView,
    pages,
    Website
  ]
}

export default menuItems
