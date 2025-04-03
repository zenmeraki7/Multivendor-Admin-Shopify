import React, { useState } from "react";
import { Box, Paper, Tabs, Tab } from "@mui/material";
import ApprovedProducts from "../components/Products/ApprovedProducts";
import PendingProducts from "../components/Products/PendingProducts";

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const ProductList = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box padding={2}>
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="product management tabs"
          variant="fullWidth"
        >
          <Tab
            label="Approved Products"
            id="product-tab-0"
            aria-controls="product-tabpanel-0"
          />
          <Tab
            label="Pending Products"
            id="product-tab-1"
            aria-controls="product-tabpanel-1"
          />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <ApprovedProducts />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <PendingProducts />
      </TabPanel>
    </Box>
  );
};

export default ProductList;
