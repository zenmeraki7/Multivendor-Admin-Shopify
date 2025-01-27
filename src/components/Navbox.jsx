import React, { useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssuredWorkloadIcon from "@mui/icons-material/AssuredWorkload";
import PeopleIcon from "@mui/icons-material/People";
import WidgetsIcon from "@mui/icons-material/Widgets";
import AssignmentIcon from "@mui/icons-material/Assignment";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import PublicIcon from "@mui/icons-material/Public";
import ApartmentIcon from "@mui/icons-material/Apartment";
import SettingsIcon from "@mui/icons-material/Settings";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import EmailIcon from "@mui/icons-material/Email";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import CardTravelIcon from "@mui/icons-material/CardTravel";
import { useNavigate } from "react-router-dom";

function Navbox() {
  const [expanded, setExpanded] = useState("");
  const navigate = useNavigate();

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : "");
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { text: "Sellers", icon: <PeopleIcon />, path: "/sellers" },
    { text: "Orders", icon: <AssignmentIcon />, path: "/orders" },
    { text: "User Details", icon: <PeopleIcon />, path: "/user" },
    { text: "Transactions", icon: <MonetizationOnIcon />, path: "/transactions" },
    { text: "Reviews", icon: <AssignmentIcon />, path: "/reviews" },
    {
      text: "Product Management",
      icon: <WidgetsIcon />,
      subItems: [
        { text: "Product Option", path: "" },
        { text: "Product Tags", path: "" },
        { text: "Product Types", path: "" },
        { text: "Collections", path: "" },
        { text: "Import Products", path: "" },
        { text: "Product Form Customization", path: "" },
        { text: "Dual Sync Products", path: "" },
        { text: "Batch CVs", path: "" },


      ],
    },
    { text: "Product Management", icon: <WidgetsIcon />, path: "/product-list" },
    {
      text: "Manage Categories",
      icon: <WidgetsIcon />,
      subItems: [
        { text: "Category-Type", path: "/category-type" },
        { text: "Category", path: "/category" },
        { text: "Subcategory", path: "/sub-category" },
      ],
    },
    { text: "Bank Management", icon: <AssuredWorkloadIcon />, path: "/bank-management" },
    { text: "Country Management", icon: <PublicIcon />, path: "/country-management" },
    { text: "State Management", icon: <ApartmentIcon />, path: "/state-management" },
    {
      text: "Settings",
      icon: <SettingsIcon />,
      subItems: [
        {
          text: "General Settings",
          icon: <SettingsSuggestIcon />,
        },
        {
          text: "Merchant Settings",
          icon: <BusinessCenterIcon />,
          subItems: [
            { text: "-Company Details", path: "/company-details" },
            { text: "Billing & Invoice", path: "/billing-invoice" },
            { text: "Warehouses", path: "/warehouses" },
            { text: "Shipping Partners", path: "/shipping-partners" },
            { text: "Users & Permissions", path: "/users-permissions" },
          ],
        },
        {
          text: "Message Integrations",
          icon: <EmailIcon />,
          subItems: [
            { text: "-Email Configuration", path: "/email-configuration" },
          ],
        },
        { text: "Multi Vendor Settings", icon: <SettingsIcon />, path: "/settings/multi-vendor" },
        { text: "Shop Settings", icon: <AddBusinessIcon />, path: "/settings/shop" },
        { text: "Subscription and Billing", icon: <CardTravelIcon />, path: "/settings/billing" },
      ],
    },
  ];

  const renderMenuItems = (items, depth = 0) =>
    items.map((item) => (
      <React.Fragment key={item.text}>
        {item.subItems ? (
          <Accordion
            elevation={0}
            expanded={expanded === item.text}
            onChange={handleAccordionChange(item.text)}
            sx={{
              ml: depth * 2, // Indent submenus
              backgroundColor: "transparent",
              boxShadow: "none",
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <Typography>{item.text}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List disablePadding>{renderMenuItems(item.subItems, depth + 1)}</List>
            </AccordionDetails>
          </Accordion>
        ) : (
          <ListItem disablePadding sx={{ pl: depth * 2 }}>
            <ListItemButton
              onClick={() => item.path && navigate(item.path)}
              sx={{
                "&:hover": { backgroundColor: "#e0e7eb" },
                transition: "background-color 0.3s",
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: "normal",
                  color: "#556b78",
                }}
              />
            </ListItemButton>
          </ListItem>
        )}
      </React.Fragment>
    ));

  return (
    <Box
      sx={{
        width: 300,
        backgroundColor: "#f0f4f8",
        height: "100vh",
        boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)",
        display: "flex",
        flexDirection: "column",
        pt: 2,
        overflow:"scroll"
      }}
    >
      <List>{renderMenuItems(menuItems)}</List>
    </Box>
  );
}

export default Navbox;
