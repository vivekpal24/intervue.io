import React from 'react';
import type { PollState } from '../types/poll';

interface PollResultCardProps {
    poll: PollState;
    /** Optional timer badge to show in the dark header */
    timerBadge?: React.ReactNode;
}

/**
 * Displays a poll question with its options as progress bar rows.
 * Used both on the Teacher active-poll view and the Poll History screens.
 */
const PollResultCard: React.FC<PollResultCardProps> = ({ poll, timerBadge }) => {
    const options = poll?.options || [];
    const totalVotes = options.reduce((sum, opt) => sum + (opt.votes || 0), 0);

    return (
        <div className="poll-result-container">
            <div className="poll-question-dark-box" style={{ position: 'relative' }}>
                <h2 className="poll-question-text">{poll.question}</h2>
                {timerBadge}
            </div>

            <div className="poll-options-box">
                <div className="options-grid">
                    {options.map((opt, i) => {
                        const percentage = totalVotes === 0 ? 0 : Math.round(((opt.votes || 0) / totalVotes) * 100);
                        return (
                            <div key={opt._id ?? i} className="poll-option-row">
                                <div className="progress-bar-bg figma-bar-bg">
                                    <div className="progress-bar-fill figma-bar-fill" style={{ width: `${percentage}%` }} />
                                </div>
                                <div className="option-content figma-option-content text-overlay">
                                    <span className="circle-index small white-text">{i + 1}</span>
                                    <span className="option-text z-index-1">{opt.text}</span>
                                    <span className="option-percentage z-index-1">{percentage}%</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default PollResultCard;
