import React from "react";
import { Button } from "@mui/material";
import KeyboardBackspaceRoundedIcon from "@mui/icons-material/KeyboardBackspaceRounded";
import EastRoundedIcon from "@mui/icons-material/EastRounded";

const PageNumberPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  maxPageNumbersToShow = 10,
}) => {
  const handlePageClick = (pageNumber) => {
    if (typeof pageNumber === "number") {
      onPageChange(pageNumber);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const startPage = Math.max(
      1,
      currentPage - Math.floor(maxPageNumbersToShow / 2)
    );
    const endPage = Math.min(totalPages, startPage + maxPageNumbersToShow - 1);

    if (startPage > 1) {
      pageNumbers.push(1);
      if (startPage > 2) {
        pageNumbers.push("...");
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push("...");
      }
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
      {getPageNumbers().map((pageNumber, index) => (
        <button
          key={index}
          onClick={() => handlePageClick(pageNumber)} // Update pageNumber click handling
          style={{
            padding: "8px",
            borderRadius: "4px",
            fontSize: "14px",
            background: currentPage === pageNumber ? "#FEF2E6" : "transparent",
            color: currentPage === pageNumber ? "#F78105" : "#667085",
            fontWeight: currentPage === pageNumber ? "bold" : "normal",
            cursor: pageNumber === "..." ? "default" : "pointer",
          }}
          disabled={pageNumber === "..."}
        >
          {pageNumber}
        </button>
      ))}
    </div>
  );
};

export const CustomPagination = ({ currentPage, totalPages, onPageChange }) => {
  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleBack = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  return (
    <div className="flex items-center w-full justify-between mt-5">
      <Button
        onClick={handleBack}
        disabled={currentPage === 1}
        sx={{
          background: "transparent",
          borderRadius: "8px",
          width: "100px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: "15px",
          border: "1px solid #5E5E5E",
          color: "#5E5E5E",
          "&:hover": {
            backgroundColor: "#FAFAFA",
          },
          textTransform: "capitalize",
          fontWeight: "400",
        }}
      >
        <KeyboardBackspaceRoundedIcon />
        Back
      </Button>

      <PageNumberPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />

      <Button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        sx={{
          background: "transparent",
          borderRadius: "8px",
          width: "100px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: "15px",
          border: "1px solid #5E5E5E",
          color: "#5E5E5E",
          "&:hover": {
            backgroundColor: "#FAFAFA",
          },
          textTransform: "capitalize",
          fontWeight: "400",
        }}
      >
        Next
        <EastRoundedIcon />
      </Button>
    </div>
  );
};

export default CustomPagination;
