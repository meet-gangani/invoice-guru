import React, { useEffect, useRef, useState } from 'react'
import { Box, Button, Divider, FormControl, Grid, IconButton, MenuItem, Select, Stack, TextField, Typography } from '@mui/material'
import { IconPlus, IconTrash } from '@tabler/icons'
import { Document, Page, PDFViewer, StyleSheet, Text, View, Image } from '@react-pdf/renderer'
import MainCard from 'ui-component/cards/MainCard'
import { useTheme } from '@mui/material/styles'
import { useNavigate, useParams } from 'react-router-dom'
import axiosInstance from '../../services/axiosInstance'
import EndpointService from '../../services/endpoint.service'
import EntityAutocomplete from 'components/EntityAutocomplete'
import { getStoredCompanyId, setStoredCompanyId } from 'utils/entitySelectionStorage'

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
    fontSize: 18,
    marginBottom: 'auto',
    fontWeight: 'bold',
    color: '#4B4B9E',
    letterSpacing: 1,
    lineHeight: 1.2
  },
  contactSection: {
    textAlign: 'right',
    fontSize: 9,
    color: '#4B4B9E',
    lineHeight: 1.2
  },
  blueLine: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#4B4B9E',
    marginTop: 8,
    marginBottom: 2
  },
  dateText: { marginBottom: 20, marginTop: 10 },
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
  footerContainer: {
    position: 'absolute',
    bottom: 30, // Position from page bottom
    left: 45,
    right: 45,
    display: 'flex',
    flexDirection: 'column', // Stack line on top of text
    alignItems: 'center',    // Center children horizontally
  },
  footerLine: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#4B4B9E',
    marginBottom: 4,         // Space between line and text
  },
  footerText: {
    maxWidth: '90%',
    textAlign: 'center',
    fontSize: 9,
    color: '#4B4B9E',
    lineHeight: 1.4
  },
  signatureContainer: {
    alignItems: 'flex-start', // This ensures left alignment
    display: 'flex',
    flexDirection: 'column'
  },
  signature: {
    fontWeight: 'bold',
    marginTop: 5,
    fontSize: 10
  },
  stampImage: {
    height: 70,
    width: 'auto',
    objectFit: 'contain',
    marginBottom: 5
  },
  signImage: {
    height: 70,
    width: 'auto',
    objectFit: 'contain',
    marginBottom: 5
  }
})

const ScometPdf = ({ data }) => {
  const formatDate = (value) => {
    if (!value) return ''
    const raw = String(value).split('T')[0]
    const ddmmyyyy = raw.match(/^(\d{2})-(\d{2})-(\d{4})$/)
    if (ddmmyyyy) return raw
    const [ yyyy, mm, dd ] = raw.split('-')
    if (!yyyy || !mm || !dd) return value
    return `${dd}-${mm}-${yyyy}`
  }
  const tableHeaders = data.tableHeaders.filter((h) => h.trim() !== '')
  const visibleColumns = tableHeaders.length || 4
  const columnWidth = `${100 / visibleColumns}%`
  const wrapUnbroken = (value, chunkSize = 12) => {
    const text = String(value ?? '')
    if (!text) return ''
    if (/\s/.test(text)) return text
    const chunks = text.match(new RegExp(`.{1,${chunkSize}}`, 'g'))
    return chunks ? chunks.join('\n') : text
  }

  return (
      <Document title="SCOMET Declaration">
        <Page size="A4" style={styles.page}>
          <View style={styles.headerContainer}>
            <Text style={styles.brandName}>{data.brandName || '__________'}</Text>
            <View style={styles.contactSection}>
              {(data.contactLines || []).map((line, index) => (
                  <Text key={`contact-${index}`}>{line || '__________'}</Text>
              ))}
            </View>
          </View>
          <View style={styles.blueLine}/>

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
            <View style={[ styles.tableRow, styles.tableHeaderRow ]}>
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
                        <Text style={styles.tableCell}>{wrapUnbroken(row[colIndex] || '-')}</Text>
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

          <View style={styles.signatureContainer}>
            {data?.company?.stamp && (
                <Image
                    style={styles.stampImage}
                    src={data.company.stamp}
                />
            )}

            {/*{data?.company?.sign && (*/}
            {/*    <Image*/}
            {/*        style={styles.signImage}*/}
            {/*        src={data.company.sign}*/}
            {/*    />*/}
            {/*)}*/}

            <Text style={styles.signature}>{data.signatureLine || '__________'}</Text>
          </View>

          <View style={styles.footerContainer}>
            <View style={styles.footerLine} />
            <Text style={styles.footerText}>
              {data.footerLine || '__________'}
            </Text>
          </View>
        </Page>
      </Document>
  )
}

