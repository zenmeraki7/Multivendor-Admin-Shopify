import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Download, Refresh, Visibility } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
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
  Box,
  Pagination,
  InputAdornment,
  Chip,
  IconButton,
  Tooltip,
  Button,
} from "@mui/material";
import TableInput from "../../components/SharedComponents/TableInput";
import TableSelect from "../../components/SharedComponents/TableSelect";
import CustomButton from "../../components/SharedComponents/CustomButton";
import { BASE_URL } from "../../utils/baseUrl";

function OrderDetails() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    orderStatus: "",
    paymentStatus: "",
  });
  const itemsPerPage = 4;

  const [orderedCount, setOrderedCount] = useState(0);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [canceledCount, setCanceledCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [orders, searchTerm, filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/orders/getAll`, {
        withCredentials: true,
      });

      console.log("API Response:", response.data);
      
      // Access the data array directly since it's not in edges format
      const ordersData = response.data?.data || [];
      console.log("Orders data found:", ordersData.length);
      
      const formattedOrders = ordersData.map(({ node }) => ({
        orderId: node.name,
        date: new Date(node.createdAt).toLocaleDateString(),
        customerName: node.customer ? `${node.customer.firstName} ${node.customer.lastName}` : "Guest Customer",
        total: `${node.totalPriceSet.presentmentMoney.amount} ${node.totalPriceSet.presentmentMoney.currencyCode}`,
        paymentStatus: node.fullyPaid ? "Paid" : "Unpaid",
        status: node.requiresShipping ? "Fulfilled" : "Unfulfilled",
        items: node.lineItems.edges,
        itemsCount: node.lineItems.edges.length,
        deliveryMethod: node.shippingLine?.title || "Standard Shipping",
        node: node, // Preserve the original node for accessing id in the view action
      }));

      console.log("Formatted orders:", formattedOrders);
      setOrders(formattedOrders);
      setFilteredOrders(formattedOrders);
      calculateSummaryCounts(formattedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummaryCounts = (orders) => {
    if (!Array.isArray(orders)) return;

    setOrderedCount(orders.length);

    // Count orders based on their status
    setConfirmedCount(orders.filter(o => o.paymentStatus === "Paid" && o.status === "Unfulfilled").length);
    setCanceledCount(orders.filter(o => o.paymentStatus === "Unpaid").length);
    setCompletedCount(orders.filter(o => o.paymentStatus === "Paid" && o.status === "FulFilled").length);
  };

  const applyFiltersAndSearch = () => {
    if (!Array.isArray(orders)) return;

    let result = [...orders];

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        order =>
          order.orderId.toLowerCase().includes(lowerCaseSearchTerm) ||
          order.customerName.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    if (filters.orderStatus) {
      result = result.filter(order => order.status === filters.orderStatus);
    }

    if (filters.paymentStatus) {
      result = result.filter(order => order.paymentStatus === filters.paymentStatus);
    }

    setFilteredOrders(result);
    setCurrentPage(1); 
  };

  const handleFilterChange = (type, value) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearFilters = () => {
    setFilters({
      orderStatus: "",
      paymentStatus: "",
    });
    setSearchTerm("");
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleRefresh = () => {
    fetchOrders();
  };

  const exportToCSV = () => {
    console.log("Exporting to CSV...");
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
        <Typography variant="h4">Order Management</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Refresh sx={{ cursor: "pointer" }} onClick={handleRefresh} />
          <Typography variant="body2" color="text.secondary">
            {new Date().toLocaleString()}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <Card sx={{ flex: 1, marginRight: 2, backgroundColor: "#e3f2fd" }}>
          <CardContent>
            <Typography variant="subtitle1">Ordered</Typography>
            <Typography variant="h4">{orderedCount}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, marginRight: 2, backgroundColor: "#d4edda" }}>
          <CardContent>
            <Typography variant="subtitle1">Orders Confirmed</Typography>
            <Typography variant="h4">{confirmedCount}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, marginRight: 2, backgroundColor: "#f8d7da" }}>
          <CardContent>
            <Typography variant="subtitle1">Orders Canceled</Typography>
            <Typography variant="h4">{canceledCount}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, backgroundColor: "#cce5ff" }}>
          <CardContent>
            <Typography variant="subtitle1">Orders Completed</Typography>
            <Typography variant="h4">{completedCount}</Typography>
          </CardContent>
        </Card>
      </Box>

      <Card>
        <CardHeader
          action={
            <Box sx={{ display: "flex", gap: 1 }}>
              <CustomButton
                variant="outlined"
                startIcon={<Download />}
                sx={{ width: 150, marginRight: 50 }}
                onClick={exportToCSV}
              >
                Export
              </CustomButton>
              <TableSelect
                id="order-filter"
                label="Orders"
                value={filters.orderStatus}
                onChange={(e) => handleFilterChange("orderStatus", e.target.value)}
                MenuItems={[
                  { value: "", label: "All" },
                  { value: "Fulfilled", label: "Fulfilled" },
                  { value: "Unfulfilled", label: "Unfulfilled" }
                ]}
              />
              <TableSelect
                id="payment-filter"
                label="Payment"
                value={filters.paymentStatus}
                onChange={(e) => handleFilterChange("paymentStatus", e.target.value)}
                MenuItems={[
                  { value: "", label: "All" },
                  { value: "Paid", label: "Paid" },
                  { value: "Unpaid", label: "Unpaid" }
                ]}
              />
              <CustomButton
                variant="contained"
                onClick={applyFiltersAndSearch}
              >
                Apply
              </CustomButton>
              <CustomButton
                variant="outlined"
                onClick={clearFilters}
              >
                Clear
              </CustomButton>
            </Box>
          }
        />
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, marginBottom: 2, width: "400px" }}>
            <TableInput
              id="search-order"
              placeholder="Search Orders"
              label="Search"
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ width: "300px" }}
            />
          </Box>

          <TableContainer sx={{ marginTop: "40px" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "primary.main" }}>
                  {["Order", "Date", "Customer", "Total", "Payment status", "Fulfillment status", "Items", "Delivery method", "Actions"].map((header) => (
                    <TableCell key={header} sx={{ color: "white", fontWeight: "bold" }}>{header}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={12} align="center">
                      <Typography>Loading orders...</Typography>
                    </TableCell>
                  </TableRow>
                ) : currentOrders.length > 0 ? (
                  currentOrders.map((order, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {order.orderId}
                        </Typography>
                      </TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{order.total}</TableCell>
                      <TableCell>
                        <Chip
                          label={order.paymentStatus}
                          color={order.paymentStatus === "Paid" ? "success" : "warning"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.status}
                          color={order.status === "Fulfilled" ? "success" : "warning"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{order.itemsCount}</TableCell>
                      <TableCell>{order.deliveryMethod}</TableCell>
                      <TableCell>
                        <Tooltip title="View Order Details">
                          <CustomButton
                            variant="contained" 
                            onClick={() => {
                              if (order.node && order.node.id) {
                                const orderId = order.node.id.split("/").pop();
                                navigate(`/view-order-details/${orderId}`);
                              }
                            }}
                          >
                            VIEW
                          </CustomButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={12} align="center">
                      <Typography>No orders found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 3 }}>
            <Typography variant="body2">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length} orders
            </Typography>
            <Pagination
              count={Math.ceil(filteredOrders.length / itemsPerPage)}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </CardContent>
      </Card>
    </div>
  );
}

export default OrderDetails;