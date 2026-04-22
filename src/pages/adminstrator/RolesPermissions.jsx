import { useState } from "react";
import {
  Card,
  CardContent,
  Grid,
  Switch,
  Tab,
  Tabs,
  Box,
  Chip,
} from "@mui/material";
import {
  AdminPanelSettingsOutlined as RoleIcon,
  VerifiedUserOutlined as KycIcon,
  SwapHorizOutlined as TxIcon,
  PeopleAltOutlined as UsersIcon,
  CampaignOutlined as CommsIcon,
  LocalShippingOutlined as LogisticsIcon,
} from "@mui/icons-material";

const ROLES = [
  {
    key: "super_admin",
    name: "Super Admin",
    description:
      "Full access to every module. Can create and demote other admins.",
    color: "#02981D",
    bg: "#E6F7EA",
    members: 2,
  },
  {
    key: "kyc_admin",
    name: "KYC Admin",
    description: "Reviews KYC submissions and audits identity verifications.",
    color: "#3949AB",
    bg: "#EEF2FF",
    members: 4,
  },
  {
    key: "support_admin",
    name: "Support Admin",
    description: "Handles user support, account issues, and basic data lookup.",
    color: "#B26A00",
    bg: "#FFF7E8",
    members: 6,
  },
  {
    key: "finance_admin",
    name: "Finance Admin",
    description:
      "Approves withdrawals, reconciles transactions, and pulls reports.",
    color: "#0369A1",
    bg: "#E0F2FE",
    members: 3,
  },
];

const PERMISSIONS = [
  { key: "kyc", label: "KYC Approval", icon: <KycIcon fontSize="small" /> },
  {
    key: "transactions",
    label: "Transaction Access",
    icon: <TxIcon fontSize="small" />,
  },
  {
    key: "users",
    label: "User Management",
    icon: <UsersIcon fontSize="small" />,
  },
  {
    key: "comms",
    label: "Communication Access",
    icon: <CommsIcon fontSize="small" />,
  },
  {
    key: "logistics",
    label: "Logistics Management",
    icon: <LogisticsIcon fontSize="small" />,
  },
  {
    key: "admins",
    label: "Manage Admins & Roles",
    icon: <RoleIcon fontSize="small" />,
  },
];

const DEFAULT_MATRIX = {
  super_admin: {
    kyc: true,
    transactions: true,
    users: true,
    comms: true,
    logistics: true,
    admins: true,
  },
  kyc_admin: {
    kyc: true,
    transactions: false,
    users: true,
    comms: false,
    logistics: false,
    admins: false,
  },
  support_admin: {
    kyc: false,
    transactions: false,
    users: true,
    comms: true,
    logistics: false,
    admins: false,
  },
  finance_admin: {
    kyc: false,
    transactions: true,
    users: false,
    comms: false,
    logistics: false,
    admins: false,
  },
};

