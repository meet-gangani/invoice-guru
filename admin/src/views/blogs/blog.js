import React, { useEffect, useState } from 'react'
import MainCard from 'ui-component/cards/MainCard'
import { useNavigate, useParams } from 'react-router'

import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'

import { STATUS } from '../../utils/enum'
import { Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Fab, FormControl, FormGroup, Grid, IconButton, InputLabel, MenuItem, OutlinedInput, Select, Stack, TextField, Tooltip, Typography, Avatar, Paper, Alert, AlertTitle, Snackbar } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import { IconBrandGooglePlay, IconDeviceDesktop, IconDeviceMobile, IconEdit, IconTrash, IconUpload, IconX } from '@tabler/icons'
import defaultImg from '../../assets/images/white-logo3.png'
import categoryService from '../../services/category.service'
import { LoadingButton } from '@mui/lab'
import blogService from '../../services/blog.service'

const Blog = () => {
  const params = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [uploadZipLoading, setUploadZipLoading] = useState(false)
  const [uploadThumbnailLoading, setUploadThumbnailLoading] = useState(false)
  const [blog, setBlog] = useState({
    blogTitle: '',
    blogImage: '',
    description: '',
    shortDescription: '',
    slug: '',
    releaseDate: ''
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
    fetchBlogs(id)
  }, [])

  async function fetchBlogs(blogId) {
    try {
      setLoading(true)

      const response = await blogService.getBlog(blogId)
      setBlog(response?.blog)
    } catch (error) {
      console.log(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function updateBlog(blogId, blog) {
    try {
      setLoading(true)

      const updateBlog = await blogService.updateBlog(blogId, {
        ...blog,
      })
      setNewThumbnail('')
      await navigate(`/blogs/${updateBlog?.slug}`)
      await fetchBlogs(updateBlog?.slug)
    } catch (error) {
      console.log(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function updateBlogThumbnail(file) {
    try {
      setUploadThumbnailLoading(true)
      const res = await blogService.uploadBlogThumbnailMedia(file, blog?._id)
      await setNewThumbnail(res.url)
      setSnackbar({
        open: true,
        message: 'Blog Thumbnail updated successfully!',
        severity: 'success'
      })
      setBlog({ ...blog, blogImage: res.url })
    } catch (e) {
      console.log('🚀🚀🚀 updateBlogThumbnail => eMessage :: ', e.message)
      setSnackbar({
        open: true,
        message: `Update failed: ${e.message}`,
        severity: 'error'
      })
    } finally {
      setUploadThumbnailLoading(false)
    }
  }

  async function deleteBlog(blogId) {
    try {
      await blogService.deleteBlog(blogId)
      navigate('/blogs')
    } catch (error) {
      console.log(error)
    }
  }

  function handleInputChange(e) {
    setInputDelete(e.target.value)
    setEnableDelete(e.target.value !== `blog/${blog.blogTitle}`)
  }

  // Add this snackbar handling function
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return
    setSnackbar({ ...snackbar, open: false })
  }

  return (
      <MainCard title={`${blog?.blogTitle}`}>
        {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={4}>
              <CircularProgress color="primary" />
              <Typography variant="body2" ml={2}>Loading blog details...</Typography>
            </Box>
        ) : (
            <>
              {/* Action buttons - moved to better position */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                  <Box display="flex" justifyContent="flex-end">
                    {/* <Typography variant="h5" component="h2" gutterBottom>
                  {blog?.blogTitle}
                </Typography> */}
                    <Box sx={{ display: 'flex', gap: '10px' }}>
                      <Tooltip title={isUpdateMode ? "Cancel Editing" : "Edit Blog"}>
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

                      <Tooltip title="Delete Blog">
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
                  Delete Blog/{blog?.blogTitle}
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
                      Blog/{blog?.blogTitle}
                    </Typography>
                  </Box>

                  <Typography
                      variant="body1"
                      sx={{ fontWeight: '500', mb: 2 }}
                  >
                    To confirm, type &quot;blog/{blog?.blogTitle}&quot; in the box below:
                  </Typography>
                  <TextField
                      fullWidth
                      required
                      variant="outlined"
                      type="text"
                      value={inputDelete}
                      onChange={handleInputChange}
                      placeholder={`blog/${blog?.blogTitle}`}
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
                      onClick={() => deleteBlog(blog?._id)}
                      startIcon={<IconTrash size="1rem" />}
                  >
                    Delete Blog
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
                  <Grid container mt={1} spacing={3}>
                    {/* Thumbnail section */}
                    <Grid item xs={12} md={5} mx={'auto'}>
                      <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2
                      }}>

                        <img
                            src={newThumbnail ? newThumbnail : (blog?.blogImage === '/white-logo3.png' ? defaultImg : blog?.blogImage)}
                            style={{
                              borderRadius: 4,
                              width: '100%',
                              height: '100%',
                              backgroundColor: blog?.blogImage === '/white-logo3.png' ? 'black' : 'white',
                              objectFit: blog?.blogImage === '/white-logo3.png' ? 'contain' : 'contain'
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
                              onChange={async (event) => await updateBlogThumbnail(event.target.files)}
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
                                Upload Blog Image
                              </Box>
                          )}
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                  <Typography variant="subtitle1" fontWeight="500" gutterBottom>
                    Blog Details
                  </Typography>
                  <Grid container mt={1} spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                          required
                          disabled={!isUpdateMode}
                          variant="outlined"
                          type="text"
                          label="Blog Name"
                          placeholder="Blog Name"
                          value={blog?.blogTitle}
                          onChange={(e) =>
                              setBlog({
                                ...blog,
                                blogTitle: e.target.value
                              })
                          }
                      />
                    </Grid>
                  </Grid>
                  <Grid container mt={1} spacing={2}>
                    <Grid item xs={10}>
                      <TextField
                          required
                          disabled={!isUpdateMode}
                          variant="outlined"
                          type="text"
                          label="SEO Short Desciption"
                          placeholder="SEO Short Desciption"
                          value={blog?.shortDescription}
                          onChange={(e) =>
                              setBlog({
                                ...blog,
                                shortDescription: e.target.value
                              })
                          }
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <TextField
                          required
                          disabled={!isUpdateMode}
                          variant="outlined"
                          type="date"
                          label="Release Date"
                          placeholder="Release Date"
                          value={blog?.releaseDate}
                          onChange={(e) =>
                              setBlog({
                                ...blog,
                                releaseDate: e.target.value
                              })
                          }
                      />
                    </Grid>
                  </Grid>
                  <Typography variant="subtitle1" mt={1} fontWeight="500" gutterBottom>
                    Blog Description
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
                      data={blog?.description}
                      value={blog?.description || ''}
                      onChange={(event, editor) => {
                        const data = editor?.getData()
                        setBlog({ ...blog, description: data })
                      }}
                  />
                </Paper>

                <Alert severity="info" sx={{ mb: 3 }}>
                  <AlertTitle>Notes:</AlertTitle>
                  <Box component="ol" sx={{ m: 0, pl: 2 }}>
                    <li>Recommended thumbnail aspect ratio is 16:9.</li>
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
                          onClick={() => updateBlog(blog?._id, blog)}
                          startIcon={<IconUpload stroke={1.5} size="1.3rem" />}
                      >
                        Update Blog
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
export default Blog
