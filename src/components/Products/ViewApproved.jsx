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


const normalizeProductData = (data) => {

    const isShopifyFormat = data.variants?.edges || false;

    if (isShopifyFormat) {

        return {
            ...data,
            price: data.price || data.variants.edges[0]?.node.price,
            compareAtPrice: data.compareAtPrice || data.variants.edges[0]?.node.compareAtPrice,
            variants: data.variants.edges.map(edge => ({
                id: edge.node.id,
                title: edge.node.title,
                price: edge.node.price,
                compareAtPrice: edge.node.compareAtPrice,
                inventoryQuantity: edge.node.inventoryQuantity,
                sku: edge.node.sku,
                barcode: edge.node.barcode,
                displayName: edge.node.displayName,
                variantTypes: extractVariantTypes(edge.node.title),
                image: edge.node.image ? edge.node.image : null
            })),

            images: data.media?.edges?.map(edge => ({
                url: edge.node.preview.image.url,
                altText: edge.node.preview.image.altText || ""
            })) || [],

            totalInventory: data.totalInventory || 0,
            status: data.status || "UNKNOWN"
        };
    }
    return data;
};

const extractVariantTypes = (title) => {
    if (!title || !title.includes('/')) return [];

    const parts = title.split('/').map(part => part.trim());

    if (parts.length === 2) {
        return [
            { option: 'color', value: parts[0] },
            { option: 'size', value: parts[1] }
        ];
    }

    return [];
};

