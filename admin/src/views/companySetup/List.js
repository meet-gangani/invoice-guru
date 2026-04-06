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

  const filteredCompanies = companies.filter((company) =>
      company.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
      <MainCard title="Company User Setup" content={false}>
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
            {editId ? "Edit Company" : "Setup Company"}
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
                  <FormControl fullWidth required>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={createCompany.status}
                        label="Status"
                        onChange={(e) => setCreateCompany((prev) => ({ ...prev, status: e.target.value }))}
                    >
                      {STATUS.map((status) => (
                          <MenuItem key={status.value} value={status.value}>{status.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
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
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required={!editId}
                    label="Password"
                    value={createCompany.password}
                    onChange={(e) => setCreateCompany((prev) => ({ ...prev, password: e.target.value }))}
                  />
                </Grid>

                {/* Status and Owner */}
                <Grid item xs={12} sm={12}>
                  <TextField
                      fullWidth
                      required
                      label="Logo URL"
                      value={createCompany.logo}
                      onChange={(e) => setCreateCompany((prev) => ({ ...prev, logo: e.target.value }))}
                  />
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
