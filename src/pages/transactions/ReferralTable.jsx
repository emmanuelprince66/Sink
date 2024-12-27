import React from "react";
import {
  Table,
  Box,
  TableBody,
  TableCell,
  TableContainer,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  Button,
  TableHead,
  TableRow,
  CircularProgress,
  Typography,
  Divider,
} from "@mui/material";
import CustomPagination from "../../components/CustomPagination";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import { useState } from "react";
import CustomModal from "../../components/CustomModal";
import RefereeModal from "./RefereeModal";

const ReferralTable = ({
  referralDataTable,
  next,
  back,
  totalPages,
  currentPage,
  onPageChange,
  rowsPerPage,
  page,
  isLoading,
}) => {
  const [openRefereeModal, setOpenRefreeModal] = useState(false);
  const closeRefereeModal = () => setOpenRefreeModal(false);
  const [refereeData, setRefereeData] = useState(null);

  const handleOpenRefereeModal = (i) => {
    setRefereeData(referralDataTable[i]);
    setOpenRefreeModal(true);
  };
  return (
    <div className="w-full">
      {/* table */}
      <Box className="w-full">
        <TableContainer>
          <Table sx={{ minWidth: 100, padding: "8px" }}>
            <TableHead
              sx={{
                background: "#F8F8F8",
              }}
            >
              <TableRow>
                <TableCell>S/N</TableCell>
                <TableCell> Name</TableCell>
                <TableCell>Level</TableCell>
                <TableCell>Total Merchant Onboarded</TableCell>
                <TableCell>Total Earned</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <CircularProgress
                  size="4.2rem"
                  sx={{
                    color: "#02981D",
                    marginLeft: "auto",
                    padding: "1em",
                  }}
                />
              ) : referralDataTable &&
                Array.isArray(referralDataTable) &&
                referralDataTable?.length > 0 ? (
                referralDataTable?.map((item, i) => (
                  <TableRow key={item.id}>
                    <TableCell>{page * rowsPerPage + i + 1}</TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          fontWeight: "400",
                          fontSize: "16px",
                          color: "#5E5E5E",
                        }}
                      >
                        {item?.lastname} {item?.firstname}
                      </Typography>
                    </TableCell>
                    <TableCell>{item?.referral_count}</TableCell>
                    <TableCell>{item?.total_referal_balance}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleOpenRefereeModal(i)}
                        sx={{
                          background: "#FAFAFA",
                          borderRadius: "8px",
                          px: "15px",
                          border: "1px solid #C8C8C8",
                          color: "#02981D",
                          "&:hover": {
                            backgroundColor: "#FAFAFA",
                          },
                          textTransform: "capitalize",
                          fontWeight: "600",
                          fontSize: "14px",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <Groups2OutlinedIcon />
                        View Referees
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="7">No data found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      {/* table end */}
      <CustomPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        nextPageLink={next}
        prevPageLink={back}
      />

      {/* referees moda */}
      <CustomModal
        style="w-[50%]"
        open={openRefereeModal}
        closeModal={closeRefereeModal}
      >
        <RefereeModal
          referralDataTable={referralDataTable}
          refereeData={refereeData}
          closeRefereeModal={closeRefereeModal}
        />
      </CustomModal>
    </div>
  );
};

export default ReferralTable;
