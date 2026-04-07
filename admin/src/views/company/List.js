import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  Fab,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Typography
} from "@mui/material";

import { IconPlus, IconEdit } from "@tabler/icons";
import { Close, Search as SearchIcon } from "@mui/icons-material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import MainCard from "ui-component/cards/MainCard";
import EndpointService from "../../services/endpoint.service";
import { useTheme } from "@mui/material/styles";

const headCells = [
  { id: "name", label: "Name" },
  { id: "email", label: "email" },
  { id: "owner", label: "Owner" },
  { id: "contact", label: "Contact" },
  { id: "address", label: "Address" },
  { id: "actions", label: "Actions" }
];

const createObj = {
  name: "",
  logo: "",
  username: "",
  owner: "",
  contactPerson: "",
  contactNumber: "",
  address: "",
  pinCode: "",
  stamp: "",
  sign: ""
};

const Companies = () => {
  const theme = useTheme();

  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [openModel, setOpenModel] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [createCompany, setCreateCompany] = useState(createObj);
  const [editId, setEditId] = useState(null);
  const [uploadStampLoading, setUploadStampLoading] = useState(false);
  const [uploadSignLoading, setUploadSignLoading] = useState(false);

  useEffect(() => {
    fetchMasterCompanies();
  }, []);

  const clearData = () => {
    setCreateCompany(createObj);
  };

  const fetchMasterCompanies = async () => {
    try {
      const response = await EndpointService.getCompanyAccessibleList();
      setCompanies(response?.companies || []);
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (editId) {
        await EndpointService.updateCompanyMaster(editId, createCompany);
      } else {
        await EndpointService.createCompanyMaster(createCompany);
      }

      clearData();
      setEditId(null);
      fetchMasterCompanies();
    } catch (error) {
      console.log(error.message);
    } finally {
      setOpenModel(false);
    }
  };

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const handleUpload = async (field, file) => {
    if (!file) return;
    const setLoading = field === "stamp" ? setUploadStampLoading : setUploadSignLoading;
    try {
      setLoading(true);
      const dataUrl = await readFileAsDataUrl(file);
      if (typeof dataUrl === "string") {
        setCreateCompany((prev) => ({ ...prev, [field]: dataUrl }));
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUpload = (field) => {
    setCreateCompany((prev) => ({ ...prev, [field]: "" }));
    const inputId = field === "stamp" ? "stamp-upload-list" : "sign-upload-list";
    const input = document.getElementById(inputId);
    if (input) {
      input.value = "";
    }
  };

  const filteredCompanies = companies.filter((company) =>
      company.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
      <MainCard title="Companies" content={false}>
        <CardContent>
          <Grid container justifyContent="space-between" spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                  fullWidth
                  size="small"
                  placeholder="Search company..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                    ),
                    endAdornment: search && (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setSearch("")}>
                            <Close fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                    )
                  }}
              />
            </Grid>

            <Grid item>
              <Fab
                  color="secondary"
                  onClick={() => {
                    clearData();
                    setEditId(null);
                    setOpenModel(true);
                  }}
              >
                <IconPlus size={24} color={theme.palette.primary.light} />
              </Fab>
            </Grid>
          </Grid>
        </CardContent>

        {/* Dialog */}
        <Dialog
            open={openModel}
            onClose={() => {
              setOpenModel(false);
              clearData();
              setEditId(null);
            }}
            fullWidth
            maxWidth="sm"
        >
          <DialogTitle sx={{ fontSize: "20px", fontWeight: 600, pt: 3 }}>
            {editId ? "Edit Company" : "Create Company"}
          </DialogTitle>

          <DialogContent>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2} mt={1}>
                {/* Basic Info - Two Column Layout */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Company Name"
                    value={createCompany.name}
                    onChange={(e) => setCreateCompany((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    type="email"
                    label="Email"
                    value={createCompany.username}
                    onChange={(e) => setCreateCompany((prev) => ({ ...prev, username: e.target.value }))}
                  />
                </Grid>

                <Grid item xs={12} sm={12}>
                  <TextField
                      fullWidth
                      required
                      label="Logo URL"
                      value={createCompany.logo}
                      onChange={(e) => setCreateCompany((prev) => ({ ...prev, logo: e.target.value }))}
                  />
                </Grid>

                {/* Contact Details */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contact Person"
                    value={createCompany.contactPerson || ""}
                    onChange={(e) => setCreateCompany((prev) => ({ ...prev, contactPerson: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contact Number"
                    value={createCompany.contactNumber || ""}
                    onChange={(e) => setCreateCompany((prev) => ({ ...prev, contactNumber: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} sm={12}>
                  <TextField
                      fullWidth
                      label="Address"
                      value={createCompany.address || ""}
                      onChange={(e) => setCreateCompany((prev) => ({ ...prev, address: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Pin Code"
                    value={createCompany.pinCode || ""}
                    onChange={(e) => setCreateCompany((prev) => ({ ...prev, pinCode: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <TextField
                      fullWidth
                      label="Owner"
                      value={createCompany.owner || ""}
                      onChange={(e) => setCreateCompany((prev) => ({ ...prev, owner: e.target.value }))}
                  />
                </Grid>

                {/* Image Upload Area (Stamp) */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500, color: '#5e35b1' }}>Company Stamp</Typography>
                  <Box
                    sx={{
                      borderRadius: '12px',
                      height: 140,
                      border: "2px dashed",
                      borderColor: theme.palette.primary.light,
                      display: "flex",
                      flexDirection: 'column',
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#f9faff",
                      cursor: "pointer",
                      position: 'relative',
                      overflow: 'hidden',
                      "&:hover": { backgroundColor: "#f0f2ff", borderColor: theme.palette.primary.main }
                    }}
                    onClick={() => document.getElementById("stamp-upload-list")?.click()}
                  >
                    <input id="stamp-upload-list" type="file" hidden onChange={(e) => handleUpload("stamp", e.target.files?.[0])} />
                    
                    {createCompany.stamp ? (
                      <>
                        <Box component="img" src={createCompany.stamp} sx={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        <IconButton 
                          size="small" 
                          sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(255,0,0,0.1)' }}
                          onClick={(e) => { e.stopPropagation(); handleRemoveUpload("stamp"); }}
                        >
                          <Close fontSize="small" color="error" />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <CloudUploadIcon sx={{ fontSize: 32, color: theme.palette.primary.main, mb: 1 }} />
                        <Typography variant="body2" color="textSecondary">Drop stamp here or click</Typography>
                      </>
                    )}
                  </Box>
                </Grid>

                {/* Image Upload Area (Sign) */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500, color: '#5e35b1' }}>Authorized Sign</Typography>
                  <Box
                    sx={{
                      borderRadius: '12px',
                      height: 140,
                      border: "2px dashed",
                      borderColor: theme.palette.primary.light,
                      display: "flex",
                      flexDirection: 'column',
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#f9faff",
                      cursor: "pointer",
                      position: 'relative',
                      overflow: 'hidden',
                      "&:hover": { backgroundColor: "#f0f2ff", borderColor: theme.palette.primary.main }
                    }}
                    onClick={() => document.getElementById("sign-upload-list")?.click()}
                  >
                    <input id="sign-upload-list" type="file" hidden onChange={(e) => handleUpload("sign", e.target.files?.[0])} />
                    
                    {createCompany.sign ? (
                      <>
                        <Box component="img" src={createCompany.sign} sx={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        <IconButton 
                          size="small" 
                          sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(255,0,0,0.1)' }}
                          onClick={(e) => { e.stopPropagation(); handleRemoveUpload("sign"); }}
                        >
                          <Close fontSize="small" color="error" />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <CloudUploadIcon sx={{ fontSize: 32, color: theme.palette.primary.main, mb: 1 }} />
                        <Typography variant="body2" color="textSecondary">Drop sign here or click</Typography>
                      </>
                    )}
                  </Box>
                </Grid>

                {/* Action Button */}
                <Grid item xs={12} mt={2}>
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    size="large"
                    sx={{ 
                      py: 1.5,
                      borderRadius: '8px',
                      backgroundColor: theme.palette.secondary.main,
                      boxShadow: theme.shadows[4]
                    }}
                  >
                    {editId ? "Save" : "Create Company"}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </DialogContent>
        </Dialog>

        {/* Table */}
        <TableContainer sx={{ px: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                {headCells.map((cell) => (
                    <TableCell key={cell.id}>{cell.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredCompanies
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((company) => (
                  <TableRow key={company._id}>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box
                            component="img"
                            src={company.logo}
                            alt="logo"
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: "50%",
                              objectFit: "cover"
                            }}
                        />
                        <Typography>{company.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{company.username}</TableCell>
                    <TableCell>{company.owner}</TableCell>
                    <TableCell>
                      <Typography>{company.contactPerson}</Typography>
                      <Typography>{company.contactNumber}</Typography>
                    </TableCell>
                    <TableCell width={250}>
                      <Typography>{company.address}</Typography>
                      <Typography>{company.pinCode}</Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                          onClick={() => {
                            setCreateCompany(company);
                            setEditId(company._id);
                            setOpenModel(true);
                          }}
                      >
                        <IconEdit size={24} color={theme.palette.secondary.main} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
            component="div"
            count={filteredCompanies.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) =>
                setRowsPerPage(parseInt(e.target.value, 10))
            }
            rowsPerPageOptions={[5, 10, 25]}
        />
      </MainCard>
  );
};

export default Companies;
