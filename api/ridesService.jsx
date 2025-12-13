import {api} from "./api.jsx";

function createRide(payload) {
  return api.post("/rides", payload);
}

function getAllRides() {
  return api.get("/rides");
}

function getRidesDashboard() {
  return api.get("/rides/dashboard/all");
} 
function getRidesByDriver(driverId) {
  return api.get(`/rides/driver/${driverId}`);
}

function getRideByRideID(rideId) {
  return api.get(`/rides/${rideId}`);
}

function deleteRide(rideId) {
  return api.delete(`/rides/${rideId}`);
}

function updateRide(rideId, payload) {
  return api.put(`/rides/${rideId}`, payload);
}

export {
  createRide,
  getAllRides,
  getRidesByDriver,
  getRideByRideID,
  deleteRide,
  updateRide,
  getRidesDashboard,
};
