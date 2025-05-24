import { BranchLayout } from "@/components/layout/branch-layout";
import { MenuDisplay } from "@/components/admin/menu/menu-page";

export default function MenuPage({ params }: { params: { branchId: string } }) {
  return (
    <BranchLayout branchId={params.branchId}>
      <MenuDisplay branchId={params.branchId} />
    </BranchLayout>
  );
}
