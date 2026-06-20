export function isPastMatchDateTime(value) {
  if (!value) return false;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() < Date.now();
}

export function getMinDateForMatchCreate() {
  return new Date();
}

export function getDatePickerMinTime(selectedDate) {
  const now = new Date();
  if (!selectedDate) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return start;
  }
  if (selectedDate.toDateString() === now.toDateString()) {
    return now;
  }
  const start = new Date(selectedDate);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function getDatePickerMaxTime(selectedDate) {
  const base = selectedDate ? new Date(selectedDate) : new Date();
  base.setHours(23, 59, 0, 0);
  return base;
}

export function toDateInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayDateInputValue() {
  return toDateInputValue(new Date());
}

export function minTimeInputForDate(dateStr) {
  if (!dateStr || dateStr !== todayDateInputValue()) return "00:00";
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function isPastDateAndTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return false;
  const dateTime = new Date(`${dateStr}T${timeStr}`);
  if (Number.isNaN(dateTime.getTime())) return false;
  return dateTime.getTime() < Date.now();
}
