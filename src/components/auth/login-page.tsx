"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({
    message: "กรุณาใส่อีเมลให้ถูกต้อง",
  }),
  password: z.string().min(6, {
    message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
  }),
});

// Mock user data
const mockUsers = [
  {
    id: "1",
    email: "admin@tofupos.com",
    password: "admin123",
    name: "Super Admin",
    role: "super_admin",
    branchId: null,
  },
  {
    id: "2",
    email: "branch1@tofupos.com",
    password: "branch123",
    name: "Branch Owner 1",
    role: "branch_owner",
    branchId: "branch1",
  },
  {
    id: "3",
    email: "branch2@tofupos.com",
    password: "branch123",
    name: "Branch Owner 2",
    role: "branch_owner",
    branchId: "branch2",
  },
];

export function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Find user with matching email and password
    const user = mockUsers.find(
      (u) => u.email === values.email && u.password === values.password
    );

    if (!user) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      return;
    }

    // Clear any previous errors
    setError(null);

    // Store user info in localStorage (in a real app, you'd use a proper auth solution)
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: user.id,
        name: user.name,
        role: user.role,
        branchId: user.branchId,
      })
    );

    // Redirect based on role - UPDATED PATHS
    if (user.role === "super_admin") {
      router.push("/branches");
    } else if (user.role === "branch_owner") {
      router.push(`/${user.branchId}`);
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>เข้าสู่ระบบ</CardTitle>
        <CardDescription>
          กรุณาเข้าสู่ระบบเพื่อจัดการร้านน้ำเต้าหู้
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>อีเมล</FormLabel>
                  <FormControl>
                    <Input placeholder="your@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>รหัสผ่าน</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="******" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              เข้าสู่ระบบ
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        <div>
          <p>ทดลองใช้งาน:</p>
          <p>Super Admin: admin@tofupos.com / admin123</p>
          <p>Branch Owner: branch1@tofupos.com / branch123</p>
        </div>
      </CardFooter>
    </Card>
  );
}
