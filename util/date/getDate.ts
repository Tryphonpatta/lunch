import moment from "moment";

export function getDate() {
  const today = new Date();
  // console.log("today", today);
  const dayOfWeek = today.getDay();
  if (dayOfWeek >= 4) {
    // morethan or equal to Thursday
    const today = moment();
    const nextMonday = today.add(4, "days").startOf("week").add(1, "day");

    // Return the next week's Monday to Friday
    const nextWeek = [];
    for (let i = 0; i < 5; i++) {
      nextWeek.push(nextMonday.clone().add(i, "days").toDate());
    }

    return nextWeek; // [Date objects for Monday to Friday]
  }
  // 0 (Sun) to 6 (Sat)

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
