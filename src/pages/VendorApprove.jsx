import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Snackbar,
  Alert,
  Typography,
  CircularProgress,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
} from "@mui/material";
import { styled } from "@mui/system";
import AssignmentIcon from "@mui/icons-material/Assignment";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useParams, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/baseUrl";
import { logoutUser } from "../utils/authUtils";
import CustomInput from "../components/SharedComponents/CustomInput";
import CustomButton from "../components/SharedComponents/CustomButton";

// Styled components for custom stepper design with blue gradient
const CustomStepIcon = styled(Box)(({ active }) => ({
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  background: active ? "linear-gradient(90deg, #2196F3, #0D47A1)" : "#E0E0E0",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  color: active ? "#fff" : "#757575",
  boxShadow: active ? "0 0 8px rgba(33, 150, 243, 0.5)" : "none",
  marginBottom: "30px",
  transition: "all 0.3s ease",
}));

const StepConnector = styled("div")(({ active }) => ({
  flex: 1,
  height: "2px",
  background: active ? "linear-gradient(90deg, #2196F3, #0D47A1)" : "#E0E0E0",
  margin: "0 8px",
  marginBottom: "30px",
  transition: "all 0.3s ease",
}));

const StepLabel = styled(Typography)(({ active }) => ({
  fontSize: "12px",
  fontWeight: active ? 600 : 400,
  color: active ? "#0D47A1" : "#757575",
  textAlign: "center",
  marginTop: "5px",
}));

const ContentPaper = styled(Paper)(({ theme }) => ({
  padding: "24px",
  margin: "16px 0 24px 0",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
}));

const ActionButton = styled(Button)(({ color }) => ({
  fontWeight: 500,
  padding: "8px 24px",
  borderRadius: "4px",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  margin: "0 8px",
}));

const steps = [
  { label: "Personal Details", icon: <GroupAddIcon /> },
  { label: "Documents", icon: <AssignmentIcon /> },
  { label: "Bank Details", icon: <AccountBalanceIcon /> },
];

const CustomStepper = ({ activeStep }) => (
  <Box sx={{ mb: 4 }}>
    <Box display="flex" alignItems="center" justifyContent="center">
      {steps.map((step, index) => (
        <React.Fragment key={step.label}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <CustomStepIcon active={index <= activeStep}>
              {step.icon}
            </CustomStepIcon>
            <StepLabel active={index <= activeStep}>{step.label}</StepLabel>
          </Box>
          {index < steps.length - 1 && (
            <StepConnector active={index < activeStep} />
          )}
        </React.Fragment>
      ))}
    </Box>
  </Box>
);

