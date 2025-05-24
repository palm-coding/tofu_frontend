import { KitchenDisplay } from "@/components/admin/kitchen/kitchen-page";
import { BranchLayout } from "@/components/layout/branch-layout";

export default function KitchenPage({
  params,
}: {
  params: { branchId: string };
}) {
  return (
    <BranchLayout branchId={params.branchId}>
      <KitchenDisplay branchId={params.branchId} />
    </BranchLayout>
  );
}
