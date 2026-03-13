import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  Fab,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
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
import { STATUS } from "../../utils/enum";
import { useTheme } from "@mui/material/styles";

const headCells = [
  { id: "name", label: "Name" },
  { id: "username", label: "Email" },
  { id: "password", label: "Password" },
  { id: "status", label: "Status" },
  { id: "actions", label: "Actions" }
];

const createObj = {
  name: "",
  logo: "",
  username: "",
  password: "",
  status: "",
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
    fetchCompanies();
  }, []);

  const clearData = () => {
    setCreateCompany(createObj);
  };

  const fetchCompanies = async () => {
    try {
      const response = await EndpointService.getCompanyList();
      setCompanies(response?.companies || []);
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (editId) {
        await EndpointService.updateCompany(editId, createCompany);
      } else {
        await EndpointService.createCompany(createCompany);
      }

      clearData();
      setEditId(null);
      fetchCompanies();
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
            {editId ? "Update Company" : "Add Company"}
          </DialogTitle>

          <DialogContent>
            <form onSubmit={handleSubmit}>
              <Stack spacing={3} mt={1}>
                <TextField
                    required
                    label="Company Name"
                    value={createCompany.name}
                    onChange={(e) =>
                        setCreateCompany((prev) => ({
                          ...prev,
                          name: e.target.value
                        }))
                    }
                />

                <TextField
                    required
                    label="Logo URL"
                    value={createCompany.logo}
                    onChange={(e) =>
                        setCreateCompany((prev) => ({
                          ...prev,
                          logo: e.target.value
                        }))
                    }
                />

                <TextField
                    required
                    type="email"
                    label="email"
                    value={createCompany.username}
                    onChange={(e) =>
                        setCreateCompany((prev) => ({
                          ...prev,
                          username: e.target.value
                        }))
                    }
                />

                <TextField
                    required={!editId}
                    label="Password"
                    value={createCompany.password}
                    onChange={(e) =>
                        setCreateCompany((prev) => ({
                          ...prev,
                          password: e.target.value
                        }))
                    }
                />

                <FormControl required>
                  <InputLabel>Status</InputLabel>
                  <Select
                      value={createCompany.status}
                      label="Status"
                      onChange={(e) =>
                          setCreateCompany((prev) => ({
                            ...prev,
                            status: e.target.value
                          }))
                      }
                  >
                    {STATUS.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.label}
                        </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                    label="Owner"
                    value={createCompany.owner || ""}
                    onChange={(e) =>
                        setCreateCompany((prev) => ({
                          ...prev,
                          owner: e.target.value
                        }))
                    }
                />

                <TextField
                    label="Contact Person"
                    value={createCompany.contactPerson || ""}
                    onChange={(e) =>
                        setCreateCompany((prev) => ({
                          ...prev,
                          contactPerson: e.target.value
                        }))
                    }
                />

                <TextField
                    label="Contact Number"
                    value={createCompany.contactNumber || ""}
                    onChange={(e) =>
                        setCreateCompany((prev) => ({
                          ...prev,
                          contactNumber: e.target.value
                        }))
                    }
                />

                <TextField
                    label="Address"
                    multiline
                    rows={2}
                    value={createCompany.address || ""}
                    onChange={(e) =>
                        setCreateCompany((prev) => ({
                          ...prev,
                          address: e.target.value
                        }))
                    }
                />

                <TextField
                    label="Pin Code"
                    value={createCompany.pinCode || ""}
                    onChange={(e) =>
                        setCreateCompany((prev) => ({
                          ...prev,
                          pinCode: e.target.value
                        }))
                    }
                />

                <Box
                  sx={{
                    borderRadius: 2,
                    height: 130,
                    border: "2px dashed #c7d2fe",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#64748b",
                    backgroundColor: "#f8fafc",
                    transition: "border-color 0.2s, box-shadow 0.2s, background-color 0.2s",
                    cursor: editId ? "pointer" : "default",
                    "&:hover": editId
                      ? {
                          borderColor: "#7c9cff",
                          boxShadow: "0 0 0 3px rgba(124, 156, 255, 0.15)",
                          backgroundColor: "#f5f8ff"
                        }
                      : {}
                  }}
                  onClick={() => {
                    const input = document.getElementById("stamp-upload-list");
                    input?.click();
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleUpload("stamp", e.dataTransfer.files?.[0]);
                  }}
                >
                  <input
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    style={{ display: "none" }}
                    id="stamp-upload-list"
                    multiple={false}
                    type="file"
                    disabled={false}
                    onChange={(event) => handleUpload("stamp", event.target.files?.[0])}
                  />
                  {createCompany.stamp ? (
                    <Box sx={{ width: "100%", height: "100%", p: 1 }}>
                      <Box
                        component="img"
                        src={createCompany.stamp}
                        alt="stamp preview"
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          borderRadius: 1,
                          backgroundColor: "white"
                        }}
                      />
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: "center", px: 2 }}>
                      <CloudUploadIcon sx={{ fontSize: 28, color: "#94a3b8", mb: 0.5 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#475569" }}>
                        {uploadStampLoading ? "Uploading..." : "Drag & drop a file here"}
                      </Typography>
                      <Typography variant="caption" sx={{ display: "block", color: "#94a3b8" }}>
                        or click to browse (PNG, JPG, WEBP)
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box
                  sx={{
                    borderRadius: 2,
                    height: 130,
                    border: "2px dashed #c7d2fe",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#64748b",
                    backgroundColor: "#f8fafc",
                    transition: "border-color 0.2s, box-shadow 0.2s, background-color 0.2s",
                    cursor: editId ? "pointer" : "default",
                    "&:hover": editId
                      ? {
                          borderColor: "#7c9cff",
                          boxShadow: "0 0 0 3px rgba(124, 156, 255, 0.15)",
                          backgroundColor: "#f5f8ff"
                        }
                      : {}
                  }}
                  onClick={() => {
                    const input = document.getElementById("sign-upload-list");
                    input?.click();
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleUpload("sign", e.dataTransfer.files?.[0]);
                  }}
                >
                  <input
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    style={{ display: "none" }}
                    id="sign-upload-list"
                    multiple={false}
                    type="file"
                    disabled={false}
                    onChange={(event) => handleUpload("sign", event.target.files?.[0])}
                  />
                  {createCompany.sign ? (
                    <Box sx={{ width: "100%", height: "100%", p: 1 }}>
                      <Box
                        component="img"
                        src={createCompany.sign}
                        alt="sign preview"
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          borderRadius: 1,
                          backgroundColor: "white"
                        }}
                      />
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: "center", px: 2 }}>
                      <CloudUploadIcon sx={{ fontSize: 28, color: "#94a3b8", mb: 0.5 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#475569" }}>
                        {uploadSignLoading ? "Uploading..." : "Drag & drop a file here"}
                      </Typography>
                      <Typography variant="caption" sx={{ display: "block", color: "#94a3b8" }}>
                        or click to browse (PNG, JPG, WEBP)
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Button
                    type="submit"
                    variant="contained"
                    sx={{ backgroundColor: theme.palette.secondary.main }}
                >
                  {editId ? "Update Company" : "Add New Company"}
                </Button>
              </Stack>
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
                    <TableCell>{company.password}</TableCell>

                    <TableCell>
                      <Chip
                          label={company.status}
                          color={
                              STATUS.find((s) => s.value === company.status)?.color ||
                              "default"
                          }
                      />
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
