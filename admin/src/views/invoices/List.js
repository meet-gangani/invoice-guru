import React, { useEffect, useState } from 'react'
import { CardContent, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material'
import MainCard from 'ui-component/cards/MainCard'
import EndpointService from '../../services/endpoint.service'
import { IconEye } from '@tabler/icons'
import { useTheme } from '@mui/material/styles'
import { Link } from 'react-router-dom'
import { DateTime } from 'luxon'

const headCells = [
  { id: 'index', label: 'No' },
  { id: 'type', label: 'Type' },
  { id: 'Date', label: 'Generated On' },
  { id: 'View', label: 'View' }
]

const Invoices = () => {
  const theme = useTheme()

  const [ invoices, setInvoices ] = useState([])

  const [ page, setPage ] = useState(0)
  const [ rowsPerPage, setRowsPerPage ] = useState(10)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const response = await EndpointService.getInvoices()
      setInvoices(response?.invoices || [])
    } catch (error) {
      console.log(error.message)
    }
  }

  return (
      <MainCard title="Invoices" content={false}>
        <CardContent>
          <Grid container justifyContent="space-between" spacing={2}>
          </Grid>
        </CardContent>

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
              {invoices.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((invoice, idx) => (
                  <TableRow key={invoice._id}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{invoice.type}</TableCell>
                    <TableCell>
                      {DateTime?.fromISO(invoice.date)?.toFormat('dd MMMM yyyy hh:mm a')}
                    </TableCell>
                    <TableCell>
                      <Link to={`/${invoice.type}/${invoice._id}`}>
                        <IconEye fontSize="inherit" color={theme.palette.secondary.dark}/>
                      </Link>
                    </TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
            component="div"
            count={invoices.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) =>
                setRowsPerPage(parseInt(e.target.value, 10))
            }
            rowsPerPageOptions={[ 5, 10, 25 ]}
        />
      </MainCard>
  )
}

export default Invoices