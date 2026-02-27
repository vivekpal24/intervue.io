import React from 'react';

interface ViewHistoryButtonProps {
    onClick: () => void;
    className?: string;
}

const ViewHistoryButton: React.FC<ViewHistoryButtonProps> = ({ onClick, className = '' }) => {
    return (
        <button
            onClick={onClick}
            className={`view-history-btn ${className}`}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                background: '#916BEE', // Soft purple matching mockup
                color: 'white',
                border: 'none',
                padding: '0.6rem 1.5rem',
                borderRadius: '9999px',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(145, 107, 238, 0.25)'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8-11-8-11-8z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ lineHeight: '1.2', marginTop: '0.1rem' }}>
                View Poll history
            </span>
        </button>
    );
};

export default ViewHistoryButton;
