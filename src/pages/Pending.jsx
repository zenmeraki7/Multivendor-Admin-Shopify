import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  InputAdornment,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  CircularProgress,
  Alert,
  Pagination,
  Chip,
} from "@mui/material";
import { Search, Refresh } from "@mui/icons-material";
import axios from "axios";
import { BASE_URL } from "../utils/baseUrl";
import { Link, useNavigate } from "react-router-dom";
import TableSelect from "../components/SharedComponents/TableSelect";
import TableInput from "../components/SharedComponents/TableInput";
import CustomButton from "../components/SharedComponents/CustomButton";

const Pending = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const navigate = useNavigate();
  const [priceRange, setPriceRange] = useState("all");

  const [filters, setFilters] = useState({
    inStock: "",
    categoryType: "",
    category: "",
    subcategory: "",
    isActive: "",
    price: "",
  });

  const [filterOptions, setFilterOptions] = useState({
    categoryTypes: [],
    categories: [],
    subcategories: [],
  });

  const itemsPerPage = 10;

  const fetchFilterOptions = async () => {
    try {
      const [categoryTypesRes, categoriesRes, subcategoriesRes] =
        await Promise.all([
          axios.get(`${BASE_URL}/api/category-type/all`, {
            headers: {
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          axios.get(`${BASE_URL}/api/category/all`, {
            headers: {
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          axios.get(`${BASE_URL}/api/subcategory/all`, {
            headers: {
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
        ]);

      setFilterOptions({
        categoryTypes: categoryTypesRes.data?.data || [],
        categories: categoriesRes.data?.data || [],
        subcategories: subcategoriesRes.data?.data || [],
      });
    } catch (err) {
      console.error("Error fetching filter options:", err);
    }
  };

  // Fixed price range parsing function
  const getPriceRangeValues = (range) => {
    if (range === "all" || !range)
      return { minPrice: undefined, maxPrice: undefined };
    if (range === "10000+") return { minPrice: "10000", maxPrice: undefined };

    const [min, max] = range.split("-");
    return { minPrice: min, maxPrice: max };
  };

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const { minPrice, maxPrice } = getPriceRangeValues(priceRange);

      const cleanFilters = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== "all") {
          cleanFilters[key] = value;
        }
      });

      const response = await axios.get(
        `${BASE_URL}/api/product/all-pending-products`,
        { withCredentials: true },
        {
          params: {
            page,
            limit: itemsPerPage,
            ...cleanFilters,
            search: searchQuery,
            minPrice,
            maxPrice,
            shop: "zen-chatbot.myshopify.com",
          },
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Adjust based on actual API response structure
      const {
        data,
        totalPages: pages,
        totalItems,
      } = response.data.success
        ? {
            data: response.data.data,
            totalPages: response.data.totalPages || 1,
            totalItems: response.data.totalItems || response.data.data.length,
          }
        : { data: [], totalPages: 1, totalItems: 0 };

      setProducts(data);
      setFilteredProducts(data);
      setTotalPages(pages);
      setTotalProducts(totalItems);
      setLoading(false);
    } catch (err) {
      console.error("Fetch products error:", err);
      setError(err.response?.data?.message || "Error fetching products");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage, searchQuery, filters, priceRange]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredProducts(products);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      const filtered = products.filter((product) =>
        product.title?.toLowerCase().includes(lowercasedTerm)
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setSearchQuery(searchTerm);
    setCurrentPage(1);
  };

  const handleFilterChange = (setter) => (event) => {
    setter(event.target.value);
    setCurrentPage(1);
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchProducts(1);
  };

  const clearFilters = () => {
    setFilters({
      inStock: "",
      categoryType: "",
      category: "",
      subcategory: "",
      isActive: "",
      price: "",
    });
    setPriceRange("all");
    setSearchTerm("");
    setSearchQuery("");
    setCurrentPage(1);
    fetchProducts(1);
  };

  const priceOptions = [
    { value: "all", label: "All Prices" },
    { value: "0-500", label: "0 - 500" },
    { value: "500-1000", label: "500 - 1,000" },
    { value: "1000-5000", label: "1,000 - 5,000" },
    { value: "5000-10000", label: "5,000 - 10,000" },
    { value: "10000+", label: "10,000+" },
  ];

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box padding={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalProducts);

  return (
    <Box padding={2}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Products Management</Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton
            color="primary"
            onClick={() => fetchProducts(currentPage)}
          >
            <Refresh />
          </IconButton>
          <Typography fontWeight="bold">
            {new Date().toLocaleString()}
          </Typography>
        </Box>
      </Box>

      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
        <form onSubmit={handleSearchSubmit} style={{ width: "215px" }}>
          <TableInput
            id="search-product"
            name="searchTerm"
            placeholder="Search Product"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            label="Search"
            type="text"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton type="submit">
                    <Search />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ width: "100%" }}
          />
        </form>
      </Box>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography>
          Showing:{" "}
          <strong>{totalProducts > 0 ? `${startItem}-${endItem}` : "0"}</strong>
          |{" "}
          <Typography component="span" sx={{ fontWeight: "medium" }}>
            Total Products: <strong>{totalProducts}</strong>
          </Typography>
        </Typography>
        <Box display="flex" gap={1}>
          <TableSelect
            id="stock-filter"
            name="inStock"
            value={filters.inStock}
            onChange={(e) =>
              setFilters({ ...filters, inStock: e.target.value })
            }
            label="Stock"
            MenuItems={[
              { value: "", label: "All" },
              { value: "true", label: "In Stock" },
              { value: "false", label: "Out of Stock" },
            ]}
          />
          <TableSelect
            id="product-category-filter"
            name="categoryType"
            value={filters.categoryType}
            onChange={(e) =>
              setFilters({ ...filters, categoryType: e.target.value })
            }
            label="Category-Type"
            MenuItems={[
              { value: "", label: "All" },
              ...filterOptions.categoryTypes.map((type) => ({
                value: type._id,
                label: type.name,
              })),
            ]}
          />
          <TableSelect
            id="price-range-filter"
            name="priceRange"
            value={priceRange}
            onChange={handleFilterChange(setPriceRange)}
            label="Price"
            MenuItems={priceOptions.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
          />

          <CustomButton
            variant="contained"
            color="primary"
            onClick={applyFilters}
          >
            APPLY
          </CustomButton>
          <CustomButton
            variant="outlined"
            color="secondary"
            onClick={clearFilters}
          >
            CLEAR
          </CustomButton>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "primary.main" }}>
              <TableCell></TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                PRODUCT NAME
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                STOCK
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                PRICE
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                CATEGORY-TYPE
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                SELLER
              </TableCell>

              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                LAST MODIFIED
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                ACTIONS
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Avatar
                      variant="rounded"
                      src={product.images[0]?.url}
                      alt={product.title}
                      sx={{ width: 60, height: 60 }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/fallback-image.png";
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {product.title?.length > 20
                      ? `${product.title.slice(0, 20)}...`
                      : product.title}
                  </TableCell>
                  <TableCell>
                    {product.stock > 0
                      ? `In stock (${product.stock})`
                      : "Out of stock"}
                  </TableCell>
                  <TableCell>
                    ₹{product.discountedPrice || product.price}
                  </TableCell>
                  <TableCell>
                    {product?.categoryType?.name || "Unavailable"}
                  </TableCell>
                  <TableCell>
                    {product?.vendor?.companyName || "Unknown"}
                  </TableCell>

                  <TableCell>
                    {new Date(
                      product.updatedAt || product.createdAt
                    ).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <CustomButton variant="contained" color="primary" isSmall>
                      APPROVE
                    </CustomButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} style={{ textAlign: "center" }}>
                  No products available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default Pending;
