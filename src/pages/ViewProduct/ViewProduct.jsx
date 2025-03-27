import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Box,
  Divider,
  Chip,
  Button,
  Paper,
  Stack,
  TextField,
  Container,
  CircularProgress,
  Alert,
  IconButton,
  Rating,
  Skeleton,
  Breadcrumbs,
  Link as MuiLink,
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

import BusinessIcon from '@mui/icons-material/Business';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LaunchIcon from '@mui/icons-material/Launch';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import StarIcon from "@mui/icons-material/Star";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import VerifiedIcon from "@mui/icons-material/Verified";
import BlockIcon from "@mui/icons-material/Block";
import { useParams, useNavigate } from "react-router-dom";
import { BASE_URL } from "../../utils/baseUrl";
import { toast } from "react-hot-toast";
import { logoutUser } from "../../utils/authUtils";

function removeHtmlTags(str) {
  return str?.replace(/<[^>]*>/g, "") || "";
}

const ViewProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [action, setAction] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [validationError, setValidationError] = useState("");
  const [tabValue, setTabValue] = useState(0);

  const handleOpen = (act) => {
    setAction(act);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setAction("");
    setValidationError("");
    setBlockReason("");
  };

  const handleApproveProduct = async () => {
    try {
      setLoadingBtn(true);
      const response = await axios.put(
        `${BASE_URL}/api/product/approve/${id}`,
        {},
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );
      fetchProductData();
      toast.success(response.data.message);
    } catch (error) {
      if (
        error.response &&
        (error.response.status === 404 || error.response.status === 401)
      ) {
        logoutUser();
      } else {
        toast.error("Failed to approve product");
      }
    } finally {
      setLoadingBtn(false);
      handleClose();
    }
  };

  const handleRejectProduct = async () => {
    if (!blockReason.trim()) {
      setValidationError("Please provide a reason for rejection");
      return;
    }

    try {
      setLoadingBtn(true);
      const response = await axios.put(
        `${BASE_URL}/api/product/reject/${id}`,
        { verificationRemarks: blockReason },
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      fetchProductData();
      toast.success(response.data.message);
    } catch (error) {
      if (
        error.response &&
        (error.response.status === 404 || error.response.status === 401)
      ) {
        logoutUser();
      } else {
        toast.error("Failed to reject product");
      }
    } finally {
      setLoadingBtn(false);
      handleClose();
    }
  };

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASE_URL}/api/product/get-one/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setProduct(response.data.data);
    } catch (err) {
      if (
        err.response &&
        (err.response.status === 404 || err.response.status === 401)
      ) {
        logoutUser();
      }
      setError("Error fetching product data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Skeleton variant="rectangular" height={300} />
          <Skeleton variant="text" height={60} />
          <Skeleton variant="text" height={40} width="60%" />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          </Grid>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  // Tab data for the custom implementation
  const tabs = [
    { label: "Overview", id: "tab-0" },
    { label: "Specifications", id: "tab-1" },
    { label: "Variants", id: "tab-2" },
    { label: "Images", id: "tab-3" },
    { label: "Seller Info", id: "tab-4" },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
      {/* Product status banner */}
      {!product.isApproved && (
        <Alert
          severity="warning"
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => handleOpen("approve")}
            >
              Review Now
            </Button>
          }
        >
          This product is awaiting approval. Please review the details below.
        </Alert>
      )}

      {/* Header section with basic info and actions */}
      <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography
              variant="h5"
              component="h1"
              gutterBottom
              fontWeight="bold"
            >
              {product.title}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <Chip
                size="small"
                icon={<VerifiedIcon />}
                label={product.isApproved ? "Approved" : "Pending Approval"}
                color={product.isApproved ? "success" : "warning"}
                variant={product.isApproved ? "filled" : "outlined"}
              />
              {/* <Chip
                size="small"
                label={
                  product.inStock
                    ? `In Stock (${product.stock})`
                    : "Out of Stock"
                }
                color={product.inStock ? "primary" : "error"}
                variant="outlined"
              /> */}
              {/* <Chip
                size="small"
                label={product.isActive ? "Active" : "Inactive"}
                color={product.isActive ? "success" : "default"}
                variant="outlined"
              /> */}
            </Stack>
            {/* <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Rating value={0} precision={0.5} readOnly size="small" />
              <Typography variant="body2" color="text.secondary">
                ({0} Reviews)
              </Typography>
            </Stack> */}

            <Typography variant="h6" color="primary" gutterBottom>
              ₹{product.discountedPrice || product.price}
              {product.discountedPrice && (
                <Typography
                  component="span"
                  sx={{ textDecoration: "line-through", ml: 1 }}
                  color="text.secondary"
                >
                  ₹{product.price}
                </Typography>
              )}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack
              direction="row"
              spacing={2}
              justifyContent={{ xs: "flex-start", md: "flex-end" }}
            >
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
              >
                Back
              </Button>
              {!product.isApproved ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleOpen("approve")}
                >
                  Approve
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<BlockIcon />}
                  onClick={() => handleOpen("reject")}
                >
                  Reject
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Custom tabs implementation using Buttons instead of MUI Tabs */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: 3,
          display: "flex",
          overflowX: "auto",
          "&::-webkit-scrollbar": {
            height: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0,0,0,0.1)",
            borderRadius: "4px",
          },
        }}
      >
        {tabs.map((tab, index) => (
          <Button
            key={index}
            disableRipple // Disable ripple effect to prevent visual jitter
            onClick={() => setTabValue(index)}
            sx={{
              minWidth: "120px",
              height: "48px",
              borderRadius: 0,
              borderBottom: tabValue === index ? "2px solid" : "none",
              borderColor: "primary.main",
              color: tabValue === index ? "primary.main" : "text.primary",
              fontWeight: tabValue === index ? "medium" : "normal",
              textTransform: "none",
              px: 2,
              transition: "none",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
                transition: "none",
              },
            }}
          >
            {tab.label}
          </Button>
        ))}
      </Box>

      {/* Tab Panel Contents */}
      <Box role="tabpanel" hidden={tabValue !== 0}>
        {tabValue === 0 && (
          <Grid container spacing={3}>
            {/* Product main image and description */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                variant="outlined"
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                <CardMedia
                  component="img"
                  alt={product.title}
                  height="400"
                  image={product.images[0]?.url}
                  sx={{
                    objectFit: "contain",
                    backgroundColor: "#f5f5f5",
                    p: 2,
                  }}
                />
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                variant="outlined"
                sx={{
                  p: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Product Details
                </Typography>
                <Typography variant="body2" paragraph>
                  {removeHtmlTags(product.description)}
                </Typography>
                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  {/* <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Brand
                    </Typography>
                    <Typography variant="body1">
                      {product.brand || "Not specified"}
                    </Typography>
                  </Grid> */}
                  {/* <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Category
                    </Typography>
                    <Typography variant="body1">
                      {product.category?.name || "Not categorized"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Sub-category
                    </Typography>
                    <Typography variant="body1">
                      {product.subcategory?.name || "Not specified"}
                    </Typography>
                  </Grid> */}
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Type
                    </Typography>
                    <Typography variant="body1">
                      {product.categoryType?.name || "Not specified"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Stock
                    </Typography>
                    <Typography variant="body1">
                      {product.stock} units
                    </Typography>
                  </Grid>
                  {/* <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Sold
                    </Typography>
                    <Typography variant="body1">
                      {product.productSold} units
                    </Typography>
                  </Grid> */}
                </Grid>

                <Box sx={{ flexGrow: 1 }} />

                {/* Return policy section */}
                {/* <Box sx={{ mt: 3, p: 2, bgcolor: "#f8f9fa", borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Return Policy
                  </Typography>
                  <Typography variant="body2">
                    {product.returnPolicy.isReturnable
                      ? `Returnable within ${product.returnPolicy.returnWindow} days`
                      : "Not returnable"}
                  </Typography>
                </Box> */}
              </Paper>
            </Grid>

            {/* Special offers section */}
            {/* <Grid item xs={12}>
              <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Special Offers
                </Typography>
                {product.offers && product.offers.length > 0 ? (
                  <Grid container spacing={2}>
                    {product.offers.map((offer, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            border: "1px solid",
                            borderColor: "primary.light",
                            bgcolor: "primary.lightest",
                            height: "100%",
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight="bold">
                            {offer.title}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {offer.description}
                          </Typography>
                          <Chip
                            size="small"
                            label={`${offer.discountPercentage}% OFF`}
                            color="primary"
                          />
                          <Typography
                            variant="caption"
                            display="block"
                            sx={{ mt: 1 }}
                          >
                            Valid until:{" "}
                            {new Date(offer.validUntil).toLocaleDateString()}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No special offers available for this product.
                  </Typography>
                )}
              </Paper>
            </Grid> */}

            {/* SEO metadata */}
            <Grid item xs={12}>
              <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  SEO Metadata
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Meta Title
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ wordBreak: "break-word" }}
                    >
                      {product.meta?.title || "Not provided"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Meta Description
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ wordBreak: "break-word" }}
                    >
                      {product.meta?.description || "Not provided"}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Specifications Tab */}
      <Box role="tabpanel" hidden={tabValue !== 1}>
        {tabValue === 1 && (
          <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Technical Specifications
            </Typography>
            {product.specifications &&
              product.specifications.length > 0 &&
              product.specifications[0].key ? (
              <Grid container spacing={2}>
                {product.specifications.map((spec, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: index % 2 === 0 ? "#f8f9fa" : "transparent",
                        height: "100%",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {spec.key}
                      </Typography>
                      <Typography variant="body1">{spec.value}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Alert severity="info">
                No specifications have been provided for this product.
              </Alert>
            )}
          </Paper>
        )}
      </Box>

      {/* Variants Tab */}
      <Box role="tabpanel" hidden={tabValue !== 2}>
        {tabValue === 2 && (
          <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Product Variants
            </Typography>
            {product.variants && product.variants.length > 0 ? (
              <Grid container spacing={2}>
                {product.variants.map((variant, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper
                      elevation={0}
                      variant="outlined"
                      sx={{ p: 2, height: "100%" }}
                    >
                      <Typography variant="subtitle1" fontWeight="medium">
                        {variant.attribute}
                      </Typography>
                      <Chip label={variant.value} size="small" sx={{ my: 1 }} />
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        sx={{ mt: 1 }}
                      >
                        <Typography variant="body2">
                          +₹{variant.additionalPrice}
                        </Typography>
                        <Typography variant="body2">
                          Stock: {variant.stock}
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Alert severity="info">
                This product doesn't have any variants.
              </Alert>
            )}
          </Paper>
        )}
      </Box>

      {/* Images Tab */}
      <Box role="tabpanel" hidden={tabValue !== 3}>
        {tabValue === 3 && (
          <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Product Gallery
            </Typography>
            <Grid container spacing={2}>
              {product.images && product.images.length > 0 ? (
                product.images.map((image, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper
                      elevation={0}
                      variant="outlined"
                      sx={{
                        p: 1,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={image.url}
                        alt={image.altText || `Product image ${index + 1}`}
                        sx={{
                          height: 200,
                          objectFit: "contain",
                          bgcolor: "#f5f5f5",
                        }}
                      />
                      <Typography
                        variant="caption"
                        align="center"
                        sx={{ mt: 1 }}
                      >
                        {image.altText || `Image ${index + 1}`}
                      </Typography>
                    </Paper>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Alert severity="info">
                    No additional images available for this product.
                  </Alert>
                </Grid>
              )}
              {product.thumbnail && (
                <Grid item xs={12} sm={6} md={4}>
                  <Paper
                    elevation={0}
                    variant="outlined"
                    sx={{
                      p: 1,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderColor: "primary.main",
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={product.thumbnail.url}
                      alt={product.thumbnail.altText || "Product thumbnail"}
                      sx={{
                        height: 200,
                        objectFit: "contain",
                        bgcolor: "#f5f5f5",
                      }}
                    />
                    <Chip
                      label="Thumbnail"
                      color="primary"
                      size="small"
                      sx={{ alignSelf: "center", mt: 1 }}
                    />
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Paper>
        )}
      </Box>

      {/* Seller Info Tab */}
      <Box role="tabpanel" hidden={tabValue !== 4}>
  {tabValue === 4 && (
    <Paper 
      elevation={0} 
      variant="outlined" 
      sx={{ 
        p: 3, 
        borderRadius: 2,
        background: 'linear-gradient(to right bottom, #ffffff, #f8f9fa)'
      }}
    >
      <Typography 
        variant="h6" 
        gutterBottom
        sx={{ 
          fontWeight: 600, 
          color: 'primary.main',
          mb: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 1
        }}
      >
        Seller Information
      </Typography>
      
      {product.vendor ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                height: '100%',
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                  <BusinessIcon />
                </Avatar>
                <Typography variant="subtitle1" fontWeight={600}>
                  Company Details
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Company Name
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {product.vendor.companyName || "Not provided"}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Email
                    </Typography>
                    <Typography 
                      variant="body1" 
                      component="a" 
                      href={`mailto:${product.vendor.email}`}
                      sx={{ 
                        color: 'primary.main',
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      {product.vendor.email || "Not provided"}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                height: '100%',
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'secondary.light', mr: 2 }}>
                  <StorefrontIcon />
                </Avatar>
                <Typography variant="subtitle1" fontWeight={600}>
                  Store Information
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Merchant Shop
                    </Typography>
                    <Typography 
                      variant="body1" 
                      component="a" 
                      href={`https://${product.merchantShop}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: 'primary.main',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      {product.merchantShop || "N/A"}
                      <LaunchIcon sx={{ ml: 0.5, fontSize: 16 }} />
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Products Sold
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <LocalShippingIcon sx={{ mr: 1, color: 'success.main' }} />
                      <Typography variant="body1" fontWeight={500}>
                        {product.productSold || 0}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Alert 
          severity="warning"
          variant="outlined"
          sx={{ 
            borderRadius: 2,
            '& .MuiAlert-icon': {
              color: 'warning.main'
            }
          }}
        >
          <AlertTitle>No Seller Data</AlertTitle>
          Seller information is not available for this product.
        </Alert>
      )}
    </Paper>
  )}
</Box>

      {/* Approval/rejection dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {action === "approve" ? "Approve Product" : "Reject Product"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {action === "approve"
              ? "Are you sure you want to approve this product? It will be visible to customers."
              : "Please provide a reason for rejecting this product. This will be shared with the seller."}
          </DialogContentText>
          {action === "reject" && (
            <TextField
              error={!!validationError}
              helperText={validationError}
              autoFocus
              margin="dense"
              id="block-reason"
              label="Rejection Reason"
              placeholder="Explain why this product is being rejected..."
              type="text"
              fullWidth
              multiline
              rows={4}
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              variant="outlined"
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} color="inherit" variant="outlined">
            Cancel
          </Button>
          {action === "approve" ? (
            <Button
              onClick={handleApproveProduct}
              color="success"
              variant="contained"
              disabled={loadingBtn}
              startIcon={
                loadingBtn ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <VerifiedIcon />
                )
              }
            >
              {loadingBtn ? "Processing..." : "Approve Product"}
            </Button>
          ) : (
            <Button
              onClick={handleRejectProduct}
              color="error"
              variant="contained"
              disabled={loadingBtn}
              startIcon={
                loadingBtn ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <BlockIcon />
                )
              }
            >
              {loadingBtn ? "Processing..." : "Reject Product"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ViewProduct;