const ViewApproved = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [rawProductData, setRawProductData] = useState(null);
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
            console.log("Selected variant image:", variantData.image);
        }
    };

    const fetchProductData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${BASE_URL}/api/product/get-one-approved-product/${id}`,
                {
                    withCredentials: true
                }
            );

            // Store the raw data
            setRawProductData(response.data.data);

            // Process and normalize the data
            const normalizedData = normalizeProductData(response.data.data);
            setProduct(normalizedData);

            console.log("Fetched product data:", response.data.data);
            console.log("Normalized product data:", normalizedData);

        } catch (err) {
            console.error("Error fetching product:", err);

            if (
                err.response &&
                (err.response.status === 404 || err.response.status === 401)
            ) {
                logoutUser(navigate);
            }
            setError("Error fetching product data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductData();
    }, [id]);

    useEffect(() => {
        if (product?.variants?.length > 0) {

            const firstColorVariant = product.variants.find(variant =>
                variant.variantTypes.some(type => type.option === 'color')
            );

            if (firstColorVariant) {
                const colorValue = firstColorVariant.variantTypes.find(type => type.option === 'color')?.value;
                if (colorValue) {
                    handleVariantSelect(colorValue);
                }
            } else {
                setSelectedVariantData(product.variants[0]);
            }
        }
    }, [product]);

    const tabs = [
        { label: "Overview", id: "tab-0" },
        { label: "Variants", id: "tab-1" },
        { label: "Images", id: "tab-2" },
        { label: "Seller Info", id: "tab-3" },
    ];



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

    if (!product) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Alert severity="info">No product data available.</Alert>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{ mt: 2 }}
                >
                    Go Back
                </Button>
            </Container>
        );
    }

    const displayPrice = selectedVariantData?.price || product.price;
    const displayComparePrice = selectedVariantData?.compareAtPrice || product.compareAtPrice;
    const displayImage = selectedVariantData?.image?.url ||
        (product.images && product.images.length > 0 ? product.images[0].url :
            product.featuredMedia?.preview?.image?.url || '/api/placeholder/400/400');

    return (
        <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
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

                        <Typography variant="h6" color="primary" gutterBottom>
                            ₹{displayPrice}
                            {displayComparePrice && (
                                <Typography
                                    component="span"
                                    sx={{ textDecoration: "line-through", ml: 1 }}
                                    color="text.secondary"
                                >
                                    ₹{displayComparePrice}
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

                        </Stack>
                    </Grid>
                </Grid>
            </Paper>

            {/* Custom tabs implementation */}
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
                        disableRipple
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

            {/* Overview Tab */}
            <Box role="tabpanel" hidden={tabValue !== 0}>
                {tabValue === 0 && (
                    <Grid container spacing={3}>
                        {/* Product main image */}
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
                                    image={displayImage}
                                    sx={{
                                        objectFit: "contain",
                                        backgroundColor: "#f5f5f5",
                                        p: 2,
                                    }}
                                />
                            </Paper>
                        </Grid>

                        {/* Product description */}
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
                                    {removeHtmlTags(product.description || product.descriptionHtml)}
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
                                        <Typography variant="body2" color="text.secondary">
                                            Vendor
                                        </Typography>
                                        <Typography variant="body1">
                                            {product.vendor?.companyName || product.vendor || "Not specified"}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">
                                            Status
                                        </Typography>
                                        <Chip
                                            label={product.status || "Unknown"}
                                            color={product.status === 'ACTIVE' ? "success" : "default"}
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">
                                            Total Inventory
                                        </Typography>
                                        <Typography variant="body1">
                                            {product.totalInventory || "Not available"}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

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

            {/* Variants Tab */}
            <Box role="tabpanel" hidden={tabValue !== 1}>
                {tabValue === 1 && (
                    <Paper
                        elevation={0}
                        variant="outlined"
                        sx={{
                            p: 3,
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

                        {product.variants && product.variants.length > 0 ? (
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
                                                        src={selectedVariantData?.image?.url ||
                                                            (product.images && product.images.length > 0 ?
                                                                product.images[0].url :
                                                                product.featuredMedia?.preview?.image?.url || '/api/placeholder/400/400'
                                                            )}
                                                        alt={`${product.title} - ${selectedVariantData?.title || ''}`}
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
                                                            {product.title} - {selectedVariantData?.title || ''}
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
                                                                    label={selectedVariantData?.inventoryQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                                                                    color={selectedVariantData?.inventoryQuantity > 0 ? 'success' : 'error'}
                                                                    variant="outlined"
                                                                />
                                                            </Grid>

                                                            {selectedVariantData?.inventoryQuantity > 0 && (
                                                                <Grid item xs={6}>
                                                                    <Typography variant="body2" color="text.secondary">Quantity</Typography>
                                                                    <Typography variant="body1">{selectedVariantData?.inventoryQuantity} available</Typography>
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
                                                                        label={`Save ${Math.round((1 - (selectedVariantData?.price || product.price) /
                                                                            (selectedVariantData?.compareAtPrice || product.compareAtPrice)) * 100)}%`}
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
                                        This product has <strong>{product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}</strong>
                                    </Typography>
                                </Box>

                                {/* Variant Cards in Grid */}
                                <Grid container spacing={2}>
                                    {product.variants.map((variant, index) => (
                                        <Grid item xs={12} sm={6} md={4} key={index}>
                                            <Card
                                                variant="outlined"
                                                sx={{
                                                    borderRadius: 2,
                                                    cursor: 'pointer',
                                                    borderColor: selectedVariantData === variant ? 'primary.main' : 'divider',
                                                    borderWidth: selectedVariantData === variant ? '2px' : '1px',
                                                    position: 'relative',
                                                    transition: 'all 0.2s ease',
                                                    overflow: 'visible',
                                                    '&:hover': {
                                                        transform: 'translateY(-4px)',
                                                        boxShadow: '0 6px 16px rgba(0,0,0,0.1)'
                                                    }
                                                }}
                                                onClick={() => setSelectedVariantData(variant)}
                                            >
                                                {selectedVariantData === variant && (
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            right: 0,
                                                            transform: 'translate(30%, -30%)',
                                                            bgcolor: 'primary.main',
                                                            color: 'white',
                                                            width: 24,
                                                            height: 24,
                                                            borderRadius: '50%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            zIndex: 1,
                                                            border: '2px solid white',
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                        }}
                                                    >
                                                        <VerifiedIcon sx={{ fontSize: 16 }} />
                                                    </Box>
                                                )}

                                                <CardHeader
                                                    title={variant.title || variant.displayName || `Variant ${index + 1}`}
                                                    titleTypographyProps={{ variant: 'subtitle2', fontWeight: 600, noWrap: true }}
                                                    sx={{ pb: 0 }}
                                                />

                                                <CardContent>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            height: '100%',
                                                            justifyContent: 'space-between'
                                                        }}
                                                    >
                                                        <Box>
                                                            {/* Variant color indicator if available */}
                                                            {variant.variantTypes && variant.variantTypes.some(type => type.option === 'color') && (
                                                                <Box sx={{ mb: 1 }}>
                                                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                                                        Color
                                                                    </Typography>
                                                                    <Box
                                                                        sx={{
                                                                            width: 32,
                                                                            height: 32,
                                                                            borderRadius: '50%',
                                                                            bgcolor: variant.variantTypes.find(type => type.option === 'color')?.value.toLowerCase() || 'grey',
                                                                            border: '1px solid',
                                                                            borderColor: 'divider'
                                                                        }}
                                                                    />
                                                                </Box>
                                                            )}

                                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                                SKU
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ mb: 1, fontFamily: 'monospace' }}>
                                                                {variant.sku || 'N/A'}
                                                            </Typography>

                                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                                Inventory
                                                            </Typography>
                                                            <Chip
                                                                size="small"
                                                                label={variant.inventoryQuantity > 0 ? `${variant.inventoryQuantity} in stock` : "Out of stock"}
                                                                color={variant.inventoryQuantity > 0 ? "success" : "error"}
                                                                variant="outlined"
                                                                sx={{ mb: 2 }}
                                                            />
                                                        </Box>

                                                        <Box
                                                            sx={{
                                                                p: 1.5,
                                                                mt: 2,
                                                                bgcolor: 'grey.50',
                                                                borderRadius: 1,
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'baseline'
                                                            }}
                                                        >
                                                            <Typography variant="h6" color="primary">
                                                                ₹{variant.price}
                                                            </Typography>
                                                            {variant.compareAtPrice && (
                                                                <Typography
                                                                    component="span"
                                                                    sx={{ textDecoration: "line-through" }}
                                                                    color="text.secondary"
                                                                    variant="body2"
                                                                >
                                                                    ₹{variant.compareAtPrice}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 6 }}>
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
                            ) : product.featuredMedia ? (
                                <Grid item xs={12} sm={6} md={4}>
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
                                            image={product.featuredMedia.preview.image.url}
                                            alt={product.title}
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
                                            Featured Image
                                        </Typography>
                                    </Paper>
                                </Grid>
                            ) : (
                                <Grid item xs={12}>
                                    <Alert severity="info">
                                        No images available for this product.
                                    </Alert>
                                </Grid>
                            )}
                        </Grid>
                    </Paper>
                )}
            </Box>

            {/* Seller Info Tab */}
            <Box role="tabpanel" hidden={tabValue !== 3}>
                {tabValue === 3 && (
                    <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Seller Information
                        </Typography>

                        {product.vendor ? (
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
                                        <Box display="flex" alignItems="center" mb={2}>
                                            <StorefrontIcon sx={{ mr: 1, color: 'primary.main' }} />
                                            <Typography variant="subtitle1" fontWeight="medium">
                                                Company Details
                                            </Typography>
                                        </Box>
                                        <Divider sx={{ mb: 2 }} />

                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Company Name
                                                </Typography>
                                                <Typography variant="body1">
                                                    {typeof product.vendor === 'object'
                                                        ? product.vendor.companyName || "Not provided"
                                                        : product.vendor}
                                                </Typography>
                                            </Grid>

                                            {product.vendor.email && (
                                                <Grid item xs={12}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Email
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {product.vendor.email}
                                                    </Typography>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
                                        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                                            Additional Info
                                        </Typography>
                                        <Divider sx={{ mb: 2 }} />

                                        {product.merchantShop && (
                                            <Box mb={2}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Merchant Shop
                                                </Typography>
                                                <Typography variant="body1">
                                                    {product.merchantShop}
                                                </Typography>
                                            </Box>
                                        )}

                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Products Sold
                                            </Typography>
                                            <Typography variant="body1">
                                                {product.productSold || 0}
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Grid>
                        ) : (
                            <Alert severity="info">
                                Seller information is not available for this product.
                            </Alert>
                        )}
                    </Paper>
                )}
            </Box>


        </Container>
    );
};

export default ViewApproved;