import React, { useState } from 'react'
import { Box, Button, FormControl, Grid, IconButton, InputAdornment, InputLabel, OutlinedInput, Typography } from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import Logo from '../../../../ui-component/Logo'
import UserService from '../../../../services/user.service'
import { useNavigate } from 'react-router-dom'

const ChangePassword = () => {
  const navigate = useNavigate()

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
      <>
        <Box
            sx={{
              backgroundColor: '#eef2f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100vh',
              width: '100vw',
              padding: '20px',
              boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.1)'
            }}>
          <Grid container direction="column" justifyContent="center" spacing={2}>
            <Grid item xs={12}>
              <Box
                  sx={{
                    borderRadius: '20px',
                    padding: 4,
                    marginX: 'auto',
                    backgroundColor: '#fff',
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    width: '30%'
                  }}
              >
                <Logo/>
                <Typography sx={{ color: '#F7BE15', fontSize: 24, fontWeight: 800, marginY: '24px' }}>
                  Change Your Password
                </Typography>
                <Box sx={{ display: 'flex', width: '100%', flexDirection: 'column', gap: 2, marginBottom: 2 }}>
                  <FormControl>
                    <InputLabel htmlFor="outlined-adornment-email-login">Current Password</InputLabel>
                    <OutlinedInput
                        id="outlined-adornment-email-login"
                        type={showPassword.currentPassword ? 'text' : 'password'}
                        value={passwords.currentPassword}
                        name="email"
                        onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => setShowPassword((prevState) => ({
                                  ...prevState,
                                  currentPassword: !prevState.currentPassword
                                }))}
                                edge="end"
                                size="large"
                            >
                              {showPassword ? <Visibility/> : <VisibilityOff/>}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="Password"
                        inputProps={{}}
                    />
                  </FormControl>
                  <FormControl>
                    <InputLabel htmlFor="outlined-adornment-email-login">New Password</InputLabel>
                    <OutlinedInput
                        id="outlined-adornment-email-login"
                        type={showPassword.newPassword ? 'text' : 'password'}
                        value={passwords.newPassword}
                        name="email"
                        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => setShowPassword((prevState) => ({
                                  ...showPassword,
                                  newPassword: !prevState.newPassword
                                }))}
                                edge="end"
                                size="large"
                            >
                              {showPassword ? <Visibility/> : <VisibilityOff/>}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="Password"
                        inputProps={{}}
                    />
                  </FormControl>
                  <FormControl>
                    <InputLabel htmlFor="outlined-adornment-email-login">Confirm Password</InputLabel>
                    <OutlinedInput
                        id="outlined-adornment-email-login"
                        type={showPassword.confirmPassword ? 'text' : 'password'}
                        value={passwords.confirmPassword}
                        name="password"
                        onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => setShowPassword((prevState) => ({
                                  ...showPassword,
                                  confirmPassword: !prevState.confirmPassword
                                }))}
                                edge="end"
                                size="large"
                            >
                              {showPassword ? <Visibility/> : <VisibilityOff/>}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="Password"
                        inputProps={{}}
                    />
                  </FormControl>
                  <Button
                      sx={{
                        backgroundColor: '#F7BE15',
                        borderRadius: 3,
                        paddingY: 1,
                        color: 'white',
                        '&:hover': {
                          backgroundColor: '#eab50d',
                          color: 'gray.300'
                        }
                      }}
                      onClick={changeUserPassword}
                  >Change Password</Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </>
  )
}

export default ChangePassword