const PdfPreview = React.memo(({ data }) => (
    <PDFViewer style={{ width: '100%', height: '100%' }}>
      <ScometPdf data={data}/>
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
  const theme = useTheme()
  const navigate = useNavigate()
  const params = useParams()
  const invoiceId = params?.id

  const [ data, setData ] = useState(defaultData)
  const [ pdfData, setPdfData ] = useState(defaultData)
  const [ isSaving, setIsSaving ] = useState(false)
  const [ isApproving, setIsApproving ] = useState(false)
  const [ isApproved, setIsApproved ] = useState(false)
  const [ hasSaved, setHasSaved ] = useState(false)
  const [ companies, setCompanies ] = useState([])
  const [ selectedCompanyId, setSelectedCompanyId ] = useState('')
  const [ companyValue, setCompanyValue ] = useState(null)
  const [ companyInputValue, setCompanyInputValue ] = useState('')
  const [ shouldApplyCompany, setShouldApplyCompany ] = useState(false)
  const [ hasLoadedInvoice, setHasLoadedInvoice ] = useState(false)
  const skipCompanySyncRef = useRef(false)

  const hydrateData = (nextData) => {
    setData(nextData)
    setPdfData(nextData)
  }

  const updateField = (field) => (event) => {
    setData((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const normalizeHeader = (value = '') => value.trim().toUpperCase()

  const sanitizeAlphaNumUpper = (value) => value.replace(/[^a-z0-9]/gi, '').toUpperCase()

  const formatDateForSave = (value) => {
    if (!value) return ''
    const raw = String(value).split('T')[0]
    const [ yyyy, mm, dd ] = raw.split('-')
    if (!yyyy || !mm || !dd) return value
    return `${dd}-${mm}-${yyyy}`
  }

  const normalizeDateInput = (value) => {
    if (!value) return ''
    const raw = String(value).split('T')[0]
    const match = raw.match(/^(\d{2})-(\d{2})-(\d{4})$/)
    if (!match) return raw
    const [ , dd, mm, yyyy ] = match
    return `${yyyy}-${mm}-${dd}`
  }

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

  const createEmptyRow = () => {
    const headers = data.tableHeaders || []
    return headers.map((header) => (normalizeHeader(header) === 'MODE OF EXPORT' ? 'AIR' : ''))
  }

  const splitToLines = (value) => {
    if (!value) return []
    const raw = String(value).trim()
    if (!raw) return []
    const byNewLine = raw.split('\n').map((line) => line.trim()).filter(Boolean)
    if (byNewLine.length > 1) return byNewLine
    return [ raw ]
  }

  const buildLines = (values) => values.filter(Boolean)

  const applyCompanyToForm = (company) => {
    if (!company) return
    const contactLines = buildLines([
      company.contactNumber || '',
      company.username || ''
    ])
    const addressLines = buildLines([
      ...splitToLines(company.address),
      company.pinCode ? `PIN: ${company.pinCode}` : ''
    ])
    setData((prev) => ({
      ...prev,
      brandName: company.name || '',
      contactLines: contactLines.length ? contactLines : prev.contactLines,
      // addressLines: addressLines.length ? addressLines : prev.addressLines,
      signatureLine: company.name ? `FOR ${company.name}` : prev.signatureLine,
      footerLine: company.address || prev.footerLine
    }))
  }

  const clearCompanyFromForm = () => {
    setData((prev) => ({
      ...prev,
      brandName: '',
      contactLines: [ '' ],
      addressLines: [ '' ],
      signatureLine: '',
      footerLine: ''
    }))
  }

  useEffect(() => {
    const handle = setTimeout(() => {
      setPdfData(data)
    }, 500)
    return () => clearTimeout(handle)
  }, [ data ])

  const fetchCompany = async () => {
    try {
      const response = await EndpointService.getCompanyMasterAccessibleList()
      const list = response?.companies || []
      setCompanies(list)
    } catch (error) {
      setCompanies([])
    }
  }

  useEffect(() => {
    fetchCompany()
  }, [])

  useEffect(() => {
    if (!selectedCompanyId || !companies.length) {
      setCompanyValue(null)
      setCompanyInputValue('')
      return
    }
    const match = companies.find((item) => item._id === selectedCompanyId)
    if (match) {
      setCompanyValue(match)
      setCompanyInputValue(match.name || '')
      if (skipCompanySyncRef.current) {
        skipCompanySyncRef.current = false
        return
      }
      if (shouldApplyCompany || !hasLoadedInvoice) {
        applyCompanyToForm(match)
        setShouldApplyCompany(false)
      }
    }
  }, [ selectedCompanyId, companies, shouldApplyCompany, hasLoadedInvoice ])

  const normalizeTableRows = (rows = []) => {
    if (!Array.isArray(rows)) return [ createEmptyRow() ]
    const columnCount = Math.max(1, data.tableHeaders.filter((h) => h.trim() !== '').length)
    return rows.map((row) => {
      if (!Array.isArray(row)) return new Array(columnCount).fill('')
      if (row.length >= columnCount) return row
      return [ ...row, ...new Array(columnCount - row.length).fill('') ]
    })
  }

  useEffect(() => {
    setHasSaved(false)
    let isActive = true
    const loadInvoice = async () => {
      // if (!invoiceId) {
      //   try {
      //     const byTemplate = await axiosInstance.get('/v1/invoice/by-template/scomet')
      //     if (!isActive) return
      //     const existing = byTemplate?.data
      //     if (existing?._id) {
      //       navigate(`/scomet/${existing._id}`, { replace: true })
      //       return
      //     }
      //   } catch (error) {
      //     // ignore and fall back to default
      //   }
      //   hydrateData(defaultData)
      //   return
      // }

      if (invoiceId) {
        try {
          const response = await axiosInstance.get(`/v1/invoice/${invoiceId}`)
          if (!isActive) return
          const invoice = response?.data || {}
          const templateData = invoice?.scomet || invoice?.data || {}
          const invoiceCompanyId =
              typeof invoice?.company === 'string' ? invoice.company : invoice?.company?._id || ''
          const storedCompanyId = getStoredCompanyId()
          const merged = {
            ...defaultData,
            ...templateData,
            date: normalizeDateInput(templateData?.date || invoice?.date || '')
          }
          
          merged.tableRows = normalizeTableRows(merged.tableRows)
          skipCompanySyncRef.current = true
          setSelectedCompanyId(invoiceCompanyId || storedCompanyId || '')
          hydrateData(merged)
          setIsApproved(Boolean(invoice?.scometApproved))
          setHasSaved(false)
          setHasLoadedInvoice(true)
        } catch (error) {
          if (!isActive) return
          hydrateData(defaultData)
          skipCompanySyncRef.current = true
          setSelectedCompanyId(getStoredCompanyId() || '')
          setIsApproved(false)
          setHasSaved(false)
          setHasLoadedInvoice(true)
        }
      }
    }

    loadInvoice()
    return () => {
      isActive = false
    }
  }, [ invoiceId ])

  useEffect(() => {
    if (!invoiceId) return
    setStoredCompanyId(selectedCompanyId)
  }, [ selectedCompanyId, invoiceId ])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const { date, ...restOfState } = data
      const payloadDate = formatDateForSave(date)
      const payload = {
        _id: invoiceId,
        date: payloadDate,
        template: 'scomet',
        scomet: restOfState,
        company: selectedCompanyId || undefined
      }
      const response = await axiosInstance.post('/v1/invoice/save', payload)
      const savedInvoice = response?.data
      if (savedInvoice?._id && !invoiceId) {
        navigate(`/scomet/${savedInvoice._id}`, { replace: true })
      }
      setHasSaved(true)
    } finally {
      setIsSaving(false)
    }
  }

  const handleApprovalChange = async (nextApproved) => {
    if (!invoiceId) return
    try {
      setIsApproving(true)
      const { date, ...restOfState } = data
      const payloadDate = formatDateForSave(date)
      const payload = {
        _id: invoiceId,
        date: payloadDate,
        template: 'scomet',
        scomet: restOfState,
        company: selectedCompanyId || undefined,
        scometApproved: nextApproved
      }
      const response = await axiosInstance.post('/v1/invoice/save', payload)
      const savedInvoice = response?.data
      setIsApproved(Boolean(savedInvoice?.scometApproved ?? nextApproved))
    } finally {
      setIsApproving(false)
    }
  }

  return (
      <MainCard
          title="SCOMET Declaration"
          secondary={(
              <Stack direction="row" spacing={1}>
                <Button sx={{ backgroundColor : theme.palette.secondary.main }} variant="contained" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                {!isApproved ? (
                  <Button
                    variant="outlined"
                    onClick={() => handleApprovalChange(true)}
                    disabled={!invoiceId || !hasSaved || isApproving || isSaving}
                  >
                    {isApproving ? 'Confirming...' : 'Confirm'}
                  </Button>
                ) : (
                  <Button
                    color="warning"
                    variant="outlined"
                    onClick={() => handleApprovalChange(false)}
                    disabled={isApproving || isSaving}
                  >
                    {isApproving ? 'Updating...' : 'Mark as Draft'}
                  </Button>
                )}
              </Stack>
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
              <PdfPreview
                  data={{ ...pdfData, company : companyValue }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={5}>
            <Box sx={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto', pr: { md: 1 } }}>
              <Stack spacing={2}>
                <Typography variant="body2" color="textSecondary">
                  Edit any line below to update the PDF. Add or remove rows and sections as needed.
                </Typography>

                <SectionTitle>Header</SectionTitle>
                <EntityAutocomplete
                  label="Company"
                  options={companies}
                  value={companyValue}
                  inputValue={companyInputValue}
                  allowAdd={false}
                  onInputChange={setCompanyInputValue}
                  onChange={(newValue) => {
                    if (newValue?._id) {
                      setShouldApplyCompany(true)
                      setSelectedCompanyId(newValue._id)
                      setCompanyValue(newValue)
                      applyCompanyToForm(newValue)
                      return
                    }

                    if (!newValue) {
                      setShouldApplyCompany(false)
                      setSelectedCompanyId('')
                      setCompanyValue(null)
                      clearCompanyFromForm()
                    }
                  }}
                />
                <Divider/>
                <TextField label="Brand Name" value={data.brandName} onChange={updateField('brandName')} fullWidth/>
                {data.contactLines.map((line, index) => (
                    <Stack key={`contact-${index}`} direction="row" spacing={1} alignItems="center">
                      <TextField
                          label={`Contact Line ${index + 1}`}
                          value={line}
                          onChange={updateArrayField('contactLines', index)}
                          fullWidth
                      />
                      <IconButton aria-label="remove" onClick={() => removeArrayItem('contactLines', index)} size="large">
                        <IconTrash size="1.1rem" color={theme.palette.error.dark}/>
                      </IconButton>
                    </Stack>
                ))}
                <Button sx={{ color: theme.palette.secondary.dark }} variant="outlined" startIcon={<IconPlus/>} onClick={() => addArrayItem('contactLines')}>
                  Add Contact Line
                </Button>

                <Divider/>

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
                        <IconTrash size="1.1rem" color={theme.palette.error.dark}/>
                      </IconButton>
                    </Stack>
                ))}
                <Button sx={{ color: theme.palette.secondary.dark }} variant="outlined" startIcon={<IconPlus/>} onClick={() => addArrayItem('addressLines')}>
                  Add Address Line
                </Button>
                <TextField label="Subject Line" value={data.subjectLine} onChange={updateField('subjectLine')} fullWidth multiline/>

                <Divider/>

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
                        <IconTrash size="1.1rem" color={theme.palette.error.dark}/>
                      </IconButton>
                    </Stack>
                ))}
                <Button sx={{ color: theme.palette.secondary.dark }} variant="outlined" startIcon={<IconPlus/>} onClick={() => addArrayItem('bodyLines')}>
                  Add Body Line
                </Button>

                <Divider/>

                <SectionTitle>Invoice Table</SectionTitle>
                <TextField label="Table Title" value={data.tableTitle} onChange={updateField('tableTitle')} fullWidth/>
                {data.tableHeaders.map((header, index) => (
                    <Stack key={`header-${index}`} direction="row" spacing={1} alignItems="center">
                      <TextField
                          label={`Header ${index + 1}`}
                          value={header}
                          onChange={updateArrayField('tableHeaders', index)}
                          fullWidth
                      />
                      <IconButton aria-label="remove" onClick={() => removeArrayItem('tableHeaders', index)} size="large">
                        <IconTrash size="1.1rem" color={theme.palette.error.dark}/>
                      </IconButton>
                    </Stack>
                ))}
                <Button
                    sx={{ color: theme.palette.secondary.dark }}
                    variant="outlined"
                    startIcon={<IconPlus/>}
                    onClick={() => addArrayItem('tableHeaders', `Header ${data.tableHeaders.length + 1}`)}
                >
                  Add Table Column
                </Button>

                {data.tableRows.map((row, rowIndex) => (
                    <Box key={`row-${rowIndex}`}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <SectionTitle>Row {rowIndex + 1}</SectionTitle>
                        <IconButton aria-label="remove" onClick={() => removeArrayItem('tableRows', rowIndex)} size="large">
                          <IconTrash size="1.1rem" color={theme.palette.error.dark}/>
                        </IconButton>
                      </Stack>
                      <Grid container spacing={2}>
                        {data.tableHeaders.map((_, colIndex) => (
                            <Grid key={`cell-${rowIndex}-${colIndex}`} item xs={12} sm={6}>
                              {(() => {
                                const headerLabel = data.tableHeaders[colIndex] || `Column ${colIndex + 1}`
                                if (normalizeHeader(data.tableHeaders[colIndex]) === 'MODE OF EXPORT') {
                                  return (
                                  <FormControl fullWidth>
                                    <Select
                                        value={row[colIndex] || ''}
                                        displayEmpty
                                        renderValue={(selected) => selected || headerLabel}
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
                                      <MenuItem value="" disabled>{headerLabel}</MenuItem>
                                      <MenuItem value="AIR">AIR</MenuItem>
                                      <MenuItem value="SHIP">SHIP</MenuItem>
                                    </Select>
                                  </FormControl>
                                  )
                                }

                                return (
                                  <TextField
                                      label={`${headerLabel} (Row ${rowIndex + 1})`}
                                      placeholder={headerLabel}
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
                                )
                              })()}
                            </Grid>
                        ))}
                      </Grid>
                    </Box>
                ))}
                <Button
                    variant="outlined"
                    startIcon={<IconPlus/>}
                    onClick={() => addArrayItem('tableRows', createEmptyRow())}
                >
                  Add Table Row
                </Button>

                <Divider/>

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
                        <IconTrash size="1.1rem" color={theme.palette.error.dark}/>
                      </IconButton>
                    </Stack>
                ))}
                <Button sx={{ color: theme.palette.secondary.dark }} variant="outlined" startIcon={<IconPlus/>} onClick={() => addArrayItem('afterTableLines')}>
                  Add Line
                </Button>

                <Divider/>

                <SectionTitle>Footer</SectionTitle>
                <TextField label="Signature Line" value={data.signatureLine} onChange={updateField('signatureLine')} fullWidth/>
                <TextField label="Footer Line" value={data.footerLine} onChange={updateField('footerLine')} fullWidth multiline/>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </MainCard>
  )
}
