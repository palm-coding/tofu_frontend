"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Branch } from "@/interfaces/branch.interface";
import { branchService } from "@/services/branch.service";

interface BranchContextType {
  branch: Branch | null;
  branchCode: string;
  loading: boolean;
  error: string | null;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({
  children,
  branchCode,
}: {
  children: ReactNode;
  branchCode: string;
}) {
  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBranch() {
      try {
        setLoading(true);
        const data = await branchService.getBranchByCode(branchCode);
        setBranch(data);
      } catch (err) {
        console.error("Error fetching branch:", err);
        setError("ไม่สามารถโหลดข้อมูลสาขาได้");
      } finally {
        setLoading(false);
      }
    }

    fetchBranch();
  }, [branchCode]);

  return (
    <BranchContext.Provider
      value={{
        branch,
        branchCode,
        loading,
        error,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const context = useContext(BranchContext);
  if (context === undefined) {
    throw new Error("useBranch must be used within a BranchProvider");
  }
  return context;
}
