import React, { useState } from 'react';
import axios from '../api/axios';
import type { PollState } from '../types/poll';

interface PollCreationFormProps {
    onPollCreated: (poll: PollState) => void;
    onError: (msg: string) => void;
}

/**
 * Self-contained poll creation form used by TeacherPage.
 * Manages its own question/options/duration state locally.
 */
const PollCreationForm: React.FC<PollCreationFormProps> = ({ onPollCreated, onError }) => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState<string[]>(['', '']);
    const [duration, setDuration] = useState<number>(60);
    const [correctOptionIndex, setCorrectOptionIndex] = useState<number>(0);
    const [isCreating, setIsCreating] = useState(false);

    const updateOption = (index: number, val: string) => {
        const newOpts = [...options];
        newOpts[index] = val;
        setOptions(newOpts);
    };

    const addOption = () => {
        if (options.length < 6) setOptions([...options, '']);
    };

    const removeOption = (index: number) => {
        if (options.length > 2) {
            setOptions(options.filter((_, i) => i !== index));
            if (correctOptionIndex === index) {
                setCorrectOptionIndex(0);
            } else if (correctOptionIndex > index) {
                setCorrectOptionIndex(correctOptionIndex - 1);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validOptions = options.filter(o => o.trim() !== '');
        if (validOptions.length < 2) { onError('At least two valid options are required.'); return; }
        if (!question.trim()) { onError('Question is required.'); return; }

        try {
            setIsCreating(true);
            const res = await axios.post('/poll', {
                question,
                options: validOptions.map((text, i) => ({
                    text,
                    isCorrect: i === correctOptionIndex
                })),
                duration
            });
            onPollCreated(res.data);
            setQuestion('');
            setOptions(['', '']);
            setCorrectOptionIndex(0);
            setDuration(60);
        } catch (err: any) {
            onError(err.response?.data?.error || 'Failed to create poll');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="teacher-form-wrapper">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                    <h2 className="section-title" style={{ marginBottom: '0.25rem' }}>
                        Let's <strong>Get Started</strong>
                    </h2>
                    <p className="page-description mb-0">
                        you'll have the ability to create and manage polls, ask questions, and monitor<br />
                        your students' responses in real-time.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="create-poll-form">
                <div className="form-group row-header">
                    <label style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>Enter your question</label>
                    <select className="inline-select" value={duration} onChange={e => setDuration(parseInt(e.target.value))}>
                        <option value={15}>15 seconds</option>
                        <option value={30}>30 seconds</option>
                        <option value={60}>60 seconds</option>
                        <option value={120}>120 seconds</option>
                    </select>
                </div>
                <div className="form-group position-relative">
                    <textarea
                        className="figma-input figma-textarea"
                        placeholder="Type your question here..."
                        value={question}
                        onChange={e => setQuestion(e.target.value)}
                        rows={3}
                        required
                    />
                    <div className="char-count">{question.length}/100</div>
                </div>

                <div className="options-grid-header">
                    <label>Edit Options</label>
                    <label>Is it Correct?</label>
                </div>

                <div className="options-list figma-options-list">
                    {options.map((opt, i) => (
                        <div key={i} className="option-row">
                            <div className="option-input-group">
                                <div className="circle-index small">{i + 1}</div>
                                <input
                                    type="text"
                                    className="figma-input"
                                    placeholder={`Option ${i + 1}`}
                                    value={opt}
                                    onChange={e => updateOption(i, e.target.value)}
                                    required
                                />
                            </div>
                            <div className="correctness-radios">
                                <span className="mobile-correctness-label">Is it Correct?</span>
                                <label className="radio-label" style={{ cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name={`correctOption`}
                                        checked={correctOptionIndex === i}
                                        onChange={() => setCorrectOptionIndex(i)}
                                    />
                                    <span className="radio-custom" /> Yes
                                </label>
                                <label className="radio-label" style={{ cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name={`incorrectOption_${i}`}
                                        checked={correctOptionIndex !== i}
                                        onChange={() => {
                                            if (correctOptionIndex === i) setCorrectOptionIndex(i === 0 ? 1 : 0);
                                        }}
                                    />
                                    <span className="radio-custom" /> No
                                </label>
                                {options.length > 2 && (
                                    <button type="button" onClick={() => removeOption(i)} className="btn-icon delete-opt" title="Remove Option">✖</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                {options.length < 6 && (
                    <div className="add-more-container" style={{ marginTop: '1rem', marginLeft: '2.5rem' }}>
                        <button
                            type="button"
                            onClick={addOption}
                            style={{
                                background: 'white',
                                color: '#916BEE',
                                border: '1px solid #916BEE',
                                padding: '0.6rem 1.5rem',
                                borderRadius: '8px',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.4rem',
                                transition: 'all 0.2s ease',
                                width: 'max-content'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = '#F8F5FF';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = 'white';
                            }}
                        >
                            + Add More option
                        </button>
                    </div>
                )}

                <div className="sticky-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn-primary" disabled={isCreating} style={{ padding: '0.8rem 2.5rem', borderRadius: '40px' }}>
                        {isCreating ? 'Creating...' : 'Ask Question'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PollCreationForm;
