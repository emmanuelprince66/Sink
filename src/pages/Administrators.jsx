import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import { Button } from "@mui/material";
import { useEffect, useState } from "react";

import {
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import CustomModal from "../components/CustomModal";
import CustomSuccessModal from "../components/CustomSuccessModal";

import { ToastContainer } from "react-toastify";
import { administratorDataUrl } from "../api/endpoint";
import useFetchData from "../hooks/useFetchData";
import AddAdministrator from "./adminstrator/AddAdministrator";
import EditAdministrator from "./adminstrator/EditAdministrator";

const Administrators = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [openAddAdminModal, setOpenAddAdminModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [openAdminInfo, setOpenAdminInfo] = useState(false);
  const [reFetchTeam, setRefetchTeam] = useState(false);
  const [filterValue, setFilterValue] = useState("all");

  const handleCloseAdminInfo = () => setOpenAdminInfo(false);
  const handleCloseSuccessModal = () => setSuccessModal(false);
  const handleCloseAddAdminModal = () => setOpenAddAdminModal(false);
  const [teamMemberModalData, setTeamMemberModalData] = useState(null);
  const [teamFilteredResult, setTeamFilteredResult] = useState(null);

  // fetch
  const apiUrl = administratorDataUrl();
  const queryKey = ["fetchTeam", apiUrl];

  const { isLoading, data: teamData, refetch } = useFetchData(queryKey, apiUrl);
  const handleShowTeamModal = (id) => {
    const teamMemberById = teamData?.find((item) => item?.id === id);
    setTeamMemberModalData(teamMemberById);
    setOpenAdminInfo(true);
  };

  useEffect(() => {
    if (teamData && Array.isArray(teamData)) {
      let filteredResult = teamData;
      if (filterValue !== "all") {
        filteredResult = filteredResult.filter((item) => {
          if (filterValue === "active") {
            return item.is_active;
          } else {
            return !item.is_active;
          }
        });
      }
      setTeamFilteredResult(filteredResult);
    }
  }, [filterValue, teamData, refetch]);

  useEffect(() => {
    refetch();
  }, [reFetchTeam, refetch]);

  return (
    <div className="w-full flex items-start gap-3 flex-col justify-center">
      <p className=" text-[#171717] font-[500] text-[20px] ">Adminstrator</p>

      <div className="flex w-full justify-end ">
        <Button
          onClick={() => setOpenAddAdminModal(true)}
          variant="contained"
          sx={{
            color: "#fff",
            background: "#02981D",
            display: "flex",
            alignItem: "center",
            gap: "5px",
            padding: ".6em",
            fontFamily: "Montserrat",
            boxShadow: "none",
            "&:hover": {
              background: "#02981d",
            },
          }}
        >
          <AddRoundedIcon />
          Add New Admin
        </Button>
      </div>

      <div className="bg-text_white w-full border-[0.1px] border-[#E3E3E3] rounded-md p-2 gap-3 flex flex-col items-start">
        <div className="w-[70%] flex items-center gap-3 my-4">
          <Button
            onClick={() => setFilterValue("all")}
            variant="outline"
            sx={{
              color: "#fff",
              background: "transparent",
              color: filterValue === "all" ? "#02981d" : "#C8C8C8",
              border:
                filterValue === "all"
                  ? "1px solid #02981D"
                  : "1px solid #C8C8C8",
              display: "flex",
              fontWeight: "600",
              padding: ".5em",
              px: ".9em",
              alignItems: "center",
              gap: "10px",
              boxShadow: "none",
              "&:hover": {
                background: "transparent",
              },
            }}
          >
            All Admins
          </Button>
          <Button
            onClick={() => setFilterValue("active")}
            variant="outline"
            sx={{
              color: "#fff",
              background: "transparent",
              color: filterValue === "active" ? "#02981d" : "#C8C8C8",
              border:
                filterValue === "active"
                  ? "1px solid #02981D"
                  : "1px solid #C8C8C8",
              display: "flex",
              fontWeight: "600",
              padding: ".5em",
              px: ".9em",
              alignItems: "center",
              gap: "10px",
              boxShadow: "none",
              "&:hover": {
                background: "transparent",
              },
            }}
          >
            Active
          </Button>
          <Button
            onClick={() => setFilterValue("inActive")}
            variant="outline"
            sx={{
              background: "transparent",
              color: filterValue === "inActive" ? "#02981d" : "#C8C8C8",
              border:
                filterValue === "inActive"
                  ? "1px solid #02981D"
                  : "1px solid #C8C8C8",
              display: "flex",
              fontWeight: "600",
              padding: ".5em",
              px: ".9em",
              alignItems: "center",
              gap: "10px",
              boxShadow: "none",
              "&:hover": {
                background: "transparent",
              },
            }}
          >
            Inactive
          </Button>
        </div>

        <div className="w-[70%] flex flex-col border-[0.1px] border-[#E3E3E3] rounded-md p-2 items-start ">
          {/* customers  */}
          <Box className="max-h-[87vh] overflow-y-auto w-full">
            <TableContainer component={Paper}>
              <Table
                sx={{
                  minWidth: "100%",
                  padding: "8px",
                }}
              >
                <TableBody>
                  {!teamFilteredResult ? (
                    <CircularProgress
                      size="4.2rem"
                      sx={{
                        color: "#02981D",
                        marginLeft: "auto",
                        padding: "1em",
                      }}
                    />
                  ) : teamFilteredResult &&
                    Array.isArray(teamFilteredResult) &&
                    teamFilteredResult?.length > 0 ? (
                    teamFilteredResult?.map((item, i) => (
                      <TableRow
                        key={item.id}
                        className="cursor-pointer"
                        // onClick={() => handleOpenCustomerProfile(i)}
                      >
                        <TableCell sx={{ width: "50px" }}>
                          {page * rowsPerPage + i + 1}
                        </TableCell>
                        <TableCell>
                          <div className="w-full gap-1 flex items-center">
                            <Typography
                              sx={{
                                fontWeight: "400",
                                fontSize: "16px",
                                color: "#828282",
                              }}
                            >
                              {item?.lastname} {item?.firstname}
                            </Typography>
                            <Typography
                              sx={{
                                fontWeight: "400",
                                fontSize: "14px",
                                color: "#5E5E5E",
                              }}
                            >
                              ({item?.role})
                            </Typography>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Box
                            onClick={() => handleShowTeamModal(item?.id)}
                            sx={{
                              cursor: "pointer",
                              width: "100%",
                              display: "flex",
                              justifyContent: "end",
                            }}
                          >
                            <ChevronRightOutlinedIcon />
                          </Box>
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
          {/* customers end */}
        </div>
      </div>

      {/* Add new admin modal */}
      <CustomModal open={openAddAdminModal}>
        <div className="flex flex-col items-start gap-3">
          <div className="flex items-center justify-between w-full mb-3">
            <p className="text-general font-[500] text-[20px] ">
              Add New Admin
            </p>

            <ClearRoundedIcon
              onClick={handleCloseAddAdminModal}
              sx={{ color: "#1E1E1E", cursor: "pointer" }}
            />
          </div>

          <AddAdministrator
            handleCloseAddAdminModal={handleCloseAddAdminModal}
            setRefetchTeam={setRefetchTeam}
          />
        </div>
      </CustomModal>
      {/* Add new admin modal ends */}

      {/* add admin success modal */}
      <CustomModal open={successModal}>
        <CustomSuccessModal
          close={handleCloseSuccessModal}
          textOne="Login instructions have been sent to example@domain.com."
        />
      </CustomModal>
      {/* add admin success modal ends */}

      {/* admin information modal */}
      {openAdminInfo && (
        <CustomModal open={openAdminInfo}>
          <div className="flex flex-col items-start gap-3">
            <div className="flex items-center justify-between w-full mb-3">
              <p className="text-general font-[500] text-[20px] ">
                Admin Information
              </p>

              <ClearRoundedIcon
                onClick={handleCloseAdminInfo}
                sx={{ color: "#1E1E1E", cursor: "pointer" }}
              />
            </div>

            <EditAdministrator
              handleCloseAdminInfo={handleCloseAdminInfo}
              teamMemberModalData={teamMemberModalData}
              setRefetchTeam={setRefetchTeam}
            />
          </div>
        </CustomModal>
      )}
      {/* admin information modal ends */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Administrators;
