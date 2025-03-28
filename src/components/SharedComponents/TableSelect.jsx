import React from "react";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

function TableSelect({ id, name, value, onChange, label, MenuItems = [] }) {
  const handleChange = (e) => {
    const { value } = e.target;
    onChange({ target: { name, value } }); // Pass the updated value correctly
  };

  return (
    <FormControl
      variant="outlined"
      size="small"
      sx={{
        minWidth: "100px", // Reduced width
        // height: "50px", // Reduced height
        marginBottom: "5px",
        borderRadius: "8px",
        "& .MuiOutlinedInput-root": {
          borderRadius: "8px",
          "& fieldset": {
            borderColor: "#1976d2",
            borderRadius: "8px",
          },
          "&:hover fieldset": {
            borderColor: "#1976d2",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#1976d2",
          },
        },
      }}
    >
      <InputLabel>{label}</InputLabel>
      <Select
        id={id}
        value={value || ""}
        onChange={handleChange}
        label={label}
        // sx={{ width: "100px", height: "100px" }} // Ensuring dropdown is also adjusted
      >
        {MenuItems.map((item, index) => (
          <MenuItem key={index} value={item.value}>
            {item.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default TableSelect;
