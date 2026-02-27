import * as React from 'react'
import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles, useTheme } from '@mui/styles'
import { visuallyHidden } from '@mui/utils'
import MainCard from 'ui-component/cards/MainCard'
import { getComparator, rowsInitial, stableSort } from '../../utils/table-filter'
import { IconPlus } from '@tabler/icons'
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  Fab,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  useMediaQuery
} from '@mui/material'
import defaultImg from '../../assets/images/white-logo3.png'
import { Close, Launch, Search as SearchIcon, VisibilityTwoTone as VisibilityTwoToneIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import blogService from '../../services/blog.service'

const headCells = [
  {
    id: 'title',
    numeric: false,
    label: 'Title',
    align: 'left'
  },
  {
    id: 'shortDescription',
    numeric: false,
    label: 'Short Description',
    align: 'center'
  },
  {
    id: 'releaseDate',
    numeric: false,
    label: 'Release Date',
    align: 'left'
  },
  {
    id: 'visit',
    numeric: false,
    label: 'Visit',
    align: 'center'
  },
  {
    id: 'actions',
    numeric: false,
    label: 'View',
    align: 'center'
  }
]

// style constant
const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%'
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2)
  },
  table: {
    minWidth: 750
  },
  sortSpan: visuallyHidden
}))

// ===========================|| TABLE HEADER ||=========================== //

function EnhancedTableHead({ classes, order, orderBy, onRequestSort }) {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property)
  }

  return (
      <TableHead>
        <TableRow>
          {headCells.map((headCell) => (
              <TableCell
                  key={headCell.id}
                  align={headCell.align}
                  padding={headCell.disablePadding ? 'none' : 'normal'}
                  // sortDirection={orderBy === headCell.id ? order : false}
              >
                {headCell.label}
                {/* <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {orderBy === headCell.id ? (
                <span className={classes.sortSpan}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </span>
              ) : null}
            </TableSortLabel> */}
              </TableCell>
          ))}
        </TableRow>
      </TableHead>
  )
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf([ 'asc', 'desc' ]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired
}

// ===========================|| CUSTOMER LIST ||=========================== //

