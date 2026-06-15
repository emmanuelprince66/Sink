// Build a query string from an object — skips null / undefined / "" / "undefined".
// Numbers (including 0) and the string "false" are kept since they're valid values.
const buildQuery = (params) => {
  const qs = Object.entries(params || {})
    .filter(([, v]) => {
      if (v === null || v === undefined) return false;
      if (typeof v === "string" && (v === "" || v === "undefined"))
        return false;
      return true;
    })
    .map(
      ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
    )
    .join("&");
  return qs ? `?${qs}` : "";
};

export const allMembersUrl = (
  currentPage,
  rowsPerPage,
  planValue,
  searchValue,
) =>
  `/merchant/users/${buildQuery({
    page: currentPage,
    limit: rowsPerPage,
    plan: planValue,
    search: searchValue,
  })}`;

// GET /merchant/activity/ — User Activity Monitoring
// period: "today" | "last_7_days" | "last_30_days" | "last_90_days" | "custom"
// status_filter: "All" | "Active" | "Inactive" | "Dormant" | "Churned"
export const merchantActivityUrl = (
  currentPage,
  pageSize,
  period,
  statusFilter,
  selectedDates,
) =>
  `/merchant/activity/${buildQuery({
    page: currentPage,
    page_size: pageSize,
    period,
    status_filter: statusFilter,
    start_date: period === "custom" ? selectedDates?.startDate : undefined,
    end_date: period === "custom" ? selectedDates?.endDate : undefined,
  })}`;

// GET /profile/profile/ — Profile Overview (per swagger)
export const overveiwUrl = (selectedDates) =>
  `/profile/profile/${buildQuery({
    start_date: selectedDates?.startDate,
    end_date: selectedDates?.endDate,
  })}`;

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
  return `/merchant/user/${memberId}/`;
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
  filterValue,
) => {
  return `/admin/loan_overview/?page=${currentPage}&limit=${rowsPerPage}&search=${searchValue}&status=${filterValue}`;
};
export const transactionsDataUrl = (
  currentPage,
  rowsPerPage,
  searchValue,
  trxFilter,
) => {
  return `/transaction/all/?page=${currentPage}&limit=${rowsPerPage}&search=${searchValue}&type=${
    trxFilter || "SUBSCRIPTION"
  }`;
};
// Renamed by backend: /transaction/wallet-transactions/ -> /transaction/payments/
// API also dropped the `type` query param.
export const transactionsPaymentDataUrl = (
  currentPage,
  rowsPerPage,
  searchValue,
  // eslint-disable-next-line no-unused-vars
  _trxFilter,
  selectedDates,
) =>
  `/transaction/payments/${buildQuery({
    page: currentPage,
    limit: rowsPerPage,
    start_date: selectedDates?.startDate,
    end_date: selectedDates?.endDate,
    account_name: searchValue,
    search: searchValue,
  })}`;

// /transaction/subscriptions/ — server-side filters: status, cycle, tx_type (all default "All")
// Dates intentionally NOT sent.
// Backward-compat: ignores `selectedDates` (5th arg) — keeps the signature stable
// so existing callers don't need to change.
export const transactionsSubscriptionDataUrl = (
  currentPage,
  rowsPerPage,
  searchValue,
  txType,
  // eslint-disable-next-line no-unused-vars
  _selectedDates,
  extraFilters,
) =>
  `/transaction/subscriptions/${buildQuery({
    page: currentPage,
    page_size: rowsPerPage,
    merchant_name: searchValue,
    tx_type: txType,
    status: extraFilters?.status,
    cycle: extraFilters?.cycle,
  })}`;

export const transactionsMarketAutomationDataUrl = (
  currentPage,
  rowsPerPage,
  searchValue,
  // eslint-disable-next-line no-unused-vars
  _trxFilter,
  selectedDates,
) =>
  `/transaction/market_automation/${buildQuery({
    page: currentPage,
    page_size: rowsPerPage,
    start_date: selectedDates?.startDate,
    end_date: selectedDates?.endDate,
    search: searchValue,
  })}`;

// Renamed by backend: /transaction/campaign_units/ -> /transaction/campaign-overview/
// Also gained a `unit_type` query param (default "All").
export const transactionsCampaignUnitDataUrl = (
  currentPage,
  rowsPerPage,
  searchValue,
  unitType,
  selectedDates,
) =>
  `/transaction/campaign-overview/${buildQuery({
    page: currentPage,
    page_size: rowsPerPage,
    merchant_name: searchValue,
    unit_type: unitType,
    start_date: selectedDates?.startDate,
    end_date: selectedDates?.endDate,
  })}`;
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
  selectedDates,
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
  currentPage,
) => {
  return `/admin/outsanding_dividends/?page=${currentPage}&limit=${rowsPerPage}&search=${searchValue}`;
};

