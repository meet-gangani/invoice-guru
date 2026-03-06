import React, { useEffect, useMemo, useState } from 'react'
import { Box, Button, Checkbox, Divider, FormControlLabel, Grid, IconButton, Stack, TextField, Typography } from '@mui/material'
import { IconPlus, IconTrash } from '@tabler/icons'
import { Document, Page, PDFViewer, StyleSheet, Text, View } from '@react-pdf/renderer'
import MainCard from 'ui-component/cards/MainCard'
import { useTheme } from '@mui/material/styles'
import { useNavigate, useParams } from 'react-router-dom'
import axiosInstance from '../../services/axiosInstance'

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 7.5, fontFamily: 'Helvetica', color: '#000' },
  table: { border: '1pt solid black', width: '100%' },

  // Layout Strategy: Two main vertical pillars
  flexRow: { flexDirection: 'row' },
  leftPillar: { width: '50%', borderRight: '1pt solid black' },
  rightPillar: { width: '50%' },

  // Cell heights and borders
  cell: { padding: 4, borderBottom: '1pt solid black' },
  cellLast: { padding: 4 }, // No bottom border

  // Nested Grid Helpers
  splitRow: { flexDirection: 'row', borderBottom: '1pt solid black' },
  innerBox: { width: '50%', padding: 4 },
  borderRight: { borderRight: '1pt solid black' },

  // Typography
  label: { fontSize: 6, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 2 },
  value: { fontSize: 8 },
  header: {
    backgroundColor: '#F0F0F0',
    textAlign: 'center',
    fontWeight: 'bold',
    padding: 5,
    fontSize: 9,
    borderBottom: '1pt solid black'
  },

  // Item Table Proportions (%)
  c1: { width: '12%', borderRight: '1pt solid black' },
  c2: { width: '16%', borderRight: '1pt solid black' },
  c3: { width: '7%', borderRight: '1pt solid black' },
  c4: { width: '33%', borderRight: '1pt solid black' },
  c5: { width: '8%', borderRight: '1pt solid black' },
  c6: { width: '8%', borderRight: '1pt solid black' },
  c7: { width: '8%', borderRight: '1pt solid black' },
  c8: { width: '8%' }
})

