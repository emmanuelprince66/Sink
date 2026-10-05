import { useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputAdornment,
  Snackbar,
  TextField,
} from "@mui/material";
import {
  CheckCircleOutline as ApprovedIcon,
  CloseRounded as CloseIcon,
  ErrorOutline as RejectedIcon,
  LanguageOutlined as DomainIcon,
  OpenInNewRounded as ExternalIcon,
  SearchOutlined as SearchIcon,
  TaskAltRounded as ReviewIcon,
} from "@mui/icons-material";
import PropTypes from "prop-types";

const INITIAL_BUSINESSES = [
  {
    id: "4e2832b9-2dcb-41cf-b346-af54cd6304b0",
    name: "mycliq",
    type: "Minimart & Retail",
    owner: {
      firstname: "Samson",
      lastname: "Akinola",
      email: "popsicool1234@gmail.com",
      phone: "+2348069482021",
    },
    country: "Nigeria",
    state: "Abia State",
    city: "Umuahia",
    street: "3",
    logo: "https://sync360-bucket.s3.amazonaws.com/business/scaled_1000242646_y2xLf5A.png",
    store_url: "mycliq",
    custom_domain: "mycliq.neospringcare.com.ng",
    custom_domain_approved: false,
    submitted_at: "2026-09-29T10:42:00Z",
  },
  {
    id: "3f634978-29a1-4c04-9bb8-4eac31bca2d2",
    name: "Ada's Pantry",
    type: "Food & Grocery",
    owner: {
      firstname: "Ada",
      lastname: "Okafor",
      email: "ada.okafor@example.com",
      phone: "+2348035551212",
    },
    country: "Nigeria",
    state: "Lagos State",
    city: "Ikeja",
    street: "14 Allen Avenue",
    logo: null,
    store_url: "adaspantry",
    custom_domain: "shop.adaspantry.ng",
    custom_domain_approved: false,
    submitted_at: "2026-10-02T08:15:00Z",
  },
  {
    id: "8a01dbdd-a3e4-42fc-8de2-e896946aa174",
    name: "Northstar Outfitters",
    type: "Fashion & Apparel",
    owner: {
      firstname: "Mariam",
      lastname: "Bello",
      email: "mariam@northstar.example",
      phone: "+2348092400011",
    },
    country: "Nigeria",
    state: "Kano State",
    city: "Kano",
    street: "22 Murtala Way",
    logo: null,
    store_url: "northstar",
    custom_domain: "northstarwear.com",
    custom_domain_approved: true,
    submitted_at: "2026-09-18T12:10:00Z",
  },
  {
    id: "38e23796-30d8-4f6c-a628-d3df1af61d33",
    name: "Green Basket",
    type: "Food & Grocery",
    owner: {
      firstname: "Emeka",
      lastname: "Nwosu",
      email: "emeka@greenbasket.example",
      phone: "+2348021180044",
    },
    country: "Nigeria",
    state: "Enugu State",
    city: "Enugu",
    street: "7 New Market Road",
    logo: null,
    store_url: "greenbasket",
    custom_domain: "greenbasket.ng",
    custom_domain_approved: false,
    submitted_at: "2026-10-04T14:35:00Z",
  },
  {
    id: "9d4913f7-b8cb-4d43-8edb-dbdc22ebefc1",
    name: "Luxe Living",
    type: "Home & Living",
    owner: {
      firstname: "Tomiwa",
      lastname: "Adeyemi",
      email: "tomiwa@luxeliving.example",
      phone: "+2348077319012",
    },
    country: "Nigeria",
    state: "Oyo State",
    city: "Ibadan",
    street: "2 Ring Road",
    logo: null,
    store_url: "luxeliving",
    custom_domain: "shop.luxeliving.com",
    custom_domain_approved: true,
    submitted_at: "2026-09-12T09:20:00Z",
  },
  {
    id: "65807ad1-bda5-4b33-a16f-b95ecde8878f",
    name: "Daily Dose Pharmacy",
    type: "Health & Beauty",
    owner: {
      firstname: "Chidinma",
      lastname: "Eze",
      email: "chidinma@dailydose.example",
      phone: "+2348067102200",
    },
    country: "Nigeria",
    state: "Anambra State",
    city: "Awka",
    street: "31 Zik Avenue",
    logo: null,
    store_url: "dailydose",
    custom_domain: "dailydosepharmacy.ng",
    custom_domain_approved: false,
    submitted_at: "2026-10-05T07:50:00Z",
  },
];

