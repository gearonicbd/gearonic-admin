const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5001";

export const apiUrl = (path: string) =>
  `${SERVER_URL}${path.startsWith("/") ? path : `/${path}`}`;

export const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];
