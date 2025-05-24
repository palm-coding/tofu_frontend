import { LoginPage } from "@/components/auth/login-page";

export default function Home() {

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-amber-50 to-amber-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-amber-800">
            น้ำเต้าหู้พัทลุง
          </h1>
          <p className="text-amber-600">by เฮียปาล์มโกคีย์</p>
        </div>
        <LoginPage />
      </div>
    </main>
  );
}