// ─────────── Subscription plans (CRUD) ───────────
export const plansUrl = () => `/plans/`;
export const singlePlanUrl = (id) => `/plans/${id}/`;
// Renamed by backend: /plans/merchant-subscriptions/ -> /plans/subscribers/
// (also fixed the routing-shadow bug where the old path was parsed as /plans/{id}/)
export const merchantSubscriptionsUrl = (
  currentPage,
  rowsPerPage,
  searchValue,
  selectedDates,
) =>
  `/plans/subscribers/${buildQuery({
    page: currentPage,
    limit: rowsPerPage,
    search: searchValue,
    start_date: selectedDates?.startDate,
    end_date: selectedDates?.endDate,
  })}`;

// ─────────── Payments / Transactions list ───────────
// NOTE: /transaction/all/ only accepts type (enum: SUBSCRIPTION|REFERRAL),
// page, limit, search — no status / method / date filters server-side.
export const paymentsListUrl = (currentPage, rowsPerPage, searchValue, type) =>
  `/transaction/all/${buildQuery({
    page: currentPage,
    limit: rowsPerPage,
    search: searchValue,
    type,
  })}`;

export const singleTransactionUrl = (id) => `/transaction/single/${id}/`;

// ─────────── Admin staff (replaces legacy /admin/team/) ───────────
// GET /profile/staffs/ — status: "active"|"inactive", search, page, limit
export const adminStaffsUrl = (currentPage, rowsPerPage, status, searchValue) =>
  `/profile/staffs/${buildQuery({
    page: currentPage,
    limit: rowsPerPage,
    status,
    search: searchValue,
  })}`;

// PATCH /profile/staff/{id}/ — body: { status: "active"|"inactive", role?: "accountant"|"manager"|"moderator"|"support" }
export const singleStaffUrl = (id) => `/profile/staff/${id}/`;

// ─────────── Wallet accounts ───────────
export const walletAccountsUrl = (
  currentPage,
  rowsPerPage,
  searchValue,
  filters,
) =>
  `/profile/wallet-accounts/${buildQuery({
    page: currentPage,
    limit: rowsPerPage,
    search: searchValue,
    account_name: filters?.accountName,
    account_number: filters?.accountNumber,
    business_name: filters?.businessName,
  })}`;

// ─────────── Partners ───────────
export const partnersUrl = (currentPage, rowsPerPage, plan, searchValue) =>
  `/partners/users/${buildQuery({
    page: currentPage,
    limit: rowsPerPage,
    plan,
    search: searchValue,
  })}`;
export const singlePartnerUrl = (id) => `/partners/user/${id}/`;
// POST: body { status: boolean }  (true = suspend, false = unsuspend)
export const suspendPartnerUrl = (id) => `/partners/suspend/${id}/`;
// GET (treats as side-effect approve)
export const approvePartnerUrl = (id) => `/partners/approve/${id}/`;

// ─────────── Engagement Hub ───────────
// NOTE: Backend mounted the /engagement/* routes at the HOST ROOT, not under
// /api/v1/ like everything else. We pass absolute URLs so axios bypasses the
// AuthAxios baseURL (the AuthAxios request interceptor still attaches the
// Bearer token regardless of absolute vs relative URL).
// If/when the backend moves these under /api/v1/, change ENGAGEMENT_BASE.
const ENGAGEMENT_BASE = "https://admin-api.sync360.africa";

// Templates CRUD
// GET /engagement/templates/        — list
// POST /engagement/templates/       — body { name, template_type, channel_type, subject, body }
// PUT /engagement/templates/{id}    — same body
// DELETE /engagement/templates/{id}
export const engagementTemplatesUrl = () =>
  `${ENGAGEMENT_BASE}/engagement/templates/`;
export const engagementTemplateUrl = (id) =>
  `${ENGAGEMENT_BASE}/engagement/templates/${id}`;

// Metrics summary
export const engagementMetricsUrl = () =>
  `${ENGAGEMENT_BASE}/engagement/metrics/`;

// Delivery logs / campaigns — paginated
export const engagementCampaignsUrl = (page, pageSize) =>
  `${ENGAGEMENT_BASE}/engagement/campaigns/${buildQuery({
    page,
    page_size: pageSize,
  })}`;

// Audience reach estimate — POST body { audience_type, audience_value }
export const engagementAudienceEstimateUrl = () =>
  `${ENGAGEMENT_BASE}/engagement/audience-estimate/`;

// Send a broadcast — POST body { title, channel: [], audience_type, audience_value, template_id?, message_body? }
// If template_id is provided, message_body should be null.
export const engagementBroadcastUrl = () =>
  `${ENGAGEMENT_BASE}/engagement/broadcast/`;
