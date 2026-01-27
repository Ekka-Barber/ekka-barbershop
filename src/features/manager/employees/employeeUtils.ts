
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export function formatSalesDate(dateString: string) {
  const date = new Date(dateString);
  const day = format(date, "d");
  const month = format(date, "MMM", {
    locale: ar
  }).toUpperCase();
  const time = format(date, "HH:mm");
  return `${day} ${month} (${time})`;
}
