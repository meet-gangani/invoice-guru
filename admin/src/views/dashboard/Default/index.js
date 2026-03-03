/* eslint-disable */
import { useEffect, useState } from 'react'

// material-ui
import { Grid } from '@mui/material'

// project imports
import GamesCard from './GamesCard'
import CategoriesCard from './CategoriesCard'
import { gridSpacing } from 'store/constant'
import gameService from '../../../services/game.service'
import * as PropTypes from 'prop-types'

// ==============================|| DEFAULT DASHBOARD ||============================== //

const Dashboard = () => {
  const [ isLoading, setLoading ] = useState(true)
  const [ gamesCount, setGamesCount ] = useState(0)
  const [ categoriesCount, setCategoriesCount ] = useState(0)
  const [ websitesCount, setWebsitesCount ] = useState(0)

  useEffect(() => {
    setLoading(false)
    fetchCardsData()
  }, [])

  async function fetchCardsData() {
    try {
      const response = await gameService.dashboardCards()

      setGamesCount(response.gameCount)
      setCategoriesCount(response.categoryCount)
      setWebsitesCount(response.websiteCount)

    } catch (error) {
      console.log(error.message)
    }
  }

  return (
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <Grid container spacing={gridSpacing}>
            <Grid item lg={4} md={6} sm={6} xs={12}>
              <GamesCard isLoading={isLoading} count={gamesCount}/>
            </Grid>
            <Grid item lg={4} md={6} sm={6} xs={12}>
              <CategoriesCard isLoading={isLoading} count={categoriesCount}/>
            </Grid>
            {/*<Grid item lg={4} md={12} sm={12} xs={12}>*/}
            {/*  <Grid container spacing={gridSpacing}>*/}
            {/*    <Grid item sm={6} xs={12} md={6} lg={12}>*/}
            {/*      <TotalIncomeDarkCard isLoading={isLoading} />*/}
            {/*    </Grid>*/}
            {/*    <Grid item sm={6} xs={12} md={6} lg={12}>*/}
            {/*      <TotalIncomeLightCard isLoading={isLoading} />*/}
            {/*    </Grid>*/}
            {/*  </Grid>*/}
            {/*</Grid>*/}
          </Grid>
        </Grid>
        {/*<Grid item xs={12}>*/}
        {/*  <Grid container spacing={gridSpacing}>*/}
        {/*    <Grid item xs={12} md={8}>*/}
        {/*      <TotalGrowthBarChart isLoading={isLoading} />*/}
        {/*    </Grid>*/}
        {/*    <Grid item xs={12} md={4}>*/}
        {/*      <PopularCard isLoading={isLoading} />*/}
        {/*    </Grid>*/}
        {/*  </Grid>*/}
        {/*</Grid>*/}
      </Grid>
  )
}

export default Dashboard
