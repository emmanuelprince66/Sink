export const allMembersUrl = (
  currentPage,
  rowsPerPage,
  planValue,
  searchValue
) => {
  return `/merchant/users/?page=${currentPage}&limit=${rowsPerPage}&plan=${planValue}&search=${searchValue}`;
};

export const overveiwUrl = (selectedDates) => {
  return `/admin/overview/?start_date=${selectedDates?.startDate}&end_date=${selectedDates?.endDate}`;
};

export const corporativeDataUrl = () => {
  return `/admin/coporative_stats/`;
};
export const corporativeMembersUrl = (searchValue, currentPage) => {
  return `/admin/active_coporative_members/?search=${searchValue}&page=${currentPage}`;
};
export const targetSavingsUrl = () => {
  return "/admin/savings_stats";
};
export const membersProfileUrl = (memberId) => {
  return `/merchant/user/${memberId}`;
};
export const investmentListDataUrl = (filterValue, selectedDates) => {
  return `/admin/investment_stats/?status=${filterValue}&start_date=${selectedDates?.startDate}&end_date=${selectedDates?.endDate}`;
};
export const loanStatisticsDataUrl = () => {
  return "/admin/loan_dashboard/";
};

export const approveLoanUrl = (id) => {
  return `/admin/accept_loan/${id}`;
};
export const declineLoanUrl = (id) => {
  return `/admin/reject_loan/${id}`;
};
export const loanRequestsDataUrl = (
  currentPage,
  rowsPerPage,
  searchValue,
  filterValue
) => {
  return `/admin/loan_overview/?page=${currentPage}&limit=${rowsPerPage}&search=${searchValue}&status=${filterValue}`;
};
export const transactionsDataUrl = (
  currentPage,
  rowsPerPage,
  searchValue,
  trxFilter
) => {
  return `/admin/transactions/?page=${currentPage}&limit=${rowsPerPage}&search=${searchValue}&type=${trxFilter}`;
};
export const checkNameForWithdrawalApprovalUrl = (id) => {
  return `/admin/check_name/${id}`;
};
export const administratorDataUrl = () => {
  return "/admin/team/";
};
export const acceptWithdrawalUrl = (id) => {
  return `/admin/accept_withdrawal/${id}/`;
};
export const referralDataUrl = (
  searchValue,
  currentPage,
  rowsPerPage,
  selectedDates
) => {
  return `/admin/referals?searchValue=${searchValue}&page=${currentPage}&limit=${rowsPerPage}&start_date=${selectedDates?.startDate}&end_date=${selectedDates?.endDate}`;
};
export const corporativeBreakdownUrl = (id, selectedDates) => {
  return `/admin/user/coop_breakdown/${id}?start_date=${selectedDates?.startDate}&end_date=${selectedDates?.endDate}`;
};
export const personalSavingsBreakdownUrl = (id, selectedDates) => {
  return `/admin/user/savings_breakdown/${id}?start_date=${selectedDates?.startDate}&end_date=${selectedDates?.endDate}`;
};
export const personalInterestBreakdownUrl = (id, selectedDates) => {
  return `/admin/user/savings_interest/${id}?start_date=${selectedDates?.startDate}&end_date=${selectedDates?.endDate}`;
};
export const savingsBreakdownUrl = (id, selectedDates) => {
  return `/admin/user/savings/${id}?start_date=${selectedDates?.startDate}&end_date=${selectedDates?.endDate}`;
};
export const activeInvestmentsUrl = (id) => {
  return `/admin/user/active_investment/${id}`;
};
export const investmentsHistoryUrl = (id) => {
  return `/admin/user/active_investment/${id}`;
};
export const investmentsDetailsUrl = (id) => {
  return `/admin/single_investment/${id}`;
};
export const investmentInvestorUrl = (id) => {
  return `/admin/investment_investors/${id}`;
};

export const usersPendingDividendUrl = (
  searchValue,
  rowsPerPage,
  currentPage
) => {
  return `/admin/outsanding_dividends/?page=${currentPage}&limit=${rowsPerPage}&search=${searchValue}`;
};
