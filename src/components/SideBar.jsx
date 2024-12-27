import React from "react";
import wagesLogo from "../assets/ww.svg";
import { useNavigate, Link } from "react-router-dom";
import Cookies from "js-cookie";
import Sone from "../assets/sidebar/Sone";
import Stwo from "../assets/sidebar/Stwo";
import Sthree from "../assets/sidebar/Sthree";
import Sfour from "../assets/sidebar/Sfour";
import Sfive from "../assets/sidebar/Sfive";
import Ssix from "../assets/sidebar/Ssix";
import Sseven from "../assets/sidebar/Sseven";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import Seight from "../assets/sidebar/Seight";
import sinkTwo from "../assets/sink/sink2.png";
const SideBar = () => {
  const navigate = useNavigate();
  const location = window.location.pathname;

  function logOut() {
    navigate("/");
    Cookies.remove("authToken");
    Cookies.remove("refreshToken");
  }

  const mainMenu = [
    {
      name: "Overview",
      component: (
        <span isRightLink={location === "/overview"}>
          <Sone color={location === "/overview" ? "white" : "#5E5E5E"} />
        </span>
      ),
      link: "overview",
    },
    {
      name: "Merchants",
      component: (
        <span isRightLink={location === "/members"}>
          <Stwo color={location === "/members" ? "white" : "#5E5E5E"} />
        </span>
      ),
      link: "members",
    },
    // {
    //   name: "Savings",
    //   component: (
    //     <span isRightLink={location === "/savings"}>
    //       <Sthree color={location === "/savings" ? "white" : "#5E5E5E"} />
    //     </span>
    //   ),
    //   link: "savings",
    // },
    // {
    //   name: "Investments",
    //   component: (
    //     <span isRightLink={location === "/investments"}>
    //       <Sfour color={location === "/investments" ? "white" : "#5E5E5E"} />
    //     </span>
    //   ),
    //   link: "investments",
    // },
    // {
    //   name: "Loans",
    //   component: (
    //     <span isRightLink={location === "/loans"}>
    //       <Sfive color={location === "/loans" ? "white" : "#5E5E5E"} />
    //     </span>
    //   ),
    //   link: "loans",
    // },
    {
      name: "Transactions",
      component: (
        <span isRightLink={location === "/transactions"}>
          <Seight color={location === "/transactions" ? "white" : "#5E5E5E"} />
        </span>
      ),
      link: "transactions",
    },
    {
      name: "Notifications",
      component: (
        <span isRightLink={location === "/notifications"}>
          <Ssix color={location === "/notifications" ? "white" : "#5E5E5E"} />
        </span>
      ),
      link: "notifications",
    },

    {
      name: "Administrator",
      component: (
        <span isRightLink={location === "/admin"}>
          <Sseven color={location === "/administrator" ? "white" : "#5E5E5E"} />
        </span>
      ),
      link: "administrator",
    },
    {
      name: "Register a Merchant",
      component: (
        <span isRightLink={location === "/r-merchant"}>
          <Sseven color={location === "/r-merchant" ? "white" : "#5E5E5E"} />
        </span>
      ),
      link: "r-merchant",
    },
  ];
  return (
    <div className="p-3 ">
      <div className="h-full w-full mb-[30%] mt-[5%]">
        {/* <img src={wagesLogo} className="object-cover" alt="wages-icon" /> */}
        <div className="h-[50px] w-[100px]">
          <img
            src={sinkTwo}
            alt="sink-logo"
            className="h-full w-full object-fill "
          />
        </div>
      </div>

      <div>
        {mainMenu?.map((item) => {
          return (
            <>
              <li
                key={item.name}
                className={`py-[10px] px-[16px] list-none ${
                  location === `/${item.link}`
                    ? "bg-[#02981D] text-[#fff]"
                    : "bg-transparent text-grey_2"
                }  w-full mb-3  rounded-[10px]`}
              >
                <Link
                  to={`/${item.link}`}
                  className="flex flex-row items-center gap-2  text-[14px] leading-[17.07px] font-[500] "
                >
                  {item.component}

                  {item.name}
                </Link>
              </li>
            </>
          );
        })}

        <button
          className=" flex items-center gap-3 text-primary_red py-[10px] px-[16px] w-full mb-3 rounded-[10px]"
          onClick={logOut}
        >
          <LogoutOutlinedIcon />
          Logout
        </button>
      </div>
    </div>
  );
};

export default SideBar;
