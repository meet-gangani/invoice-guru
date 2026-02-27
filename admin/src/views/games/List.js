import * as React from "react";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { makeStyles, useTheme } from "@mui/styles";
import { visuallyHidden } from "@mui/utils";
import MainCard from "ui-component/cards/MainCard";
import gameService from "../../services/game.service";
import {
  getComparator,
  rowsInitial,
  stableSort,
} from "../../utils/table-filter";
import {
  IconDeviceDesktop,
  IconDeviceMobile,
  IconPlus,
  IconX,
} from "@tabler/icons";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Fab,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import defaultImg from '../../assets/images/white-logo3.png'
import {
  Close,
  Launch,
  Search as SearchIcon,
  VisibilityTwoTone as VisibilityTwoToneIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { STATUS } from "../../utils/enum";
import categoryService from "../../services/category.service";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const headCells = [
  {
    id: "name",
    numeric: false,
    label: "Name",
    align: "left",
  },
  {
    id: "description",
    numeric: false,
    label: "Description",
    align: "center",
  },
  {
    id: "status",
    numeric: true,
    label: "Status",
    align: "left",
  },
  {
    id: "visit",
    numeric: false,
    label: "Visit",
    align: "center",
  },
  {
    id: "actions",
    numeric: false,
    label: "View",
    align: "center",
  },
];

// style constant
const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  paper: {
    width: "100%",
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  sortSpan: visuallyHidden,
}));

// ===========================|| TABLE HEADER ||=========================== //

