/* eslint-disable */
import { useEffect, useState } from 'react'

// material-ui
import { Grid } from '@mui/material'

// project imports
import { gridSpacing } from 'store/constant'
import APIService from '../../../services/endpoint.service'
import PrimaryCard from './PrimaryCard'
import SecondaryCard from './SecondaryCard'

// ==============================|| DEFAULT DASHBOARD ||============================== //

const Dashboard = () => {
  const [ isLoading, setLoading ] = useState(true)
  const [ data, setData ] = useState({})

  useEffect(() => {
    setLoading(false)
    fetchCardsData()
  }, [])

  async function fetchCardsData() {
    try {
      const response = await APIService.dashboardCards()
      setData(response)
    } catch (error) {
      console.log(error.message)
    }
  }

  return (
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <Grid container spacing={gridSpacing}>
            <Grid item lg={4} md={6} sm={6} xs={12}>
              <PrimaryCard isLoading={isLoading} count={data?.todayInvoice}/>
            </Grid>
            <Grid item lg={4} md={6} sm={6} xs={12}>
              <SecondaryCard isLoading={isLoading} count={data?.totalInvoice}/>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
  )
}

export default Dashboard
