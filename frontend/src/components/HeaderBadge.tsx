import React from 'react';

interface HeaderBadgeProps {
    className?: string;
    text?: string;
}

const HeaderBadge: React.FC<HeaderBadgeProps> = ({ className = '', text = 'Intervue Poll' }) => {
    return (
        <div
            className={`header-badge ${className}`}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                background: '#6366F1', // Primary purple-indigo
                color: 'white',
                padding: '0.5rem 1.25rem',
                borderRadius: '9999px',
                fontWeight: 600,
                fontSize: '1rem',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                letterSpacing: '0.02em'
            }}
        >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.5 2L13.8 9.2L21 11.5L13.8 13.8L11.5 21L9.2 13.8L2 11.5L9.2 9.2L11.5 2Z" fill="white" />
                <path d="M19 1L20 4L23 5L20 6L19 9L18 6L15 5L18 4L19 1Z" fill="white" />
            </svg>
            {text}
        </div>
    );
};

export default HeaderBadge;
