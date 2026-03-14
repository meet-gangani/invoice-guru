import React, { useEffect, useState } from 'react';
import { Box, Button, Checkbox, Divider, FormControlLabel, Grid, Stack, TextField, Typography } from '@mui/material';
import { Document, Page, PDFViewer, StyleSheet, Text, View } from '@react-pdf/renderer';
import MainCard from 'ui-component/cards/MainCard';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useParams } from 'react-router-dom';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Html from 'react-pdf-html';
import axiosInstance from '../../services/axiosInstance';

// --- PDF STYLES (MATCHING YOUR IMAGE) ---
const pdfStyles = StyleSheet.create({
  page: { padding: 55, fontSize: 10, fontFamily: 'Helvetica', color: '#333' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 26 },
  logoSection: { flexDirection: 'row', alignItems: 'center' },
  logoMark: { width: 26, height: 26, border: '2pt solid #f39c12', marginRight: 10, position: 'relative' },
  logoInner: { width: 12, height: 12, border: '2pt solid #f39c12', position: 'absolute', top: 6, left: 6 },
  brandName: { fontSize: 20, fontWeight: 'bold', letterSpacing: 0.4 },
  slogan: { fontSize: 9, color: '#666' },

  metaSection: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  recipientInfo: { lineHeight: 1.4 },
  toLabel: { fontWeight: 'bold', fontSize: 10, marginBottom: 4, letterSpacing: 0.2 },
  dateText: { textAlign: 'right', fontWeight: 'bold', fontSize: 10 },

  body: { marginTop: 6, marginBottom: 28, lineHeight: 1.55 },

  signatureSection: { marginTop: 16 },
  handwritten: { fontSize: 18, color: '#555', marginBottom: -3, fontFamily: 'Times-Italic' },
  sigName: { fontWeight: 'bold', fontSize: 11 },

  footer: {
    position: 'absolute',
    bottom: 28,
    left: 55,
    right: 55,
    borderTop: '1pt solid #eee',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#777'
  },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerIcon: { width: 18, height: 18, backgroundColor: '#f39c12', alignItems: 'center', justifyContent: 'center' },
  footerIconText: { fontSize: 10, color: '#fff', fontWeight: 'bold' },
  footerText: { fontSize: 8, color: '#777' }
});

