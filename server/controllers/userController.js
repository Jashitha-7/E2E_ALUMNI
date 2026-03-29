import asyncHandler from "../middlewares/asyncHandler.js";
import User from "../models/User.js";

const getProfile = asyncHandler(async (req, res) => {
  res.json(req.user);
});

const updateProfile = asyncHandler(async (req, res) => {
  const allowedUpdates = [
    "name",
    "bio",
    "avatarUrl",
    "department",
    "graduationYear",
    "location",
    "skills",
    "linkedin",
    "github",
    "portfolio",
    "phone",
  ];

  const updates = {};
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true }
  ).select("-password -refreshTokenHash");

  res.json({
    success: true,
    data: user,
  });
});

const getAlumniDirectory = asyncHandler(async (req, res) => {
  const { search = "", year = "all", page = 1, limit = 50 } = req.query;

  const query = {
    role: "alumni",
    status: "active",
  };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { department: { $regex: search, $options: "i" } },
      { bio: { $regex: search, $options: "i" } },
    ];
  }

  if (year !== "all") {
    query.graduationYear = Number(year);
  }

  const pageNumber = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(limit) || 50));

  const alumni = await User.find(query)
    .select("name email avatarUrl department graduationYear bio")
    .sort({ createdAt: -1 })
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .lean();

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    data: {
      alumni,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
    },
  });
});

export { getProfile, updateProfile, getAlumniDirectory };
