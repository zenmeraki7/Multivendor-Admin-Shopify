import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Avatar,
  Box,
  Divider,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/baseUrl";
import toast from "react-hot-toast";

// Import your logo (replace with your actual logo path)
// import logo from "./logo.png"; // Adjust the path to your logo

function Header() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Handle logout confirmation modal open
  const handleOpen = () => {
    setOpen(true);
  };

  // Handle modal close
  const handleClose = () => {
    setOpen(false);
  };

  // Handle logout functionality
  const handleLogout = async () => {
    try {
      await axios.post(`${BASE_URL}/shopify/logout`, {}, { withCredentials: true });
      window.location.href = "https://partners.shopify.com/organizations"; // Redirect user to login page
    } catch (error) {
      toast.error("Logout failed");
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <AppBar
        position="static"
        sx={{
          background: "linear-gradient(45deg, #A45EE5, #7C4DFF)",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Toolbar>
          {/* Logo and Store Name */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexGrow: 1,
              cursor: "pointer",
            }}
            onClick={() => navigate("/")} // Navigate to home on logo click
          >
            <Avatar
              src={
                "https://lh3.googleusercontent.com/a/ACg8ocJ-t5Nzx9TP62xZ2hQJJDIXrCdMxMSpIOSTvZbahr4gZFp3U_nw=s360-c-no"
              }
              alt="Zen Store Logo"
              sx={{ width: 40, height: 40, mr: 2, border: "2px solid #fff" }}
            />
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                fontFamily: "'Poppins', sans-serif",
                color: "#fff",
              }}
            >
              Zen Store Admin
            </Typography>
          </Box>

          {/* Divider */}
          <Divider
            orientation="vertical"
            flexItem
            sx={{ backgroundColor: "#fff", mx: 2 }}
          />

          {/* Notifications Icon */}
          <IconButton
            color="inherit"
            sx={{
              mr: 2,
              transition: "transform 0.2s",
              "&:hover": {
                transform: "scale(1.1)",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <NotificationsIcon />
          </IconButton>

          {/* Profile Icon */}
          <IconButton
            color="inherit"
            sx={{
              mr: 2,
              transition: "transform 0.2s",
              "&:hover": {
                transform: "scale(1.1)",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
            onClick={() => navigate("/admin")}
          >
            <PersonIcon />
          </IconButton>

          {/* Logout Button */}
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            sx={{
              textTransform: "none",
              fontWeight: "bold",
              fontFamily: "'Poppins', sans-serif",
              transition: "background-color 0.2s",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
            onClick={handleOpen}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Logout Confirmation Modal */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle sx={{ fontFamily: "'Poppins', sans-serif" }}>
          Confirm Logout
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontFamily: "'Poppins', sans-serif" }}>
            Are you sure you want to log out?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            color="primary"
            sx={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleLogout}
            color="error"
            sx={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Header;
