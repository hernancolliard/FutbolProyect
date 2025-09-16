import React from "react";
import MuiPagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <Stack alignItems="center" sx={{ mt: 4 }}>
      <MuiPagination
        count={totalPages}
        page={currentPage}
        onChange={(_, page) => onPageChange(page)}
        color="primary"
        showFirstButton
        showLastButton
      />
    </Stack>
  );
};

export default Pagination;
