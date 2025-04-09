import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Download, Refresh, Visibility } from "@mui/icons-material";
import { useNavigate } from "react-router-dom"; // Added import for navigate
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
  const navigate = useNavigate(); // Initialize navigate
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    orderStatus: "",
    paymentStatus: "",
    deliveryStatus: "",
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

      const edges = response.data?.data?.edges || [];

      const formattedOrders = edges.map(({ node }) => ({
        orderId: node.name,
        date: new Date(node.createdAt).toLocaleDateString(),
        customerName: node.customer ? `${node.customer.firstName} ${node.customer.lastName}` : "Guest Customer",
        channel: "Shopify",
        total: `${node.totalPriceSet.presentmentMoney.amount} ${node.totalPriceSet.presentmentMoney.currencyCode}`,
        paymentStatus: node.fullyPaid ? "Paid" : "Unpaid",
        status: node.requiresShipping ? "Fulfilled" : "UnFulfilled",
        items: node.lineItems.edges,
        itemsCount: node.lineItems.edges.length,
        deliveryStatus: node.shippingLine ? "Delivered" : "Pending",
        deliveryMethod: node.shippingLine?.title || "Shipping",
        node: node, // Preserve the original node for accessing id in the view action
      }));

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

    setConfirmedCount(orders.filter(o => o.paymentStatus === "Completed" && o.status === "Not Shipped").length);
    setCanceledCount(orders.filter(o => o.paymentStatus === "Pending" && o.deliveryStatus === "Pending").length);
    setCompletedCount(orders.filter(o => o.paymentStatus === "Completed" && o.status === "Shipped").length);
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

    if (filters.deliveryStatus) {
      result = result.filter(order => order.deliveryStatus === filters.deliveryStatus);
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
      deliveryStatus: "",
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

  const handleViewOrder = (orderId) => {
    console.log("Viewing order details:", orderId);
    navigate(`/view-order-details/${orderId}`);
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
                  { value: "Shipped", label: "Shipped" },
                  { value: "Not Shipped", label: "Not Shipped" }
                ]}
              />
              <TableSelect
                id="payment-filter"
                label="Payment"
                value={filters.paymentStatus}
                onChange={(e) => handleFilterChange("paymentStatus", e.target.value)}
                MenuItems={[
                  { value: "", label: "All" },
                  { value: "Completed", label: "Paid" },
                  { value: "Pending", label: "Unpaid" }
                ]}
              />
              <TableSelect
                id="shipment-filter"
                label="Shipped"
                value={filters.deliveryStatus}
                onChange={(e) => handleFilterChange("deliveryStatus", e.target.value)}
                MenuItems={[
                  { value: "", label: "All" },
                  { value: "Delivered", label: "Fullfilled" },
                  { value: "Pending", label: "Unfullfilled" }
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
                  {["Order", "Date", "Customer", "Channel", "Total", "Payment status", "Fulfillment status", "Items", "Delivery status", "Delivery method", "Actions"].map((header) => (
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
                      <TableCell>{order.channel}</TableCell>
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
                      <TableCell>
                        <Chip
                          label={order.deliveryStatus}
                          color={order.deliveryStatus === "Delivered" ? "success" : "warning"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{order.deliveryMethod}</TableCell>
                      <TableCell>
                        <Tooltip title="View Order Details">
                          <CustomButton
                            variant="contained" 
                            onClick={() => {
                              // Make sure order.node.id exists and extract the ID
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