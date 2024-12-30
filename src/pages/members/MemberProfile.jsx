import React from "react";
import { useState } from "react";
import mSeven from "../../assets/member-profile/m-7.svg";
import mOne from "../../assets/member-profile/m-1.svg";
import mTwo from "../../assets/member-profile/m-2.svg";
import mThree from "../../assets/member-profile/m-3.svg";
import mFour from "../../assets/member-profile/m-4.svg";
import mFive from "../../assets/member-profile/m-5.svg";
import mSix from "../../assets/member-profile/m-6.svg";
import mTen from "../../assets/member-profile/m-10.svg";
import mEl from "../../assets/member-profile/m-11.svg";
import mEight from "../../assets/member-profile/m-8.svg";
import mNine from "../../assets/member-profile/m-9.svg";
import avatar from "../../assets/member-profile/avatar.png";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import { Skeleton } from "@mui/material";
import SouthWestRoundedIcon from "@mui/icons-material/SouthWestRounded";
import NorthEastRoundedIcon from "@mui/icons-material/NorthEastRounded";
import WestOutlinedIcon from "@mui/icons-material/WestOutlined";

import CustomCard from "../../components/CustomCard";
import { Grid, Typography, Switch, CircularProgress } from "@mui/material";
import {
  Table,
  Box,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useParams } from "react-router-dom";
import FormattedPrice from "../../utils/FormattedPrice";
import formattedDate from "../../utils/formattedDate";
import useFetchData from "../../hooks/useFetchData";
import { membersProfileUrl } from "../../api/endpoint";
import CustomModal from "../../components/CustomModal";
import CorporativeSavingsModal from "./CorporativeSavingsModal";
import PersonalSavingsModal from "./PersonalSavingsModal";
import InvestmentDetailsModal from "./InvestmentDetailsModal";
import RefereeModal from "../transactions/RefereeModal";

