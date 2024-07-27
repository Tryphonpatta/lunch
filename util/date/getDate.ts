export function getDate() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
  const monday = new Date(today);
  const tuesday = new Date(today);
  const wednesday = new Date(today);
  const thursday = new Date(today);
  const friday = new Date(today);

  // Adjust to get the Monday of the current week
  monday.setDate(today.getDate() - dayOfWeek + 1);
  tuesday.setDate(monday.getDate() + 1);
  wednesday.setDate(monday.getDate() + 2);
  thursday.setDate(monday.getDate() + 3);
  friday.setDate(monday.getDate() + 4);

  return [monday, tuesday, wednesday, thursday, friday];
}
