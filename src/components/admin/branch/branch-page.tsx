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
import { Store } from "lucide-react";

// Mock branches data
const mockBranches = [
  {
    id: "branch1",
    name: "สาขาตลาดเมืองใหม่",
    address: "ตลาดเมืองใหม่ อ.เมือง จ.พัทลุง",
    contact: "074-123456",
  },
  {
    id: "branch2",
    name: "สาขาตลาดใน",
    address: "ตลาดใน อ.เมือง จ.พัทลุง",
    contact: "074-654321",
  },
  {
    id: "branch3",
    name: "สาขาหาดใหญ่",
    address: "ตลาดกิมหยง อ.หาดใหญ่ จ.สงขลา",
    contact: "074-987654",
  },
];

export default function BranchesDisplay() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in and has super_admin role
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // If user is not super_admin, redirect to their branch
      if (parsedUser.role !== "super_admin") {
        router.push(`/${parsedUser.branchId}`);
      }
    } else {
      // If no user is logged in, redirect to login page
      router.push("/");
    }
    setLoading(false);
  }, [router]);

  const handleSelectBranch = (branchId: string) => {
    router.push(`/${branchId}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        กำลังโหลด...
      </div>
    );
  }

  if (!user || user.role !== "super_admin") {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-amber-800">
            น้ำเต้าหู้พัทลุง by เฮียปาล์มโกคีย์
          </h1>
          <p className="text-amber-600">เลือกสาขาที่ต้องการจัดการ</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockBranches.map((branch) => (
            <Card
              key={branch.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <CardHeader className="bg-amber-100">
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  {branch.name}
                </CardTitle>
                <CardDescription>{branch.address}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm">โทร: {branch.contact}</p>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-amber-600 hover:bg-amber-700"
                  onClick={() => handleSelectBranch(branch.id)}
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
