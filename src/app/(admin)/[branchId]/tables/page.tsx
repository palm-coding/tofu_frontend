import { TableDisplay } from "@/components/admin/table/table-page";
import { BranchLayout } from "@/components/layout/branch-layout";

export default function TablesPage({
  params,
}: {
  params: { branchId: string };
}) {
  return (
    <BranchLayout branchId={params.branchId}>
      <TableDisplay branchId={params.branchId} />
    </BranchLayout>
  );
}
