import mongoose, { Document, Schema } from 'mongoose';

export interface IVote extends Document {
    pollId: mongoose.Types.ObjectId | string;
    studentName: string;
    selectedOption: string;
    createdAt: Date;
}

const voteSchema = new Schema<IVote>({
    pollId: { type: Schema.Types.ObjectId, ref: 'Poll', required: true, index: true },
    studentName: { type: String, required: true },
    selectedOption: { type: String, required: true }
}, { timestamps: { createdAt: true, updatedAt: false } });

voteSchema.index({ pollId: 1, studentName: 1 }, { unique: true });

export const Vote = mongoose.model<IVote>('Vote', voteSchema);
