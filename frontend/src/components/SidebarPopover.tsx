import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import { ChatPanel } from './ChatPanel';
import ParticipantList from './ParticipantList';
import ChatIcon from './ChatIcon';
import './SidebarPopover.css';
import type { Participant } from '../types/poll';

type Tab = 'chat' | 'participants';

interface SidebarPopoverProps {
    socket: Socket | null;
    currentUser: string;
    participants: Participant[];
    /** Whether to show Kick out / Kick in buttons */
    mode: 'teacher' | 'student';
    onKick?: (name: string) => void;
    onUnkick?: (name: string) => void;
    /** Allow parent to control which tab opens initially */
    defaultTab?: Tab;
    /** Allow parent to force-open the sidebar (e.g. "View Poll History" button) */
    isOpen?: boolean;
    onClose?: () => void;
    onOpen?: () => void;
}

/**
 * Self-contained floating chat/participants/history popover.
 * Contains the FAB button and the slide-in panel.
 */
const SidebarPopover: React.FC<SidebarPopoverProps> = ({
    socket,
    currentUser,
    participants,
    mode,
    onKick,
    onUnkick,
    defaultTab = 'chat',
    isOpen: controlledOpen,
    onClose,
    onOpen,
}) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>(defaultTab);

    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

    const handleFabClick = () => {
        if (controlledOpen !== undefined) {
            // Controlled mode: toggle via parent callbacks
            if (controlledOpen) {
                onClose?.();
            } else {
                onOpen?.();
            }
        } else {
            setInternalOpen(prev => !prev);
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <button
                className={`fab-chat ${isOpen ? 'open' : ''}`}
                onClick={handleFabClick}
            >
                <ChatIcon width={26} height={26} />
            </button>

            {/* Sidebar Panel - Always mounted to preserve state, hidden via CSS when closed */}
            <div className={`sidebar-overlay popover-panel ${isOpen ? 'open' : 'closed'}`}>
                <div className="popover-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
                        onClick={() => setActiveTab('chat')}
                    >
                        Chat
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'participants' ? 'active' : ''}`}
                        onClick={() => setActiveTab('participants')}
                    >
                        Participants
                    </button>
                </div>

                <div className="popover-body chat-body" style={{ display: activeTab === 'chat' ? 'flex' : 'none', flex: 1, flexDirection: 'column' }}>
                    <ChatPanel socket={socket} currentUser={currentUser} isActive={isOpen && activeTab === 'chat'} hideHeader={true} />
                </div>

                <div className="popover-body participants-body" style={{ display: activeTab === 'participants' ? 'flex' : 'none', flex: 1, flexDirection: 'column' }}>
                    <ParticipantList
                        participants={participants}
                        mode={mode}
                        onKick={onKick}
                        onUnkick={onUnkick}
                    />
                </div>
            </div>
        </>
    );
};

export default SidebarPopover;
