import PropTypes from 'prop-types'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { makeStyles, useTheme } from '@mui/styles'
import { visuallyHidden } from '@mui/utils'
import MainCard from 'ui-component/cards/MainCard'
import EndpointService from '../../services/endpoint.service'
import { getComparator, rowsInitial, stableSort } from '../../utils/table-filter'
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CardContent,
  Chip,
  DialogContent,
  DialogTitle,
  Fab,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Toolbar,
  Typography
} from '@mui/material'
import Logo from '../../assets/images/logo.png'
import { Close, Search as SearchIcon, VisibilityTwoTone as VisibilityTwoToneIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { STATUS } from '../../utils/enum'
import { IconPlus } from '@tabler/icons'

const headCells = [
  {
    id: 'icon',
    numeric: true,
    label: 'Icon',
    align: 'left'
  },
  {
    id: 'name',
    numeric: false,
    label: 'Name',
    align: 'left'
  },
  {
    id: 'status',
    numeric: true,
    label: 'Status',
    align: 'left'
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

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    padding: 0,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1)
  },
  highlight: {
    color: theme.palette.secondary.main
  },
  title: {
    flex: '1 1 100%'
  }
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
                    direction={orderBy === headCell.id ? order : 'asc'}
                    onClick={createSortHandler(headCell.id)}
                >
                  {orderBy === headCell.id ? (
                      <span className={classes.sortSpan}>{order === 'desc' ? 'sorted descending' : 'sorted ascending'}</span>
                  ) : null}
                </TableSortLabel> */}
              </TableCell>
          ))}

          <TableCell align={'center'}>View</TableCell>
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

// ===========================|| TABLE HEADER TOOLBAR ||=========================== //

const EnhancedTableToolbar = () => {
  const classes = useToolbarStyles()

  return (
      <Toolbar>
        <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
          Nutrition
        </Typography>
      </Toolbar>
  )
}

EnhancedTableToolbar.propTypes = {}

// ===========================|| CUSTOMER LIST ||=========================== //

