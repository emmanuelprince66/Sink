import React from 'react'
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import CircularProgress from "@mui/material/CircularProgress";
import HourglassBottomOutlinedIcon from "@mui/icons-material/HourglassBottomOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
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
  Typography,
  Divider,
} from "@mui/material";
import CustomPagination from '../../components/CustomPagination';
import ReportOutlinedIcon from "@mui/icons-material/ReportOutlined";
const TransactionTable = ({transactionsData , isLoading , filteredTrxData , currentPage ,
    totalPages ,onPageChange,
    rowsPerPage,
    page    
}) => {
  return (
    <>
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
                    <TableCell> User</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Amount(N)</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!transactionsData?.results ||
                  isLoading ||
                  !filteredTrxData ? (
                    <CircularProgress
                      size="4.2rem"
                      sx={{
                        color: "#02981D",
                        marginLeft: "auto",
                        padding: "1em",
                      }}
                    />
                  ) : filteredTrxData &&
                    Array.isArray(filteredTrxData) &&
                    filteredTrxData?.length > 0 ? (
                    filteredTrxData?.map((item, i) => (
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
                        <TableCell>{item?.description}</TableCell>
                        <TableCell>{item?.amount}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              textTransform: "capitalize",
                              background:
                                item?.status.toLowerCase() === "failed"
                                  ? "#FFF0F0"
                                  : item?.status.toLowerCase() === "success"
                                  ? "#EBFFF3"
                                  : item?.status.toLowerCase() === "pending"
                                  ? "#FFF0F0"
                                  : item?.status.toLowerCase() === "processing"
                                  ? "#F4F1FE"
                                  : "",
                              color:
                                item?.status.toLowerCase() === "failed"
                                  ? "#E52929"
                                  : item?.status.toLowerCase() === "success"
                                  ? "#1E854A"
                                  : item?.status.toLowerCase() === "pending"
                                  ? "#CDA11E"
                                  : item?.status.toLowerCase() === "processing"
                                  ? "#391E85"
                                  : "",
                              fontWeight: "500",
                              fontSize: "12px",
                              padding: "4px 8px",
                              borderRadius: "8px",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              gap: "5px",
                              border: "1px solid #E0E0E0",
                            }}
                          >
                            {item?.status.toLowerCase() === "failed" && (
                              <ReportOutlinedIcon sx={{ fontSize: "12px" }} />
                            )}
                            {item?.status.toLowerCase() === "success" && (
                              <CheckCircleOutlineRoundedIcon
                                sx={{ fontSize: "12px" }}
                              />
                            )}
                            {item?.status.toLowerCase() === "processing" && (
                              <CheckCircleOutlineRoundedIcon
                                sx={{ fontSize: "12px" }}
                              />
                            )}
                            {item?.status.toLowerCase() === "pending" && (
                              <HourglassBottomOutlinedIcon
                                sx={{ fontSize: "12px" }}
                              />
                            )}

                            {item?.status.toLowerCase()}
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Button
                          onClick={() => handleOpenModal(item)}
                            variant="outlined"
                            sx={{
                              textTransform: "capitalize",
                              display: "flex",
                              gap: "4px",
                              width: "100px",
                              alignItems: "center",
                              color: "#3F3767",
                              fontWeight: "400",
                              fontSize: "10px",
                              border: "1px solid #3F3767",
                              "&:hover": {
                                backgroundColor: "#fafafa",
                                border: "1px solid #E0E0E0",
                              },
                              // lineHeight: "26.4px",
                            }}
                          >
                            View More
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
            nextPageLink={transactionsData?.links?.next}
            prevPageLink={transactionsData?.links?.previous}
          /> 
    </>
  )
}

export default TransactionTable
