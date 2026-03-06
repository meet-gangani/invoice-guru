import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useTheme } from '@mui/material/styles'
import { Box, Button, FormControl, Grid, IconButton, InputAdornment, InputLabel, OutlinedInput, Stack, Typography, useMediaQuery } from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import Logo from '../../../../ui-component/Logo'
import UserService from '../../../../services/user.service'
import { useNavigate } from 'react-router-dom'
import AuthWrapper1 from '../AuthWrapper'
import AuthCardWrapper from '../AuthCardWrapper'
import AnimateButton from 'ui-component/extended/AnimateButton'

const ChangePassword = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'))
  const customization = useSelector((state) => state.customization)

  const [ showPassword, setShowPassword ] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  })

  const [ passwords, setPasswords ] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  async function changeUserPassword() {
    try {
      if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
        return alert('Enter passwords filed!')
      }

      if (passwords.newPassword !== passwords.confirmPassword) {
        return alert('New password and Confirm password not match!')
      }

      if (passwords.currentPassword === passwords.newPassword) {
        return alert('New password cannot be same as current password!')
      }

      const response = await UserService.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword })
      // alert('Password has been updated!')
      if (response) {
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
        await navigate('/dashboard')
      } else {
        await navigate('/login')
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  return (
      <AuthWrapper1>
        <Grid container direction="column" justifyContent="flex-end" sx={{ minHeight: '100vh' }}>
          <Grid item xs={12}>
            <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: 'calc(100vh - 68px)' }}>
              <Grid item sx={{ m: { xs: 1, sm: 3 }, mb: 0 }}>
                <AuthCardWrapper>
                  <Grid container spacing={2} alignItems="center" justifyContent="center">
                    <Grid item sx={{ mb: 3 }}>
                      <Logo/>
                    </Grid>
                    <Grid item xs={12}>
                      <Grid container direction={matchDownSM ? 'column-reverse' : 'row'} alignItems="center" justifyContent="center">
                        <Grid item>
                          <Stack alignItems="center" justifyContent="center" spacing={1}>
                            <Typography color={theme.palette.secondary.main} gutterBottom variant={matchDownSM ? 'h3' : 'h2'}>
                              Change Your Password
                            </Typography>
                            <Typography variant="caption" fontSize="16px" textAlign={matchDownSM ? 'center' : 'inherit'}>
                              Enter your current and new password
                            </Typography>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <FormControl fullWidth sx={{ ...theme.typography.customInput }}>
                          <InputLabel htmlFor="outlined-adornment-current-password">Current Password</InputLabel>
                          <OutlinedInput
                              id="outlined-adornment-current-password"
                              type={showPassword.currentPassword ? 'text' : 'password'}
                              value={passwords.currentPassword}
                              name="currentPassword"
                              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                              endAdornment={
                                <InputAdornment position="end">
                                  <IconButton
                                      aria-label="toggle current password visibility"
                                      onClick={() => setShowPassword((prevState) => ({
                                        ...prevState,
                                        currentPassword: !prevState.currentPassword
                                      }))}
                                      edge="end"
                                      size="large"
                                  >
                                    {showPassword.currentPassword ? <Visibility/> : <VisibilityOff/>}
                                  </IconButton>
                                </InputAdornment>
                              }
                              label="Current Password"
                              inputProps={{}}
                          />
                        </FormControl>
                        <FormControl fullWidth sx={{ ...theme.typography.customInput }}>
                          <InputLabel htmlFor="outlined-adornment-new-password">New Password</InputLabel>
                          <OutlinedInput
                              id="outlined-adornment-new-password"
                              type={showPassword.newPassword ? 'text' : 'password'}
                              value={passwords.newPassword}
                              name="newPassword"
                              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                              endAdornment={
                                <InputAdornment position="end">
                                  <IconButton
                                      aria-label="toggle new password visibility"
                                      onClick={() => setShowPassword((prevState) => ({
                                        ...prevState,
                                        newPassword: !prevState.newPassword
                                      }))}
                                      edge="end"
                                      size="large"
                                  >
                                    {showPassword.newPassword ? <Visibility/> : <VisibilityOff/>}
                                  </IconButton>
                                </InputAdornment>
                              }
                              label="New Password"
                              inputProps={{}}
                          />
                        </FormControl>
                        <FormControl fullWidth sx={{ ...theme.typography.customInput }}>
                          <InputLabel htmlFor="outlined-adornment-confirm-password">Confirm Password</InputLabel>
                          <OutlinedInput
                              id="outlined-adornment-confirm-password"
                              type={showPassword.confirmPassword ? 'text' : 'password'}
                              value={passwords.confirmPassword}
                              name="confirmPassword"
                              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                              endAdornment={
                                <InputAdornment position="end">
                                  <IconButton
                                      aria-label="toggle confirm password visibility"
                                      onClick={() => setShowPassword((prevState) => ({
                                        ...prevState,
                                        confirmPassword: !prevState.confirmPassword
                                      }))}
                                      edge="end"
                                      size="large"
                                  >
                                    {showPassword.confirmPassword ? <Visibility/> : <VisibilityOff/>}
                                  </IconButton>
                                </InputAdornment>
                              }
                              label="Confirm Password"
                              inputProps={{}}
                          />
                        </FormControl>
                        <Box sx={{ mt: 1 }}>
                          <AnimateButton>
                            <Button
                                disableElevation
                                fullWidth
                                size="large"
                                variant="contained"
                                color="secondary"
                                sx={{ borderRadius: `${customization.borderRadius}px` }}
                                onClick={changeUserPassword}
                            >
                              Change Password
                            </Button>
                          </AnimateButton>
                        </Box>
                        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
                          <Button
                              variant="text"
                              color="secondary"
                              size="small"
                              onClick={() => navigate('/dashboard')}
                              sx={{ textTransform: 'none' }}
                          >
                            Back to Dashboard
                          </Button>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </AuthCardWrapper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </AuthWrapper1>
  )
}

export default ChangePassword
