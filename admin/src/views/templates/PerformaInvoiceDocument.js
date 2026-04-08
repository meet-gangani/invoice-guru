import React, { useEffect, useMemo, useState } from 'react'
import { Box, Button, Checkbox, Dialog, DialogContent, DialogTitle, Divider, FormControl, FormControlLabel, Grid, IconButton, InputAdornment, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material'
import { createFilterOptions } from '@mui/material/Autocomplete'
import { IconPlus, IconTrash } from '@tabler/icons'
import { Document, Page, PDFViewer, StyleSheet, Text, View } from '@react-pdf/renderer'
import MainCard from 'ui-component/cards/MainCard'
import { useTheme } from '@mui/material/styles'
import { useNavigate, useParams } from 'react-router-dom'
import axiosInstance from '../../services/axiosInstance'
import EndpointService from '../../services/endpoint.service'
import EntityAutocomplete from 'components/EntityAutocomplete'
import { getStoredCompanyId, getStoredCustomerId, setStoredCompanyId, setStoredCustomerId } from 'utils/entitySelectionStorage'

const styles = StyleSheet.create({
  page: {
    paddingTop: 24,
    paddingBottom: 28,
    paddingHorizontal: 26,
    fontSize: 8.5,
    lineHeight: 1.35,
    fontFamily: 'Helvetica',
    color: '#111'
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1f2a5a' },
  subtitle: { fontSize: 11, fontWeight: 'bold', color: '#1f2a5a', textAlign: 'right' },
  sectionRow: { flexDirection: 'row', marginTop: 8 },
  leftCol: { width: '60%' },
  rightCol: { width: '40%', alignItems: 'flex-end' },
  addressLine: { marginBottom: 2 },
  metaTable: { border: '1pt solid #111', width: 170 },
  metaRow: { flexDirection: 'row', borderBottom: '1pt solid #111' },
  metaLabel: { width: '50%', padding: 4, fontWeight: 'bold', textAlign: 'right' },
  metaValue: { width: '50%', padding: 4, borderLeft: '1pt solid #111', backgroundColor: '#d9ddea' },
  blockRow: { flexDirection: 'row', marginTop: 8, gap: 8 },
  block: { border: '1pt solid #111', width: '50%' },
  blockHeader: { backgroundColor: '#2f3f7a', color: '#fff', padding: 4, fontWeight: 'bold' },
  blockBody: { padding: 6, minHeight: 60 },
  blockFooter: { borderTop: '1pt solid #111', padding: 4 },
  itemsTable: { border: '1pt solid #111', marginTop: 8 },
  itemsHeader: {
    flexDirection: 'row',
    backgroundColor: '#2f3f7a',
    color: '#fff',
    borderBottom: '1pt solid #111'
  },
  itemsRow: { flexDirection: 'row', borderBottom: '1pt solid #bbb', minHeight: 18, alignItems: 'stretch' },
  colDesc: { width: '52%', padding: 4, borderRight: '1pt solid #111' },
  colQty: { width: '10%', padding: 4, borderRight: '1pt solid #111', textAlign: 'center' },
  colRate: { width: '18%', padding: 4, borderRight: '1pt solid #111', textAlign: 'right' },
  colAmt: { width: '20%', padding: 4, textAlign: 'right' },
  notes: { marginTop: 6, color: '#c00', fontSize: 7.5 },
  gstRow: { marginTop: 6, fontWeight: 'bold' },
  wordRow: { marginTop: 4, borderTop: '1pt solid #111', borderBottom: '1pt solid #111', padding: 4 },
  footerRow: { flexDirection: 'row', marginTop: 6, borderTop: '1pt solid #111' },
  comments: { width: '65%' },
  commentsHeader: { backgroundColor: '#2f3f7a', color: '#fff', padding: 4, fontWeight: 'bold' },
  commentsBody: { padding: 6 },
  totals: { width: '35%', borderLeft: '1pt solid #111' },
  totalRow: { flexDirection: 'row', borderBottom: '1pt solid #111' },
  totalLabel: { width: '60%', padding: 4, fontWeight: 'bold' },
  totalValue: { width: '40%', padding: 4, textAlign: 'right' },
  footerSignature: { textAlign: 'right', marginTop: 8, fontWeight: 'bold' }
})

const PerformaPdf = ({ data }) => {
  const addressLines = data.addressLines.filter((line) => line.visible && line.value.trim() !== '')
  const customerLines = data.customerLines.filter((line) => line.visible && line.value.trim() !== '')
  const notifyLines = data.notifyLines.filter((line) => line.visible && line.value.trim() !== '')
  const parseAmount = (value) => {
    const cleaned = String(value || '').replace(/[^0-9.]/g, '')
    const parsed = Number.parseFloat(cleaned)
    return Number.isFinite(parsed) ? parsed : 0
  }
  const parseQty = (value) => {
    const cleaned = String(value || '').replace(/[^0-9.]/g, '')
    const parsed = Number.parseFloat(cleaned)
    return Number.isFinite(parsed) ? parsed : 0
  }

  const formatCurrency = (value) => `${data.currency} ${value.toFixed(2)}`
  const subtotal = data.itemRows.reduce((sum, row) => sum + parseQty(row.qty) * parseAmount(row.amount), 0)
  const freight = parseAmount(data.totals.find((t) => t.label === 'Freight')?.value)
  const packing = parseAmount(data.totals.find((t) => t.label === 'Packing')?.value)
  const insurance = parseAmount(data.totals.find((t) => t.label === 'Insurance')?.value)
  const total = subtotal + freight + packing + insurance
  const numberToWords = (value) => {
    const num = Math.floor(Number(value) || 0)
    if (num === 0) return 'ZERO'
    const ones = [ '', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN' ]
    const tens = [ '', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY' ]
    const twoDigits = (n) => {
      if (n < 20) return ones[n]
      const t = Math.floor(n / 10)
      const o = n % 10
      return `${tens[t]}${o ? ' ' + ones[o] : ''}`
    }
    const threeDigits = (n) => {
      const h = Math.floor(n / 100)
      const r = n % 100
      if (h && r) return `${ones[h]} HUNDRED ${twoDigits(r)}`
      if (h) return `${ones[h]} HUNDRED`
      return twoDigits(r)
    }
    const parts = []
    const crore = Math.floor(num / 10000000)
    const lakh = Math.floor((num / 100000) % 100)
    const thousand = Math.floor((num / 1000) % 100)
    const hundred = num % 1000
    if (crore) parts.push(`${threeDigits(crore)} CRORE`)
    if (lakh) parts.push(`${threeDigits(lakh)} LAKH`)
    if (thousand) parts.push(`${threeDigits(thousand)} THOUSAND`)
    if (hundred) parts.push(threeDigits(hundred))
    return parts.join(' ')
  }
  const amountInWords = `${numberToWords(total)} ONLY`
  const formatDate = (value) => {
    if (!value) return ''
    const raw = String(value).split('T')[0]
    const ddmmyyyy = raw.match(/^(\d{2})-(\d{2})-(\d{4})$/)
    if (ddmmyyyy) return raw
    const [ yyyy, mm, dd ] = raw.split('-')
    if (!yyyy || !mm || !dd) return value
    return `${dd}-${mm}-${yyyy}`
  }
  const normalizeLabel = (value = '') => value.trim().toUpperCase()
  const wrapUnbroken = (value, chunkSize = 12) => {
    const text = String(value ?? '')
    if (!text) return ''
    if (/\s/.test(text)) return text
    const chunks = text.match(new RegExp(`.{1,${chunkSize}}`, 'g'))
    return chunks ? chunks.join('\n') : text
  }

  return (
      <Document title="Performa">
        <Page size="A4" style={styles.page}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{data.companyName.visible ? data.companyName.value || '__________' : ''}</Text>
            <Text style={styles.subtitle}>{data.invoiceTitle.visible ? data.invoiceTitle.value || 'PERFORMA INVOICE' : ''}</Text>
          </View>

          <View style={styles.sectionRow}>
            <View style={styles.leftCol}>
              {addressLines.length ? (
                  addressLines.map((line, index) => (
                      <Text key={`addr-${index}`} style={styles.addressLine}>
                        {line.value}
                      </Text>
                  ))
              ) : (
                  <Text style={styles.addressLine}>__________</Text>
              )}
            </View>
            <View style={styles.rightCol}>
              <View style={styles.metaTable}>
                {data.metaFields.map((meta, index) =>
                    meta.visible ? (
                        <View
                            key={`meta-${index}`}
                            style={[ styles.metaRow, index === data.metaFields.length - 1 ? { borderBottomWidth: 0 } : null ]}
                        >
                          <Text style={styles.metaLabel}>{meta.label}</Text>
                          <Text style={styles.metaValue}>
                            {normalizeLabel(meta.label) === 'DATE' || normalizeLabel(meta.label) === 'DUE DATE'
                                ? formatDate(meta.value) || '__________'
                                : meta.value || '__________'}
                          </Text>
                        </View>
                    ) : null
                )}
              </View>
            </View>
          </View>

          <View style={styles.blockRow}>
            <View style={styles.block}>
              <Text style={styles.blockHeader}>{data.customerTitle.visible ? data.customerTitle.value : 'CUSTOMER DETAILS. SHIP TO'}</Text>
              <View style={styles.blockBody}>
                {customerLines.length ? customerLines.map((line, index) => <Text key={`cust-${index}`}>{line.value}</Text>) : <Text>__________</Text>}
              </View>
              <View style={styles.blockFooter}>
                {data.customerPhone.visible ? <Text>Ph: {data.customerPhone.value || '__________'}</Text> : null}
                {data.customerEmail.visible ? <Text>Mail ID: {data.customerEmail.value || '__________'}</Text> : null}
              </View>
            </View>
            <View style={styles.block}>
              <Text style={styles.blockHeader}>{data.notifyTitle.visible ? data.notifyTitle.value : 'NOTIFY BUYER - BILL TO'}</Text>
              <View style={styles.blockBody}>
                {notifyLines.length ? notifyLines.map((line, index) => <Text key={`notify-${index}`}>{line.value}</Text>) : <Text>__________</Text>}
              </View>
              <View style={styles.blockFooter}>
                {data.notifyPhone.visible ? <Text>Ph: {data.notifyPhone.value || '__________'}</Text> : null}
                {data.notifyEmail.visible ? <Text>Mail ID: {data.notifyEmail.value || '__________'}</Text> : null}
              </View>
            </View>
          </View>

          <View style={styles.itemsTable}>
            <View style={styles.itemsHeader}>
              <Text style={[ styles.colDesc, { color: '#fff', fontWeight: 'bold' } ]}>DESCRIPTION</Text>
              <Text style={[ styles.colQty, { color: '#fff', fontWeight: 'bold' } ]}>QTY</Text>
              <Text style={[ styles.colRate, { color: '#fff', fontWeight: 'bold' } ]}>AMOUNT</Text>
              <Text style={[ styles.colAmt, { color: '#fff', fontWeight: 'bold' } ]}>TOTAL AMOUNT</Text>
            </View>
            {data.itemRows.map((row, index) => {
              const lineTotal = parseQty(row.qty) * parseAmount(row.amount)
              return (
                <View
                    key={`item-${index}`}
                    style={[
                      styles.itemsRow,
                      { backgroundColor: index % 2 === 1 ? '#f4f4f4' : '#fff' }
                    ]}
                >
                  <Text style={styles.colDesc}>{row.description || ''}</Text>
                  <Text style={styles.colQty}>{wrapUnbroken(row.qty || '')}</Text>
                  <Text style={styles.colRate}>{row.amount || ''}</Text>
                  <Text style={styles.colAmt}>{lineTotal ? formatCurrency(lineTotal) : ''}</Text>
                </View>
              )
            })}
          </View>

          {data.notes.visible ? (
              <View style={styles.notes}>
                {data.notes.value.split('\n').map((line, idx) => (
                    <Text key={`note-${idx}`}>{line}</Text>
                ))}
              </View>
          ) : null}

          {data.gstin.visible ? <Text style={styles.gstRow}>GST IN NO: {data.gstin.value || '__________'}</Text> : null}

          {data.word.visible ? (
              <Text style={styles.wordRow}>Word: {data.word.value || amountInWords}</Text>
          ) : null}

          <View style={styles.footerRow}>
            <View style={styles.comments}>
              <Text style={styles.commentsHeader}>OTHER COMMENTS</Text>
              <View style={styles.commentsBody}>
                {data.commentsLines.filter((l) => l.visible && l.value.trim() !== '').map((line, idx) => (
                    <Text key={`comment-${idx}`}>{line.value}</Text>
                ))}
              </View>
            </View>
            <View style={styles.totals}>
              {data.totals.map((totalItem, idx) => {
                const label = totalItem.label
                const computedValue =
                    label === 'Subtotal'
                        ? formatCurrency(subtotal)
                        : label === 'Total'
                            ? formatCurrency(total)
                            : totalItem.value
                return totalItem.visible ? (
                    <View
                        key={`total-${idx}`}
                        style={[
                          styles.totalRow,
                          totalItem.highlight ? { backgroundColor: '#ffef6b' } : null
                        ]}
                    >
                      <Text style={styles.totalLabel}>{label}</Text>
                      <Text style={styles.totalValue}>{computedValue}</Text>
                    </View>
                ) : null
              })}
            </View>
          </View>

          {data.signature.visible ? <Text style={styles.footerSignature}>{data.signature.value || '__________'}</Text> : null}
        </Page>
      </Document>
  )
}

const PdfPreview = React.memo(({ data }) => (
    <PDFViewer style={{ width: '100%', height: '100%' }}>
      <PerformaPdf data={data}/>
    </PDFViewer>
))

const defaultData = {
  currency: 'INR',
  companyName: { value: 'UNIQUE WAVES', visible: true },
  invoiceTitle: { value: 'PERFORMA INVOICE', visible: true },
  date: '',
  addressLines: [
    { value: '102 PRABHU PRASAD BUILDING', visible: true },
    { value: 'NEAR SRK HOUSE,', visible: true },
    { value: 'KASANAGAR, KATARGAM ROAD', visible: true },
    { value: 'surat-395006. GUJARAT. INDIA', visible: true },
    { value: 'gauravmistry1413@gmail.com', visible: true },
    { value: 'GAURAV MISTRY M.: +91 8690045693 / 9537515827', visible: true }
  ],
  metaFields: [
    { label: 'DATE', value: '', visible: true },
    { label: 'INVOICE #', value: '', visible: true },
    { label: 'CONTRACT NO', value: '', visible: true },
    { label: 'DUE DATE', value: '', visible: true }
  ],
  customerTitle: { value: 'CUSTOMER DETAILS. SHIP TO', visible: true },
  customerLines: [ { value: '', visible: true } ],
  customerPhone: { value: '', visible: true },
  customerEmail: { value: '', visible: true },
  notifyTitle: { value: 'NOTIFY BUYER - BILL TO', visible: true },
  notifyLines: [ { value: '', visible: true } ],
  notifyPhone: { value: '', visible: true },
  notifyEmail: { value: '', visible: true },
  itemRows: [ { description: '', qty: '', amount: '' } ],
  notes: {
    value:
        '1. Warranty Is start On The Day When We Shipped A Shipment\n2. If You Do Installation By Your Own Then If Any Kind Of Problem Accure During Installation Then We Are Not Responsible\n3. If You Want Our Technician On Your Place Then You Have To Pay Visa Charges, residence, labor permits & Round Trip For A Technician Person',
    visible: true
  },
  gstin: { value: '24AAFFU9324C1ZC', visible: true },
  word: { value: '', visible: true },
  commentsLines: [
    { value: '100 % PAYMENT ADVANCE', visible: true },
    { value: 'BANK : AXIS BANK            A/C NO : 9230 2002 7581 472', visible: true },
    { value: 'BRANCH : KATARGAM            IFSC CODE : UTIB0001440', visible: true },
    { value: 'SWIFT CODE : AXISINBBA48.      MICR CODE : 395211008', visible: true },
    { value: 'Near harikrishna Export, katargam , Surat-395004. Gujarat. INDIA', visible: true }
  ],
  totals: [
    { label: 'Subtotal', value: '0', visible: true, highlight: false },
    { label: 'Freight', value: '0', visible: true, highlight: true },
    { label: 'Packing', value: '0', visible: true, highlight: true },
    { label: 'Insurance', value: '0', visible: true, highlight: false },
    { label: 'Total', value: '0', visible: true, highlight: false }
  ],
  signature: { value: 'UNIQUE WAVES', visible: true }
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

export default function PerformaInvoiceDocument() {
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
  const [ newCustomerDraft, setNewCustomerDraft ] = useState(null)
  const [ isCreatingCustomer, setIsCreatingCustomer ] = useState(false)
  const [ isAddCustomerOpen, setIsAddCustomerOpen ] = useState(false)
  const [companyValue, setCompanyValue] = useState(null)
  const [companyInputValue, setCompanyInputValue] = useState("")

  const currencyList = [
    "AUD","BGN","BRL","CAD","CHF","CNY","CZK","DKK","EUR","GBP","HKD",
    "HUF","IDR","ILS","INR","ISK","JPY","KRW","MXN","MYR","NOK","NZD",
    "PHP","PLN","RON","SEK","SGD","THB","TRY","USD","ZAR"
  ]

  const normalizeLabel = (value = '') => value.trim().toUpperCase()
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
  const sanitizeAlphaNumUpper = (value) => value.replace(/[^a-z0-9]/gi, '').toUpperCase()
  const sanitizeDigits = (value) => value.replace(/\D/g, '')

  const sanitizeAmountInput = (value) => {
    const cleaned = String(value || '').replace(/[^0-9.]/g, '')
    const parts = cleaned.split('.')
    if (parts.length <= 1) return cleaned
    return `${parts[0]}.${parts.slice(1).join('')}`
  }

  const splitToLines = (value) => {
    if (!value) return []
    const raw = String(value).trim()
    if (!raw) return []
    const byNewLine = raw.split('\n').map((line) => line.trim()).filter(Boolean)
    if (byNewLine.length > 1) return byNewLine
    return [ raw ]
  }

  const buildLines = (values) => values.filter(Boolean).map((value) => ({ value, visible: true }))

  const applyCompanyToForm = (company) => {
    if (!company) return
    const addressLines = buildLines([
      ...splitToLines(company.address),
      company.pinCode ? `PIN: ${company.pinCode}` : '',
      company.contactPerson || '',
      company.contactNumber || '',
      company.username || ''
    ])

    setData((prev) => ({
      ...prev,
      companyName: { ...prev.companyName, value: company.name || '' },
      addressLines: addressLines.length ? addressLines : prev.addressLines,
      signature: {
        ...prev.signature,
        value: company.name || prev.signature.value
      }
    }))
  }

  const clearCompanyFromForm = () => {
    setData((prev) => ({
      ...prev,
      companyName: { ...prev.companyName, value: '' },
      addressLines: (prev.addressLines?.length ? prev.addressLines : [ { value: '', visible: true } ]).map((line) => ({
        ...line,
        value: ''
      })),
      signature: { ...prev.signature, value: '' }
    }))
  }

  useEffect(() => {
    setData((prev) => {
      const companyName = String(prev.companyName?.value || '').trim()
      const signatureValue = String(prev.signature?.value || '').trim()
      const defaultSignature = String(defaultData.signature?.value || '').trim()

      if (!companyName) return prev
      if (signatureValue && signatureValue !== defaultSignature) return prev
      if (signatureValue === companyName) return prev

      return {
        ...prev,
        signature: {
          ...prev.signature,
          value: companyName
        }
      }
    })
  }, [ data.companyName?.value ])

  const applyCustomerToForm = (customer) => {
    if (!customer) return
    const shipLines = buildLines([
      customer.name,
      ...splitToLines(customer.shipTo || customer.address),
      customer.pinCode ? `PIN: ${customer.pinCode}` : ''
    ])
    const billLines = buildLines([
      customer.name,
      ...splitToLines(customer.billTo || customer.address),
      customer.pinCode ? `PIN: ${customer.pinCode}` : ''
    ])

    setData((prev) => ({
      ...prev,
      customerLines: shipLines.length ? shipLines : prev.customerLines,
      notifyLines: billLines.length ? billLines : prev.notifyLines,
      customerPhone: { ...prev.customerPhone, value: customer.contact || '' },
      customerEmail: { ...prev.customerEmail, value: customer.mail || '' },
      notifyPhone: { ...prev.notifyPhone, value: customer.contact || '' },
      notifyEmail: { ...prev.notifyEmail, value: customer.mail || '' }
    }))
  }

  const clearCustomerFromForm = () => {
    setData((prev) => ({
      ...prev,
      customerLines: (prev.customerLines?.length ? prev.customerLines : [ { value: '', visible: true } ]).map((line) => ({
        ...line,
        value: ''
      })),
      notifyLines: (prev.notifyLines?.length ? prev.notifyLines : [ { value: '', visible: true } ]).map((line) => ({
        ...line,
        value: ''
      })),
      customerPhone: { ...prev.customerPhone, value: '' },
      customerEmail: { ...prev.customerEmail, value: '' },
      notifyPhone: { ...prev.notifyPhone, value: '' },
      notifyEmail: { ...prev.notifyEmail, value: '' }
    }))
  }

  const openAddCustomerDialog = (name = '') => {
    setNewCustomerDraft({
      name: name || '',
      mail: '',
      address: '',
      pinCode: '',
      shipTo: '',
      billTo: '',
      contact: ''
    })
    setIsAddCustomerOpen(true)
  }

  const updateField = (field) => (event) => {
    setData((prev) => ({ ...prev, [field]: { ...prev[field], value: event.target.value } }))
  }

  const toggleField = (field) => (event) => {
    setData((prev) => ({ ...prev, [field]: { ...prev[field], visible: event.target.checked } }))
  }

  const updateAddressLine = (index) => (event) => {
    setData((prev) => {
      const next = [ ...(prev.addressLines || []) ]
      next[index] = { ...next[index], value: event.target.value }
      return { ...prev, addressLines: next }
    })
  }

  const toggleAddressLine = (index) => (event) => {
    setData((prev) => {
      const next = [ ...(prev.addressLines || []) ]
      next[index] = { ...next[index], visible: event.target.checked }
      return { ...prev, addressLines: next }
    })
  }

  const addAddressLine = () => {
    setData((prev) => ({
      ...prev,
      addressLines: [ ...(prev.addressLines || []), { value: '', visible: true } ]
    }))
  }

  const removeAddressLine = (index) => {
    setData((prev) => {
      const next = [ ...(prev.addressLines || []) ]
      next.splice(index, 1)
      return { ...prev, addressLines: next }
    })
  }

  const updateMetaField = (index) => (event) => {
    setData((prev) => {
      const next = [ ...(prev.metaFields || []) ]
      const label = normalizeLabel(next[index].label)
      const raw = event.target.value
      const value = label === 'INVOICE #' ? sanitizeAlphaNumUpper(raw) : raw
      next[index] = { ...next[index], value }
      return label === 'DATE' ? { ...prev, metaFields: next, date: value } : { ...prev, metaFields: next }
    })
  }

  const toggleMetaField = (index) => (event) => {
    setData((prev) => {
      const next = [ ...(prev.metaFields || []) ]
      next[index] = { ...next[index], visible: event.target.checked }
      return { ...prev, metaFields: next }
    })
  }

  const updateCustomerLine = (index) => (event) => {
    setData((prev) => {
      const next = [ ...(prev.customerLines || []) ]
      next[index] = { ...next[index], value: event.target.value }
      return { ...prev, customerLines: next }
    })
  }

  const toggleCustomerLine = (index) => (event) => {
    setData((prev) => {
      const next = [ ...(prev.customerLines || []) ]
      next[index] = { ...next[index], visible: event.target.checked }
      return { ...prev, customerLines: next }
    })
  }

  const addCustomerLine = () => {
    setData((prev) => ({
      ...prev,
      customerLines: [ ...(prev.customerLines || []), { value: '', visible: true } ]
    }))
  }

  const removeCustomerLine = (index) => {
    setData((prev) => {
      const next = [ ...(prev.customerLines || []) ]
      next.splice(index, 1)
      return { ...prev, customerLines: next }
    })
  }

  const updateNotifyLine = (index) => (event) => {
    setData((prev) => {
      const next = [ ...(prev.notifyLines || []) ]
      next[index] = { ...next[index], value: event.target.value }
      return { ...prev, notifyLines: next }
    })
  }

  const toggleNotifyLine = (index) => (event) => {
    setData((prev) => {
      const next = [ ...(prev.notifyLines || []) ]
      next[index] = { ...next[index], visible: event.target.checked }
      return { ...prev, notifyLines: next }
    })
  }

  const addNotifyLine = () => {
    setData((prev) => ({
      ...prev,
      notifyLines: [ ...(prev.notifyLines || []), { value: '', visible: true } ]
    }))
  }

  const removeNotifyLine = (index) => {
    setData((prev) => {
      const next = [ ...(prev.notifyLines || []) ]
      next.splice(index, 1)
      return { ...prev, notifyLines: next }
    })
  }

  const updateItemRow = (rowIndex, field) => (event) => {
    const value = event.target.value
    setData((prev) => {
      const next = [ ...(prev.itemRows || []) ]
      next[rowIndex] = { ...next[rowIndex], [field]: value }
      return { ...prev, itemRows: next }
    })
  }

  const addItemRow = () => {
    setData((prev) => ({
      ...prev,
      itemRows: [ ...(prev.itemRows || []), { description: '', qty: '', amount: '' } ]
    }))
  }

  const removeItemRow = (index) => {
    setData((prev) => {
      const next = [ ...(prev.itemRows || []) ]
      next.splice(index, 1)
      return { ...prev, itemRows: next }
    })
  }

  const updateNotes = (event) => {
    setData((prev) => ({ ...prev, notes: { ...prev.notes, value: event.target.value } }))
  }

  const toggleNotes = (event) => {
    setData((prev) => ({ ...prev, notes: { ...prev.notes, visible: event.target.checked } }))
  }

  const updateCommentsLine = (index) => (event) => {
    setData((prev) => {
      const next = [ ...(prev.commentsLines || []) ]
      next[index] = { ...next[index], value: event.target.value }
      return { ...prev, commentsLines: next }
    })
  }

  const toggleCommentsLine = (index) => (event) => {
    setData((prev) => {
      const next = [ ...(prev.commentsLines || []) ]
      next[index] = { ...next[index], visible: event.target.checked }
      return { ...prev, commentsLines: next }
    })
  }

  const addCommentsLine = () => {
    setData((prev) => ({
      ...prev,
      commentsLines: [ ...(prev.commentsLines || []), { value: '', visible: true } ]
    }))
  }

  const removeCommentsLine = (index) => {
    setData((prev) => {
      const next = [ ...(prev.commentsLines || []) ]
      next.splice(index, 1)
      return { ...prev, commentsLines: next }
    })
  }

  const updateTotal = (index) => (event) => {
    setData((prev) => {
      const next = [ ...(prev.totals || []) ]
      const label = next[index].label
      if (label === 'Subtotal' || label === 'Total') {
        return prev
      }
      next[index] = { ...next[index], value: sanitizeAmountInput(event.target.value) }
      return { ...prev, totals: next }
    })
  }

  const toggleTotal = (index) => (event) => {
    setData((prev) => {
      const next = [ ...(prev.totals || []) ]
      next[index] = { ...next[index], visible: event.target.checked }
      return { ...prev, totals: next }
    })
  }

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
    try{
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

  const handleCreateCustomer = async () => {
    if (!newCustomerDraft?.name || !newCustomerDraft?.mail) return
    try {
      setIsCreatingCustomer(true)
      await axiosInstance.post('/v1/customer/create', newCustomerDraft)
      const nextCustomers = await fetchCustomers()
      const match = nextCustomers.find(
          (item) => item.name === newCustomerDraft.name && item.mail === newCustomerDraft.mail
      ) || nextCustomers.find((item) => item.name === newCustomerDraft.name)
      if (match) {
        setSelectedCustomerId(match._id)
        setCustomerValue(match)
        setCustomerInputValue(match.name || '')
        applyCustomerToForm(match)
      }
      setNewCustomerDraft(null)
      setIsAddCustomerOpen(false)
    } finally {
      setIsCreatingCustomer(false)
    }
  }

  const normalizeMetaFieldsDate = (metaFields, dateValue) => {
    if (!Array.isArray(metaFields)) return metaFields
    return metaFields.map((meta) => {
      const label = normalizeLabel(meta.label)
      if (label === 'DATE') {
        return { ...meta, value: dateValue || meta.value }
      }
      return meta
    })
  }

  useEffect(() => {
    setHasSaved(false)
    let isActive = true
    const loadInvoice = async () => {
      if (invoiceId) {
        try {
          const response = await axiosInstance.get(`/v1/invoice/${invoiceId}`)
          if (!isActive) return
          const invoice = response?.data || {}
          const templateData = invoice?.performa || invoice?.data || {}
          const merged = {
            ...defaultData,
            ...templateData,
            currency: invoice.currency,
            date: normalizeDateInput(templateData?.date || invoice?.date || '')
          }
          merged.metaFields = normalizeMetaFieldsDate(merged.metaFields, merged.date)
          const invoiceCompanyId =
              typeof invoice?.company === 'string' ? invoice.company : invoice?.company?._id || ''
          const invoiceCustomerId =
              typeof invoice?.customer === 'string' ? invoice.customer : invoice?.customer?._id || ''
          const storedCompanyId = getStoredCompanyId()
          const storedCustomerId = getStoredCustomerId()
          setSelectedCompanyId(invoiceCompanyId || storedCompanyId || '')
          setSelectedCustomerId(invoiceCustomerId || storedCustomerId || '')
          setData(merged)
          setPdfData(merged)
          setIsApproved(Boolean(invoice?.performaApproved))
          setHasSaved(false)
        } catch (error) {
          if (!isActive) return
          setData(defaultData)
          setPdfData(defaultData)
          setSelectedCompanyId(getStoredCompanyId() || '')
          setSelectedCustomerId(getStoredCustomerId() || '')
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

  useEffect(() => {
    if (!invoiceId) return
    setStoredCompanyId(selectedCompanyId)
  }, [ selectedCompanyId, invoiceId ])

  useEffect(() => {
    if (!invoiceId) return
    setStoredCustomerId(selectedCustomerId)
  }, [ selectedCustomerId, invoiceId ])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const { date, ...restOfState } = data
      const payloadDate = formatDateForSave(date)
      const payload = {
        _id: invoiceId,
        date: payloadDate,
        template: 'performa',
        performa: restOfState,
        company: selectedCompanyId || undefined,
        customer: selectedCustomerId || undefined,
        currency: data.currency
      }
      const response = await axiosInstance.post('/v1/invoice/save', payload)
      const savedInvoice = response?.data
      if (savedInvoice?._id && !invoiceId) {
        navigate(`/performa/${savedInvoice._id}`, { replace: true })
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
        template: 'performa',
        performa: restOfState,
        company: selectedCompanyId || undefined,
        customer: selectedCustomerId || undefined,
        performaApproved: nextApproved,
        currency: data.currency
      }
      const response = await axiosInstance.post('/v1/invoice/save', payload)
      const savedInvoice = response?.data
      setIsApproved(Boolean(savedInvoice?.performaApproved ?? nextApproved))
    } finally {
      setIsApproving(false)
    }
  }

  return (
      <MainCard
          title="Performa"
          secondary={(
              <Stack direction="row" spacing={1}>
                <FormControl size="small" sx={{ minWidth: 110 }}>
                  <InputLabel id="currency-select-label">Currency</InputLabel>
                  <Select
                    labelId="currency-select-label"
                    value={data.currency}
                    label="Currency"
                    onChange={(event) =>
                      setData((prev) => ({
                        ...prev,
                        currency: event.target.value
                      }))
                    }
                  >
                    {currencyList.map((currency) => (
                      <MenuItem key={currency} value={currency}>
                        {currency}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

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
              <PdfPreview data={pdfData}/>
            </Box>
          </Grid>
          <Grid item xs={12} md={5}>
            <Box sx={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto', pr: { md: 1 } }}>
              <Stack spacing={2}>
                <Typography variant="body2" color="textSecondary">
                  Toggle any field to show/hide it in the PDF, and edit values inline.
                </Typography>

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
                      return
                    }

                  }}
                />

                <FieldToggle label="Company Name" value={data.companyName.value} visible={data.companyName.visible} onChange={updateField('companyName')} onToggle={toggleField('companyName')}/>
                <FieldToggle label="Invoice Title" value={data.invoiceTitle.value} visible={data.invoiceTitle.visible} onChange={updateField('invoiceTitle')} onToggle={toggleField('invoiceTitle')}/>

                <Divider/>

                <SectionTitle>Address Lines</SectionTitle>
                {data.addressLines.map((line, index) => (
                    <Stack key={`addr-${index}`} direction="row" spacing={1} alignItems="center">
                      <FormControlLabel control={<Checkbox checked={line.visible} onChange={toggleAddressLine(index)}/>} label=""/>
                      <TextField label={`Address Line ${index + 1}`} value={line.value} onChange={updateAddressLine(index)} fullWidth/>
                      <IconButton aria-label="remove" onClick={() => removeAddressLine(index)} size="large">
                        <IconTrash size="1.1rem" color={theme.palette.error.dark}/>
                      </IconButton>
                    </Stack>
                ))}
                <Button sx={{ color: theme.palette.secondary.dark }} variant="outlined" startIcon={<IconPlus/>} onClick={addAddressLine}>
                  Add Address Line
                </Button>

                <Divider/>

                <SectionTitle>Invoice Meta</SectionTitle>
                {data.metaFields.map((meta, index) => {
                  const label = normalizeLabel(meta.label)
                  const isDate = label === 'DATE' || label === 'DUE DATE'
                  return (
                      <Stack key={`meta-${index}`} direction="row" spacing={1} alignItems="center">
                        <FormControlLabel control={<Checkbox checked={meta.visible} onChange={toggleMetaField(index)}/>} label=""/>
                        <TextField
                            label={meta.label}
                            value={meta.value}
                            onChange={updateMetaField(index)}
                            fullWidth
                            type={isDate ? 'date' : 'text'}
                            InputLabelProps={isDate ? { shrink: true } : undefined}
                        />
                      </Stack>
                  )
                })}

                <Divider/>

                <SectionTitle>Customer Selection</SectionTitle>
                <EntityAutocomplete
                  label="Customer"
                  options={customers}
                  value={customerValue}
                  inputValue={customerInputValue}
                  allowAdd={true}
                  onInputChange={setCustomerInputValue}
                  onChange={(newValue) => {

                    if (typeof newValue === "string") {
                      const name = newValue.trim();
                      if (!name) return;

                      setSelectedCustomerId("");
                      setCustomerValue(null);
                      openAddCustomerDialog(name);
                      return;
                    }

                    if (newValue?.inputValue) {
                      const name = newValue.inputValue.trim();
                      if (!name) return;

                      setSelectedCustomerId("");
                      setCustomerValue(null);
                      openAddCustomerDialog(name);
                      return;
                    }

                    if (newValue?._id) {
                      setSelectedCustomerId(newValue._id);
                      setCustomerValue(newValue);
                      applyCustomerToForm(newValue);
                      return;
                    }

                    setSelectedCustomerId("");
                    setCustomerValue(null);
                    clearCustomerFromForm();
                  }}
                />

                <Dialog
                    open={isAddCustomerOpen}
                    onClose={() => {
                      setIsAddCustomerOpen(false)
                      setNewCustomerDraft(null)
                    }}
                    fullWidth
                    maxWidth="sm"
                >
                  <DialogTitle sx={{ fontSize: '20px', fontWeight: 600, pt: 3 }}>
                    Add Customer
                  </DialogTitle>
                  <DialogContent>
                    <form
                        onSubmit={(event) => {
                          event.preventDefault()
                          handleCreateCustomer()
                        }}
                    >
                      <Stack spacing={3} mt={1}>
                        <TextField
                            required
                            label="Name"
                            value={newCustomerDraft?.name || ''}
                            onChange={(event) =>
                                setNewCustomerDraft((prev) => ({ ...prev, name: event.target.value }))
                            }
                        />

                        <TextField
                            label="Address"
                            multiline
                            minRows={2}
                            value={newCustomerDraft?.address || ''}
                            onChange={(event) =>
                                setNewCustomerDraft((prev) => ({ ...prev, address: event.target.value }))
                            }
                        />

                        <TextField
                            required
                            type="email"
                            label="Mail"
                            value={newCustomerDraft?.mail || ''}
                            onChange={(event) =>
                                setNewCustomerDraft((prev) => ({ ...prev, mail: event.target.value }))
                            }
                        />

                        <TextField
                            type="tel"
                            label="Contact"
                            value={newCustomerDraft?.contact || ''}
                            onChange={(event) =>
                                setNewCustomerDraft((prev) => ({ ...prev, contact: event.target.value }))
                            }
                        />

                        <TextField
                            type="text"
                            label="Pin Code"
                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                            value={newCustomerDraft?.pinCode || ''}
                            onChange={(event) =>
                                setNewCustomerDraft((prev) => ({ ...prev, pinCode: event.target.value }))
                            }
                        />

                        <TextField
                            label="Ship To"
                            multiline
                            minRows={2}
                            value={newCustomerDraft?.shipTo || ''}
                            onChange={(event) =>
                                setNewCustomerDraft((prev) => ({ ...prev, shipTo: event.target.value }))
                            }
                        />

                        <TextField
                            label="Bill To"
                            multiline
                            minRows={2}
                            value={newCustomerDraft?.billTo || ''}
                            onChange={(event) =>
                                setNewCustomerDraft((prev) => ({ ...prev, billTo: event.target.value }))
                            }
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            sx={{ backgroundColor: theme.palette.secondary.main }}
                            disabled={!newCustomerDraft?.name || !newCustomerDraft?.mail || isCreatingCustomer}
                        >
                          {isCreatingCustomer ? 'Adding...' : 'Add New Customer'}
                        </Button>
                      </Stack>
                    </form>
                  </DialogContent>
                </Dialog>

                <Divider/>

                <SectionTitle>Customer (Ship To)</SectionTitle>
                {data.customerLines.map((line, index) => (
                    <Stack key={`cust-${index}`} direction="row" spacing={1} alignItems="center">
                      <FormControlLabel control={<Checkbox checked={line.visible} onChange={toggleCustomerLine(index)}/>} label=""/>
                      <TextField label={`Customer Line ${index + 1}`} value={line.value} onChange={updateCustomerLine(index)} fullWidth/>
                      <IconButton aria-label="remove" onClick={() => removeCustomerLine(index)} size="large">
                        <IconTrash size="1.1rem" color={theme.palette.error.dark}/>
                      </IconButton>
                    </Stack>
                ))}
                <Button sx={{ color: theme.palette.secondary.dark }} variant="outlined" startIcon={<IconPlus/>} onClick={addCustomerLine}>
                  Add Customer Line
                </Button>
                <FieldToggle
                    label="Customer Phone"
                    value={data.customerPhone.value}
                    visible={data.customerPhone.visible}
                    onChange={(event) =>
                        setData((prev) => ({
                          ...prev,
                          customerPhone: { ...prev.customerPhone, value: sanitizeDigits(event.target.value) }
                        }))
                    }
                    onToggle={toggleField('customerPhone')}
                />
                <FieldToggle label="Customer Email" value={data.customerEmail.value} visible={data.customerEmail.visible} onChange={updateField('customerEmail')}
                             onToggle={toggleField('customerEmail')}/>

                <Divider/>

                <SectionTitle>Notify Buyer</SectionTitle>
                {data.notifyLines.map((line, index) => (
                    <Stack key={`notify-${index}`} direction="row" spacing={1} alignItems="center">
                      <FormControlLabel control={<Checkbox checked={line.visible} onChange={toggleNotifyLine(index)}/>} label=""/>
                      <TextField label={`Notify Line ${index + 1}`} value={line.value} onChange={updateNotifyLine(index)} fullWidth/>
                      <IconButton aria-label="remove" onClick={() => removeNotifyLine(index)} size="large">
                        <IconTrash size="1.1rem" color={theme.palette.error.dark}/>
                      </IconButton>
                    </Stack>
                ))}
                <Button sx={{ color: theme.palette.secondary.dark }} variant="outlined" startIcon={<IconPlus/>} onClick={addNotifyLine}>
                  Add Notify Line
                </Button>
                <FieldToggle
                    label="Notify Phone"
                    value={data.notifyPhone.value}
                    visible={data.notifyPhone.visible}
                    onChange={(event) =>
                        setData((prev) => ({
                          ...prev,
                          notifyPhone: { ...prev.notifyPhone, value: sanitizeDigits(event.target.value) }
                        }))
                    }
                    onToggle={toggleField('notifyPhone')}
                />
                <FieldToggle label="Notify Email" value={data.notifyEmail.value} visible={data.notifyEmail.visible} onChange={updateField('notifyEmail')} onToggle={toggleField('notifyEmail')}/>

                <Divider/>

                <SectionTitle>Items</SectionTitle>
                {data.itemRows.map((row, index) => {
                  // const lineTotal = parseQty(row.qty) * parseAmount(row.amount)
                  return (
                    <Box key={`item-${index}`}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="subtitle2">Row {index + 1}</Typography>
                        <IconButton aria-label="remove" onClick={() => removeItemRow(index)} size="large">
                          <IconTrash size="1.1rem" color={theme.palette.error.dark}/>
                        </IconButton>
                      </Stack>
                      <Grid container spacing={1.5}>
                        <Grid item xs={12}>
                          <TextField label="Description" value={row.description} onChange={updateItemRow(index, 'description')} fullWidth multiline/>
                        </Grid>
                        <Grid item xs={6}>
                          <TextField label="Qty" type='number' value={row.qty} onChange={updateItemRow(index, 'qty')} fullWidth/>
                        </Grid>
                        <Grid item xs={6}>
                          <TextField label="Amount" value={row.amount} onChange={updateItemRow(index, 'amount')} fullWidth inputProps={{ inputMode: 'decimal', pattern: '[0-9.]*' }}/>
                        </Grid>
                        {/* <Grid item xs={6}>
                          <TextField label="Total Amount" value={formatDisplay(lineTotal)} fullWidth InputProps={{ readOnly: true }}/>
                        </Grid> */}
                      </Grid>
                    </Box>
                  )
                })}
                <Button sx={{ color: theme.palette.secondary.dark }} variant="outlined" startIcon={<IconPlus/>} onClick={addItemRow}>
                  Add Item Row
                </Button>

                <Divider/>

                <SectionTitle>Notes</SectionTitle>
                <FieldToggle label="Notes" value={data.notes.value} visible={data.notes.visible} onChange={updateNotes} onToggle={toggleNotes} multiline/>
                <FieldToggle label="GSTIN" value={data.gstin.value} visible={data.gstin.visible} onChange={updateField('gstin')} onToggle={toggleField('gstin')}/>
                <FieldToggle label="Word" value={data.word.value} visible={data.word.visible} onChange={updateField('word')} onToggle={toggleField('word')}/>

                <Divider/>

                <SectionTitle>Other Comments</SectionTitle>
                {data.commentsLines.map((line, index) => (
                    <Stack key={`comment-${index}`} direction="row" spacing={1} alignItems="center">
                      <FormControlLabel control={<Checkbox checked={line.visible} onChange={toggleCommentsLine(index)}/>} label=""/>
                      <TextField label={`Comment ${index + 1}`} value={line.value} onChange={updateCommentsLine(index)} fullWidth/>
                      <IconButton aria-label="remove" onClick={() => removeCommentsLine(index)} size="large">
                        <IconTrash size="1.1rem" color={theme.palette.error.dark}/>
                      </IconButton>
                    </Stack>
                ))}
                <Button sx={{ color: theme.palette.secondary.dark }} variant="outlined" startIcon={<IconPlus/>} onClick={addCommentsLine}>
                  Add Comment Line
                </Button>

                <Divider/>

                <SectionTitle>Totals</SectionTitle>
                {data.totals.map((totalItem, index) => {
                  const label = totalItem.label
                  if (label === 'Subtotal' || label === 'Total') {
                    return null
                  }
                  return (
                      <Stack key={`total-${index}`} direction="row" spacing={1} alignItems="center">
                        <FormControlLabel control={<Checkbox checked={totalItem.visible} onChange={toggleTotal(index)}/>} label=""/>
                        <TextField
                            label={label}
                            value={totalItem.value}
                            onChange={updateTotal(index)}
                            fullWidth
                            InputProps={{
                              startAdornment: <InputAdornment position="start">{data.currency}</InputAdornment>
                            }}
                            inputProps={{ inputMode: 'decimal', pattern: '[0-9.]*' }}
                        />
                      </Stack>
                  )
                })}

                <Divider/>

                <SectionTitle>Signature</SectionTitle>
                <FieldToggle label="Signature" value={data.signature.value} visible={data.signature.visible} onChange={updateField('signature')} onToggle={toggleField('signature')}/>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </MainCard>
  )
}
