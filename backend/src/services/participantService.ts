/**
 * In-memory Participant Registry
 * Manages active connected students per poll, allowing for live kicks and temporary bans.
 */

// Map<pollId, Map<studentName, socketId>>
const activeParticipants = new Map<string, Map<string, string>>();

// Map<pollId, Set<studentName>>
const bannedParticipants = new Map<string, Set<string>>();

export const addParticipant = async (pollId: string, studentName: string, socketId: string) => {
    // 1. Check if they were kicked previously from this specific poll
    const pollBans = bannedParticipants.get(pollId);
    if (pollBans && pollBans.has(studentName)) {
        throw new Error('You have been removed by the teacher and cannot rejoin this poll.');
    }

    // 2. Initialize poll map if missing
    if (!activeParticipants.has(pollId)) {
        activeParticipants.set(pollId, new Map<string, string>());
    }

    const pollParticipants = activeParticipants.get(pollId)!;

    // 3. Prevent duplicate active students with the exact same name
    if (pollParticipants.has(studentName)) {
        throw new Error('Student name already in use for this poll');
    }

    pollParticipants.set(studentName, socketId);
};

export const removeParticipantBySocket = async (socketId: string) => {
    for (const [pollId, studentsMap] of activeParticipants.entries()) {
        for (const [studentName, sId] of studentsMap.entries()) {
            if (sId === socketId) {
                studentsMap.delete(studentName);
                if (studentsMap.size === 0) {
                    activeParticipants.delete(pollId);
                }
                return;
            }
        }
    }
};

export const getPollParticipants = async (pollId: string) => {
    const studentsMap = activeParticipants.get(pollId);
    const bannedSet = bannedParticipants.get(pollId);

    const students: { name: string, status: 'active' | 'kicked' }[] = [];

    if (studentsMap) {
        for (const name of studentsMap.keys()) {
            students.push({ name, status: 'active' });
        }
    }

    if (bannedSet) {
        for (const name of bannedSet) {
            students.push({ name, status: 'kicked' });
        }
    }

    return {
        count: students.length,
        students
    };
};

export const kickStudent = async (pollId: string, studentName: string): Promise<string> => {
    const pollParticipants = activeParticipants.get(pollId);
    if (!pollParticipants) {
        throw new Error('Poll has no active participants.');
    }

    const socketId = pollParticipants.get(studentName);
    if (!socketId) {
        throw new Error('Student is not actively connected to this poll.');
    }

    // Remove them from active registry
    pollParticipants.delete(studentName);

    // Add them to the temporary ban list for this poll
    if (!bannedParticipants.has(pollId)) {
        bannedParticipants.set(pollId, new Set<string>());
    }
    bannedParticipants.get(pollId)!.add(studentName);

    return socketId;
};

export const unkickStudent = async (pollId: string, studentName: string) => {
    const bannedSet = bannedParticipants.get(pollId);
    if (bannedSet && bannedSet.has(studentName)) {
        bannedSet.delete(studentName);
        if (bannedSet.size === 0) {
            bannedParticipants.delete(pollId);
        }
    } else {
        throw new Error('Student is not in the kick list.');
    }
};

export const clearPollRegistry = (pollId: string) => {
    activeParticipants.delete(pollId);
    bannedParticipants.delete(pollId);
};
