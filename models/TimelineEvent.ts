import mongoose from 'mongoose';

const TimelineEventSchema = new mongoose.Schema({
  dateStr: { type: String, required: true },
  date: { type: Date, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  order: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.models.TimelineEvent || mongoose.model('TimelineEvent', TimelineEventSchema);
