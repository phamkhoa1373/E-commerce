export function formatDate(date: string) {
  return new Date(date)
    .toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Ho_Chi_Minh",
    })
    .split(" ")
    .reverse()
    .join(" ");
}
