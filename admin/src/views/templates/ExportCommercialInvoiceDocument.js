import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import { IconPlus, IconTrash } from '@tabler/icons'
import { Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer'
import MainCard from 'ui-component/cards/MainCard'
import { useTheme } from '@mui/material/styles'
import { useNavigate, useParams } from 'react-router-dom'
import axiosInstance from '../../services/axiosInstance'

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 8, fontFamily: 'Helvetica', color: '#000' },
  table: { border: '1pt solid black', width: '100%' },
  row: { flexDirection: 'row' },
  cell: { borderRight: '1pt solid black', borderBottom: '1pt solid black', padding: 4 },
  cellLast: { borderBottom: '1pt solid black', padding: 4 },
  label: { fontSize: 6, fontWeight: 'bold' },
  value: { fontSize: 8 },
  header: { textAlign: 'center', fontWeight: 'bold', fontSize: 9, padding: 4, borderBottom: '1pt solid black' },
  subHeader: { fontSize: 6, textAlign: 'center', borderBottom: '1pt solid black', padding: 3 },
  sectionTitle: { fontSize: 7, fontWeight: 'bold', marginBottom: 2 },
  footerLabel: { fontSize: 6, fontWeight: 'bold' }
})

const ExportCommercialPdf = ({ data }) => {
  const formatDate = (value) => {
    if (!value) return ''
    const raw = String(value).split('T')[0]
    const ddmmyyyy = raw.match(/^(\d{2})-(\d{2})-(\d{4})$/)
    if (ddmmyyyy) return raw
    const [yyyy, mm, dd] = raw.split('-')
    if (!yyyy || !mm || !dd) return value
    return `${dd}-${mm}-${yyyy}`
  }

  const tableHeaders = data.tableHeaders || []
  const normalizeHeader = (value = '') => value.trim().toUpperCase()
  const parseAmount = (value) => {
    const cleaned = String(value || '').replace(/[^0-9.]/g, '')
    const parsed = Number.parseFloat(cleaned)
    return Number.isFinite(parsed) ? parsed : 0
  }
  const formatCurrency = (value, prefix = 'EUR') => `${prefix} ${value.toFixed(2)}`

  const amountColIndex = tableHeaders.findIndex((h) => normalizeHeader(h) === 'AMOUNT')
  const amountIndex = amountColIndex >= 0 ? amountColIndex : Math.max(0, tableHeaders.length - 1)
  const subtotal = (data.tableRows || []).reduce((sum, row) => sum + parseAmount(row?.[amountIndex]), 0)
  const packing = parseAmount(data.packingCharge?.value)
  const forwarding = parseAmount(data.forwarding?.value)
  const insurance = parseAmount(data.insurance?.value)
  const grandTotal = subtotal + packing + forwarding + insurance

  return (
    <Document title="Export Commercial Invoice">
      <Page size="A4" style={styles.page}>
        <View style={styles.table}>
          <View style={styles.header}>
            <Text>{data.title.value}</Text>
          </View>
          <View style={styles.subHeader}>
            <Text>{data.subTitle.value}</Text>
          </View>

          <View style={[styles.row, { borderBottom: '1pt solid black' }]}>
            <View style={[styles.cell, { width: '55%' }]}>
              <Text style={styles.label}>Exporter:</Text>
              {data.exporterLines.filter((l) => l.visible).map((line, idx) => (
                <Text key={`exp-${idx}`} style={styles.value}>{line.value}</Text>
              ))}
            </View>
            <View style={[styles.cell, { width: '25%' }]}>
              <Text style={styles.label}>Invoice No:</Text>
              <Text style={styles.value}>{data.invoiceNo.value}</Text>
              <Text style={[styles.label, { marginTop: 6 }]}>Date:</Text>
              <Text style={styles.value}>{formatDate(data.date.value)}</Text>
            </View>
            <View style={[styles.cellLast, { width: '20%' }]}>
              <Text style={styles.label}>Export Ref:</Text>
              <Text style={styles.value}>{data.exportRef.value}</Text>
              <Text style={styles.value}>{data.iec.value}</Text>
              <Text style={styles.value}>{data.adCode.value}</Text>
            </View>
          </View>

          <View style={[styles.row, { borderBottom: '1pt solid black' }]}>
            <View style={[styles.cell, { width: '55%' }]}>
              <Text style={styles.label}>Consignee:</Text>
              <Text style={styles.value}>{data.consignee.value}</Text>
              <Text style={[styles.label, { marginTop: 6 }]}>Contact:</Text>
              <Text style={styles.value}>{data.contact.value}</Text>
              <Text style={[styles.label, { marginTop: 6 }]}>Tel:</Text>
              <Text style={styles.value}>{data.tel.value}</Text>
            </View>
            <View style={[styles.cellLast, { width: '45%' }]}>
              <Text style={styles.label}>Buyer&apos;s Order No. & Date:</Text>
              <Text style={styles.value}>{data.buyersOrder.value}</Text>
              <Text style={[styles.label, { marginTop: 6 }]}>Notify/Buyer:</Text>
              <Text style={styles.value}>{data.notifyBuyer.value}</Text>
            </View>
          </View>

          <View style={[styles.row, { borderBottom: '1pt solid black' }]}>
            <View style={[styles.cell, { width: '50%' }]}>
              <Text style={styles.label}>Country of Origin</Text>
              <Text style={styles.value}>{data.countryOfOrigin.value}</Text>
            </View>
            <View style={[styles.cellLast, { width: '50%' }]}>
              <Text style={styles.label}>Country of Destination</Text>
              <Text style={styles.value}>{data.countryOfDestination.value}</Text>
            </View>
          </View>

          <View style={[styles.row, { borderBottom: '1pt solid black' }]}>
            <View style={[styles.cell, { width: '25%' }]}>
              <Text style={styles.label}>Pre-Carriage by</Text>
              <Text style={styles.value}>{data.preCarriageBy.value}</Text>
            </View>
            <View style={[styles.cell, { width: '25%' }]}>
              <Text style={styles.label}>Place of Receipt</Text>
              <Text style={styles.value}>{data.placeOfReceipt.value}</Text>
            </View>
            <View style={[styles.cell, { width: '25%' }]}>
              <Text style={styles.label}>Vessel/Flight No.</Text>
              <Text style={styles.value}>{data.vesselFlightNo.value}</Text>
            </View>
            <View style={[styles.cellLast, { width: '25%' }]}>
              <Text style={styles.label}>Port of Loading</Text>
              <Text style={styles.value}>{data.portOfLoading.value}</Text>
            </View>
          </View>

          <View style={[styles.row, { borderBottom: '1pt solid black' }]}>
            <View style={[styles.cell, { width: '25%' }]}>
              <Text style={styles.label}>Port of Discharge</Text>
              <Text style={styles.value}>{data.portOfDischarge.value}</Text>
            </View>
            <View style={[styles.cell, { width: '25%' }]}>
              <Text style={styles.label}>Final Destination</Text>
              <Text style={styles.value}>{data.finalDestination.value}</Text>
            </View>
            <View style={[styles.cellLast, { width: '50%' }]}>
              <Text style={styles.label}>Terms of Delivery and Payment</Text>
              <Text style={styles.value}>{data.terms.value}</Text>
            </View>
          </View>

          <View style={[styles.row, { borderBottom: '1pt solid black', backgroundColor: '#f0f0f0' }]}>
            {tableHeaders.map((header, idx) => (
              <View
                key={`th-${idx}`}
                style={[styles.cell, { width: tableHeaders.length ? `${100 / tableHeaders.length}%` : '14%' }]}
              >
                <Text style={styles.label}>{header}</Text>
              </View>
            ))}
          </View>

          {data.tableRows.map((row, rowIndex) => (
            <View key={`tr-${rowIndex}`} style={styles.row}>
              {tableHeaders.map((_, colIndex) => (
                <View
                  key={`td-${rowIndex}-${colIndex}`}
                  style={[
                    styles.cell,
                    {
                      width: tableHeaders.length ? `${100 / tableHeaders.length}%` : '14%',
                      borderBottomWidth: rowIndex === data.tableRows.length - 1 ? 1 : 1
                    }
                  ]}
                >
                  <Text style={styles.value}>{row[colIndex] || ''}</Text>
                </View>
              ))}
            </View>
          ))}

          <View style={[styles.row, { borderTop: '1pt solid black' }]}>
            <View style={[styles.cell, { width: '60%' }]}>
              <Text style={styles.footerLabel}>Amount:</Text>
              <Text style={styles.value}>{data.amount.value}</Text>
              <Text style={[styles.footerLabel, { marginTop: 6 }]}>Declaration:</Text>
              {data.declarationLines.map((line, idx) => (
                <Text key={`decl-${idx}`} style={styles.value}>{line}</Text>
              ))}
            </View>
            <View style={[styles.cellLast, { width: '40%' }]}>
              <View style={styles.row}>
                <View style={[styles.cell, { width: '60%' }]}><Text style={styles.footerLabel}>Total</Text></View>
                <View style={[styles.cellLast, { width: '40%' }]}><Text style={styles.value}>{formatCurrency(subtotal)}</Text></View>
              </View>
              <View style={styles.row}>
                <View style={[styles.cell, { width: '60%' }]}><Text style={styles.footerLabel}>Packing Charge</Text></View>
                <View style={[styles.cellLast, { width: '40%' }]}><Text style={styles.value}>{formatCurrency(packing)}</Text></View>
              </View>
              <View style={styles.row}>
                <View style={[styles.cell, { width: '60%' }]}><Text style={styles.footerLabel}>Forwarding</Text></View>
                <View style={[styles.cellLast, { width: '40%' }]}><Text style={styles.value}>{formatCurrency(forwarding)}</Text></View>
              </View>
              <View style={styles.row}>
                <View style={[styles.cell, { width: '60%' }]}><Text style={styles.footerLabel}>Insurance Charge</Text></View>
                <View style={[styles.cellLast, { width: '40%' }]}><Text style={styles.value}>{formatCurrency(insurance)}</Text></View>
              </View>
              <View style={styles.row}>
                <View style={[styles.cell, { width: '60%' }]}><Text style={styles.footerLabel}>Grand Total</Text></View>
                <View style={[styles.cellLast, { width: '40%' }]}><Text style={styles.value}>{formatCurrency(grandTotal)}</Text></View>
              </View>
              <View style={{ marginTop: 20 }}>
                <Text style={styles.value}>Signature / Stamp of</Text>
                <Text style={styles.value}>{data.signature.value}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.row, { borderTop: '1pt solid black' }]}>
            <View style={[styles.cell, { width: '50%' }]}>
              <Text style={styles.footerLabel}>Net Weight:</Text>
              <Text style={styles.value}>{data.netWeight.value}</Text>
            </View>
            <View style={[styles.cellLast, { width: '50%' }]}>
              <Text style={styles.footerLabel}>Gross Weight:</Text>
              <Text style={styles.value}>{data.grossWeight.value}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}

