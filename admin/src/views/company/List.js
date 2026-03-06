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
  TextField, Typography
} from '@mui/material'
import { IconPlus } from "@tabler/icons";
import { Close, Search as SearchIcon } from "@mui/icons-material";
import MainCard from "ui-component/cards/MainCard";
import EndpointService from "../../services/endpoint.service";
import { STATUS } from '../../utils/enum'
import { useTheme } from '@mui/material/styles'

const headCells = [
  { id: "name", label: "Name" },
  { id: "username", label: "Username" },
  { id: "password", label: "Password" },
  { id: "status", label: "Status" },
];

const createObj = {
  name: "",
  logo: "",
  username: "",
  password: "",
  status: "",
}

const Companies = () => {
  const theme = useTheme()
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [openModel, setOpenModel] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [createCompany, setCreateCompany] = useState(createObj);

  useEffect(() => {
    fetchCompanies();
  }, []);

  function clearData() {
    setCreateCompany(createObj)
  }

  const fetchCompanies = async () => {
    try {
      const response = await EndpointService.getCompanyList();
      setCompanies(response?.companies || []);
    } catch (error) {
      console.log(error.message);
    }
  };

  const addCompany = async (event) => {
    event.preventDefault();
    try {
      await EndpointService.createCompany(createCompany);

      setCreateCompany({
        name: "",
        logo: "",
        username: "",
        password: "",
        status: "",
      });

      fetchCompanies();
    } catch (error) {
      console.log(error.message);
    } finally {
      setOpenModel(false);
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
                    ),
                  }}
              />
            </Grid>

            <Grid item>
              <Fab
                  color="primary"
                  onClick={() => setOpenModel(true)}
              >
                <IconPlus />
              </Fab>
            </Grid>
          </Grid>
        </CardContent>

        {/* Create Company Dialog */}
        <Dialog open={openModel} onClose={() => {
          setOpenModel(false)
          clearData()
        }} fullWidth maxWidth="sm">
          <DialogTitle
              sx={{
                fontSize: '20px',
                fontWeight: '600',
                pt: 3
              }}>
            Add Company
          </DialogTitle>
          <DialogContent>
            <form onSubmit={addCompany}>
              <Stack spacing={3} mt={1}>
                <TextField
                    required
                    label="Company Name"
                    value={createCompany.name}
                    onChange={(e) =>
                        setCreateCompany((prev) => ({
                          ...prev,
                          name: e.target.value,
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
                          logo: e.target.value,
                        }))
                    }
                />

                <TextField
                    required
                    label="Username"
                    value={createCompany.username}
                    onChange={(e) =>
                        setCreateCompany((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                    }
                />

                <TextField
                    required
                    type="password"
                    label="Password"
                    value={createCompany.password}
                    onChange={(e) =>
                        setCreateCompany((prev) => ({
                          ...prev,
                          password: e.target.value,
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
                            status: e.target.value,
                          }))
                      }
                  >
                    {STATUS.map((status) => <MenuItem value={status.value}>{status.label}</MenuItem>)}
                  </Select>
                </FormControl>

                <Button type="submit" variant="contained" sx={{ backgroundColor: theme.palette.secondary.main }}>
                  Add New Company
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
                      <Box>
                        <img
                            src={company.logo}
                            alt="logo"
                            width="40"
                            height="40"
                            style={{ borderRadius: '50%' }}
                        />
                        <Typography>{company.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{company.username}</TableCell>
                    <TableCell>{company.password}</TableCell>
                    <TableCell>
                      <Chip
                          label={company.status}
                          color={STATUS.find((s) => s.value === company.status)?.color || "default"}
                          size="medium"
                      />
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