const Invoices = () => {
  const classes = useStyles()
  const theme = useTheme()
  const navigate = useNavigate()

  const [ categories, setCategories ] = useState([])
  const [ createCategory, setCreateCategory ] = useState({
    categoryName: '',
    categoryIcon: '/default-category-icon.png',
    isDeleted: false,
    isActive: false
  })
  const [ order, setOrder ] = React.useState('asc')
  const [ orderBy, setOrderBy ] = React.useState('calories')
  const [ page, setPage ] = React.useState(0)
  const [ rowsPerPage, setRowsPerPage ] = React.useState(10)
  const [ search, setSearch ] = React.useState('')
  const [ rows, setRows ] = React.useState(rowsInitial)
  const [ openModel, setOpenModel ] = React.useState(false)
  const [ noSearchResults, setNoSearchResults ] = useState(false)

  useEffect(() => {
    fetchCategories()
    setNoSearchResults(false)
  }, [])

  async function fetchCategories() {
    try {
      const response = await EndpointService.getCategoryList()
      setCategories(response.categories)
    } catch (error) {
      console.log(error)
    }
  }

  async function addCategory(event) {
    try {
      event.preventDefault()
      const res = await EndpointService.createCategory(createCategory)

      if (res) {
        await fetchCategories()
        setCategories([ ...categories, res.category ])
        setCreateCategory({
          categoryName: '',
          categoryIcon: '',
          isDeleted: false,
          isActive: false
        })
      }
    } catch (error) {
      console.log(error.message)
    } finally {
      setOpenModel(false)
    }
  }

  const handleSearch = (event) => {
    const newString = event.target.value
    const searchedGames = categories.filter((category) => category.categoryName.toLowerCase().includes(newString.toString().toLowerCase()))

    if (newString) {
      if (searchedGames.length) {
        setCategories(searchedGames)
        setNoSearchResults(false)
      } else {
        setNoSearchResults(true)
      }
    } else {
      fetchCategories() // Reset to all invoices if search is cleared
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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - categories.length) : 0

  return (
      <MainCard title="Invoices" content={false}>
        <CardContent>
          <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
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
                                fetchCategories()
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
                  placeholder="Search category"
                  value={search}
                  size="small"
              />
            </Grid>

            <Grid item xs={12} sm={2} sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', marginRight: '10px' }}>
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
                <IconPlus stroke={2.5} size="1.3rem"/></Fab>
              <Modal open={openModel} onClose={() => setOpenModel(false)} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Grid item xs={12} sm={6} sx={{ backgroundColor: 'white', padding: '20px', borderRadius: '20px' }}>
                  <DialogTitle sx={{ fontSize: '22px', fontWeight: '600', padding: 0, paddingBottom: '10px', color: 'rgb(206,154,7)' }}>Add Categories</DialogTitle>
                  <DialogContent sx={{ fontSize: '16px', paddingX: 0, paddingBottom: '25px', color: 'rgb(206,154,7)' }}>Fill in the information of Your Category.</DialogContent>
                  <form onSubmit={addCategory}>
                    <Stack spacing={3}>
                      <TextField
                          sx={{ width: '100%' }}
                          required
                          variant="outlined"
                          type="text"
                          label="Category Name"
                          placeholder="Category Name"
                          value={createCategory.categoryName || ''}
                          onChange={(e) => setCreateCategory({ ...createCategory, categoryName: e.target.value })}
                      />
                      {/*<TextField*/}
                      {/*  sx={{ width: '100%' }}*/}
                      {/*  required*/}
                      {/*  variant="outlined"*/}
                      {/*  type="url"*/}
                      {/*  label="Category Icon URL"*/}
                      {/*  placeholder="Category Icon URL"*/}
                      {/*  value={createCategory.categoryIcon || ''}*/}
                      {/*  onChange={(e) => setCreateCategory({ ...createCategory, categoryIcon: e.target.value })}*/}
                      {/*/>*/}
                      <Grid item xs={12} sx={{ display: 'flex', gap: '20px' }}>
                        <Grid item xs={4}>
                          <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Status</InputLabel>
                            <Select
                                required
                                variant="outlined"
                                type="text"
                                label="Status"
                                labelId="demo-simple-select-label"
                                name="status"
                                value={createCategory.status || STATUS.value}
                                onChange={(e) => setCreateCategory({ ...createCategory, status: e.target.value })}
                            >
                              {
                                STATUS.map((status) => <MenuItem key={status.value} value={status.value}>
                                  {status.label}
                                </MenuItem>)
                              }
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                      <Alert severity="info" sx={{ mb: 3 }}>
                        <AlertTitle>Notes:</AlertTitle>
                        <Box component="ol" sx={{ m: 0, pl: 2 }}>
                          <li>For better view upload 128x128 sized icon image with transparent background.</li>
                          <li>You can upload category icon image after complete category creation.</li>
                        </Box>
                      </Alert>
                      <Button variant="contained" color="success" sx={{ color: '#fff', textTransform: 'uppercase' }} type="submit">Add Category</Button>
                    </Stack>
                  </form>
                </Grid>
              </Modal>
            </Grid>
          </Grid>
        </CardContent>

        {/* table */}
        <TableContainer sx={{ width: '95%', margin: 'auto' }}>
          <Table className={classes.table} aria-labelledby="categoryTable">
            <EnhancedTableHead classes={classes} order={order} orderBy={orderBy} onRequestSort={handleRequestSort} rowCount={rows.length}/>
            <TableBody>
              {stableSort(rows, getComparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
                const labelId = `enhanced-table-checkbox-${index}`

                return (
                    <TableRow hover tabIndex={-1} key={index}>
                      <TableCell component="th" id={labelId} scope="row" sx={{ cursor: 'pointer' }}>
                        <Typography variant="subtitle1" sx={{ color: theme.palette.mode === 'dark' ? theme.palette.grey[600] : 'grey.900' }}>
                          {row.icon}
                        </Typography>
                      </TableCell>
                      <TableCell align="left"> {row.name} </TableCell>
                      <TableCell align="left">{row.status}</TableCell>
                      <TableCell align="center" sx={{ pr: 3 }} onClick={() => navigate(`/invoices/${row.id}`)}>
                        <IconButton color="primary">
                          <VisibilityTwoToneIcon sx={{ fontSize: '1.3rem' }}/>
                        </IconButton>
                      </TableCell>
                    </TableRow>
                )
              })}

              {
                noSearchResults ? <TableRow aria-colspan={4}>
                      <TableCell colSpan={4} sx={{ textAlign: 'center' }}>
                        No search results found
                      </TableCell>
                    </TableRow> :
                    (categories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
                      const labelId = `enhanced-table-checkbox-${index}`

                      return (
                          <TableRow hover tabIndex={-1} key={index}>
                            <TableCell align="left" component="th" id={labelId} scope="row" sx={{ cursor: 'pointer' }}>
                              <Grid item xs={12} sx={{ display: 'flex', gap: '14px' }}>
                                <img
                                    src={!row.categoryIcon.includes('http') ? Logo : row.categoryIcon}
                                    width="50px"
                                    height="50px"
                                    style={{
                                      borderRadius: '50px',
                                      objectFit: 'contain'
                                    }}
                                    alt="category"
                                />
                              </Grid>
                            </TableCell>
                            <TableCell variant="subtitle1" sx={{ marginX: 'auto', color: theme.palette.mode === 'dark' ? theme.palette.grey[600] : 'grey.900' }}>
                              {row.categoryName}
                            </TableCell>
                            <TableCell align="left">
                              {row.status === 'active' && <Chip label="Active" size="small" color="success"/>}
                              {row.status === 'inactive' && <Chip label="Inactive" size="small" color="primary"/>}
                              {row.status === 'deleted' && <Chip label="Deleted" size="small" color="error"/>}
                              {row.status === 'pending' && <Chip label="Pending" size="small" color="warning"/>}
                            </TableCell>
                            <TableCell align="center" sx={{ pr: 3 }} onClick={() => navigate(`/invoices/${row._id}`)}>
                              <IconButton color="primary">
                                <VisibilityTwoToneIcon sx={{ fontSize: '1.3rem' }}/>
                              </IconButton>
                            </TableCell>
                          </TableRow>
                      )
                    }))
              }

              {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={6}/>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* table pagination */}
        <TablePagination
            rowsPerPageOptions={[ 5, 10, 25 ]}
            component="div"
            count={categories.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </MainCard>
  )
}

export default Invoices
