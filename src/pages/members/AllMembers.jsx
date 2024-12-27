import React from "react";
import CustomCard from "../../components/CustomCard";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { Button } from "@mui/material";
import { useState } from "react";
import {
  Table,
  Box,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Paper,
  Grid,
  Container,
  TextField,
  TablePagination,
  ToggleButtonGroup,
  ToggleButton,
  Card,
  Typography,
  Modal,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import CustomPagination from "../../components/CustomPagination";
const AllMembers = ({
  searchValue,
  setShowComp,
  currentPage,
  setMemberId,
  filterValue,
  setSearchValue,
  handlePageChange,
  totalPages,
  setFilterValue,
  data,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const navigate = useNavigate();

  const handleNavigateMember = (id) => {
    setShowComp("profile");
    setMemberId(id);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchValue(val);
  };
  return (
    <>
      <div className="w-full flex items-start gap-3 flex-col justify-center">
        <div className="flex items-center gap-2">
          <p className=" text-[#171717] font-[600] text-[20px] ">Merchants</p>
          <div className="flex items-center gap-1">
            (
            <div className="flex gap-1">
              <span className="font-[500] text-[#171717] text-[14px]  ">
                {data?.total}{" "}
              </span>
              <p className="font-normal text-[#171717] text-[14px]">Total</p>
            </div>
            {/* <div className="flex gap-1">
              <span className="font-[500] text-[#171717] text-[14px]  ">
                1,9970
              </span>
              <p className="font-normal text-[#171717] text-[14px]">Total</p>
            </div> */}
            )
          </div>
        </div>

        {/* card */}
        <CustomCard style="w-full">
          <div className="w-full flex items-start gap-4 flex-col ">
            {/* search */}

            <div className="bg-white border-[#E3E3E3] border-[1px] w-[40%] py-2 px-2 flex items-center gap-2 rounded-md">
              <SearchOutlinedIcon sx={{ color: "#757575" }} />
              <input
                value={searchValue}
                onChange={(e) => handleSearchChange(e)}
                type="text"
                placeholder="Search member , ID"
                className="bg-transparent border-none focus:outline-none outline-none  w-full"
              />
            </div>
            {/* search */}

            {/* filter */}

            <div className="flex items-center gap-5 w-[70%]">
              <Button
                onClick={() => setFilterValue("")}
                sx={{
                  background: filterValue === "" ? "#FAFAFA" : "#fff",
                  borderRadius: "8px",
                  width: "100%",
                  px: "15px",
                  border:
                    filterValue === ""
                      ? "1px solid #02981D"
                      : "1px solid #5E5E5E",
                  color: filterValue === "" ? "#02981D" : "#5E5E5E",
                  "&:hover": {
                    backgroundColor: filterValue === "" ? "#FAFAFA" : "#fff",
                  },
                  textTransform: "capitalize",
                  fontWeight: "400",
                }}
              >
                All Merchants
              </Button>
              <Button
                onClick={() => setFilterValue("Free Trial")}
                sx={{
                  background: filterValue === "Free Trial" ? "#FAFAFA" : "#fff",
                  borderRadius: "8px",
                  width: "100%",
                  px: "15px",
                  border:
                    filterValue === "Free Trial"
                      ? "1px solid #02981D"
                      : "1px solid #5E5E5E",
                  color: filterValue === "Free Trial" ? "#02981D" : "#5E5E5E",
                  "&:hover": {
                    backgroundColor:
                      filterValue === "Free Trial" ? "#FAFAFA" : "#fff",
                  },
                  textTransform: "capitalize",
                  fontWeight: "400",
                }}
              >
                Free Trial
              </Button>
              <Button
                onClick={() => setFilterValue("Basic Plan")}
                sx={{
                  background: filterValue === "Basic Plan" ? "#FAFAFA" : "#fff",
                  borderRadius: "8px",
                  width: "100%",
                  px: "15px",
                  border:
                    filterValue === "Basic Plan"
                      ? "1px solid #02981D"
                      : "1px solid #5E5E5E",
                  color: filterValue === "Basic Plan" ? "#02981D" : "#5E5E5E",
                  "&:hover": {
                    backgroundColor:
                      filterValue === "Basic Plan" ? "#FAFAFA" : "#fff",
                  },
                  textTransform: "capitalize",
                  fontWeight: "400",
                }}
              >
                Basic Plan
              </Button>

              <Button
                onClick={() => setFilterValue("Sync Plus")}
                sx={{
                  background: filterValue === "Sync Plus" ? "#FAFAFA" : "#fff",
                  borderRadius: "8px",
                  width: "100%",
                  px: "15px",
                  border:
                    filterValue === "Sync Plus"
                      ? "1px solid #02981D"
                      : "1px solid #5E5E5E",
                  color: filterValue === "Sync Plus" ? "#02981D" : "#5E5E5E",
                  "&:hover": {
                    backgroundColor:
                      filterValue === "Sync Plus" ? "#FAFAFA" : "#fff",
                  },
                  textTransform: "capitalize",
                  fontWeight: "400",
                }}
              >
                Sync Plus
              </Button>
              <Button
                onClick={() => setFilterValue("Sync Pro")}
                sx={{
                  background: filterValue === "Sync Pro" ? "#FAFAFA" : "#fff",
                  borderRadius: "8px",
                  width: "100%",
                  px: "15px",
                  border:
                    filterValue === "Sync Pro"
                      ? "1px solid #02981D"
                      : "1px solid #5E5E5E",
                  color: filterValue === "Sync Pro" ? "#02981D" : "#5E5E5E",
                  "&:hover": {
                    backgroundColor:
                      filterValue === "Sync Pro" ? "#FAFAFA" : "#fff",
                  },
                  textTransform: "capitalize",
                  fontWeight: "400",
                }}
              >
                Sync Pro
              </Button>
              <Button
                onClick={() => setFilterValue("Inactive")}
                sx={{
                  background: filterValue === "Inactive" ? "#FAFAFA" : "#fff",
                  borderRadius: "8px",
                  width: "100%",
                  px: "15px",
                  border:
                    filterValue === "Inactive"
                      ? "1px solid #02981D"
                      : "1px solid #5E5E5E",
                  color: filterValue === "Sync Pro" ? "#02981D" : "#5E5E5E",
                  "&:hover": {
                    backgroundColor:
                      filterValue === "Inactive" ? "#FAFAFA" : "#fff",
                  },
                  textTransform: "capitalize",
                  fontWeight: "400",
                }}
              >
                Inactive
              </Button>
            </div>
            {/* filterValue */}

            {/* Table */}

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
                      <TableCell>Phone Number</TableCell>
                      <TableCell>Email Address</TableCell>
                      <TableCell>Membership Status</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {!data?.results ? (
                      <CircularProgress
                        size="4.2rem"
                        sx={{
                          color: "#02981D",
                          marginLeft: "auto",
                          padding: "1em",
                        }}
                      />
                    ) : data?.results &&
                      Array.isArray(data?.results) &&
                      data?.results?.length > 0 ? (
                      data?.results?.map((item, i) => (
                        <TableRow key={item.id}>
                          <TableCell>{page * rowsPerPage + i + 1}</TableCell>
                          <TableCell>
                            <Typography
                              sx={{
                                fontWeight: "400",
                                fontSize: "16px",
                                color: "#828282",
                              }}
                            >
                              {item?.lastname} {item?.firstname}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              sx={{
                                fontWeight: "400",
                                fontSize: "16px",
                                color: "#828282",
                              }}
                            >
                              {item?.phone}
                            </Typography>
                          </TableCell>
                          <TableCell>{item?.email}</TableCell>
                          <TableCell>
                            <Typography
                              sx={{
                                color:
                                  item?.membership_status?.toLowerCase() ===
                                  "active"
                                    ? "#208637"
                                    : "#E52929",
                                fontWeight: "500",
                                fontSize: "12px",
                                background:
                                  item?.membership_status?.toLowerCase() ===
                                  "active"
                                    ? "#EBFFF3"
                                    : "#FBEBEC",
                                py: "5px",
                                borderRadius: "10px",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                justifyContent: "center",
                                width: "80px",
                              }}
                            >
                              {item?.membership_status?.toLowerCase() ===
                              "active" ? (
                                <span className="w-[10px] h-[10px] rounded-full  bg-primary_green" />
                              ) : (
                                <span className="w-[10px] h-[10px] rounded-full  bg-[#E52929]" />
                              )}
                              {item?.membership_status?.toLowerCase()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Button
                              onClick={() => handleNavigateMember(item?.id)}
                              variant="outlined"
                              sx={{
                                textTransform: "capitalize",
                                display: "flex",
                                gap: "4px",
                                width: "100px",
                                alignItems: "center",
                                color: "#02981d",
                                fontWeight: "400",
                                fontSize: "10px",
                                border: "1px solid #02981d",
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
            {/* Table */}

            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </CustomCard>
        {/* card */}
      </div>
    </>
  );
};

export default AllMembers;
