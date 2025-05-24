import { BranchLayout } from "@/components/layout/branch-layout";
import { StockDisplay } from "@/components/admin/stock/stock-page";

export default function StockPage({
  params,
}: {
  params: { branchId: string };
}) {
  return (
    <BranchLayout branchId={params.branchId}>
      <StockDisplay branchId={params.branchId} />
    </BranchLayout>
  );
}
