import mongoose, { Document, Schema } from 'mongoose';

export type PollStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface PollOption {
    text: string;
    votes: number;
}

export interface IPoll extends Document {
    question: string;
    options: PollOption[];
    duration: number;
    startTime: Date | null;
    status: PollStatus;
    createdAt: Date;
    updatedAt: Date;
}

const pollOptionSchema = new Schema<PollOption>({
    text: { type: String, required: true },
    votes: { type: Number, default: 0 }
});

const pollSchema = new Schema<IPoll>({
    question: { type: String, required: true },
    options: [pollOptionSchema],
    duration: { type: Number, required: true },
    startTime: { type: Date, default: null },
    status: {
        type: String,
        enum: ['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
        default: 'DRAFT',
        index: true
    }
}, { timestamps: true });

export const Poll = mongoose.model<IPoll>('Poll', pollSchema);
