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
  AlertTitle,
  CardHeader,
  Accordion,
  AccordionSummary,
  AccordionDetails
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
import InfoIcon from '@mui/icons-material/Info';
import PaletteIcon from '@mui/icons-material/Palette';
import TuneIcon from '@mui/icons-material/Tune';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InventoryIcon from '@mui/icons-material/Inventory';
import VisibilityIcon from '@mui/icons-material/Visibility';
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
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedVariantData, setSelectedVariantData] = useState(null);

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

  const handleVariantSelect = (color) => {
    // Find the matching variant in the full variant objects
    const variantData = product.variants.find(variant =>
      variant.variantTypes.some(type =>
        type.option === 'color' && type.value === color
      )
    );

    if (variantData) {
      setSelectedVariant(color);
      setSelectedVariantData(variantData);

      // Explicitly set image based on variant selection
      // This ensures the image changes when a color is clicked
      console.log("Selected variant image:", variantData.image);
    }
  };

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASE_URL}/api/product/get-one-pending-product/${id}`,
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
  
  // Add a separate useEffect for initializing the selected variant
  useEffect(() => {
    if (product?.variants?.length > 0 && product.variants[0].variantTypes?.length > 0) {
      const firstColor = product.variants[0].variantTypes.find(type => type.option === 'color')?.value;
      if (firstColor) {
        handleVariantSelect(firstColor);
      }
    }
  }, [product]);

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
    // { label: "Specifications", id: "tab-1" },
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

                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Type
                    </Typography>
                    <Typography variant="body1">
                      {product.productType || "Not specified"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>

                  </Grid>

                </Grid>

                <Box sx={{ flexGrow: 1 }} />


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
                      {product.seo?.title || "Not provided"}
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
                      {product.seo?.description || "Not provided"}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Specifications Tab */}
      {/* <Box role="tabpanel" hidden={tabValue !== 1}>
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
      </Box> */}

      {/* Variants Tab */}
      <Box role="tabpanel" hidden={tabValue !== 1}>
        {tabValue === 1 && (
          <Paper
            elevation={0}
            variant="outlined"
            sx={{
              p: 1,
              borderRadius: 2,
              background: 'linear-gradient(to right bottom, #ffffff, #fafafa)'
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: 600,
                color: 'primary.main',
                borderBottom: '1px solid',
                borderColor: 'divider',
                pb: 1,
                mb: 3
              }}
            >
              Product Variants
            </Typography>

            {product.productOptions && product.productOptions.length > 0 ? (
              <>
                {/* Selected Variant Preview */}
                <Box sx={{ mb: 4 }}>
                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}
                  >
                    <CardHeader
                      title="Selected Variant Preview"
                      titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
                      avatar={
                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                          <VisibilityIcon fontSize="small" />
                        </Avatar>
                      }
                    />
                    <CardContent
                      sx={{
                        p: 0,
                        '&:last-child': { pb: 0 }
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: { xs: 'column', md: 'row' }
                        }}
                      >
                        {/* Image Preview */}
                        <Box
                          sx={{
                            width: { xs: '100%', md: '50%' },
                            height: { xs: '280px', md: '320px' },
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            bgcolor: 'background.default',
                            position: 'relative',
                            p: 2
                          }}
                        >
                          <Box
                            component="img"
                            src={selectedVariantData?.image?.url || (product.images && product.images.length > 0 ? product.images[0].url : '')}
                            alt={`${product.title} - ${selectedVariant || ''}`}
                            sx={{
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'contain',
                              transition: 'all 0.3s ease'
                            }}
                          />
                        </Box>

                        {/* Variant Details */}
                        <Box
                          sx={{
                            width: { xs: '100%', md: '50%' },
                            p: 3,
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                        >
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="overline" color="text.secondary">
                              Current Selection
                            </Typography>
                            <Typography variant="h6" gutterBottom>
                              {product.title} - {selectedVariant ? selectedVariant.charAt(0).toUpperCase() + selectedVariant.slice(1) : ''}
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                          </Box>

                          <Box sx={{ mb: 2 }}>
                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">SKU</Typography>
                                <Typography variant="body1">{selectedVariantData?.sku || 'N/A'}</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">Availability</Typography>
                                <Chip
                                  size="small"
                                  label={selectedVariantData?.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                                  color={selectedVariantData?.quantity > 0 ? 'success' : 'error'}
                                  variant="outlined"
                                />
                              </Grid>

                              {selectedVariantData?.quantity > 0 && (
                                <Grid item xs={6}>
                                  <Typography variant="body2" color="text.secondary">Quantity</Typography>
                                  <Typography variant="body1">{selectedVariantData?.quantity} available</Typography>
                                </Grid>
                              )}
                            </Grid>
                          </Box>

                          {/* Price Info */}
                          <Box
                            sx={{
                              mt: 'auto',
                              p: 2,
                              bgcolor: 'success.light',
                              borderRadius: 2,
                              color: 'success.dark'
                            }}
                          >
                            <Typography variant="subtitle2">Price</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                              <Typography variant="h5" fontWeight="bold">
                                ₹{selectedVariantData?.price || product.price}
                              </Typography>
                              {(selectedVariantData?.compareAtPrice || product.compareAtPrice) > 0 && (
                                <>
                                  <Typography variant="body2" sx={{ ml: 1, textDecoration: 'line-through' }}>
                                    ₹{selectedVariantData?.compareAtPrice || product.compareAtPrice}
                                  </Typography>
                                  <Chip
                                    size="small"
                                    label={`Save ${Math.round((1 - (selectedVariantData?.price || product.price) / (selectedVariantData?.compareAtPrice || product.compareAtPrice)) * 100)}%`}
                                    color="error"
                                    sx={{ ml: 'auto' }}
                                  />
                                </>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 3,
                    p: 1.5,
                    bgcolor: 'info.light',
                    borderRadius: 1,
                    color: 'info.dark'
                  }}
                >
                  <InfoIcon sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2">
                    This product has <strong>{product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}</strong> based on the options below
                  </Typography>
                </Box>

                {/* Options Cards */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(auto-fill, minmax(280px, 1fr))' },
                    gap: 2,
                    mb: 3
                  }}
                >
                  {product.productOptions.map((option, optionIndex) => (
                    <Card
                      key={optionIndex}
                      variant="outlined"
                      sx={{
                        borderRadius: 2,
                        overflow: 'visible',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 6px 16px rgba(0,0,0,0.08)'
                        }
                      }}
                    >
                      <CardHeader
                        title={`${option.name.charAt(0).toUpperCase() + option.name.slice(1)} Options`}
                        titleTypographyProps={{
                          variant: 'subtitle1',
                          fontWeight: 600,
                          color: 'text.primary'
                        }}
                        avatar={
                          <Avatar
                            sx={{
                              bgcolor: option.name.toLowerCase() === 'color' ? 'primary.light' : 'secondary.light',
                              width: 32,
                              height: 32
                            }}
                          >
                            {option.name.toLowerCase() === 'color' ? <PaletteIcon fontSize="small" /> : <TuneIcon fontSize="small" />}
                          </Avatar>
                        }
                        sx={{ pb: 0 }}
                      />
                      <CardContent>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, pt: 1 }}>
                          {option.values.map((value, valueIndex) => {
                            // Find the variant that matches this value
                            const matchingVariant = product.variants.find(variant =>
                              variant.variantTypes.some(type =>
                                type.option === option.name && type.value === value
                              )
                            );

                            return (
                              <Chip
                                key={valueIndex}
                                label={value}
                                size="small"
                                variant={option.name.toLowerCase() === 'color' ? 'filled' : 'outlined'}
                                onClick={() => option.name.toLowerCase() === 'color' && handleVariantSelect(value)}
                                sx={{
                                  borderRadius: '4px',
                                  cursor: option.name.toLowerCase() === 'color' ? 'pointer' : 'default',
                                  transition: 'all 0.2s',
                                  position: 'relative',
                                  ...(option.name.toLowerCase() === 'color' && {
                                    bgcolor: value.toLowerCase(),
                                    color: ['red', 'blue', 'black', 'navy'].includes(value.toLowerCase()) ? 'white' : 'black',
                                    fontWeight: 500,
                                    '&:hover': {
                                      transform: 'scale(1.05)',
                                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                    },
                                    ...(selectedVariant === value && {
                                      border: '2px solid',
                                      borderColor: 'primary.main',
                                      boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
                                    }),
                                    // If the variant is out of stock, add a visual indicator
                                    ...(matchingVariant && matchingVariant.quantity <= 0 && {
                                      opacity: 0.6,
                                      '&::after': {
                                        content: '"Out of Stock"',
                                        position: 'absolute',
                                        bottom: '-18px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        fontSize: '10px',
                                        whiteSpace: 'nowrap',
                                        color: 'error.main',
                                        fontWeight: 'normal'
                                      }
                                    })
                                  })
                                }}
                              />
                            );
                          })}
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>

                {/* Base Product Info */}
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    mb: 3,
                    borderColor: 'primary.light',
                    bgcolor: 'background.paper'
                  }}
                >
                  <CardHeader
                    title="Base Product Information"
                    titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
                    avatar={
                      <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                        <LocalOfferIcon fontSize="small" />
                      </Avatar>
                    }
                  />
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            textAlign: 'center',
                            bgcolor: 'success.light',
                            color: 'success.dark',
                            borderRadius: 2
                          }}
                        >
                          <Typography variant="overline" display="block">
                            Base Price
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            ₹{product.price}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            textAlign: 'center',
                            bgcolor: 'grey.100',
                            borderRadius: 2
                          }}
                        >
                          <Typography variant="overline" display="block">
                            Compare At
                          </Typography>
                          <Typography variant="h6" sx={{ textDecoration: 'line-through' }}>
                            ₹{product.compareAtPrice}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            textAlign: 'center',
                            bgcolor: 'warning.light',
                            color: 'warning.dark',
                            borderRadius: 2
                          }}
                        >
                          <Typography variant="overline" display="block">
                            Discount
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {Math.round((1 - product.price / product.compareAtPrice) * 100)}%
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            textAlign: 'center',
                            bgcolor: 'primary.light',
                            color: 'primary.dark',
                            borderRadius: 2
                          }}
                        >
                          <Typography variant="overline" display="block">
                            Variants
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {product.variants.length}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Variant IDs */}
                {/* <Accordion
                  disableGutters
                  elevation={0}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:before': { display: 'none' },
                    borderRadius: 2,
                    mb: 1,
                    overflow: 'hidden'
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Variant IDs for Developers
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box
                      component="pre"
                      sx={{
                        p: 2,
                        bgcolor: 'grey.100',
                        borderRadius: 1,
                        overflow: 'auto',
                        fontSize: '0.875rem',
                        fontFamily: 'monospace',
                        maxHeight: '120px'
                      }}
                    >
                      {product.variants.map(variant => variant._id).join(',\n')}
                    </Box>
                  </AccordionDetails>
                </Accordion> */}
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <InventoryIcon sx={{ fontSize: 60, color: 'action.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No Variants Available
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  This product doesn't have any variants.
                </Typography>
              </Box>
            )}
          </Paper>
        )}
      </Box>

      {/* Images Tab */}
      <Box role="tabpanel" hidden={tabValue !== 2}>
        {tabValue === 2 && (
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
      <Box role="tabpanel" hidden={tabValue !== 3}>
        {tabValue === 3 && (
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
