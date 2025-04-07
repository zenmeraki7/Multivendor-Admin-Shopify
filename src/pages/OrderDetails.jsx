import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Download, Refresh } from "@mui/icons-material";
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
} from "@mui/material";
import TableInput from "../components/SharedComponents/TableInput";
import TableSelect from "../components/SharedComponents/TableSelect";
import CustomButton from "../components/SharedComponents/CustomButton";

function OrderDetails() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Summary counts
  const [orderedCount, setOrderedCount] = useState(0);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [canceledCount, setCanceledCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("/api/orders/getAll", {
          withCredentials: true, 
        });

        const fetchedData = Array.isArray(response.data) ? response.data : [];
        setOrders(fetchedData);
        calculateSummaryCounts(fetchedData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const calculateSummaryCounts = (orders) => {
    if (!Array.isArray(orders)) return;

    setOrderedCount(orders.length);
    setConfirmedCount(orders.filter((o) => o.status === "Confirmed").length);
    setCanceledCount(orders.filter((o) => o.status === "Canceled").length);
    setCompletedCount(orders.filter((o) => o.status === "Completed").length);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = Array.isArray(orders) ? orders.slice(indexOfFirstItem, indexOfLastItem) : [];

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 2,
        }}
      >
        <Typography variant="h4">Order Management</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Refresh sx={{ cursor: "pointer" }} />
          <Typography variant="body2" color="text.secondary">
            {new Date().toLocaleString()}
          </Typography>
        </Box>
      </Box>

      {/* Summary Cards */}
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

      {/* Filters and Table */}
      <Card>
        <CardHeader
          action={
            <Box sx={{ display: "flex", gap: 1 }}>
              <CustomButton variant="outlined" startIcon={<Download />} sx={{ width: 150, marginRight: 50 }}>
                Export
              </CustomButton>
              <TableSelect id="order-filter" label="Orders" MenuItems={[
                { value: "", label: "All" },
                { value: "Shipped", label: "Shipped" },
                { value: "Pending", label: "Pending" }
              ]} />
              <TableSelect id="payment-filter" label="Payment" MenuItems={[
                { value: "", label: "All" },
                { value: "Completed", label: "Completed" },
                { value: "Pending", label: "Pending" }
              ]} />
              <TableSelect id="shipment-filter" label="Shipped" MenuItems={[
                { value: "", label: "All" },
                { value: "Delivered", label: "Delivered" },
                { value: "Pending", label: "Pending" }
              ]} />
              <CustomButton variant="contained">Apply</CustomButton>
              <CustomButton variant="outlined">Clear</CustomButton>
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
                  {["Order", "Date", "Customer", "Channel", "Total", "Payment status", "Fulfillment status", "Items", "Delivery status", "Delivery method", "Tags"].map((header) => (
                    <TableCell key={header} sx={{ color: "white", fontWeight: "bold" }}>
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11}>Loading...</TableCell>
                  </TableRow>
                ) : currentOrders.length > 0 ? (
                  currentOrders.map((order, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {order.orderId}
                        </Typography>
                      </TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">{order.customerName}</Typography>
                      </TableCell>
                      <TableCell>{order.channel}</TableCell>
                      <TableCell>{order.total}</TableCell>
                      <TableCell>{order.paymentStatus}</TableCell>
                      <TableCell>
                        <Chip label={order.status} color={order.status === "Shipped" ? "success" : "error"} />
                      </TableCell>
                      <TableCell>{order.items?.length}</TableCell>
                      <TableCell>{order.deliveryStatus}</TableCell>
                      <TableCell>{order.deliveryMethod}</TableCell>
                      <TableCell>{order.tags?.join(", ")}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={11}>No orders found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ display: "flex", justifyContent: "center", marginTop: 3 }}>
            <Pagination
              count={Math.ceil(orders.length / itemsPerPage)}
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
