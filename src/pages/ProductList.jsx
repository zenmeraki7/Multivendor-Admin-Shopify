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

const ProductList = () => {
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
  const [isShopifyFormat, setIsShopifyFormat] = useState(false);

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
    console.log("Fetching approved products...");
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
        {
          params: {
            page,
            limit: itemsPerPage,
            ...cleanFilters,
            search: searchQuery,
            minPrice,
            maxPrice,
          },
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );

      console.log("API Response:", response.data);

      // Detect if the data is in Shopify format or your API format
      let productsData = [];
      let totalItemsCount = 0;
      let totalPagesCount = 1;

      // Check if the data is in Shopify format (has edges and nodes)
      if (response.data?.data?.products?.edges) {
        // Shopify GraphQL format
        setIsShopifyFormat(true);
        // Filter only ACTIVE products from Shopify format
        productsData = response.data.data.products.edges.filter(
          item => item.node.status === "ACTIVE"
        );
        totalItemsCount = productsData.length;
        totalPagesCount = Math.ceil(totalItemsCount / itemsPerPage);
      } else {
        // Standard API format
        setIsShopifyFormat(false);
        // Filter only approved products from API format
        productsData = (response.data.data || []).filter(
          item => item.isActive === true || item.status === "ACTIVE"
        );
        totalItemsCount = productsData.length;
        totalPagesCount = Math.ceil(totalItemsCount / itemsPerPage);
      }

      setProducts(productsData);
      setFilteredProducts(productsData);
      setTotalPages(totalPagesCount);
      setTotalProducts(totalItemsCount);
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

      // Handle different data structures and only show approved products
      const filtered = products.filter((product) => {
        // First get the title for searching
        const title = isShopifyFormat
          ? product.node?.title
          : product.title;

        // Check if title matches search term
        const titleMatches = title?.toLowerCase().includes(lowercasedTerm);

        return titleMatches;
      });

      setFilteredProducts(filtered);
    }
  }, [searchTerm, products, isShopifyFormat]);

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

  // Helper function to extract product data regardless of format
  const getProductData = (product, field) => {
    if (isShopifyFormat) {
      const node = product.node;
      switch (field) {
        case 'id': return node?.id;
        case 'title': return node?.title;
        case 'imageUrl': return node?.featuredMedia?.preview?.image?.url;
        case 'totalInventory': return node?.totalInventory;
        case 'price': return node?.variants?.edges?.[0]?.node?.price;
        case 'productType': return node?.productType;
        case 'vendor': return node?.vendor;
        case 'status': return node?.status;
        case 'createdAt': return node?.createdAt;
        default: return null;
      }
    } else {
      switch (field) {
        case 'id': return product.id;
        case 'title': return product.title;
        case 'imageUrl': return product.image;
        case 'totalInventory': return product.totalInventory;
        case 'price': return product.price;
        case 'productType': return product.productType || product.categoryType;
        case 'vendor': return product.vendor;
        case 'status': return product.isActive ? "ACTIVE" : "INACTIVE";
        case 'createdAt': return product.createdAt;
        default: return null;
      }
    }
  };

  return (
    <Box padding={2}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Approved Products</Typography>
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
          <TableSelect
            id="status-filter"
            name="isActive"
            value={filters.isActive}
            onChange={(e) =>
              setFilters({ ...filters, isActive: e.target.value })
            }
            label="Status"
            MenuItems={[
              { value: "", label: "All" },
              { value: "false", label: "Pending" },
              { value: "true", label: "Approved" },
            ]}
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
          <CustomButton variant="outlined" color="secondary">
            <Link to="/pending" style={{ textDecoration: "none" }}>
              {" "}
              PENDING
            </Link>
          </CustomButton>
          <CustomButton
            variant="contained"
            color="primary"
          >
            EXPORT
          </CustomButton>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "primary.main" }}>
              <TableCell></TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>PRODUCT NAME</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>STOCK</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>PRICE</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>TYPE</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>VENDOR</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>STATUS</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>CREATED AT</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => {
                // Double-check that we're only displaying approved products
                const status = getProductData(product, 'status');
                if (status !== "ACTIVE") {
                  return null; // Skip non-approved products
                }

                return (
                  <TableRow key={getProductData(product, 'id') || index}>
                    {/* Product Image */}
                    <TableCell>
                      <Avatar
                        variant="rounded"
                        src={getProductData(product, 'imageUrl') || '/placeholder-image.jpg'}
                        alt={getProductData(product, 'title')}
                        sx={{ width: 60, height: 60 }}
                      />
                    </TableCell>

                    {/* Product Name */}
                    <TableCell>
                      {(() => {
                        const title = getProductData(product, 'title');
                        return title && title.length > 20
                          ? `${title.slice(0, 20)}...`
                          : title || "Untitled";
                      })()}
                    </TableCell>

                    {/* Stock */}
                    <TableCell>
                      {(() => {
                        const inventory = getProductData(product, 'totalInventory');
                        return inventory > 0
                          ? `In stock (${inventory})`
                          : "Out of stock";
                      })()}
                    </TableCell>

                    {/* Price */}
                    <TableCell>
                      ₹{getProductData(product, 'price') || "N/A"}
                    </TableCell>

                    {/* Category Type */}
                    <TableCell>{getProductData(product, 'productType') || "Unavailable"}</TableCell>

                    {/* Vendor */}
                    <TableCell>{getProductData(product, 'vendor') || "Unknown"}</TableCell>

                    {/* Status */}
                    <TableCell>
                      <Chip
                        label={getProductData(product, 'status') === "ACTIVE" ? "ACTIVE" : "Pending"}
                        color={getProductData(product, 'status') === "ACTIVE" ? "success" : "error"}
                        sx={{ fontWeight: "bold", textTransform: "uppercase", borderWidth: 2 }}
                      />
                    </TableCell>

                    {/* Created At */}
                    <TableCell>
                      {(() => {
                        const date = getProductData(product, 'createdAt');
                        return date ? new Date(date).toLocaleDateString() : "N/A";
                      })()}
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <CustomButton
                        variant="contained"
                        color="primary"
                        isSmall
                        onClick={() => navigate(`/view-product/${getProductData(product, 'id')}`)}
                      >
                        View
                      </CustomButton>
                    </TableCell>
                  </TableRow>
                );
              }).filter(item => item !== null)
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

export default ProductList;