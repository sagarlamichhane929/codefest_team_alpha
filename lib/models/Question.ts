import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  questionText: { type: String, required: true },
  options: [
    {
      text: { type: String, required: true },
      id: { type: String, required: true },
    },
  ],
  correctAnswer: { type: String, required: true },
  explanation: { type: String, default: '' },
  order: { type: Number, required: true },
});

export default mongoose.models.Question ||
  mongoose.model('Question', QuestionSchema);
