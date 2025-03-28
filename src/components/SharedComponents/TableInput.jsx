import React from "react";
import TextField from "@mui/material/TextField";

function TableInput({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  readOnly,
}) {
  return (
    <TextField
    size="small"
      id={id}
      name={name}
      label={label}
      placeholder={placeholder}
      readOnly={readOnly}
      variant="outlined"
      value={value}
      onChange={onChange}
      type={type}
      sx={{
        width: "220px", // Reduced width
        // height: "50px",
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
    />
  );
}

export default TableInput;
