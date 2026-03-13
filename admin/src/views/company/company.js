import React, { useEffect, useState } from 'react'
import MainCard from 'ui-component/cards/MainCard'
import { useNavigate, useParams } from 'react-router'

import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'

import { STATUS } from '../../utils/enum'
import { Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Fab, FormControl, Grid, IconButton, InputLabel, MenuItem, OutlinedInput, Select, Stack, TextField, Tooltip, Typography, Avatar, Paper, Alert, AlertTitle, Snackbar } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import { IconBrandGooglePlay, IconDeviceDesktop, IconDeviceMobile, IconEdit, IconTrash, IconUpload, IconX } from '@tabler/icons'
import Logo from '../../assets/images/logo.png'
import EndpointService from '../../services/endpoint.service'
import { LoadingButton } from '@mui/lab'

const Company = () => {
  const params = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [uploadZipLoading, setUploadZipLoading] = useState(false)
  const [uploadThumbnailLoading, setUploadThumbnailLoading] = useState(false)
  const [uploadStampLoading, setUploadStampLoading] = useState(false)
  const [uploadSignLoading, setUploadSignLoading] = useState(false)
  const [game, setGame] = useState({
    gameName: '',
    description: '',
    thumbnail: '',
    rating: '',
    developer: '',
    technology: '',
    platform: '',
    shortDescription: '',
    owner: '',
    contactPerson: '',
    contactNumber: '',
    address: '',
    pinCode: '',
    stamp: '',
    sign: '',
    categories: [],
    url: '',
    isSupportMobile: false,
    isSupportDesktop: false
  })
  const [categories, setCategories] = useState([])
  const [isUpdateMode, setIsUpdateMode] = useState(false)
  const [showModel, setShowModel] = useState(false)
  const [inputDelete, setInputDelete] = useState('')
  const [enableDelete, setEnableDelete] = useState(true)
  const [mobileSupport, setMobileSupport] = useState()
  const [desktopSupport, setDesktopSupport] = useState()
  const [newThumbnail, setNewThumbnail] = useState('')
  const [zipUploaded, setZipUploaded] = useState(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })
  const id = params.id


  useEffect(() => {
    fetchGames(id)
    fetchCategories()
  }, [id])

  async function fetchGames(gameId) {
    try {
      setLoading(true)

      const response = await EndpointService.getGame(gameId)
      setGame(response?.game)
      setMobileSupport(response.game.isSupportMobile)
      setDesktopSupport(response.game.isSupportDesktop)
    } catch (error) {
      console.log(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function fetchCategories() {
    try {
      const response = await EndpointService.getActiveCategoryList()
      setCategories(response.categories)
    } catch (error) {
      console.log(error)
    }
  }

  async function updateGame(gameId, game) {
    try {
      setLoading(true)
      const categories = game.categories.map((category) => category._id)

      const updateGame = await EndpointService.updateGame(gameId, {
        ...game,
        categories,
        isSupportMobile: mobileSupport,
        isSupportDesktop: desktopSupport
      })
      setNewThumbnail('')
      await navigate(`/games/${updateGame?.slug}`)
    } catch (error) {
      console.log(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function updateGameThumbnail(file) {
    try {
      setUploadThumbnailLoading(true)
      const res = await EndpointService.uploadGameThumbnailMedia(file, game?._id)
      await setNewThumbnail(res.url)
      setSnackbar({
        open: true,
        message: 'Company Thumbnail updated successfully!',
        severity: 'success'
      })
      setGame({ ...game, thumbnail: res.url })
    } catch (e) {
      console.log('🚀🚀🚀 updateGameThumbnail => eMessage :: ', e.message)
      setSnackbar({
        open: true,
        message: `Update failed: ${e.message}`,
        severity: 'error'
      })
    } finally {
      setUploadThumbnailLoading(false)
    }
  }

  async function deleteGame(gameId) {
    try {
      await EndpointService.deleteGame(gameId)
      navigate('/games')
    } catch (error) {
      console.log(error)
    }
  }

  function handleInputChange(e) {
    setInputDelete(e.target.value)
    setEnableDelete(e.target.value !== `game/${game.gameName}`)
  }

  async function handleFileUpload(files) {
    try {
      setUploadZipLoading(true)
      const response = await EndpointService.uploadGameZip(files, game?._id)
      setGame({ ...game, url: response.gameUrl })
      setZipUploaded(true)

      setSnackbar({
        open: true,
        message: 'Company ZIP uploaded successfully!',
        severity: 'success'
      })
    } catch (error) {
      console.log('🚀🚀🚀 handleFileUpload =>  :: ', error.message)
      setSnackbar({
        open: true,
        message: `Upload failed: ${error.message}`,
        severity: 'error'
      })
    } finally {
      setUploadZipLoading(false)
    }
  }

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })

  const uploadCompanyImage = async (field, file) => {
    if (!file) return

    const setLoading = field === 'stamp' ? setUploadStampLoading : setUploadSignLoading

    try {
      setLoading(true)
      const dataUrl = await readFileAsDataUrl(file)
      if (typeof dataUrl === 'string') {
        setGame((prev) => ({ ...prev, [field]: dataUrl }))
        setSnackbar({
          open: true,
          message: `${field === 'stamp' ? 'Stamp' : 'Sign'} selected successfully!`,
          severity: 'success'
        })
      }
    } catch (error) {
      console.log(error.message)
      setSnackbar({
        open: true,
        message: `Upload failed: ${error.message}`,
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClearImage = (field) => {
    setGame((prev) => ({ ...prev, [field]: '' }))
  }

  // Add this snackbar handling function
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return
    setSnackbar({ ...snackbar, open: false })
  }

  return (
    <MainCard title={game?.gameName}>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
          <CircularProgress color="primary" />
          <Typography variant="body2" ml={2}>Loading game details...</Typography>
        </Box>
      ) : (
        <>
          {/* Action buttons - moved to better position */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end">
                {/* <Typography variant="h5" component="h2" gutterBottom>
                  {game?.gameName}
                </Typography> */}
                <Box sx={{ display: 'flex', gap: '10px' }}>
                  <Tooltip title={isUpdateMode ? "Cancel Editing" : "Edit Company"}>
                    <Fab
                      size="small"
                      sx={{
                        color: 'rgb(103, 58, 183)',
                        backgroundColor: 'white',
                        boxShadow: '0 4px 8px rgba(103, 58, 183, 0.2)',
                        border: '1px solid rgb(103, 58, 183)',
                        transition: 'all 0.3s'
                      }}
                      onClick={() => setIsUpdateMode((prevState) => !prevState)}
                    >
                      <IconEdit stroke={1.5} size="1.3rem" />
                    </Fab>
                  </Tooltip>

                  <Tooltip title="Delete Company">
                    <Fab
                      size="small"
                      sx={{
                        color: 'rgb(211, 47, 47)',
                        backgroundColor: 'white',
                        boxShadow: '0 4px 8px rgba(211, 47, 47, 0.2)',
                        border: '1px solid rgb(211, 47, 47)',
                        transition: 'all 0.3s'
                      }}
                      onClick={() => setShowModel(true)}
                    >
                      <IconTrash stroke={1.5} size="1.3rem" />
                    </Fab>
                  </Tooltip>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Improved Dialog */}
          <Dialog
            open={showModel}
            onClose={() => setShowModel(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{
              fontSize: '20px',
              fontWeight: '600',
              pt: 3
            }}>
              Delete Company/{game?.gameName}
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ py: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: '16px',
                  mb: 3
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: 'rgba(103, 58, 183, 0.1)',
                    width: 64,
                    height: 64
                  }}
                >
                  <IconBrandGooglePlay
                    stroke={1.5}
                    size="2.5rem"
                    color="rgb(103, 58, 183)"
                  />
                </Avatar>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: '500',
                    color: 'rgb(54, 37, 82)'
                  }}
                >
                  Company/{game?.gameName}
                </Typography>
              </Box>

              <Typography
                variant="body1"
                sx={{ fontWeight: '500', mb: 2 }}
              >
                To confirm, type &quot;game/{game?.gameName}&quot; in the box below:
              </Typography>
              <TextField
                fullWidth
                required
                variant="outlined"
                type="text"
                value={inputDelete}
                onChange={handleInputChange}
                placeholder={`game/${game?.gameName}`}
              />
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 1 }}>
              <Button
                variant="outlined"
                onClick={() => setShowModel(false)}
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                disabled={enableDelete}
                onClick={() => deleteGame(game?._id)}
                startIcon={<IconTrash size="1rem" />}
              >
                Delete Company
              </Button>
            </DialogActions>
          </Dialog>

          {/* Form with improved layout */}
          <Box
            noValidate
            autoComplete="off"
            component="form"
            sx={{ '& .MuiTextField-root': { my: 1.5, width: '100%' } }}
          >
            <Paper sx={{ p: 2, mb: 3, borderColor: "#eee" }} elevation={0} variant="outlined">
              <Typography variant="subtitle1" fontWeight="500" gutterBottom>
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    disabled={!isUpdateMode}
                    variant="outlined"
                    type="text"
                    label="Company Name"
                    placeholder="Company Name"
                    value={game?.gameName}
                    onChange={(e) =>
                      setGame({
                        ...game,
                        gameName: e.target.value
                      })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth sx={{ my: 1.5 }}>
                    <InputLabel id="status-select-label">
                      Status
                    </InputLabel>
                    <Select
                      required
                      disabled={!isUpdateMode}
                      variant="outlined"
                      type="text"
                      label="Status"
                      labelId="status-select-label"
                      name="status"
                      value={game?.status || STATUS?.value}
                      onChange={(e) =>
                        setGame({ ...game, status: e.target.value })
                      }
                    >
                      {STATUS.map((status) => (
                        <MenuItem key={status?.value} value={status?.value}>
                          {status?.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    disabled={!isUpdateMode}
                    variant="outlined"
                    type="text"
                    label="Short Description"
                    placeholder="Short Description"
                    multiline
                    rows={2}
                    value={game?.shortDescription}
                    onChange={(e) =>
                      setGame({ ...game, shortDescription: e.target.value })
                    }
                  />
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 2, mb: 3, borderColor: "#eee" }} elevation={0} variant="outlined">
              <Typography variant="subtitle1" fontWeight="500" gutterBottom>
                Owner & Contact (Optional)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    disabled={!isUpdateMode}
                    variant="outlined"
                    type="text"
                    label="Owner"
                    placeholder="Owner"
                    value={game?.owner || ''}
                    onChange={(e) =>
                      setGame({ ...game, owner: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    disabled={!isUpdateMode}
                    variant="outlined"
                    type="text"
                    label="Contact Person"
                    placeholder="Contact Person"
                    value={game?.contactPerson || ''}
                    onChange={(e) =>
                      setGame({ ...game, contactPerson: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    disabled={!isUpdateMode}
                    variant="outlined"
                    type="tel"
                    label="Contact Number"
                    placeholder="Contact Number"
                    value={game?.contactNumber || ''}
                    onChange={(e) =>
                      setGame({ ...game, contactNumber: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    disabled={!isUpdateMode}
                    variant="outlined"
                    type="text"
                    label="Pin Code"
                    placeholder="Pin Code"
                    value={game?.pinCode || ''}
                    onChange={(e) =>
                      setGame({ ...game, pinCode: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    disabled={!isUpdateMode}
                    variant="outlined"
                    type="text"
                    label="Address"
                    placeholder="Address"
                    multiline
                    rows={2}
                    value={game?.address || ''}
                    onChange={(e) =>
                      setGame({ ...game, address: e.target.value })
                    }
                  />
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 2, mb: 3, borderColor: "#eee" }} elevation={0} variant="outlined">
              <Typography variant="subtitle1" fontWeight="500" gutterBottom>
                Detailed Description
              </Typography>
              <CKEditor
                onReady={(editor) => {
                  editor.editing.view.change((writer) => {
                    writer.setStyle(
                      'min-height',
                      '200px',
                      editor.editing.view.document.getRoot()
                    )
                    writer.setStyle(
                      'max-height',
                      '300px',
                      editor.editing.view.document.getRoot()
                    )
                  })
                }}
                disabled={!isUpdateMode}
                editor={ClassicEditor}
                data={game?.description}
                value={game?.description || ''}
                onChange={(event, editor) => {
                  const data = editor.getData()
                  setGame({ ...game, description: data })
                }}
              />
            </Paper>

            <Paper sx={{ p: 2, mb: 3, borderColor: "#eee" }} elevation={0} variant="outlined">
              <Typography variant="subtitle1" fontWeight="500" gutterBottom>
                Stamp & Signature (Optional)
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Stamp
                  </Typography>
                  <Box
                    sx={{
                      borderRadius: 2,
                      height: 180,
                      border: '2px dashed #c7d2fe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748b',
                      backgroundColor: '#f8fafc',
                      transition: 'border-color 0.2s, box-shadow 0.2s, background-color 0.2s',
                      cursor: isUpdateMode ? 'pointer' : 'default',
                      '&:hover': isUpdateMode
                        ? {
                            borderColor: '#7c9cff',
                            boxShadow: '0 0 0 3px rgba(124, 156, 255, 0.15)',
                            backgroundColor: '#f5f8ff'
                          }
                        : {}
                    }}
                    onClick={() => {
                      if (!isUpdateMode) return
                      const input = document.getElementById('stamp-upload')
                      input?.click()
                    }}
                    onDragOver={(e) => {
                      e.preventDefault()
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      if (!isUpdateMode) return
                      uploadCompanyImage('stamp', e.dataTransfer.files?.[0])
                    }}
                  >
                    {game?.stamp ? (
                      <img
                        src={game.stamp}
                        style={{
                          borderRadius: 4,
                          width: '100%',
                          height: 180,
                          backgroundColor: 'white',
                          objectFit: 'contain'
                        }}
                        alt="stamp"
                      />
                    ) : (
                      <Box sx={{ textAlign: 'center', px: 2 }}>
                        <CloudUploadIcon sx={{ fontSize: 28, color: '#94a3b8', mb: 0.5 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#475569' }}>
                          Drag & drop a file here
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', color: '#94a3b8' }}>
                          or click to browse (PNG, JPG, WEBP)
                        </Typography>
                        <Button
                          variant="contained"
                          disableElevation
                          disabled={!isUpdateMode}
                          onClick={(event) => {
                            event.stopPropagation()
                            if (!isUpdateMode) return
                            const input = document.getElementById('stamp-upload')
                            input?.click()
                          }}
                          sx={{
                            mt: 1.5,
                            px: 3,
                            textTransform: 'none',
                            fontWeight: 600,
                            backgroundColor: '#e5e7eb',
                            color: '#94a3b8',
                            '&:hover': { backgroundColor: '#dfe3e8' }
                          }}
                        >
                          Upload Document
                        </Button>
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <input
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      style={{ display: 'none' }}
                      disabled={!isUpdateMode}
                      id="stamp-upload"
                      multiple={false}
                      type="file"
                      onChange={(event) => uploadCompanyImage('stamp', event.target.files?.[0])}
                    />
                    <label htmlFor="stamp-upload" style={{ width: '100%' }}>
                      <LoadingButton
                        loading={uploadStampLoading}
                        variant="contained"
                        disabled={!isUpdateMode}
                        component="span"
                        fullWidth
                        sx={{
                          color: 'white',
                          backgroundColor: '#F7BE15',
                          ':hover': { backgroundColor: '#e3ab0c' }
                        }}
                        startIcon={<CloudUploadIcon />}
                      >
                        {game?.stamp ? 'Change' : 'Upload'} Stamp
                      </LoadingButton>
                    </label>
                    {game?.stamp && (
                      <Button
                        variant="outlined"
                        color="inherit"
                        disabled={!isUpdateMode}
                        onClick={() => handleClearImage('stamp')}
                      >
                        Clear
                      </Button>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Sign
                  </Typography>
                  <Box
                    sx={{
                      borderRadius: 2,
                      height: 180,
                      border: '2px dashed #c7d2fe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748b',
                      backgroundColor: '#f8fafc',
                      transition: 'border-color 0.2s, box-shadow 0.2s, background-color 0.2s',
                      cursor: isUpdateMode ? 'pointer' : 'default',
                      '&:hover': isUpdateMode
                        ? {
                            borderColor: '#7c9cff',
                            boxShadow: '0 0 0 3px rgba(124, 156, 255, 0.15)',
                            backgroundColor: '#f5f8ff'
                          }
                        : {}
                    }}
                    onClick={() => {
                      if (!isUpdateMode) return
                      const input = document.getElementById('sign-upload')
                      input?.click()
                    }}
                    onDragOver={(e) => {
                      e.preventDefault()
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      if (!isUpdateMode) return
                      uploadCompanyImage('sign', e.dataTransfer.files?.[0])
                    }}
                  >
                    {game?.sign ? (
                      <img
                        src={game.sign}
                        style={{
                          borderRadius: 4,
                          width: '100%',
                          height: 180,
                          backgroundColor: 'white',
                          objectFit: 'contain'
                        }}
                        alt="sign"
                      />
                    ) : (
                      <Box sx={{ textAlign: 'center', px: 2 }}>
                        <CloudUploadIcon sx={{ fontSize: 28, color: '#94a3b8', mb: 0.5 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#475569' }}>
                          Drag & drop a file here
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', color: '#94a3b8' }}>
                          or click to browse (PNG, JPG, WEBP)
                        </Typography>
                        <Button
                          variant="contained"
                          disableElevation
                          disabled={!isUpdateMode}
                          onClick={(event) => {
                            event.stopPropagation()
                            if (!isUpdateMode) return
                            const input = document.getElementById('sign-upload')
                            input?.click()
                          }}
                          sx={{
                            mt: 1.5,
                            px: 3,
                            textTransform: 'none',
                            fontWeight: 600,
                            backgroundColor: '#e5e7eb',
                            color: '#94a3b8',
                            '&:hover': { backgroundColor: '#dfe3e8' }
                          }}
                        >
                          Upload Document
                        </Button>
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <input
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      style={{ display: 'none' }}
                      disabled={!isUpdateMode}
                      id="sign-upload"
                      multiple={false}
                      type="file"
                      onChange={(event) => uploadCompanyImage('sign', event.target.files?.[0])}
                    />
                    <label htmlFor="sign-upload" style={{ width: '100%' }}>
                      <LoadingButton
                        loading={uploadSignLoading}
                        variant="contained"
                        disabled={!isUpdateMode}
                        component="span"
                        fullWidth
                        sx={{
                          color: 'white',
                          backgroundColor: '#F7BE15',
                          ':hover': { backgroundColor: '#e3ab0c' }
                        }}
                        startIcon={<CloudUploadIcon />}
                      >
                        {game?.sign ? 'Change' : 'Upload'} Sign
                      </LoadingButton>
                    </label>
                    {game?.sign && (
                      <Button
                        variant="outlined"
                        color="inherit"
                        disabled={!isUpdateMode}
                        onClick={() => handleClearImage('sign')}
                      >
                        Clear
                      </Button>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 2, mb: 3, borderColor: "#eee" }} elevation={0} variant="outlined">
              <Typography variant="subtitle1" fontWeight="500" gutterBottom>
                Media & Categories
              </Typography>
              <Grid container spacing={3}>
                {/* Thumbnail section */}
                <Grid item xs={12} md={5}>
                  <Typography variant="subtitle2" gutterBottom>
                    Company Thumbnail
                  </Typography>
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                  }}>

                    <img
                        src={newThumbnail ? newThumbnail : (!game?.thumbnail?.includes('http') ? Logo : game?.thumbnail)}
                        style={{
                          borderRadius: 4,
                          width: '100%',
                          height: 300,
                          backgroundColor: !game?.thumbnail?.includes('http') ? 'black' : 'white',
                          objectFit: !game?.thumbnail?.includes('http') ? 'contain' : 'cover'
                        }}
                        alt={'thumbnail'}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <input
                        required={true}
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        style={{ display: 'none' }}
                        disabled={!isUpdateMode}
                        id="contained-button-file"
                        multiple={false}
                        type="file"
                        onChange={async (event) => await updateGameThumbnail(event.target.files)}
                      />
                      <label htmlFor="contained-button-file">
                        <LoadingButton
                          loading={uploadThumbnailLoading}
                          variant="contained"
                          disabled={!isUpdateMode}
                          component="span"
                          fullWidth
                          sx={{
                            color: 'white',
                            backgroundColor: '#F7BE15',
                            ':hover': { backgroundColor: '#e3ab0c' }
                          }}
                          startIcon={<CloudUploadIcon />}
                        >
                          {newThumbnail ? 'Change' : 'Upload'} Thumbnail
                        </LoadingButton>
                      </label>
                      {newThumbnail && (
                        <Box
                          component="div"
                          py={'7px'}
                          sx={{
                            width: '100%',
                            borderRadius: 1,
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            fontWeight: 500,
                            justifyContent: 'center',
                            gap: 1,
                            color: 'white',
                            backgroundColor: '#357a38'
                          }}
                        >
                          <DoneAllIcon fontSize="small" />
                          Thumbnail Uploaded
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Grid>

                {/* Company URL and invoices */}
                <Grid item xs={12} md={7}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Company URL & Files
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                      {/* <TextField
                        required
                        disabled={!isUpdateMode}
                        variant="outlined"
                        type="url"
                        label="Company URL"
                        placeholder="Company URL"
                        value={game?.url}
                        onChange={(e) => setGame({ ...game, url: e.target.value })}
                        sx={{ flexGrow: 1 }}
                      /> */}
                      <Box sx={{ width: "100%" }}>
                        <input
                          accept=".zip"
                          disabled={!isUpdateMode}
                          style={{ display: 'none' }}
                          id="contained-button-file-upload"
                          multiple={false}
                          type="file"
                          onChange={async (event) => await handleFileUpload(event.target.files)}
                        />
                        <label htmlFor="contained-button-file-upload">
                          <LoadingButton
                            loading={uploadZipLoading}
                            variant="contained"
                            disabled={!isUpdateMode}
                            component="span"
                            sx={{
                              height: '60px',
                              width: '100%',
                              color: 'white',
                              backgroundColor: '#F7BE15',
                              ':hover': { backgroundColor: '#e3ab0c' }
                            }}
                            startIcon={<CloudUploadIcon />}
                          >
                            Upload ZIP
                          </LoadingButton>
                        </label>
                      </Box>

                    </Box>
                    {zipUploaded && (
                      <Box
                        component="div"
                        py={'7px'}
                        sx={{
                          width: '100%',
                          borderRadius: 1,
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          fontWeight: 500,
                          justifyContent: 'center',
                          gap: 1,
                          color: 'white',
                          backgroundColor: '#357a38'
                        }}
                      >
                        <DoneAllIcon fontSize="small" />
                        <span>Company ZIP Uploaded</span>
                      </Box>
                    )}

                    <Typography variant="subtitle2" sx={{ mt: 1 }}>
                      Categories
                    </Typography>
                    <FormControl fullWidth>
                      <InputLabel id="categories-select-label">
                        Categories
                      </InputLabel>
                      <Select
                        multiple
                        required
                        disabled={!isUpdateMode}
                        labelId="categories-select-label"
                        id="categories-select"
                        name="categories"
                        value={game?.categories || []}
                        onChange={(event) => {
                          setGame({ ...game, categories: event.target.value })
                        }}
                        input={
                          <OutlinedInput
                            id="select-multiple-chip"
                            label="Categories"
                          />
                        }
                        renderValue={(selected) => (
                          <Stack gap={1} direction="row" flexWrap="wrap">
                            {selected.map((selectedCategory, index) => (
                              <Chip
                                key={index}
                                label={selectedCategory?.categoryName}
                                onDelete={() => {
                                  const filteredCategories =
                                    game?.categories.filter(
                                      (category) =>
                                        category._id !== selectedCategory?._id
                                    )
                                  setGame({
                                    ...game,
                                    categories: filteredCategories
                                  })
                                }}
                                deleteIcon={
                                  <IconX
                                    size={18}
                                    onMouseDown={(event) =>
                                      event.stopPropagation()
                                    }
                                  />
                                }
                              />
                            ))}
                          </Stack>
                        )}
                      >
                        {categories?.map((category) => {
                          const isSelected = game?.categories.find(
                            (gameCategory) => gameCategory._id === category._id
                          )
                          return (
                            <MenuItem
                              key={category._id}
                              sx={{ display: 'flex', gap: '8px' }}
                              value={category}
                              divider={true}
                              selected={!!isSelected}
                            >
                              <img
                                src={category?.categoryIcon}
                                width={20}
                                height={20}
                                alt="icon"
                              />
                              {category?.categoryName}
                            </MenuItem>
                          )
                        })}
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 2, mb: 3 }} elevation={0} variant="outlined">
              <Typography variant="subtitle1" fontWeight="500" gutterBottom>
                Technical Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    disabled={!isUpdateMode}
                    variant="outlined"
                    type="text"
                    label="Technology"
                    placeholder="Technology"
                    value={game?.technology}
                    onChange={(e) =>
                      setGame({ ...game, technology: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    disabled={!isUpdateMode}
                    variant="outlined"
                    type="text"
                    label="Platform"
                    placeholder="Platform"
                    value={game?.platform}
                    onChange={(e) =>
                      setGame({ ...game, platform: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    disabled={!isUpdateMode}
                    variant="outlined"
                    type="text"
                    label="Developer"
                    placeholder="Developer"
                    value={game?.developer}
                    onChange={(e) =>
                      setGame({ ...game, developer: e.target.value })
                    }
                  />
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 2, mb: 3 }} elevation={0} variant="outlined">
              <Typography variant="subtitle1" fontWeight="500" gutterBottom>
                Metrics & Support
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    disabled={!isUpdateMode}
                    variant="outlined"
                    type="text"
                    label="Rating"
                    placeholder="Rating"
                    value={game?.rating}
                    onChange={(e) =>
                      setGame({ ...game, rating: e.target.value })
                    }
                  />
                </Grid>
                {/* <Grid item xs={12} sm={4}>
                  <TextField
                    disabled={!isUpdateMode}
                    id="outlined-number"
                    label="Likes"
                    type="number"
                    InputLabelProps={{
                      shrink: true
                    }}
                    value={game?.likes}
                    onChange={(e) =>
                      setGame({ ...game, likes: e.target.valueAsNumber })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    disabled={!isUpdateMode}
                    id="outlined-number"
                    label="Dislikes"
                    type="number"
                    InputLabelProps={{
                      shrink: true
                    }}
                    value={game?.disLikes}
                    onChange={(e) =>
                      setGame({ ...game, disLikes: e.target.valueAsNumber })
                    }
                  />
                </Grid> */}
                <Grid item xs={6}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    p: 1,
                    ml: 2,
                    mt: 1
                  }}>
                    <Typography variant="body1" fontWeight="500">Support:</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton sx={{ border: `2px solid ${mobileSupport ? "#ae3ec9" : "#757575"}` }}
                        disabled={!isUpdateMode}
                        onClick={() => setMobileSupport((prevState) => !prevState)}
                      >
                        <IconDeviceMobile
                          color={mobileSupport ? '#ae3ec9' : '#000000'}
                        />
                      </IconButton>
                      <IconButton sx={{ ml: 1, border: `2px solid ${desktopSupport ? "#ae3ec9" : "#757575"}` }}
                        disabled={!isUpdateMode}
                        onClick={() => setDesktopSupport((prevState) => !prevState)}
                      >
                        <IconDeviceDesktop
                          color={desktopSupport ? '#ae3ec9' : '#000000'}
                        />
                      </IconButton>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            <Alert severity="info" sx={{ mb: 3 }}>
              <AlertTitle>Notes:</AlertTitle>
              <Box component="ol" sx={{ m: 0, pl: 2 }}>
                <li>Recommended thumbnail aspect ratio is 1:1.</li>
                <li>You can upload game URL or game ZIP after complete game creation.</li>
              </Box>
            </Alert>

            {isUpdateMode && (
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button
                  variant="outlined"
                  color="inherit"
                  sx={{ mr: 2 }}
                  onClick={() => setIsUpdateMode(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => updateGame(game?._id, game)}
                  startIcon={<IconUpload stroke={1.5} size="1.3rem" />}
                >
                  Update Company
                </Button>
              </Box>
            )}
          </Box>
        </>
      )
      }
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} variant='filled'>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainCard >
  )
}
export default Company
