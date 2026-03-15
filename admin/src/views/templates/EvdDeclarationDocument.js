import React, { useEffect, useState } from 'react';
import {
  Box, Button, Divider, FormControl, Grid, MenuItem,
  Select, Stack, TextField, Typography, Switch, FormControlLabel, CircularProgress
} from '@mui/material';
import { IconEye, IconEyeOff, IconDeviceFloppy } from '@tabler/icons';
import { Document, Page, PDFViewer, StyleSheet, Text, View, Font } from '@react-pdf/renderer';
import { useNavigate, useParams } from 'react-router-dom';

import MainCard from 'ui-component/cards/MainCard';
import { useTheme } from '@mui/material/styles';
import axiosInstance from '../../services/axiosInstance'; 
import EndpointService from '../../services/endpoint.service';
import EntityAutocomplete from 'components/EntityAutocomplete';

const pdfStyles = StyleSheet.create({
  page: { 
    paddingTop: 40, 
    paddingHorizontal: 40, 
    paddingBottom: 40, 
    fontSize: 10, 
    fontFamily: 'Helvetica', 
    color: '#000' 
  },
  
  // Header: Brand on Left, Contact on Right
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-end',
    marginBottom: 4
  },
  brandName: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#4B4B9E'
  },
  contactBlock: { 
    textAlign: 'right', 
    fontSize: 9, 
    color: '#4B4B9E',
    lineHeight: 1.2
  },
  blueLine: { 
    borderBottomWidth: 2, 
    borderBottomColor: '#4B4B9E', 
    marginBottom: 15 
  },
  
  // Titles
  docTitle: { 
    fontSize: 13, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    textDecoration: 'underline',
    marginBottom: 4 
  },
  annexure: { 
    fontSize: 8, 
    textAlign: 'center', 
    marginBottom: 25 
  },

  // The Key Layout Change: Fixed column widths for perfect vertical alignment
  fieldRow: { 
    flexDirection: 'row', 
    marginBottom: 10,
    alignItems: 'flex-start'
  },
  numCol: { width: 25 },
  labelCol: { width: 170 }, // Fixed width for label
  colonCol: { width: 15 },  // Fixed width for the colon to align values
  valueCol: { flex: 1 },

  // Checkbox Grid: 2 Columns
  checkboxContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    width: '100%' 
  },
  checkboxWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    width: '50%', // Exactly half width
    marginBottom: 6 
  },
  checkboxSquare: { 
    width: 11, 
    height: 11, 
    borderWidth: 1, 
    borderColor: '#000', 
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkboxFill: { 
    width: 7, 
    height: 7, 
    backgroundColor: '#000' 
  },
  checkboxLabel: { fontSize: 8.5 },

  // Declaration
  declTitle: { 
    fontWeight: 'bold', 
    textDecoration: 'underline', 
    marginTop: 15, 
    marginBottom: 10
  },
  declText: { 
    fontSize: 9, 
    marginBottom: 6, 
    textAlign: 'justify',
    lineHeight: 1.4
  },

  // Footer Placement
  footerSection: { marginTop: 25 },
  footerLine: { marginBottom: 4 },
  signature: { 
    marginTop: 35, 
    fontWeight: 'bold', 
    fontSize: 11 
  }
});

