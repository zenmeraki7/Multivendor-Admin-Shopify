import React, { useState, useEffect } from "react";
import axios from "axios";
import SaveIcon from "@mui/icons-material/Save";
import LogoutIcon from "@mui/icons-material/Logout";
import BackupIcon from "@mui/icons-material/Backup";
import { BASE_URL } from "../utils/baseUrl";
import { Link } from "react-router-dom";
import CustomInput from "../components/SharedComponents/CustomInput";
import { logoutUser } from "../utils/authUtils";
import CustomButton from "../components/SharedComponents/CustomButton";
import { styled } from "@mui/material/styles";
import { Paper, Grid, Typography, Avatar, Box, Divider } from "@mui/material";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: "12px",
  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.05)",
  backgroundColor: "#ffffff",
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(18),
  height: theme.spacing(18),
  marginBottom: theme.spacing(3),
  border: "4px solid #e0e7ff",
}));

const StyledButton = styled(CustomButton)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: "10px 24px",
  borderRadius: "8px",
  backgroundColor: "#1e3a8a",
  "&:hover": {
    backgroundColor: "#1e40af",
  },
}));

const ProfileSection = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)",
  borderRadius: "12px",
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

function Admin() {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${BASE_URL}/api/admin/get-auth-admin`,
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        );
        setAdminData((prevData) => {
          if (JSON.stringify(prevData) !== JSON.stringify(response.data.data)) {
            return response.data.data;
          }
          return prevData;
        });
        setLoading(false);
      } catch (err) {
        if (
          err.response &&
          (err.response.status === 404 || err.response.status === 401)
        ) {
          logoutUser();
        }
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setAdminData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <Typography variant="h6" color="textSecondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <Typography variant="h6" color="error">
          Error: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: { xs: "20px", md: "40px" },
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      <Grid container spacing={4}>
        {/* Left Profile Section */}
        <Grid item xs={12} md={4}>
          <StyledPaper elevation={3}>
            <ProfileSection align="center">
              <StyledAvatar
                src={
                  profileImage ||
                  "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcTOYjBEK4eaJZnQcg651SM1OyzuzWXY9JZrqYM6fL0_BlEiZmSmDQst0lxjdKHDRRRTc2QdZCtF79H01fEb_u5eXQ"
                }
                alt="Admin"
              />
              <Typography
                variant="h5"
                sx={{ fontWeight: 600, color: "#1e3a8a" }}
              >
                {adminData.fullName}
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ mt: 1, fontSize: "0.9rem" }}
              >
                Last login: {new Date(adminData.lastLogin).toLocaleString()}
              </Typography>
            </ProfileSection>

            <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
              <Link to="/login">
                <CustomButton
                  variant="contained"
                  icon={LogoutIcon}
                  sx={{
                    mr: 2,
                    minWidth: "50px",
                    height: "50px",
                    width: "50px",
                    backgroundColor: "#ef4444",
                    "&:hover": { backgroundColor: "#dc2626" },
                  }}
                />
              </Link>
              <label
                htmlFor="image-upload"
                style={{
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  borderRadius: "50%",
                  width: "50px",
                  height: "50px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#1e40af")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#2563eb")
                }
              >
                <BackupIcon style={{ fontSize: "24px" }} />
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </Box>

            <Divider sx={{ mb: 2 }} />
            <Box sx={{ textAlign: "left" }}>
              <Typography
                variant="body1"
                sx={{ mb: 1, fontSize: "1rem", color: "#4b5563" }}
              >
                <strong>Email:</strong> {adminData.email}
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontSize: "1rem", color: "#4b5563" }}
              >
                <strong>Role:</strong> {adminData.role}
              </Typography>
            </Box>
          </StyledPaper>
        </Grid>

        {/* Right Details Section */}
        <Grid item xs={12} md={8}>
          <StyledPaper elevation={3}>
            <Typography
              variant="h4"
              sx={{ mb: 4, fontWeight: 600, color: "#1e3a8a" }}
            >
              My Profile Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <CustomInput
                  id="fullName"
                  label="Name"
                  value={adminData.fullName || ""}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomInput
                  id="email"
                  label="Email"
                  type="email"
                  value={adminData.email || ""}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomInput
                  id="dob"
                  label="Date of Birth"
                  type="date"
                  value={adminData.dob || ""}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomInput
                  id="phoneNumber"
                  label="Phone Number"
                  value={adminData.phoneNumber || ""}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomInput
                  id="designation"
                  label="Designation"
                  value={adminData.designation || ""}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomInput
                  id="role"
                  label="Role"
                  value={adminData.role || ""}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomInput
                  id="state"
                  label="State"
                  value={adminData.state || ""}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomInput
                  id="country"
                  label="Country"
                  value={adminData.country || ""}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>
            <StyledButton variant="contained" icon={SaveIcon}>
              Save Changes
            </StyledButton>
          </StyledPaper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Admin;