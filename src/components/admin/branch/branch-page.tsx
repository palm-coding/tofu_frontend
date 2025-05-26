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
import { useAuth } from "@/hooks/useAuth"; // เปลี่ยนมาใช้ useAuth hook
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BranchesDisplay() {
  const router = useRouter();
  const { user } = useAuth(); // ใช้ user จาก useAuth แทน
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ใช้ useEffect เพื่อโหลดข้อมูลสาขา
  useEffect(() => {
    async function loadBranches() {
      try {
        setLoading(true);
        const { branches } = await branchService.getBranches();
        setBranches(branches);
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

  const handleSelectBranch = (branchId: string) => {
    router.push(`/${branchId}`);
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
          {branches.map((branch) => (
            <Card
              key={branch.id}
              className={`overflow-hidden hover:shadow-lg transition-shadow ${
                !branch.active ? "opacity-60" : ""
              }`}
            >
              {/* ส่วนที่เหลือของการ์ดยังเหมือนเดิม */}
              <CardHeader className="bg-backgroud">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    {branch.name}
                  </span>
                  {branch.active !== undefined && (
                    <span
                      className={`text-xs py-1 px-2 rounded-full ${
                        branch.active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {branch.active ? "เปิดให้บริการ" : "ปิดปรับปรุง"}
                    </span>
                  )}
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
                  className="w-full bg-amber-600 hover:bg-amber-700"
                  onClick={() => handleSelectBranch(branch.id)}
                  disabled={branch.active === false}
                >
                  จัดการสาขา
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
