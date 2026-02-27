import React from 'react';

interface PollHeaderProps {
    label: string;
    timeLeftMs?: number | null;
    formattedTime?: string;
    showTimer?: boolean;
}

const PollHeader: React.FC<PollHeaderProps> = ({ label, timeLeftMs, formattedTime, showTimer = true }) => {
    const isUrgent = timeLeftMs !== undefined && timeLeftMs !== null && timeLeftMs < 10000;

    return (
        <div className="poll-header-row mb-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '1rem', marginLeft: '0.2rem' }}>
            <h3 className="poll-section-label" style={{ margin: 0, color: '#1A1A1A', fontSize: '1.3rem', fontWeight: 800 }}>
                {label}
            </h3>
            {showTimer && formattedTime && (
                <div className={`countdown-text ${isUrgent ? 'danger-pulse-text' : ''}`} style={{
                    fontWeight: 700,
                    color: isUrgent ? '#ef4444' : '#1A1A1A',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '1rem'
                }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {formattedTime}
                </div>
            )}
        </div>
    );
};

export default PollHeader;
