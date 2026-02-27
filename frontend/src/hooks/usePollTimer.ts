import { useEffect, useState, useRef } from 'react';

/**
 * Custom hook to calculate and manage precise poll countdowns locally.
 * It takes the server's provided end time and tracks it against the browser clock.
 */
export const usePollTimer = (serverEndTimeMs: number | null) => {
    const [timeLeftMs, setTimeLeftMs] = useState<number>(0);
    const [isExpired, setIsExpired] = useState<boolean>(false);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (!serverEndTimeMs) {
            setTimeLeftMs(0);
            setIsExpired(false);
            if (intervalRef.current !== null) {
                window.clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        const calculateTimeLeft = () => {
            const now = Date.now();
            const remaining = serverEndTimeMs - now;

            if (remaining <= 0) {
                setTimeLeftMs(0);
                setIsExpired(true);
                if (intervalRef.current !== null) {
                    window.clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
            } else {
                setTimeLeftMs(remaining);
                setIsExpired(false);
            }
        };

        // Run immediately to avoid initial 1s delay jump
        calculateTimeLeft();

        // Setup the local ticker
        intervalRef.current = window.setInterval(calculateTimeLeft, 100);

        return () => {
            if (intervalRef.current !== null) {
                window.clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [serverEndTimeMs]);

    // Format the remaining time efficiently into MM:SS
    const formatTime = () => {
        if (timeLeftMs <= 0) return '00:00';

        const totalSeconds = Math.ceil(timeLeftMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return {
        timeLeftMs,
        isExpired,
        formattedTime: formatTime()
    };
};
