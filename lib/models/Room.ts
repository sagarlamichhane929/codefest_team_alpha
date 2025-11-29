import mongoose from 'mongoose';

const RoomSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  settings: {
    timeLimit: { type: Number, default: null },
    maxParticipants: { type: Number, default: null },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'finished'],
    default: 'waiting',
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Room || mongoose.model('Room', RoomSchema);
