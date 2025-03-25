import React, { useState, useEffect } from "react";
import { Search } from "@mui/icons-material";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  InputAdornment,
  Box,
  Pagination,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/baseUrl";
import { logoutUser } from "../utils/authUtils";
import TableInput from "../components/SharedComponents/TableInput";
import TableSelect from "../components/SharedComponents/TableSelect";
import CustomButton from "../components/SharedComponents/CustomButton";

function VendorDetails() {
  const [vendors, setVendors] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters with ID values
  const [state, setState] = useState("all");
  const [country, setCountry] = useState("all");
  const [status, setStatus] = useState("all");

  // Combined sales filter
  const [salesRange, setSalesRange] = useState("all");

  // State and country options fetched from API
  const [stateOptions, setStateOptions] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);

  // Sales range options
  const salesRangeOptions = [
    { value: "all", label: "All Sales" },
    { value: "0-1000", label: "0 - 1,000" },
    { value: "1000-5000", label: "1,000 - 5,000" },
    { value: "5000-10000", label: "5,000 - 10,000" },
    { value: "10000-50000", label: "10,000 - 50,000" },
    { value: "50000+", label: "50,000+" },
  ];

  // Fetch State & Country Options
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [statesRes, countriesRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/states`),
          axios.get(`${BASE_URL}/api/countries`),
        ]);

        setStateOptions(statesRes.data || []);
        setCountryOptions(countriesRes.data || []);
      } catch (err) {
        console.error("Error fetching filters:", err);
      }
    };
    fetchFilters();
  }, []);

  // Parse sales range to get min and max values
  const getSalesRangeValues = (range) => {
    if (range === "all") return { minSales: undefined, maxSales: undefined };

    if (range === "50000+") return { minSales: "50000", maxSales: undefined };

    const [min, max] = range.split("-");
    return { minSales: min, maxSales: max };
  };

  // Fetch vendors from API using Axios
  useEffect(() => {
    const fetchVendors = async () => {
      const token = localStorage.getItem("token");

      // if (!token) {
      //   setError("Authorization token is missing. Please log in.");
      //   navigate("/login");
      //   return;
      // }

      try {
        setLoading(true);

        const { minSales, maxSales } = getSalesRangeValues(salesRange);

        const response = await axios.get(
          `${BASE_URL}/api/vendor/all`,
          { withCredentials: true },
          {
            headers: {
              "Content-Type": "application/json",
              authorization: `Bearer ${token}`,
            },

            params: {
              isVerified:
                status === "true"
                  ? "true"
                  : status === "false"
                  ? "false"
                  : undefined,
              isBlocked: status === "blocked" ? "true" : undefined,
              state: state !== "all" ? state : undefined,
              country: country !== "all" ? country : undefined,
              minSales: minSales,
              maxSales: maxSales,
              search: searchText || undefined,
              page,
              limit: rowsPerPage,
              shop: "zen-chatbot.myshopify.com",
            },
          }
        );

        setVendors(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalItems(response.data.totalItems || 0);
      } catch (err) {
        if (err.response) {
          if (err.response.status === 401 || err.response.status === 404) {
            logoutUser();
          } else if (err.response.status === 403) {
            setError("You do not have permission to view the vendors.");
          } else {
            setError("Failed to fetch vendors.");
          }
        } else {
          setError("Network error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, [
    state,
    country,
    status,
    salesRange,
    page,
    rowsPerPage,
    searchText,
    navigate,
  ]);

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleView = (isVerified, id) => {
    navigate(isVerified ? `/vendor-view/${id}` : `/vendor-approve/${id}`);
  };

  const getStatusChip = (isVerified, isBlocked) => {
    if (isBlocked === true || isBlocked === "true") {
      return <Chip label="Blocked" color="error" />;
    }
    return (
      <Chip
        label={isVerified ? "Approved" : "Pending"}
        color={isVerified ? "success" : "warning"}
      />
    );
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1); // Reset to first page when changing rows per page
  };

  const handleFilterChange = (setter) => (event) => {
    setter(event.target.value);
    setPage(1); // Reset to first page on filter change
  };

  const handleClearFilters = () => {
    setState("all");
    setCountry("all");
    setStatus("all");
    setSalesRange("all");
    setSearchText("");
    setPage(1);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 2,
        }}
      >
        <Typography variant="h4">
          <b>Vendor Management</b>
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {new Date().toLocaleString()}
        </Typography>
      </Box>

      {error && (
        <Box mb={2}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      <Card>
        <CardHeader
          title=""
          action={
            <Box
              sx={{ display: "flex", justifyContent: "flex-end", pr: 2, pt: 2 }}
            >
              <CustomButton variant="contained" icon={AddIcon}>
                {/* <Link
                  style={{ textDecoration: "none", color: "inherit" }}
                  to={"/add-seller"}
                >
                  ADD
                </Link> */}
                <NavLink
                  to="/add-seller"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  ADD
                </NavLink>
              </CustomButton>
            </Box>
          }
        />

        <CardContent>
          {/* Search & Filters */}
          <Box
            sx={{ display: "flex", gap: 2, marginBottom: 2, flexWrap: "wrap" }}
          >
            <TableInput
              id="search-category"
              name="search"
              placeholder="Search Category Type"
              value={searchText}
              onChange={handleSearchChange}
              label="Search"
              type="text"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ width: "300px" }}
            />

            <TableSelect
              id="state-filter"
              name="state"
              value={state}
              onChange={handleFilterChange(setState)}
              label="State"
              MenuItems={[
                { value: "all", label: "All" },
                ...stateOptions.map((s) => ({ value: s._id, label: s.name })),
              ]}
            />

            <TableSelect
              id="country-filter"
              name="country"
              value={country}
              onChange={handleFilterChange(setCountry)}
              label="Country"
              MenuItems={[
                { value: "all", label: "All" },
                ...countryOptions.map((c) => ({ value: c._id, label: c.name })),
              ]}
            />

            <TableSelect
              id="status-filter"
              name="status"
              value={status}
              onChange={handleFilterChange(setStatus)}
              label="Status"
              MenuItems={[
                { value: "all", label: "All" },
                { value: "true", label: "Approved" },
                { value: "false", label: "Pending" },
                { value: "blocked", label: "Blocked" },
              ]}
            />

            <TableSelect
              id="sales-range-filter"
              name="salesRange"
              value={salesRange}
              onChange={handleFilterChange(setSalesRange)}
              label="Total Sales"
              MenuItems={salesRangeOptions.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
            />

            <CustomButton
              variant="outlined"
              onClick={handleClearFilters}
              style={{ height: "56px" }}
            >
              Clear
            </CustomButton>
          </Box>

          {/* Loading Indicator */}
          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="300px"
            >
              <CircularProgress color="primary" />
            </Box>
          ) : (
            <>
              {/* Vendor Count Information */}
              <Box
                display="flex"
                justifyContent="flex-start"
                alignItems="center"
                mb={2}
                mt={3}
              >
                <Typography variant="subtitle1" fontWeight="medium">
                  Total Vendors: {totalItems}
                </Typography>
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ mx: 2, height: "20px" }}
                />
                <Typography variant="subtitle1" fontWeight="medium">
                  Showing{" "}
                  {Math.min(vendors.length, 1) > 0
                    ? (page - 1) * rowsPerPage + 1
                    : 0}{" "}
                  to {Math.min(page * rowsPerPage, totalItems)} of {totalItems}{" "}
                  vendors
                </Typography>
              </Box>

              {/* Vendor Table */}
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "primary.main" }}>
                      <TableCell>Company Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Total Sales</TableCell>
                      <TableCell>State</TableCell>
                      <TableCell>Country</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {vendors.length > 0 ? (
                      vendors.map((vendor, index) => (
                        <TableRow key={index}>
                          <TableCell>{vendor.companyName}</TableCell>
                          <TableCell>{vendor.email}</TableCell>
                          <TableCell>
                            {vendor.salesData?.totalSales || 0}
                          </TableCell>
                          <TableCell>{vendor.state?.name}</TableCell>
                          <TableCell>{vendor.country?.name}</TableCell>
                          <TableCell>
                            {getStatusChip(vendor.isVerified, vendor.isBlocked)}
                          </TableCell>
                          <TableCell>
                            <CustomButton
                              isSmall
                              variant="contained"
                              onClick={() =>
                                handleView(vendor.isVerified, vendor._id)
                              }
                            >
                              View
                            </CustomButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          No vendors found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 3,
                }}
              >
                <FormControl variant="outlined" size="small">
                  <InputLabel id="rows-per-page-label">Rows</InputLabel>
                  <Select
                    labelId="rows-per-page-label"
                    id="rows-per-page"
                    value={rowsPerPage}
                    onChange={handleRowsPerPageChange}
                    label="Rows"
                  >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                  </Select>
                </FormControl>

                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />

                <Typography variant="body2">
                  Page {page} of {totalPages}
                </Typography>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default VendorDetails;
