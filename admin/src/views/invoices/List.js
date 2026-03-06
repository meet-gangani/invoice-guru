import React, { useEffect, useState } from 'react'
import { Box, CardContent, Chip, Grid, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from '@mui/material'
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

  const TYPE_CONFIG = {
    scomet: { label: 'SCOMET', color: 'secondary' },
    delivery: { label: 'DELIVERY', color: 'success' },
    packing: { label: 'PACKING', color: 'warning' },
    performa: { label: 'PERFORMA', color: 'primary' }
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
              {invoices.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((invoice, idx) => {
                const typeConfig = TYPE_CONFIG[invoice?.type] || {
                  label: invoice?.type?.toUpperCase(),
                  color: 'default'
                }

                return <TableRow key={invoice._id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>
                    <Chip
                        label={typeConfig.label}
                        color={typeConfig.color}
                        size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="column" spacing={0.5}>
                      {invoice?.company && (
                          <Stack direction="row" spacing={1} alignItems="center">

                            {invoice?.company?.logo && (
                                <Box
                                    component="img"
                                    src={invoice.company.logo}
                                    alt={invoice.company.name}
                                    sx={{
                                      width: 28,
                                      height: 28,
                                      objectFit: 'contain',
                                      borderRadius: 1
                                    }}
                                />
                            )}

                            <Typography variant="body" fontWeight={500}>
                              {invoice.company.name}
                            </Typography>
                          </Stack>
                      )}

                      {(() => {
                        const date = DateTime.fromISO(invoice?.date || '')
                        return date.isValid ? (
                            <Typography variant="body3" color="text.secondary">
                              {date.toFormat('dd MMMM yyyy hh:mm a')}
                            </Typography>
                        ) : null
                      })()}

                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Link to={`/${invoice.type}/${invoice._id}`}>
                      <IconEye fontSize="inherit" color={theme.palette.secondary.dark}/>
                    </Link>
                  </TableCell>
                </TableRow>
              })}
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