import React, { useEffect, useState } from 'react';
import { Box, Button, Checkbox, Divider, FormControlLabel, Grid, IconButton, Stack, TextField, Typography } from '@mui/material';
import { Document, Image, Page, PDFViewer, StyleSheet, Text, View } from '@react-pdf/renderer';
import MainCard from 'ui-component/cards/MainCard';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useParams } from 'react-router-dom';
import { IconPlus, IconTrash } from '@tabler/icons';
import axiosInstance from '../../services/axiosInstance';
import EndpointService from '../../services/endpoint.service';
import EntityAutocomplete from 'components/EntityAutocomplete';
import { getStoredCompanyId, setStoredCompanyId } from 'utils/entitySelectionStorage';

const pdfStyles = StyleSheet.create({
  page: { padding: 48, fontSize: 10, fontFamily: 'Helvetica', color: '#1f2933' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  brandBlock: { maxWidth: '60%' },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  logoImage: { width: 46, height: 46, marginRight: 12, objectFit: 'contain' },
  brandName: { fontSize: 22, fontWeight: 'bold', letterSpacing: 0.6, color: '#0b3556' },
  slogan: { fontSize: 9, color: '#6b7280', marginTop: 2 },
  contactBlock: { alignItems: 'flex-end', maxWidth: '40%' },
  contactLine: { fontSize: 9, color: '#374151', marginBottom: 2 },
  divider: { height: 1, backgroundColor: '#d7dde3', marginTop: 14, marginBottom: 18 },

  metaSection: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  recipientInfo: { lineHeight: 1.2, maxWidth: '65%' },
  toLabel: { fontWeight: 'bold', fontSize: 10, marginBottom: 2, letterSpacing: 0.4, color: '#0b3556' },
  recipientLine: { marginBottom: 2 },
  datePill: { alignSelf: 'flex-end', border: '1pt solid #d7dde3', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, marginTop: 6 },
  dateText: { textAlign: 'right', fontWeight: 'bold', fontSize: 9, color: '#0b3556' },

  body: { marginTop: 4, marginBottom: 28 },
  bodyText: { lineHeight: 1.35, fontSize: 10, color: '#1f2933' },

  signatureSection: { marginTop: 12 },
  signOff: { fontSize: 10, marginBottom: 10, color: '#4b5563' },
  sigName: { fontWeight: 'bold', fontSize: 11, color: '#0b3556' },
  sigTitle: { fontSize: 10, color: '#4b5563', marginTop: 2 },

  footer: {
    position: 'absolute',
    bottom: 24,
    left: 48,
    right: 48,
    borderTop: '1pt solid #d7dde3',
    paddingTop: 8
  },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', fontSize: 8.5, color: '#6b7280' },
  footerText: { fontSize: 8.5, color: '#6b7280' }
});

const LetterheadPdf = ({ data }) => {
  const showRecipientAddress = data.recipientCompany.visible || data.recipientAddress.visible;
  const showRecipient =
    data.recipientName.visible || data.recipientTitle.visible || showRecipientAddress;
  const showSignature = data.senderName.visible || data.senderTitle.visible;
  const bodyLines = (data.bodyLines || [])
    .filter((line) => line.visible && line.value.trim() !== '')
    .map((line) => line.value.trim());

  return (
    <Document title="Letterhead Preview">
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <View style={pdfStyles.brandBlock}>
            <View style={pdfStyles.brandRow}>
              {/* {data.logo?.visible && data.logo?.value ? (
                <Image style={pdfStyles.logoImage} src={data.logo.value} />
              ) : null} */}
              <View>
                {data.brandName.visible ? <Text style={pdfStyles.brandName}>{data.brandName.value}</Text> : null}
                {data.slogan.visible ? <Text style={pdfStyles.slogan}>{data.slogan.value}</Text> : null}
              </View>
            </View>
          </View>
          <View style={pdfStyles.contactBlock}>
            {data.phone.visible ? <Text style={pdfStyles.contactLine}>TEL: {data.phone.value}</Text> : null}
            {data.website.visible ? <Text style={pdfStyles.contactLine}>WEB: {data.website.value}</Text> : null}
            {data.footerAddress.visible ? <Text style={pdfStyles.contactLine}>{data.footerAddress.value}</Text> : null}
            {data.date.visible ? (
              <View style={pdfStyles.datePill}>
                <Text style={pdfStyles.dateText}>DATE: {data.date.value}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={pdfStyles.divider} />

        <View style={pdfStyles.metaSection}>
          <View style={pdfStyles.recipientInfo}>
            {showRecipient ? <Text style={pdfStyles.toLabel}>TO</Text> : null}
            {data.recipientName.visible ? (
              <Text style={[ { fontSize: 13, fontWeight: 'bold' }, pdfStyles.recipientLine ]}>{data.recipientName.value}</Text>
            ) : null}
            {data.recipientTitle.visible ? <Text style={pdfStyles.recipientLine}>{data.recipientTitle.value}</Text> : null}
            {showRecipientAddress ? (
              <View style={{ marginTop: 2 }}>
                {data.recipientCompany.visible ? <Text style={pdfStyles.recipientLine}>{data.recipientCompany.value}</Text> : null}
                {data.recipientAddress.visible ? <Text style={pdfStyles.recipientLine}>{data.recipientAddress.value}</Text> : null}
              </View>
            ) : null}
          </View>
        </View>

        {bodyLines.length ? (
          <View style={pdfStyles.body}>
            <Text style={pdfStyles.bodyText}>{bodyLines.join('\n')}</Text>
          </View>
        ) : null}

        {showSignature ? (
          <View style={pdfStyles.signatureSection}>
            <Text style={pdfStyles.signOff}>Sincerely,</Text>
            {data.senderName.visible ? <Text style={pdfStyles.sigName}>{data.senderName.value}</Text> : null}
            {data.senderTitle.visible ? <Text style={pdfStyles.sigTitle}>{data.senderTitle.value}</Text> : null}
          </View>
        ) : null}

        <View style={pdfStyles.footer}>
          <View style={pdfStyles.footerRow}>
            {data.phone.visible ? <Text style={pdfStyles.footerText}>TEL: {data.phone.value}</Text> : null}
            {data.website.visible ? <Text style={pdfStyles.footerText}>WEB: {data.website.value}</Text> : null}
            {data.footerAddress.visible ? <Text style={pdfStyles.footerText}>{data.footerAddress.value}</Text> : null}
          </View>
        </View>
      </Page>
    </Document>
  );
};

const defaultData = {
  logo: { value: '', visible: true },
  brandName: { value: 'COMPANY', visible: true },
  slogan: { value: 'YOUR SLOGAN HERE', visible: true },
  recipientName: { value: 'Jonathon Doe', visible: true },
  recipientTitle: { value: 'Designer', visible: true },
  recipientCompany: { value: 'Company Name', visible: true },
  recipientAddress: { value: 'City, Road Name, 12345', visible: true },
  date: { value: '12/05/2026', visible: true },
  bodyLines: [ { value: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit...', visible: true } ],
  senderName: { value: 'Jonathon Doe', visible: true },
  senderTitle: { value: 'Graphic Designer', visible: true },
  phone: { value: '000 1234 567 890', visible: true },
  website: { value: 'your website here', visible: true },
  footerAddress: { value: 'your address here', visible: true }
};

const FieldToggle = ({ label, value, visible, onChange, onToggle, multiline, rows }) => (
  <Stack direction="row" spacing={1} alignItems="center">
    <FormControlLabel control={<Checkbox checked={visible} onChange={onToggle} />} label="" />
    <TextField label={label} value={value} onChange={onChange} fullWidth multiline={multiline} rows={rows} />
  </Stack>
);

export default function LetterheadDocument() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id: invoiceId } = useParams();

  const [isSaving, setIsSaving] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [formData, setFormData] = useState(defaultData);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [companyValue, setCompanyValue] = useState(null);
  const [companyInputValue, setCompanyInputValue] = useState('');

  const toAbsoluteUrl = (value) => {
    if (!value) return '';
    if (/^data:/i.test(value)) return value;
    if (/^https?:\/\//i.test(value)) return value;
    if (value.startsWith('/')) return `${window.location.origin}${value}`;
    return value;
  };

  const updateField = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: { ...prev[field], value: event.target.value } }));
  };

  const toggleField = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: { ...prev[field], visible: event.target.checked } }));
  };

  const updateBodyLine = (index) => (event) => {
    setFormData((prev) => {
      const next = [ ...(prev.bodyLines || []) ];
      next[index] = { ...next[index], value: event.target.value };
      return { ...prev, bodyLines: next };
    });
  };

  const toggleBodyLine = (index) => (event) => {
    setFormData((prev) => {
      const next = [ ...(prev.bodyLines || []) ];
      next[index] = { ...next[index], visible: event.target.checked };
      return { ...prev, bodyLines: next };
    });
  };

  const addBodyLine = () => {
    setFormData((prev) => ({
      ...prev,
      bodyLines: [ ...(prev.bodyLines || []), { value: '', visible: true } ]
    }));
  };

  const removeBodyLine = (index) => {
    setFormData((prev) => {
      const next = [ ...(prev.bodyLines || []) ];
      next.splice(index, 1);
      return { ...prev, bodyLines: next.length ? next : [ { value: '', visible: true } ] };
    });
  };

  const normalizeField = (value, fallback) => {
    if (value && typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, 'value')) {
      return {
        value: value.value ?? fallback.value,
        visible: typeof value.visible === 'boolean' ? value.visible : fallback.visible
      };
    }
    return { value: value ?? fallback.value, visible: fallback.visible };
  };

  const normalizeBodyLines = (templateData) => {
    if (Array.isArray(templateData?.bodyLines) && templateData.bodyLines.length) {
      return templateData.bodyLines.map((line) => ({
        value: line?.value ?? '',
        visible: typeof line?.visible === 'boolean' ? line.visible : true
      }));
    }
    if (templateData?.description) {
      const plain = String(templateData.description)
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      return [ { value: plain, visible: true } ];
    }
    return defaultData.bodyLines;
  };

  const applyCompanyToForm = (company) => {
    if (!company) return;
    setFormData((prev) => ({
      ...prev,
      logo: { ...prev.logo, value: toAbsoluteUrl(company.logo || '') },
      brandName: { ...prev.brandName, value: company.name || '' },
      phone: { ...prev.phone, value: company.contactNumber || prev.phone.value },
      website: { ...prev.website, value: company.username || prev.website.value },
      footerAddress: { ...prev.footerAddress, value: company.address || prev.footerAddress.value }
    }));
  };

  const clearCompanyFromForm = () => {
    setFormData((prev) => ({
      ...prev,
      logo: { ...prev.logo, value: '' },
      brandName: { ...prev.brandName, value: '' },
      phone: { ...prev.phone, value: '' },
      website: { ...prev.website, value: '' },
      footerAddress: { ...prev.footerAddress, value: '' }
    }));
  };

  const fetchCompany = async () => {
    try {
      const response = await EndpointService.getCompanyMasterAccessibleList();
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
    if (!invoiceId) return;
    let isActive = true;
    axiosInstance.get(`/v1/invoice/${invoiceId}`).then((res) => {
      if (!isActive) return;
      const invoice = res.data || {};
      const templateData = invoice?.letterHead || invoice?.data || {};
      const invoiceCompanyId =
        typeof invoice?.company === 'string' ? invoice.company : invoice?.company?._id || '';
      const storedCompanyId = getStoredCompanyId();
      const merged = {
        logo: normalizeField(templateData.logo, defaultData.logo),
        brandName: normalizeField(templateData.brandName, defaultData.brandName),
        slogan: normalizeField(templateData.slogan, defaultData.slogan),
        recipientName: normalizeField(templateData.recipientName, defaultData.recipientName),
        recipientTitle: normalizeField(templateData.recipientTitle, defaultData.recipientTitle),
        recipientCompany: normalizeField(templateData.recipientCompany, defaultData.recipientCompany),
        recipientAddress: normalizeField(templateData.recipientAddress, defaultData.recipientAddress),
        date: normalizeField(templateData.date, defaultData.date),
        bodyLines: normalizeBodyLines(templateData),
        senderName: normalizeField(templateData.senderName, defaultData.senderName),
        senderTitle: normalizeField(templateData.senderTitle, defaultData.senderTitle),
        phone: normalizeField(templateData.phone, defaultData.phone),
        website: normalizeField(templateData.website, defaultData.website),
        footerAddress: normalizeField(templateData.footerAddress, defaultData.footerAddress)
      };
      merged.logo.value = toAbsoluteUrl(merged.logo.value);

      if (templateData?.settings) {
        if (templateData.settings.showSlogan === false) {
          merged.slogan.visible = false;
        }
        if (templateData.settings.showAddress === false) {
          merged.recipientCompany.visible = false;
          merged.recipientAddress.visible = false;
        }
        if (templateData.settings.showSignature === false) {
          merged.senderName.visible = false;
          merged.senderTitle.visible = false;
        }
      }

      setSelectedCompanyId(invoiceCompanyId || storedCompanyId || '');
      setFormData(merged);
      setIsApproved(Boolean(invoice?.letterHeadApproved));
      setHasSaved(false);
    }).catch(() => {
      if (!isActive) return;
      setSelectedCompanyId(getStoredCompanyId() || '');
    });
    return () => { isActive = false; };
  }, [invoiceId]);

  useEffect(() => {
    if (!invoiceId) return;
    setStoredCompanyId(selectedCompanyId);
  }, [selectedCompanyId, invoiceId]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload = {
        _id: invoiceId,
        date: formData.date.value,
        template: 'letterHead',
        letterHead: { ...formData },
        company: selectedCompanyId || undefined
      };
      const response = await axiosInstance.post('/v1/invoice/save', payload);
      if (response.data?._id && !invoiceId) {
        navigate(`/letter-head/${response.data._id}`, { replace: true });
      }
      setHasSaved(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprovalChange = async (nextApproved) => {
    if (!invoiceId) return;
    try {
      setIsApproving(true);
      const payload = {
        _id: invoiceId,
        date: formData.date.value,
        template: 'letterHead',
        letterHead: { ...formData },
        company: selectedCompanyId || undefined,
        letterHeadApproved: nextApproved
      };
      const response = await axiosInstance.post('/v1/invoice/save', payload);
      setIsApproved(Boolean(response.data?.letterHeadApproved ?? nextApproved));
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <MainCard
      title="Letter head Designer"
      secondary={(
        <Stack direction="row" spacing={1}>
          <Button variant="contained" sx={{ backgroundColor: theme.palette.secondary.main }} onClick={handleSave} disabled={isSaving}>
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
      <Grid container spacing={2}>
        {/* LEFT SIDE: PREVIEW */}
        <Grid item xs={12} md={7}>
          <Box sx={{ position: 'sticky', top: 24, height: '85vh', border: '1px solid #ddd' }}>
            <PDFViewer style={{ width: '100%', height: '100%' }}>
              <LetterheadPdf data={formData} />
            </PDFViewer>
          </Box>
        </Grid>

        {/* RIGHT SIDE: CONFIGURATION */}
        <Grid item xs={12} md={5}>
          <Box sx={{ maxHeight: '85vh', overflowY: 'auto', pr: 1 }}>
            <Stack spacing={3}>
              <Typography variant="h5">Header Details</Typography>
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
              <Divider />
              <FieldToggle label="Company Name" value={formData.brandName.value} visible={formData.brandName.visible} onChange={updateField('brandName')} onToggle={toggleField('brandName')} />
              <FieldToggle label="Slogan" value={formData.slogan.value} visible={formData.slogan.visible} onChange={updateField('slogan')} onToggle={toggleField('slogan')} />

              <Divider />

              <Typography variant="h5">Recipient Info</Typography>
              <FieldToggle label="To Name" value={formData.recipientName.value} visible={formData.recipientName.visible} onChange={updateField('recipientName')} onToggle={toggleField('recipientName')} />
              <FieldToggle label="To Title" value={formData.recipientTitle.value} visible={formData.recipientTitle.visible} onChange={updateField('recipientTitle')} onToggle={toggleField('recipientTitle')} />
              <FieldToggle label="Company" value={formData.recipientCompany.value} visible={formData.recipientCompany.visible} onChange={updateField('recipientCompany')} onToggle={toggleField('recipientCompany')} />
              <FieldToggle label="Address" value={formData.recipientAddress.value} visible={formData.recipientAddress.visible} onChange={updateField('recipientAddress')} onToggle={toggleField('recipientAddress')} multiline rows={2} />
              <FieldToggle label="Date" value={formData.date.value} visible={formData.date.visible} onChange={updateField('date')} onToggle={toggleField('date')} />

              <Divider />

              <Typography variant="h5">Body Content</Typography>
              {formData.bodyLines.map((line, index) => (
                <Stack key={`body-${index}`} direction="row" spacing={1} alignItems="center">
                  <FormControlLabel control={<Checkbox checked={line.visible} onChange={toggleBodyLine(index)} />} label="" />
                  <TextField label={`Line ${index + 1}`} value={line.value} onChange={updateBodyLine(index)} fullWidth multiline />
                  <IconButton aria-label="remove" onClick={() => removeBodyLine(index)} size="large">
                    <IconTrash size="1.1rem" color={theme.palette.error.dark} />
                  </IconButton>
                </Stack>
              ))}
              <Button sx={{ color: theme.palette.secondary.dark }} variant="outlined" startIcon={<IconPlus />} onClick={addBodyLine}>
                Add Body Line
              </Button>

              <Divider />

              <Typography variant="h5">Footer & Sender</Typography>
              <FieldToggle label="Sender Name" value={formData.senderName.value} visible={formData.senderName.visible} onChange={updateField('senderName')} onToggle={toggleField('senderName')} />
              <FieldToggle label="Sender Title" value={formData.senderTitle.value} visible={formData.senderTitle.visible} onChange={updateField('senderTitle')} onToggle={toggleField('senderTitle')} />
              <FieldToggle label="Phone" value={formData.phone.value} visible={formData.phone.visible} onChange={updateField('phone')} onToggle={toggleField('phone')} />
              <FieldToggle label="Website" value={formData.website.value} visible={formData.website.visible} onChange={updateField('website')} onToggle={toggleField('website')} />
              <FieldToggle label="Footer Address" value={formData.footerAddress.value} visible={formData.footerAddress.visible} onChange={updateField('footerAddress')} onToggle={toggleField('footerAddress')} multiline rows={2} />
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </MainCard>
  );
}
