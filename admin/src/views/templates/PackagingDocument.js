import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Button, Checkbox, Divider, FormControlLabel, Grid, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material'
import { IconPlus, IconTrash } from '@tabler/icons'
import { Document, Image, Page, PDFViewer, StyleSheet, Text, View } from '@react-pdf/renderer'
import MainCard from 'ui-component/cards/MainCard'
import { useTheme } from '@mui/material/styles'
import { useNavigate, useParams } from 'react-router-dom'
import axiosInstance from '../../services/axiosInstance'
import EndpointService from '../../services/endpoint.service'
import EntityAutocomplete from 'components/EntityAutocomplete'
import { getStoredCompanyId, getStoredCustomerId, setStoredCompanyId, setStoredCustomerId } from 'utils/entitySelectionStorage'

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 8, fontFamily: 'Helvetica', color: '#000' },
  table: { border: '1pt solid black', width: '100%' },
  row: { flexDirection: 'row' },
  cell: { borderRight: '1pt solid black', borderBottom: '1pt solid black', padding: 8 },
  cellLast: { borderBottom: '1pt solid black', padding: 4 },
  label: { fontSize: 6, fontWeight: 'bold' },
  value: { fontSize: 8 },
  header: { textAlign: 'center', fontWeight: 'bold', fontSize: 9, padding: 4, borderBottom: '1pt solid black' },
  subHeader: { fontSize: 6, textAlign: 'center', borderBottom: '1pt solid black', padding: 3 },
  sectionTitle: { fontSize: 7, fontWeight: 'bold', marginBottom: 2 },
  footerLabel: { fontSize: 6, fontWeight: 'bold' },
  signatureContainer: {
    marginTop: 5,
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

const ExportCommercialPdf = ({ data }) => {
  const isVisible = (field) => Boolean(field?.visible)
  const visibleValue = (field) => (isVisible(field) ? field.value : '')
  const formatDate = (value) => {
    if (!value) return ''
    const raw = String(value).split('T')[0]
    const ddmmyyyy = raw.match(/^(\d{2})-(\d{2})-(\d{4})$/)
    if (ddmmyyyy) return raw
    const [ yyyy, mm, dd ] = raw.split('-')
    if (!yyyy || !mm || !dd) return value
    return `${dd}-${mm}-${yyyy}`
  }

  const tableHeaders = data.tableHeaders || []
  const normalizeHeader = (value = '') => value.trim().toUpperCase()
  const wrapUnbroken = (value, chunkSize = 12) => {
    const text = String(value ?? '')
    if (!text) return ''
    if (/\s/.test(text)) return text
    const chunks = text.match(new RegExp(`.{1,${chunkSize}}`, 'g'))
    return chunks ? chunks.join('\n') : text
  }
  const parseAmount = (value) => {
    const cleaned = String(value || '').replace(/[^0-9.]/g, '')
    const parsed = Number.parseFloat(cleaned)
    return Number.isFinite(parsed) ? parsed : 0
  }
  const formatCurrency = (value) => `${data.currency} ${value.toFixed(2)}`

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
              <Text>{visibleValue(data.title)}</Text>
            </View>
            <View style={styles.subHeader}>
              <Text>{visibleValue(data.subTitle)}</Text>
            </View>

            <View style={[ styles.row, { borderBottom: '1pt solid black' } ]}>
              <View style={[ styles.cell, { width: '55%' } ]}>
                <Text style={styles.label}>Exporter:</Text>
                {data.exporterLines.filter((l) => l.visible).map((line, idx) => (
                    <Text key={`exp-${idx}`} style={styles.value}>{line.value}</Text>
                ))}
              </View>
              <View style={[ styles.cell, { width: '25%' } ]}>
                {isVisible(data.invoiceNo) ? (
                    <>
                      <Text style={styles.label}>Invoice No:</Text>
                      <Text style={styles.value}>{data.invoiceNo.value}</Text>
                    </>
                ) : null}
                {isVisible(data.date) ? (
                    <>
                      <Text style={[ styles.label, { marginTop: 6 } ]}>Date:</Text>
                      <Text style={styles.value}>{formatDate(data.date.value)}</Text>
                    </>
                ) : null}
              </View>
              <View style={[ styles.cellLast, { width: '20%' } ]}>
                {isVisible(data.exportRef) ? (
                    <>
                      <Text style={styles.label}>Export Ref:</Text>
                      <Text style={styles.value}>{data.exportRef.value}</Text>
                    </>
                ) : null}
                {isVisible(data.iec) ? <Text style={styles.value}>{data.iec.value}</Text> : null}
                {isVisible(data.adCode) ? <Text style={styles.value}>{data.adCode.value}</Text> : null}
              </View>
            </View>

            <View style={[ styles.row, { borderBottom: '1pt solid black' } ]}>
              <View style={[ styles.cell, { width: '55%' } ]}>
                {isVisible(data.consignee) || (data.consigneeLines && data.consigneeLines.length > 0) ? (
                    <>
                      <Text style={styles.label}>Consignee:</Text>
                      {data.consigneeLines && data.consigneeLines.filter((l) => l.visible).map((line, idx) => (
                          <Text key={`consignee-${idx}`} style={styles.value}>{line.value}</Text>
                      ))}
                      {(!data.consigneeLines || data.consigneeLines.length === 0) && isVisible(data.consignee) && (
                          <Text style={styles.value}>{data.consignee.value}</Text>
                      )}
                    </>
                ) : null}
                {isVisible(data.contact) ? (
                    <>
                      <Text style={[ styles.label, { marginTop: 6 } ]}>Contact:</Text>
                      <Text style={styles.value}>{data.contact.value}</Text>
                    </>
                ) : null}
                {isVisible(data.tel) ? (
                    <>
                      <Text style={[ styles.label, { marginTop: 6 } ]}>Tel:</Text>
                      <Text style={styles.value}>{data.tel.value}</Text>
                    </>
                ) : null}
              </View>
              <View style={[ styles.cellLast, { width: '45%' } ]}>
                {isVisible(data.buyersOrder) ? (
                    <>
                      <Text style={styles.label}>Buyer&apos;s Order No. & Date:</Text>
                      <Text style={styles.value}>{data.buyersOrder.value}</Text>
                    </>
                ) : null}
                {isVisible(data.notifyBuyer) || (data.notifyLines && data.notifyLines.length > 0) ? (
                    <>
                      <Text style={[ styles.label, { marginTop: 6 } ]}>Notify/Buyer:</Text>
                      {data.notifyLines && data.notifyLines.filter((l) => l.visible).map((line, idx) => (
                          <Text key={`notify-${idx}`} style={styles.value}>{line.value}</Text>
                      ))}
                      {(!data.notifyLines || data.notifyLines.length === 0) && isVisible(data.notifyBuyer) && (
                          <Text style={styles.value}>{data.notifyBuyer.value}</Text>
                      )}
                    </>
                ) : null}
              </View>
            </View>

            <View style={[ styles.row, { borderBottom: '1pt solid black' } ]}>
              <View style={[ styles.cell, { width: '50%' } ]}>
                {isVisible(data.countryOfOrigin) ? (
                    <>
                      <Text style={styles.label}>Country of Origin</Text>
                      <Text style={styles.value}>{data.countryOfOrigin.value}</Text>
                    </>
                ) : null}
              </View>
              <View style={[ styles.cellLast, { width: '50%' } ]}>
                {isVisible(data.countryOfDestination) ? (
                    <>
                      <Text style={styles.label}>Country of Destination</Text>
                      <Text style={styles.value}>{data.countryOfDestination.value}</Text>
                    </>
                ) : null}
              </View>
            </View>

            <View style={[ styles.row, { borderBottom: '1pt solid black' } ]}>
              <View style={[ styles.cell, { width: '25%' } ]}>
                {isVisible(data.preCarriageBy) ? (
                    <>
                      <Text style={styles.label}>Pre-Carriage by</Text>
                      <Text style={styles.value}>{data.preCarriageBy.value}</Text>
                    </>
                ) : null}
              </View>
              <View style={[ styles.cell, { width: '25%' } ]}>
                {isVisible(data.placeOfReceipt) ? (
                    <>
                      <Text style={styles.label}>Place of Receipt</Text>
                      <Text style={styles.value}>{data.placeOfReceipt.value}</Text>
                    </>
                ) : null}
              </View>
              <View style={[ styles.cell, { width: '25%' } ]}>
                {isVisible(data.vesselFlightNo) ? (
                    <>
                      <Text style={styles.label}>Vessel/Flight No.</Text>
                      <Text style={styles.value}>{data.vesselFlightNo.value}</Text>
                    </>
                ) : null}
              </View>
              <View style={[ styles.cellLast, { width: '25%' } ]}>
                {isVisible(data.portOfLoading) ? (
                    <>
                      <Text style={styles.label}>Port of Loading</Text>
                      <Text style={styles.value}>{data.portOfLoading.value}</Text>
                    </>
                ) : null}
              </View>
            </View>

            <View style={[ styles.row, { borderBottom: '1pt solid black' } ]}>
              <View style={[ styles.cell, { width: '25%' } ]}>
                {isVisible(data.portOfDischarge) ? (
                    <>
                      <Text style={styles.label}>Port of Discharge</Text>
                      <Text style={styles.value}>{data.portOfDischarge.value}</Text>
                    </>
                ) : null}
              </View>
              <View style={[ styles.cell, { width: '25%' } ]}>
                {isVisible(data.finalDestination) ? (
                    <>
                      <Text style={styles.label}>Final Destination</Text>
                      <Text style={styles.value}>{data.finalDestination.value}</Text>
                    </>
                ) : null}
              </View>
              <View style={[ styles.cellLast, { width: '50%' } ]}>
                {isVisible(data.terms) ? (
                    <>
                      <Text style={styles.label}>Terms of Delivery and Payment</Text>
                      <Text style={styles.value}>{data.terms.value}</Text>
                    </>
                ) : null}
              </View>
            </View>

            <View style={[ styles.row, { borderBottom: '1pt solid black', backgroundColor: '#f0f0f0' } ]}>
              {tableHeaders.map((header, idx) => (
                  <View
                      key={`th-${idx}`}
                      style={[ styles.cell, { width: tableHeaders.length ? `${100 / tableHeaders.length}%` : '14%' } ]}
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
                        <Text style={styles.value}>{wrapUnbroken(row[colIndex] || '')}</Text>
                      </View>
                  ))}
                </View>
            ))}

            <View style={[ styles.row, { borderTop: '1pt solid black' } ]}>
              <View style={[ styles.cell, { width: '60%' } ]}>
                {isVisible(data.amount) ? (
                    <>
                      <Text style={styles.footerLabel}>Amount:</Text>
                      <Text style={styles.value}>{data.amount.value}</Text>
                    </>
                ) : null}
                <Text style={[ styles.footerLabel, { marginTop: 6 } ]}>Declaration:</Text>
                {data.declarationLines.map((line, idx) => (
                    <Text key={`decl-${idx}`} style={styles.value}>{line}</Text>
                ))}
              </View>
              <View style={[ styles.cellLast, { width: '40%' } ]}>
                {isVisible(data.total) ? (
                    <View style={styles.row}>
                      <View style={[ styles.cell, { width: '60%' } ]}><Text style={styles.footerLabel}>Total</Text></View>
                      <View style={[ styles.cellLast, { width: '40%' } ]}><Text style={styles.value}>{formatCurrency(subtotal)}</Text></View>
                    </View>
                ) : null}
                {isVisible(data.packingCharge) ? (
                    <View style={styles.row}>
                      <View style={[ styles.cell, { width: '60%' } ]}><Text style={styles.footerLabel}>Packing Charge</Text></View>
                      <View style={[ styles.cellLast, { width: '40%' } ]}><Text style={styles.value}>{formatCurrency(packing)}</Text></View>
                    </View>
                ) : null}
                {isVisible(data.forwarding) ? (
                    <View style={styles.row}>
                      <View style={[ styles.cell, { width: '60%' } ]}><Text style={styles.footerLabel}>Forwarding</Text></View>
                      <View style={[ styles.cellLast, { width: '40%' } ]}><Text style={styles.value}>{formatCurrency(forwarding)}</Text></View>
                    </View>
                ) : null}
                {isVisible(data.insurance) ? (
                    <View style={styles.row}>
                      <View style={[ styles.cell, { width: '60%' } ]}><Text style={styles.footerLabel}>Insurance Charge</Text></View>
                      <View style={[ styles.cellLast, { width: '40%' } ]}><Text style={styles.value}>{formatCurrency(insurance)}</Text></View>
                    </View>
                ) : null}
                {isVisible(data.grandTotal) ? (
                    <View style={styles.row}>
                      <View style={[ styles.cell, { width: '60%' } ]}><Text style={styles.footerLabel}>Grand Total</Text></View>
                      <View style={[ styles.cellLast, { width: '40%' } ]}><Text style={styles.value}>{formatCurrency(grandTotal)}</Text></View>
                    </View>
                ) : null}
                <View style={{ marginTop: 20, textAlign: 'center', justifyContent: 'space-between', padding: 5 }}>
                  {isVisible(data.signature) ? (
                      <>
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
                        <Text style={styles.label}>Signature / Stamp of</Text>
                        <Text style={[ styles.label, { marginBottom: 5 } ]}>{data.signature.value}</Text>
                      </>
                  ) : null}
                </View>
              </View>
            </View>

            <View style={[ styles.row, { borderTop: '1pt solid black' } ]}>
              <View style={[ styles.cell, { width: '50%' } ]}>
                {isVisible(data.netWeight) ? (
                    <>
                      <Text style={styles.footerLabel}>Net Weight:</Text>
                      <Text style={styles.value}>{data.netWeight.value}</Text>
                    </>
                ) : null}
              </View>
              <View style={[ styles.cellLast, { width: '50%' } ]}>
                {isVisible(data.grossWeight) ? (
                    <>
                      <Text style={styles.footerLabel}>Gross Weight:</Text>
                      <Text style={styles.value}>{data.grossWeight.value}</Text>
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
      <ExportCommercialPdf data={data}/>
    </PDFViewer>
))

