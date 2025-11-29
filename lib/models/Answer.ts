import mongoose from 'mongoose';

const AnswerSchema = new mongoose.Schema({
  participantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant', required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  selectedOption: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
  submittedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Answer || mongoose.model('Answer', AnswerSchema);