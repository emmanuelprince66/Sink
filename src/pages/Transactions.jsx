import React, { useEffect, useState } from "react";
import SelectDate from "../components/SelectDate";
import CustomCard from "../components/CustomCard";
import { useForm, Controller } from "react-hook-form";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import tOne from "../assets/transactions/t-1.svg";
import tTwo from "../assets/transactions/t-2.svg";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import {
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  Button,
  Divider,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import CustomModal from "../components/CustomModal";
import CustomSuccessRequestModal from "../components/CustomSuccessRequestModal";
import CustomSuccessModal from "../components/CustomSuccessModal";
import CustomPagination from "../components/CustomPagination";
import { transactionsDataUrl } from "../api/endpoint";
import { acceptWithdrawalUrl } from "../api/endpoint";
import useFetchData from "../hooks/useFetchData";
import FormattedPrice from "../utils/FormattedPrice";
import TransactionTable from "./transactions/TransactionTable";
import Referrals from "./transactions/Referrals";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import DeclineModal from "./transactions/DeclineModal";
import { checkNameForWithdrawalApprovalUrl } from "../api/endpoint";
import { notiError } from "../utils/noti";
import axios from "axios";
import { AuthAxios } from "../helpers/axiosInstance";
import { ToastContainer } from "react-toastify";
import { format } from "date-fns";
import formattedDate from "../utils/formattedDate";
const Transactions = () => {
  const {
    handleSubmit,
    control,
    watch,
    register,
    formState: { isValid, errors },
  } = useForm({ mode: "all" });
  const status = watch("status", "Pending");
  const statusOptions = ["Pending", "Successfull", "Failed"];
  const [trxFilter, setTrxFilter] = useState("");
  const [openWalletTrxModal, setOpenWalletTrxModal] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [openWTrxModal, setWOpenTrxModal] = useState(false);
  const [openWidthdrawalModal, setOpenWithdrawalModal] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [openRequestModal, setOpenRequestModal] = useState(false);
  const [walletCreditModalData, setWalletCreditModalData] = useState(null);
  const [withdrawalModalData, setWithdrawalModalData] = useState(null);

  const [openDeclineReqModal, setOpenDeclineReqModal] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const closeDeclineReqModal = () => setOpenDeclineReqModal(false);
  const closeOpenRequestModal = () => setOpenRequestModal(false);
  const closeWalletTrxModal = () => setOpenWalletTrxModal(false);

  const [transactionModalData, setTransactionModalData] = useState(null);
  const [openTrxModal, setOpenTrxModal] = useState(false);

  const closeTrxModal = () => setOpenTrxModal(false);
  const closeWithdrawalModal = () => {
    setShowAcctName(false);
    setWithdrawalModalData(false);
  };

  const [showAcctName, setShowAcctName] = useState(false);

  const [approveWithId, setApproveWithId] = useState("");
  const closeSuccessModal = () => setOpenSuccessModal(false);
  const [declineId, setDeclineId] = useState("");
  const closeWTrxModal = () => setWOpenTrxModal(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [page, setPage] = useState(0);

  const apiUrlName = checkNameForWithdrawalApprovalUrl(approveWithId);
  const queryKeyName = ["checkNameForWithdrawalApproval", apiUrlName];

  const {
    data: checkedName,
    error,
    isLoading: isCheckNameLoading,
  } = useFetchData(queryKeyName, apiUrlName);

  const handleShowAcctName = (id) => {
    console.log("id", id);
    setShowAcctName(!showAcctName);
  };

  console.log("show", showAcctName);

  const handleOpenDeclineReqModal = (id) => {
    console.log(id);
    setDeclineId(id);
    setOpenDeclineReqModal(true);
    closeWithdrawalModal();
  };

  const [filteredTrxData, setFilteredTrxData] = useState(null);

  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [filterValue, setFilterValue] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const apiUrl = transactionsDataUrl(
    currentPage,
    rowsPerPage,
    searchValue,
    trxFilter
  );
  const queryKey = ["fetchTransactionData", apiUrl, trxFilter, searchValue];
  // fetch referral data

  const {
    isLoading,
    data: transactionsData,
    refetch,
  } = useFetchData(queryKey, apiUrl);

  console.log("data", transactionsData);

  const totalPages = transactionsData?.pages;
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleOpenModal = (item) => {
    console.log("item", item);

    setTransactionModalData(item);
    setOpenTrxModal(true);

    // switch (item?.type) {
    //   case "WALLET-CREDIT":
    //     setWalletCreditModalData(item);
    //     setOpenWalletTrxModal(true);
    //     break;
    //   case "DATA_AND_AIRTIME":
    //     setWalletCreditModalData(item);
    //     setOpenWalletTrxModal(true);
    //     break;
    //   case "WITHDRAWAL":
    //     setWithdrawalModalData(item);
    //     setOpenWithdrawalModal(true);
    //   default:
    //     break;
    // }
  };

  const handleOpenApproveReq = async (id) => {
    setApproveWithId(id);

    const isValid = await checkNameValidator(id);

    if (isValid) {
      setOpenRequestModal(true);
      closeWithdrawalModal();
    } else {
      console.log("error");
    }
  };
  const checkNameValidator = async (id) => {
    console.log("before fetching...");
    try {
      setButtonLoading(true);
      const response = await AuthAxios.get(
        checkNameForWithdrawalApprovalUrl(id)
      );

      console.log("res", response);
      setSessionId(response?.data?.id);

      return true;
    } catch (error) {
      notiError(error?.response?.data?.message); // Ensure you're displaying the correct error message
      console.log("error", error?.response?.data?.message);
      return false;
    } finally {
      setButtonLoading(false);
      console.log("after fetching...");
    }
  };

  // filter functionality

  // useEffect(() => {
  //   const res = transactionsData?.results;

  //   if (res && Array.isArray(res)) {
  //     let filteredResult = res;

  //     // Filter by transaction type
  //     if (trxFilter !== "") {
  //       filteredResult = filteredResult.filter(
  //         (item) => item?.type?.toLowerCase() === trxFilter
  //       );
  //     }

  //     // Filter by search value
  //     if (searchValue !== "") {
  //       filteredResult = filteredResult.filter(
  //         (item) =>
  //           item?.lastname
  //             ?.toLowerCase()
  //             .includes(searchValue?.toLowerCase()) ||
  //           item?.firstname?.toLowerCase().includes(searchValue?.toLowerCase())
  //       );
  //     }

  //     setFilteredTrxData(filteredResult);
  //   }
  // }, [transactionsData, trxFilter, searchValue]);

  const checkNameForWithdrawalReq = async () => {
    try {
      setIsPosting(true);
      const payload = { session_id: sessionId };

      console.log(payload);
      const response = await AuthAxios.post(
        acceptWithdrawalUrl(approveWithId),
        payload
      );
      console.log("res", response);
    } catch (error) {
      notiError(error?.response?.data);
      console.log("error", error);
    } finally {
      console.log("after fetching...");
      setIsPosting(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-start  gap-3">
      <div className="w-full flex items-center justify-between mb-3">
        <p className="font-[600] text-[20px] text-general ">Transactions</p>

        <SelectDate />
      </div>
      <CustomCard style="w-full">
        <div className="flex items-start gap-4 flex-col">
          <div className="w-full flex items-center justify-between">
            <div className="bg-white border-[#E3E3E3] border-[1px] w-[50%] py-2 px-2 flex items-center gap-2 rounded-md">
              <SearchOutlinedIcon sx={{ color: "#757575" }} />
              <input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                type="text"
                placeholder="Search member , ID"
                className="bg-transparent border-none focus:outline-none outline-none  w-full"
              />
            </div>

            <Button
              sx={{
                background: "#FAFAFA",
                borderRadius: "8px",
                width: "13%",
                px: "15px",
                border: "1px solid #C8C8C8",
                color: "#02981D",
                "&:hover": {
                  backgroundColor: "#FAFAFA",
                },
                textTransform: "capitalize",
                fontWeight: "600",
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <img src={tOne} alt="export-icn" />
              Export
            </Button>
          </div>
          <div className="flex w-[40%] gap-3  items-center">
            <Button
              onClick={() => setTrxFilter("")}
              sx={{
                background: trxFilter === "" ? "#FAFAFA" : "#fff",
                borderRadius: "8px",
                width: "100%",
                px: "15px",
                border:
                  trxFilter === "" ? "1px solid #3F3767" : "1px solid #C8C8C8",
                color: trxFilter === "" ? "#3F3767" : "#C8C8C8",
                "&:hover": {
                  backgroundColor: trxFilter === "" ? "#FAFAFA" : "#fff",
                },
                textTransform: "capitalize",
                fontWeight: "400",
              }}
            >
              All Transactions
            </Button>
            {/* <Button
              onClick={() => setTrxFilter("WALLET-CREDIT")}
              sx={{
                background: trxFilter === "WALLET-CREDIT" ? "#FAFAFA" : "#fff",
                borderRadius: "8px",
                width: "100%",
                px: "15px",
                border:
                  trxFilter === "WALLET-CREDIT"
                    ? "1px solid #02981D"
                    : "1px solid #5E5E5E",
                color: trxFilter === "WALLET-CREDIT" ? "#02981D" : "#5E5E5E",
                "&:hover": {
                  backgroundColor:
                    trxFilter === "WALLET-CREDIT" ? "#FAFAFA" : "#fff",
                },
                textTransform: "capitalize",
                fontWeight: "400",
              }}
            >
              Wallet Credit
            </Button>
            <Button
              onClick={() => setTrxFilter("DATA_AND_AIRTIME")}
              sx={{
                background:
                  trxFilter === "DATA_AND_AIRTIME" ? "#FAFAFA" : "#fff",
                borderRadius: "8px",
                width: "100%",
                px: "15px",
                border:
                  trxFilter === "DATA_AND_AIRTIME"
                    ? "1px solid #02981D"
                    : "1px solid #5E5E5E",
                color: trxFilter === "DATA_AND_AIRTIME" ? "#02981D" : "#5E5E5E",
                "&:hover": {
                  backgroundColor:
                    trxFilter === "DATA_AND_AIRTIME" ? "#FAFAFA" : "#fff",
                },
                textTransform: "capitalize",
                fontWeight: "400",
              }}
            >
              Data Purchase
            </Button>
            <Button
              onClick={() => setTrxFilter("WITHDRAWAL")}
              sx={{
                background: trxFilter === "WITHDRAWAL" ? "#FAFAFA" : "#fff",
                borderRadius: "8px",
                width: "100%",
                px: "15px",
                border:
                  trxFilter === "WITHDRAWAL"
                    ? "1px solid #02981D"
                    : "1px solid #5E5E5E",
                color: trxFilter === "WITHDRAWAL" ? "#02981D" : "#5E5E5E",
                "&:hover": {
                  backgroundColor:
                    trxFilter === "WITHDRAWAL" ? "#FAFAFA" : "#fff",
                },
                textTransform: "capitalize",
                fontWeight: "400",
              }}
            >
              Withdrawal
            </Button> */}
            <Button
              onClick={() => setTrxFilter("referral")}
              sx={{
                background: trxFilter === "referral" ? "#FAFAFA" : "#fff",
                borderRadius: "8px",
                width: "100%",
                px: "15px",
                border:
                  trxFilter === "referral"
                    ? "1px solid #02981D"
                    : "1px solid #5E5E5E",
                color: trxFilter === "referral" ? "#02981D" : "#5E5E5E",
                "&:hover": {
                  backgroundColor:
                    trxFilter === "referral" ? "#FAFAFA" : "#fff",
                },
                textTransform: "capitalize",
                fontWeight: "400",
              }}
            >
              Referral
            </Button>
          </div>

          {/*  */}
          {trxFilter !== "referral" && (
            <TransactionTable
              isLoading={isLoading}
              handleOpenModal={handleOpenModal}
              transactionsData={transactionsData}
              filteredTrxData={filteredTrxData}
              page={page}
              onPageChange={handlePageChange}
              totalPages={totalPages}
              rowsPerPage={rowsPerPage}
              currentPage={currentPage}
            />
          )}

          {trxFilter === "referral" && <Referrals />}
        </div>
      </CustomCard>
      {/* wallet credit transactions modal */}
      <CustomModal open={openTrxModal} closeModal={closeTrxModal}>
        <div className="w-full flex flex-col items-start gap-2">
          <div className="flex items-center justify-between w-full mb-3">
            <p className="text-general font-[500] text-[20px] ">Transactions</p>

            <ClearRoundedIcon
              onClick={closeTrxModal}
              sx={{ color: "#1E1E1E", cursor: "pointer" }}
            />
          </div>
          {/* <div className="flex items-center justify-between w-full">
            <p className="text-general font-[500] text-[14px] ">USER DETAILS</p>
            <Button
              sx={{
                background: "#FAFAFA",
                borderRadius: "8px",
                px: "15px",
                border: "1px solid #C8C8C8",
                color: "#02981D",
                "&:hover": {
                  backgroundColor: "#FAFAFA",
                },
                fontWeight: "600",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              Go to profile
            </Button>
          </div> */}

          {/* <div className="rounded-md w-full border-[1px] border-[#E3E3E3] p-2 flex flex-col items-start">
            <div className="w-full flex justify-between mt-1">
              <p className="text-[14px] text-primary_grey_2">User:</p>
              <p className="text-[14px] text-general font-[500]">
                {walletCreditModalData?.lastname || ""}{" "}
                {walletCreditModalData?.firstname || ""}
              </p>
            </div>
            <Divider sx={{ color: "#E3E3E3", width: "100%", my: "8px" }} />

            <div className="w-full flex justify-between">
              <p className="text-[14px] text-primary_grey_2">Email:</p>
              <p className="text-[14px] text-general font-[500]">
                {walletCreditModalData?.email || ""}
              </p>
            </div>

            <Divider sx={{ color: "#E3E3E3", width: "100%", my: "8px" }} />

            <div className="w-full flex justify-between">
              <p className="text-[14px] text-primary_grey_2">Phone Number:</p>
              <p className="text-[14px] text-general font-[500]">
                {walletCreditModalData?.phone || ""}
              </p>
            </div>
          </div> */}

          <div className="flex flex-col items-start gap-2 w-full mt-3">
            <p className="text-general font-[500] text-[14px] ">
              TRANSACTION DETAILS
            </p>

            <div className="rounded-md w-full border-[1px] border-[#E3E3E3] p-2 flex flex-col items-start">
              <div className="w-full flex justify-between mt-1">
                <p className="text-[14px] text-primary_grey_2">User:</p>
                <p className="text-[14px] text-general font-[500]">
                  {transactionModalData?.user || ""}{" "}
                </p>
              </div>
              <Divider sx={{ color: "#E3E3E3", width: "100%", my: "8px" }} />

              <div className="w-full flex justify-between mt-1">
                <p className="text-[14px] text-primary_grey_2">Description:</p>
                <p className="text-[14px] text-general font-[500]">
                  {transactionModalData?.description || ""}
                </p>
              </div>
              <Divider sx={{ color: "#E3E3E3", width: "100%", my: "8px" }} />

              <div className="w-full flex justify-between">
                <p className="text-[14px] text-primary_grey_2">Amount:</p>
                <p className="text-[14px] text-general font-[500]">
                  <FormattedPrice amount={transactionModalData?.amount} />
                </p>
              </div>

              <Divider sx={{ color: "#E3E3E3", width: "100%", my: "8px" }} />

              <div className="w-full flex justify-between">
                <p className="text-[14px] text-primary_grey_2">Status:</p>
                <p className="text-[14px] text-general font-[500]">
                  {transactionModalData?.status || ""}
                </p>
              </div>
              <Divider sx={{ color: "#E3E3E3", width: "100%", my: "8px" }} />

              <div className="w-full flex justify-between">
                <p className="text-[14px] text-primary_grey_2">Date:</p>
                <p className="text-[14px] text-general font-[500]">
                  {formattedDate(transactionModalData?.created_at)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end w-full mt-3">
            <Button
              variant="contained"
              type="submit"
              sx={{
                color: "#fff",
                width: "13%",
                background: "#02981D",
                padding: ".6em",
                boxShadow: "none",
                "&:hover": {
                  background: "#02981d",
                },
              }}
            >
              Done
            </Button>
          </div>
        </div>
      </CustomModal>
      {/* All transactions modal */}

      {/* update transactios modal */}
      <CustomModal open={openWTrxModal} closeModal={closeWTrxModal}>
        <div className="w-full flex flex-col items-start gap-2">
          <div className="flex items-center justify-between w-full mb-3">
            <p className="text-general font-[500] text-[20px] ">Transactions</p>

            <ClearRoundedIcon sx={{ color: "#1E1E1E", cursor: "pointer" }} />
          </div>
          <div className="flex items-center justify-between w-full">
            <p className="text-general font-[500] text-[14px] ">USER DETAILS</p>
            <Button
              sx={{
                background: "#FAFAFA",
                borderRadius: "8px",
                px: "15px",
                border: "1px solid #C8C8C8",
                color: "#02981D",
                "&:hover": {
                  backgroundColor: "#FAFAFA",
                },
                fontWeight: "600",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              Go to profile
            </Button>
          </div>

          <div className="rounded-md w-full border-[1px] border-[#E3E3E3] p-2 flex flex-col items-start">
            <div className="w-full flex justify-between mt-1">
              <p className="text-[14px] text-primary_grey_2">User:</p>
              <p className="text-[14px] text-general font-[500]">
                Ronald Richards
              </p>
            </div>
            <Divider sx={{ color: "#E3E3E3", width: "100%", my: "8px" }} />

            <div className="w-full flex justify-between">
              <p className="text-[14px] text-primary_grey_2">Email:</p>
              <p className="text-[14px] text-general font-[500]">
                Ronald@gmail.com
              </p>
            </div>

            <Divider sx={{ color: "#E3E3E3", width: "100%", my: "8px" }} />

            <div className="w-full flex justify-between">
              <p className="text-[14px] text-primary_grey_2">Phone Number:</p>
              <p className="text-[14px] text-general font-[500]">08168465081</p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 w-full mt-3">
            <p className="text-general font-[500] text-[14px] ">
              TRANSACTION DETAILS
            </p>

            <div className="rounded-md w-full border-[1px] border-[#E3E3E3] p-2 flex flex-col items-start">
              <div className="w-full flex justify-between mt-1">
                <p className="text-[14px] text-primary_grey_2">Description:</p>
                <p className="text-[14px] text-general font-[500]">
                  Wallet Credit
                </p>
              </div>
              <Divider sx={{ color: "#E3E3E3", width: "100%", my: "8px" }} />

              <div className="w-full flex justify-between">
                <p className="text-[14px] text-primary_grey_2">Amount:</p>
                <p className="text-[14px] text-general font-[500]">N100,000</p>
              </div>

              <Divider sx={{ color: "#E3E3E3", width: "100%", my: "8px" }} />

              <div className="w-full flex justify-between">
                <p className="text-[14px] text-primary_grey_2">Status:</p>
                <p className="text-[14px] text-general font-[500]">
                  Successfull
                </p>
              </div>
              <Divider sx={{ color: "#E3E3E3", width: "100%", my: "8px" }} />

              <div className="w-full flex justify-between">
                <p className="text-[14px] text-primary_grey_2">Date:</p>
                <p className="text-[14px] text-general font-[500]">
                  30th June, 2024 • 9:43 AM
                </p>
              </div>
            </div>
          </div>
          {/* form radio buttons */}

          <div className="flex flex-col items-start gap-2 mt-2">
            <p className="text-general font-[500] text-[14px] ">STATUS</p>

            <div>
              <Controller
                name="subscription"
                control={control}
                defaultValue="Pending"
                render={({ field }) => (
                  <FormControl component="fieldset">
                    <RadioGroup
                      row
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      {statusOptions?.map((label) => (
                        <div
                          key={label}
                          className={`rounded-md border-2 p-1 px-2 mr-3 ${
                            statusOptions === label
                              ? "border-[#02981D]"
                              : "border-[#E6F5E8]"
                          }`}
                        >
                          <FormControlLabel
                            value={label}
                            control={
                              <Radio
                                sx={{
                                  color: "#02981D",
                                  "&.Mui-checked": {
                                    color: "#02981D",
                                  },
                                }}
                              />
                            }
                            label={label}
                          />
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                )}
              />
            </div>
          </div>

          {/* form radio buttons */}

          <div className="w-full bg-[#FFF9E6] flex mt-3 py-4 gap-3 items-center rounded-md border-[1px] border-[#FFE69C] p-2">
            <img src={tTwo} alt="t-2" />
            <p className="text-[14px] text-[#CC9A06] ">
              This is a longer text describing the alert heading.
            </p>
          </div>
          <Button
            variant="contained"
            type="submit"
            disabled
            sx={{
              color: "#fff",
              my: "1rem",
              background: "#02981D",
              padding: ".6em",
              boxShadow: "none",
              "&:hover": {
                background: "#02981d",
              },
            }}
          >
            Update Status
          </Button>
        </div>
      </CustomModal>
      {/* update transactios modal */}
      {/* widthdrawal modal */}
      <CustomModal open={withdrawalModalData} closeModal={closeWithdrawalModal}>
        <div className="w-full flex flex-col items-start gap-2">
          <div className="flex items-center justify-between w-full mb-3">
            <p className="text-general font-[500] text-[20px] ">Transactions</p>

            <ClearRoundedIcon
              onClick={closeWithdrawalModal}
              sx={{ color: "#1E1E1E", cursor: "pointer" }}
            />
          </div>
          <div className="flex items-center justify-between w-full">
            <p className="text-general font-[500] text-[14px] ">USER DETAILS</p>
            <Button
              sx={{
                background: "#FAFAFA",
                borderRadius: "8px",
                px: "15px",
                border: "1px solid #C8C8C8",
                color: "#02981D",
                "&:hover": {
                  backgroundColor: "#FAFAFA",
                },
                fontWeight: "600",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              Go to profile
            </Button>
          </div>

          <div className="rounded-md w-full border-[1px] border-[#E3E3E3] p-2 flex flex-col items-start">
            <div className="w-full flex justify-between mt-1">
              <p className="text-[14px] text-primary_grey_2">User:</p>
              <p className="text-[14px] text-general font-[500]">
                {withdrawalModalData?.lastname || ""}{" "}
                {withdrawalModalData?.firstname || ""}
              </p>
            </div>
            <Divider sx={{ color: "#E3E3E3", width: "100%", my: "8px" }} />

            <div className="w-full flex justify-between">
              <p className="text-[14px] text-primary_grey_2">Email:</p>
              <p className="text-[14px] text-general font-[500]">
                {withdrawalModalData?.email || ""}
              </p>
            </div>

            <Divider sx={{ color: "#E3E3E3", width: "100%", my: "8px" }} />

            <div className="w-full flex justify-between">
              <p className="text-[14px] text-primary_grey_2">Phone Number:</p>
              <p className="text-[14px] text-general font-[500]">
                {withdrawalModalData?.phone || ""}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 w-full mt-3">
            <p className="text-general font-[500] text-[14px] ">
              TRANSACTION DETAILS
            </p>

            <div className="rounded-md w-full border-[1px] border-[#E3E3E3] p-2 flex flex-col items-start">
              <div className="w-full flex justify-between mt-1">
                <p className="text-[14px] text-primary_grey_2">Description:</p>
                <p className="text-[14px] text-general font-[500]">
                  {withdrawalModalData?.description || ""}
                </p>
              </div>

              <Divider sx={{ color: "#E3E3E3", width: "100%", my: "8px" }} />

              <div className="w-full flex justify-between">
                <p className="text-[14px] text-primary_grey_2">Date:</p>
                <p className="text-[14px] text-general font-[500]">
                  not sending the date
                </p>
              </div>
            </div>
          </div>

          {showAcctName ? (
            <>
              <div className="flex flex-col items-start gap-2 w-full mt-3">
                <p className="text-general font-[500] text-[14px] ">
                  WITHDRAWAL DETAILS
                </p>

                <div className="rounded-md w-full border-[1px] bg-[#F7F7F7] border-[#E3E3E3] p-2 flex flex-col items-start">
                  <div className="w-full flex justify-between">
                    <p className="text-[14px] text-primary_grey_2">Amount:</p>
                    <p className="text-[14px] text-general font-[500]">
                      <FormattedPrice
                        amount={withdrawalModalData?.withdrawal_details?.amount}
                      />
                    </p>
                  </div>

                  <Divider
                    sx={{ color: "#E3E3E3", width: "100%", my: "8px" }}
                  />

                  <div className="w-full flex justify-between">
                    <p className="text-[14px] text-primary_grey_2">
                      Bank Name:
                    </p>
                    <p className="text-[14px] text-general font-[500]">
                      {withdrawalModalData?.withdrawal_details?.bank_name || ""}
                    </p>
                  </div>
                  <Divider
                    sx={{ color: "#E3E3E3", width: "100%", my: "8px" }}
                  />

                  <div className="w-full flex justify-between">
                    <p className="text-[14px] text-primary_grey_2">
                      Account Number:
                    </p>
                    <p className="text-[14px] text-general font-[500]">
                      {withdrawalModalData?.withdrawal_details?.account_number}
                    </p>
                  </div>

                  <Divider
                    sx={{ color: "#E3E3E3", width: "100%", my: "8px" }}
                  />

                  <div className="w-full flex justify-between">
                    <p className="text-[14px] text-primary_grey_2">
                      Account Name:
                    </p>
                    <p className="text-[14px] text-general font-[500]">
                      {withdrawalModalData?.withdrawal_details?.account_name ||
                        "nil"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-full flex-col items-start gap-2 mt-2">
                <p className="text-general font-[500] text-[14px] ">Action</p>
                <div className="flex justify-start gap-5 w-full mt-3">
                  <Button
                    onClick={() =>
                      handleOpenDeclineReqModal(
                        withdrawalModalData?.withdrawal_details?.id
                      )
                    }
                    variant="contained"
                    sx={{
                      color: "#DC3545",
                      background: "#F7F7F7",
                      boxShadow: "none",
                      width: "10rem",
                      fontSize: "1rem",
                      py: "1rem",
                      textTransform: "capitalize",
                      "&:hover": {
                        background: "#F7F7F7",
                      },
                    }}
                  >
                    <ClearRoundedIcon sx={{ mr: "1rem" }} />
                    Decline
                  </Button>
                  <Button
                    onClick={() =>
                      handleOpenApproveReq(
                        withdrawalModalData?.withdrawal_details?.id
                      )
                    }
                    variant="contained"
                    sx={{
                      color: "#02981D",
                      background: "#F7F7F7",
                      boxShadow: "none",
                      width: "10rem",
                      fontSize: "1rem",
                      py: "1rem",
                      textTransform: "capitalize",
                      "&:hover": {
                        background: "#F7F7F7",
                      },
                    }}
                  >
                    {buttonLoading ? (
                      <CircularProgress
                        size="1.2rem"
                        sx={{ color: "#02981D" }}
                      />
                    ) : (
                      <>
                        <CheckRoundedIcon sx={{ mr: "1rem" }} />
                        Approve
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <Button
              onClick={() => handleShowAcctName(withdrawalModalData?.id)}
              variant="contained"
              sx={{
                color: "#02981D",
                background: "#F7F7F7",
                boxShadow: "none",
                width: "10rem",
                fontSize: "1rem",
                py: "1rem",
                textTransform: "capitalize",
                "&:hover": {
                  background: "#F7F7F7",
                },
              }}
            >
              Proceed
            </Button>
          )}
        </div>
      </CustomModal>
      {/* widthdrawal modal ends */}
      {/* success request modal */}
      <CustomModal open={openRequestModal}>
        <CustomSuccessRequestModal
          id={approveWithId}
          onClick={checkNameForWithdrawalReq}
          close={closeOpenRequestModal}
          titleOne="Sure to Update Transaction Status?"
          titleTwo=" User will be notified of this action."
          btnText={
            isPosting ? (
              <CircularProgress size="1.2rem" sx={{ color: "#fff" }} />
            ) : (
              "Update Status"
            )
          }
        />
      </CustomModal>
      {/* success request modal */}
      {/* success modal */}
      <CustomModal open={openSuccessModal}>
        <CustomSuccessModal
          close={closeSuccessModal}
          textOne="Transaction status has been updated."
        />
      </CustomModal>
      {/* success modal */}

      {/* decline req modal */}
      <CustomModal open={openDeclineReqModal} closeModal={closeDeclineReqModal}>
        <div className="w-full flex flex-col items-start gap-2">
          <div className="flex items-center justify-between w-full mb-3">
            <p className="text-general font-[500] text-[20px] ">
              Decline Withdrawal
            </p>

            <ClearRoundedIcon
              onClick={closeDeclineReqModal}
              sx={{ color: "#1E1E1E", cursor: "pointer" }}
            />
          </div>

          <div className="w-full">
            <DeclineModal
              refetch={refetch}
              declineId={declineId}
              closeDeclineReqModal={closeDeclineReqModal}
            />
          </div>
        </div>
      </CustomModal>

      {/* decline req modal end */}

      {/*  */}
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

export default Transactions;
