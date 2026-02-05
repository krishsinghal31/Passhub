// backend/src/utils/hostingvalidity.js
exports.isHostingActive = (place) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(place.hostingValidity.start);
  const end = new Date(place.hostingValidity.end);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  return today >= start && today <= end;
};

exports.isEventActive = (place) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(place.eventDates.start);
  const end = new Date(place.eventDates.end);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  return today >= start && today <= end;
};