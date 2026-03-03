import PropTypes from 'prop-types'

// material-ui
import { styled, useTheme } from '@mui/material/styles'
import { Avatar, Box, Grid, Typography } from '@mui/material'

// project imports
import MainCard from 'ui-component/cards/MainCard'
import SkeletonGamesCard from 'ui-component/cards/Skeleton/GamesCard'

// assets
import { IconTags } from '@tabler/icons'
import { useNavigate } from 'react-router'

const CardWrapper = styled(MainCard)(({ theme }) => ({
  backgroundColor: theme.palette.primary.dark,
  color: '#fff',
  overflow: 'hidden',
  position: 'relative',
  '&>div': {
    position: 'relative',
    zIndex: 5
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    width: 210,
    height: 210,
    background: theme.palette.primary[800],
    borderRadius: '50%',
    zIndex: 1,
    top: -85,
    right: -95,
    [theme.breakpoints.down('sm')]: {
      top: -105,
      right: -140
    }
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    zIndex: 1,
    width: 210,
    height: 210,
    background: theme.palette.primary[800],
    borderRadius: '50%',
    top: -125,
    right: -15,
    opacity: 0.5,
    [theme.breakpoints.down('sm')]: {
      top: -155,
      right: -70
    }
  }
}))

// ==============================|| DASHBOARD - TOTAL ORDER LINE CHART CARD ||============================== //

const CategoriesCard = ({ isLoading, count }) => {
  const theme = useTheme()
  const navigate = useNavigate();

  return (
    <>
      {isLoading ? (
        <SkeletonGamesCard />
      ) : (
        <CardWrapper border={false} content={false}>
          <Box sx={{ p: 2.25, cursor: 'pointer' }} onClick={() => navigate('/categories')}>
            <Grid container direction="column">
              <Grid item>
                <Grid container justifyContent="space-between">
                  <Grid item>
                    <Avatar
                      variant="rounded"
                      sx={{
                        ...theme.typography.commonAvatar,
                        ...theme.typography.largeAvatar,
                        backgroundColor: theme.palette.primary[800],
                        color: '#fff',
                        mt: 1
                      }}
                    >
                      <IconTags fontSize="inherit" />
                    </Avatar>
                  </Grid>

                </Grid>
              </Grid>
              <Grid item>
                <Grid container alignItems="center">
                  <Grid item>
                    <Typography sx={{ fontSize: '2.125rem', fontWeight: 500, mr: 1, mt: 1.75, mb: 0.75 }}>
                      {count}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item sx={{ mb: 1.25 }}>
                <Typography
                  sx={{
                    fontSize: '1rem',
                    fontWeight: 500,
                    color: theme.palette.primary[200]
                  }}
                >
                  Total Invoice
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </CardWrapper>
      )}
    </>
  )
}

CategoriesCard.propTypes = {
  isLoading: PropTypes.bool
}

export default CategoriesCard
