import React, { useEffect, useState } from 'react'
import { Box, CardContent, Grid, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from '@mui/material'
import MainCard from 'ui-component/cards/MainCard'
import EndpointService from '../../services/endpoint.service'
import { IconBuildingBank, IconChecklist, IconCircleCheck, IconFileInvoice, IconNotes, IconPackages, IconTemplate } from '@tabler/icons'
import { useTheme } from '@mui/material/styles'
import { Link } from 'react-router-dom'
import { DateTime } from 'luxon'

const headCells = [
  { id: 'index', label: 'No', align: 'center' },
  { id: 'customer', label: 'Customer', align: 'center' },
  { id: 'performa', label: 'Performa', align: 'center' },
  { id: 'commercial', label: 'Commercial', align: 'center' },
  { id: 'packaging', label: 'Packaging', align: 'center' },
  { id: 'scomet', label: 'Scomet', align: 'center' },
  { id: 'evd', label: 'EVD', align: 'center' },
  { id: 'letterHead', label: 'Letter Head', align: 'center' },
  { id: 'Date', label: 'Date', align: 'left' }
]

const Invoices = () => {
  const theme = useTheme()

  const [invoices, setInvoices] = useState([])

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

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
                <TableCell align={cell.align} key={cell.id}>{cell.label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((invoice, idx) => {
              return <TableRow key={invoice._id}>
                <TableCell align="center">{idx + 1}</TableCell>
                <TableCell align="center">
                  {invoice?.customer?.name || '-'}
                  {/*<Chip*/}
                  {/*    label={typeConfig.label}*/}
                  {/*    color={typeConfig.color}*/}
                  {/*    size="small"*/}
                  {/*/>*/}
                </TableCell>

                <TableCell align="center">
                  <Link to={`/performa/${invoice._id}`}>
                    {
                      invoice.performaApproved ?
                        <IconCircleCheck fontSize="inherit" color={theme.palette.success.dark} /> :
                        <IconBuildingBank fontSize="inherit" color={theme.palette.secondary.dark} />
                    }
                  </Link>
                </TableCell>
                <TableCell align="center">
                  <Link to={`/delivery/${invoice._id}`}>
                    {
                      invoice.commercialApproved ?
                        <IconCircleCheck fontSize="inherit" color={theme.palette.success.dark} /> :
                        <IconFileInvoice fontSize="inherit" color={theme.palette.secondary.dark} />
                    }
                  </Link>
                </TableCell>
                <TableCell align="center">
                  <Link to={`/packing/${invoice._id}`}>
                    {
                      invoice.packagingApproved ?
                        <IconCircleCheck fontSize="inherit" color={theme.palette.success.dark} /> :
                        <IconPackages fontSize="inherit" color={theme.palette.secondary.dark} />
                    }
                  </Link>
                </TableCell>
                <TableCell align="center">
                  <Link to={`/scomet/${invoice._id}`}>
                    {
                      invoice.scometApproved ?
                        <IconCircleCheck fontSize="inherit" color={theme.palette.success.dark} /> :
                        <IconTemplate fontSize="inherit" color={theme.palette.secondary.dark} />
                    }
                  </Link>
                </TableCell>
                <TableCell align="center">
                  <Link to={`/evd/${invoice._id}`}>
                    {
                      invoice.evdApproved ?
                        <IconCircleCheck fontSize="inherit" color={theme.palette.success.dark} /> :
                        <IconChecklist fontSize="inherit" color={theme.palette.secondary.dark} />
                    }
                  </Link>
                </TableCell>
                <TableCell align="center">
                  <Link to={`/letter-head/${invoice._id}`}>
                    {
                      invoice.letterHeadApproved ?
                        <IconCircleCheck fontSize="inherit" color={theme.palette.success.dark} /> :
                        <IconNotes fontSize="inherit" color={theme.palette.secondary.dark} />
                    }
                  </Link>
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
                              width: 30,
                              height: 30,
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
                      const createdOn = Number(invoice?.createdOn || 0)
                      const date = createdOn
                        ? DateTime.fromMillis(createdOn)
                        : DateTime.fromISO(invoice?.date || '')
                      return date.isValid ? (
                        <Typography variant="body3" color="text.secondary">
                          {date.toFormat('dd MMMM yyyy hh:mm a')}
                        </Typography>
                      ) : null
                    })()}

                  </Stack>
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
        rowsPerPageOptions={[5, 10, 25]}
      />
    </MainCard>
  )
}

export default Invoices
