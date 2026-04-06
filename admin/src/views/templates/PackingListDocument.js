import React, { useEffect, useMemo, useState } from 'react'
import { Box, Button, Checkbox, Divider, FormControlLabel, Grid, IconButton, Stack, TextField, Typography } from '@mui/material'
import { IconPlus, IconTrash } from '@tabler/icons'
import { Document, Page, PDFViewer, StyleSheet, Text, View } from '@react-pdf/renderer'
import MainCard from 'ui-component/cards/MainCard'
import { useTheme } from '@mui/material/styles'
import { useNavigate, useParams } from 'react-router-dom'
import axiosInstance from '../../services/axiosInstance'
import EndpointService from '../../services/endpoint.service'
import EntityAutocomplete from 'components/EntityAutocomplete'

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 7.5, fontFamily: 'Helvetica', color: '#000' },
  table: { border: '1pt solid black', width: '100%' },

  // Layout Strategy: Two main vertical pillars
  flexRow: { flexDirection: 'row' },
  leftPillar: { width: '50%', borderRight: '1pt solid black' },
  rightPillar: { width: '50%' },

  // Cell heights and borders
  cell: { padding: 8, borderBottom: '1pt solid black' },
  cellLast: { padding: 4 }, // No bottom border

  // Nested Grid Helpers
  splitRow: { flexDirection: 'row', borderBottom: '1pt solid black' },
  innerBox: { width: '50%', padding: 4 },
  borderRight: { borderRight: '1pt solid black' },

  // Typography
  itemRow: { flexDirection: 'row', alignItems: 'stretch' },
  itemCell: { paddingVertical: 4, paddingHorizontal: 3 },
  itemText: { fontSize: 7, lineHeight: 1.2, textAlign: 'left', wordBreak: 'break-all' },
  itemHeaderText: { fontSize: 7.5, fontWeight: 'bold', textAlign: 'left' },
  label: { fontSize: 6, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 2 },
  value: { fontSize: 8, wordBreak: 'break-all' },
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
  const isVisible = (field) => Boolean(field?.visible)
  const visibleValue = (field) => (isVisible(field) ? field.value : '')
  const showPackingListMeta = isVisible(data.packingListNo) || isVisible(data.date)
  const showExportRefGroup = isVisible(data.exportRef) || isVisible(data.iec) || isVisible(data.gstin)
  const formatDate = (value) => {
    if (!value) return ''
    const raw = String(value).split('T')[0]
    const ddmmyyyy = raw.match(/^(\d{2})-(\d{2})-(\d{4})$/)
    if (ddmmyyyy) return raw
    const [ yyyy, mm, dd ] = raw.split('-')
    if (!yyyy || !mm || !dd) return value
    return `${dd}-${mm}-${yyyy}`
  }
  const wrapCell = (value, chunkSize) => {
    const text = String(value ?? '')
    if (!text) return ''
    if (/\s/.test(text)) return text
    if (!chunkSize || text.length <= chunkSize) return text
    const parts = text.match(new RegExp(`.{1,${chunkSize}}`, 'g'))
    return parts ? parts.join('\n') : text
  }
  return (
      <Document title={'Packaging List'}>
        <Page size="A4" style={styles.page}>
          <View style={styles.table}>

            {/* TITLE HEADER */}
            <View style={styles.header}>
              <Text>{visibleValue(data.title)}</Text>
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
                  {isVisible(data.consignee) ? (
                      <>
                        <Text style={styles.label}>Consignee</Text>
                        <Text style={styles.value}>{data.consignee.value}</Text>
                      </>
                  ) : null}
                  <View style={{ marginTop: 15 }}>
                    {isVisible(data.contact) ? (
                        <Text style={styles.label}>Contact: {data.contact.value}</Text>
                    ) : null}
                    {isVisible(data.tel) ? (
                        <Text style={styles.label}>Tel: {data.tel.value}</Text>
                    ) : null}
                  </View>
                </View>
              </View>

              {/* RIGHT PILLAR (Independent horizontal lines) */}
              <View style={styles.rightPillar}>
                <View style={[ styles.splitRow, { height: 45 } ]}>
                  <View style={[ styles.innerBox, styles.borderRight ]}>
                    {showPackingListMeta ? (
                        <>
                          <Text style={styles.label}>Packing List No. & Date</Text>
                          <Text style={styles.value}>
                            {visibleValue(data.packingListNo)} {isVisible(data.date) ? formatDate(data.date.value) : ''}
                          </Text>
                        </>
                    ) : null}
                  </View>
                  <View style={styles.innerBox}>
                    {showExportRefGroup ? (
                        <>
                          <Text style={styles.label}>Export Ref / IEC / GSTIN</Text>
                          <Text style={styles.value}>{wrapCell(visibleValue(data.exportRef), 14)}</Text>
                          <Text style={styles.value}>
                            {wrapCell(`${visibleValue(data.iec)} ${visibleValue(data.gstin)}`.trim(), 14)}
                          </Text>
                        </>
                    ) : null}
                  </View>
                </View>
                <View style={[ styles.cell, { height: 45 } ]}>
                  {isVisible(data.buyersOrder) ? (
                      <>
                        <Text style={styles.label}>Buyer's Order No. & Date</Text>
                        <Text style={styles.value}>{visibleValue(data.buyersOrder)}</Text>
                      </>
                  ) : null}
                </View>
                <View style={[ styles.cellLast, { height: 45 } ]}>
                  {isVisible(data.notifyBuyer) ? (
                      <>
                        <Text style={styles.label}>Notify / Buyer (if other than consignee)</Text>
                        <Text style={styles.value}>{visibleValue(data.notifyBuyer)}</Text>
                      </>
                  ) : null}
                </View>
              </View>
            </View>

            {/* SHIPPING & TERMS BLOCK */}
            <View style={[ styles.flexRow, { borderTop: '1pt solid black', borderBottom: '1pt solid black' } ]}>
              {/* Left 50%: Three-Row Shipping Grid */}
              <View style={styles.leftPillar}>
                <View style={styles.splitRow}>
                  <View style={[ styles.innerBox, styles.borderRight ]}>
                    {isVisible(data.preCarriageBy) ? (
                        <>
                          <Text style={styles.label}>Pre-Carriage by</Text>
                          <Text>{data.preCarriageBy.value}</Text>
                        </>
                    ) : null}
                  </View>
                  <View style={styles.innerBox}>
                    {isVisible(data.placeOfReceipt) ? (
                        <>
                          <Text style={styles.label}>Place of Receipt</Text>
                          <Text>{data.placeOfReceipt.value}</Text>
                        </>
                    ) : null}
                  </View>
                </View>
                <View style={styles.splitRow}>
                  <View style={[ styles.innerBox, styles.borderRight ]}>
                    {isVisible(data.vesselFlightNo) ? (
                        <>
                          <Text style={styles.label}>Vessel/Flight No.</Text>
                          <Text>{data.vesselFlightNo.value}</Text>
                        </>
                    ) : null}
                  </View>
                  <View style={styles.innerBox}>
                    {isVisible(data.portOfLoading) ? (
                        <>
                          <Text style={styles.label}>Port of Loading</Text>
                          <Text>{data.portOfLoading.value}</Text>
                        </>
                    ) : null}
                  </View>
                </View>
                <View style={styles.flexRow}>
                  <View style={[ styles.innerBox, styles.borderRight ]}>
                    {isVisible(data.portOfDischarge) ? (
                        <>
                          <Text style={styles.label}>Port of Discharge</Text>
                          <Text>{data.portOfDischarge.value}</Text>
                        </>
                    ) : null}
                  </View>
                  <View style={styles.innerBox}>
                    {isVisible(data.finalDestination) ? (
                        <>
                          <Text style={styles.label}>Final Destination</Text>
                          <Text>{data.finalDestination.value}</Text>
                        </>
                    ) : null}
                  </View>
                </View>
              </View>

              {/* Right 50%: Countries + Terms Box */}
              <View style={styles.rightPillar}>
                <View style={styles.splitRow}>
                  <View style={[ styles.innerBox, styles.borderRight ]}>
                    {isVisible(data.countryOfOrigin) ? (
                        <>
                          <Text style={styles.label}>Country of Origin</Text>
                          <Text>{data.countryOfOrigin.value}</Text>
                        </>
                    ) : null}
                  </View>
                  <View style={styles.innerBox}>
                    {isVisible(data.countryOfDestination) ? (
                        <>
                          <Text style={styles.label}>Country of Destination</Text>
                          <Text>{data.countryOfDestination.value}</Text>
                        </>
                    ) : null}
                  </View>
                </View>
                <View style={{ padding: 4 }}>
                  {isVisible(data.terms) ? (
                      <>
                        <Text style={styles.label}>Terms of Delivery and Payment</Text>
                        <Text style={styles.value}>{data.terms.value}</Text>
                      </>
                  ) : null}
                </View>
              </View>
            </View>

            {/* ITEM TABLE HEADER */}
            <View style={[ styles.itemRow, { backgroundColor: '#F0F0F0', borderBottom: '1pt solid black' } ]}>
              <View style={[ styles.itemCell, styles.c1 ]}><Text style={styles.itemHeaderText}>Marks & No.</Text></View>
              <View style={[ styles.itemCell, styles.c2 ]}><Text style={styles.itemHeaderText}>No. & Pkgs</Text></View>
              <View style={[ styles.itemCell, styles.c3 ]}><Text style={styles.itemHeaderText}>SR</Text></View>
              <View style={[ styles.itemCell, styles.c4 ]}><Text style={styles.itemHeaderText}>Description of Goods</Text></View>
              <View style={[ styles.itemCell, styles.c5 ]}><Text style={styles.itemHeaderText}>QTY</Text></View>
              <View style={[ styles.itemCell, styles.c6 ]}><Text style={styles.itemHeaderText}>Net Wt</Text></View>
              <View style={[ styles.itemCell, styles.c7 ]}><Text style={styles.itemHeaderText}>Gross</Text></View>
              <View style={[ styles.itemCell, styles.c8 ]}><Text style={styles.itemHeaderText}>Dim</Text></View>
            </View>

            {/* DYNAMIC ROWS */}
            {data.tableRows.map((row, i) => (
                <View key={i} style={[ styles.itemRow, { borderBottom: '0.5pt solid #AAA' } ]}>
                  <View style={[ styles.itemCell, styles.c1 ]}><Text style={styles.itemText}>{wrapCell(row[0], 6)}</Text></View>
                  <View style={[ styles.itemCell, styles.c2 ]}><Text style={styles.itemText}>{wrapCell(row[1], 8)}</Text></View>
                  <View style={[ styles.itemCell, styles.c3 ]}><Text style={styles.itemText}>{wrapCell(row[2] || i + 1, 4)}</Text></View>
                  <View style={[ styles.itemCell, styles.c4 ]}><Text style={styles.itemText}>{wrapCell(row[3], 18)}</Text></View>
                  <View style={[ styles.itemCell, styles.c5 ]}><Text style={styles.itemText}>{wrapCell(row[4], 6)}</Text></View>
                  <View style={[ styles.itemCell, styles.c6 ]}><Text style={styles.itemText}>{wrapCell(row[5], 6)}</Text></View>
                  <View style={[ styles.itemCell, styles.c7 ]}><Text style={styles.itemText}>{wrapCell(row[6], 6)}</Text></View>
                  <View style={[ styles.itemCell, styles.c8 ]}><Text style={styles.itemText}>{wrapCell(row[7], 6)}</Text></View>
                </View>
            ))}

            {/* SIGNATURE FOOTER */}
            <View style={[ styles.flexRow, { borderTop: '1pt solid black', minHeight: 80 } ]}>
              <View style={[ styles.leftPillar, { padding: 0 } ]}>
                <View style={styles.cell}>
                  {isVisible(data.totalPackages) ? (
                      <Text style={styles.label}>Total Pkgs: {data.totalPackages.value}</Text>
                  ) : null}
                </View>
                <View style={[ styles.flexRow, { borderBottom: '1pt solid black' } ]}>
                  <View style={[ styles.innerBox, styles.borderRight ]}>
                    {isVisible(data.netWeight) ? (
                        <Text style={styles.label}>Net Wt: {data.netWeight.value}</Text>
                    ) : null}
                  </View>
                  <View style={styles.innerBox}>
                    {isVisible(data.grossWeight) ? (
                        <Text style={styles.label}>Gross Wt: {data.grossWeight.value}</Text>
                    ) : null}
                  </View>
                </View>
                <View style={{ padding: 4 }}>
                  {isVisible(data.totalWeight) ? (
                      <Text style={styles.label}>Total Weight: {data.totalWeight.value}</Text>
                  ) : null}
                </View>
              </View>
              <View style={[ styles.rightPillar, { textAlign: 'center', justifyContent: 'space-between', padding: 5 } ]}>
                {isVisible(data.authorizedBy) ? (
                    <>
                      <Text style={styles.label}>For {data.authorizedBy.value}</Text>
                      <Text style={[ styles.label, { marginBottom: 5 } ]}>Authorised Signatory</Text>
                    </>
                ) : null}
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
  const [ isApproving, setIsApproving ] = useState(false)
  const [ isApproved, setIsApproved ] = useState(false)
  const [ hasSaved, setHasSaved ] = useState(false)
  const [ customers, setCustomers ] = useState([])
  const [ companies, setCompanies ] = useState([])
  const [ selectedCustomerId, setSelectedCustomerId ] = useState('')
  const [ selectedCompanyId, setSelectedCompanyId ] = useState('')
  const [ customerValue, setCustomerValue ] = useState(null)
  const [ customerInputValue, setCustomerInputValue ] = useState('')
  const [ companyValue, setCompanyValue ] = useState(null)
  const [ companyInputValue, setCompanyInputValue ] = useState('')

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
    const exporterLines = buildLines([
      company.name || '',
      ...splitToLines(company.address),
      company.pinCode ? `PIN: ${company.pinCode}` : '',
      company.contactPerson || '',
      company.contactNumber || '',
      company.username || ''
    ]).map((value) => ({ value, visible: true }))

    setData((prev) => ({
      ...prev,
      exporterLines: exporterLines.length ? exporterLines : prev.exporterLines,
      authorizedBy: { ...prev.authorizedBy, value: company.name || '' }
    }))
  }

  const clearCompanyFromForm = () => {
    setData((prev) => ({
      ...prev,
      exporterLines: (prev.exporterLines?.length ? prev.exporterLines : [ { value: '', visible: true } ]).map((line) => ({
        ...line,
        value: ''
      })),
      authorizedBy: { ...prev.authorizedBy, value: '' }
    }))
  }

  const applyCustomerToForm = (customer) => {
    if (!customer) return
    const consigneeLines = buildLines([
      customer.name,
      ...splitToLines(customer.shipTo || customer.address),
      customer.pinCode ? `PIN: ${customer.pinCode}` : ''
    ])
    const notifyLines = buildLines([
      customer.name,
      ...splitToLines(customer.billTo || customer.address),
      customer.pinCode ? `PIN: ${customer.pinCode}` : ''
    ])

    setData((prev) => ({
      ...prev,
      consignee: { ...prev.consignee, value: consigneeLines.join('\n') },
      notifyBuyer: { ...prev.notifyBuyer, value: notifyLines.join('\n') },
      contact: { ...prev.contact, value: customer.contact || '' },
      tel: { ...prev.tel, value: customer.contact || '' }
    }))
  }

  const clearCustomerFromForm = () => {
    setData((prev) => ({
      ...prev,
      consignee: { ...prev.consignee, value: '' },
      notifyBuyer: { ...prev.notifyBuyer, value: '' },
      contact: { ...prev.contact, value: '' },
      tel: { ...prev.tel, value: '' }
    }))
  }

  const tableColumnCount = useMemo(() => Math.max(1, data.tableHeaders.length), [ data.tableHeaders.length ])

  useEffect(() => {
    const handle = setTimeout(() => {
      setPdfData(data)
    }, 500)
    return () => clearTimeout(handle)
  }, [ data ])

  const fetchCustomers = async () => {
    try {
      const response = await axiosInstance.get('/v1/customer')
      const list = response?.data?.customers || []
      setCustomers(list)
      return list
    } catch (error) {
      setCustomers([])
      return []
    }
  }

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
    const loadCustomers = async () => {
      const list = await fetchCustomers()
      if (list.length === 0) {
        setCustomers([])
      }
    }

    loadCustomers()
    fetchCompany()
  }, [])

  useEffect(() => {
    if (!selectedCustomerId || !customers.length) {
      setCustomerValue(null)
      setCustomerInputValue('')
      return
    }
    const match = customers.find((item) => item._id === selectedCustomerId)
    if (match) {
      setCustomerValue(match)
      setCustomerInputValue(match.name || match.mail || '')
      applyCustomerToForm(match)
    }
  }, [ selectedCustomerId, customers ])

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
      applyCompanyToForm(match)
    }
  }, [ selectedCompanyId, companies ])

  useEffect(() => {
    setHasSaved(false)
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
          const templateData = invoice?.packaging || invoice?.data || {}
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
            ...templateData
          }
          merged.date = coerceDateField(templateData?.date ?? invoice?.date, defaultData.date.visible)
          const invoiceCompanyId =
              typeof invoice?.company === 'string' ? invoice.company : invoice?.company?._id || ''
          const invoiceCustomerId =
              typeof invoice?.customer === 'string' ? invoice.customer : invoice?.customer?._id || ''
          setSelectedCompanyId(invoiceCompanyId)
          setSelectedCustomerId(invoiceCustomerId)
          setData(merged)
          setPdfData(merged)
          setIsApproved(Boolean(invoice?.packagingApproved))
          setHasSaved(false)
        } catch (error) {
          if (!isActive) return
          setData(defaultData)
          setPdfData(defaultData)
          setIsApproved(false)
          setHasSaved(false)
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
      const payload = {
        _id: invoiceId,
        date: payloadDate,
        template: 'packaging',
        packaging: restOfState,
        company: selectedCompanyId || undefined,
        customer: selectedCustomerId || undefined
      }
      const response = await axiosInstance.post('/v1/invoice/save', payload)
      const savedInvoice = response?.data
      if (savedInvoice?._id && !invoiceId) {
        navigate(`/packing/${savedInvoice._id}`, { replace: true })
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
      const payloadDate = formatDateForSave(date?.value || '')
      const payload = {
        _id: invoiceId,
        date: payloadDate,
        template: 'packaging',
        packaging: restOfState,
        company: selectedCompanyId || undefined,
        customer: selectedCustomerId || undefined,
        packagingApproved: nextApproved
      }
      const response = await axiosInstance.post('/v1/invoice/save', payload)
      const savedInvoice = response?.data
      setIsApproved(Boolean(savedInvoice?.packagingApproved ?? nextApproved))
    } finally {
      setIsApproving(false)
    }
  }

  return (
      <MainCard
          title="Packaging"
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
                  height: { xs: '88vh', md: 'calc(100vh - 140px)' },
                  minHeight: { xs: 520, md: 700 },
                  overflow: 'hidden',
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

                <SectionTitle>Company Selection</SectionTitle>
                <EntityAutocomplete
                  label="Company"
                  options={companies}
                  value={companyValue}
                  inputValue={companyInputValue}
                  allowAdd={false}
                  onInputChange={setCompanyInputValue}
                  onChange={(newValue) => {
                    if (newValue?._id) {
                      setSelectedCompanyId(newValue._id)
                      setCompanyValue(newValue)
                      applyCompanyToForm(newValue)
                      return
                    }

                    if (!newValue) {
                      setSelectedCompanyId('')
                      setCompanyValue(null)
                      clearCompanyFromForm()
                    }
                  }}
                />

                <Divider/>

                <SectionTitle>Customer Selection</SectionTitle>
                <EntityAutocomplete
                  label="Customer"
                  options={customers}
                  value={customerValue}
                  inputValue={customerInputValue}
                  allowAdd={false}
                  onInputChange={setCustomerInputValue}
                  onChange={(newValue) => {
                    if (newValue?._id) {
                      setSelectedCustomerId(newValue._id)
                      setCustomerValue(newValue)
                      applyCustomerToForm(newValue)
                      return
                    }

                    if (!newValue) {
                      setSelectedCustomerId('')
                      setCustomerValue(null)
                      clearCustomerFromForm()
                    }
                  }}
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
                      <Grid container spacing={2}>
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
