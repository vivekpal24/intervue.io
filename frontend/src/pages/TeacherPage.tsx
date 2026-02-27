import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useSocket } from '../hooks/useSocket';
import { usePollTimer } from '../hooks/usePollTimer';
import type { PollState } from '../types/poll';
import PollResultCard from '../components/PollResultCard';
import PollCreationForm from '../components/PollCreationForm';
import PollHistoryView from '../components/PollHistoryView';
import ViewHistoryButton from '../components/ViewHistoryButton';
import SidebarPopover from '../components/SidebarPopover';
import HeaderBadge from '../components/HeaderBadge';
import './TeacherPage.css';

const TeacherPage: React.FC = () => {
    const [mainView, setMainView] = useState<'create' | 'history'>('create');
    const [activePoll, setActivePoll] = useState<PollState | null>(null);
    const [history, setHistory] = useState<PollState[]>([]);
    const [activeStudentList, setActiveStudentList] = useState<any[]>([]);
    const [serverEndTimeMs, setServerEndTimeMs] = useState<number | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);


    const { socket } = useSocket('global_lobby');
    const { timeLeftMs, formattedTime } = usePollTimer(serverEndTimeMs);

    // ─── Data Fetching ────────────────────────────────────────────────
    const fetchActivePoll = async () => {
        try {
            const res = await axios.get('/poll/active');
            if (res.data.poll) {
                const poll = res.data.poll;
                setActivePoll(poll);
                if (poll.status === 'ACTIVE' && poll.startTime) {
                    const start = new Date(poll.startTime).getTime();
                    setServerEndTimeMs(start + poll.duration * 1000);
                }
            }
        } catch (err: any) {
            console.error('Failed to fetch active poll', err);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await axios.get('/poll/history');
            setHistory(res.data);
        } catch (err) {
            console.error('Failed to fetch history', err);
        }
    };

    const fetchParticipants = async () => {
        try {
            const res = await axios.get('/poll/participants');
            setActiveStudentList(res.data.students || []);
        } catch (err) {
            console.error('Failed to fetch participants', err);
        }
    };

    useEffect(() => {
        fetchActivePoll();
        fetchHistory();
        fetchParticipants();
    }, []);

    // ─── Socket Listeners ─────────────────────────────────────────────
    useEffect(() => {
        if (!socket) return;

        socket.on('pollStarted', ({ poll }) => {
            if (!poll) return;
            setActivePoll(poll);
            if (poll.startTime) {
                const start = new Date(poll.startTime).getTime();
                setServerEndTimeMs(start + poll.duration * 1000);
            }
        });

        socket.on('historyUpdated', (hist) => {
            setHistory(hist);
        });

        socket.on('pollUpdated', (updatedPoll) => {
            if (!updatedPoll) return;
            setActivePoll(prev => {
                if (!prev) return updatedPoll;
                // Deep merge to ensure we don't lose fields like 'question' if they're missing in a partial update
                return {
                    ...prev,
                    ...updatedPoll,
                    // Explicitly keep question and options if they exist in prev but are missing/empty in updatedPoll
                    question: updatedPoll.question || prev.question,
                    options: (updatedPoll.options && updatedPoll.options.length > 0) ? updatedPoll.options : prev.options,
                    status: updatedPoll.status || prev.status
                };
            });
        });

        socket.on('participantCountUpdated', (data) => {
            setActiveStudentList(data.connectedStudents || []);
        });

        socket.on('pollEnded', ({ pollId }) => {
            setActivePoll(prev => {
                // Lenient ID check (both _id and id, stringified)
                const currentId = prev?._id?.toString() || (prev as any)?.id?.toString();
                if (!prev || currentId !== pollId?.toString()) {
                    return prev;
                }
                return { ...prev, status: 'COMPLETED' };
            });
            setServerEndTimeMs(null);
            fetchHistory();
        });

        socket.on('error', (err) => setErrorMsg(err.message));

        return () => {
            socket.off('pollStarted');
            socket.off('historyUpdated');
            socket.off('pollUpdated');
            socket.off('participantCountUpdated');
            socket.off('pollEnded');
            socket.off('error');
        };
    }, [socket]);

    // ─── Poll Actions ─────────────────────────────────────────────────
    const handleStartPoll = async () => {
        if (!activePoll) return;
        try {
            const res = await axios.post(`/poll/${activePoll._id}/start`);
            setActivePoll(res.data);
            if (res.data.startTime) {
                const start = new Date(res.data.startTime).getTime();
                setServerEndTimeMs(start + res.data.duration * 1000);
            }
        } catch (err: any) {
            setErrorMsg(err.response?.data?.error || 'Failed to start poll');
        }
    };

    const handleEndPoll = async () => {
        if (!activePoll || activePoll.status !== 'ACTIVE') return;
        try {
            await axios.post('/poll/end');
            setServerEndTimeMs(null);
            fetchHistory();
        } catch (err: any) {
            setErrorMsg(err.response?.data?.error || 'Failed to end poll');
        }
    };

    const handleCreateNewPoll = async () => {
        if (activePoll && activePoll.status === 'ACTIVE') await handleEndPoll();
        setActivePoll(null);
        setErrorMsg(null);
        setMainView('create');
    };

    const handleKick = (studentName: string) => {
        if (!socket) return;
        socket.emit('teacher:kickStudent', { studentName });
    };

    const handleUnkick = (studentName: string) => {
        if (!socket) return;
        socket.emit('teacher:unkickStudent', { studentName });
    };

    // ─── Timer Badge for Active Poll ──────────────────────────────────
    const timerBadge = activePoll?.status === 'ACTIVE' ? (
        <div className={`countdown-badge small ${timeLeftMs < 10000 ? 'danger-pulse' : ''}`}>
            ⏱️ {formattedTime}
        </div>
    ) : undefined;

    return (
        <>
            <div className="page-container admin-container" style={{ position: 'relative' }}>
                <div className="text-center mb-4">
                    <HeaderBadge />
                </div>

                {/* View Poll History Button - Top Right of Page */}
                {activePoll && mainView !== 'history' && (
                    <div className="history-btn-wrapper">
                        <ViewHistoryButton onClick={() => setMainView('history')} />
                    </div>
                )}

                {errorMsg && <div className="error-alert">{errorMsg}</div>}

                <div className="dashboard-grid">
                    <div className="dashboard-main" style={{ width: '100%' }}>

                        {/* ── Create Form ── */}
                        {!activePoll && mainView === 'create' && (
                            <PollCreationForm
                                onPollCreated={setActivePoll}
                                onError={setErrorMsg}
                            />
                        )}

                        {/* ── Poll History Full View ── */}
                        {mainView === 'history' && (
                            <PollHistoryView history={history} onBack={() => setMainView('create')} />
                        )}

                        {/* ── Active / Completed Poll ── */}
                        {activePoll && mainView !== 'history' && (
                            <div className="admin-live-wrapper position-relative">
                                {activePoll.status === 'DRAFT' && (
                                    <div className="glass-panel p-4 mb-4">
                                        <p className="text-secondary mb-4">Poll created successfully. Start the poll to broadcast it to students.</p>
                                        <button onClick={handleStartPoll} className="btn-success">▶ Start Poll Now</button>
                                    </div>
                                )}

                                <h3 className="poll-section-label">Question</h3>
                                <PollResultCard poll={activePoll} timerBadge={timerBadge} />

                                <div className="admin-actions mt-4" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button onClick={handleCreateNewPoll} className="btn-primary pill-large">
                                        + Ask a new question
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Chat/Participants Sidebar Popover - outside page-container to keep fixed positioning viewport-relative */}
            {activePoll && (
                <SidebarPopover
                    socket={socket}
                    currentUser="Teacher"
                    participants={activeStudentList}
                    mode="teacher"
                    onKick={handleKick}
                    onUnkick={handleUnkick}
                />
            )}
        </>
    );
};

export default TeacherPage;
