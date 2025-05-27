"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Store } from "lucide-react";
import { Branch } from "@/interfaces/branch.interface";
import { branchService } from "@/services/branch.service";
import { useAuth } from "@/context/auth-context";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BranchesDisplay() {
  const router = useRouter();
  const { user } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ใช้ useEffect เพื่อโหลดข้อมูลสาขา
  useEffect(() => {
    async function loadBranches() {
      try {
        setLoading(true);
        // เรียก API อย่างตรงไปตรงมา และใช้ผลลัพธ์โดยตรง
        const branchList = await branchService.getBranches();
        setBranches(branchList);
      } catch (err) {
        console.error("Error loading branches:", err);
        setError("ไม่สามารถโหลดข้อมูลสาขาได้ กรุณาลองอีกครั้ง");
      } finally {
        setLoading(false);
      }
    }

    // ถ้ามี user และเป็น super_admin ให้โหลดข้อมูลสาขา
    if (user && user.role === "super_admin") {
      loadBranches();
    } else if (user && user.role === "branch_owner" && user.branchId) {
      // ถ้าเป็น branch_owner ให้ไปที่สาขาของตัวเอง
      router.replace(`/${user.branchId}`);
    }
  }, [user, router]);

  const handleSelectBranch = (code: string) => {
    router.push(`/${code}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <p>กำลังโหลดข้อมูลสาขา...</p>
      </div>
    );
  }

  // ถ้าไม่ใช่ super_admin ไม่แสดงหน้านี้
  if (!user || user.role !== "super_admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <p>กำลังตรวจสอบสิทธิ์...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-backgroud p-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-amber-800">
            น้ำเต้าหู้พัทลุง by เฮียปาล์มโกคีย์
          </h1>
          <p className="text-amber-600">เลือกสาขาที่ต้องการจัดการ</p>
        </header>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.length > 0 ? (
            branches.map((branch) => (
              <Card
                key={branch._id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <CardHeader className="bg-backgroud">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Store className="h-5 w-5" />
                      {branch.name}
                    </span>
                  </CardTitle>
                  <CardDescription>{branch.address}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm">โทร: {branch.contact}</p>
                  {branch.updatedAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      อัพเดตล่าสุด:{" "}
                      {new Date(branch.updatedAt).toLocaleDateString("th-TH")}
                    </p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-md"
                    onClick={() => handleSelectBranch(branch.code)}
                  >
                    จัดการสาขา
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-10">
              <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">ไม่พบข้อมูลสาขา</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