const PdfPreview = React.memo(({ data }) => (
  <PDFViewer style={{ width: '100%', height: '100%' }}>
    <ExportCommercialPdf data={data} />
  </PDFViewer>
))

const defaultData = {
  title: { value: 'EXPORT / COMMERCIAL INVOICE', visible: true },
  subTitle: { value: 'SUPPLY MEANT FOR EXPORT UNDER BOND OR LETTER OF UNDERTAKING WITHOUT PAYMENT OF INTEGRATED TAX (IGST) LUT NO: AD24032416001P', visible: true },
  exporterLines: [
    { value: 'UNIQUE WAVES', visible: true },
    { value: '32 INDRAPRASTH COMPLEX, NAGINA WADI', visible: true },
    { value: 'ALKAPURI ROAD, SURAT-395006', visible: true },
    { value: 'GUJARAT, INDIA.', visible: true },
    { value: 'TEL.: +91-95375 15827', visible: true },
    { value: 'gauravmistry1413@gmail.com', visible: true },
    { value: 'GSTIN: 24AAFFU9324C1ZC', visible: true }
  ],
  invoiceNo: { value: '', visible: true },
  date: { value: '', visible: true },
  exportRef: { value: '', visible: true },
  iec: { value: 'IEC-AAFFU9324C', visible: true },
  adCode: { value: 'ADCODE:6361280-5600009', visible: true },
  buyersOrder: { value: '', visible: true },
  notifyBuyer: { value: '', visible: true },
  consignee: { value: '', visible: true },
  contact: { value: '', visible: true },
  tel: { value: '', visible: true },
  countryOfOrigin: { value: '', visible: true },
  countryOfDestination: { value: '', visible: true },
  preCarriageBy: { value: '', visible: true },
  placeOfReceipt: { value: '', visible: true },
  vesselFlightNo: { value: '', visible: true },
  portOfLoading: { value: '', visible: true },
  portOfDischarge: { value: '', visible: true },
  finalDestination: { value: '', visible: true },
  terms: { value: 'CIF', visible: true },
  tableHeaders: [ 'Marks & No.', 'No. & Type of Packages', 'Description of Goods', 'HSN CODE', 'QTY', 'RATE', 'AMOUNT' ],
  tableRows: [ [ '', '', '', '', '', '', '' ] ],
  amount: { value: '', visible: true },
  declarationLines: [
    'Supply meant for export under letter of undertaking without payment of integrated tax.',
    'We declare that this invoice shows the actual price of the goods described and that all',
    'particulars are true and correct.'
  ],
  total: { value: 'EUR 0.00', visible: true },
  packingCharge: { value: 'EUR 0.00', visible: true },
  forwarding: { value: 'EUR 0.00', visible: true },
  insurance: { value: 'EUR 0.00', visible: true },
  grandTotal: { value: 'EUR 0.00', visible: true },
  signature: { value: 'UNIQUE WAVES', visible: true },
  netWeight: { value: '', visible: true },
  grossWeight: { value: '', visible: true }
}