const Blogs = () => {
  const classes = useStyles()
  const theme = useTheme()
  const navigate = useNavigate()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [ blogs, setBlogs ] = useState([])
  const [ createBlog, setCreateBlog ] = useState({
    blogTitle: '',
    blogImage: '/white-logo3.png',
    shortDescription: '',
    description: '',
    slug: '',
    releaseDate: new Date().toISOString().split('T')[0]
  })
  const [ categories, setCategories ] = useState([])
  // const [mobileSupport, setMobileSupport] = useState();
  // const [desktopSupport, setDesktopSupport] = useState();
  const [ order, setOrder ] = React.useState('asc')
  const [ orderBy, setOrderBy ] = React.useState('calories')
  const [ page, setPage ] = React.useState(0)
  const [ rowsPerPage, setRowsPerPage ] = React.useState(10)
  const [ search, setSearch ] = React.useState('')
  const [ rows, setRows ] = React.useState(rowsInitial)
  const [ openModel, setOpenModel ] = React.useState(false)
  const [ noSearchResults, setNoSearchResults ] = useState(false)
  const [ totalBlogs, setTotalBlogs ] = useState(0)

  useEffect(() => {
    fetchBlogs()
    setNoSearchResults(false)
  }, [ page, rowsPerPage ])

  async function fetchBlogs() {
    try {
      const response = await blogService.getBlogList((page + 1), rowsPerPage)
      const blogsData = response?.blogs || []
      const sortedData = blogsData.sort(
          (a, b) => new Date(b.createdOn) - new Date(a.createdOn)
      )
      setTotalBlogs(response?.totalBlogs)
      setBlogs(sortedData)
    } catch (error) {
      console.log(error.message)
    }
  }

  async function addBlog(event) {
    try {
      event.preventDefault()
      const res = await blogService.createBlogs(createBlog)

      setBlogs([ ...blogs, res.data ])
      setCreateBlog({
        blogTitle: '',
        blogImage: '/white-logo3.png',
        shortDescription: '',
        description: '',
        slug: '',
        releaseDate: ''
      })
      await fetchBlogs()
    } catch (error) {
      console.log(error.message)
    } finally {
      setOpenModel(false)
    }
  }

  const handleSearch = (event) => {
    const newString = event?.target?.value || search
    if (newString) {
      const searchedBlogs = blogs.filter((blog) =>
          blog.blogTitle.toLowerCase().includes(newString.toString().toLowerCase())
      )
      if (searchedBlogs.length) {
        setBlogs(searchedBlogs)
        setNoSearchResults(false)
      } else {
        setNoSearchResults(true)
      }
    } else {
      fetchBlogs() // Reset to all blogs if search is cleared
      setNoSearchResults(false)
    }
  }

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const emptyRows =
      page > 0 ? Math.max(0, (1 + page) * rowsPerPage - totalBlogs) : 0

  return (
      <MainCard title="Blogs" content={false}>
        <CardContent>
          <Grid
              container
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
          >
            <Grid item xs={12} sm={6}>
              <TextField
                  InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small"/>
                        </InputAdornment>
                    ),
                    endAdornment: search && (
                        <InputAdornment position="end">
                          <IconButton
                              size="small"
                              onClick={() => {
                                setSearch('')
                                fetchBlogs()
                                setNoSearchResults(false)
                              }}
                          >
                            <Close fontSize="small"/>
                          </IconButton>
                        </InputAdornment>
                    )
                  }}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch(e)
                    }
                  }}
                  placeholder="Search blogs..."
                  value={search}
                  size="small"
              />
            </Grid>
            <Grid
                item
                xs={12}
                sm={2}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-end',
                  marginRight: '10px'
                }}
            >
              <Fab
                  sx={{
                    width: '50px',
                    height: '50px',
                    backgroundColor: 'rgb(247,190,21)',
                    color: 'white',
                    ':hover': { backgroundColor: 'rgb(250,207,87)' }
                  }}
                  aria-label="add"
                  onClick={() => setOpenModel(true)}
              >
                <IconPlus stroke={2.5} size="1.3rem"/>
              </Fab>
              <Dialog
                  scroll="paper"
                  open={openModel}
                  onClose={() => setOpenModel(false)}
                  fullScreen={useMediaQuery(theme.breakpoints.down('sm'))}
                  fullWidth
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '& .MuiDialog-paper': {
                      width: '100%',
                      maxWidth: {
                        xs: '100vw',
                        sm: '90%',
                        md: '100%',
                        lg: '1000px'
                      },
                      maxHeight: { xs: '100vh', sm: '95vh' },
                      margin: { xs: 0, sm: '16px' }
                    }
                  }}
              >
                <Grid
                    item
                    xs={12}
                    sx={{
                      backgroundColor: 'white',
                      py: 2,
                      px: 3,
                      pb: 3,
                      borderRadius: '20px'
                    }}
                >
                  <DialogTitle
                      sx={{
                        fontSize: '22px',
                        fontWeight: '600',
                        padding: 0,
                        paddingBottom: '4px',
                        color: 'rgb(206,154,7)',
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}
                  >
                    Add Blog
                    {isMobile && (
                        <IconButton
                            onClick={() => setOpenModel(false)}
                            variant="outlined"
                            sx={{ border: '2px solid #f2afaa' }}
                        >
                          <Close color="error"/>
                        </IconButton>
                    )}
                  </DialogTitle>
                  <DialogContent
                      sx={{
                        fontSize: '16px',
                        paddingX: 0,
                        paddingBottom: '24px',
                        color: 'rgb(206,154,7)'
                      }}
                  >
                    Fill in the information of new blog.
                  </DialogContent>
                  <form onSubmit={addBlog}>
                    <Stack spacing={3}>
                      <TextField
                          sx={{ width: '100%' }}
                          required
                          variant="outlined"
                          type="text"
                          label="Blog Title"
                          placeholder="Blog Title"
                          value={createBlog.blogTitle}
                          onChange={(e) =>
                              setCreateBlog({
                                ...createBlog,
                                blogTitle: e.target.value
                              })
                          }
                      />
                      <TextField
                          id="outlined-multiline-static"
                          label="SEO Short Description"
                          value={createBlog?.shortDescription}
                          onChange={(e) =>
                              setCreateBlog({
                                ...createBlog,
                                shortDescription: e.target.value
                              })
                          }
                      />
                      <TextField
                          sx={{ width: '100%' }}
                          required
                          variant="outlined"
                          type="date"
                          label="Release Date"
                          placeholder="Release Date"
                          value={createBlog.releaseDate}
                          onChange={(e) =>
                              setCreateBlog({
                                ...createBlog,
                                releaseDate: e.target.value
                              })
                          }
                      />
                      <Grid item xs={12} className="App" marginY={2}>
                        <CKEditor
                            onReady={(editor) => {
                              editor.editing.view.change((writer) => {
                                writer.setStyle(
                                    'max-height',
                                    '200px',
                                    editor.editing.view.document.getRoot()
                                )
                                writer.setStyle(
                                    'max-height',
                                    '200px',
                                    editor.editing.view.document.getRoot()
                                )
                              })
                            }}
                            editor={ClassicEditor}
                            data={createBlog?.description}
                            value={createBlog?.description || ''}
                            onChange={(event, editor) => {
                              const data = editor.getData()
                              setCreateBlog({ ...createBlog, description: data })
                            }}
                        />
                      </Grid>
                      <Alert severity="info" sx={{ mb: 3 }}>
                        <AlertTitle>Notes:</AlertTitle>
                        <Box component="ol" sx={{ m: 0, pl: 2 }}>
                          <li>Recommended thumbnail aspect ratio is 16:9.</li>
                        </Box>
                      </Alert>
                      <Button
                          variant="contained"
                          color="success"
                          sx={{ color: '#fff', mt: '12px !important', textTransform: 'uppercase' }}
                          type="submit"
                      >
                        Create Blog
                      </Button>
                    </Stack>
                  </form>
                </Grid>
              </Dialog>
            </Grid>
          </Grid>
        </CardContent>

        {/* table */}
        <TableContainer sx={{ width: '95%', margin: 'auto' }}>
          <Table className={classes.table} aria-labelledby="BlogTable">
            <EnhancedTableHead
                classes={classes}
                order={order}
                orderBy={orderBy}
                onRequestSort={handleRequestSort}
                rowCount={rows.length}
            />
            <TableBody>
              {stableSort(rows, getComparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
                const labelId = `enhanced-table-checkbox-${index}`

                return (
                    <TableRow hover tabIndex={-1} key={index}>
                      <TableCell
                          component="th"
                          id={labelId}
                          scope="row"
                          sx={{ cursor: 'pointer' }}
                          align="center"
                      >
                        <Typography
                            variant="subtitle1"
                            sx={{
                              color:
                                  theme.palette.mode === 'dark'
                                      ? theme.palette.grey[600]
                                      : 'grey.900'
                            }}
                        >
                          {row.blogTitle}
                        </Typography>
                        <Typography variant="caption">
                          {' '}
                          {row.blogImage}{' '}
                        </Typography>
                      </TableCell>
                      <TableCell>{row.shortDescription}</TableCell>
                      <TableCell>{row.releaseDate}</TableCell>
                      <TableCell align="center" sx={{ pr: 3 }} onClick={(e) => {
                        e.stopPropagation()
                        window.open(`${process.env.REACT_APP_FRONTEND_URL}/blog/${row?.slug}`, '_blank', 'noopener,noreferrer')
                      }}>
                        <IconButton color="primary">
                          <Launch sx={{ fontSize: '1.3rem' }}/>
                        </IconButton>
                      </TableCell>
                      <TableCell
                          align="center"
                          sx={{ pr: 3 }}
                          onClick={() => navigate(row?.url)}
                      >
                        <IconButton color="primary">
                          <VisibilityTwoToneIcon sx={{ fontSize: '1.3rem' }}/>
                        </IconButton>
                      </TableCell>
                    </TableRow>
                )
              })}
              {noSearchResults ? (
                  <TableRow aria-colspan={4}>
                    <TableCell colSpan={4} sx={{ textAlign: 'center' }}>
                      No search results found
                    </TableCell>
                  </TableRow>
              ) : (
                  blogs.map((row, index) => {
                    const labelId = `enhanced-table-checkbox-${index}`
                    return (
                        <TableRow hover
                                  tabIndex={-1}
                                  key={`table-${row?._id}`}
                                  onClick={() => navigate(`/blogs/${row.slug}`)}
                                  sx={{ cursor: 'pointer' }}>
                          <TableCell
                              id={labelId}
                              scope="row"
                              sx={{ cursor: 'pointer' }}
                          >
                            <Grid
                                item
                                xs={12}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '20px'
                                }}
                            >
                              <Grid item xs={3}
                                    sx={{
                                      width: '70px',
                                      height: '70px'
                                    }}
                              >
                                <img
                                    // src={row?.thumbnail.includes(process.env.REACT_APP_BACKEND_URL) ? row.thumbnail : `${process.env.REACT_APP_BACKEND_URL}/${row.thumbnail}`}
                                    src={row?.blogImage === '/white-logo3.png' ? defaultImg : row?.blogImage}
                                    width="70px"
                                    height="70px"
                                    style={{
                                      backgroundColor: row?.blogImage === '/white-logo3.png' ? 'black' : 'white',
                                      borderRadius: '50px',
                                      objectFit: row?.blogImage === '/white-logo3.png' ? 'contain' : 'cover'
                                    }}
                                    alt="blog"
                                />
                              </Grid>
                              <Grid item xs={9}>
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      color:
                                          theme.palette.mode === 'dark'
                                              ? theme.palette.grey[600]
                                              : 'grey.900'
                                    }}
                                    align="center"
                                >
                                  {row?.blogTitle}
                                </Typography>
                              </Grid>
                            </Grid>
                          </TableCell>
                          <TableCell align="center" sx={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '650px' // Adjust as needed
                          }}>
                            <Typography
                                sx={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                                dangerouslySetInnerHTML={{ __html: row?.shortDescription }}/>
                          </TableCell>
                          <TableCell
                                      width={150}
                                      align="center">
                            {row?.releaseDate}
                          </TableCell>
                          <TableCell align="center" sx={{ pr: 3 }} onClick={(e) => {
                            e.stopPropagation()
                            window.open(`${process.env.REACT_APP_FRONTEND_URL}/blogs/${row?.slug}`, '_blank', 'noopener,noreferrer')
                          }}>
                            <IconButton
                                color="primary"
                            >
                              <Launch sx={{ fontSize: '1.3rem' }}/>
                            </IconButton>
                          </TableCell>
                          <TableCell
                              align="center"
                              sx={{ pr: 3 }}
                              onClick={() => navigate(`/blogs/${row?.slug}`)}
                          >
                            <IconButton color="primary">
                              <VisibilityTwoToneIcon sx={{ fontSize: '1.3rem' }}/>
                            </IconButton>
                          </TableCell>
                        </TableRow>
                    )
                  })
              )}

              {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={6}/>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
            rowsPerPageOptions={[ 5, 10, 25 ]}
            component="div"
            count={totalBlogs}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </MainCard>
  )
}

export default Blogs
