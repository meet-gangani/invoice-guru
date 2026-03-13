import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
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
  TableRow,
  TablePagination,
  TextField,
  Typography
} from '@mui/material'

import { IconPlus, IconEdit } from '@tabler/icons'
import { Close, Search as SearchIcon } from '@mui/icons-material'
import MainCard from 'ui-component/cards/MainCard'
import EndpointService from '../../services/endpoint.service'
import { useTheme } from '@mui/material/styles'

const headCells = [
  { id: 'name', label: 'Name' },
  { id: 'mail', label: 'Mail' },
  { id: 'contact', label: 'Contact' },
  { id: 'pinCode', label: 'Pin Code' },
  { id: 'actions', label: 'Actions' }
]

const createObj = {
  name: '',
  address: '',
  mail: '',
  pinCode: '',
  shipTo: '',
  billTo: '',
  contact: ''
}

const Customers = () => {
  const theme = useTheme()

  const [ customers, setCustomers ] = useState([])
  const [ search, setSearch ] = useState('')
  const [ openModel, setOpenModel ] = useState(false)
  const [ page, setPage ] = useState(0)
  const [ rowsPerPage, setRowsPerPage ] = useState(10)

  const [ createCustomer, setCreateCustomer ] = useState(createObj)
  const [ editId, setEditId ] = useState(null)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const clearData = () => {
    setCreateCustomer(createObj)
  }

  const fetchCustomers = async () => {
    try {
      const response = await EndpointService.getCustomerList()
      setCustomers(response?.customers || [])
    } catch (error) {
      console.log(error.message)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      if (editId) {
        await EndpointService.updateCustomer(editId, createCustomer)
      } else {
        await EndpointService.createCustomer(createCustomer)
      }

      clearData()
      setEditId(null)
      fetchCustomers()
    } catch (error) {
      console.log(error.message)
    } finally {
      setOpenModel(false)
    }
  }

  const filteredCustomers = customers.filter((customer) => {
    const value = `${customer.name || ''} ${customer.mail || ''}`
    return value.toLowerCase().includes(search.toLowerCase())
  })

  return (
      <MainCard title="Customers" content={false}>
        <CardContent>
          <Grid container justifyContent="space-between" spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                  fullWidth
                  size="small"
                  placeholder="Search customer..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small"/>
                        </InputAdornment>
                    ),
                    endAdornment: search && (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setSearch('')}>
                            <Close fontSize="small"/>
                          </IconButton>
                        </InputAdornment>
                    )
                  }}
              />
            </Grid>

            <Grid item>
              <Fab
                  color="secondary"
                  onClick={() => {
                    clearData()
                    setEditId(null)
                    setOpenModel(true)
                  }}
              >
                <IconPlus size={24} color={theme.palette.primary.light}/>
              </Fab>
            </Grid>
          </Grid>
        </CardContent>

        {/* Dialog */}
        <Dialog
            open={openModel}
            onClose={() => {
              setOpenModel(false)
              clearData()
              setEditId(null)
            }}
            fullWidth
            maxWidth="sm"
        >
          <DialogTitle sx={{ fontSize: '20px', fontWeight: 600, pt: 3 }}>
            {editId ? 'Update Customer' : 'Add Customer'}
          </DialogTitle>

          <DialogContent>
            <form onSubmit={handleSubmit}>
              <Stack spacing={3} mt={1}>
                <TextField
                    required
                    label="Name"
                    value={createCustomer.name}
                    onChange={(e) =>
                        setCreateCustomer((prev) => ({
                          ...prev,
                          name: e.target.value
                        }))
                    }
                />

                <TextField
                    label="Address"
                    multiline
                    minRows={2}
                    value={createCustomer.address}
                    onChange={(e) =>
                        setCreateCustomer((prev) => ({
                          ...prev,
                          address: e.target.value
                        }))
                    }
                />

                <TextField
                    required
                    type="email"
                    label="Mail"
                    value={createCustomer.mail}
                    onChange={(e) =>
                        setCreateCustomer((prev) => ({
                          ...prev,
                          mail: e.target.value
                        }))
                    }
                />

                <TextField
                    type="tel"
                    label="Contact"
                    value={createCustomer.contact}
                    onChange={(e) =>
                        setCreateCustomer((prev) => ({
                          ...prev,
                          contact: e.target.value
                        }))
                    }
                />

                <TextField
                    type="text"
                    label="Pin Code"
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                    value={createCustomer.pinCode}
                    onChange={(e) =>
                        setCreateCustomer((prev) => ({
                          ...prev,
                          pinCode: e.target.value
                        }))
                    }
                />

                <TextField
                    label="Ship To"
                    multiline
                    minRows={2}
                    value={createCustomer.shipTo}
                    onChange={(e) =>
                        setCreateCustomer((prev) => ({
                          ...prev,
                          shipTo: e.target.value
                        }))
                    }
                />

                <TextField
                    label="Bill To"
                    multiline
                    minRows={2}
                    value={createCustomer.billTo}
                    onChange={(e) =>
                        setCreateCustomer((prev) => ({
                          ...prev,
                          billTo: e.target.value
                        }))
                    }
                />

                <Button
                    type="submit"
                    variant="contained"
                    sx={{ backgroundColor: theme.palette.secondary.main }}
                >
                  {editId ? 'Update Customer' : 'Add New Customer'}
                </Button>
              </Stack>
            </form>
          </DialogContent>
        </Dialog>

        {/* Table */}
        <TableContainer sx={{ px: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                {headCells.map((cell) => (
                    <TableCell key={cell.id}>{cell.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredCustomers
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((customer) => (
                  <TableRow key={customer._id}>
                    <TableCell>
                      <Typography>{customer.name}</Typography>
                    </TableCell>
                    <TableCell>{customer.mail}</TableCell>
                    <TableCell>{customer.contact}</TableCell>
                    <TableCell>{customer.pinCode}</TableCell>
                    <TableCell>
                      <IconButton
                          onClick={() => {
                            setCreateCustomer(customer)
                            setEditId(customer._id)
                            setOpenModel(true)
                          }}
                      >
                        <IconEdit size={24} color={theme.palette.secondary.main}/>
                      </IconButton>
                    </TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
            component="div"
            count={filteredCustomers.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) =>
                setRowsPerPage(parseInt(e.target.value, 10))
            }
            rowsPerPageOptions={[5, 10, 25]}
        />
      </MainCard>
  )
}

export default Customers
