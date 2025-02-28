
import { useNavigate, useLocation } from "react-router-dom";

export const useBookingNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const branchId = queryParams.get("branch") || localStorage.getItem("selectedBranch");

  return {
    navigate,
    location,
    branchId
  };
};
