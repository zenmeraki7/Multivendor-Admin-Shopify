import React, { useState } from "react";
import { Box, Paper, Tabs, Tab } from "@mui/material";
import ApprovedProducts from "../components/Products/ApprovedProducts";
import PendingProducts from "../components/Products/PendingProducts";

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const ProductList = () => {
  const [tabValue, setTabValue] = useState(0);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    clearFilters();
  };

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
    const isApprovedTab = tabValue === 0;
    console.log(`Fetching ${isApprovedTab ? "approved" : "pending"} products...`);
    
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

      // Use different endpoints based on tab
      const apiEndpoint = isApprovedTab 
        ? `${BASE_URL}/api/product/all-approved-products`
        : `${BASE_URL}/api/product/all-pending-products`;

      const response = await axios.get(
        apiEndpoint,
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

      if (isApprovedTab) {
        // Handling approved products - check if data is in Shopify format
        let productsData = [];
        let totalItemsCount = 0;
        let totalPagesCount = 1;

        // Check if the data is in Shopify format (has edges and nodes)
        if (response.data?.data?.products?.edges) {
          // Shopify GraphQL format
          setIsShopifyFormat(true);
          // Filter only ACTIVE products from Shopify format
          productsData = response.data.data.products.edges.filter(
            (item) => item.node.status === "ACTIVE"
          );
          totalItemsCount = productsData.length;
          totalPagesCount = Math.ceil(totalItemsCount / itemsPerPage);
        } else {
          // Standard API format
          setIsShopifyFormat(false);
          // Filter only approved products from API format
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
      } else {
        // Handling pending products
        setIsShopifyFormat(false);
        
        // Adjust based on actual API response structure for pending products
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
      }
      
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
    fetchProducts(currentPage);
    // Reset search when changing tabs
    setSearchTerm("");
    setSearchQuery("");
  }, [tabValue, currentPage, searchQuery, filters, priceRange]);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredProducts(products);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();

      if (tabValue === 0) { // Approved products
        // Handle different data structures and only show approved products
        const filtered = products.filter((product) => {
          // First get the title for searching
          const title = isShopifyFormat ? product.node?.title : product.title;

          // Check if title matches search term
          const titleMatches = title?.toLowerCase().includes(lowercasedTerm);

          return titleMatches;
        });

        setFilteredProducts(filtered);
      } else { // Pending products
        const filtered = products.filter((product) =>
          product.title?.toLowerCase().includes(lowercasedTerm)
        );
        setFilteredProducts(filtered);
      }
    }
  }, [searchTerm, products, isShopifyFormat, tabValue]);

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

  // Helper function to extract product data regardless of format (for approved products)
  const getProductData = (product, field) => {
    if (isShopifyFormat) {
      const node = product.node;
      switch (field) {
        case "id":
          return node?.id?.split("/")?.pop(); // Extract the ID from the Shopify format
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
        case "updatedAt":
          return product.updatedAt;
        default:
          return null;
      }
    }
  };

  return (
    <Box padding={2}>
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="product management tabs"
          variant="fullWidth"
        >
          <Tab label="Approved Products" id="product-tab-0" aria-controls="product-tabpanel-0" />
          <Tab label="Pending Products" id="product-tab-1" aria-controls="product-tabpanel-1" />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <ApprovedProducts />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <PendingProducts />
      </TabPanel>
    </Box>
  );
};

export default ProductList;