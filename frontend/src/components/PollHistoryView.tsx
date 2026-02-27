import React from 'react';
import type { PollState } from '../types/poll';
import PollResultCard from './PollResultCard';

interface PollHistoryViewProps {
    history: PollState[];
    onBack: () => void;
}

/**
 * Full-width page that lists finished polls with vote results.
 * Shown when a teacher clicks "View Poll History" on the creation screen.
 */
const PollHistoryView: React.FC<PollHistoryViewProps> = ({ history, onBack }) => {
    return (
        <div className="full-history-wrapper" style={{ paddingBottom: '100px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2rem', color: '#1A1A1A', margin: 0 }}>
                    View <strong>Poll History</strong>
                </h1>
                <button className="btn-outline-pill" onClick={onBack}>← Back to Create</button>
            </div>

            {history.length === 0 ? (
                <div className="text-center p-4">
                    <p className="text-secondary">No past polls available.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    {history.map((poll, index) => (
                        <div key={poll._id}>
                            <h3
                                className="poll-section-label"
                                style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#1A1A1A' }}
                            >
                                Question {index + 1}
                            </h3>
                            <PollResultCard poll={poll} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PollHistoryView;
