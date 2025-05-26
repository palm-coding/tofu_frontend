"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function BranchesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log("No user detected, redirecting to login");
        router.replace("/login");
      } else if (user.role !== "super_admin") {
        console.log("User is not super_admin, redirecting");
        if (user.role === "branch_owner" && user.branchId) {
          router.replace(`/${user.branchId}`);
        } else {
          router.replace("/");
        }
      }
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span className="text-muted-foreground">กำลังตรวจสอบสิทธิ์...</span>
      </div>
    );
  }

  if (user.role !== "super_admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>กำลังนำทาง...</span>
      </div>
    );
  }

  return children;
}
