import React, { useState } from "react";
import AllMembers from "./AllMembers";
import MemberProfile from "./MemberProfile";
import MemberFullTransaction from "./MemberFullTransaction";
import { allMembersUrl } from "../../api/endpoint";
import useFetchData from "../../hooks/useFetchData";

const Members = () => {
  const [showComp, setShowComp] = useState("members");
  const [memberId, setMemberId] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [planValue, setPlanValue] = useState("TRIAL");
  const [searchValue, setSearchValue] = useState("");

  const apiUrl = allMembersUrl(
    currentPage,
    rowsPerPage,
    planValue,
    searchValue
  );
  const queryKey = ["fetchMembers", apiUrl, currentPage];
  const { data, error, isLoading } = useFetchData(queryKey, apiUrl);

  const totalPages = data?.total;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleLimitChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to page 1 when limit changes
  };

  const backMembers = () => {
    setShowComp("members");
  };
  return (
    <>
      {showComp === "members" && (
        <AllMembers
          handlePageChange={handlePageChange}
          currentPage={currentPage}
          setShowComp={setShowComp}
          setPlanValue={setPlanValue}
          setMemberId={setMemberId}
          setSearchValue={setSearchValue}
          searchValue={searchValue}
          planValue={planValue}
          totalPages={totalPages}
          data={data || []}
        />
      )}
      {showComp === "profile" && (
        <MemberProfile memberId={memberId} close={backMembers} type="Members" />
      )}
      {showComp === "all" && (
        <MemberFullTransaction setShowComp={setShowComp} />
      )}
    </>
  );
};

export default Members;
