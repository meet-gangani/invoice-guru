import React from "react";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

const filter = createFilterOptions();

export default function EntityAutocomplete({
  label,
  options,
  value,
  inputValue,
  allowAdd,
  onInputChange,
  onChange
}) {

  return (
    <Autocomplete
      fullWidth
      freeSolo={allowAdd}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      options={options}
      value={value}
      inputValue={inputValue}

      onInputChange={(_e, newValue) => {
        onInputChange(newValue);
      }}

      isOptionEqualToValue={(option, value) =>
        option?._id === value?._id
      }

      getOptionLabel={(option) => {
        if (typeof option === "string") return option;
        if (option?.inputValue) return option.inputValue;
        return option?.name || option?.mail || "";
      }}

      filterOptions={(options, params) => {
        const filtered = filter(options, params);

        if (!allowAdd) return filtered;

        const { inputValue } = params;

        const isExisting = options.some(
          (option) =>
            inputValue.toLowerCase() ===
            (option.name || "").toLowerCase()
        );

        if (inputValue !== "" && !isExisting) {
          filtered.push({
            inputValue: inputValue,
            name: `Add "${inputValue}"`
          });
        }

        return filtered;
      }}

      onChange={(_e, newValue) => {
        onChange(newValue);
      }}

      renderInput={(params) => (
        <TextField
            {...params}
            label={label}
            sx={{
            "& .MuiOutlinedInput-root.Mui-focused": {
                boxShadow: "0 0 0 2px rgba(25,118,210,0.2)"
            }
            }}
        />
        )}
    />
  );
}