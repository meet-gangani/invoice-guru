// material-ui
import { Typography } from '@mui/material'

// project imports
import NavGroup from './NavGroup'
import menuItem from 'menu-items'
import encryptStorage from 'services/storage'

// ==============================|| SIDEBAR MENU LIST ||============================== //

const MenuList = () => {
  const role = encryptStorage.getItem('role')
  console.log("role", role);
  const isAdmin = role === 'admin'

  const navItems = menuItem.items.map((item) => {
    switch (item.type) {
      case 'group':
        if (!item.children) return null
        const filteredChildren = item.children.filter((child) => !child.adminOnly || isAdmin)
        if (filteredChildren.length === 0) return null
        return <NavGroup key={item.id} item={{ ...item, children: filteredChildren }}/>
      default:
        return (
            <Typography key={item.id} variant="h6" color="error" align="center">
              Menu Items Error
            </Typography>
        )
    }
  })

  return <>{navItems}</>
}

export default MenuList
