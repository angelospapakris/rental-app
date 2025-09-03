import type { PropertyStatus } from "@/types";

export function StatusBadge({ status }: { status: PropertyStatus }) {
  const colorMap: Record<PropertyStatus, string> = {
    APPROVED: "bg-green-100 text-green-700 border-green-300",
    PENDING: "bg-yellow-100 text-yellow-700 border-yellow-300",
    REJECTED: "bg-red-100 text-red-700 border-red-300",
  };

  const labelMap: Record<PropertyStatus, string> = {
    APPROVED: "Εγκεκριμένο",
    PENDING: "Σε αναμονή",
    REJECTED: "Απορρίφθηκε",
  };

  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full border ${colorMap[status]}`}
    >
      {labelMap[status]}
    </span>
  );
}