const MemberProfile = ({ close, memberId, type }) => {
  const [openRefereeModal, setOpenRefreeModal] = useState(false);

  console.log(memberId);

  const closeRefereeModal = () => setOpenRefreeModal(false);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [openCorporateSavingsModal, setOpenCorporateSavingsModal] =
    useState(false);
  const handleCloseCoModal = () => setOpenCorporateSavingsModal(false);
  const [showInvDetailsModal, setShowInvDetailsModal] = useState(false);
  const handleCloseInvDetailsModal = () => setShowInvDetailsModal(false);

  const [openPersonalModal, setOpenPersonalModal] = useState(false);
  const handleClosePersonal = () => setOpenPersonalModal(false);

  const apiUrl = membersProfileUrl(memberId);
  const queryKey = ["fetchMembersProfile", apiUrl];

  const { data, error, isLoading } = useFetchData(queryKey, apiUrl);

  console.log("case", data);

  const refereeData = data || [];

  return (
    <div className="flex items-start flex-col gap-3">
      {/*  */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-1 cursor-pointer hover:underline"
          onClick={close}
        >
          <img src={mSeven} alt="" />
          <p className="text-[14px]  text-[#17171]">{type}</p>
        </div>
        <ChevronRightOutlinedIcon sx={{ color: "#919191", pt: "2px" }} />
        <div className="flex items-center gap-1">
          <img src={mOne} alt="" className="w-[12px] h-[12px]" />
          <p className="text-[14px]  text-[#17171]">
            {data?.lastname || ""} {data?.firstname || ""}
          </p>
        </div>
      </div>
      {/*  */}

      <div className="flex gap-2 items-center">
        <WestOutlinedIcon
          onClick={close}
          sx={{ color: "#919191", pt: "2px", cursor: "pointer" }}
        />
        <p className="text-[#171717] text-[20px] font-[600]">
          {data?.lastname} {data?.firstname}
        </p>
      </div>

      {/* card 1 */}

      {false ? (
        <Skeleton variant="rounded" width="100%" height={250} />
      ) : (
        <CustomCard style="w-full">
          <div className="w-full bg-white">
            <div className="flex gap-4 items-end ">
              <div className="flex flex-col items-start gap-6">
                <p className="text-general font-[500] text-[16px] ">
                  Personal Details
                </p>

                <div className="max-h-[100px] max-w-[100px]">
                  <img src={data?.profile_picture || ""} className="" alt="" />
                </div>
              </div>
              <div className="flex flex-col gap-3 items-start">
                <div className="flex gap-3 items-center">
                  <img src={mOne} alt="" />
                  <div className="flex flex-col items-start gap-1">
                    <p className="text-primary_grey_2 text-[12px] ">
                      Surname / Lastname
                    </p>
                    <p className="text-general text-[16px] ">
                      {data?.lastname}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-center">
                  <img src={mOne} alt="" />
                  <div className="flex flex-col items-start gap-1">
                    <p className="text-primary_grey_2 text-[12px] ">
                      First Name
                    </p>
                    <sp className="text-general text-[16px] ">
                      {data?.firstname}
                    </sp>
                  </div>
                </div>
                <div className="flex gap-3 items-center">
                  <img src={mTwo} alt="" />
                  <div className="flex flex-col items-start gap-1">
                    <p className="text-primary_grey_2 text-[12px] ">
                      Phone Number
                    </p>
                    <p className="text-general text-[16px] ">{data?.phone}</p>
                  </div>
                </div>
                <div className="flex gap-3 items-center">
                  <img src={mThree} alt="" />
                  <div className="flex flex-col items-start gap-1">
                    <p className="text-primary_grey_2 text-[12px] ">Email</p>
                    <p className="text-general text-[16px] ">{data?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CustomCard>
      )}

      {/* card 1 */}

      {/* card 2 */}
      <Grid container spacing={2}>
        <Grid item xs={6}>
          {false ? (
            <Skeleton variant="rounded" width="100%" height={410} />
          ) : (
            <CustomCard style="w-full h-full">
              <div className="bg-text_white">
                <div className="flex flex-col items-start gap-4">
                  <p className="text-general font-[500] text-[16px] ">
                    Account Information{" "}
                  </p>

                  <div className="flex flex-col gap-3 items-start">
                    <div className="flex gap-3 items-center mb-2">
                      <img src={mNine} alt="" />
                      <div className="flex flex-col items-start gap-2">
                        <p className="text-primary_grey_2 text-[12px] ">Name</p>
                        <p className="text-general text-[16px]">
                          {data?.lastname} {data?.firstname}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-center mb-2">
                      <img src={mFour} alt="" />
                      <div className="flex flex-col items-start gap-2">
                        <p className="text-primary_grey_2 text-[12px] ">
                          Business Name :
                        </p>
                        <Typography
                          sx={{
                            color:
                              data?.membership_status?.toLowerCase() ===
                              "active"
                                ? "#208637"
                                : "#E52929",
                            fontWeight: "500",
                            fontSize: "12px",
                            background:
                              data?.membership_status?.toLowerCase() ===
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
                          {data?.membership_status?.toLowerCase() ===
                          "active" ? (
                            <span className="w-[10px] h-[10px] rounded-full  bg-primary_green" />
                          ) : (
                            <span className="w-[10px] h-[10px] rounded-full  bg-[#E52929]" />
                          )}
                          {data?.membership_status?.toLowerCase()}
                        </Typography>
                      </div>
                    </div>
                    <div className="flex gap-3 items-center mb-2">
                      <img src={mFour} alt="" />
                      <div className="flex flex-col items-start gap-2">
                        <p className="text-primary_grey_2 text-[12px] ">
                          Business Type :
                        </p>
                        <p className="text-general text-[16px] ">
                          {data?.membership_id}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-center">
                      <img src={mFive} alt="" />
                      <div className="flex flex-col items-start gap-2 mb-2">
                        <p className="text-primary_grey_2 text-[12px] ">
                          Country
                        </p>
                        <p className="text-general text-[16px] ">
                          {data?.tier}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-center mb-2">
                      <img src={mSix} alt="" />
                      <div className="flex flex-col items-start gap-2 mb-2">
                        <p className="text-primary_grey_2 text-[12px] ">
                          Currency
                        </p>
                        <p className="text-general text-[16px] ">
                          {formattedDate(data?.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-center">
                      <img src={mSix} alt="" />
                      <div className="flex flex-col items-start gap-1">
                        <p className="text-primary_grey_2 text-[12px] ">
                          State
                        </p>
                        <p className="text-general text-[16px] ">-</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-center">
                      <img src={mSix} alt="" />
                      <div className="flex flex-col items-start gap-1">
                        <p className="text-primary_grey_2 text-[12px] ">
                          Address.
                        </p>
                        <p className="text-general text-[16px] ">-</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-center">
                      <img src={mEight} alt="" />
                      <div className="flex  items-center gap-1">
                        <p className="text-primary_red text-[16px] ">
                          Disable Account
                        </p>

                        <Switch
                          sx={{
                            "& .MuiSwitch-switchBase.Mui-checked": {
                              color: "#fff",
                              // "&:hover": {
                              //   backgroundColor: alpha(
                              //     pink[600],
                              //     theme.palette.action.hoverOpacity
                              //   ),
                              // },
                            },
                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                              {
                                backgroundColor: "#E52929",
                              },
                          }}
                          defaultChecked
                          color="default"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CustomCard>
          )}
        </Grid>

        <Grid item xs={6}>
          <div className="h-full w-full flex items-center flex-col gap-2">
            {false ? (
              <Skeleton variant="rounded" width="100%" height={200} />
            ) : (
              <CustomCard style="w-full h-full">
                <div className="w-full flex items-start flex-col gap-2">
                  <p className="text-general font-[500] text-[16px] mb-3">
                    Inventory, Customer, Expenses and Supplier
                  </p>

                  <div className="w-full flex justify-between items-center">
                    <div className="flex-col flex items-start gap-1">
                      <p className="text-[14px] text-primary_grey_2">
                        Total Inventory :
                      </p>
                      <p className="text-general font-[600] text-[24px] ">
                        <FormattedPrice amount={data?.total_coop_savings} />
                      </p>
                      <span
                        className="flex gap-3 items-center cursor-pointer"
                        onClick={() => setOpenCorporateSavingsModal(true)}
                      >
                        <p className="text-primary_green text-[12px] font-[500]">
                          View Inventory
                        </p>

                        <ChevronRightOutlinedIcon sx={{ color: "#02981D" }} />
                      </span>
                    </div>
                    <div className="min-h-[5rem] w-[1px] bg-[#E3E3E3]"></div>
                    <div className="flex-col flex items-start gap-1">
                      <p className="text-[14px] text-primary_grey_2">
                        Total Customers :
                      </p>
                      <p className="text-general font-[600] text-[24px] ">
                        <FormattedPrice amount={data?.total_savings} />
                      </p>
                      <span
                        className="flex gap-3 items-center cursor-pointer"
                        onClick={() => setOpenPersonalModal(true)}
                      >
                        <p className="text-primary_green text-[12px] font-[500]">
                          See Details
                        </p>

                        <ChevronRightOutlinedIcon sx={{ color: "#02981D" }} />
                      </span>
                    </div>
                  </div>

                  <div className="w-full flex justify-between items-center">
                    <div className="flex-col flex items-start gap-1 mt-4">
                      <p className="text-[14px] text-primary_grey_2">
                        Total Expenses:
                      </p>
                      <p className="text-primary_red font-[600] text-[24px] ">
                        <FormattedPrice amount={data?.outstanding_loan} />
                      </p>
                      {/* <span className="flex gap-3 items-center cursor-pointer">
                      <p className="text-primary_green text-[12px] font-[500]">
                        Loan History
                      </p>

                      <ChevronRightOutlinedIcon sx={{ color: "#02981D " }} />
                    </span> */}
                    </div>
                    <div className="min-h-[5rem] w-[1px] bg-[#E3E3E3]"></div>

                    <div className="flex-col flex items-start gap-1">
                      <p className="text-[14px] text-primary_grey_2">
                        Total Supplier :
                      </p>
                      <p className="text-general font-[600] text-[24px] ">
                        <FormattedPrice amount={data?.total_investment} />
                      </p>
                      <span
                        className="flex gap-3 items-center cursor-pointer"
                        onClick={() => setShowInvDetailsModal(true)}
                      >
                        <p className="text-primary_green text-[12px] font-[500]">
                          See Details
                        </p>

                        <ChevronRightOutlinedIcon sx={{ color: "#02981D" }} />
                      </span>
                    </div>
                  </div>
                </div>
              </CustomCard>
            )}
            {false ? (
              <Skeleton variant="rounded" width="100%" height={200} />
            ) : (
              <CustomCard style="w-full h-full">
                <div className="w-full flex items-start flex-col gap-2">
                  <p className="text-general font-[500] text-[16px] mb-3">
                    Sales
                  </p>
                  <div className="flex gap-9 items-center">
                    <div className="flex items-start gap-3 flex-col">
                      <div className="flex gap-3 items-center">
                        <img src={mTen} alt="" />
                        <div className="flex flex-col items-start gap-1">
                          <p className="text-primary_grey_2 text-[12px] ">
                            Total sales :
                          </p>
                          <p className="text-general text-[16px] font-[600] ">
                            {data?.wages_point}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3 items-center">
                        <img src={mEl} alt="" />
                        <div className="flex flex-col items-start gap-1">
                          <p className="text-primary_grey_2 text-[12px] ">
                            Total revenue from sales :
                          </p>
                          <p className="text-general text-[16px] font-[600] ">
                            {data?.total_referal_balance}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3 items-center">
                        <img
                          src={mSeven}
                          alt=""
                          className="w-[20px] h-[20px]"
                        />
                        <div className="flex flex-col items-start gap-1">
                          <p className="text-primary_grey_2 text-[12px] ">
                            Total Profit :
                          </p>
                          <p className="text-general text-[16px] font-[600] ">
                            {data?.referal_count}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-10 items-start">
                      <div className="flex gap-3 items-center">
                        <div className="flex flex-col items-start gap-1">
                          <p className="text-primary_grey_2 text-[12px] ">
                            Total revenue from sales :
                          </p>
                          <p className="text-general text-[16px] font-[600] ">
                            {data?.referal_count}
                          </p>
                        </div>
                      </div>

                      <span
                        className="flex gap-3 items-center cursor-pointer"
                        onClick={() => setOpenRefreeModal(true)}
                      >
                        <p className="text-primary_green text-[12px] font-[500]">
                          See Rewards
                        </p>

                        <ChevronRightOutlinedIcon sx={{ color: "#02981D " }} />
                      </span>
                    </div>
                  </div>
                </div>
              </CustomCard>
            )}
          </div>
        </Grid>

        <Grid item xs={12}>
          {false ? (
            <Skeleton variant="rounded" width="100%" height={250} />
          ) : (
            <CustomCard style="w-full h-full">
              <div className="bg-text_white">
                <div className="flex flex-col items-center">
                  <div className="flex w-full mb-6 justify-between items-center">
                    <p className="text-general text-[16px] font-[500] ">
                      Marketers
                    </p>

                    <span className="flex gap-3 items-center cursor-pointer">
                      <p className="text-primary_green text-[12px] font-[500]">
                        See Full Transaction History
                      </p>

                      <ChevronRightOutlinedIcon sx={{ color: "#02981D " }} />
                    </span>
                  </div>

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
                            <TableCell> Amount(N)</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Date & Time</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {!data?.transactions ? (
                            <CircularProgress
                              size="4.2rem"
                              sx={{
                                color: "#02981D",
                                marginLeft: "auto",
                                padding: "1em",
                              }}
                            />
                          ) : data?.transactions &&
                            Array.isArray(data?.transactions) &&
                            data?.transactions?.length > 0 ? (
                            data?.transactions?.map((item, i) => (
                              <TableRow key={i + 2}>
                                <TableCell>
                                  {page * rowsPerPage + i + 1}
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    sx={{
                                      fontWeight: "400",
                                      fontSize: "16px",
                                      color: "#828282",
                                    }}
                                  >
                                    {item?.amount}
                                  </Typography>
                                </TableCell>

                                <TableCell>
                                  <Typography
                                    sx={{
                                      color:
                                        item?.activity_type === "CREDIT"
                                          ? "#208637"
                                          : "#E52929",
                                      fontWeight: "500",
                                      fontSize: "12px",
                                      background:
                                        item?.activity_type === "CREDIT"
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
                                    {item?.activity_type === "CREDIT" ? (
                                      <SouthWestRoundedIcon
                                        sx={{ fontSize: "12px" }}
                                      />
                                    ) : (
                                      <NorthEastRoundedIcon
                                        sx={{ fontSize: "12px" }}
                                      />
                                    )}
                                    {item?.activity_type?.toLowerCase()}
                                  </Typography>
                                </TableCell>
                                <TableCell>{item?.title}</TableCell>
                                <TableCell>
                                  {formattedDate(item?.created_at)}
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
                </div>
              </div>
            </CustomCard>
          )}
        </Grid>
      </Grid>

      {/* card 2 */}

      {/* modal for total corporateSavings */}
      <CustomModal
        style="w-[55%]"
        open={openCorporateSavingsModal}
        closeModal={handleCloseCoModal}
      >
        <CorporativeSavingsModal
          close={handleCloseCoModal}
          memberId={memberId}
        />
      </CustomModal>
      {/* modal for total corporateSavings end */}

      {/* modal for total personal savings */}
      <CustomModal
        style="w-[65%]"
        open={openPersonalModal}
        closeModal={handleClosePersonal}
      >
        <PersonalSavingsModal close={handleClosePersonal} memberId={memberId} />
      </CustomModal>
      {/* modal for total personal savings end */}

      {/* modal for investment vallue */}
      <CustomModal
        style="w-[90%]"
        open={showInvDetailsModal}
        closeModal={handleCloseInvDetailsModal}
      >
        <InvestmentDetailsModal
          close={handleCloseInvDetailsModal}
          memberId={memberId}
        />
      </CustomModal>
      {/* modal end */}

      {/* Referee Modal */}
      <CustomModal
        style="w-[50%]"
        open={openRefereeModal}
        closeModal={closeRefereeModal}
      >
        <RefereeModal
          refereeData={refereeData}
          closeRefereeModal={closeRefereeModal}
        />
      </CustomModal>
      {/* Referee Modal ends */}
    </div>
  );
};

export default MemberProfile;
