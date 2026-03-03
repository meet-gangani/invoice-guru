import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import { IconPlus, IconTrash } from '@tabler/icons'
import { Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer'
import MainCard from 'ui-component/cards/MainCard'

const styles = StyleSheet.create({
  page: {
    paddingTop: 45,
    paddingBottom: 65,
    paddingHorizontal: 45,
    fontSize: 10,
    lineHeight: 1.5,
    fontFamily: 'Helvetica',
    color: '#333'
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 5
  },
  brandName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4B4B9E',
    letterSpacing: 1,
    lineHeight: 1.2
  },
  contactSection: {
    textAlign: 'right',
    fontSize: 9,
    color: '#4B4B9E'
  },
  blueLine: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#4B4B9E',
    marginTop: 8,
    marginBottom: 36
  },
  dateText: { marginBottom: 20 },
  addressSection: { marginBottom: 15, width: '70%' },
  subject: {
    fontWeight: 'bold',
    marginBottom: 15
  },
  bodyParagraph: { marginBottom: 12, textAlign: 'justify' },
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 20
  },
  tableRow: { flexDirection: 'row', minHeight: 25, alignItems: 'center' },
  tableHeaderRow: { backgroundColor: '#fff', minHeight: 32 },
  tableCol: {
    width: '25%',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    height: '100%',
    padding: 5
  },
  tableCellHeader: { fontWeight: 'bold', fontSize: 9 },
  tableCell: { fontSize: 9 },
  footerLine: {
    position: 'absolute',
    bottom: 60,
    left: 45,
    right: 45,
    borderBottomWidth: 1,
    borderBottomColor: '#4B4B9E'
  },
  footerText: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 9,
    color: '#4B4B9E'
  },
  signature: { marginTop: 40, fontWeight: 'bold' }
})

