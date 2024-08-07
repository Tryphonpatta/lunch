export function getDate() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)

  // Calculate the date of the most recent Monday
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek + 1);

  // Create an array to store the dates from Monday to Friday
  let dates: Date[] = [];

  // Generate dates for Monday to Friday
  for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
    const inspectedDate = new Date(monday);
    inspectedDate.setDate(monday.getDate() + dayOffset);
    dates.push(inspectedDate);
  }

  return dates;
}
