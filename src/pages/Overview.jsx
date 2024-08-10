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



  // cooperative card
  const CustomCorporativeCard = ({text , amt}) => {
    return (
      <CustomCard style="w-full">
        <div className="w-full flex flex-col items-start gap-4">
          <p className="text-[14px] font-[400] text-primary_grey_2">{text}</p>
          <p className="text-[20px] font-[600] text-general">{amt}</p>
        </div>
      </CustomCard>
    )
  }
  // loan card
  const CustomLoanCard = ({time,filter ,type , textOne , textTwo}) => {
    return (
      <CustomCard style="w-full">
    {
      type === "per" ? <div className="w-full flex justify-center items-start flex-col gap-3 min-h-[6.7rem]">
          <p className="text-[14px] font-[400] text-primary_grey_2">{textOne}</p>
          <p className="text-[30px] font-[600] text-general">{time}</p>
      </div> : (
          <div className="w-full flex flex-col gap-3 items-start">
        <div className="w-full flex flex-col items-start gap-2">
          <p className="text-[14px] font-[400] text-primary_grey_2">{textOne}</p>
          <p className="text-[20px] font-[600] text-general">{time}</p>
        </div>
        <div className="w-full flex flex-col items-start gap-2">
          <p className="text-[14px] font-[400] text-primary_grey_2">{textTwo}</p>
          <p className="text-[20px] font-[600] text-general">{filter}</p>
        </div>
      </div>
      )
    } 
  
      </CustomCard>
    )
  }

  const apiUrl = overveiwUrl(selectedDates);
  const queryKey = ["fetchOverveiwData", apiUrl];
  const { data, error, isLoading } = useFetchData(queryKey, apiUrl);

  // console.log(data);

  return (
    <div className="w-full flex items-center flex-col ">
      <div className="flex w-full justify-between items-center">
        <p className="font-[600] text-[20px] text-general ">Overview</p>
        <SelectDate />
      </div>

      <div className="w-full flex items-center justify-between gap-9 mt-7">
        {isLoading || !data ? (
          <Skeleton variant="rounded" width="100%" height={247} />
        ) : (
          <CustomCard color="#F6FFF8" style="w-full">
            <div className="w-full flex-col items-start gap-3">
              <div className="flex gap-3   items-center">
                <img src={oOne} alt="0-1" />
                <p className="text-general text-[14px] font-[500]">
                  Total Revenue
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

        {isLoading || !data ? (
          <Skeleton variant="rounded" width="100%" height={247} />
        ) : (
          <CustomCard color="#FCF5FF" style="w-full">
            <div className="w-full flex-col items-start gap-3">
              <div className="flex gap-3   items-center">
                <img src={oTwo} alt="0-1" />
                <p className="text-general text-[14px] font-[500]">
                  Total Savings
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

        {isLoading || !data ? (
          <Skeleton variant="rounded" width="100%" height={247} />
        ) : (
          <CustomCard color="#FFF7E8" style="w-full">
            <div className="w-full flex-col items-start gap-3">
              <div className="flex gap-3   items-center">
                <img src={oThree} alt="0-1" />
                <p className="text-general text-[14px] font-[500]">
                  Registered Users
                </p>
              </div>

              <div className="flex-col flex items-start gap-2 mt-5">
                <p className="text-[14px] text-primary_grey_2">All-time:</p>
                <p className="text-[24px] font-[600] text-general">
                  <FormattedPrice amount={data?.all_user_count} />
                </p>
              </div>
              <div className="flex-col flex items-start gap-2 mt-5">
                <p className="text-[14px] text-primary_grey_2">By Filter:</p>
                <p className="text-[24px] font-[600] text-general">
                  <FormattedPrice amount={data?.filter_user_count} />
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
     <CustomCorporativeCard text="Total Cooperative Members" amt="771"/>
      <CustomCorporativeCard text="Total Active Members" amt="600"/>
      <CustomCorporativeCard text="Total Cooperative Savings" amt={<FormattedPrice amount={20000}/>}/>
     </div>
      </div>


      {/* loan data analytics */}
  
      <div className="w-full rounded-md border-[1px] border-[#E3E3E3] mt-5 p-3 flex flex-col gap-2">
       <p className="text-general font-[500] text-[16px]">Loan</p>
        
     <div className="flex justify-between gap-3 items-center w-full mt-4">
        <CustomLoanCard
        time={<FormattedPrice amount={2004000}/>}
        filter={<FormattedPrice amount={3004000}/>}
        textOne="Total Loan Disbursed(All-time)"
        textTwo="Total Loan Disbursed(By-Filter)"
        />
        <CustomLoanCard
        time={<FormattedPrice amount={2004000}/>}
        filter={<FormattedPrice amount={3004000}/>}
        textOne="Total Repayment for this Month(All-time)"
        textTwo="Total Amount Paid Till Date(By-Filter)"
        />
        <CustomLoanCard
        type="per"
        time="39%"
        textOne="Percentage Loan Repayment"
        />
     </div>
      </div>

    </div>
  );
};

export default Overview;
