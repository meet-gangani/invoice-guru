import { useEffect, useRef, useState } from 'react'

import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
// material-ui
import { useTheme } from '@mui/material/styles'
import { Avatar, Box, Chip, ClickAwayListener, Divider, List, ListItemButton, ListItemIcon, ListItemText, Paper, Popper, Stack, Typography } from '@mui/material'


// project imports
import MainCard from 'ui-component/cards/MainCard'
import Transitions from 'ui-component/extended/Transitions'
import UserService from '../../../../services/user.service'

// assets
import { IconLogout, IconPassword, IconSettings } from '@tabler/icons'
import SiteLogo from '../../../../assets/images/logo-square.png'
import encryptStorage from 'services/storage'

// ==============================|| PROFILE MENU ||============================== //

const ProfileSection = () => {
  const theme = useTheme()
  const customization = useSelector((state) => state.customization)
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)

  const role = encryptStorage.getItem('role')
  const isAdmin = role === 'admin'

  /**
   * anchorRef is used on different componets and specifying one type leads to other pages throwing an error
   * */
  const anchorRef = useRef(null)
  const handleLogout = async () => {
    await UserService.logout()
    return navigate('/login')
  }

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return
    }
    setOpen(false)
  }

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen)
  }

  const prevOpen = useRef(open)
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus()
    }

    prevOpen.current = open
  }, [open])

  const getGreeting = () => {
    const hour = new Date().getHours();

    let greeting = "";

    if (hour === 0) greeting = "Midnight";
    else if (hour < 12) greeting = "Morning";
    else if (hour === 12) greeting = "Noon";
    else if (hour < 18) greeting = "Afternoon";
    else greeting = "Evening";

    return `Good ${greeting} Sir`;
  };

  return (
    <>
      <Chip
        sx={{
          height: '48px',
          alignItems: 'center',
          borderRadius: '27px',
          transition: 'all .2s ease-in-out',
          borderColor: theme.palette.primary.light,
          backgroundColor: theme.palette.primary.light,
          '&[aria-controls="menu-list-grow"], &:hover': {
            borderColor: theme.palette.primary.main,
            background: `${theme.palette.primary.main}!important`,
            color: theme.palette.primary.light,
            '& svg': {
              stroke: theme.palette.primary.light
            }
          },
          '& .MuiChip-label': {
            lineHeight: 0
          }
        }}
        icon={
          <Avatar
            src={SiteLogo}
            sx={{
              ...theme.typography.mediumAvatar,
              margin: '8px 0 8px 8px !important',
              cursor: 'pointer'

            }}
            width={140} height={40}
            ref={anchorRef}
            aria-controls={open ? 'menu-list-grow' : undefined}
            aria-haspopup="true"
            color="inherit"
          />
        }
        label={<IconSettings stroke={1.5} size="1.5rem" color={theme.palette.primary.main} />}
        variant="outlined"
        ref={anchorRef}
        aria-controls={open ? 'menu-list-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        color="primary"
      />
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 14]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions in={open} {...TransitionProps}>
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]}>
                  <Box sx={{ p: 2, pb: 0 }}>
                    <Stack direction="row" alignItems="center">
                      <Typography variant="h4">
                        {getGreeting()}
                      </Typography>
                    </Stack>
                  </Box>
                  <Box sx={{ p: 2, maxHeight: 'calc(100vh - 150px)', overflowY: 'auto', overflowX: 'hidden' }}>
                    <Divider />
                    <List
                      component="nav"
                      sx={{
                        width: '100%',
                        maxWidth: 350,
                        minWidth: 300,
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: '10px',
                        [theme.breakpoints.down('md')]: {
                          minWidth: '100%'
                        },
                        '& .MuiListItemButton-root': {
                          mt: 0.5
                        }
                      }}
                    >
                      {isAdmin && (
                        <ListItemButton
                          sx={{ borderRadius: `${customization.borderRadius}px` }}
                          onClick={() => navigate('/change-password')}
                        >
                          <ListItemIcon>
                            <IconPassword stroke={1.5} size="1.3rem" />
                          </ListItemIcon>
                          <ListItemText primary={<Typography variant="body2">Change Password</Typography>} />
                        </ListItemButton>
                      )}
                      <ListItemButton
                        sx={{ borderRadius: `${customization.borderRadius}px` }}
                        onClick={handleLogout}
                      >
                        <ListItemIcon>
                          <IconLogout stroke={1.5} size="1.3rem" />
                        </ListItemIcon>
                        <ListItemText primary={<Typography variant="body2">Logout</Typography>} />
                      </ListItemButton>
                    </List>
                  </Box>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </>
  )
}

export default ProfileSection