const PackingListPdf = ({ data }) => {
  const formatDate = (value) => {
    if (!value) return ''
    const raw = String(value).split('T')[0]
    const ddmmyyyy = raw.match(/^(\d{2})-(\d{2})-(\d{4})$/)
    if (ddmmyyyy) return raw
    const [ yyyy, mm, dd ] = raw.split('-')
    if (!yyyy || !mm || !dd) return value
    return `${dd}-${mm}-${yyyy}`
  }
  return (
      <Document title={'Packaging List'}>
        <Page size="A4" style={styles.page}>
          <View style={styles.table}>

            {/* TITLE HEADER */}
            <View style={styles.header}>
              <Text>{data.title.value}</Text>
            </View>

            {/* TOP BLOCK: Exporter/Consignee vs Ref Boxes */}
            <View style={styles.flexRow}>
              {/* LEFT PILLAR */}
              <View style={styles.leftPillar}>
                <View style={[ styles.cell, { height: 90 } ]}>
                  <Text style={styles.label}>Exporter</Text>
                  {data.exporterLines.filter(l => l.visible).map((l, i) => (
                      <Text key={i} style={styles.value}>{l.value}</Text>
                  ))}
                </View>
                <View style={[ styles.cellLast, { height: 90 } ]}>
                  <Text style={styles.label}>Consignee</Text>
                  <Text style={styles.value}>{data.consignee.value}</Text>
                  <View style={{ marginTop: 15 }}>
                    <Text style={styles.label}>Contact: {data.contact.value}</Text>
                    <Text style={styles.label}>Tel: {data.tel.value}</Text>
                  </View>
                </View>
              </View>

              {/* RIGHT PILLAR (Independent horizontal lines) */}
              <View style={styles.rightPillar}>
                <View style={[ styles.splitRow, { height: 45 } ]}>
                  <View style={[ styles.innerBox, styles.borderRight ]}>
                    <Text style={styles.label}>Packing List No. & Date</Text>
                    <Text style={styles.value}>
                      {data.packingListNo.value} {formatDate(data.date.value)}
                    </Text>
                  </View>
                  <View style={styles.innerBox}>
                    <Text style={styles.label}>Export Ref / IEC / GSTIN</Text>
                    <Text style={styles.value}>{data.exportRef.value}</Text>
                    <Text style={styles.value}>
                      {data.iec.value} {data.gstin.value}
                    </Text>
                  </View>
                </View>
                <View style={[ styles.cell, { height: 45 } ]}>
                  <Text style={styles.label}>Buyer's Order No. & Date</Text>
                  <Text style={styles.value}>{data.buyersOrder.value}</Text>
                </View>
                <View style={[ styles.cellLast, { height: 45 } ]}>
                  <Text style={styles.label}>Notify / Buyer (if other than consignee)</Text>
                  <Text style={styles.value}>{data.notifyBuyer.value}</Text>
                </View>
              </View>
            </View>

            {/* SHIPPING & TERMS BLOCK */}
            <View style={[ styles.flexRow, { borderTop: '1pt solid black', borderBottom: '1pt solid black' } ]}>
              {/* Left 50%: Three-Row Shipping Grid */}
              <View style={styles.leftPillar}>
                <View style={styles.splitRow}>
                  <View style={[ styles.innerBox, styles.borderRight ]}><Text style={styles.label}>Pre-Carriage by</Text><Text>{data.preCarriageBy.value}</Text></View>
                  <View style={styles.innerBox}><Text style={styles.label}>Place of Receipt</Text><Text>{data.placeOfReceipt.value}</Text></View>
                </View>
                <View style={styles.splitRow}>
                  <View style={[ styles.innerBox, styles.borderRight ]}><Text style={styles.label}>Vessel/Flight No.</Text><Text>{data.vesselFlightNo.value}</Text></View>
                  <View style={styles.innerBox}><Text style={styles.label}>Port of Loading</Text><Text>{data.portOfLoading.value}</Text></View>
                </View>
                <View style={styles.flexRow}>
                  <View style={[ styles.innerBox, styles.borderRight ]}><Text style={styles.label}>Port of Discharge</Text><Text>{data.portOfDischarge.value}</Text></View>
                  <View style={styles.innerBox}><Text style={styles.label}>Final Destination</Text><Text>{data.finalDestination.value}</Text></View>
                </View>
              </View>

              {/* Right 50%: Countries + Terms Box */}
              <View style={styles.rightPillar}>
                <View style={styles.splitRow}>
                  <View style={[ styles.innerBox, styles.borderRight ]}><Text style={styles.label}>Country of Origin</Text><Text>{data.countryOfOrigin.value}</Text></View>
                  <View style={styles.innerBox}><Text style={styles.label}>Country of Destination</Text><Text>{data.countryOfDestination.value}</Text></View>
                </View>
                <View style={{ padding: 4 }}>
                  <Text style={styles.label}>Terms of Delivery and Payment</Text>
                  <Text style={styles.value}>{data.terms.value}</Text>
                </View>
              </View>
            </View>

            {/* ITEM TABLE HEADER */}
            <View style={[ styles.flexRow, { backgroundColor: '#F0F0F0', borderBottom: '1pt solid black' } ]}>
              <Text style={[ styles.cellNoBottom, styles.c1 ]}>Marks & No.</Text>
              <Text style={[ styles.cellNoBottom, styles.c2 ]}>No. & Pkgs</Text>
              <Text style={[ styles.cellNoBottom, styles.c3 ]}>SR</Text>
              <Text style={[ styles.cellNoBottom, styles.c4 ]}>Description of Goods</Text>
              <Text style={[ styles.cellNoBottom, styles.c5 ]}>QTY</Text>
              <Text style={[ styles.cellNoBottom, styles.c6 ]}>Net Wt</Text>
              <Text style={[ styles.cellNoBottom, styles.c7 ]}>Gross</Text>
              <Text style={[ styles.cellNoBottom, styles.c8 ]}>Dim</Text>
            </View>

            {/* DYNAMIC ROWS */}
            {data.tableRows.map((row, i) => (
                <View key={i} style={[ styles.flexRow, { borderBottom: '0.5pt solid #AAA' } ]}>
                  <Text style={[ styles.cellNoBottom, styles.c1 ]}>{row[0]}</Text>
                  <Text style={[ styles.cellNoBottom, styles.c2 ]}>{row[1]}</Text>
                  <Text style={[ styles.cellNoBottom, styles.c3 ]}>{row[2] || i + 1}</Text>
                  <Text style={[ styles.cellNoBottom, styles.c4 ]}>{row[3]}</Text>
                  <Text style={[ styles.cellNoBottom, styles.c5 ]}>{row[4]}</Text>
                  <Text style={[ styles.cellNoBottom, styles.c6 ]}>{row[5]}</Text>
                  <Text style={[ styles.cellNoBottom, styles.c7 ]}>{row[6]}</Text>
                  <Text style={[ styles.cellNoBottom, styles.c8 ]}>{row[7]}</Text>
                </View>
            ))}

            {/* SIGNATURE FOOTER */}
            <View style={[ styles.flexRow, { borderTop: '1pt solid black', minHeight: 80 } ]}>
              <View style={[ styles.leftPillar, { padding: 0 } ]}>
                <View style={styles.cell}><Text style={styles.label}>Total Pkgs: {data.totalPackages.value}</Text></View>
                <View style={[ styles.flexRow, { borderBottom: '1pt solid black' } ]}>
                  <View style={[ styles.innerBox, styles.borderRight ]}><Text style={styles.label}>Net Wt: {data.netWeight.value}</Text></View>
                  <View style={styles.innerBox}><Text style={styles.label}>Gross Wt: {data.grossWeight.value}</Text></View>
                </View>
                <View style={{ padding: 4 }}><Text style={styles.label}>Total Weight: {data.totalWeight.value}</Text></View>
              </View>
              <View style={[ styles.rightPillar, { textAlign: 'center', justifyContent: 'space-between', padding: 5 } ]}>
                <Text style={styles.label}>For {data.authorizedBy.value}</Text>
                <Text style={[ styles.label, { marginBottom: 5 } ]}>Authorised Signatory</Text>
              </View>
            </View>

          </View>
        </Page>
      </Document>
  )
}