const SectionTitle = ({ children }) => (
  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
    {children}
  </Typography>
)

const FieldToggle = ({ label, value, visible, onChange, onToggle, multiline }) => (
  <Stack direction="row" spacing={1} alignItems="center">
    <FormControlLabel control={<Checkbox checked={visible} onChange={onToggle} />} label="" />
    <TextField label={label} value={value} onChange={onChange} fullWidth multiline={multiline} />
  </Stack>
)

export default function ExportCommercialInvoiceDocument() {
  const theme = useTheme()
  const navigate = useNavigate()
  const params = useParams()
  const invoiceId = params?.id

  const [data, setData] = useState(defaultData)
  const [pdfData, setPdfData] = useState(defaultData)
  const [isSaving, setIsSaving] = useState(false)

  const updateField = (field) => (event) => {
    setData((prev) => ({ ...prev, [field]: { ...prev[field], value: event.target.value } }))
  }

  const toggleField = (field) => (event) => {
    setData((prev) => ({ ...prev, [field]: { ...prev[field], visible: event.target.checked } }))
  }

  const formatDateForSave = (value) => {
    if (!value) return ''
    const raw = String(value).split('T')[0]
    const [ yyyy, mm, dd ] = raw.split('-')
    if (!yyyy || !mm || !dd) return value
    return `${dd}-${mm}-${yyyy}`
  }

  const normalizeHeader = (value = '') => value.trim().toUpperCase()
  const parseAmount = (value) => {
    const cleaned = String(value || '').replace(/[^0-9.]/g, '')
    const parsed = Number.parseFloat(cleaned)
    return Number.isFinite(parsed) ? parsed : 0
  }
  const formatCurrency = (value, prefix = 'EUR') => `${prefix} ${value.toFixed(2)}`
  const sanitizeAmountInput = (value) => {
    const cleaned = String(value || '').replace(/[^0-9.]/g, '')
    const parts = cleaned.split('.')
    if (parts.length <= 1) return cleaned
    return `${parts[0]}.${parts.slice(1).join('')}`
  }
  const formatDisplay = (value) => {
    const parsed = Number.parseFloat(value || 0)
    if (!Number.isFinite(parsed)) return '0'
    const fixed = parsed.toFixed(2)
    return fixed.replace(/\.?0+$/, '')
  }

  const amountIndex = useMemo(() => {
    const index = data.tableHeaders.findIndex((h) => normalizeHeader(h) === 'AMOUNT')
    return index >= 0 ? index : Math.max(0, data.tableHeaders.length - 1)
  }, [ data.tableHeaders ])
  const subtotal = useMemo(
    () => data.tableRows.reduce((sum, row) => sum + parseAmount(row?.[amountIndex]), 0),
    [ data.tableRows, amountIndex ]
  )
  const packing = useMemo(() => parseAmount(data.packingCharge.value), [ data.packingCharge.value ])
  const forwarding = useMemo(() => parseAmount(data.forwarding.value), [ data.forwarding.value ])
  const insurance = useMemo(() => parseAmount(data.insurance.value), [ data.insurance.value ])
  const grandTotal = useMemo(() => subtotal + packing + forwarding + insurance, [ subtotal, packing, forwarding, insurance ])

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

  const updateSimpleArrayField = (field, index) => (event) => {
    setData((prev) => {
      const next = [ ...(prev[field] || []) ]
      next[index] = event.target.value
      return { ...prev, [field]: next }
    })
  }

  const addSimpleArrayItem = (field, value = '') => {
    setData((prev) => ({ ...prev, [field]: [ ...(prev[field] || []), value ] }))
  }

  const removeSimpleArrayItem = (field, index) => {
    setData((prev) => {
      const next = [ ...(prev[field] || []) ]
      next.splice(index, 1)
      return { ...prev, [field]: next }
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

  useEffect(() => {
    const handle = setTimeout(() => {
      setPdfData(data)
    }, 500)
    return () => clearTimeout(handle)
  }, [ data ])

  useEffect(() => {
    let isActive = true
    const loadInvoice = async () => {
      if (!invoiceId) {
        try {
          const byTemplate = await axiosInstance.get('/api/invoices/by-template/delivery')
          if (!isActive) return
          const existing = byTemplate?.data
          if (existing?._id) {
            navigate(`/delivery/${existing._id}`, { replace: true })
            return
          }
        } catch (error) {
          // ignore
        }
        setData(defaultData)
        setPdfData(defaultData)
        return
      }
      try {
        const response = await axiosInstance.get(`/api/invoices/${invoiceId}`)
        if (!isActive) return
        const invoice = response?.data || {}
        const merged = {
          ...defaultData,
          ...(invoice?.data || {}),
          date: { ...(defaultData.date || {}), value: invoice?.date || invoice?.data?.date || '' }
        }
        setData(merged)
        setPdfData(merged)
      } catch (error) {
        if (!isActive) return
        setData(defaultData)
        setPdfData(defaultData)
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
      const payload = { _id: invoiceId, date: payloadDate, type: 'delivery', ...restOfState }
      const response = await axiosInstance.post('/api/invoices/save', payload)
      const savedInvoice = response?.data
      if (savedInvoice?._id && !invoiceId) {
        navigate(`/delivery/${savedInvoice._id}`, { replace: true })
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <MainCard
      title="Export / Commercial Invoice"
      secondary={(
        <Button variant="contained" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      )}
    >
      <Grid container spacing={2} alignItems="flex-start">
        <Grid item xs={12} md={5}>
          <Box sx={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto', pr: { md: 1 } }}>
            <Stack spacing={2}>
              <Typography variant="body2" color="textSecondary">
                Toggle any field to show/hide it in the PDF, and edit values inline.
              </Typography>

              <SectionTitle>Title</SectionTitle>
              <FieldToggle label="Document Title" value={data.title.value} visible={data.title.visible} onChange={updateField('title')} onToggle={toggleField('title')} />
              <FieldToggle label="Sub Title" value={data.subTitle.value} visible={data.subTitle.visible} onChange={updateField('subTitle')} onToggle={toggleField('subTitle')} multiline />

              <Divider />

              <SectionTitle>Exporter</SectionTitle>
              {data.exporterLines.map((line, index) => (
                <Stack key={`exporter-${index}`} direction="row" spacing={1} alignItems="center">
                  <FormControlLabel control={<Checkbox checked={line.visible} onChange={toggleExporterLine(index)} />} label="" />
                  <TextField label={`Exporter Line ${index + 1}`} value={line.value} onChange={updateExporterLine(index)} fullWidth />
                  <IconButton aria-label="remove" onClick={() => removeExporterLine(index)} size="large">
                    <IconTrash size="1.1rem" color={theme.palette.error.dark} />
                  </IconButton>
                </Stack>
              ))}
              <Button sx={{ color: theme.palette.secondary.dark }} variant="outlined" startIcon={<IconPlus />} onClick={addExporterLine}>
                Add Exporter Line
              </Button>

              <Divider />

              <SectionTitle>Invoice Details</SectionTitle>
              <FieldToggle label="Invoice No" value={data.invoiceNo.value} visible={data.invoiceNo.visible} onChange={updateField('invoiceNo')} onToggle={toggleField('invoiceNo')} />
              <FieldToggle label="Date" value={data.date.value} visible={data.date.visible} onChange={updateField('date')} onToggle={toggleField('date')} />
              <FieldToggle label="Export Ref" value={data.exportRef.value} visible={data.exportRef.visible} onChange={updateField('exportRef')} onToggle={toggleField('exportRef')} />
              <FieldToggle label="IEC" value={data.iec.value} visible={data.iec.visible} onChange={updateField('iec')} onToggle={toggleField('iec')} />
              <FieldToggle label="AD Code" value={data.adCode.value} visible={data.adCode.visible} onChange={updateField('adCode')} onToggle={toggleField('adCode')} />
              <FieldToggle label="Buyer&apos;s Order" value={data.buyersOrder.value} visible={data.buyersOrder.visible} onChange={updateField('buyersOrder')} onToggle={toggleField('buyersOrder')} />
              <FieldToggle label="Notify/Buyer" value={data.notifyBuyer.value} visible={data.notifyBuyer.visible} onChange={updateField('notifyBuyer')} onToggle={toggleField('notifyBuyer')} multiline />

              <Divider />

              <SectionTitle>Consignee</SectionTitle>
              <FieldToggle label="Consignee" value={data.consignee.value} visible={data.consignee.visible} onChange={updateField('consignee')} onToggle={toggleField('consignee')} multiline />
              <FieldToggle label="Contact" value={data.contact.value} visible={data.contact.visible} onChange={updateField('contact')} onToggle={toggleField('contact')} />
              <FieldToggle label="Tel" value={data.tel.value} visible={data.tel.visible} onChange={updateField('tel')} onToggle={toggleField('tel')} />

              <Divider />

              <SectionTitle>Shipment</SectionTitle>
              <FieldToggle label="Country of Origin" value={data.countryOfOrigin.value} visible={data.countryOfOrigin.visible} onChange={updateField('countryOfOrigin')} onToggle={toggleField('countryOfOrigin')} />
              <FieldToggle label="Country of Destination" value={data.countryOfDestination.value} visible={data.countryOfDestination.visible} onChange={updateField('countryOfDestination')} onToggle={toggleField('countryOfDestination')} />
              <FieldToggle label="Pre-Carriage By" value={data.preCarriageBy.value} visible={data.preCarriageBy.visible} onChange={updateField('preCarriageBy')} onToggle={toggleField('preCarriageBy')} />
              <FieldToggle label="Place of Receipt" value={data.placeOfReceipt.value} visible={data.placeOfReceipt.visible} onChange={updateField('placeOfReceipt')} onToggle={toggleField('placeOfReceipt')} />
              <FieldToggle label="Vessel/Flight No" value={data.vesselFlightNo.value} visible={data.vesselFlightNo.visible} onChange={updateField('vesselFlightNo')} onToggle={toggleField('vesselFlightNo')} />
              <FieldToggle label="Port of Loading" value={data.portOfLoading.value} visible={data.portOfLoading.visible} onChange={updateField('portOfLoading')} onToggle={toggleField('portOfLoading')} />
              <FieldToggle label="Port of Discharge" value={data.portOfDischarge.value} visible={data.portOfDischarge.visible} onChange={updateField('portOfDischarge')} onToggle={toggleField('portOfDischarge')} />
              <FieldToggle label="Final Destination" value={data.finalDestination.value} visible={data.finalDestination.visible} onChange={updateField('finalDestination')} onToggle={toggleField('finalDestination')} />
              <FieldToggle label="Terms" value={data.terms.value} visible={data.terms.visible} onChange={updateField('terms')} onToggle={toggleField('terms')} />

              <Divider />

              <SectionTitle>Items Table</SectionTitle>
              {data.tableRows.map((row, rowIndex) => (
                <Box key={`row-${rowIndex}`}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="subtitle2">Row {rowIndex + 1}</Typography>
                    <IconButton aria-label="remove" onClick={() => removeTableRow(rowIndex)} size="large">
                      <IconTrash size="1.1rem" color={theme.palette.error.dark} />
                    </IconButton>
                  </Stack>
                  <Grid container spacing={1}>
                    {data.tableHeaders.map((header, colIndex) => (
                      <Grid key={`cell-${rowIndex}-${colIndex}`} item xs={12} sm={6}>
                        <TextField
                          label={`${header} (Row ${rowIndex + 1})`}
                          value={row[colIndex] || ''}
                          onChange={updateTableCell(rowIndex, colIndex)}
                          fullWidth
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))}
              <Button sx={{ color: theme.palette.secondary.dark }} variant="outlined" startIcon={<IconPlus />} onClick={addTableRow}>
                Add Table Row
              </Button>

              <Divider />

              <SectionTitle>Totals</SectionTitle>
              <Stack direction="row" spacing={1} alignItems="center">
                <FormControlLabel control={<Checkbox checked={data.total.visible} onChange={toggleField('total')} />} label="" />
                <TextField
                  label="Subtotal"
                  value={formatDisplay(subtotal)}
                  fullWidth
                  InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start">EUR</InputAdornment> }}
                />
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <FormControlLabel control={<Checkbox checked={data.packingCharge.visible} onChange={toggleField('packingCharge')} />} label="" />
                <TextField
                  label="Packing Charge"
                  value={formatDisplay(data.packingCharge.value)}
                  onChange={(event) =>
                    setData((prev) => ({
                      ...prev,
                      packingCharge: { ...prev.packingCharge, value: sanitizeAmountInput(event.target.value) }
                    }))
                  }
                  fullWidth
                  InputProps={{ startAdornment: <InputAdornment position="start">EUR</InputAdornment> }}
                  inputProps={{ inputMode: 'decimal', pattern: '[0-9.]*' }}
                />
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <FormControlLabel control={<Checkbox checked={data.forwarding.visible} onChange={toggleField('forwarding')} />} label="" />
                <TextField
                  label="Forwarding"
                  value={formatDisplay(data.forwarding.value)}
                  onChange={(event) =>
                    setData((prev) => ({
                      ...prev,
                      forwarding: { ...prev.forwarding, value: sanitizeAmountInput(event.target.value) }
                    }))
                  }
                  fullWidth
                  InputProps={{ startAdornment: <InputAdornment position="start">EUR</InputAdornment> }}
                  inputProps={{ inputMode: 'decimal', pattern: '[0-9.]*' }}
                />
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <FormControlLabel control={<Checkbox checked={data.insurance.visible} onChange={toggleField('insurance')} />} label="" />
                <TextField
                  label="Insurance"
                  value={formatDisplay(data.insurance.value)}
                  onChange={(event) =>
                    setData((prev) => ({
                      ...prev,
                      insurance: { ...prev.insurance, value: sanitizeAmountInput(event.target.value) }
                    }))
                  }
                  fullWidth
                  InputProps={{ startAdornment: <InputAdornment position="start">EUR</InputAdornment> }}
                  inputProps={{ inputMode: 'decimal', pattern: '[0-9.]*' }}
                />
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <FormControlLabel control={<Checkbox checked={data.grandTotal.visible} onChange={toggleField('grandTotal')} />} label="" />
                <TextField
                  label="Grand Total"
                  value={formatDisplay(grandTotal)}
                  fullWidth
                  InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start">EUR</InputAdornment> }}
                />
              </Stack>
              <FieldToggle label="Signature" value={data.signature.value} visible={data.signature.visible} onChange={updateField('signature')} onToggle={toggleField('signature')} />
              <FieldToggle label="Net Weight" value={data.netWeight.value} visible={data.netWeight.visible} onChange={updateField('netWeight')} onToggle={toggleField('netWeight')} />
              <FieldToggle label="Gross Weight" value={data.grossWeight.value} visible={data.grossWeight.visible} onChange={updateField('grossWeight')} onToggle={toggleField('grossWeight')} />

              <Divider />

              <SectionTitle>Declaration</SectionTitle>
              {data.declarationLines.map((line, index) => (
                <Stack key={`decl-${index}`} direction="row" spacing={1} alignItems="center">
                  <TextField
                    label={`Declaration Line ${index + 1}`}
                    value={line}
                    onChange={updateSimpleArrayField('declarationLines', index)}
                    fullWidth
                    multiline
                  />
                  <IconButton aria-label="remove" onClick={() => removeSimpleArrayItem('declarationLines', index)} size="large">
                    <IconTrash size="1.1rem" color={theme.palette.error.dark} />
                  </IconButton>
                </Stack>
              ))}
              <Button sx={{ color: theme.palette.secondary.dark }} variant="outlined" startIcon={<IconPlus />} onClick={() => addSimpleArrayItem('declarationLines')}>
                Add Declaration Line
              </Button>
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
