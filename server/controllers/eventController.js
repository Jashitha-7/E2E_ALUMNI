import mongoose from "mongoose";
import Event from "../models/Event.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const createEvent = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    host: req.user._id,
  };

  const event = await Event.create(payload);
  res.status(201).json(event);
});

const listEvents = asyncHandler(async (req, res) => {
  const { status, upcoming, search, tag } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (upcoming === "true") filter.startAt = { $gte: new Date() };
  if (upcoming === "false") filter.startAt = { $lt: new Date() };
  if (tag) filter.tags = tag;
  if (search) filter.$text = { $search: String(search) };

  const events = await Event.find(filter)
    .populate("host", "name email role")
    .sort({ startAt: 1 })
    .lean();

  res.json(events);
});

const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid event id");
  }

  const updated = await Event.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  }).populate("host", "name email role");

  if (!updated) {
    res.status(404);
    throw new Error("Event not found");
  }

  res.json(updated);
});

const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid event id");
  }

  const deleted = await Event.findByIdAndDelete(id);
  if (!deleted) {
    res.status(404);
    throw new Error("Event not found");
  }

  res.status(204).send();
});

const registerForEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid event id");
  }

  const event = await Event.findById(id);
  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }

  if (event.status !== "published") {
    res.status(400);
    throw new Error("Event is not open for registration");
  }

  const alreadyRegistered = event.attendees.some(
    (attendeeId) => attendeeId.toString() === req.user._id.toString()
  );

  if (alreadyRegistered) {
    res.status(409);
    throw new Error("Already registered for this event");
  }

  if (event.capacity && event.attendees.length >= event.capacity) {
    res.status(400);
    throw new Error("Event capacity reached");
  }

  event.attendees.push(req.user._id);
  await event.save();

  res.json({
    message: "Registered successfully",
    eventId: event._id,
    attendees: event.attendees.length,
  });
});

const eventAnalytics = asyncHandler(async (req, res) => {
  const now = new Date();

  const [totalEvents, upcomingEvents, pastEvents, totalRegistrations] = await Promise.all([
    Event.countDocuments(),
    Event.countDocuments({ startAt: { $gte: now } }),
    Event.countDocuments({ startAt: { $lt: now } }),
    Event.aggregate([
      { $project: { count: { $size: "$attendees" } } },
      { $group: { _id: null, total: { $sum: "$count" } } },
    ]),
  ]);

  res.json({
    totalEvents,
    upcomingEvents,
    pastEvents,
    totalRegistrations: totalRegistrations[0]?.total || 0,
  });
});

export {
  createEvent,
  listEvents,
  updateEvent,
  deleteEvent,
  registerForEvent,
  eventAnalytics,
};
