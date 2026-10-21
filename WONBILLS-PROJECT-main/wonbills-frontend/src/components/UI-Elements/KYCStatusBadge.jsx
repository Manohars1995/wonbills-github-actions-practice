import { KYC_STATUS_CONFIG } from "../UI-Components/Settings/utils"; 

const normalizeKYCStatus = (status) => {
  switch (status) {
    case "activated":
    case "needs_clarification":
    case "under_review":
    case "rejected":
      return status;
    default:
      return "failed";
  }
};


const KYCStatusBadge = ({ status }) => {
  const normalizedStatus = normalizeKYCStatus(status);
  const config = KYC_STATUS_CONFIG[normalizedStatus];

  return (
    <span
      className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${config.className}`}
    >
      {config.label}
    </span>
  );
};

export default KYCStatusBadge;
