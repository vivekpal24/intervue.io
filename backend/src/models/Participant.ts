import mongoose, { Document, Schema } from 'mongoose';

export interface IParticipant extends Document {
    socketId: string;
    userId: string;
    pollId: mongoose.Types.ObjectId | string;
    joinedAt: Date;
}

const participantSchema = new Schema<IParticipant>({
    socketId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    pollId: { type: Schema.Types.ObjectId, ref: 'Poll', required: true, index: true },
}, { timestamps: { createdAt: 'joinedAt', updatedAt: false } });

export const Participant = mongoose.model<IParticipant>('Participant', participantSchema);