const ExportValuePdf = ({ data }) => {
  const visibleFields = data.fields.filter(f => f.visible);

  return (
    <Document title="Export Value Declaration">
      <Page size="A4" style={pdfStyles.page}>
        {/* Header Section */}
        <View style={pdfStyles.headerRow}>
          <Text style={pdfStyles.brandName}>{data.brandName}</Text>
          <View style={pdfStyles.contactBlock}>
            <Text>{data.contact1}</Text>
            <Text>{data.contact2}</Text>
          </View>
        </View>
        <View style={pdfStyles.blueLine} />

        <Text style={pdfStyles.docTitle}>EXPORT VALUE DECLARATION</Text>
        <Text style={pdfStyles.annexure}>ANNEXURE 'A'</Text>

        {/* Dynamic Fields Section */}
        {visibleFields.map((field, index) => (
          <View key={field.id} style={pdfStyles.fieldRow}>
            <Text style={pdfStyles.numCol}>{index + 1}.</Text>
            <Text style={pdfStyles.labelCol}>{field.label}</Text>
            <Text style={pdfStyles.colonCol}>:</Text>
            
            <View style={pdfStyles.valueCol}>
              {field.type === 'text' ? (
                <Text style={{ fontWeight: 'bold' }}>
                    {field.value} {field.subValue ? `   DT: ${field.subValue}` : ''}
                </Text>
              ) : (
                <View style={pdfStyles.checkboxContainer}>
                  {field.options.map(opt => (
                    <View key={opt} style={pdfStyles.checkboxWrapper}>
                      <View style={pdfStyles.checkboxSquare}>
                        {field.selectedValue === opt && <View style={pdfStyles.checkboxFill} />}
                      </View>
                      <Text style={pdfStyles.checkboxLabel}>{opt}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}

        {/* Declaration Section */}
        <View style={{ marginTop: 10 }}>
          <Text style={pdfStyles.declTitle}>DECLARATION</Text>
          <Text style={pdfStyles.declText}>1. I/WE HEREBY DECLARE THAT THE INFORMATION FURNISHED ABOVE IS TRUE, COMPLETE & CORRECT IN EVERY RESPECT.</Text>
          <Text style={pdfStyles.declText}>2. I/WE ALSO UNDERTAKE TO BRING TO THE NOTICE OF PROPER OFFICER ANY PARTICULARS WHICH SUBSEQUENTLY COME TO MY / OUR KNOWLEDGE, WHICH WILL HAVE BEARING ON VALUATION.</Text>
        </View>

        {/* Bottom Section */}
        <View style={pdfStyles.footerSection}>
          <Text style={pdfStyles.footerLine}>PLACE : {data.place}</Text>
          <Text style={pdfStyles.footerLine}>DATE  : {data.date}</Text>
          <Text style={pdfStyles.signature}>FOR {data.brandName}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default function ExportValueDeclaration() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id: invoiceId } = useParams();

  const [data, setData] = useState({
    brandName: 'UNIQUE WAVES',
    contact1: 'Mo. +91-97379 99734, +91-90998 42800',
    contact2: 'E-mail : uniquewaves77@gmail.com',
    place: 'MUMBAI',
    date: '18-03-2024',
    fields: [
      { id: 1, label: 'SHIPPING BILL NO & DATE', value: '', subValue: '', visible: true, type: 'text' },
      { id: 2, label: 'INVOICE NO & DATE', value: 'EX-14', subValue: '18-03-2024', visible: true, type: 'text' },
      { id: 3, label: 'NATURE OF TRANSACTION', options: ['SALE', 'GIFT', 'SALE ON CONSIGNMENT', 'SAMPLE', 'OTHER'], selectedValue: 'SALE', visible: true, type: 'checkbox' },
      { id: 4, label: 'METHOD OF VALUATION', options: ['RULE 3', 'RULE 4', 'RULE 5', 'RULE 6'], selectedValue: 'RULE 3', visible: true, type: 'checkbox' },
      { id: 5, label: 'WHETHER SELLER & BUYER RELATED', options: ['YES', 'NO'], selectedValue: 'NO', visible: true, type: 'checkbox' },
      { id: 6, label: 'IF YES, WHETHER RELATIONSHIP INFLUENCED PRICE', options: ['YES', 'NO'], selectedValue: 'NO', visible: true, type: 'checkbox' },
      { id: 7, label: 'TERMS OF PAYMENT', value: 'PAYMENT AFTER DELIVERY', visible: true, type: 'text' },
      { id: 8, label: 'TERMS OF DELIVERY', value: 'CIF', visible: true, type: 'text' },
      { id: 9, label: 'PREVIOUS EXPORTS OF IDENTICAL GOODS', value: 'NIL', subValue: '', visible: true, type: 'text' },
      { id: 10, label: 'ANY OTHER RELEVANT INFORMATION', value: 'N/A', visible: true, type: 'text' },
    ]
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [loading, setLoading] = useState(!!invoiceId);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [companyValue, setCompanyValue] = useState(null);
  const [companyInputValue, setCompanyInputValue] = useState('');

  const applyCompanyToForm = (company) => {
    if (!company) return;
    setData((prev) => ({
      ...prev,
      brandName: company.name || prev.brandName,
      contact1: company.contactNumber || prev.contact1,
      contact2: company.username || prev.contact2
    }));
  };

  const clearCompanyFromForm = () => {
    setData((prev) => ({
      ...prev,
      brandName: '',
      contact1: '',
      contact2: ''
    }));
  };

  const fetchCompany = async () => {
    try {
      const response = await EndpointService.getCompanyAccessibleList();
      const list = response?.companies || [];
      setCompanies(list);
    } catch (error) {
      setCompanies([]);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  useEffect(() => {
    if (!selectedCompanyId || !companies.length) {
      setCompanyValue(null);
      setCompanyInputValue('');
      return;
    }
    const match = companies.find((item) => item._id === selectedCompanyId);
    if (match) {
      setCompanyValue(match);
      setCompanyInputValue(match.name || '');
      applyCompanyToForm(match);
    }
  }, [selectedCompanyId, companies]);

  useEffect(() => {
    setHasSaved(false);
    if (invoiceId) {
      axiosInstance.get(`/v1/invoice/${invoiceId}`).then(res => {
        const invoice = res.data || {};
        const templateData = invoice?.evd || invoice?.data;
        if (templateData) setData(templateData);
        const invoiceCompanyId =
          typeof invoice?.company === 'string' ? invoice.company : invoice?.company?._id || '';
        setSelectedCompanyId(invoiceCompanyId);
        setIsApproved(Boolean(invoice?.evdApproved));
        setHasSaved(false);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [invoiceId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payloadDate = data?.date || '';
      const res = await axiosInstance.post('/v1/invoice/save', {
        _id: invoiceId,
        date: payloadDate,
        template: 'evd',
        evd: data,
        company: selectedCompanyId || undefined
      });
      if (res.data?._id && !invoiceId) navigate(`/evd/${res.data._id}`, { replace: true });
      setHasSaved(true);
    } finally { setIsSaving(false); }
  };

  const handleApprovalChange = async (nextApproved) => {
    if (!invoiceId) return;
    setIsApproving(true);
    try {
      const payloadDate = data?.date || '';
      const res = await axiosInstance.post('/v1/invoice/save', {
        _id: invoiceId,
        date: payloadDate,
        template: 'evd',
        evd: data,
        company: selectedCompanyId || undefined,
        evdApproved: nextApproved
      });
      setIsApproved(Boolean(res.data?.evdApproved ?? nextApproved));
    } finally {
      setIsApproving(false);
    }
  };

  const updateField = (index, key, val) => {
    const newFields = [...data.fields];
    newFields[index][key] = val;
    setData({ ...data, fields: newFields });
  };

  if (loading) return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <MainCard title="Export Value Declaration" secondary={
      <Stack direction="row" spacing={1}>
        <Button variant="contained" color="secondary" startIcon={<IconDeviceFloppy />} onClick={handleSave} disabled={isSaving}>
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
    }>
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Box sx={{ height: '85vh', border: '1px solid #ddd' }}>
            <PDFViewer width="100%" height="100%"><ExportValuePdf data={data} /></PDFViewer>
          </Box>
        </Grid>
        <Grid item xs={12} md={5}>
          <Box sx={{ maxHeight: '85vh', overflowY: 'auto', p: 1 }}>
            <Box sx={{ p: 2, mb: 2, border: '1px solid #eee', borderRadius: 1 }}>
              <Typography variant="caption" fontWeight="bold">Company</Typography>
              <Box sx={{ mt: 1 }}>
                <EntityAutocomplete
                  label="Company"
                  options={companies}
                  value={companyValue}
                  inputValue={companyInputValue}
                  allowAdd={false}
                  onInputChange={setCompanyInputValue}
                  onChange={(newValue) => {
                    if (newValue?._id) {
                      setSelectedCompanyId(newValue._id);
                      setCompanyValue(newValue);
                      applyCompanyToForm(newValue);
                      return;
                    }
                    if (!newValue) {
                      setSelectedCompanyId('');
                      setCompanyValue(null);
                      clearCompanyFromForm();
                    }
                  }}
                />
              </Box>
            </Box>
            <Box sx={{ p: 2, mb: 2, border: '1px solid #eee', borderRadius: 1 }}>
              <Typography variant="caption" fontWeight="bold">Header Details</Typography>
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                <TextField
                  label="Brand Name"
                  fullWidth
                  size="small"
                  value={data.brandName}
                  onChange={(e) => setData({ ...data, brandName: e.target.value })}
                />
                <TextField
                  label="Contact Line 1"
                  fullWidth
                  size="small"
                  value={data.contact1}
                  onChange={(e) => setData({ ...data, contact1: e.target.value })}
                />
                <TextField
                  label="Contact Line 2"
                  fullWidth
                  size="small"
                  value={data.contact2}
                  onChange={(e) => setData({ ...data, contact2: e.target.value })}
                />
              </Stack>
            </Box>
            {data.fields.map((field, index) => (
              <Box key={field.id} sx={{ p: 2, mb: 1, border: '1px solid #eee', borderRadius: 1 }}>
                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Typography variant="caption" fontWeight="bold">Field {index + 1}</Typography>
                  <FormControlLabel control={<Switch size="small" checked={field.visible} onChange={(e) => updateField(index, 'visible', e.target.checked)} />} label={field.visible ? "Visible" : "Hidden"} />
                </Stack>
                {field.visible && (
                  <Stack spacing={1.5}>
                    <TextField label="Label Name" fullWidth size="small" value={field.label} onChange={(e) => updateField(index, 'label', e.target.value)} />
                    {field.type === 'text' ? (
                      <Stack direction="row" spacing={1}>
                        <TextField label="Value" fullWidth size="small" value={field.value} onChange={(e) => updateField(index, 'value', e.target.value)} />
                        {field.subValue !== undefined && <TextField label="Date Part" fullWidth size="small" value={field.subValue} onChange={(e) => updateField(index, 'subValue', e.target.value)} />}
                      </Stack>
                    ) : (
                      <Select size="small" value={field.selectedValue} onChange={(e) => updateField(index, 'selectedValue', e.target.value)}>
                        {field.options.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                      </Select>
                    )}
                  </Stack>
                )}
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>
    </MainCard>
  );
}
