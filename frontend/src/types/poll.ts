export interface PollOption {
    _id?: string;
    text: string;
    votes: number;
}

export interface PollState {
    _id: string;
    question: string;
    options: PollOption[];
    duration: number;
    startTime: string | null;
    status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    createdAt?: string;
}

export interface Participant {
    name: string;
    status: 'active' | 'kicked';
}
