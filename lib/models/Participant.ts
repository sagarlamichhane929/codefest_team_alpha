import mongoose from 'mongoose';

const ParticipantSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  username: { type: String, required: true },
  joinedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Participant || mongoose.model('Participant', ParticipantSchema);