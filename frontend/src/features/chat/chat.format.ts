// Today's messages show the time only; older ones also show the date
export const formatMessageTime = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (date.toDateString() === new Date().toDateString()) return time;
  const day = date.toLocaleDateString([], { month: "short", day: "numeric" });
  return `${day}, ${time}`;
};