const RolesPermissions = () => {
  const [tab, setTab] = useState(0);
  const [matrix, setMatrix] = useState(DEFAULT_MATRIX);

  const togglePerm = (roleKey, permKey) => {
    if (roleKey === "super_admin") return;
    setMatrix((prev) => ({
      ...prev,
      [roleKey]: { ...prev[roleKey], [permKey]: !prev[roleKey][permKey] },
    }));
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-[20px] md:text-[22px] font-semibold text-general">
          Roles & Permissions
        </h1>
        <p className="text-[13px] text-primary_grey_2 mt-1">
          Define what each admin role can do across the platform.
        </p>
      </div>

      {/* Role cards */}
      <Grid container spacing={2}>
        {ROLES.map((r) => (
          <Grid item xs={12} sm={6} md={3} key={r.key}>
            <Card
              sx={{
                borderRadius: "14px",
                boxShadow: "0 1px 3px rgba(16,24,40,.06)",
                border: "1px solid #EFEFEF",
                height: "100%",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center"
                    style={{ background: r.bg, color: r.color }}
                  >
                    <RoleIcon fontSize="small" />
                  </div>
                  <Chip
                    size="small"
                    label={`${r.members} members`}
                    sx={{
                      background: "#F5F5F5",
                      color: "#5E5E5E",
                      fontWeight: 600,
                    }}
                  />
                </div>
                <p className="text-[15px] font-semibold text-general">
                  {r.name}
                </p>
                <p className="text-[12px] text-primary_grey_2 mt-1 leading-relaxed">
                  {r.description}
                </p>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Card
        sx={{
          borderRadius: "14px",
          boxShadow: "0 1px 3px rgba(16,24,40,.06)",
          border: "1px solid #EFEFEF",
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              sx={{
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontSize: "15px",
                  fontWeight: 500,
                  minHeight: 44,
                },
                "& .Mui-selected": { color: "#02981D !important" },
                "& .MuiTabs-indicator": { backgroundColor: "#02981D" },
              }}
            >
              <Tab label="Permission Matrix" />
              <Tab label="Role Definitions" />
            </Tabs>
          </Box>

          {tab === 0 && (
            <>
              {/* Desktop matrix */}
              <div className="hidden md:block w-full overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[12px] uppercase tracking-wide text-primary_grey_2 border-b border-[#EFEFEF]">
                      <th className="py-3 px-3">Permission</th>
                      {ROLES.map((r) => (
                        <th key={r.key} className="py-3 px-3 text-center">
                          {r.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PERMISSIONS.map((p) => (
                      <tr
                        key={p.key}
                        className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA]"
                      >
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-md bg-[#F6FFF8] text-[#02981D] flex items-center justify-center">
                              {p.icon}
                            </div>
                            <span className="text-[13px] text-general font-medium">
                              {p.label}
                            </span>
                          </div>
                        </td>
                        {ROLES.map((r) => (
                          <td key={r.key} className="py-4 px-3 text-center">
                            <Switch
                              checked={!!matrix[r.key][p.key]}
                              disabled={r.key === "super_admin"}
                              onChange={() => togglePerm(r.key, p.key)}
                              sx={{
                                "& .MuiSwitch-switchBase.Mui-checked": {
                                  color: "#02981D",
                                },
                                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                                  {
                                    backgroundColor: "#02981D",
                                  },
                              }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile matrix — stacked per role */}
              <div className="md:hidden flex flex-col gap-3">
                {ROLES.map((r) => (
                  <div
                    key={r.key}
                    className="border border-[#EFEFEF] rounded-xl p-4"
                  >
                    <p className="text-[14px] font-semibold text-general mb-2">
                      {r.name}
                    </p>
                    {PERMISSIONS.map((p) => (
                      <div
                        key={p.key}
                        className="flex items-center justify-between py-1.5"
                      >
                        <div className="flex items-center gap-2">
                          {p.icon}
                          <span className="text-[13px] text-general">
                            {p.label}
                          </span>
                        </div>
                        <Switch
                          checked={!!matrix[r.key][p.key]}
                          disabled={r.key === "super_admin"}
                          onChange={() => togglePerm(r.key, p.key)}
                          sx={{
                            "& .MuiSwitch-switchBase.Mui-checked": {
                              color: "#02981D",
                            },
                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                              { backgroundColor: "#02981D" },
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <p className="text-[12px] text-primary_grey_2 mt-4">
                Super Admin permissions are locked — they always have full
                access.
              </p>
            </>
          )}

          {tab === 1 && (
            <Grid container spacing={2}>
              {ROLES.map((r) => (
                <Grid item xs={12} md={6} key={r.key}>
                  <div className="border border-[#EFEFEF] rounded-xl p-4 h-full">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="h-10 w-10 rounded-full flex items-center justify-center"
                        style={{ background: r.bg, color: r.color }}
                      >
                        <RoleIcon fontSize="small" />
                      </div>
                      <div>
                        <p className="text-[15px] font-semibold text-general">
                          {r.name}
                        </p>
                        <p className="text-[12px] text-primary_grey_2">
                          {r.members} member{r.members === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>
                    <p className="text-[13px] text-general leading-relaxed">
                      {r.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {PERMISSIONS.filter((p) => matrix[r.key][p.key]).map(
                        (p) => (
                          <Chip
                            key={p.key}
                            size="small"
                            label={p.label}
                            sx={{
                              background: "#F6FFF8",
                              color: "#02981D",
                              fontWeight: 500,
                            }}
                          />
                        )
                      )}
                    </div>
                  </div>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RolesPermissions;
