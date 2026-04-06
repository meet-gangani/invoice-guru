import { IconBuilding, IconBuildingBank, IconChecklist, IconDashboard, IconFileInvoice, IconHomeCog, IconNotes, IconPackages, IconTemplate, IconUsers } from '@tabler/icons'

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
    }
  ]
}

const pages = {
  id: 'pages',
  title: 'Pages',
  caption: 'Browse Pages',
  type: 'group',
  children: [
    {
      id: 'performa',
      title: 'Performa',
      type: 'item',
      url: '/performa',
      icon: IconBuildingBank,
      breadcrumbs: false
    },
    {
      id: 'delivery',
      title: 'Commercial',
      type: 'item',
      url: '/delivery',
      icon: IconFileInvoice,
      breadcrumbs: false
    },
    {
      id: 'packaging',
      title: 'Packaging',
      type: 'item',
      url: '/packing',
      icon: IconPackages,
      breadcrumbs: false
    },
    {
      id: 'scomet',
      title: 'Scomet Declaration',
      type: 'item',
      url: '/scomet',
      icon: IconTemplate,
      breadcrumbs: false
    },
    {
      id: 'evd',
      title: 'EVD',
      type: 'item',
      url: '/evd',
      icon: IconChecklist,
      breadcrumbs: false
    },
    {
      id: 'letter-head',
      title: 'Letter Head',
      type: 'item',
      url: '/letter-head',
      icon: IconNotes,
      breadcrumbs: false
    }
  ]
}

const Website = {
  id: 'website',
  type: 'group',
  children: [
    {
      id: 'customers',
      title: 'Customer Master',
      type: 'item',
      url: '/customers',
      icon: IconUsers,
      breadcrumbs: false

    },
    {
      id: 'company-master',
      title: 'Company Master',
      type: 'item',
      url: '/company-master',
      icon: IconBuilding,
      breadcrumbs: false,
      adminOnly: false
    }
  ]
}

const Setup = {
  id: 'website',
  type: 'group',
  children: [
    {
      id: 'company-setup',
      title: 'Company Setup',
      type: 'item',
      url: '/company-setup',
      icon: IconHomeCog,
      breadcrumbs: false,
      adminOnly: true
    }
  ]
}

const menuItems = {
  items: [
    QuickView,
    pages,
    Website,
    Setup
  ]
}

export default menuItems
