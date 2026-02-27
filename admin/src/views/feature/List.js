import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles, useTheme } from '@mui/styles'
import { visuallyHidden } from '@mui/utils'
import MainCard from 'ui-component/cards/MainCard'
import { getComparator, rowsInitial, stableSort } from '../../utils/table-filter'
import { FormControl, InputLabel, MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import featureService from '../../services/feature.service'
import gameService from '../../services/game.service'
import './list.css'
import defaultImg from '../../assets/images/white-logo3.png'

const headCells = [
  {
    id: 'position',
    numeric: false,
    label: 'Position',
    align: 'center'
  },
  {
    id: 'game',
    numeric: false,
    label: 'Game',
    align: 'center'
  },
  {
    id: 'updateGame',
    numeric: false,
    label: 'Update Game',
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
                    direction={orderBy === headCell.id ? order : 'asc'}
                    onClick={createSortHandler(headCell.id)}
                >
                  {orderBy === headCell.id ? (
                      <span className={classes.sortSpan}>{order === 'desc' ? 'sorted descending' : 'sorted ascending'}</span>
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

// ===========================|| PRODUCT LIST ||=========================== //

const Features = () => {
  const classes = useStyles()
  const theme = useTheme()
  const navigate = useNavigate()

  const [ features, setFeatures ] = useState([])
  const [ games, setGames ] = useState([])
  const [ order, setOrder ] = useState('asc')
  const [ orderBy, setOrderBy ] = useState('calories')
  // const [ page, setPage ] = useState(0)
  // const [ rowsPerPage, setRowsPerPage ] = useState(10)
  // const [ search, setSearch ] = useState('')
  const [ rows, setRows ] = useState(rowsInitial)

  useEffect(() => {
    fetchFeatures()
    fetchGames()
  }, [])

  async function fetchFeatures() {
    try {
      const response = await featureService.getFeatureList()
      setFeatures(response.features)
    } catch (error) {
      console.log(error.message)
    }
  }

  async function fetchGames() {
    try {
      const response = await gameService.getGameList()
      setGames(response.games)
    } catch (error) {
      console.log(error.message)
    }
  }

  async function updateGamePosition(updateInfo) {
    try {
      const response = await featureService.updateFeature(updateInfo)
      if (response) {
        await fetchFeatures()
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  // const handleChangePage = (event, newPage) => {
  //   setPage(newPage)
  // }
  //
  // const handleChangeRowsPerPage = (event) => {
  //   setRowsPerPage(parseInt(event.target.value, 10))
  //   setPage(0)
  // }

  // const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0

  return (
      <MainCard title="Featured" content={false}>

        {/* table */}
        <TableContainer sx={{ width: '95%', margin: 'auto', marginTop: 4 }}>
          <Table className={classes.table} aria-labelledby="GameTable">
            <EnhancedTableHead classes={classes} order={order} orderBy={orderBy} onRequestSort={handleRequestSort} rowCount={rows.length}/>
            <TableBody>
              {stableSort(rows, getComparator(order, orderBy)).map((row, index) => {
                const labelId = `enhanced-table-checkbox-${index}`

                return (
                    <TableRow hover tabIndex={-1} key={index}>
                      <TableCell component="th" id={labelId} scope="row" sx={{ cursor: 'pointer' }}>
                        <Typography variant="subtitle2" sx={{ color: theme.palette.mode === 'dark' ? theme.palette.grey[600] : 'grey.900' }}>
                          {row?.position}
                        </Typography>
                      </TableCell>
                      <TableCell>{row?.game}</TableCell>
                      <TableCell align="right">{row?.updateGame}</TableCell>
                    </TableRow>
                )
              })}

              {features.map((row, index) => {
                const labelId = `enhanced-table-checkbox-${index}`

                return (
                    <TableRow hover tabIndex={-1} key={index}>

                      <TableCell align="center" component="th" id={labelId} scope="row" sx={{ cursor: 'pointer' }}>
                        {row?.position}
                      </TableCell>

                      <TableCell align="center">{row?.gameId?.gameName}</TableCell>
                      <TableCell align="center">
                        <FormControl fullWidth className="game-position-select">
                          <InputLabel id="demo-simple-select-label">Games</InputLabel>
                          <Select
                              required
                              variant="outlined"
                              type="text"
                              label="Categories"
                              labelId="demo-simple-select-label"
                              value={features?.find((trending) => trending?._id === row?._id)?.gameId?._id}
                              onChange={(e) => {
                                updateGamePosition({ featureId: row?._id, gameId: e.target.value })
                              }}
                          >
                            {games.map((game) => (
                                <MenuItem
                                    sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                    key={game?._id}
                                    value={game?._id}
                                >
                                  <img
                                      src={game.thumbnail === '/white-logo3.png' ? defaultImg : game.thumbnail}
                                      style={{ borderRadius: '100%', backgroundColor: game.thumbnail === '/white-logo3.png' ? 'black' : 'white' }}
                                      width={35}
                                      height={35}
                                      alt="icon"
                                  />
                                  {game?.gameName}
                                </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                )
              })}

              {/*{emptyRows > 0 && (*/}
              {/*    <TableRow*/}
              {/*        style={{*/}
              {/*          height: 53 * emptyRows*/}
              {/*        }}*/}
              {/*    >*/}
              {/*      <TableCell colSpan={6}/>*/}
              {/*    </TableRow>*/}
              {/*)}*/}
            </TableBody>
          </Table>
        </TableContainer>

        {/*<TablePagination*/}
        {/*    rowsPerPageOptions={[ 5, 10, 25 ]}*/}
        {/*    components="div"*/}
        {/*    count={rows.length}*/}
        {/*    rowsPerPage={rowsPerPage}*/}
        {/*    page={page}*/}
        {/*    onPageChange={handleChangePage}*/}
        {/*    onRowsPerPageChange={handleChangeRowsPerPage}*/}
        {/*/>*/}
      </MainCard>
  )
}

export default Features