const VendorApprove = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [vendorDetails, setVendorDetails] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "",
  });
  const [openApproveModal, setOpenApproveModal] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { vendorId } = useParams();
  const token = localStorage.getItem("token");

  // Fetch vendor data from API
  useEffect(() => {
    const fetchVendorData = async () => {
      // if (!token) {
      //   console.error("No token found in localStorage");
      //   return;
      // }
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
        console.error("Error fetching vendor data:", error);
        if (
          error.response &&
          (error.response.status === 404 || error.response.status === 401)
        ) {
          logoutUser(); // Call logoutUser if 404 or 401 status code
        }
      }
    };

    fetchVendorData();
  }, [token, vendorId]);

  // Snackbar handler
  const handleSnackbarClose = () =>
    setSnackbar({ open: false, message: "", severity: "" });

  // Render details for each step
  const renderPersonalDetails = (details) => {
    return (
      <Box
        display="grid"
        gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
        gap={3}
      >
        <CustomInput
          label="Full Name"
          value={details.fullName}
          InputProps={{ readOnly: true }}
          fullWidth
        />
        <CustomInput
          label="Email"
          value={details.email}
          InputProps={{ readOnly: true }}
          fullWidth
        />
        <CustomInput
          label="Phone Number"
          value={details.phoneNum}
          InputProps={{ readOnly: true }}
          fullWidth
        />
        <CustomInput
          label="Address"
          value={details.address}
          InputProps={{ readOnly: true }}
          fullWidth
        />
        <CustomInput
          label="City"
          value={details.city}
          InputProps={{ readOnly: true }}
          fullWidth
        />
        <CustomInput
          label="State"
          value={details.state?.name || "N/A"}
          InputProps={{ readOnly: true }}
          fullWidth
        />
        <CustomInput
          label="Country"
          value={details.country?.name || "N/A"}
          InputProps={{ readOnly: true }}
          fullWidth
        />
      </Box>
    );
  };

  const renderDocuments = (vendorDetails) => {
    const { PAN, GSTIN } = vendorDetails;

    if (!PAN || !GSTIN) {
      return (
        <Typography variant="body2" color="error">
          Documents are missing or incomplete.
        </Typography>
      );
    }

    return (
      <Box
        display="grid"
        gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
        gap={3}
      >
        <CustomInput
          label="PAN Document Number"
          value={PAN.documentNumber || ""} // Ensure value is not undefined
          variant="outlined" // Explicitly set variant
          InputProps={{ readOnly: true }}
          fullWidth
        />
        <Box>
          <Typography variant="body2" color="textSecondary">
            PAN Document:
          </Typography>
          <img
            src={PAN.documentUrl}
            alt="PAN Document"
            style={{
              width: "300px",
              height: "350px",
              paddingRight: "15px",
              borderRadius: "4px",
            }}
          />
        </Box>
        <CustomInput
          label="GSTIN"
          value={GSTIN.documentNumber || ""} // Ensure value is not undefined
          variant="outlined" // Explicitly set variant
          InputProps={{ readOnly: true }}
          fullWidth
        />
        <Box>
          <Typography variant="body2" color="textSecondary">
            GSTIN Document:
          </Typography>
          <img
            src={GSTIN.documentUrl}
            alt="GSTIN Document"
            style={{
              width: "300px",
              height: "350px",
              paddingRight: "15px",
              borderRadius: "4px",
            }}
          />
        </Box>
      </Box>
    );
  };

  const renderBankDetails = (bankDetails) => {
    return (
      <Box
        display="grid"
        gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
        gap={3}
      >
        <CustomInput
          label="Account Holder Name"
          value={bankDetails.accountHolderName || ""} // Ensure value is not undefined
          variant="outlined" // Explicitly set variant
          InputProps={{ readOnly: true }}
          fullWidth
        />
        <CustomInput
          label="Account Number"
          value={bankDetails.accountNumber || ""} // Ensure value is not undefined
          variant="outlined" // Explicitly set variant
          InputProps={{ readOnly: true }}
          fullWidth
        />
        <CustomInput
          label="IFSC Code"
          value={bankDetails.ifscCode || ""} // Ensure value is not undefined
          variant="outlined" // Explicitly set variant
          InputProps={{ readOnly: true }}
          fullWidth
        />
        <CustomInput
          label="Bank Name"
          value={bankDetails.bankName?.name || "N/A"}
          variant="outlined" // Explicitly set variant
          InputProps={{ readOnly: true }}
          fullWidth
        />
        <Box>
          <Typography variant="body2" color="textSecondary">
            Bank Document:
          </Typography>
          <img
            src={bankDetails.documentUrl}
            alt="Bank Document"
            style={{ width: "300px", height: "350px", borderRadius: "4px" }}
          />
        </Box>
      </Box>
    );
  };

  const renderStepContent = (step) => {
    if (!vendorDetails) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="300px"
        >
          <CircularProgress />
        </Box>
      );
    }

    switch (step) {
      case 0:
        return renderPersonalDetails(vendorDetails);
      case 1:
        return renderDocuments(vendorDetails);
      case 2:
        return renderBankDetails(vendorDetails.bankDetails);
      default:
        return <Typography>Unknown Step</Typography>;
    }
  };

  // Handle Approve and Reject Modals
  const handleApprove = () => setOpenApproveModal(true);
  const handleReject = () => setOpenRejectModal(true);

  const handleConfirmApprove = async () => {
    setLoading(true); // Start loading
    try {
      await axios.put(
        `${BASE_URL}/api/vendor/approve/${vendorId}`,
        {},
        { withCredentials: true },
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      setSnackbar({
        open: true,
        message: "Vendor approved successfully!",
        severity: "success",
      });
      setOpenApproveModal(false); // Close modal after approval
    } catch (error) {
      console.error("Error approving vendor:", error);
      setSnackbar({
        open: true,
        message: "Failed to approve vendor",
        severity: "error",
      });
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleConfirmReject = async () => {
    setLoading(true); // Start loading
    try {
      await axios.put(
        `${BASE_URL}/api/vendor/reject/${vendorId}`,
        { verificationRemarks: rejectReason },
        { withCredentials: true },
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      setSnackbar({
        open: true,
        message: `Vendor rejected. Reason: ${rejectReason}`,
        severity: "error",
      });
      setOpenRejectModal(false); // Close modal after rejection
    } catch (error) {
      console.error("Error rejecting vendor:", error);
      setSnackbar({
        open: true,
        message: "Failed to reject vendor",
        severity: "error",
      });
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  return (
    <Box padding={3} maxWidth="1200px" margin="0 auto">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4" color="black">
          <b>Vendor Details Review</b>
        </Typography>
        <CustomButton
          onClick={() => navigate(-1)}
          variant="contained"
          style={{
            marginBottom: "20px",
          }}
          icon={ArrowBackIcon}
        ></CustomButton>
      </Box>
      <CustomStepper activeStep={activeStep} />
      <ContentPaper elevation={1}>{renderStepContent(activeStep)}</ContentPaper>

      {/* Action buttons for approval/rejection */}
      <Box mt={3} mb={2} display="flex" justifyContent="center">
        {activeStep === 2 && (
          <>
            <ActionButton
              variant="contained"
              color="success"
              onClick={handleApprove}
            >
              Approve
            </ActionButton>
            <ActionButton
              variant="contained"
              color="error"
              onClick={handleReject}
            >
              Reject
            </ActionButton>
          </>
        )}
      </Box>

      {/* Navigation buttons */}
      <Box
        mt={4}
        display="flex"
        justifyContent="space-between"
        maxWidth="400px"
        margin="0 auto"
      >
        <Button
          onClick={handleBack}
          disabled={activeStep === 0}
          variant="outlined"
          color="primary"
          sx={{ minWidth: "100px" }}
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={activeStep === steps.length - 1}
          variant="outlined"
          color="primary"
          sx={{ minWidth: "100px" }}
        >
          Next
        </Button>
      </Box>

      {/* Approve Modal */}
      <Dialog
        open={openApproveModal}
        onClose={() => setOpenApproveModal(false)}
        PaperProps={{
          sx: { borderRadius: "8px", padding: "8px" },
        }}
      >
        <DialogTitle sx={{ color: "#1976D2" }}>Approve Vendor</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to approve this vendor?</Typography>
          {loading && (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              mt={2}
              minHeight="50px"
            >
              <CircularProgress size={24} color="primary" />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ padding: "16px 24px" }}>
          <Button
            onClick={() => setOpenApproveModal(false)}
            disabled={loading}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmApprove}
            disabled={loading}
            variant="contained"
            color="primary"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Modal */}
      <Dialog
        open={openRejectModal}
        onClose={() => setOpenRejectModal(false)}
        PaperProps={{
          sx: { borderRadius: "8px", padding: "8px" },
        }}
      >
        <DialogTitle sx={{ color: "#d32f2f" }}>Reject Vendor</DialogTitle>
        <DialogContent>
          <Typography mb={2}>Please provide reason for rejection:</Typography>
          <CustomInput
            fullWidth
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            multiline
            rows={4}
            disabled={loading}
          />
          {loading && (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              mt={2}
              minHeight="50px"
            >
              <CircularProgress size={24} color="error" />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ padding: "16px 24px" }}>
          <Button
            onClick={() => setOpenRejectModal(false)}
            disabled={loading}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmReject}
            disabled={loading}
            variant="contained"
            color="error"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for alerts */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "center", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VendorApprove;