const PdfPreview = React.memo(({ data }) => (
    <PDFViewer style={{ width: '100%', height: '100%' }}>
      <PackingListPdf data={data}/>
    </PDFViewer>
))

const defaultData = {
  title: { value: 'PACKING LIST', visible: true },
  exporterLines: [
    { value: 'UNIQUE WAVES', visible: true },
    { value: '32 INDRAPRASTH COMPLEX, NAGINA WADI', visible: true },
    { value: 'ALKAPURI ROAD, SURAT-395006', visible: true },
    { value: 'GUJARAT, INDIA.', visible: true },
    { value: 'TEL.: +91-95375 15827', visible: true },
    { value: 'gauravmistry1413@gmail.com', visible: true }
  ],
  packingListNo: { value: '', visible: true },
  date: { value: '', visible: true },
  buyersOrder: { value: '', visible: true },
  exportRef: { value: '', visible: true },
  iec: { value: 'AAFFU9324C', visible: true },
  gstin: { value: '24AAFFU9324C1ZC', visible: true },
  consignee: { value: '', visible: true },
  notifyBuyer: { value: '', visible: true },
  contact: { value: '', visible: true },
  tel: { value: '', visible: true },
  countryOfOrigin: { value: '', visible: true },
  countryOfDestination: { value: '', visible: true },
  preCarriageBy: { value: '', visible: true },
  placeOfReceipt: { value: '', visible: true },
  terms: { value: '', visible: true },
  vesselFlightNo: { value: '', visible: true },
  portOfLoading: { value: '', visible: true },
  portOfDischarge: { value: '', visible: true },
  finalDestination: { value: '', visible: true },
  tableHeaders: [
    'Marks & No.',
    'No. & Type of Packages',
    'SR NO',
    'Description of Goods',
    'QTY',
    'NET Weight',
    'Gross Weight',
    'DIMENSION'
  ],
  tableRows: [ [ '', '', '', '', '', '', '', '' ] ],
  totalPackages: { value: '', visible: true },
  netWeight: { value: '', visible: true },
  grossWeight: { value: '', visible: true },
  totalWeight: { value: '', visible: true },
  authorizedBy: { value: 'UNIQUE WAVES', visible: true }
}

const SectionTitle = ({ children }) => (
    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
      {children}
    </Typography>
)

const FieldToggle = ({ label, value, visible, onChange, onToggle, multiline }) => (
    <Stack direction="row" spacing={1} alignItems="center">
      <FormControlLabel control={<Checkbox checked={visible} onChange={onToggle}/>} label=""/>
      <TextField label={label} value={value} onChange={onChange} fullWidth multiline={multiline}/>
    </Stack>
)

