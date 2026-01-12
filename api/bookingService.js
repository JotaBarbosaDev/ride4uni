import {api} from "./api.js";

function createBooking(payload) {
  return api.post("/bookings", payload);
}

function getAllBookings() {
  return api.get("/bookings");
}

function getBookingsByPassengerID(passengerId) {
  return api.get(`/bookings/passenger/${passengerId}`);
}

function getBookingStatus(rideId, passengerId) {
  return api.get(`/bookings/${rideId}/${passengerId}`);
}

function deleteBooking(rideId, passengerId) {
  return api.delete(`/bookings/${rideId}/${passengerId}`);
}

function updateBooking(bookingId, payload) {
  return api.put(`/bookings/${bookingId}`, payload);
}
export {
  createBooking,
  getAllBookings,
  getBookingsByPassengerID,
  getBookingStatus,
  deleteBooking,
  updateBooking,
};
