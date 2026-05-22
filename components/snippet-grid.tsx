import { type SnippetCardData } from "@/components/snippet-card";
import { SortableGrid } from "@/components/admin/sortable-grid";

export function SnippetGrid({ items, isAdmin }: { items: SnippetCardData[]; isAdmin?: boolean }) {
  return <SortableGrid items={items} isAdmin={isAdmin} />;
}