const ScometPdf = ({ data }) => {
  const formatDate = (value) => {
    if (!value) return ''
    const [yyyy, mm, dd] = value.split('-')
    if (!yyyy || !mm || !dd) return value
    return `${dd}-${mm}-${yyyy}`
  }
  const tableHeaders = data.tableHeaders.filter((h) => h.trim() !== '')
  const visibleColumns = tableHeaders.length || 4
  const columnWidth = `${100 / visibleColumns}%`

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerContainer}>
          <Text style={styles.brandName}>{data.brandName || '__________'}</Text>
          <View style={styles.contactSection}>
            {(data.contactLines || []).map((line, index) => (
              <Text key={`contact-${index}`}>{line || '__________'}</Text>
            ))}
          </View>
        </View>
        <View style={styles.blueLine} />

        <Text style={styles.dateText}>Date: {formatDate(data.date) || '__________'}</Text>

        <View style={styles.addressSection}>
          {(data.addressLines || []).map((line, index) => (
            <Text key={`address-${index}`}>{line || '__________'}</Text>
          ))}
        </View>

        <Text style={styles.subject}>{data.subjectLine || '__________'}</Text>

        {(data.bodyLines || []).map((line, index) => (
          <Text key={`body-${index}`} style={styles.bodyParagraph}>
            {line || '__________'}
          </Text>
        ))}

        {data.tableTitle ? <Text style={{ marginBottom: 5 }}>{data.tableTitle}</Text> : null}

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            {tableHeaders.map((header, index) => (
              <View
                key={`header-${index}`}
                style={[
                  styles.tableCol,
                  { width: columnWidth, borderRightWidth: index === tableHeaders.length - 1 ? 0 : 1 }
                ]}
              >
                <Text style={styles.tableCellHeader}>{header || 'HEADER'}</Text>
              </View>
            ))}
          </View>
          {(data.tableRows || []).map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.tableRow}>
              {tableHeaders.map((_, colIndex) => (
                <View
                  key={`cell-${rowIndex}-${colIndex}`}
                  style={[
                    styles.tableCol,
                    {
                      width: columnWidth,
                      borderBottomWidth: rowIndex === data.tableRows.length - 1 ? 0 : 1,
                      borderRightWidth: colIndex === tableHeaders.length - 1 ? 0 : 1
                    }
                  ]}
                >
                  <Text style={styles.tableCell}>{row[colIndex] || '-'}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {(data.afterTableLines || []).map((line, index) => (
          <Text key={`after-${index}`} style={styles.bodyParagraph}>
            {line || '__________'}
          </Text>
        ))}

        <Text style={styles.signature}>{data.signatureLine || '__________'}</Text>

        <View style={styles.footerLine} />
        <Text style={styles.footerText}>{data.footerLine || '__________'}</Text>
      </Page>
    </Document>
  )
}

const PdfPreview = React.memo(({ data }) => (
  <PDFViewer style={{ width: '100%', height: '100%' }}>
    <ScometPdf data={data} />
  </PDFViewer>
))

const defaultData = {
  brandName: 'UNIQUE WAVES',
  contactLines: [ 'Mo. +91 86900 45693, +91 95375 15827', 'E-mail: uniquewaves77@gmail.com' ],
  date: '',
  addressLines: [ 'To, The Assistant commissioner of customs - exports Sahar Cargo Complex - Mumbai, India' ],
  subjectLine:
    'Sub: Scomet declaration  Ref: Invoice No: ________  Date: ________  Dest: ________',
  bodyLines: [
    'Dear Sir / Madam,',
    'Refer to the above mentioned export invoice number, which is to be exported to ________. We hereby certify that m/s. UNIQUE WAVES having iec no.: ________ and is ________ which is used for measurement & evaluate of gem.',
    'We declare that the said shipment under invoice no. ________.'
  ],
  tableTitle: 'Shipment Details',
  tableHeaders: [ 'INVOICE NO', 'COUNTRY', 'MODE OF EXPORT', 'MATERIAL' ],
  tableRows: [ [ 'XXXXXXXX', 'USA', 'AIR', 'GEMSTONES' ] ],
  afterTableLines: [
    'As per para no. of scomet list (appendix-3) our product does not fall under scomet list (materials, processing equipment and related technologies) vide notification no. 37 (re 2012)/2009 - 2014 dated 14/03/2019 issued under the foreign trade development and regulation act 1992.',
    'The above declaration is true and correct',
    'Thanking You'
  ],
  signatureLine: 'FOR UNIQUE WAVES',
  footerLine:
    'Office No 102, 1st floor Prabhu Prasad Building, Nr. SRK House, Kasa Nagar Main Road, Katargam - 395004, Surat - Gujarat.'
}

const SectionTitle = ({ children }) => (
  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
    {children}
  </Typography>
)

export default function ScometDocument() {
  const [data, setData] = useState(defaultData)
  const [pdfData, setPdfData] = useState(defaultData)

  const updateField = (field) => (event) => {
    setData((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const normalizeHeader = (value = '') => value.trim().toUpperCase()

  const sanitizeAlphaNumUpper = (value) => value.replace(/[^a-z0-9]/gi, '').toUpperCase()

  const updateArrayField = (field, index) => (event) => {
    setData((prev) => {
      const next = [ ...(prev[field] || []) ]
      next[index] = event.target.value
      return { ...prev, [field]: next }
    })
  }

  const addArrayItem = (field, value = '') => {
    setData((prev) => ({ ...prev, [field]: [ ...(prev[field] || []), value ] }))
  }

  const removeArrayItem = (field, index) => {
    setData((prev) => {
      const next = [ ...(prev[field] || []) ]
      next.splice(index, 1)
      return { ...prev, [field]: next }
    })
  }

  const tableColumnCount = useMemo(
    () => Math.max(1, data.tableHeaders.filter((h) => h.trim() !== '').length),
    [ data.tableHeaders ]
  )

  const createEmptyRow = () => {
    const headers = data.tableHeaders || []
    return headers.map((header) => (normalizeHeader(header) === 'MODE OF EXPORT' ? 'AIR' : ''))
  }

  useEffect(() => {
    const handle = setTimeout(() => {
      setPdfData(data)
    }, 500)
    return () => clearTimeout(handle)
  }, [ data ])

  return (
    <MainCard title="SCOMET Declaration (Dynamic)">
      <Grid container spacing={2} alignItems="flex-start">
        <Grid item xs={12} md={5}>
          <Box sx={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto', pr: { md: 1 } }}>
            <Stack spacing={2}>
            <Typography variant="body2" color="textSecondary">
              Edit any line below to update the PDF. Add or remove rows and sections as needed.
            </Typography>

            <SectionTitle>Header</SectionTitle>
            <TextField label="Brand Name" value={data.brandName} onChange={updateField('brandName')} fullWidth />
            {data.contactLines.map((line, index) => (
              <Stack key={`contact-${index}`} direction="row" spacing={1} alignItems="center">
                <TextField
                  label={`Contact Line ${index + 1}`}
                  value={line}
                  onChange={updateArrayField('contactLines', index)}
                  fullWidth
                />
                <IconButton aria-label="remove" onClick={() => removeArrayItem('contactLines', index)} size="large">
                  <IconTrash size="1.1rem" />
                </IconButton>
              </Stack>
            ))}
            <Button variant="outlined" startIcon={<IconPlus />} onClick={() => addArrayItem('contactLines')}>
              Add Contact Line
            </Button>

            <Divider />

            <SectionTitle>Address & Subject</SectionTitle>
            <TextField
              label="Date"
              type="date"
              value={data.date}
              onChange={updateField('date')}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            {data.addressLines.map((line, index) => (
              <Stack key={`address-${index}`} direction="row" spacing={1} alignItems="center">
                <TextField
                  label={`Address Line ${index + 1}`}
                  value={line}
                  onChange={updateArrayField('addressLines', index)}
                  fullWidth
                />
                <IconButton aria-label="remove" onClick={() => removeArrayItem('addressLines', index)} size="large">
                  <IconTrash size="1.1rem" />
                </IconButton>
              </Stack>
            ))}
            <Button variant="outlined" startIcon={<IconPlus />} onClick={() => addArrayItem('addressLines')}>
              Add Address Line
            </Button>
            <TextField label="Subject Line" value={data.subjectLine} onChange={updateField('subjectLine')} fullWidth multiline />

            <Divider />

            <SectionTitle>Body</SectionTitle>
            {data.bodyLines.map((line, index) => (
              <Stack key={`body-${index}`} direction="row" spacing={1} alignItems="center">
                <TextField
                  label={`Body Line ${index + 1}`}
                  value={line}
                  onChange={updateArrayField('bodyLines', index)}
                  fullWidth
                  multiline
                />
                <IconButton aria-label="remove" onClick={() => removeArrayItem('bodyLines', index)} size="large">
                  <IconTrash size="1.1rem" />
                </IconButton>
              </Stack>
            ))}
            <Button variant="outlined" startIcon={<IconPlus />} onClick={() => addArrayItem('bodyLines')}>
              Add Body Line
            </Button>

            <Divider />

            <SectionTitle>Invoice Table</SectionTitle>
            <TextField label="Table Title" value={data.tableTitle} onChange={updateField('tableTitle')} fullWidth />
            {data.tableHeaders.map((header, index) => (
              <Stack key={`header-${index}`} direction="row" spacing={1} alignItems="center">
                <TextField
                  label={`Header ${index + 1}`}
                  value={header}
                  onChange={updateArrayField('tableHeaders', index)}
                  fullWidth
                />
                <IconButton aria-label="remove" onClick={() => removeArrayItem('tableHeaders', index)} size="large">
                  <IconTrash size="1.1rem" />
                </IconButton>
              </Stack>
            ))}
            <Button variant="outlined" startIcon={<IconPlus />} onClick={() => addArrayItem('tableHeaders', `Header ${tableColumnCount + 1}`)}>
              Add Table Column
            </Button>

            {data.tableRows.map((row, rowIndex) => (
              <Box key={`row-${rowIndex}`}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <SectionTitle>Row {rowIndex + 1}</SectionTitle>
                  <IconButton aria-label="remove" onClick={() => removeArrayItem('tableRows', rowIndex)} size="large">
                    <IconTrash size="1.1rem" />
                  </IconButton>
                </Stack>
                <Grid container spacing={1}>
                  {data.tableHeaders.map((_, colIndex) => (
                    <Grid key={`cell-${rowIndex}-${colIndex}`} item xs={12} sm={6}>
                      {normalizeHeader(data.tableHeaders[colIndex]) === 'MODE OF EXPORT' ? (
                        <FormControl fullWidth>
                          <Select
                            value={row[colIndex] || ''}
                            displayEmpty
                            onChange={(event) => {
                              const value = String(event.target.value).toUpperCase()
                              setData((prev) => {
                                const nextRows = [ ...(prev.tableRows || []) ]
                                const nextRow = [ ...(nextRows[rowIndex] || []) ]
                                nextRow[colIndex] = value
                                nextRows[rowIndex] = nextRow
                                return { ...prev, tableRows: nextRows }
                              })
                            }}
                          >
                            <MenuItem value="AIR">AIR</MenuItem>
                            <MenuItem value="SHIP">SHIP</MenuItem>
                          </Select>
                        </FormControl>
                      ) : (
                        <TextField
                          label={`Row ${rowIndex + 1} Col ${colIndex + 1}`}
                          value={row[colIndex] || ''}
                          onChange={(event) => {
                            const rawValue = event.target.value
                            const nextValue =
                              normalizeHeader(data.tableHeaders[colIndex]) === 'INVOICE NO'
                                ? sanitizeAlphaNumUpper(rawValue)
                                : rawValue
                            setData((prev) => {
                              const nextRows = [ ...(prev.tableRows || []) ]
                              const nextRow = [ ...(nextRows[rowIndex] || []) ]
                              nextRow[colIndex] = nextValue
                              nextRows[rowIndex] = nextRow
                              return { ...prev, tableRows: nextRows }
                            })
                          }}
                          fullWidth
                        />
                      )}
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}
            <Button
              variant="outlined"
              startIcon={<IconPlus />}
              onClick={() => addArrayItem('tableRows', createEmptyRow())}
            >
              Add Table Row
            </Button>

            <Divider />

            <SectionTitle>After Table</SectionTitle>
            {data.afterTableLines.map((line, index) => (
              <Stack key={`after-${index}`} direction="row" spacing={1} alignItems="center">
                <TextField
                  label={`Line ${index + 1}`}
                  value={line}
                  onChange={updateArrayField('afterTableLines', index)}
                  fullWidth
                  multiline
                />
                <IconButton aria-label="remove" onClick={() => removeArrayItem('afterTableLines', index)} size="large">
                  <IconTrash size="1.1rem" />
                </IconButton>
              </Stack>
            ))}
            <Button variant="outlined" startIcon={<IconPlus />} onClick={() => addArrayItem('afterTableLines')}>
              Add Line
            </Button>

            <Divider />

            <SectionTitle>Footer</SectionTitle>
            <TextField label="Signature Line" value={data.signatureLine} onChange={updateField('signatureLine')} fullWidth />
            <TextField label="Footer Line" value={data.footerLine} onChange={updateField('footerLine')} fullWidth multiline />
            </Stack>
          </Box>
        </Grid>

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
            <PdfPreview data={pdfData} />
          </Box>
        </Grid>
      </Grid>
    </MainCard>
  )
}
