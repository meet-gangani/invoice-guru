import { Stack } from '@mui/material'
import SiteLogo from '../assets/images/logo.png'

const Logo = () => {
  return (
      <Stack direction="row" alignItems="center" justifyContent="center">
        <img src={SiteLogo} width={140} height={40} alt={'SiteLogo'}/>
      </Stack>
  )
}

export default Logo