export default function PackingListDocument() {
  const theme = useTheme()
  const navigate = useNavigate()
  const params = useParams()
  const invoiceId = params?.id
  const [ data, setData ] = useState(defaultData)
  const [ pdfData, setPdfData ] = useState(defaultData)
  const [ isSaving, setIsSaving ] = useState(false)

  const formatDateForSave = (value) => {
    if (!value) return ''
    const [ yyyy, mm, dd ] = String(value).split('-')
    if (!yyyy || !mm || !dd) return value
    return `${dd}-${mm}-${yyyy}`
  }

  const updateField = (field) => (event) => {
    setData((prev) => ({ ...prev, [field]: { ...prev[field], value: event.target.value } }))
  }

  const toggleField = (field) => (event) => {
    setData((prev) => ({ ...prev, [field]: { ...prev[field], visible: event.target.checked } }))
  }

  const updateExporterLine = (index) => (event) => {
    setData((prev) => {
      const next = [ ...(prev.exporterLines || []) ]
      next[index] = { ...next[index], value: event.target.value }
      return { ...prev, exporterLines: next }
    })
  }

  const toggleExporterLine = (index) => (event) => {
    setData((prev) => {
      const next = [ ...(prev.exporterLines || []) ]
      next[index] = { ...next[index], visible: event.target.checked }
      return { ...prev, exporterLines: next }
    })
  }

  const addExporterLine = () => {
    setData((prev) => ({
      ...prev,
      exporterLines: [ ...(prev.exporterLines || []), { value: '', visible: true } ]
    }))
  }

  const removeExporterLine = (index) => {
    setData((prev) => {
      const next = [ ...(prev.exporterLines || []) ]
      next.splice(index, 1)
      return { ...prev, exporterLines: next }
    })
  }

  const updateTableCell = (rowIndex, colIndex) => (event) => {
    const value = event.target.value
    setData((prev) => {
      const nextRows = [ ...(prev.tableRows || []) ]
      const nextRow = [ ...(nextRows[rowIndex] || []) ]
      nextRow[colIndex] = value
      nextRows[rowIndex] = nextRow
      return { ...prev, tableRows: nextRows }
    })
  }

  const addTableRow = () => {
    setData((prev) => ({
      ...prev,
      tableRows: [ ...(prev.tableRows || []), new Array(prev.tableHeaders.length).fill('') ]
    }))
  }

  const removeTableRow = (index) => {
    setData((prev) => {
      const next = [ ...(prev.tableRows || []) ]
      next.splice(index, 1)
      return { ...prev, tableRows: next }
    })
  }

  const tableColumnCount = useMemo(() => Math.max(1, data.tableHeaders.length), [ data.tableHeaders.length ])

  useEffect(() => {
    const handle = setTimeout(() => {
      setPdfData(data)
    }, 500)
    return () => clearTimeout(handle)
  }, [ data ])

  useEffect(() => {
    let isActive = true
    const loadInvoice = async () => {
      // if (!invoiceId) {
      //   try {
      //     const byTemplate = await axiosInstance.get('/v1/invoice/by-template/packing')
      //     if (!isActive) return
      //     const existing = byTemplate?.data
      //     if (existing?._id) {
      //       navigate(`/packing/${existing._id}`, { replace: true })
      //       return
      //     }
      //   } catch (error) {
      //     // ignore and fall back to default
      //   }
      //   setData(defaultData)
      //   setPdfData(defaultData)
      //   return
      // }

      if (invoiceId) {
        try {
          const response = await axiosInstance.get(`/v1/invoice/${invoiceId}`)
          if (!isActive) return
          const invoice = response?.data || {}
          const normalizeDateValue = (value) => {
            if (!value) return ''
            if (typeof value === 'string') return value.split('T')[0]
            if (value instanceof Date && !Number.isNaN(value.getTime())) {
              return value.toISOString().slice(0, 10)
            }
            if (typeof value === 'object' && value.value) return value.value
            return ''
          }
          const coerceDateField = (value, fallbackVisible) => {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
              return { ...value, value: normalizeDateValue(value.value || value) }
            }
            return { value: normalizeDateValue(value), visible: fallbackVisible }
          }
          const merged = {
            ...defaultData,
            ...(invoice?.data || {})
          }
          merged.date = coerceDateField(invoice?.data?.date ?? invoice?.date, defaultData.date.visible)
          setData(merged)
          setPdfData(merged)
        } catch (error) {
          if (!isActive) return
          setData(defaultData)
          setPdfData(defaultData)
        }
      }
    }

    loadInvoice()
    return () => {
      isActive = false
    }
  }, [ invoiceId ])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const { date, ...restOfState } = data
      const payloadDate = formatDateForSave(date?.value || '')
      const payload = { _id: invoiceId, date: payloadDate, type: 'packing', ...restOfState }
      const response = await axiosInstance.post('/v1/invoice/save', payload)
      const savedInvoice = response?.data
      if (savedInvoice?._id && !invoiceId) {
        navigate(`/packing/${savedInvoice._id}`, { replace: true })
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
      <MainCard
          title="Packaging"
          secondary={(
              <Button sx={{ backgroundColor : theme.palette.secondary.main }} variant="contained" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
          )}
      >
        <Grid container spacing={2} alignItems="flex-start">
          <Grid item xs={12} md={7}>
            <Box
                sx={{
                  position: { md: 'sticky' },
                  top: { md: 24 },
                  height: { xs: '70vh', md: '85vh' },
                  border: '1px solid',
                  borderColor: 'divider'
                }}
            >
              <PdfPreview data={pdfData}/>
            </Box>
          </Grid>

          <Grid item xs={12} md={5}>
            <Box sx={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto', pr: { md: 1 } }}>
              <Stack spacing={2}>
                <Typography variant="body2" color="textSecondary">
                  Toggle any field to show/hide it in the PDF, and edit values inline.
                </Typography>

                <SectionTitle>Title</SectionTitle>
                <FieldToggle
                    label="Document Title"
                    value={data.title.value}
                    visible={data.title.visible}
                    onChange={updateField('title')}
                    onToggle={toggleField('title')}
                />

                <Divider/>

                <SectionTitle>Exporter</SectionTitle>
                {data.exporterLines.map((line, index) => (
                    <Stack key={`exporter-${index}`} direction="row" spacing={1} alignItems="center">
                      <FormControlLabel
                          control={<Checkbox checked={line.visible} onChange={toggleExporterLine(index)}/>}
                          label=""
                      />
                      <TextField label={`Exporter Line ${index + 1}`} value={line.value} onChange={updateExporterLine(index)} fullWidth/>
                      <IconButton aria-label="remove" onClick={() => removeExporterLine(index)} size="large">
                        <IconTrash size="1.1rem" color={theme.palette.error.dark}/>
                      </IconButton>
                    </Stack>
                ))}
                <Button sx={{ color: theme.palette.secondary.dark }} variant="outlined" startIcon={<IconPlus/>} onClick={addExporterLine}>
                  Add Exporter Line
                </Button>

                <Divider/>

                <SectionTitle>Packing Details</SectionTitle>
                <FieldToggle label="Packing List No" value={data.packingListNo.value} visible={data.packingListNo.visible} onChange={updateField('packingListNo')}
                             onToggle={toggleField('packingListNo')}/>
                <FieldToggle label="Date" value={data.date.value} visible={data.date.visible} onChange={updateField('date')} onToggle={toggleField('date')}/>
                <FieldToggle label="Buyer's Order No & Date" value={data.buyersOrder.value} visible={data.buyersOrder.visible} onChange={updateField('buyersOrder')}
                             onToggle={toggleField('buyersOrder')}/>
                <FieldToggle label="Export Ref" value={data.exportRef.value} visible={data.exportRef.visible} onChange={updateField('exportRef')} onToggle={toggleField('exportRef')}/>
                <FieldToggle label="IEC" value={data.iec.value} visible={data.iec.visible} onChange={updateField('iec')} onToggle={toggleField('iec')}/>
                <FieldToggle label="GSTIN" value={data.gstin.value} visible={data.gstin.visible} onChange={updateField('gstin')} onToggle={toggleField('gstin')}/>

                <Divider/>

                <SectionTitle>Parties</SectionTitle>
                <FieldToggle label="Consignee" value={data.consignee.value} visible={data.consignee.visible} onChange={updateField('consignee')} onToggle={toggleField('consignee')} multiline/>
                <FieldToggle label="Notify/Buyer" value={data.notifyBuyer.value} visible={data.notifyBuyer.visible} onChange={updateField('notifyBuyer')} onToggle={toggleField('notifyBuyer')}
                             multiline/>

                <Divider/>

                <SectionTitle>Contact & Origin</SectionTitle>
                <FieldToggle label="Contact" value={data.contact.value} visible={data.contact.visible} onChange={updateField('contact')} onToggle={toggleField('contact')}/>
                <FieldToggle label="Tel" value={data.tel.value} visible={data.tel.visible} onChange={updateField('tel')} onToggle={toggleField('tel')}/>
                <FieldToggle label="Country of Origin" value={data.countryOfOrigin.value} visible={data.countryOfOrigin.visible} onChange={updateField('countryOfOrigin')}
                             onToggle={toggleField('countryOfOrigin')}/>
                <FieldToggle label="Country of Destination" value={data.countryOfDestination.value} visible={data.countryOfDestination.visible} onChange={updateField('countryOfDestination')}
                             onToggle={toggleField('countryOfDestination')}/>

                <Divider/>

                <SectionTitle>Shipment</SectionTitle>
                <FieldToggle label="Pre-Carriage By" value={data.preCarriageBy.value} visible={data.preCarriageBy.visible} onChange={updateField('preCarriageBy')}
                             onToggle={toggleField('preCarriageBy')}/>
                <FieldToggle label="Place of Receipt" value={data.placeOfReceipt.value} visible={data.placeOfReceipt.visible} onChange={updateField('placeOfReceipt')}
                             onToggle={toggleField('placeOfReceipt')}/>
                <FieldToggle label="Terms of Delivery & Payment" value={data.terms.value} visible={data.terms.visible} onChange={updateField('terms')} onToggle={toggleField('terms')}/>
                <FieldToggle label="Vessel/Flight No" value={data.vesselFlightNo.value} visible={data.vesselFlightNo.visible} onChange={updateField('vesselFlightNo')}
                             onToggle={toggleField('vesselFlightNo')}/>
                <FieldToggle label="Port of Loading" value={data.portOfLoading.value} visible={data.portOfLoading.visible} onChange={updateField('portOfLoading')}
                             onToggle={toggleField('portOfLoading')}/>
                <FieldToggle label="Port of Discharge" value={data.portOfDischarge.value} visible={data.portOfDischarge.visible} onChange={updateField('portOfDischarge')}
                             onToggle={toggleField('portOfDischarge')}/>
                <FieldToggle label="Final Destination" value={data.finalDestination.value} visible={data.finalDestination.visible} onChange={updateField('finalDestination')}
                             onToggle={toggleField('finalDestination')}/>

                <Divider/>

                <SectionTitle>Items Table</SectionTitle>
                {data.tableRows.map((row, rowIndex) => (
                    <Box key={`row-${rowIndex}`}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="subtitle2">Row {rowIndex + 1}</Typography>
                        <IconButton aria-label="remove" onClick={() => removeTableRow(rowIndex)} size="large">
                          <IconTrash size="1.1rem" color={theme.palette.error.dark}/>
                        </IconButton>
                      </Stack>
                      <Grid container spacing={1}>
                        {new Array(tableColumnCount).fill(null).map((_, colIndex) => (
                            <Grid key={`cell-${rowIndex}-${colIndex}`} item xs={12} sm={6}>
                              <TextField
                                  label={`${data.tableHeaders[colIndex]} (Row ${rowIndex + 1})`}
                                  value={row[colIndex] || ''}
                                  onChange={updateTableCell(rowIndex, colIndex)}
                                  fullWidth
                              />
                            </Grid>
                        ))}
                      </Grid>
                    </Box>
                ))}
                <Button sx={{ color: theme.palette.secondary.dark }} variant="outlined" startIcon={<IconPlus/>} onClick={addTableRow}>
                  Add Table Row
                </Button>

                <Divider/>

                <SectionTitle>Totals & Signature</SectionTitle>
                <FieldToggle label="Total Packages" value={data.totalPackages.value} visible={data.totalPackages.visible} onChange={updateField('totalPackages')}
                             onToggle={toggleField('totalPackages')}/>
                <FieldToggle label="Net Weight" value={data.netWeight.value} visible={data.netWeight.visible} onChange={updateField('netWeight')} onToggle={toggleField('netWeight')}/>
                <FieldToggle label="Gross Weight" value={data.grossWeight.value} visible={data.grossWeight.visible} onChange={updateField('grossWeight')} onToggle={toggleField('grossWeight')}/>
                <FieldToggle label="Total Weight" value={data.totalWeight.value} visible={data.totalWeight.visible} onChange={updateField('totalWeight')} onToggle={toggleField('totalWeight')}/>
                <FieldToggle label="Authorized By" value={data.authorizedBy.value} visible={data.authorizedBy.visible} onChange={updateField('authorizedBy')} onToggle={toggleField('authorizedBy')}/>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </MainCard>
  )
}
