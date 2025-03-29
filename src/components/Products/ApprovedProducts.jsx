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
import { Search, Refresh, CheckCircle } from "@mui/icons-material";
import axios from "axios";
import { BASE_URL } from "../../utils/baseUrl";
import { useNavigate } from "react-router-dom";
import TableSelect from "../SharedComponents/TableSelect"

import TableInput from "../SharedComponents/TableInput";
import CustomButton from "../SharedComponents/CustomButton";
const ApprovedProducts = () => {
    const navigate = useNavigate();

    // Common states
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
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

    const fetchApprovedProducts = async (page = 1) => {
        console.log(`Fetching approved products...`);

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
                `${BASE_URL}/api/product/all-approved-products`,
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


            let productsData = [];
            let totalItemsCount = 0;
            let totalPagesCount = 1;


            if (response.data?.data?.products?.edges) {
                setIsShopifyFormat(true);
                productsData = response.data.data.products.edges.filter(
                    (item) => item.node.status === "ACTIVE"
                );
                totalItemsCount = productsData.length;
                totalPagesCount = Math.ceil(totalItemsCount / itemsPerPage);
            } else {
                setIsShopifyFormat(false);
                productsData = (response.data.data || []).filter(
                    (item) => item.isActive === true || item.status === "ACTIVE"
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
        fetchFilterOptions();
    }, []);

    useEffect(() => {
        fetchApprovedProducts(currentPage);
    }, [currentPage, searchQuery, filters, priceRange]);

    useEffect(() => {
        if (searchTerm === "") {
            setFilteredProducts(products);
        } else {
            const lowercasedTerm = searchTerm.toLowerCase();
            const filtered = products.filter((product) => {
                const title = isShopifyFormat ? product.node?.title : product.title;
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

    const applyFilters = () => {
        setCurrentPage(1);
        fetchApprovedProducts(1);
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
        fetchApprovedProducts(1);
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

    // Helper function to extract product data regardless of format (for approved products)
    const getProductData = (product, field) => {
        if (isShopifyFormat) {
            const node = product.node;
            switch (field) {
                case "id":
                    return node?.id;
                case "title":
                    return node?.title;
                case "imageUrl":
                    return node?.featuredMedia?.preview?.image?.url;
                case "totalInventory":
                    return node?.totalInventory;
                case "price":
                    return node?.variants?.edges?.[0]?.node?.price;
                case "productType":
                    return node?.productType;
                case "vendor":
                    return node?.metafield?.value || node.vendor;
                case "status":
                    return node?.status;
                case "createdAt":
                    return node?.createdAt;
                default:
                    return null;
            }
        } else {
            switch (field) {
                case "id":
                    return product.id || product._id;
                case "title":
                    return product.title;
                case "imageUrl":
                    return product.image || (product.images && product.images[0]?.url);
                case "totalInventory":
                    return product.totalInventory || product.stock;
                case "price":
                    return product.price || product.discountedPrice;
                case "productType":
                    return product.productType || (product.categoryType && product.categoryType.name);
                case "vendor":
                    return product.vendor || (product.vendor && product.vendor.companyName);
                case "status":
                    return product.isActive ? "ACTIVE" : "INACTIVE";
                case "createdAt":
                    return product.createdAt;
                default:
                    return null;
            }
        }
    };

    return (
        <Box padding={2}>
            <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: '8px', background: 'linear-gradient(145deg, #ffffff, #f5f5f5)' }}>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Box display="flex" alignItems="center">
                        <CheckCircle color="success" sx={{ mr: 1, fontSize: 28 }} />
                        <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                            Approved Products
                        </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                            label={`Total: ${totalProducts}`}
                            color="success"
                            variant="outlined"
                            sx={{ fontWeight: 'bold', mr: 1 }}
                        />
                        <IconButton
                            color="primary"
                            onClick={() => fetchApprovedProducts(currentPage)}
                            sx={{
                                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                transition: 'all 0.3s',
                                '&:hover': {
                                    backgroundColor: 'rgba(25, 118, 210, 0.12)',
                                }
                            }}
                        >
                            <Refresh />
                        </IconButton>
                        <Typography fontWeight="bold" sx={{ ml: 1, color: '#546e7a' }}>
                            {new Date().toLocaleString()}
                        </Typography>
                    </Box>
                </Box>
            </Paper>

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
                        onChange={(e) => setPriceRange(e.target.value)}
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
                        sx={{
                            borderRadius: '8px',
                            boxShadow: '0 4px 10px rgba(25, 118, 210, 0.25)',
                            transition: 'all 0.3s',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 6px 15px rgba(25, 118, 210, 0.35)',
                            }
                        }}
                    >
                        APPLY
                    </CustomButton>
                    <CustomButton
                        variant="outlined"
                        color="secondary"
                        onClick={clearFilters}
                        sx={{
                            borderRadius: '8px',
                            borderWidth: '2px',
                            transition: 'all 0.3s',
                            '&:hover': {
                                borderWidth: '2px',
                                backgroundColor: 'rgba(156, 39, 176, 0.04)'
                            }
                        }}
                    >
                        CLEAR
                    </CustomButton>
                    <CustomButton
                        variant="contained"
                        color="primary"
                        sx={{
                            borderRadius: '8px',
                            boxShadow: '0 4px 10px rgba(25, 118, 210, 0.25)',
                            transition: 'all 0.3s',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 6px 15px rgba(25, 118, 210, 0.35)',
                            }
                        }}
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
                                TYPE
                            </TableCell>
                            <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                                VENDOR
                            </TableCell>
                            <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                                STATUS
                            </TableCell>
                            <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                                CREATED AT
                            </TableCell>
                            <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                                ACTIONS
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredProducts.length > 0 ? (
                            filteredProducts
                                .map((product, index) => {
                                    const status = getProductData(product, "status");
                                    if (status !== "ACTIVE") {
                                        return null; 
                                    }

                                    return (
                                        <TableRow key={getProductData(product, "id") || index}>
                                            <TableCell>
                                                <Avatar
                                                    variant="rounded"
                                                    src={
                                                        getProductData(product, "imageUrl") ||
                                                        "/placeholder-image.jpg"
                                                    }
                                                    alt={getProductData(product, "title")}
                                                    sx={{ width: 60, height: 60 }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {(() => {
                                                    const title = getProductData(product, "title");
                                                    return title && title.length > 20
                                                        ? `${title.slice(0, 20)}...`
                                                        : title || "Untitled";
                                                })()}
                                            </TableCell>
                                            <TableCell>
                                                {(() => {
                                                    const inventory = getProductData(
                                                        product,
                                                        "totalInventory"
                                                    );
                                                    return inventory > 0
                                                        ? `In stock (${inventory})`
                                                        : "Out of stock";
                                                })()}
                                            </TableCell>
                                            <TableCell>
                                                ₹{getProductData(product, "price") || "N/A"}
                                            </TableCell>
                                            <TableCell>
                                                {getProductData(product, "productType") ||
                                                    "Unavailable"}
                                            </TableCell>
                                            <TableCell>
                                                {getProductData(product, "vendor") || "Unknown"}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={
                                                        getProductData(product, "status") === "ACTIVE"
                                                            ? "ACTIVE"
                                                            : "Pending"
                                                    }
                                                    color={
                                                        getProductData(product, "status") === "ACTIVE"
                                                            ? "success"
                                                            : "error"
                                                    }
                                                    sx={{
                                                        fontWeight: "bold",
                                                        textTransform: "uppercase",
                                                        borderWidth: 2,
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {(() => {
                                                    const date = getProductData(product, "createdAt");
                                                    return date
                                                        ? new Date(date).toLocaleDateString()
                                                        : "N/A";
                                                })()}
                                            </TableCell>
                                            <TableCell>
                                                <CustomButton
                                                    variant="contained"
                                                    color="primary"
                                                    isSmall
                                                    onClick={() =>
                                                        navigate(
                                                            `/view-product/${getProductData(product, "id")}`
                                                        )
                                                    }
                                                >
                                                    View
                                                </CustomButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                                .filter((item) => item !== null)
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

            <Box display="flex" justifyContent="center" mt={4} mb={2}>
                <Paper elevation={2} sx={{ borderRadius: '30px', padding: '8px 16px', display: 'inline-block' }}>
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        size="large"
                        showFirstButton
                        showLastButton
                        sx={{
                            '& .MuiPaginationItem-root': {
                                fontWeight: 'bold',
                                mx: 0.5
                            }
                        }}
                    />
                </Paper>
            </Box>
        </Box>
    );
};

export default ApprovedProducts;