import React from 'react';
import type { Participant } from '../types/poll';

interface ParticipantListProps {
    participants: Participant[];
    /** Teacher mode shows Kick out / Kick in buttons. Student mode shows status label only. */
    mode: 'teacher' | 'student';
    onKick?: (name: string) => void;
    onUnkick?: (name: string) => void;
}

/**
 * Renders the participant table used inside the sidebar popover.
 * In teacher mode it shows action buttons; in student mode it shows status labels.
 */
const ParticipantList: React.FC<ParticipantListProps> = ({ participants, mode, onKick, onUnkick }) => {
    return (
        <>
            <div className="participants-table-header">
                <span className="col-name">Name</span>
                <span className="col-action">Action</span>
            </div>
            <div className="participants-list">
                {participants.length === 0 && (
                    <p className="text-secondary text-sm p-4">No participants connected.</p>
                )}
                {participants.map((st, idx) => (
                    <div key={idx} className="participant-row">
                        <span
                            className="participant-name"
                            style={{
                                color: st.status === 'kicked' ? '#A3A3A3' : '#1A1A1A',
                                textDecoration: st.status === 'kicked' ? 'line-through' : 'none'
                            }}
                        >
                            {st.name}
                        </span>

                        {mode === 'teacher' ? (
                            st.status === 'active' ? (
                                <button
                                    className="btn-link kick-btn"
                                    style={{ color: '#EF4444' }}
                                    onClick={() => onKick?.(st.name)}
                                >
                                    Kick out
                                </button>
                            ) : (
                                <button
                                    className="btn-link kick-btn"
                                    style={{ color: '#10B981', fontWeight: 600 }}
                                    onClick={() => onUnkick?.(st.name)}
                                >
                                    Kick in
                                </button>
                            )
                        ) : (
                            <span className="text-secondary text-sm">
                                {st.status === 'active' ? '--' : 'Kicked'}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
};

export default ParticipantList;
