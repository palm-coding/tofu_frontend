import { DashboardDisplay } from "@/components/admin/dashboard/dashboard-page";
import { BranchLayout } from "@/components/layout/branch-layout";

export default function BranchDashboardPage({
  params,
}: {
  params: { branchId: string };
}) {
  return (
    <BranchLayout branchId={params.branchId}>
      <DashboardDisplay branchId={params.branchId} />
    </BranchLayout>
  );
}
