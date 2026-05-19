import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import CardMembershipOutlinedIcon from "@mui/icons-material/CardMembershipOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import Cookies from "js-cookie";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Seight from "../assets/sidebar/Seight";
import Sone from "../assets/sidebar/Sone";
import Sseven from "../assets/sidebar/Sseven";
import Ssix from "../assets/sidebar/Ssix";
import Stwo from "../assets/sidebar/Stwo";
import sinkTwo from "../assets/sink/sink2.png";

const SideBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const isActive = (link) =>
    path === `/${link}` || path.startsWith(`/${link}/`);

  const logOut = () => {
    navigate("/");
    Cookies.remove("authToken");
    Cookies.remove("refreshToken");
  };

  const groups = [
    {
      label: "General",
      items: [
        {
          name: "Overview",
          link: "overview",
          icon: (active) => <Sone color={active ? "white" : "#5E5E5E"} />,
        },
        // Merchants hidden — Users page covers this now
        // {
        //   name: "Merchants",
        //   link: "members",
        //   icon: (active) => <Stwo color={active ? "white" : "#5E5E5E"} />,
        // },
        {
          name: "Users",
          link: "users",
          icon: (active) => (
            <GroupOutlinedIcon
              sx={{ color: active ? "#fff" : "#5E5E5E", fontSize: 20 }}
            />
          ),
        },
        {
          name: "Payments",
          link: "payments",
          icon: (active) => (
            <PaymentsOutlinedIcon
              sx={{ color: active ? "#fff" : "#5E5E5E", fontSize: 20 }}
            />
          ),
        },
        {
          name: "Campaign",
          link: "campaign",
          icon: (active) => <Seight color={active ? "white" : "#5E5E5E"} />,
        },
        {
          name: "Subscriptions",
          link: "subscriptions",
          icon: (active) => (
            <CardMembershipOutlinedIcon
              sx={{ color: active ? "#fff" : "#5E5E5E", fontSize: 20 }}
            />
          ),
        },
      ],
    },
    {
      label: "Operations",
      items: [
        {
          name: "KYC Management",
          link: "kyc",
          icon: (active) => (
            <VerifiedUserOutlinedIcon
              sx={{ color: active ? "#fff" : "#5E5E5E", fontSize: 20 }}
            />
          ),
        },
        {
          name: "Logistics",
          link: "logistics",
          icon: (active) => (
            <LocalShippingOutlinedIcon
              sx={{ color: active ? "#fff" : "#5E5E5E", fontSize: 20 }}
            />
          ),
        },
        {
          name: "Engagement Hub",
          link: "engagement",
          icon: (active) => (
            <CampaignOutlinedIcon
              sx={{ color: active ? "#fff" : "#5E5E5E", fontSize: 20 }}
            />
          ),
        },
        {
          name: "Notifications",
          link: "notifications",
          icon: (active) => <Ssix color={active ? "white" : "#5E5E5E"} />,
        },
      ],
    },
    {
      label: "Administration",
      items: [
        {
          name: "Administrators",
          link: "administrator",
          icon: (active) => <Sseven color={active ? "white" : "#5E5E5E"} />,
        },
        {
          name: "Partners",
          link: "partners",
          icon: (active) => (
            <HandshakeOutlinedIcon
              sx={{ color: active ? "#fff" : "#5E5E5E", fontSize: 20 }}
            />
          ),
        },
        {
          name: "Roles & Permissions",
          link: "roles",
          icon: (active) => (
            <AdminPanelSettingsOutlinedIcon
              sx={{ color: active ? "#fff" : "#5E5E5E", fontSize: 20 }}
            />
          ),
        },
        {
          name: "Register a Merchant",
          link: "r-merchant",
          icon: (active) => <Sseven color={active ? "white" : "#5E5E5E"} />,
        },
      ],
    },
  ];

  return (
    <div className="p-3 h-full flex flex-col">
      <div className="px-2 mt-3 mb-6">
        <div className="h-[50px] w-[100px]">
          <img
            src={sinkTwo}
            alt="sink-logo"
            className="h-full w-full object-fill"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        {groups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="px-3 mb-2 text-[11px] uppercase tracking-wide text-[#9CA3AF] font-semibold">
              {group.label}
            </p>
            <ul className="flex flex-col gap-1">
              {group.items.map((item) => {
                const active = isActive(item.link);
                return (
                  <li key={item.name} className="list-none">
                    <Link
                      to={`/${item.link}`}
                      className={`flex items-center gap-3 py-[10px] px-[14px] rounded-[10px] text-[14px] font-medium transition ${
                        active
                          ? "bg-[#02981D] text-white"
                          : "text-grey_2 hover:bg-[#F6FFF8] hover:text-[#02981D]"
                      }`}
                    >
                      <span className="flex items-center justify-center w-5 h-5">
                        {item.icon(active)}
                      </span>
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <button
        className="mt-3 flex items-center gap-3 text-primary_red py-[10px] px-[14px] w-full rounded-[10px] hover:bg-[#FDECEC] transition"
        onClick={logOut}
      >
        <LogoutOutlinedIcon />
        <span className="text-[14px] font-medium">Logout</span>
      </button>
    </div>
  );
};

export default SideBar;
