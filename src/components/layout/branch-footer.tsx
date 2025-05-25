"use client";

interface BranchFooterProps {
  branchName: string;
}

export function BranchFooter({ branchName }: BranchFooterProps) {
  return (
    <footer className="bg-background border-t py-4 text-center text-sm text-muted-foreground">
      <div className="container mx-auto">
        <p>
          © {new Date().getFullYear()} น้ำเต้าหู้พัทลุง | {branchName}
        </p>
        <p className="mt-1 text-xs">ระบบบริหารจัดการร้านค้า</p>
      </div>
    </footer>
  );
}
