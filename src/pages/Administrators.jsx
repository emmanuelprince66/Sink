import { useEffect, useMemo, useState } from "react";
import {
  AddRounded as AddIcon,
  ClearRounded as ClearIcon,
  SearchOutlined as SearchIcon,
  ChevronRightRounded as ChevronRightIcon,
  AdminPanelSettingsOutlined as RoleIcon,
  PeopleAltOutlined as PeopleIcon,
  CheckCircleOutline as ActiveIcon,
  PauseCircleOutline as InactiveIcon,
} from "@mui/icons-material";
import {
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { ToastContainer } from "react-toastify";
import CustomModal from "../components/CustomModal";
import CustomSuccessModal from "../components/CustomSuccessModal";
import CustomPagination from "../components/CustomPagination";
import { adminStaffsUrl } from "../api/endpoint";
import useFetchData from "../hooks/useFetchData";
import AddAdministrator from "./adminstrator/AddAdministrator";
import EditAdministrator from "./adminstrator/EditAdministrator";

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
];

const ROLE_COLORS = {
  manager: { bg: "#EEF2FF", color: "#3949AB" },
  accountant: { bg: "#FFF7E8", color: "#B26A00" },
  moderator: { bg: "#F3E8FF", color: "#7C3AED" },
  support: { bg: "#E0F2FE", color: "#0369A1" },
};

// Normalize a staff record from the API into a stable shape
const mapStaff = (s) => {
  const fullName =
    s?.full_name ||
    [s?.firstname, s?.lastname].filter(Boolean).join(" ") ||
    s?.name ||
    "—";
  const role = (s?.role || "").toLowerCase();
  const status =
    typeof s?.status === "string"
      ? s.status.toLowerCase()
      : s?.is_active === false
      ? "inactive"
      : "active";
  return {
    id: s?.id,
    name: fullName,
    firstname: s?.firstname,
    lastname: s?.lastname,
    email: s?.email || "—",
    phone: s?.phone || null,
    role,
    status,
    raw: s,
  };
};

