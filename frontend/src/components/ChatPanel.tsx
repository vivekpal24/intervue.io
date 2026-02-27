import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import './ChatPanel.css';

export interface ChatMessage {
    id: string;
    sender: string;
    text: string;
    timestamp: number;
}

interface ChatPanelProps {
    socket: Socket | null;
    currentUser: string;
    isActive: boolean;
    hideHeader?: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ socket, currentUser, isActive, hideHeader }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (!socket) return;

        socket.on('chat:history', (history: ChatMessage[]) => {
            setMessages(history);
            scrollToBottom();
        });

        socket.on('chat:newMessage', (msg: ChatMessage) => {
            setMessages(prev => [...prev, msg]);
            setTimeout(scrollToBottom, 50);
        });

        socket.on('error', (err: { message: string }) => {
            if (err.message.includes('Rate limit expected') || err.message.toLowerCase().includes('chat') || err.message.includes('characters')) {
                setErrorMsg(err.message);
                setTimeout(() => setErrorMsg(null), 3000);
            }
        });

        return () => {
            socket.off('chat:history');
            socket.off('chat:newMessage');
        };
    }, [socket]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);

        const trimmed = inputText.trim();
        if (!trimmed) return;
        if (trimmed.length > 200) {
            setErrorMsg('Message too long (max 200 chars).');
            return;
        }

        if (socket) {
            socket.emit('chat:message', {
                sender: currentUser,
                text: trimmed
            });
            setInputText('');
        }
    };

    return (
        <div className={`chat-panel glass-panel ${hideHeader ? 'no-header' : ''}`}>
            {!hideHeader && (
                <div className="chat-header">
                    <h3>Live Chat</h3>
                    <span className={`status-dot ${isActive ? 'active' : 'inactive'}`}></span>
                </div>
            )}

            <div className="chat-messages">
                {messages.length === 0 ? (
                    <div className="empty-chat text-secondary">No messages yet. Say hi!</div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender === currentUser;
                        return (
                            <div key={msg.id} className={`chat-bubble-container ${isMe ? 'mine' : 'theirs'}`}>
                                <span className="chat-sender" style={{ textAlign: isMe ? 'right' : 'left' }}>{msg.sender}</span>
                                <div className={`chat-bubble ${isMe ? 'my-bubble' : 'their-bubble'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {errorMsg && <div className="chat-error">{errorMsg}</div>}

            <form onSubmit={handleSendMessage} className="chat-input-area">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message..."
                    maxLength={200}
                    className="premium-input chat-input"
                />
                <button type="submit" disabled={!inputText.trim()} className="btn-primary chat-send-btn">
                    ➤
                </button>
            </form>
        </div>
    );
};