const LetterheadPdf = ({ data, settings }) => (
  <Document title="Letterhead Preview">
    <Page size="A4" style={pdfStyles.page}>
      <View style={pdfStyles.header}>
        <View style={pdfStyles.logoSection}>
          <View style={pdfStyles.logoMark}>
            <View style={pdfStyles.logoInner} />
          </View>
          <View>
            <Text style={pdfStyles.brandName}>{data.brandName}</Text>
            {settings.showSlogan && <Text style={pdfStyles.slogan}>{data.slogan}</Text>}
          </View>
        </View>
      </View>

      <View style={pdfStyles.metaSection}>
        <View style={pdfStyles.recipientInfo}>
          <Text style={pdfStyles.toLabel}>TO</Text>
          <Text style={{ fontSize: 13, fontWeight: 'bold' }}>{data.recipientName}</Text>
          <Text>{data.recipientTitle}</Text>
          {settings.showAddress && (
            <View style={{ marginTop: 5 }}>
              <Text>{data.recipientCompany}</Text>
              <Text>{data.recipientAddress}</Text>
            </View>
          )}
        </View>
        <Text style={pdfStyles.dateText}>DATE: {data.date}</Text>
      </View>

      <View style={pdfStyles.body}>
        <Html>{data.description}</Html>
      </View>

      {settings.showSignature && (
        <View style={pdfStyles.signatureSection}>
          <Text style={pdfStyles.handwritten}>{data.senderName}</Text>
          <Text style={pdfStyles.sigName}>{data.senderName}</Text>
          <Text>{data.senderTitle}</Text>
        </View>
      )}

      <View style={pdfStyles.footer}>
        <View style={pdfStyles.footerItem}>
          <View style={pdfStyles.footerIcon}><Text style={pdfStyles.footerIconText}>☎</Text></View>
          <Text style={pdfStyles.footerText}>{data.phone}</Text>
        </View>
        <View style={pdfStyles.footerItem}>
          <View style={pdfStyles.footerIcon}><Text style={pdfStyles.footerIconText}>🌐</Text></View>
          <Text style={pdfStyles.footerText}>{data.website}</Text>
        </View>
        <View style={pdfStyles.footerItem}>
          <View style={pdfStyles.footerIcon}><Text style={pdfStyles.footerIconText}>⌖</Text></View>
          <Text style={pdfStyles.footerText}>{data.footerAddress}</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export default function LetterheadDocument() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id: invoiceId } = useParams();

  const [settings, setSettings] = useState({ showSlogan: true, showAddress: true, showSignature: true });
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    brandName: 'COMPANY',
    slogan: 'YOUR SLOGAN HERE',
    recipientName: 'Jonathon Doe',
    recipientTitle: 'Designer',
    recipientCompany: 'Company Name',
    recipientAddress: 'City, Road Name, 12345',
    date: '12/05/2026',
    description: '<p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit...</p>',
    senderName: 'Jonathon Doe',
    senderTitle: 'Graphic Designer',
    phone: '000 1234 567 890',
    website: 'your website here',
    footerAddress: 'your address here'
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (!invoiceId) return;
    let isActive = true;
    axiosInstance.get(`/v1/invoice/${invoiceId}`).then((res) => {
      if (!isActive) return;
      const invoice = res.data || {};
      const templateData = invoice?.letterHead || invoice?.data;
      if (templateData) {
        setFormData((prev) => ({ ...prev, ...templateData }));
        if (templateData.settings) {
          setSettings((prev) => ({ ...prev, ...templateData.settings }));
        }
      }
    }).catch(() => {});
    return () => { isActive = false; };
  }, [invoiceId]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload = { _id: invoiceId, date: formData.date, template: 'letterHead', letterHead: { ...formData, settings } };
      const response = await axiosInstance.post('/v1/invoice/save', payload);
      if (response.data?._id && !invoiceId) {
        navigate(`/letter-head/${response.data._id}`, { replace: true });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MainCard
      title="Letter head Designer"
      secondary={(
        <Button variant="contained" sx={{ backgroundColor: theme.palette.secondary.main }} onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      )}
    >
      <Grid container spacing={2}>
        {/* LEFT SIDE: PREVIEW */}
        <Grid item xs={12} md={7}>
          <Box sx={{ position: 'sticky', top: 24, height: '85vh', border: '1px solid #ddd' }}>
            <PDFViewer style={{ width: '100%', height: '100%' }}>
              <LetterheadPdf data={formData} settings={settings} />
            </PDFViewer>
          </Box>
        </Grid>

        {/* RIGHT SIDE: CONFIGURATION */}
        <Grid item xs={12} md={5}>
          <Box sx={{ maxHeight: '85vh', overflowY: 'auto', pr: 1 }}>
            <Stack spacing={3}>
              <Typography variant="h5" color="secondary">Visibility Toggle</Typography>
              <Stack direction="row" spacing={2}>
                <FormControlLabel control={<Checkbox checked={settings.showSlogan} onChange={(e) => setSettings({...settings, showSlogan: e.target.checked})} />} label="Slogan" />
                <FormControlLabel control={<Checkbox checked={settings.showAddress} onChange={(e) => setSettings({...settings, showAddress: e.target.checked})} />} label="Address" />
                <FormControlLabel control={<Checkbox checked={settings.showSignature} onChange={(e) => setSettings({...settings, showSignature: e.target.checked})} />} label="Signature" />
              </Stack>

              <Divider />

              <Typography variant="h5">Header Details</Typography>
              <TextField label="Company Name" fullWidth value={formData.brandName} onChange={(e) => handleChange('brandName', e.target.value)} />
              <TextField label="Slogan" fullWidth value={formData.slogan} onChange={(e) => handleChange('slogan', e.target.value)} />

              <Typography variant="h5">Recipient Info</Typography>
              <TextField label="To Name" fullWidth value={formData.recipientName} onChange={(e) => handleChange('recipientName', e.target.value)} />
              <TextField label="To Title" fullWidth value={formData.recipientTitle} onChange={(e) => handleChange('recipientTitle', e.target.value)} />
              <TextField label="Date" fullWidth value={formData.date} onChange={(e) => handleChange('date', e.target.value)} />

              <Divider />

              <Typography variant="h5">Body Content</Typography>
              <Box sx={{
                '& .ck-editor': { border: '1px solid #c4c4c4', borderRadius: 1 },
                '& .ck-editor__editable': { minHeight: 260, padding: 1 }
              }}>
                <CKEditor
                  editor={ClassicEditor}
                  config={{
                    toolbar: [ 'heading', '|', 'bold', 'italic', 'link', '|', 'bulletedList', 'numberedList', '|', 'undo', 'redo' ]
                  }}
                  data={formData.description}
                  onReady={(editor) => {
                    editor.editing.view.change((writer) => {
                      writer.setStyle('min-height', '260px', editor.editing.view.document.getRoot());
                      writer.setStyle('max-height', '260px', editor.editing.view.document.getRoot());
                    });
                  }}
                  onChange={(event, editor) => {
                    handleChange('description', editor.getData());
                  }}
                />
              </Box>

              <Divider />

              <Typography variant="h5">Footer & Sender</Typography>
              <TextField label="Sender Name" fullWidth value={formData.senderName} onChange={(e) => handleChange('senderName', e.target.value)} />
              <TextField label="Phone" fullWidth value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} />
              <TextField label="Website" fullWidth value={formData.website} onChange={(e) => handleChange('website', e.target.value)} />
              <TextField label="Footer Address" fullWidth multiline rows={2} value={formData.footerAddress} onChange={(e) => handleChange('footerAddress', e.target.value)} />
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </MainCard>
  );
}