function EnhancedTableHead({ classes, order, orderBy, onRequestSort }) {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            padding={headCell.disablePadding ? "none" : "normal"}
          // sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.label}
            {/* <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {orderBy === headCell.id ? (
                <span className={classes.sortSpan}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </span>
              ) : null}
            </TableSortLabel> */}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

// ===========================|| CUSTOMER LIST ||=========================== //

const Games = () => {
  const classes = useStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [games, setGames] = useState([]);
  const [createGame, setCreateGame] = useState({
    gameName: "",
    description: "",
    thumbnail: "/white-logo3.png",
    gamePreview: "",
    rating: "",
    developer: "",
    technology: "",
    platform: "",
    shortDescription: "",
    categories: [],
    url: "",
    isSupportMobile: false,
    isSupportDesktop: false,
    likes: 0,
    disLikes: 0,
  });
  const [categories, setCategories] = useState([]);
  // const [mobileSupport, setMobileSupport] = useState();
  // const [desktopSupport, setDesktopSupport] = useState();
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("calories");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [rows, setRows] = React.useState(rowsInitial);
  const [openModel, setOpenModel] = React.useState(false);
  const [noSearchResults, setNoSearchResults] = useState(false);

  useEffect(() => {
    fetchGames();
    fetchCategories();
    setNoSearchResults(false);
  }, [rowsPerPage]);

  async function fetchGames() {
    try {
      const response = await gameService.getGameList();
      const gamesData = response?.games || [];
      const sortedData = gamesData.sort(
        (a, b) => new Date(b.createdOn) - new Date(a.createdOn)
      );
      setGames(sortedData);
    } catch (error) {
      console.log(error.message);
    }
  }

  async function fetchCategories() {
    try {
      const response = await categoryService.getActiveCategoryList();
      setCategories(response.categories);
    } catch (error) {
      console.log(error);
    }
  }

  async function addGame(event) {
    try {
      event.preventDefault();
      const res = await gameService.createGames(createGame);

      setGames([...games, res.data]);
      setCreateGame({
        gameName: "",
        slug: "",
        description: "",
        thumbnail: "",
        gamePreview: "",
        rating: "",
        developer: "",
        technology: "",
        platform: "",
        shortDescription: "",
        categories: [],
        url: "",
        isSupportMobile: false,
        isSupportDesktop: false,
        likes: 0,
        disLikes: 0,
      });
      await fetchGames()
    } catch (error) {
      console.log(error.message);
    } finally {
      setOpenModel(false);
    }
  }

  const handleSearch = (event) => {
    const newString = event?.target?.value || search;
    if (newString) {
      const searchedGames = games.filter((game) =>
        game.gameName.toLowerCase().includes(newString.toString().toLowerCase())
      );
      if (searchedGames.length) {
        setGames(searchedGames);
        setNoSearchResults(false);
      } else {
        setNoSearchResults(true);
      }
    } else {
      fetchGames(); // Reset to all games if search is cleared
      setNoSearchResults(false);
    }
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - games.length) : 0;

  return (
    <MainCard title="Games" content={false}>
      <CardContent>
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Grid item xs={12} sm={6}>
            <TextField
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: search && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSearch('');
                        fetchGames();
                        setNoSearchResults(false);
                      }}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch(e);
                }
              }}
              placeholder="Search games..."
              value={search}
              size="small"
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={2}
            sx={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "flex-end",
              marginRight: "10px",
            }}
          >
            <Fab
              sx={{
                width: "50px",
                height: "50px",
                backgroundColor: "rgb(247,190,21)",
                color: "white",
                ":hover": { backgroundColor: "rgb(250,207,87)" },
              }}
              aria-label="add"
              onClick={() => setOpenModel(true)}
            >
              <IconPlus stroke={2.5} size="1.3rem" />
            </Fab>
            <Dialog
              scroll="paper"
              open={openModel}
              onClose={() => setOpenModel(false)}
              fullScreen={useMediaQuery(theme.breakpoints.down("sm"))}
              fullWidth
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "& .MuiDialog-paper": {
                  width: "100%",
                  maxWidth: {
                    xs: "100vw",
                    sm: "90%",
                    md: '100%',
                    lg: "1000px",
                  },
                  maxHeight: { xs: "100vh", sm: "95vh" },
                  margin: { xs: 0, sm: "16px" },
                },
              }}
            >
              <Grid
                item
                xs={12}
                sx={{
                  backgroundColor: "white",
                  py: 2,
                  px: 3,
                  pb: 3,
                  borderRadius: "20px",
                }}
              >
                <DialogTitle
                  sx={{
                    fontSize: "22px",
                    fontWeight: "600",
                    padding: 0,
                    paddingBottom: "4px",
                    color: "rgb(206,154,7)",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  Add Game
                  {isMobile && (
                    <IconButton
                      onClick={() => setOpenModel(false)}
                      variant="outlined"
                      sx={{ border: "2px solid #f2afaa" }}
                    >
                      <Close color="error" />
                    </IconButton>
                  )}
                </DialogTitle>
                <DialogContent
                  sx={{
                    fontSize: "16px",
                    paddingX: 0,
                    paddingBottom: "24px",
                    color: "rgb(206,154,7)",
                  }}
                >
                  Fill in the information of new game.
                </DialogContent>
                <form onSubmit={addGame}>
                  <Stack spacing={3}>
                    <TextField
                      sx={{ width: "100%" }}
                      required
                      variant="outlined"
                      type="text"
                      label="Game Name"
                      placeholder="Game Name"
                      value={createGame.gameName || ""}
                      onChange={(e) =>
                        setCreateGame({
                          ...createGame,
                          gameName: e.target.value,
                        })
                      }
                    />
                    <TextField
                      required
                      id="outlined-multiline-static"
                      label="Short Description"
                      multiline
                      rows={2}
                      value={createGame.shortDescription}
                      onChange={(e) =>
                        setCreateGame({
                          ...createGame,
                          shortDescription: e.target.value,
                        })
                      }
                    />
                    <Grid item xs={12} className="App" marginY={2}>
                      <CKEditor
                        onReady={(editor) => {
                          editor.editing.view.change((writer) => {
                            writer.setStyle(
                              "max-height",
                              "100px",
                              editor.editing.view.document.getRoot()
                            );
                            writer.setStyle(
                              "max-height",
                              "100px",
                              editor.editing.view.document.getRoot()
                            );
                          });
                        }}
                        editor={ClassicEditor}
                        data={createGame?.description}
                        value={createGame?.description || ""}
                        onChange={(event, editor) => {
                          const data = editor.getData();
                          setCreateGame({ ...createGame, description: data });
                        }}
                      />
                    </Grid>
                    {/* <Grid item>
                      <TextField
                        sx={{ width: "full" }}
                        fullWidth
                        variant="outlined"
                        type="url"
                        label="Thumbnail URL"
                        placeholder="Thumbnail URL"
                        value={createGame.thumbnail || ""}
                        startAdornment={
                          <InputAdornment position="start">
                            <Public />
                          </InputAdornment>
                        }
                        onChange={(e) =>
                          setCreateGame({
                            ...createGame,
                            thumbnail: e.target.value,
                          })
                        }
                      />
                    </Grid> */}
                    <Grid item xs={12} sx={{ display: "flex", gap: "20px" }}>
                      <Grid item xs={6}>
                        <FormControl fullWidth>
                          <InputLabel id="demo-simple-select-label">
                            Status
                          </InputLabel>
                          <Select
                            required
                            variant="outlined"
                            type="text"
                            label="Status"
                            labelId="demo-simple-select-label"
                            name="status"
                            value={createGame.status}
                            onChange={(e) =>
                              setCreateGame({
                                ...createGame,
                                status: e.target.value,
                              })
                            }
                          >
                            {STATUS.map((status, index) => (
                              <MenuItem
                                key={`mitem-${index}-${status.label}`}
                                value={status.value}
                              >
                                {status.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <FormControl fullWidth>
                          <InputLabel id="demo-multiple-chip-label">
                            Categories
                          </InputLabel>
                          <Select
                            required
                            multiple
                            labelId="demo-multiple-chip-label"
                            id="demo-multiple-chip"
                            name="categories"
                            value={createGame?.categories || []}
                            onChange={(event) => {
                              setCreateGame({
                                ...createGame,
                                categories: event.target.value,
                              });
                            }}
                            input={
                              <OutlinedInput
                                id="select-multiple-chip"
                                label="Chip"
                              />
                            }
                            renderValue={(selected) => (
                              <Stack gap={1} direction="row" flexWrap="wrap">
                                {selected.map((selectedCategory, index) => (
                                  <Chip
                                    key={index}
                                    label={selectedCategory?.categoryName}
                                    onDelete={() => {
                                      const filteredCategories =
                                        createGame?.categories.filter(
                                          (category) =>
                                            category._id !==
                                            selectedCategory?._id
                                        );
                                      setCreateGame({
                                        ...createGame,
                                        categories: filteredCategories,
                                      });
                                    }}
                                    deleteIcon={
                                      <IconX
                                        size={18}
                                        onMouseDown={(event) =>
                                          event.stopPropagation()
                                        }
                                      />
                                    }
                                  />
                                ))}
                              </Stack>
                            )}
                          >
                            {categories?.map((category) => {
                              const isSelected = createGame?.categories.find(
                                (gameCategory) =>
                                  gameCategory._id === category._id
                              );
                              return (
                                <MenuItem
                                  key={`cat-${category._id}`}
                                  sx={{ display: "flex", gap: "8px" }}
                                  value={category}
                                  divider={true}
                                  selected={!!isSelected}
                                >
                                  <img
                                    src={category?.categoryIcon}
                                    width={20}
                                    height={20}
                                    alt="icon"
                                  />
                                  {category?.categoryName}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>

                    <Grid item xs={12} sx={{ display: "flex", gap: "20px" }}>
                      <Grid item xs={4}>
                        <TextField
                          variant="outlined"
                          type="text"
                          label="Platform"
                          placeholder="Platform"
                          value={createGame.platform || ""}
                          onChange={(e) =>
                            setCreateGame({
                              ...createGame,
                              platform: e.target.value,
                            })
                          }
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          variant="outlined"
                          type="text"
                          label="Technology"
                          placeholder="Technology"
                          value={createGame.technology || ""}
                          onChange={(e) =>
                            setCreateGame({
                              ...createGame,
                              technology: e.target.value,
                            })
                          }
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          variant="outlined"
                          type="text"
                          label="Developer"
                          placeholder="Developer"
                          value={createGame.developer || ""}
                          onChange={(e) =>
                            setCreateGame({
                              ...createGame,
                              developer: e.target.value,
                            })
                          }
                        />
                      </Grid>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      sx={{
                        display: "flex",
                        gap: "20px",
                        marginLeft: "20px",
                        marginY: "15px",
                      }}
                    >
                      <Grid item xs={4}>
                        <TextField
                          variant="outlined"
                          type="text"
                          label="Rating"
                          placeholder="Rating"
                          value={createGame.rating || ""}
                          onChange={(e) =>
                            setCreateGame({
                              ...createGame,
                              rating: e.target.value,
                            })
                          }
                        />
                      </Grid>
                      <Grid
                        item
                        xs={4}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "14px",
                        }}
                      >
                        <Typography>Support :</Typography>
                        <Grid
                          item
                          xs={1}
                          sx={{ display: "flex", alignItems: "center" }}
                        >
                          <IconButton
                            sx={{ border: `2px solid ${createGame.isSupportMobile ? "#ae3ec9" : "#757575"}` }}
                            onClick={() =>
                              setCreateGame((prev) => ({
                                ...prev,
                                isSupportMobile: !prev.isSupportMobile,
                              }))
                            }
                          >
                            <IconDeviceMobile
                              color={createGame.isSupportMobile ? "#ae3ec9" : "#000000"}
                            />
                          </IconButton>
                          <IconButton
                            sx={{ border: `2px solid ${createGame.isSupportDesktop ? "#ae3ec9" : "#757575"}`, ml: 1 }}
                            onClick={() =>
                              setCreateGame((prev) => ({
                                ...prev,
                                isSupportDesktop: !prev.isSupportDesktop,
                              }))
                            }
                          >
                            <IconDeviceDesktop
                              color={createGame.isSupportDesktop ? "#ae3ec9" : "#000000"}
                            />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Alert severity="info" sx={{ mb: 3 }}>
                      <AlertTitle>Notes:</AlertTitle>
                      <Box component="ol" sx={{ m: 0, pl: 2 }}>
                        <li>Recommended thumbnail aspect ratio is 1:1.</li>
                        <li>You can upload game URL or game ZIP after complete game creation.</li>
                      </Box>
                    </Alert>
                    <Button
                      variant="contained"
                      color="success"
                      sx={{ color: "#fff", mt: '12px !important', textTransform: 'uppercase' }}
                      type="submit"
                    >
                      Add Game
                    </Button>
                  </Stack>
                </form>
              </Grid>
            </Dialog>
          </Grid>
        </Grid>
      </CardContent>

      {/* table */}
      <TableContainer sx={{ width: "95%", margin: "auto" }}>
        <Table className={classes.table} aria-labelledby="GameTable">
          <EnhancedTableHead
            classes={classes}
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
            rowCount={rows.length}
          />
          <TableBody>
            {stableSort(rows, getComparator(order, orderBy))
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow hover tabIndex={-1} key={index}>
                    <TableCell
                      component="th"
                      id={labelId}
                      scope="row"
                      sx={{ cursor: "pointer" }}
                      align="center"
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          color:
                            theme.palette.mode === "dark"
                              ? theme.palette.grey[600]
                              : "grey.900",
                        }}
                      >
                        {row.gameName}
                      </Typography>
                      <Typography variant="caption">
                        {" "}
                        {row.shortDescription}{" "}
                      </Typography>
                    </TableCell>
                    <TableCell>{row.description}</TableCell>
                    <TableCell align="center">{row.status}</TableCell>
                    <TableCell align="center" sx={{ pr: 3 }} onClick={(e) => {
                      e.stopPropagation()
                      window.open(`${process.env.REACT_APP_FRONTEND_URL}/game/${row?.slug}`, "_blank", "noopener,noreferrer")
                    }}>
                        <IconButton color="primary">
                          <Launch sx={{ fontSize: "1.3rem" }} />
                        </IconButton>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ pr: 3 }}
                      onClick={() => navigate(row?.url)}
                    >
                      <IconButton color="primary">
                        <VisibilityTwoToneIcon sx={{ fontSize: "1.3rem" }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            {noSearchResults ? (
              <TableRow aria-colspan={4}>
                <TableCell colSpan={4} sx={{ textAlign: "center" }}>
                  No search results found
                </TableCell>
              </TableRow>
            ) : (
              games
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const labelId = `enhanced-table-checkbox-${index}`;
                  return (
                    <TableRow hover
                      tabIndex={-1}
                      key={`table-${row?._id}`}
                      onClick={() => navigate(`/games/${row.slug}`)}
                      sx={{ cursor: "pointer" }}>
                      <TableCell
                        id={labelId}
                        scope="row"
                        sx={{ cursor: "pointer" }}
                      >
                        <Grid
                          item
                          xs={12}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: "20px",
                          }}
                        >
                          <Grid item xs={3}
                            sx={{
                              width: "70px",
                              height: "70px"
                            }}
                          >
                            <img
                              // src={row?.thumbnail.includes(process.env.REACT_APP_BACKEND_URL) ? row.thumbnail : `${process.env.REACT_APP_BACKEND_URL}/${row.thumbnail}`}
                              src={!row?.thumbnail?.includes('http') ? defaultImg : row.thumbnail}
                              width="70px"
                              height="70px"
                              style={{
                                backgroundColor: !row?.thumbnail?.includes('http') ? 'black' : 'white',
                                borderRadius: "50px",
                                objectFit: !row?.thumbnail?.includes('http') ? 'contain' : 'cover',
                              }}
                              alt="game"
                            />
                          </Grid>
                          <Grid item xs={9}>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                color:
                                  theme.palette.mode === "dark"
                                    ? theme.palette.grey[600]
                                    : "grey.900",
                              }}
                              align="center"
                            >
                              {row.gameName}
                            </Typography>
                          </Grid>
                        </Grid>
                      </TableCell>
                      <TableCell align="center" sx={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "650px", // Adjust as needed
                      }}>
                        {row.shortDescription}
                      </TableCell>
                      <TableCell align="left">
                        {row.status === "active" && (
                          <Chip label="Active" size="small" color="success" />
                        )}
                        {row.status === "inactive" && (
                          <Chip label="Inactive" size="small" color="primary" />
                        )}
                        {row.status === "deleted" && (
                          <Chip label="Deleted" size="small" color="error" />
                        )}
                        {row.status === "pending" && (
                          <Chip label="Pending" size="small" color="warning" />
                        )}
                      </TableCell>
                      <TableCell align="center" sx={{ pr: 3 }} onClick={(e) => {
                        e.stopPropagation()
                        window.open(`${process.env.REACT_APP_FRONTEND_URL}/game/${row?.slug}`, "_blank", "noopener,noreferrer")
                      }}>
                        <IconButton
                          color="primary"
                        >
                          <Launch sx={{ fontSize: "1.3rem" }} />
                        </IconButton>
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ pr: 3 }}
                        onClick={() => navigate(`/games/${row.slug}`)}
                      >
                        <IconButton color="primary">
                          <VisibilityTwoToneIcon sx={{ fontSize: "1.3rem" }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
            )}

            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={games.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </MainCard>
  );
};

export default Games;
