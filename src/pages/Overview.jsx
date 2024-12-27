import React from "react";
import SelectDate from "../components/SelectDate";
import { Button } from "@mui/material";
import CustomCard from "../components/CustomCard";
import oOne from "../assets/overview/o-1.svg";
import oTwo from "../assets/overview/o-2.svg";
import oThree from "../assets/overview/o-3.svg";
import { Skeleton } from "@mui/material";
import { useDateContext } from "../utils/DateContext";
import FormattedPrice from "../utils/FormattedPrice";
import { overveiwUrl } from "../api/endpoint";
import useFetchData from "../hooks/useFetchData";

const Overview = () => {
  const { selectedDates } = useDateContext();

  // fetch overview data
  const apiUrl = overveiwUrl(selectedDates);
  const queryKey = ["fetchOverveiwData", apiUrl];
  const { data, error, isLoading } = useFetchData(queryKey, apiUrl);

  // cooperative card
  const CustomCorporativeCard = ({ text, amt }) => {
    return (
      <CustomCard style="w-full">
        <div className="w-full flex flex-col items-start gap-4">
          <p className="text-[14px] font-[400] text-primary_grey_2">{text}</p>
          <p className="text-[20px] font-[600] text-general">{amt}</p>
        </div>
      </CustomCard>
    );
  };
  // loan card
  const CustomLoanCard = ({ time, filter, type, textOne, textTwo }) => {
    return (
      <CustomCard style="w-full">
        {type === "per" ? (
          <div className="w-full flex justify-center items-start flex-col gap-3 min-h-[6.7rem]">
            <p className="text-[14px] font-[400] text-primary_grey_2">
              {textOne}
            </p>
            <p className="text-[30px] font-[600] text-general">{time}%</p>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-3 items-start">
            <div className="w-full flex flex-col items-start gap-2">
              <p className="text-[14px] font-[400] text-primary_grey_2">
                {textOne}
              </p>
              <p className="text-[20px] font-[600] text-general">{time}</p>
            </div>
            <div className="w-full flex flex-col items-start gap-2">
              <p className="text-[14px] font-[400] text-primary_grey_2">
                {textTwo}
              </p>
              <p className="text-[20px] font-[600] text-general">{filter}</p>
            </div>
          </div>
        )}
      </CustomCard>
    );
  };

  return (
    <div className="w-full flex items-center flex-col ">
      <div className="flex w-full justify-between items-center">
        <p className="font-[600] text-[20px] text-general ">Overview</p>
        <SelectDate />
      </div>

      <div className="w-full flex items-center justify-between gap-9 mt-7">
        {false ? (
          <Skeleton variant="rounded" width="100%" height={247} />
        ) : (
          <CustomCard color="#F6FFF8" style="w-full">
            <div className="w-full flex-col items-start gap-3">
              <div className="flex gap-3   items-center">
                <img src={oOne} alt="0-1" />
                <p className="text-general text-[14px] font-[500]">
                  Total revenue from sales
                </p>
              </div>

              <div className="flex-col flex items-start gap-2 mt-5">
                <p className="text-[14px] text-primary_grey_2">All-time:</p>
                <p className="text-[24px] font-[600] text-general">
                  <FormattedPrice amount={data?.total_revenue} />
                </p>
              </div>
              <div className="flex-col flex items-start gap-2 mt-5">
                <p className="text-[14px] text-primary_grey_2">By Filter:</p>
                <p className="text-[24px] font-[600] text-general">
                  <FormattedPrice amount={data?.filtered_revenue} />
                </p>
              </div>
            </div>
          </CustomCard>
        )}

        {false ? (
          <Skeleton variant="rounded" width="100%" height={247} />
        ) : (
          <CustomCard color="#FCF5FF" style="w-full">
            <div className="w-full flex-col items-start gap-3">
              <div className="flex gap-3   items-center">
                <img src={oTwo} alt="0-1" />
                <p className="text-general text-[14px] font-[500]">
                  Total Sales
                </p>
              </div>

              <div className="flex-col flex items-start gap-2 mt-5">
                <p className="text-[14px] text-primary_grey_2">All-time:</p>
                <p className="text-[24px] font-[600] text-general">
                  <FormattedPrice amount={data?.total_savings} />
                </p>
              </div>
              <div className="flex-col flex items-start gap-2 mt-5">
                <p className="text-[14px] text-primary_grey_2">By Filter:</p>
                <p className="text-[24px] font-[600] text-general">
                  <FormattedPrice amount={data?.filtered_savings_sum} />
                </p>
              </div>
            </div>
          </CustomCard>
        )}

        {false ? (
          <Skeleton variant="rounded" width="100%" height={247} />
        ) : (
          <CustomCard color="#FFF7E8" style="w-full">
            <div className="w-full flex-col items-start gap-3">
              <div className="flex gap-3   items-center">
                <img src={oThree} alt="0-1" />
                <p className="text-general text-[14px] font-[500]">
                  Total Merchant
                </p>
              </div>

              <div className="flex-col flex items-start gap-2 mt-5">
                <p className="text-[14px] text-primary_grey_2">All-time:</p>
                <p className="text-[24px] font-[600] text-general">
                  {data?.all_user_count}
                </p>
              </div>
              <div className="flex-col flex items-start gap-2 mt-5">
                <p className="text-[14px] text-primary_grey_2">By Filter:</p>
                <p className="text-[24px] font-[600] text-general">
                  {data?.filter_user_count}
                </p>
              </div>
            </div>
          </CustomCard>
        )}
        {false ? (
          <Skeleton variant="rounded" width="100%" height={247} />
        ) : (
          <CustomCard color="#FCF5FF" style="w-full">
            <div className="w-full flex-col items-start gap-3">
              <div className="flex gap-3   items-center">
                <img src={oThree} alt="0-1" />
                <p className="text-general text-[14px] font-[500]">
                  Total Subscribed Merchants
                </p>
              </div>

              <div className="flex-col flex items-start gap-2 mt-5">
                <p className="text-[14px] text-primary_grey_2">All-time:</p>
                <p className="text-[24px] font-[600] text-general">
                  {data?.all_user_count}
                </p>
              </div>
              <div className="flex-col flex items-start gap-2 mt-5">
                <p className="text-[14px] text-primary_grey_2">By Filter:</p>
                <p className="text-[24px] font-[600] text-general">
                  {data?.filter_user_count}
                </p>
              </div>
            </div>
          </CustomCard>
        )}
        {false ? (
          <Skeleton variant="rounded" width="100%" height={247} />
        ) : (
          <CustomCard color="#F6FFF8" style="w-full">
            <div className="w-full flex-col items-start gap-3">
              <div className="flex gap-3   items-center">
                <img src={oThree} alt="0-1" />
                <p className="text-general text-[14px] font-[500]">
                  Total Revenue from Subscriptions
                </p>
              </div>

              <div className="flex-col flex items-start gap-2 mt-5">
                <p className="text-[14px] text-primary_grey_2">All-time:</p>
                <p className="text-[24px] font-[600] text-general">
                  {data?.all_user_count}
                </p>
              </div>
              <div className="flex-col flex items-start gap-2 mt-5">
                <p className="text-[14px] text-primary_grey_2">By Filter:</p>
                <p className="text-[24px] font-[600] text-general">
                  {data?.filter_user_count}
                </p>
              </div>
            </div>
          </CustomCard>
        )}
      </div>

      {/* corporative data analytics */}

      <div className="w-full rounded-md border-[1px] border-[#E3E3E3] mt-5 p-3 flex flex-col gap-2">
        <p className="text-general font-[500] text-[16px]">Cooperative</p>

        <div className="flex justify-between gap-3 items-center w-full mt-4">
          {isLoading ? (
            <Skeleton variant="rounded" width="100%" height={110} />
          ) : (
            <CustomCorporativeCard
              text="Total Cooperative Members"
              amt={data?.total_coop_members}
            />
          )}

          {isLoading ? (
            <Skeleton variant="rounded" width="100%" height={110} />
          ) : (
            <CustomCorporativeCard
              text="Total Active Members"
              amt={data?.active_user}
            />
          )}
          {isLoading ? (
            <Skeleton variant="rounded" width="100%" height={110} />
          ) : (
            <CustomCorporativeCard
              text="Total Cooperative Savings"
              amt={<FormattedPrice amount={data?.total_coop_saved} />}
            />
          )}
        </div>
      </div>

      {/* loan data analytics */}

      <div className="w-full rounded-md border-[1px] border-[#E3E3E3] mt-5 p-3 flex flex-col gap-2">
        <p className="text-general font-[500] text-[16px]">Loan</p>

        <div className="flex justify-between gap-3 items-center w-full mt-4">
          {isLoading ? (
            <Skeleton variant="rounded" width="100%" height={164} />
          ) : (
            <CustomLoanCard
              time={<FormattedPrice amount={data?.total_loan_amount} />}
              filter={<FormattedPrice amount={data?.filtered_loan_amount} />}
              textOne="Total Loan Disbursed(All-time)"
              textTwo="Total Loan Disbursed(By-Filter)"
            />
          )}
          {isLoading ? (
            <Skeleton variant="rounded" width="100%" height={164} />
          ) : (
            <CustomLoanCard
              time={<FormattedPrice amount={data?.total_loan_repayment} />}
              filter={<FormattedPrice amount={data?.filtered_loan_amount} />}
              textOne="Total Repayment for this Month(All-time)"
              textTwo="Total Amount Paid Till Date(By-Filter)"
            />
          )}
          {isLoading ? (
            <Skeleton variant="rounded" width="100%" height={164} />
          ) : (
            <CustomLoanCard
              type="per"
              time={data?.percentage_loan_repaid}
              textOne="Percentage Loan Repayment"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;