const defaultData = {
  currency: 'INR',
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
  notifyLines: [ { value: '', visible: true } ],
  consignee: { value: '', visible: true },
  consigneeLines: [ { value: '', visible: true } ],
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
  total: { value: '0.00', visible: true },
  packingCharge: { value: '0.00', visible: true },
  packingChargeInr: { value: '', visible: true },
  forwarding: { value: '0.00', visible: true },
  forwardingInr: { value: '', visible: true },
  insurance: { value: '0.00', visible: true },
  insuranceInr: { value: '', visible: true },
  grandTotal: { value: '0.00', visible: true },
  signature: { value: 'UNIQUE WAVES', visible: true },
  netWeight: { value: '', visible: true },
  grossWeight: { value: '', visible: true }
}

const isEmptyCellValue = (value) => String(value ?? '').trim() === ''
const parseNumber = (value) => {
  const parsed = Number.parseFloat(String(value || '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(parsed) ? parsed : null
}
const calculateRowAmount = (qtyValue, rateValue) => {
  const qty = parseNumber(qtyValue)
  const rate = parseNumber(rateValue)
  if (qty === null || rate === null) return ''
  return (qty * rate).toFixed(2)
}

const autofillCommercialRowsFromPerforma = (commercialData = {}, performaData = {}) => {
  const tableHeaders = Array.isArray(commercialData.tableHeaders)
    ? commercialData.tableHeaders
    : defaultData.tableHeaders
  const normalizeHeader = (value = '') => value.trim().toUpperCase()
  const descriptionIndex = tableHeaders.findIndex((h) => normalizeHeader(h) === 'DESCRIPTION OF GOODS')
  const qtyIndex = tableHeaders.findIndex((h) => normalizeHeader(h) === 'QTY')
  const rateIndex = tableHeaders.findIndex((h) => normalizeHeader(h) === 'RATE')
  const performaRows = Array.isArray(performaData?.itemRows) ? performaData.itemRows : []

  if (!performaRows.length || descriptionIndex < 0 || qtyIndex < 0 || rateIndex < 0) {
    return commercialData
  }

  const commercialRows = Array.isArray(commercialData.tableRows) ? commercialData.tableRows : []
  const minColumnCount = Math.max(tableHeaders.length, rateIndex + 1, qtyIndex + 1, descriptionIndex + 1, 1)
  const rowCount = Math.max(commercialRows.length, performaRows.length)
  const nextRows = []

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const commercialRow = Array.isArray(commercialRows[rowIndex]) ? [ ...commercialRows[rowIndex] ] : new Array(minColumnCount).fill('')
    if (commercialRow.length < minColumnCount) {
      commercialRow.length = minColumnCount
      for (let idx = 0; idx < minColumnCount; idx += 1) {
        if (typeof commercialRow[idx] === 'undefined') commercialRow[idx] = ''
      }
    }

    const performaRow = performaRows[rowIndex] || {}
    if (isEmptyCellValue(commercialRow[descriptionIndex]) && !isEmptyCellValue(performaRow.description)) {
      commercialRow[descriptionIndex] = performaRow.description
    }
    if (isEmptyCellValue(commercialRow[qtyIndex]) && !isEmptyCellValue(performaRow.qty)) {
      commercialRow[qtyIndex] = performaRow.qty
    }
    if (isEmptyCellValue(commercialRow[rateIndex]) && !isEmptyCellValue(performaRow.amount)) {
      commercialRow[rateIndex] = performaRow.amount
    }

    nextRows.push(commercialRow)
  }

  return {
    ...commercialData,
    tableHeaders,
    tableRows: nextRows.length ? nextRows : [ new Array(minColumnCount).fill('') ]
  }
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

export default function PackagingDocument() {
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
  const [ customers, setCustomers ] = useState([])
  const [ selectedCompanyId, setSelectedCompanyId ] = useState('')
  const [ selectedCustomerId, setSelectedCustomerId ] = useState('')
  const [ companyValue, setCompanyValue ] = useState(null)
  const [ customerValue, setCustomerValue ] = useState(null)
  const [ companyInputValue, setCompanyInputValue ] = useState('')
  const [ customerInputValue, setCustomerInputValue ] = useState('')
  const [ shouldApplyCustomer, setShouldApplyCustomer ] = useState(false)
  const [ shouldFillEmptyFromCustomer, setShouldFillEmptyFromCustomer ] = useState(false)
  const [ shouldApplyCompany, setShouldApplyCompany ] = useState(false)
  const [ shouldFillEmptyFromCompany, setShouldFillEmptyFromCompany ] = useState(false)
  const [ hasLoadedInvoice, setHasLoadedInvoice ] = useState(false)
  const skipCustomerSyncRef = useRef(false)
  const skipCompanySyncRef = useRef(false)
  const [ eurToInrRate, setEurToInrRate ] = useState(null)
  const rateRequestRef = useRef(null)
  const [ tableAmountInr, setTableAmountInr ] = useState(() => (defaultData.tableRows || []).map(() => ''))

  const updateField = (field) => (event) => {
    setData((prev) => ({ ...prev, [field]: { ...prev[field], value: event.target.value } }))
  }

  const splitToLines = (raw) => {
    if (!raw) return []
    const byNewLine = String(raw).split('\n').map((line) => line.trim()).filter(Boolean)
    if (byNewLine.length > 1) return byNewLine
    return [ String(raw).trim() ].filter(Boolean)
  }

  const applyCompanyToForm = (company) => {
    if (!company) return

    const fallbackAddress = [ company.addressLine1, company.addressLine2, company.addressLine3 ].filter(Boolean).join('\n')
    const addressSource = company.address || fallbackAddress
    const companyLines = [
      company.name,
      ...splitToLines(addressSource),
      company.pinCode ? `PIN: ${company.pinCode}` : '',
      company.contactPerson || '',
      company.contactNumber ? `TEL.: ${company.contactNumber}` : '',
      company.mail || company.email ? `E-mail: ${company.mail || company.email}` : '',
      company.gstin ? `GSTIN: ${company.gstin}` : ''
    ].filter(Boolean)

    setData((prev) => ({
      ...prev,
      exporterLines: companyLines.length
        ? companyLines.map((value) => ({ value, visible: true }))
        : prev.exporterLines,
      signature: {
        ...prev.signature,
        value: company.name || prev.signature.value
      }
    }))
  }

  const isNonEmptyValue = (value) => String(value || '').trim().length > 0

  const applyCustomerToForm = (customer, options = {}) => {
    if (!customer) return
    const { onlyEmpty = false } = options

    const consigneeParts = [
      customer.name,
      ...splitToLines(customer.shipTo || customer.address),
      customer.pinCode ? `PIN: ${customer.pinCode}` : '',
      customer.country
    ].filter(Boolean)
    const consigneeLinesNew = consigneeParts.map(val => ({ value: val, visible: true }))

    const notifyParts = [
      customer.name,
      ...splitToLines(customer.billTo || customer.address),
      customer.pinCode ? `PIN: ${customer.pinCode}` : '',
      customer.country
    ].filter(Boolean)
    const notifyLinesNew = notifyParts.map(val => ({ value: val, visible: true }))

    const hasMeaningfulLines = (lines = []) =>
      lines.some((line) => String(line?.value ?? '').trim())

    setData((prev) => ({
      ...prev,
      consigneeLines: consigneeLinesNew.length
        ? (onlyEmpty && hasMeaningfulLines(prev.consigneeLines) ? prev.consigneeLines : consigneeLinesNew)
        : prev.consigneeLines,
      notifyLines: notifyLinesNew.length
        ? (onlyEmpty && hasMeaningfulLines(prev.notifyLines) ? prev.notifyLines : notifyLinesNew)
        : prev.notifyLines,
      consignee: {
        ...prev.consignee,
        value: onlyEmpty && isNonEmptyValue(prev.consignee?.value)
          ? prev.consignee.value
          : consigneeParts.join(', ')
      },
      contact: {
        ...prev.contact,
        value: onlyEmpty && isNonEmptyValue(prev.contact?.value)
          ? prev.contact.value
          : (customer.contactPerson || customer.name || prev.contact.value)
      },
      tel: {
        ...prev.tel,
        value: onlyEmpty && isNonEmptyValue(prev.tel?.value)
          ? prev.tel.value
          : (customer.contactNumber || prev.tel.value)
      },
      countryOfDestination: {
        ...prev.countryOfDestination,
        value: onlyEmpty && isNonEmptyValue(prev.countryOfDestination?.value)
          ? prev.countryOfDestination.value
          : (customer.country || prev.countryOfDestination.value)
      },
      finalDestination: {
        ...prev.finalDestination,
        value: onlyEmpty && isNonEmptyValue(prev.finalDestination?.value)
          ? prev.finalDestination.value
          : (customer.country || prev.finalDestination.value)
      },
      notifyBuyer: {
        ...prev.notifyBuyer,
        value: onlyEmpty && isNonEmptyValue(prev.notifyBuyer?.value)
          ? prev.notifyBuyer.value
          : (customer.name || prev.notifyBuyer.value)
      }
    }))
  }

  const fetchCompaniesAndCustomers = async () => {
    try {
      const [ companyResponse, customerResponse ] = await Promise.all([
        EndpointService.getCompanyMasterAccessibleList(),
        EndpointService.getCustomerList()
      ])
      setCompanies(companyResponse?.companies || [])
      setCustomers(customerResponse?.customers || [])
    } catch (error) {
      setCompanies([])
      setCustomers([])
    }
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

  const sanitizeAmountInput = (value) => {
    const cleaned = String(value || '').replace(/[^0-9.]/g, '')
    const parts = cleaned.split('.')
    if (parts.length <= 1) return cleaned
    return `${parts[0]}.${parts.slice(1).join('')}`
  }
  const parseNumericInput = (value) => {
    const parsed = Number.parseFloat(String(value || ''))
    return Number.isFinite(parsed) ? parsed : null
  }
  const convertEurToInr = (value, rate) => {
    const numeric = parseNumericInput(value)
    if (numeric === null || !Number.isFinite(rate) || rate <= 0) return ''
    return (numeric * rate).toFixed(2)
  }
  const convertInrToEur = (value, rate) => {
    const numeric = parseNumericInput(value)
    if (numeric === null || !Number.isFinite(rate) || rate <= 0) return ''
    return (numeric / rate).toFixed(2)
  }

  const fetchEurToInrRate = async (currency) => {
    if (eurToInrRate) return eurToInrRate
    if (rateRequestRef.current) return rateRequestRef.current

    rateRequestRef.current = fetch(`https://api.frankfurter.dev/v1/latest?amount=1&from=${currency}&to=INR`)
        .then((response) => response.json())
        .then((payload) => {
          const rate = Number(payload?.rates?.INR)
          if (!Number.isFinite(rate) || rate <= 0) {
            throw new Error('Invalid rate')
          }
          setEurToInrRate(rate)
          return rate
        })
        .catch(() => null)
        .finally(() => {
          rateRequestRef.current = null
        })

    return rateRequestRef.current
  }

  const amountIndex = useMemo(() => {
    const index = data.tableHeaders.findIndex((h) => normalizeHeader(h) === 'AMOUNT')
    return index >= 0 ? index : Math.max(0, data.tableHeaders.length - 1)
  }, [ data.tableHeaders ])
  const qtyIndex = useMemo(() => data.tableHeaders.findIndex((h) => normalizeHeader(h) === 'QTY'), [ data.tableHeaders ])
  const rateIndex = useMemo(() => data.tableHeaders.findIndex((h) => normalizeHeader(h) === 'RATE'), [ data.tableHeaders ])

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

  const updateConsigneeLine = (index) => (event) => {
    setData((prev) => {
      const next = [ ...(prev.consigneeLines || []) ]
      next[index] = { ...next[index], value: event.target.value }
      return { ...prev, consigneeLines: next }
    })
  }

  const toggleConsigneeLine = (index) => (event) => {
    setData((prev) => {
      const next = [ ...(prev.consigneeLines || []) ]
      next[index] = { ...next[index], visible: event.target.checked }
      return { ...prev, consigneeLines: next }
    })
  }

  const addConsigneeLine = () => {
    setData((prev) => ({
      ...prev,
      consigneeLines: [ ...(prev.consigneeLines || []), { value: '', visible: true } ]
    }))
  }

  const removeConsigneeLine = (index) => {
    setData((prev) => {
      const next = [ ...(prev.consigneeLines || []) ]
      next.splice(index, 1)
      return { ...prev, consigneeLines: next }
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

  const updateTableCell = (rowIndex, colIndex) => (event) => {
    const isAmountCell = colIndex === amountIndex
    if (isAmountCell) return
    const isNumericInput = colIndex === qtyIndex || colIndex === rateIndex
    const value = isNumericInput ? sanitizeAmountInput(event.target.value) : event.target.value
    setData((prev) => {
      const nextRows = [ ...(prev.tableRows || []) ]
      const nextRow = [ ...(nextRows[rowIndex] || []) ]
      nextRow[colIndex] = value
      if (qtyIndex >= 0 && rateIndex >= 0 && amountIndex >= 0) {
        nextRow[amountIndex] = calculateRowAmount(nextRow[qtyIndex], nextRow[rateIndex])
      }
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
    fetchCompaniesAndCustomers()
  }, [])

  useEffect(() => {
    const handle = setTimeout(() => {
      setPdfData(data)
    }, 500)
    return () => clearTimeout(handle)
  }, [ data ])

  useEffect(() => {
    setTableAmountInr((prev) => {
      const next = [ ...(prev || []) ]
      const targetLength = data.tableRows.length
      if (next.length > targetLength) next.length = targetLength
      while (next.length < targetLength) next.push('')
      return next
    })
  }, [ data.tableRows.length ])

  useEffect(() => {
    if (qtyIndex < 0 || rateIndex < 0 || amountIndex < 0) return
    setData((prev) => {
      const rows = prev.tableRows || []
      let changed = false
      const nextRows = rows.map((row) => {
        const nextRow = [ ...(row || []) ]
        const nextAmount = calculateRowAmount(nextRow[qtyIndex], nextRow[rateIndex])
        if ((nextRow[amountIndex] || '') !== nextAmount) {
          nextRow[amountIndex] = nextAmount
          changed = true
        }
        return nextRow
      })
      return changed ? { ...prev, tableRows: nextRows } : prev
    })
  }, [ qtyIndex, rateIndex, amountIndex, data.tableRows ])

  useEffect(() => {
    let cancelled = false
    const updateInrRows = async () => {
      if (data.currency === 'INR') {
        if (cancelled) return
        setTableAmountInr((data.tableRows || []).map((row) => String(row?.[amountIndex] || '')))
        return
      }
      const rate = await fetchEurToInrRate(data.currency)
      if (cancelled || !rate) return
      const next = (data.tableRows || []).map((row) => convertEurToInr(row?.[amountIndex] || '', rate))
      if (!cancelled) setTableAmountInr(next)
    }
    updateInrRows()
    return () => {
      cancelled = true
    }
  }, [ data.tableRows, data.currency, amountIndex ])

  useEffect(() => {
    setHasSaved(false)
    let isActive = true
    const loadInvoice = async () => {
      if (invoiceId) {
        try {
          const response = await axiosInstance.get(`/v1/invoice/${invoiceId}`)
          if (!isActive) return
          const invoice = response?.data || {}
          const templateData = invoice?.commercial || invoice?.data || {}
          const templateDateValue = templateData?.date && typeof templateData.date === 'object'
            ? templateData.date.value
            : templateData?.date
          const performaData = invoice?.performa || {}
          const mergedTemplateData = autofillCommercialRowsFromPerforma(templateData, performaData)
          const merged = {
            ...defaultData,
            ...mergedTemplateData,
            currency: invoice?.currency || defaultData.currency,
            date: { ...(defaultData.date || {}), value: invoice?.date || templateDateValue || '' }
          }
          const hasMeaningfulLines = (lines) => Array.isArray(lines) && lines.some((l) => String(l?.value || '').trim())
          
          if (!hasMeaningfulLines(templateData.consigneeLines)) {
            if (hasMeaningfulLines(performaData.customerLines)) {
              merged.consigneeLines = performaData.customerLines.map(l => ({ ...l }))
            } else if (String(merged.consignee?.value || '').trim()) {
              merged.consigneeLines = String(merged.consignee.value).split('\n').map(v => ({ value: v.trim(), visible: true }))
            }
          }
          if (!hasMeaningfulLines(templateData.notifyLines)) {
            if (hasMeaningfulLines(performaData.notifyLines)) {
              merged.notifyLines = performaData.notifyLines.map(l => ({ ...l }))
            } else if (String(merged.notifyBuyer?.value || '').trim()) {
              merged.notifyLines = String(merged.notifyBuyer.value).split('\n').map(v => ({ value: v.trim(), visible: true }))
            }
          }
          const packagingData = invoice?.packaging || invoice?.packing || {}
          const packagingNet = packagingData?.netWeight?.value ?? packagingData?.netWeight ?? ''
          const packagingGross = packagingData?.grossWeight?.value ?? packagingData?.grossWeight ?? ''
          const currentNet = String(merged?.netWeight?.value || '').trim()
          const currentGross = String(merged?.grossWeight?.value || '').trim()
          if (!currentNet && packagingNet) {
            merged.netWeight = { ...(merged.netWeight || defaultData.netWeight), value: packagingNet }
          }
          if (!currentGross && packagingGross) {
            merged.grossWeight = { ...(merged.grossWeight || defaultData.grossWeight), value: packagingGross }
          }
          setData(merged)
          setPdfData(merged)
          const invoiceCompanyId = typeof invoice?.company === 'string' ? invoice.company : invoice?.company?._id || ''
          const invoiceCustomerId = typeof invoice?.customer === 'string' ? invoice.customer : invoice?.customer?._id || ''
          const storedCompanyId = getStoredCompanyId()
          const storedCustomerId = getStoredCustomerId()
          const needsCustomerFill = !isNonEmptyValue(merged.consignee?.value) ||
            !isNonEmptyValue(merged.contact?.value) ||
            !isNonEmptyValue(merged.tel?.value) ||
            !isNonEmptyValue(merged.countryOfDestination?.value) ||
            !isNonEmptyValue(merged.finalDestination?.value) ||
            !isNonEmptyValue(merged.notifyBuyer?.value)
            
          const isExporterDefault = merged.exporterLines && defaultData.exporterLines && merged.exporterLines[0]?.value === defaultData.exporterLines[0]?.value
          const needsCompanyFill = !merged.exporterLines || merged.exporterLines.length === 0 || isExporterDefault
          
          skipCompanySyncRef.current = true
          skipCustomerSyncRef.current = true
          setShouldFillEmptyFromCompany(needsCompanyFill)
          setShouldFillEmptyFromCustomer(needsCustomerFill)
          setSelectedCompanyId(invoiceCompanyId || storedCompanyId || '')
          setSelectedCustomerId(invoiceCustomerId || storedCustomerId || '')
          setIsApproved(Boolean(invoice?.commercialApproved))
          setHasSaved(false)
          setHasLoadedInvoice(true)
        } catch (error) {
          if (!isActive) return
          setData(defaultData)
          setPdfData(defaultData)
          skipCompanySyncRef.current = true
          skipCustomerSyncRef.current = true
          setShouldFillEmptyFromCustomer(true)
          setSelectedCompanyId(getStoredCompanyId() || '')
          setSelectedCustomerId(getStoredCustomerId() || '')
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
        if (shouldFillEmptyFromCompany) {
          applyCompanyToForm(match)
          setShouldFillEmptyFromCompany(false)
        }
        return
      }
      applyCompanyToForm(match)
      setShouldApplyCompany(false)
    }
  }, [ selectedCompanyId, companies, shouldApplyCompany, hasLoadedInvoice ])

  useEffect(() => {
    if (!selectedCustomerId || !customers.length) {
      setCustomerValue(null)
      setCustomerInputValue('')
      return
    }

    const match = customers.find((item) => item._id === selectedCustomerId)
    if (match) {
      setCustomerValue(match)
      setCustomerInputValue(match.name || '')
      if (skipCustomerSyncRef.current) {
        skipCustomerSyncRef.current = false
        if (shouldFillEmptyFromCustomer) {
          applyCustomerToForm(match, { onlyEmpty: true })
          setShouldFillEmptyFromCustomer(false)
        }
        return
      }
      if (shouldApplyCustomer || !hasLoadedInvoice) {
        applyCustomerToForm(match)
        setShouldApplyCustomer(false)
      }
    }
  }, [ selectedCustomerId, customers, shouldApplyCustomer, hasLoadedInvoice, shouldFillEmptyFromCustomer ])

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
      const payloadDate = formatDateForSave(date?.value || '')
      const payload = {
        _id: invoiceId,
        date: payloadDate,
        template: 'commercial',
        commercial: restOfState,
        company: selectedCompanyId || undefined,
        customer: selectedCustomerId || undefined
      }
      const response = await axiosInstance.post('/v1/invoice/save', payload)
      const savedInvoice = response?.data
      if (savedInvoice?._id && !invoiceId) {
        navigate(`/delivery/${savedInvoice._id}`, { replace: true })
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
        template: 'commercial',
        commercial: restOfState,
        company: selectedCompanyId || undefined,
        customer: selectedCustomerId || undefined,
        commercialApproved: nextApproved
      }
      const response = await axiosInstance.post('/v1/invoice/save', payload)
      const savedInvoice = response?.data
      setIsApproved(Boolean(savedInvoice?.commercialApproved ?? nextApproved))
    } finally {
      setIsApproving(false)
    }
  }

  return (
      <MainCard
          title="Export / Commercial Invoice"
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
              <PdfPreview
                  data={{
                    ...pdfData,
                    company: companyValue
                  }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={5}>
            <Box sx={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto', pr: { md: 1 } }}>
              <Stack spacing={2}>
                <Typography variant="body2" color="textSecondary">
                  Toggle any field to show/hide it in the PDF, and edit values inline.
                </Typography>

                <SectionTitle>Selections</SectionTitle>
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

                    setShouldApplyCompany(false)
                    setSelectedCompanyId('')
                    setCompanyValue(null)
                    setCompanyInputValue('')
                  }}
                />
                <EntityAutocomplete
                  label="Customer"
                  options={customers}
                  value={customerValue}
                  inputValue={customerInputValue}
                  allowAdd={false}
                  onInputChange={setCustomerInputValue}
                  onChange={(newValue) => {
                    if (newValue?._id) {
                      setShouldApplyCustomer(true)
                      setSelectedCustomerId(newValue._id)
                      setCustomerValue(newValue)
                      applyCustomerToForm(newValue)
                      return
                    }

                    setShouldApplyCustomer(false)
                    setSelectedCustomerId('')
                    setCustomerValue(null)
                    setCustomerInputValue('')
                  }}
                />

                <Divider/>

                <SectionTitle>Title</SectionTitle>
                <FieldToggle label="Document Title" value={data.title.value} visible={data.title.visible} onChange={updateField('title')} onToggle={toggleField('title')}/>
                <FieldToggle label="Sub Title" value={data.subTitle.value} visible={data.subTitle.visible} onChange={updateField('subTitle')} onToggle={toggleField('subTitle')} multiline/>

                <Divider/>

                <SectionTitle>Exporter</SectionTitle>
                {data.exporterLines.map((line, index) => (
                    <Stack key={`exporter-${index}`} direction="row" spacing={1} alignItems="center">
                      <FormControlLabel control={<Checkbox checked={line.visible} onChange={toggleExporterLine(index)}/>} label=""/>
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

                <SectionTitle>Invoice Details</SectionTitle>
                <FieldToggle label="Invoice No" value={data.invoiceNo.value} visible={data.invoiceNo.visible} onChange={updateField('invoiceNo')} onToggle={toggleField('invoiceNo')}/>
                <FieldToggle label="Date" value={data.date.value} visible={data.date.visible} onChange={updateField('date')} onToggle={toggleField('date')}/>
                <FieldToggle label="Export Ref" value={data.exportRef.value} visible={data.exportRef.visible} onChange={updateField('exportRef')} onToggle={toggleField('exportRef')}/>
                <FieldToggle label="IEC" value={data.iec.value} visible={data.iec.visible} onChange={updateField('iec')} onToggle={toggleField('iec')}/>
                <FieldToggle label="AD Code" value={data.adCode.value} visible={data.adCode.visible} onChange={updateField('adCode')} onToggle={toggleField('adCode')}/>
                <FieldToggle label="Buyer&apos;s Order" value={data.buyersOrder.value} visible={data.buyersOrder.visible} onChange={updateField('buyersOrder')} onToggle={toggleField('buyersOrder')}/>
                
                <SectionTitle>Notify/Buyer</SectionTitle>
                {data.notifyLines && data.notifyLines.map((line, index) => (
                    <Stack key={`notify-${index}`} direction="row" spacing={1} alignItems="center">
                      <FormControlLabel control={<Checkbox checked={line.visible} onChange={toggleNotifyLine(index)}/>} label=""/>
                      <TextField label={`Notify/Buyer Line ${index + 1}`} value={line.value} onChange={updateNotifyLine(index)} fullWidth/>
                      <IconButton aria-label="remove" onClick={() => removeNotifyLine(index)} size="large">
                        <IconTrash size="1.1rem" color={theme.palette.error.dark}/>
                      </IconButton>
                    </Stack>
                ))}
                <Button sx={{ color: theme.palette.secondary.dark, mb: 2 }} variant="outlined" startIcon={<IconPlus/>} onClick={addNotifyLine}>
                  Add Notify/Buyer Line
                </Button>

                <Divider/>

                <SectionTitle>Consignee</SectionTitle>
                {data.consigneeLines && data.consigneeLines.map((line, index) => (
                    <Stack key={`consignee-${index}`} direction="row" spacing={1} alignItems="center">
                      <FormControlLabel control={<Checkbox checked={line.visible} onChange={toggleConsigneeLine(index)}/>} label=""/>
                      <TextField label={`Consignee Line ${index + 1}`} value={line.value} onChange={updateConsigneeLine(index)} fullWidth/>
                      <IconButton aria-label="remove" onClick={() => removeConsigneeLine(index)} size="large">
                        <IconTrash size="1.1rem" color={theme.palette.error.dark}/>
                      </IconButton>
                    </Stack>
                ))}
                <Button sx={{ color: theme.palette.secondary.dark, mb: 2 }} variant="outlined" startIcon={<IconPlus/>} onClick={addConsigneeLine}>
                  Add Consignee Line
                </Button>
                <FieldToggle label="Contact" value={data.contact.value} visible={data.contact.visible} onChange={updateField('contact')} onToggle={toggleField('contact')}/>
                <FieldToggle label="Tel" value={data.tel.value} visible={data.tel.visible} onChange={updateField('tel')} onToggle={toggleField('tel')}/>

                <Divider/>

                <SectionTitle>Shipment</SectionTitle>
                <FieldToggle label="Country of Origin" value={data.countryOfOrigin.value} visible={data.countryOfOrigin.visible} onChange={updateField('countryOfOrigin')}
                             onToggle={toggleField('countryOfOrigin')}/>
                <FieldToggle label="Country of Destination" value={data.countryOfDestination.value} visible={data.countryOfDestination.visible} onChange={updateField('countryOfDestination')}
                             onToggle={toggleField('countryOfDestination')}/>
                <FieldToggle label="Pre-Carriage By" value={data.preCarriageBy.value} visible={data.preCarriageBy.visible} onChange={updateField('preCarriageBy')}
                             onToggle={toggleField('preCarriageBy')}/>
                <FieldToggle label="Place of Receipt" value={data.placeOfReceipt.value} visible={data.placeOfReceipt.visible} onChange={updateField('placeOfReceipt')}
                             onToggle={toggleField('placeOfReceipt')}/>
                <FieldToggle label="Vessel/Flight No" value={data.vesselFlightNo.value} visible={data.vesselFlightNo.visible} onChange={updateField('vesselFlightNo')}
                             onToggle={toggleField('vesselFlightNo')}/>
                <FieldToggle label="Port of Loading" value={data.portOfLoading.value} visible={data.portOfLoading.visible} onChange={updateField('portOfLoading')}
                             onToggle={toggleField('portOfLoading')}/>
                <FieldToggle label="Port of Discharge" value={data.portOfDischarge.value} visible={data.portOfDischarge.visible} onChange={updateField('portOfDischarge')}
                             onToggle={toggleField('portOfDischarge')}/>
                <FieldToggle label="Final Destination" value={data.finalDestination.value} visible={data.finalDestination.visible} onChange={updateField('finalDestination')}
                             onToggle={toggleField('finalDestination')}/>
                <FieldToggle label="Terms" value={data.terms.value} visible={data.terms.visible} onChange={updateField('terms')} onToggle={toggleField('terms')}/>

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
                        {data.tableHeaders.map((header, colIndex) => {
                          if (colIndex === amountIndex) {
                            return (
                                <React.Fragment key={`cell-${rowIndex}-${colIndex}`}>
                                  <Grid item xs={12} sm={6}>
                                    <TextField
                                        label={`${header} (Row ${rowIndex + 1})`}
                                        value={row[colIndex] || ''}
                                        InputProps={{ startAdornment: <InputAdornment position="start">{data.currency}</InputAdornment>, readOnly: true }}
                                        fullWidth
                                        inputProps={{ inputMode: 'decimal', pattern: '[0-9.]*' }}
                                    />
                                  </Grid>
                                  <Grid item xs={12} sm={6}>
                                    <TextField
                                        label={`AMOUNT INR (Row ${rowIndex + 1})`}
                                        value={tableAmountInr[rowIndex] || ''}
                                        fullWidth
                                        InputProps={{ startAdornment: <InputAdornment position="start">INR</InputAdornment>, readOnly: true }}
                                        inputProps={{ inputMode: 'decimal', pattern: '[0-9.]*' }}
                                    />
                                  </Grid>
                                </React.Fragment>
                            )
                          }

                          return (
                              <Grid key={`cell-${rowIndex}-${colIndex}`} item xs={12} sm={6}>
                                <TextField
                                    label={`${header} (Row ${rowIndex + 1})`}
                                    value={row[colIndex] || ''}
                                    onChange={updateTableCell(rowIndex, colIndex)}
                                    fullWidth
                                />
                              </Grid>
                          )
                        })}
                      </Grid>
                    </Box>
                ))}
                <Button sx={{ color: theme.palette.secondary.dark }} variant="outlined" startIcon={<IconPlus/>} onClick={addTableRow}>
                  Add Table Row
                </Button>

                <Divider/>

                <SectionTitle>Totals</SectionTitle>

                <Stack direction="row" spacing={1} alignItems="center">
                  <FormControlLabel control={<Checkbox checked={data.packingCharge.visible} onChange={toggleField('packingCharge')}/>} label=""/>
                  <TextField
                      label="Packing Charge"
                      value={data.packingCharge.value}
                      onChange={async (event) => {
                        const value = sanitizeAmountInput(event.target.value)
                        setData((prev) => ({
                          ...prev,
                          packingCharge: { ...prev.packingCharge, value }
                        }))
                        const rate = await fetchEurToInrRate(data.currency)
                        if (!rate) return
                        const inrValue = convertEurToInr(value, rate)
                        setData((prev) => ({
                          ...prev,
                          packingChargeInr: { ...prev.packingChargeInr, value: inrValue }
                        }))
                      }}
                      InputProps={{ startAdornment: <InputAdornment position="start">{data.currency}</InputAdornment> }}
                      inputProps={{ inputMode: 'decimal', pattern: '[0-9.]*' }}
                      sx={{ flex: 1 }}
                  />
                  <TextField
                      label="Packing Charge (INR)"
                      value={data.packingChargeInr.value}
                      onChange={async (event) => {
                        const value = sanitizeAmountInput(event.target.value)
                        setData((prev) => ({
                          ...prev,
                          packingChargeInr: { ...prev.packingChargeInr, value }
                        }))
                        const rate = await fetchEurToInrRate(data.currency)
                        if (!rate) return
                        const eurValue = convertInrToEur(value, rate)
                        setData((prev) => ({
                          ...prev,
                          packingCharge: { ...prev.packingCharge, value: eurValue }
                        }))
                      }}
                      InputProps={{ startAdornment: <InputAdornment position="start">INR</InputAdornment> }}
                      inputProps={{ inputMode: 'decimal', pattern: '[0-9.]*' }}
                      sx={{ flex: 1 }}
                  />
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <FormControlLabel control={<Checkbox checked={data.forwarding.visible} onChange={toggleField('forwarding')}/>} label=""/>
                  <TextField
                      label="Forwarding"
                      value={data.forwarding.value}
                      onChange={async (event) => {
                        const value = sanitizeAmountInput(event.target.value)
                        setData((prev) => ({
                          ...prev,
                          forwarding: { ...prev.forwarding, value }
                        }))
                        const rate = await fetchEurToInrRate(data.currency)
                        if (!rate) return
                        const inrValue = convertEurToInr(value, rate)
                        setData((prev) => ({
                          ...prev,
                          forwardingInr: { ...prev.forwardingInr, value: inrValue }
                        }))
                      }}
                      InputProps={{ startAdornment: <InputAdornment position="start">{data.currency}</InputAdornment> }}
                      inputProps={{ inputMode: 'decimal', pattern: '[0-9.]*' }}
                      sx={{ flex: 1 }}
                  />
                  <TextField
                      label="Forwarding (INR)"
                      value={data.forwardingInr.value}
                      onChange={async (event) => {
                        const value = sanitizeAmountInput(event.target.value)
                        setData((prev) => ({
                          ...prev,
                          forwardingInr: { ...prev.forwardingInr, value }
                        }))
                        const rate = await fetchEurToInrRate(data.currency)
                        if (!rate) return
                        const eurValue = convertInrToEur(value, rate)
                        setData((prev) => ({
                          ...prev,
                          forwarding: { ...prev.forwarding, value: eurValue }
                        }))
                      }}
                      InputProps={{ startAdornment: <InputAdornment position="start">INR</InputAdornment> }}
                      inputProps={{ inputMode: 'decimal', pattern: '[0-9.]*' }}
                      sx={{ flex: 1 }}
                  />
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <FormControlLabel control={<Checkbox checked={data.insurance.visible} onChange={toggleField('insurance')}/>} label=""/>
                  <TextField
                      label="Insurance"
                      value={data.insurance.value}
                      onChange={async (event) => {
                        const value = sanitizeAmountInput(event.target.value)
                        setData((prev) => ({
                          ...prev,
                          insurance: { ...prev.insurance, value }
                        }))
                        const rate = await fetchEurToInrRate(data.currency)
                        if (!rate) return
                        const inrValue = convertEurToInr(value, rate)
                        setData((prev) => ({
                          ...prev,
                          insuranceInr: { ...prev.insuranceInr, value: inrValue }
                        }))
                      }}
                      InputProps={{ startAdornment: <InputAdornment position="start">{data.currency}</InputAdornment> }}
                      inputProps={{ inputMode: 'decimal', pattern: '[0-9.]*' }}
                      sx={{ flex: 1 }}
                  />
                  <TextField
                      label="Insurance (INR)"
                      value={data.insuranceInr.value}
                      onChange={async (event) => {
                        const value = sanitizeAmountInput(event.target.value)
                        setData((prev) => ({
                          ...prev,
                          insuranceInr: { ...prev.insuranceInr, value }
                        }))
                        const rate = await fetchEurToInrRate(data.currency)
                        if (!rate) return
                        const eurValue = convertInrToEur(value, rate)
                        setData((prev) => ({
                          ...prev,
                          insurance: { ...prev.insurance, value: eurValue }
                        }))
                      }}
                      InputProps={{ startAdornment: <InputAdornment position="start">INR</InputAdornment> }}
                      inputProps={{ inputMode: 'decimal', pattern: '[0-9.]*' }}
                      sx={{ flex: 1 }}
                  />
                </Stack>

                <FieldToggle label="Signature" value={data.signature.value} visible={data.signature.visible} onChange={updateField('signature')} onToggle={toggleField('signature')}/>
                <FieldToggle label="Net Weight" value={data.netWeight.value} visible={data.netWeight.visible} onChange={updateField('netWeight')} onToggle={toggleField('netWeight')}/>
                <FieldToggle label="Gross Weight" value={data.grossWeight.value} visible={data.grossWeight.visible} onChange={updateField('grossWeight')} onToggle={toggleField('grossWeight')}/>

                <Divider/>

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
                        <IconTrash size="1.1rem" color={theme.palette.error.dark}/>
                      </IconButton>
                    </Stack>
                ))}
                <Button sx={{ color: theme.palette.secondary.dark }} variant="outlined" startIcon={<IconPlus/>} onClick={() => addSimpleArrayItem('declarationLines')}>
                  Add Declaration Line
                </Button>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </MainCard>
  )
}
