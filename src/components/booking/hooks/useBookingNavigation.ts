
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export const useBookingNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [branchId, setBranchId] = useState<string | null>(null);

  // Use effect to ensure branchId is fetched after component mount
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const urlBranchId = queryParams.get("branch");
    const storedBranchId = localStorage.getItem("selectedBranch");
    
    // Priority: URL param > localStorage
    const resolvedBranchId = urlBranchId || storedBranchId;
    
    console.log('useBookingNavigation resolved branchId:', resolvedBranchId);
    
    // Set branchId state
    setBranchId(resolvedBranchId);
    
    // If we found a branchId from localStorage but it's not in the URL, update the URL
    if (!urlBranchId && storedBranchId) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set("branch", storedBranchId);
      navigate(newUrl.pathname + newUrl.search, { replace: true });
    }
  }, [location.search, navigate]);

  return {
    navigate,
    location,
    branchId
  };
};