const TABS = [
  { key: "all", label: "All domains" },
  { key: "pending", label: "Pending review" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

const getDomainStatus = (business) =>
  business.review_status ||
  (business.custom_domain_approved ? "approved" : "pending");

const formatDate = (date) => {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const StatCard = ({ icon, color, bg, label, value, caption }) => (
  <Card
    sx={{
      height: "100%",
      border: "1px solid #EFEFEF",
      borderRadius: "14px",
      boxShadow: "0 1px 3px rgba(16,24,40,.06)",
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] text-primary_grey_2 font-medium">{label}</p>
          <p className="text-[24px] font-semibold text-general mt-2">{value}</p>
          <p className="text-[12px] text-[#9CA3AF] mt-1">{caption}</p>
        </div>
        <div
          className="h-10 w-10 rounded-full flex items-center justify-center flex-none"
          style={{ background: bg, color }}
        >
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

StatCard.propTypes = {
  icon: PropTypes.node.isRequired,
  color: PropTypes.string.isRequired,
  bg: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  caption: PropTypes.string.isRequired,
};

const DomainStatus = ({ status }) => {
  const styles = {
    pending: { label: "Pending review", bg: "#FFF7E8", color: "#B26A00" },
    approved: { label: "Approved", bg: "#E6F7EA", color: "#02981D" },
    rejected: { label: "Rejected", bg: "#FDECEC", color: "#DC3545" },
  }[status] || { label: status, bg: "#F5F5F5", color: "#5E5E5E" };

  return (
    <Chip
      size="small"
      label={styles.label}
      sx={{
        color: styles.color,
        backgroundColor: styles.bg,
        borderRadius: "7px",
        fontSize: "12px",
        fontWeight: 600,
      }}
    />
  );
};

DomainStatus.propTypes = {
  status: PropTypes.string.isRequired,
};

const DomainManagement = () => {
  const [businesses, setBusinesses] = useState(INITIAL_BUSINESSES);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [decision, setDecision] = useState(null);
  const [rejectionNote, setRejectionNote] = useState("");
  const [feedback, setFeedback] = useState("");

  const filteredBusinesses = useMemo(() => {
    const term = search.trim().toLowerCase();
    return businesses.filter((business) => {
      const status = getDomainStatus(business);
      const matchesTab = activeTab === "all" || status === activeTab;
      const matchesSearch =
        !term ||
        [
          business.name,
          business.custom_domain,
          business.store_url,
          business.type,
          business.owner?.firstname,
          business.owner?.lastname,
          business.owner?.email,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term);
      return Boolean(business.custom_domain) && matchesTab && matchesSearch;
    });
  }, [activeTab, businesses, search]);

  const metrics = useMemo(() => {
    const domains = businesses.filter((business) => business.custom_domain);
    return {
      total: domains.length,
      pending: domains.filter((business) => getDomainStatus(business) === "pending")
        .length,
      approved: domains.filter(
        (business) => getDomainStatus(business) === "approved",
      ).length,
      rejected: domains.filter(
        (business) => getDomainStatus(business) === "rejected",
      ).length,
    };
  }, [businesses]);

  const requestDecision = (status) => {
    setDecision(status);
    setRejectionNote("");
  };

  const applyDecision = () => {
    if (!selectedBusiness || !decision) return;
    if (decision === "rejected" && !rejectionNote.trim()) return;

    setBusinesses((current) =>
      current.map((business) =>
        business.id === selectedBusiness.id
          ? {
              ...business,
              review_status: decision,
              custom_domain_approved: decision === "approved",
              rejection_note:
                decision === "rejected" ? rejectionNote.trim() : null,
            }
          : business,
      ),
    );
    setSelectedBusiness((current) =>
      current
        ? {
            ...current,
            review_status: decision,
            custom_domain_approved: decision === "approved",
            rejection_note:
              decision === "rejected" ? rejectionNote.trim() : null,
          }
        : current,
    );
    setDecision(null);
    setFeedback(
      decision === "approved"
        ? "Domain approved in this preview."
        : "Domain rejected in this preview.",
    );
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-[20px] md:text-[22px] font-semibold text-general">
            Domain Management
          </h1>
          <p className="text-[13px] text-primary_grey_2 mt-1">
            Review custom domains submitted by businesses and manage their approval.
          </p>
        </div>
      </div>

      <Alert
        severity="info"
        icon={<DomainIcon fontSize="inherit" />}
        sx={{ borderRadius: "10px" }}
      >
        Preview screen — this uses sample businesses. Approvals and rejections
        only update this page temporarily; no backend request is sent.
      </Alert>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<DomainIcon fontSize="small" />}
            color="#0369A1"
            bg="#E0F2FE"
            label="Custom domains"
            value={metrics.total}
            caption="Businesses with a domain"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<ReviewIcon fontSize="small" />}
            color="#B26A00"
            bg="#FFF7E8"
            label="Pending review"
            value={metrics.pending}
            caption="Awaiting admin decision"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<ApprovedIcon fontSize="small" />}
            color="#02981D"
            bg="#E6F7EA"
            label="Approved"
            value={metrics.approved}
            caption="Ready to use"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<RejectedIcon fontSize="small" />}
            color="#DC3545"
            bg="#FDECEC"
            label="Rejected"
            value={metrics.rejected}
            caption="Needs business follow-up"
          />
        </Grid>
      </Grid>

      <Card
        sx={{
          border: "1px solid #EFEFEF",
          borderRadius: "14px",
          boxShadow: "0 1px 3px rgba(16,24,40,.06)",
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-5">
            <TextField
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search business, domain, owner or email"
              size="small"
              fullWidth
              sx={{ maxWidth: { lg: 400 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#757575" }} />
                  </InputAdornment>
                ),
              }}
            />
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Domain status">
              {TABS.map((tab) => {
                const active = activeTab === tab.key;
                const count =
                  tab.key === "all"
                    ? metrics.total
                    : metrics[tab.key];
                return (
                  <Button
                    key={tab.key}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveTab(tab.key)}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      border: active ? "1px solid #02981D" : "1px solid #E3E3E3",
                      color: active ? "#02981D" : "#5E5E5E",
                      background: active ? "#F6FFF8" : "#fff",
                      "&:hover": {
                        background: active ? "#F6FFF8" : "#F5F5F5",
                      },
                    }}
                  >
                    {tab.label} ({count})
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="hidden md:block w-full overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[12px] uppercase tracking-wide text-primary_grey_2 border-b border-[#EFEFEF]">
                  <th className="py-3 px-3">Business</th>
                  <th className="py-3 px-3">Custom domain</th>
                  <th className="py-3 px-3">Owner</th>
                  <th className="py-3 px-3">Submitted</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBusinesses.length ? (
                  filteredBusinesses.map((business) => {
                    const status = getDomainStatus(business);
                    return (
                      <tr
                        key={business.id}
                        className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA]"
                      >
                        <td className="py-4 px-3">
                          <button
                            className="flex items-center gap-3 text-left"
                            onClick={() => setSelectedBusiness(business)}
                          >
                            <Avatar
                              src={business.logo || undefined}
                              alt=""
                              sx={{
                                width: 36,
                                height: 36,
                                bgcolor: "#E6F7EA",
                                color: "#02981D",
                                fontSize: 14,
                              }}
                            >
                              {business.name.slice(0, 1).toUpperCase()}
                            </Avatar>
                            <span>
                              <span className="block text-[13px] font-semibold text-general">
                                {business.name}
                              </span>
                              <span className="block text-[12px] text-primary_grey_2">
                                {business.type}
                              </span>
                            </span>
                          </button>
                        </td>
                        <td className="py-4 px-3 text-[13px] text-general">
                          {business.custom_domain}
                        </td>
                        <td className="py-4 px-3">
                          <span className="block text-[13px] text-general">
                            {business.owner.firstname} {business.owner.lastname}
                          </span>
                          <span className="block text-[12px] text-primary_grey_2">
                            {business.owner.email}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-[13px] text-primary_grey_2">
                          {formatDate(business.submitted_at)}
                        </td>
                        <td className="py-4 px-3">
                          <DomainStatus status={status} />
                        </td>
                        <td className="py-4 px-3 text-right">
                          <Button
                            onClick={() => setSelectedBusiness(business)}
                            sx={{
                              color: "#02981D",
                              textTransform: "none",
                              fontWeight: 600,
                            }}
                          >
                            Review
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-[13px] text-primary_grey_2"
                    >
                      No custom domains match your search or selected status.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden flex flex-col gap-3">
            {filteredBusinesses.length ? (
              filteredBusinesses.map((business) => (
                <button
                  key={business.id}
                  onClick={() => setSelectedBusiness(business)}
                  className="w-full border border-[#EFEFEF] rounded-xl p-4 text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        src={business.logo || undefined}
                        alt=""
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: "#E6F7EA",
                          color: "#02981D",
                          fontSize: 14,
                        }}
                      >
                        {business.name.slice(0, 1).toUpperCase()}
                      </Avatar>
                      <span className="min-w-0">
                        <span className="block text-[13px] font-semibold text-general">
                          {business.name}
                        </span>
                        <span className="block truncate text-[12px] text-primary_grey_2">
                          {business.custom_domain}
                        </span>
                      </span>
                    </div>
                    <DomainStatus status={getDomainStatus(business)} />
                  </div>
                  <span className="block text-[12px] text-primary_grey_2 mt-3">
                    Owner: {business.owner.firstname} {business.owner.lastname}
                  </span>
                </button>
              ))
            ) : (
              <p className="py-10 text-center text-[13px] text-primary_grey_2">
                No custom domains match your search or selected status.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(selectedBusiness)}
        onClose={() => setSelectedBusiness(null)}
        fullWidth
        maxWidth="sm"
      >
        {selectedBusiness && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={selectedBusiness.logo || undefined}
                    alt=""
                    sx={{
                      width: 44,
                      height: 44,
                      bgcolor: "#E6F7EA",
                      color: "#02981D",
                    }}
                  >
                    {selectedBusiness.name.slice(0, 1).toUpperCase()}
                  </Avatar>
                  <div>
                    <p className="text-[18px] font-semibold text-general">
                      {selectedBusiness.name}
                    </p>
                    <p className="text-[12px] text-primary_grey_2">
                      {selectedBusiness.type}
                    </p>
                  </div>
                </div>
                <Button
                  aria-label="Close business details"
                  onClick={() => setSelectedBusiness(null)}
                  sx={{ minWidth: 36, color: "#667085" }}
                >
                  <CloseIcon />
                </Button>
              </div>
            </DialogTitle>
            <DialogContent dividers>
              <div className="flex flex-col gap-5 py-1">
                <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
                  <p className="text-[12px] text-primary_grey_2 mb-1">
                    Requested custom domain
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="break-all text-[15px] font-semibold text-general">
                      {selectedBusiness.custom_domain}
                    </p>
                    <ExternalIcon sx={{ color: "#667085", flex: "none" }} />
                  </div>
                  <div className="mt-3">
                    <DomainStatus status={getDomainStatus(selectedBusiness)} />
                  </div>
                </div>

                <div>
                  <p className="text-[12px] uppercase tracking-wide text-primary_grey_2 mb-3">
                    Business details
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    <Detail label="Store URL" value={selectedBusiness.store_url} />
                    <Detail label="Business type" value={selectedBusiness.type} />
                    <Detail
                      label="Owner"
                      value={`${selectedBusiness.owner.firstname} ${selectedBusiness.owner.lastname}`}
                    />
                    <Detail label="Email" value={selectedBusiness.owner.email} />
                    <Detail label="Phone" value={selectedBusiness.owner.phone} />
                    <Detail
                      label="Location"
                      value={`${selectedBusiness.city}, ${selectedBusiness.state}`}
                    />
                    <Detail
                      label="Submitted"
                      value={formatDate(selectedBusiness.submitted_at)}
                    />
                  </div>
                </div>

                {selectedBusiness.rejection_note && (
                  <Alert severity="error">
                    Previous review note: {selectedBusiness.rejection_note}
                  </Alert>
                )}
              </div>
            </DialogContent>
            <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
              <Button
                onClick={() => requestDecision("rejected")}
                disabled={getDomainStatus(selectedBusiness) === "rejected"}
                startIcon={<RejectedIcon />}
                sx={{ color: "#DC3545", textTransform: "none" }}
              >
                Reject domain
              </Button>
              <Button
                onClick={() => requestDecision("approved")}
                disabled={getDomainStatus(selectedBusiness) === "approved"}
                variant="contained"
                startIcon={<ApprovedIcon />}
                sx={{
                  background: "#02981D",
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": { background: "#017A17", boxShadow: "none" },
                }}
              >
                Approve domain
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog
        open={Boolean(decision)}
        onClose={() => setDecision(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          {decision === "approved" ? "Approve custom domain?" : "Reject custom domain?"}
        </DialogTitle>
        <DialogContent>
          <p className="text-[13px] text-primary_grey_2 mb-4">
            {decision === "approved"
              ? `This preview will mark ${selectedBusiness?.custom_domain} as approved.`
              : `This preview will mark ${selectedBusiness?.custom_domain} as rejected. Add a reason for the business record.`}
          </p>
          {decision === "rejected" && (
            <TextField
              value={rejectionNote}
              onChange={(event) => setRejectionNote(event.target.value)}
              label="Rejection reason"
              placeholder="Explain what needs to be corrected"
              multiline
              minRows={3}
              fullWidth
              required
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDecision(null)}
            sx={{ textTransform: "none", color: "#5E5E5E" }}
          >
            Cancel
          </Button>
          <Button
            onClick={applyDecision}
            disabled={decision === "rejected" && !rejectionNote.trim()}
            variant="contained"
            sx={{
              textTransform: "none",
              background: decision === "rejected" ? "#DC3545" : "#02981D",
              boxShadow: "none",
              "&:hover": {
                background: decision === "rejected" ? "#B42318" : "#017A17",
                boxShadow: "none",
              },
            }}
          >
            Confirm {decision === "approved" ? "approval" : "rejection"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={3500}
        onClose={() => setFeedback("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setFeedback("")}
          severity="success"
          sx={{ width: "100%" }}
        >
          {feedback}
        </Alert>
      </Snackbar>
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div className="min-w-0">
    <p className="text-[11px] text-primary_grey_2">{label}</p>
    <p className="break-words text-[13px] font-medium text-general">{value || "—"}</p>
  </div>
);

Detail.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
};

export default DomainManagement;
