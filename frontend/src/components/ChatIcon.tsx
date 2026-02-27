import React from 'react';

interface ChatIconProps {
    width?: number;
    height?: number;
    color?: string;
}

const ChatIcon: React.FC<ChatIconProps> = ({ width = 24, height = 24, color = "currentColor" }) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ overflow: 'visible' }}
        >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" transform="scale(-1, 1) translate(-24, 0)"></path>
        </svg>
    );
};

export default ChatIcon;
