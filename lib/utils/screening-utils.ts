export function getStatusColor(status: string): string {
  switch (status) {
    case "APPROVED":
      return "bg-green-100 text-green-700";
    case "GRANTED":
      return "bg-purple-100 text-purple-700";
    case "REJECTED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-orange-100 text-orange-700";
  }
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