const Administrators = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(50);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [reFetchTeam, setRefetchTeam] = useState(false);
  const [selected, setSelected] = useState(null);

  const apiUrl = adminStaffsUrl(
    currentPage,
    rowsPerPage,
    statusFilter === "all" ? null : statusFilter,
    search
  );
  const { isLoading, data, refetch } = useFetchData(
    ["fetchStaffs", apiUrl, currentPage, statusFilter, search],
    apiUrl
  );

  useEffect(() => {
    refetch();
  }, [reFetchTeam, refetch]);

  const staffs = useMemo(() => {
    const raw = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.results)
      ? data.results
      : Array.isArray(data)
      ? data
      : [];
    return raw.map(mapStaff);
  }, [data]);

  const counts = useMemo(
    () => ({
      total: data?.total ?? staffs.length,
      active: staffs.filter((s) => s.status === "active").length,
      inactive: staffs.filter((s) => s.status === "inactive").length,
    }),
    [staffs, data]
  );

  const totalPages =
    data?.total_pages ||
    data?.pages ||
    Math.max(1, Math.ceil((data?.total || staffs.length) / rowsPerPage));

  const initials = (name) =>
    name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const openStaffModal = (staff) => {
    setSelected(staff.raw || staff);
    setOpenEdit(true);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-[20px] md:text-[22px] font-semibold text-general">
            Administrators
          </h1>
          <p className="text-[13px] text-primary_grey_2 mt-1">
            Manage admin staff and their roles.
          </p>
        </div>
        <Button
          onClick={() => setOpenAdd(true)}
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            textTransform: "none",
            background: "#02981D",
            boxShadow: "none",
            "&:hover": { background: "#017a17" },
          }}
        >
          Add Admin
        </Button>
      </div>

      {/* Stats */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              borderRadius: "14px",
              boxShadow: "0 1px 3px rgba(16,24,40,.06)",
              border: "1px solid #EFEFEF",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[13px] text-primary_grey_2 font-medium">
                    Total Admins
                  </p>
                  <p className="text-[24px] font-semibold text-general mt-2">
                    {counts.total.toLocaleString()}
                  </p>
                  <p className="text-[12px] text-[#9CA3AF] mt-1">
                    All staff accounts
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-[#EEF2FF] text-[#3949AB] flex items-center justify-center">
                  <PeopleIcon fontSize="small" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4}>
          <Card
            sx={{
              borderRadius: "14px",
              boxShadow: "0 1px 3px rgba(16,24,40,.06)",
              border: "1px solid #EFEFEF",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[13px] text-primary_grey_2 font-medium">
                    Active
                  </p>
                  <p className="text-[24px] font-semibold text-general mt-2">
                    {counts.active.toLocaleString()}
                  </p>
                  <p className="text-[12px] text-[#9CA3AF] mt-1">
                    Currently enabled
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-[#E6F7EA] text-[#02981D] flex items-center justify-center">
                  <ActiveIcon fontSize="small" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4}>
          <Card
            sx={{
              borderRadius: "14px",
              boxShadow: "0 1px 3px rgba(16,24,40,.06)",
              border: "1px solid #EFEFEF",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[13px] text-primary_grey_2 font-medium">
                    Inactive
                  </p>
                  <p className="text-[24px] font-semibold text-general mt-2">
                    {counts.inactive.toLocaleString()}
                  </p>
                  <p className="text-[12px] text-[#9CA3AF] mt-1">
                    Access disabled
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-[#FDECEC] text-[#DC3545] flex items-center justify-center">
                  <InactiveIcon fontSize="small" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main card */}
      <Card
        sx={{
          borderRadius: "14px",
          boxShadow: "0 1px 3px rgba(16,24,40,.06)",
          border: "1px solid #EFEFEF",
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          {/* Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
            <TextField
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name or email"
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
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((f) => {
                const active = statusFilter === f.key;
                return (
                  <Chip
                    key={f.key}
                    label={f.label}
                    onClick={() => {
                      setStatusFilter(f.key);
                      setCurrentPage(1);
                    }}
                    sx={{
                      borderRadius: "8px",
                      px: 1,
                      fontWeight: 500,
                      background: active ? "#F6FFF8" : "#fff",
                      border: active
                        ? "1px solid #02981D"
                        : "1px solid #E3E3E3",
                      color: active ? "#02981D" : "#5E5E5E",
                      "&:hover": {
                        background: active ? "#F6FFF8" : "#F5F5F5",
                      },
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block w-full overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[12px] uppercase tracking-wide text-primary_grey_2 border-b border-[#EFEFEF]">
                  <th className="py-3 px-3">Admin</th>
                  <th className="py-3 px-3">Email</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center">
                      <CircularProgress sx={{ color: "#02981D" }} />
                    </td>
                  </tr>
                ) : staffs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-10 text-center text-primary_grey_2"
                    >
                      No admins match the current filter.
                    </td>
                  </tr>
                ) : (
                  staffs.map((s) => {
                    const role = ROLE_COLORS[s.role] || {
                      bg: "#F5F5F5",
                      color: "#5E5E5E",
                    };
                    return (
                      <tr
                        key={s.id}
                        onClick={() => openStaffModal(s)}
                        className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA] cursor-pointer"
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-[#F6FFF8] text-[#02981D] flex items-center justify-center font-semibold text-[12px] flex-none">
                              {initials(s.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-medium text-general truncate">
                                {s.name}
                              </p>
                              {s.phone && (
                                <p className="text-[11px] text-primary_grey_2 truncate">
                                  {s.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-[12px] text-general">
                          {s.email}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md capitalize"
                            style={{ background: role.bg, color: role.color }}
                          >
                            <RoleIcon sx={{ fontSize: 12 }} />
                            {s.role || "—"}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className="text-[12px] font-medium px-3 py-1 rounded-full capitalize"
                            style={{
                              background:
                                s.status === "active" ? "#E6F7EA" : "#FDECEC",
                              color:
                                s.status === "active" ? "#02981D" : "#DC3545",
                            }}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <ChevronRightIcon sx={{ color: "#5E5E5E" }} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-3">
            {staffs.map((s) => {
              const role = ROLE_COLORS[s.role] || {
                bg: "#F5F5F5",
                color: "#5E5E5E",
              };
              return (
                <div
                  key={s.id}
                  onClick={() => openStaffModal(s)}
                  className="border border-[#EFEFEF] rounded-xl p-4 active:bg-[#FAFAFA]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-full bg-[#F6FFF8] text-[#02981D] flex items-center justify-center font-semibold text-[12px] flex-none">
                        {initials(s.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-medium text-general truncate">
                          {s.name}
                        </p>
                        <p className="text-[11px] text-primary_grey_2 truncate">
                          {s.email}
                        </p>
                      </div>
                    </div>
                    <span
                      className="text-[11px] font-medium px-2 py-1 rounded-full capitalize"
                      style={{
                        background:
                          s.status === "active" ? "#E6F7EA" : "#FDECEC",
                        color: s.status === "active" ? "#02981D" : "#DC3545",
                      }}
                    >
                      {s.status}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span
                      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md capitalize"
                      style={{ background: role.bg, color: role.color }}
                    >
                      <RoleIcon sx={{ fontSize: 12 }} />
                      {s.role || "—"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {!isLoading && staffs.length > 0 && (
            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </CardContent>
      </Card>

      {/* Add admin modal */}
      <CustomModal open={openAdd}>
        <div className="flex flex-col items-start gap-3">
          <div className="flex items-center justify-between w-full mb-3">
            <p className="text-general font-semibold text-[20px]">
              Add New Admin
            </p>
            <ClearIcon
              onClick={() => setOpenAdd(false)}
              sx={{ color: "#1E1E1E", cursor: "pointer" }}
            />
          </div>
          <AddAdministrator
            handleCloseAddAdminModal={() => setOpenAdd(false)}
            setRefetchTeam={setRefetchTeam}
          />
        </div>
      </CustomModal>

      {/* Success modal */}
      <CustomModal open={openSuccess}>
        <CustomSuccessModal
          close={() => setOpenSuccess(false)}
          textOne="Login instructions have been sent to the admin's email."
        />
      </CustomModal>

      {/* Edit admin modal */}
      {openEdit && selected && (
        <CustomModal open={openEdit}>
          <div className="flex flex-col items-start gap-3">
            <div className="flex items-center justify-between w-full mb-3">
              <p className="text-general font-semibold text-[20px]">
                Admin Information
              </p>
              <ClearIcon
                onClick={() => setOpenEdit(false)}
                sx={{ color: "#1E1E1E", cursor: "pointer" }}
              />
            </div>
            <EditAdministrator
              handleCloseAdminInfo={() => setOpenEdit(false)}
              teamMemberModalData={selected}
              setRefetchTeam={setRefetchTeam}
            />
          </div>
        </CustomModal>
      )}

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
