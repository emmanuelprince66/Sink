import React from "react";
import { useState } from "react";
import CustomCard from "../../components/CustomCard";
import FormattedPrice from "../../utils/FormattedPrice";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import tOne from "../../assets/transactions/t-1.svg";
import { Button } from "@mui/material";
import ReferralTable from "./ReferralTable";
import { useDateContext } from "../../utils/DateContext";
import useFetchData from "../../hooks/useFetchData";
import { AuthAxios } from "../../helpers/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { referralDataUrl } from "../../api/endpoint";
import { Skeleton } from "@mui/material";

const Referrals = () => {
  const { selectedDates } = useDateContext();
  const [currentPage, setCurrentPage] = useState(1);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [filterValue, setFilterValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const apiUrl = referralDataUrl(
    searchValue,
    currentPage,
    rowsPerPage,
    selectedDates
  );

  const queryKey = ["fetchReferralData", apiUrl];

  const { isLoading, data: referralData } = useFetchData(queryKey, apiUrl);

  const totalPages = referralData?.pages;
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // referral card
  const CustomReferralCard = ({ text, amt }) => {
    return (
      <CustomCard style="w-full">
        <div className="w-full flex flex-col items-start gap-4">
          <p className="text-[14px] font-[400] text-primary_grey_2">{text}</p>
          <p className="text-[20px] font-[600] text-general">{amt}</p>
        </div>
      </CustomCard>
    );
  };
  return (
    <div className="w-full flex items-start flex-col gap-5">
      <div className="w-full flex justify-between gap-3 mt-3">
        {false ? (
          <Skeleton variant="rounded" width="100%" height={147} />
        ) : (
          <CustomReferralCard
            text="Total Marketers(All-Time)"
            amt={referralData?.results?.total_referrals}
          />
        )}
        {false ? (
          <Skeleton variant="rounded" width="100%" height={147} />
        ) : (
          <CustomReferralCard
            text="Total Onboarded(By-Filter)"
            amt={referralData?.results?.filtered_referrals}
          />
        )}
        {false ? (
          <Skeleton variant="rounded" width="100%" height={147} />
        ) : (
          <CustomReferralCard
            text="Total Amount Paid To Marketer"
            amt={
              <FormattedPrice
                amount={referralData?.results?.total_referral_balance_sum}
              />
            }
          />
        )}
        {false ? (
          <Skeleton variant="rounded" width="100%" height={147} />
        ) : (
          <CustomReferralCard
            text="Total Upcoming Payment"
            amt={
              <FormattedPrice
                amount={referralData?.results?.total_referral_balance_sum}
              />
            }
          />
        )}
        {false ? (
          <Skeleton variant="rounded" width="100%" height={147} />
        ) : (
          <CustomReferralCard
            text="View More"
            amt={
              <FormattedPrice
                amount={referralData?.results?.total_referral_balance_sum}
              />
            }
          />
        )}
      </div>

      <p className="text-[16px] font-[600] text-general">Referral Breakdown</p>

      <div className="flex w-full items-center justify-between">
        <div className="bg-white border-[#E3E3E3] border-[1px] w-[50%] py-2 px-2 flex items-center gap-2 rounded-md">
          <SearchOutlinedIcon sx={{ color: "#757575" }} />
          <input
            type="text"
            placeholder="Search....."
            onChange={(e) => setSearchValue(e.target.value)}
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

      <ReferralTable
        page={page}
        onPageChange={handlePageChange}
        totalPages={totalPages}
        isLoading={isLoading}
        next={referralData?.links.next}
        back={referralData?.links.previous}
        rowsPerPage={rowsPerPage}
        currentPage={currentPage}
        referralDataTable={referralData?.results?.users}
      />
    </div>
  );
};

export default Referrals;
