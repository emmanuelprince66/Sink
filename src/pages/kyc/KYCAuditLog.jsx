import { Divider, Chip } from "@mui/material";
import { ClearRounded as ClearIcon } from "@mui/icons-material";

const ACTIONS = [
  {
    id: 1,
    admin: "Faith Adekunle",
    role: "KYC Admin",
    action: "Approved",
    target: "Adaeze Okoro (Individual)",
    reason: "BVN + NIN auto-verified",
    when: "2026-04-21 14:22",
    color: "#02981D",
    bg: "#E6F7EA",
  },
  {
    id: 2,
    admin: "Faith Adekunle",
    role: "KYC Admin",
    action: "Rejected",
    target: "Chinedu Eze (Individual)",
    reason: "Utility bill older than 3 months",
    when: "2026-04-21 12:08",
    color: "#DC3545",
    bg: "#FDECEC",
  },
  {
    id: 3,
    admin: "Tobi Olarinde",
    role: "Super Admin",
    action: "Re-upload Requested",
    target: "Bola Salami (Individual)",
    reason: "NIN slip is blurry — needs clearer scan",
    when: "2026-04-20 16:45",
    color: "#3949AB",
    bg: "#EEF2FF",
  },
  {
    id: 4,
    admin: "System",
    role: "Automation",
    action: "Auto-Approved",
    target: "Ifeanyi Johnson (BVN/NIN)",
    reason: "Verified via NIBSS API",
    when: "2026-04-19 09:14",
    color: "#02981D",
    bg: "#E6F7EA",
  },
  {
    id: 5,
    admin: "Faith Adekunle",
    role: "KYC Admin",
    action: "Approved",
    target: "Kano Foods Co. (Business)",
    reason: "All business documents valid",
    when: "2026-04-15 10:32",
    color: "#02981D",
    bg: "#E6F7EA",
  },
];

const KYCAuditLog = ({ close }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[18px] font-semibold text-general">
            KYC Audit Log
          </p>
          <p className="text-[12px] text-primary_grey_2">
            Every admin decision is recorded here for compliance.
          </p>
        </div>
        <ClearIcon
          onClick={close}
          sx={{ color: "#1E1E1E", cursor: "pointer" }}
        />
      </div>

      <div className="border border-[#EFEFEF] rounded-xl">
        {ACTIONS.map((row, idx) => (
          <div key={row.id}>
            <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="h-9 w-9 rounded-full bg-[#F5F5F5] text-[#5E5E5E] flex items-center justify-center text-[12px] font-semibold flex-none">
                  {row.admin
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-general">
                    <span>{row.admin}</span>{" "}
                    <span className="text-primary_grey_2 font-normal">
                      ({row.role})
                    </span>
                  </p>
                  <p className="text-[13px] text-general mt-0.5">
                    <span
                      className="px-2 py-0.5 rounded-full text-[11px] font-semibold mr-2"
                      style={{ background: row.bg, color: row.color }}
                    >
                      {row.action}
                    </span>
                    {row.target}
                  </p>
                  <p className="text-[12px] text-primary_grey_2 mt-1 truncate">
                    {row.reason}
                  </p>
                </div>
              </div>
              <span className="text-[12px] text-primary_grey_2 flex-none">
                {row.when}
              </span>
            </div>
            {idx !== ACTIONS.length - 1 && <Divider />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KYCAuditLog;
