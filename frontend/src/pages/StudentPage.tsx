import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useSocket } from '../hooks/useSocket';
import { usePollTimer } from '../hooks/usePollTimer';
import type { PollState, Participant } from '../types/poll';
import PollResultCard from '../components/PollResultCard';
import SidebarPopover from '../components/SidebarPopover';
import HeaderBadge from '../components/HeaderBadge';
import PollHeader from '../components/PollHeader';
import './StudentPage.css';

const StudentPage: React.FC = () => {
    const [studentName, setStudentName] = useState<string>('');
    const [isJoined, setIsJoined] = useState<boolean>(false);

    const [activePoll, setActivePoll] = useState<PollState | null>(null);
    const [serverEndTimeMs, setServerEndTimeMs] = useState<number | null>(null);
    const [hasVoted, setHasVoted] = useState<boolean>(false);
    const [votedOption, setVotedOption] = useState<string | null>(null);

    const [isConnecting, setIsConnecting] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isKicked, setIsKicked] = useState<boolean>(false);

    // Sidebar
    const [activeStudentList, setActiveStudentList] = useState<Participant[]>([]);

    const { socket, connectionError } = useSocket('global_lobby', isJoined ? studentName : undefined);
    const { timeLeftMs, isExpired, formattedTime } = usePollTimer(serverEndTimeMs);

    // session and active poll
    useEffect(() => {
        const savedName = sessionStorage.getItem('studentName');
        if (savedName) setStudentName(savedName);

        const fetchActivePoll = async () => {
            try {
                const response = await axios.get('/poll/active');
                const poll = response.data.poll;
                if (poll && poll.status === 'ACTIVE') {
                    setActivePoll(poll);
                    if (poll.startTime) {
                        const start = new Date(poll.startTime).getTime();
                        setServerEndTimeMs(start + poll.duration * 1000);
                    }
                    const votedPollId = sessionStorage.getItem('votedPollId');
                    if (votedPollId === poll._id) {
                        setHasVoted(true);
                        setVotedOption(sessionStorage.getItem('votedOption'));
                    } else {
                        sessionStorage.removeItem('votedPollId');
                        sessionStorage.removeItem('votedOption');
                        setHasVoted(false);
                    }
                }
            } catch (err: any) {
                console.error('Failed to fetch active poll', err);
            }
        };

        fetchActivePoll();
    }, []);

    // handle real-time updates
    useEffect(() => {
        if (!socket) return;

        socket.on('pollStarted', ({ poll }) => {
            setActivePoll(poll);
            if (poll.startTime) {
                const start = new Date(poll.startTime).getTime();
                setServerEndTimeMs(start + poll.duration * 1000);
            }
            setHasVoted(false);
            setVotedOption(null);
            sessionStorage.removeItem('votedPollId');
            sessionStorage.removeItem('votedOption');
        });

        socket.on('pollUpdated', (updatedPoll) => {
            if (!updatedPoll?.options) return; // guard: ignore if malformed
            setActivePoll(prev => prev ? { ...prev, ...updatedPoll } : updatedPoll);
        });

        socket.on('pollEnded', ({ pollId }) => {
            setActivePoll(prev => {
                if (prev && prev._id === pollId) return { ...prev, status: 'COMPLETED' };
                return prev;
            });
            setServerEndTimeMs(null);
        });

        socket.on('kicked', (data) => {
            setIsKicked(true);
            setErrorMsg(data.message);
            setIsJoined(false);
            sessionStorage.removeItem('studentName');
        });

        socket.on('participantCountUpdated', (data) => {
            setActiveStudentList(data.connectedStudents || []);
        });

        socket.on('error', (err) => {
            setErrorMsg(err.message);
            if (err.message.includes('already in use') || err.message.toLowerCase().includes('removed') || err.message.toLowerCase().includes('kicked')) {
                setIsJoined(false);
                sessionStorage.removeItem('studentName');
            }
        });

        return () => {
            socket.off('pollStarted');
            socket.off('pollUpdated');
            socket.off('pollEnded');
            socket.off('kicked');
            socket.off('participantCountUpdated');
            socket.off('error');
        };
    }, [socket]);

    useEffect(() => {
        if (connectionError) {
            setErrorMsg(connectionError);
            setIsJoined(false);
        }
    }, [connectionError]);

    // flow logic
    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentName.trim()) { setErrorMsg('Please enter your name.'); return; }
        setErrorMsg(null);
        setIsConnecting(true);
        sessionStorage.setItem('studentName', studentName.trim());
        setIsJoined(true);
        setIsConnecting(false);
    };

    const handleVote = async (optionId: string) => {
        if (!activePoll || hasVoted || isExpired || activePoll.status !== 'ACTIVE') return;
        try {
            await axios.post('/vote', { pollId: activePoll._id, studentName, selectedOption: optionId });
            setHasVoted(true);
            setVotedOption(optionId);
            sessionStorage.setItem('votedPollId', activePoll._id);
            sessionStorage.setItem('votedOption', optionId);
        } catch (err: any) {
            setErrorMsg(err.response?.data?.error || 'Failed to submit vote');
        }
    };

    // not joined lobby
    if (!isJoined) {
        if (isKicked) {
            return (
                <div className="page-container text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
                    <HeaderBadge className="mb-4" />
                    <h1 className="page-title mb-4" style={{ fontSize: '2rem', color: '#1A1A1A', fontWeight: 500 }}>
                        <span style={{ fontWeight: 400 }}>You've been</span> Kicked out !
                    </h1>
                    <p className="page-description text-secondary" style={{ maxWidth: '400px', margin: '0 auto', fontSize: '0.9rem' }}>
                        Looks like the teacher had removed you from the poll system. Please<br />Try again sometime.
                    </p>
                </div>
            );
        }

        return (
            <div className="page-container text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
                <HeaderBadge className="mb-4" />
                <h1 className="page-title text-center">Welcome to the Live Polling System</h1>
                <p className="page-description text-center mb-4">Please enter your name below to continue.</p>
                {errorMsg && <div className="error-alert" style={{ maxWidth: '450px', width: '100%' }}>{errorMsg}</div>}
                <form onSubmit={handleJoin} className="join-form" style={{ maxWidth: '450px', width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Rahul Bajaj" className="premium-input" autoFocus />
                    <button type="submit" className="btn-primary full-width" disabled={!studentName.trim() || isConnecting}>
                        {isConnecting ? 'Connecting...' : 'Continue'}
                    </button>
                </form>
            </div>
        );
    }

    // poll state logic
    const showResults = activePoll ? (hasVoted || isExpired || activePoll.status === 'COMPLETED') : false;

    return (
        <div className="student-poll-outer">
            <div className="student-poll-container">
                <div className="text-center mb-4">
                    <HeaderBadge />
                </div>
                {errorMsg && <div className="error-alert">{errorMsg}</div>}

                {/* ── Waiting Screen ── */}
                {(!activePoll || (activePoll.status !== 'ACTIVE' && activePoll.status !== 'COMPLETED')) ? (
                    <div className="page-container text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
                        <div className="spinner-border mb-4" style={{ width: '3rem', height: '3rem', border: '4px solid #6366F1', borderRightColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        <h2 style={{ fontSize: '1.5rem', color: '#1A1A1A', fontWeight: '500' }}>Wait for the teacher to ask a question.</h2>
                    </div>
                ) : (
                    <>
                        <PollHeader
                            label="Question 1"
                            timeLeftMs={timeLeftMs}
                            formattedTime={formattedTime}
                            showTimer={!showResults}
                        />

                        {showResults ? (
                            // Results view — reuse PollResultCard
                            <PollResultCard poll={activePoll!} />
                        ) : (
                            // Voting options
                            <div className="poll-result-container mb-4">
                                <div className="poll-question-dark-box">
                                    <h2 className="poll-question-text">{activePoll!.question}</h2>
                                </div>
                                <div className="poll-options-box">
                                    <div className="options-grid" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {activePoll!.options.map((option, index) => {
                                            const isMyChoice = votedOption === option._id;
                                            return (
                                                <button
                                                    key={option._id}
                                                    className={`poll-option-card vote-mode ${isMyChoice ? 'selected' : ''}`}
                                                    onClick={() => handleVote(option._id!)}
                                                    disabled={showResults}
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        gap: '1rem',
                                                        background: isMyChoice ? 'rgba(119, 101, 218, 0.08)' : '#F8F9FA',
                                                        border: isMyChoice ? '2px solid var(--accent-primary)' : '1px solid #E9ECEF',
                                                        padding: '1rem 1.25rem',
                                                        borderRadius: '8px',
                                                        cursor: showResults ? 'default' : 'pointer',
                                                        textAlign: 'left',
                                                        width: '100%',
                                                        transition: 'all 0.2s ease',
                                                        boxShadow: isMyChoice ? '0 0 0 3px rgba(119, 101, 218, 0.15)' : 'none'
                                                    }}
                                                >
                                                    <span className="circle-index small" style={{
                                                        background: isMyChoice ? 'var(--accent-primary)' : '#A3A3A3',
                                                        color: 'white',
                                                        flexShrink: 0
                                                    }}>
                                                        {index + 1}
                                                    </span>
                                                    <span className="option-text" style={{ color: isMyChoice ? 'var(--accent-primary)' : '#1A1A1A', fontWeight: isMyChoice ? 700 : 500, fontSize: '0.95rem' }}>
                                                        {option.text}
                                                    </span>
                                                    {isMyChoice && (
                                                        <span style={{ marginLeft: 'auto', color: 'var(--accent-primary)', fontSize: '1.1rem' }}>✓</span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {showResults && (
                            <div className="text-center mt-4" style={{ padding: '2rem' }}>
                                <h3 style={{ fontSize: '1.2rem', color: '#1A1A1A', fontWeight: '600' }}>Wait for the teacher to ask a new question.</h3>
                            </div>
                        )}
                    </>
                )}

                {/* Sidebar */}
                <SidebarPopover
                    socket={socket}
                    currentUser={studentName}
                    participants={activeStudentList}
                    mode="student"
                />
            </div>
        </div>
    );
};

export default StudentPage;
