import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Grid,
  Paper,
  Divider,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Button } from "react-bootstrap";
import { BASE_URL } from "../utils/baseUrl";
import { logoutUser } from "../utils/authUtils";
import { toast, Toaster } from "react-hot-toast";
import CustomButton from "../components/SharedComponents/CustomButton";

const VendorView = () => {
  const [vendorDetails, setVendorDetails] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { vendorId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    // if (!token) {
    //   navigate("/login");
    //   return;
    // }

    const fetchVendorDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `${BASE_URL}/api/vendor/get-one/${vendorId}`,
          { withCredentials: true },
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        );
        setVendorDetails(response.data.data);
      } catch (error) {
        console.error("Error fetching vendor details:", error);
        const errorMessage =
          error.response?.data?.message || "Failed to load vendor details";
        setError(errorMessage);

        if (
          error.response &&
          (error.response.status === 404 || error.response.status === 401)
        ) {
          toast.error("Your session has expired. Please log in again.");
          logoutUser();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVendorDetails();
  }, [vendorId, token, navigate]);

  const handleBlockUnblockClick = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleConfirmBlockUnblock = async () => {
    const action = vendorDetails.isBlocked ? "unblock" : "block";
    const toastId = toast.loading(
      `${action === "block" ? "Blocking" : "Unblocking"} vendor...`
    );

    try {
      const response = await axios.put(
        `${BASE_URL}/api/vendor/blocks/${vendorId}`,
        { action },
        {
          headers: {
            authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setVendorDetails((prev) => ({ ...prev, isBlocked: !prev.isBlocked }));
        toast.success(
          `Vendor successfully ${action === "block" ? "blocked" : "unblocked"}`,
          { id: toastId }
        );
      }
    } catch (error) {
      console.error("Error updating vendor status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update vendor status",
        { id: toastId }
      );
    } finally {
      setOpenModal(false);
    }
  };

  const renderDetailItem = (label, value) => (
    <Grid item xs={12} md={6} key={label}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      {value ? (
        typeof value === "string" ? (
          <Typography variant="body1">{value}</Typography>
        ) : (
          value
        )
      ) : (
        <Typography variant="body2" color="text.secondary">
          Not provided
        </Typography>
      )}
    </Grid>
  );

  const renderDocumentCard = (title, documentNumber, documentUrl) => (
    <Grid item xs={12} md={6}>
      <Card variant="outlined" sx={{ height: "100%" }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Number: {documentNumber || "Not provided"}
          </Typography>
          {documentUrl ? (
            <Box
              sx={{
                mt: 2,
                display: "flex",
                justifyContent: "center",
                border: "1px solid #eee",
                borderRadius: 1,
                p: 1,
              }}
            >
              <img
                src={documentUrl}
                alt={`${title} Document`}
                style={{
                  maxWidth: "100%",
                  maxHeight: "300px",
                  objectFit: "contain",
                  borderRadius: "4px",
                }}
              />
            </Box>
          ) : (
            <Alert severity="info" sx={{ mt: 2 }}>
              No document uploaded
            </Alert>
          )}
        </CardContent>
      </Card>
    </Grid>
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading vendor details...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </Box>
    );
  }

  if (!vendorDetails) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">
          Vendor information not found. The vendor may have been removed or you
          don't have permission to view it.
        </Alert>
        <Button onClick={() => navigate(-1)} style={{ marginTop: 16 }}>
          Go Back
        </Button>
      </Box>
    );
  }

  const {
    fullName,
    email,
    phoneNum,
    address,
    city,
    zipCode,
    state,
    country,
    companyName,
    companyIcon,
    PAN,
    GSTIN,
    bankDetails,
    isBlocked,
  } = vendorDetails;

  return (
    <Box sx={{ width: "100%", p: { xs: 2, md: 4 } }}>
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
        <CustomButton
          onClick={() => navigate(-1)}
          variant="contained"
          style={{
            marginBottom: "20px",
          }}
          icon={ArrowBackIcon}
        ></CustomButton>
      </Box>
      <Toaster position="top-right" />

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Box display="flex" alignItems="center" gap={3} mb={2}>
          <Avatar
            src={
              companyIcon ||
              "https://cdn-icons-png.flaticon.com/512/2991/2991148.png"
            }
            alt="Company Logo"
            sx={{ width: 80, height: 80 }}
            variant="rounded"
          />
          <Box>
            <Typography variant="h4" fontWeight="500">
              {companyName || "Unnamed Company"}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                display: "inline-block",
                backgroundColor: isBlocked ? "#ffebee" : "#e8f5e9",
                color: isBlocked ? "#c62828" : "#2e7d32",
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                mt: 1,
              }}
            >
              {isBlocked ? "Blocked" : "Active"}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={4}>
        {/* Personal Details Section */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 3 }}>
              Personal Details
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              {renderDetailItem("Full Name", fullName)}
              {renderDetailItem("Email", email)}
              {renderDetailItem("Phone Number", phoneNum)}
              {renderDetailItem("Address", address)}
              {renderDetailItem("City", city)}
              {renderDetailItem("Zip Code", zipCode)}
              {renderDetailItem("State", state?.name)}
              {renderDetailItem("Country", country?.name)}
            </Grid>
          </Paper>
        </Grid>

        {/* Documents Section */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 3 }}>
              Identity & Tax Documents
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              {renderDocumentCard(
                "PAN Document",
                PAN?.documentNumber,
                PAN?.documentUrl
              )}
              {renderDocumentCard(
                "GSTIN Document",
                GSTIN?.documentNumber,
                GSTIN?.documentUrl
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Bank Details Section */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 3 }}>
              Bank Details
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              {renderDetailItem(
                "Account Holder Name",
                bankDetails?.accountHolderName
              )}
              {renderDetailItem("Account Number", bankDetails?.accountNumber)}
              {renderDetailItem("IFSC Code", bankDetails?.ifscCode)}
              {renderDetailItem("Bank Name", bankDetails?.bankName?.name)}

              <Grid item xs={12}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Bank Document
                </Typography>
                {bankDetails?.documentUrl ? (
                  <Box
                    sx={{
                      mt: 1,
                      border: "1px solid #eee",
                      borderRadius: 1,
                      p: 1,
                      maxWidth: 400,
                    }}
                  >
                    <img
                      src={bankDetails.documentUrl}
                      alt="Bank Document"
                      style={{
                        width: "100%",
                        borderRadius: "4px",
                      }}
                    />
                  </Box>
                ) : (
                  <Alert severity="info" sx={{ mt: 1, maxWidth: 400 }}>
                    No bank document provided
                  </Alert>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, mb: 5 }}>
        <Button
          variant="contained"
          style={{
            backgroundColor: isBlocked ? "#4caf50" : "#f44336",
            border: "none",
            color: "white",
            padding: "10px 24px",
            fontSize: "16px",
            borderRadius: "4px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          }}
          onClick={handleBlockUnblockClick}
        >
          {isBlocked ? "Unblock Vendor" : "Block Vendor"}
        </Button>
      </Box>

      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          {isBlocked ? "Unblock Vendor?" : "Block Vendor?"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            {isBlocked
              ? "This will allow the vendor to access the platform and conduct business."
              : "This will prevent the vendor from accessing the platform and conducting business."}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {isBlocked
              ? "The vendor will be notified that their account has been reactivated."
              : "The vendor will be notified that their account has been suspended."}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseModal} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmBlockUnblock}
            style={{
              backgroundColor: isBlocked ? "#4caf50" : "#f44336",
              color: "white",
            }}
          >
            {isBlocked ? "Unblock" : "Block"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VendorView;
