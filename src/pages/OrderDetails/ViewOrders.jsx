import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Divider,
  IconButton,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Card,
  CardContent,
  Stack,
  useTheme,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Print,
  MoreVert,
  NavigateBefore,
  NavigateNext,
  LocalShipping,
  MoreHoriz,
  AttachMoney
} from '@mui/icons-material';
import { BASE_URL } from '../../utils/baseUrl';

function ViewOrders() {
  const theme = useTheme();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/orders/getOrderById/${id}`, {
        withCredentials: true
      });

      if (response.data && response.data.data) {
        setOrder(response.data.data);
      } else {
        setError('No order data found');
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Typography variant="h6" color="error">{error}</Typography>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Typography variant="h6">Order not found</Typography>
      </Box>
    );
  }

  const unfulfilledItems = order.lineItems?.edges?.filter(({ node }) => !node.fulfilled) || [];
  const unfulfilledCount = unfulfilledItems.length;

  const subtotal = order.subtotalPriceSet?.presentmentMoney?.amount || '0.00';
  const taxes = order.totalTaxSet?.presentmentMoney?.amount || '0.00';
  const total = order.totalPriceSet?.presentmentMoney?.amount || '0.00';
  const currencyCode = order.totalPriceSet?.presentmentMoney?.currencyCode || 'INR';

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2
    }).format(parseFloat(amount));
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 3, bgcolor: '#f8f9fa' }}>
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          {/* Order Items Card */}
          <Paper elevation={0} sx={{ mb: 3, borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
            <Box sx={{ 
              p: 2, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
              bgcolor: 'rgba(0, 0, 0, 0.02)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocalShipping sx={{ mr: 1.5, color: 'text.secondary', fontSize: 20 }} />
                <Chip 
                  label={`${order.fulfillmentStatus || 'Unfulfilled'} (${unfulfilledCount})`} 
                  size="small" 
                  sx={{ 
                    bgcolor: order.fulfillmentStatus === 'Fulfilled' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 193, 7, 0.1)', 
                    color: order.fulfillmentStatus === 'Fulfilled' ? theme.palette.success.dark : theme.palette.warning.dark,
                    fontWeight: 500,
                    borderRadius: 1 
                  }} 
                />
              </Box>
              <IconButton size="small">
                <MoreHoriz fontSize="small" />
              </IconButton>
            </Box>
            
            <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
                Delivery method
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {order.shippingLine?.title || 'Shipping'}
              </Typography>
            </Box>

            <TableContainer>
              <Table>
                <TableBody>
                  {order.lineItems?.edges.map(({ node }, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        borderBottom: index < order.lineItems.edges.length - 1 ? '1px solid rgba(0, 0, 0, 0.08)' : 'none',
                        py: 2.5
                      }}>
                        <Box 
                          component="img" 
                          src={node.image?.url || "/api/placeholder/60/60"} 
                          alt={node.title}
                          sx={{ 
                            mr: 2, 
                            width: 60, 
                            height: 60, 
                            objectFit: 'contain',
                            bgcolor: 'rgba(0, 0, 0, 0.04)',
                            borderRadius: 1,
                            p: 1
                          }}
                        />
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>{node.title}</Typography>
                          <Typography variant="body2" color="text.secondary">{node.variant?.title !== 'Default Title' ? node.variant?.title : ''}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {node.sku ? `SKU: ${node.sku}` : ''}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ 
                        color: 'text.secondary', 
                        borderBottom: index < order.lineItems.edges.length - 1 ? '1px solid rgba(0, 0, 0, 0.08)' : 'none'
                      }}>
                        {formatCurrency(node.originalUnitPriceSet?.presentmentMoney?.amount || '0.00')}
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        color: 'text.secondary', 
                        borderBottom: index < order.lineItems.edges.length - 1 ? '1px solid rgba(0, 0, 0, 0.08)' : 'none'
                      }}>×</TableCell>
                      <TableCell align="center" sx={{ 
                        borderBottom: index < order.lineItems.edges.length - 1 ? '1px solid rgba(0, 0, 0, 0.08)' : 'none'
                      }}>{node.quantity}</TableCell>
                      <TableCell align="right" sx={{ 
                        fontWeight: 500, 
                        borderBottom: index < order.lineItems.edges.length - 1 ? '1px solid rgba(0, 0, 0, 0.08)' : 'none'
                      }}>
                        {formatCurrency((node.originalUnitPriceSet?.presentmentMoney?.amount || 0) * node.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              p: 2.5, 
              borderTop: '1px solid rgba(0, 0, 0, 0.08)',
              bgcolor: 'rgba(0, 0, 0, 0.01)'
            }}>
              <Button 
                variant="contained" 
                sx={{ 
                  bgcolor: theme.palette.primary.main, 
                  '&:hover': { bgcolor: theme.palette.primary.dark },
                  textTransform: 'none',
                  px: 3,
                  borderRadius: 1,
                  fontWeight: 500
                }}
              >
                Fulfill items
              </Button>
            </Box>
          </Paper>

          {/* Payment Summary Card */}
          <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
            <Box sx={{ 
              p: 2, 
              display: 'flex', 
              alignItems: 'center', 
              borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
              bgcolor: 'rgba(0, 0, 0, 0.02)'
            }}>
              <AttachMoney sx={{ mr: 1.5, color: 'text.secondary', fontSize: 20 }} />
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {order.fullyPaid ? 'Paid' : 'Payment Pending'}
              </Typography>
            </Box>
            
            <Box sx={{ p: 2.5 }}>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography variant="body1" color="text.secondary">Subtotal</Typography>
                </Grid>
                <Grid item xs={4} sx={{ textAlign: 'right' }}>
                  <Typography variant="body1">{formatCurrency(subtotal)}</Typography>
                </Grid>
                
                <Grid item xs={8} sx={{ mt: -0.5 }}>
                  <Typography variant="body1" color="text.secondary">Taxes</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    {order.taxLines?.length > 0 ? order.taxLines[0].title : 'Tax'}
                  </Typography>
                </Grid>
                <Grid item xs={4} sx={{ textAlign: 'right', mt: -0.5 }}>
                  <Typography variant="body1">{formatCurrency(taxes)}</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1.5 }} />
                </Grid>
                
                <Grid item xs={8}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>Total</Typography>
                </Grid>
                <Grid item xs={4} sx={{ textAlign: 'right' }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{formatCurrency(total)}</Typography>
                </Grid>
                
                <Grid item xs={8}>
                  <Typography variant="body1" color="text.secondary">Paid</Typography>
                </Grid>
                <Grid item xs={4} sx={{ textAlign: 'right' }}>
                  <Typography variant="body1" sx={{ color: order.fullyPaid ? theme.palette.success.main : theme.palette.warning.main }}>
                    {order.fullyPaid ? formatCurrency(total) : '₹0.00'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={4}>
          {/* Notes Card */}
          <Paper elevation={0} sx={{ mb: 3, borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
            <Box sx={{ 
              p: 2, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
              bgcolor: 'rgba(0, 0, 0, 0.02)'
            }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>Notes</Typography>
              <IconButton size="small">
                <Edit fontSize="small" />
              </IconButton>
            </Box>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="body2" color="text.secondary">
                {order.note || 'No notes from customer'}
              </Typography>
            </Box>
          </Paper>

          {/* Customer Card */}
          <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
            <Box sx={{ 
              p: 2, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
              bgcolor: 'rgba(0, 0, 0, 0.02)'
            }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>Customer</Typography>
              <IconButton size="small">
                <MoreHoriz fontSize="small" />
              </IconButton>
            </Box>
            
            <Box sx={{ p: 2.5 }}>
              <Stack spacing={2.5}>
                <Box>
                  <Typography 
                    variant="body1" 
                    color="primary" 
                    sx={{ fontWeight: 500, mb: 0.5 }}
                  >
                    {order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : 'Guest Customer'}
                  </Typography>
                  <Typography variant="body2" color="primary">
                    {order.customer?.ordersCount || 0} orders
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                    Contact information
                  </Typography>
                  <Typography variant="body2" color="primary" sx={{ mb: 0.5 }}>
                    {order.customer?.email || 'No email provided'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.customer?.phone || 'No phone number'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                    Shipping address
                  </Typography>
                  {order.shippingAddress ? (
                    <>
                      <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                        {order.shippingAddress.name}<br />
                        {order.shippingAddress.company && `${order.shippingAddress.company}`}<br />
                        {order.shippingAddress.address1}<br />
                        {order.shippingAddress.address2 && `${order.shippingAddress.address2}`}<br />
                        {order.shippingAddress.city}<br />
                        {`${order.shippingAddress.zip} ${order.shippingAddress.city} ${order.shippingAddress.province}`}<br />
                        {order.shippingAddress.country}
                      </Typography>
                      <Typography variant="body2" color="primary" sx={{ mt: 0.5 }}>
                        {order.shippingAddress.phone || 'No phone provided'}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">No shipping address provided</Typography>
                  )}
                </Box>
                
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                    Billing address
                  </Typography>
                  {order.billingAddress ? (
                    order.billingAddress === order.shippingAddress ? (
                      <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                        Same as shipping address
                      </Typography>
                    ) : (
                      <>
                        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                          {order.billingAddress.name}<br />
                          {order.billingAddress.company && `${order.billingAddress.company}`}<br />
                          {order.billingAddress.address1}<br />
                          {order.billingAddress.address2 && `${order.billingAddress.address2}`}<br />
                          {order.billingAddress.city}<br />
                          {`${order.billingAddress.zip} ${order.billingAddress.city} ${order.billingAddress.province}`}<br />
                          {order.billingAddress.country}
                        </Typography>
                        <Typography variant="body2" color="primary" sx={{ mt: 0.5 }}>
                          {order.billingAddress.phone || 'No phone provided'}
                        </Typography>
                      </>
                    )
                  ) : (
                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                      Same as shipping address
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ViewOrders;