import * as React from 'react'
import { useEffect, useState } from 'react'
import MainCard from '../../ui-component/cards/MainCard'
import { FormControlLabel, Grid, Stack, Switch, TextField } from '@mui/material'
import PageService from '../../services/pages.service'

const AdsSetUp = () => {

  const [ adsSetup, setAdsSetup ] = useState({})

  useEffect(() => {
    fetchAdsSetup()
  }, [])

  async function fetchAdsSetup() {
    try {
      const response = await PageService.fetchPage('ads-setup')
      setAdsSetup(response?.details)
    } catch (error) {
      console.log(error.message)
    }
  }

  async function updateAdsSetup(details) {
    try {
      await PageService.updatePage('ads-setup', details)
      await fetchAdsSetup()
    } catch (error) {
      console.log(error.message)
    }
  }

  async function handleUpdateValue(setUpName, keyName, value){
    if (value === '' || value === null || value === undefined) {
      value = 0;
    }

    // If value is numeric string or number → clean leading zeros
    if (typeof value === 'string' || typeof value === 'number') {
      value = String(value).replace(/^0+(?=\d)/, ''); // remove leading zeros
      value = Number(value); // convert back to number
    }

    setAdsSetup(prev => ({ ...prev, [setUpName]: { ...prev?.[setUpName], [keyName]: value } }))
    updateAdsSetup({ ...adsSetup, [setUpName]: { ...adsSetup?.[setUpName], [keyName]: value}})
  }

  return (
      <MainCard title="Ads Setup">
        {/* Home Section */}
        <Stack
            spacing={2}
            sx={{
              border: '1px solid #ccc',
              padding: { xs: 2, sm: 3 },
              margin: { xs: 2, sm: 5 },
              fontSize: { xs: '16px', sm: '20px' },
              fontWeight: 600
            }}
        >
          {/* Home Page Row */}
          <Grid
              container
              alignItems="center"
              justifyContent="space-between"
              sx={{ borderBottom: '1px solid #ccc', pb: 1 }}
          >
            <Grid item>
              <h3>Home Page</h3>
            </Grid>
            <Grid item>
              <FormControlLabel
                  control={
                    <Switch
                        checked={adsSetup?.homePage?.showAds}
                        onChange={(e) => handleUpdateValue('homePage', 'showAds', Boolean(e.target.checked))}
                        color="primary"
                        sx={{ transform: 'scale(1.4)' }}
                    />
                  }
                  labelPlacement="start"
              />
            </Grid>
          </Grid>

          {/* Main Swiper & All Games */}
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" justifyContent="flex-start" gap="40%">
              <div>Main Swiper</div>
              <Switch
                  checked={adsSetup?.homePage?.mainSlider}
                  onChange={(e) => handleUpdateValue('homePage', 'mainSlider', Boolean(e.target.checked))}
                  color="primary"
                  sx={{ transform: 'scale(1.4)' }}
              />
            </Stack>

            <Stack direction="row" alignItems="center" justifyContent="flex-start" gap="42%">
              <div>All Games</div>
              <Switch
                  checked={adsSetup?.homePage?.allGames}
                  onChange={(e) => handleUpdateValue('homePage', 'allGames', Boolean(e.target.checked))}
                  color="primary"
                  sx={{ transform: 'scale(1.4)' }}
              />
            </Stack>
          </Stack>
          {/* Game Number Click Input */}
          <TextField
              sx={{
                width: { xs: '100%', sm: '60%' },
              }}
              variant="outlined"
              type="text"
              label="Game Icon Click"
              placeholder="Enter number"
              value={adsSetup?.homePage?.clickCount ?? 0}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) {
                  handleUpdateValue('homePage', 'clickCount', value);
                }
              }}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*',
              }}
          />

          <TextField
              sx={{
                width: { xs: '100%', sm: '60%' },
              }}
              variant="outlined"
              type="text"
              label="Ads Per Games"
              placeholder="Enter number"
              value={adsSetup?.homePage?.adsDistance ?? 0}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) {
                  handleUpdateValue('homePage', 'adsDistance', value);
                }
              }}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*',
              }}
          />
        </Stack>

        {/* Game Section */}
        <Stack
            spacing={2}
            sx={{
              border: '1px solid #ccc',
              padding: { xs: 2, sm: 3 },
              margin: { xs: 2, sm: 5 },
              fontSize: { xs: '16px', sm: '20px' },
              fontWeight: 600
            }}
        >
          <Grid container alignItems="center" justifyContent="space-between" sx={{ borderBottom: '1px solid #ccc', pb: 1 }}>
            <Grid item>
              <h3>Game Page</h3>
            </Grid>
            <Grid item>
              <Switch
                  checked={adsSetup?.gamePlayAdTime?.showAds}
                  onChange={(e) => handleUpdateValue('gamePlayAdTime', 'showAds', Boolean(e.target.checked))}
                  color="primary"
                  sx={{ transform: 'scale(1.4)' }}
              />
            </Grid>
          </Grid>

          <TextField
              sx={{
                width: { xs: '100%', sm: '60%' },
              }}
              variant="outlined"
              type="text"
              label="Game Play Interval Minutes"
              placeholder="Enter minutes"
              value={adsSetup?.gamePlayAdTime?.intervalTime ?? 0}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) {
                  handleUpdateValue('gamePlayAdTime', 'intervalTime', value);
                }
              }}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*',
              }}
          />
        </Stack>

        {/* Blog Section */}
        <Stack
            spacing={2}
            sx={{
              border: '1px solid #ccc',
              padding: { xs: 2, sm: 3 },
              margin: { xs: 2, sm: 5 },
              fontSize: { xs: '16px', sm: '20px' },
              fontWeight: 600
            }}
        >
          <Grid container alignItems="center" justifyContent="space-between" sx={{ borderBottom: '1px solid #ccc', pb: 1 }}>
            <Grid item>
              <h3>Blog Page</h3>
            </Grid>
            <Grid item>
              <Switch
                  checked={adsSetup?.blogPage?.showAds}
                  onChange={(e) => handleUpdateValue('blogPage', 'showAds', Boolean(e.target.checked))}
                  color="primary"
                  sx={{ transform: 'scale(1.4)' }}
              />
            </Grid>
          </Grid>

          <TextField
              sx={{
                width: { xs: '100%', sm: '60%' },
              }}
              variant="outlined"
              type="text"
              label="Blog Icon Click"
              placeholder="Enter number"
              value={adsSetup?.blogPage?.clickCount ?? 0}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) {
                  handleUpdateValue('blogPage', 'clickCount', value);
                }
              }}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*',
              }}
          />
        </Stack>
      </MainCard>
  )
}

export default AdsSetUp
