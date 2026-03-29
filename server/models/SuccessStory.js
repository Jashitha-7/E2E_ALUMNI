import mongoose from "mongoose";

const successStorySchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true, minlength: 5, maxlength: 120 },
    content: { type: String, required: true, minlength: 50, maxlength: 5000 },
    company: { type: String, trim: true, maxlength: 120 },
    role: { type: String, trim: true, maxlength: 120 },
    tags: [{ type: String, trim: true, maxlength: 30 }],
    featured: { type: Boolean, default: false },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

successStorySchema.index({ author: 1, createdAt: -1 });
successStorySchema.index({ featured: 1, publishedAt: -1 });
successStorySchema.index({ title: "text", content: "text" });

const SuccessStory = mongoose.model("SuccessStory", successStorySchema);

export default SuccessStory;
