import { useState, useEffect, useCallback } from 'react';

const COOLDOWN_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

export function useButtonCooldown(storageKey: string) {
  const [isDisabled, setIsDisabled] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  // Check localStorage on mount
  useEffect(() => {
    const checkCooldown = () => {
      const cooldownEnd = localStorage.getItem(storageKey);
      if (cooldownEnd) {
        const endTime = parseInt(cooldownEnd, 10);
        const now = Date.now();
        
        if (now < endTime) {
          setIsDisabled(true);
          setRemainingTime(endTime - now);
          console.log(`[Cooldown ${storageKey}] Active, remaining: ${endTime - now}ms`);
        } else {
          // Cooldown expired, clean up
          localStorage.removeItem(storageKey);
          setIsDisabled(false);
          setRemainingTime(0);
          console.log(`[Cooldown ${storageKey}] Expired and cleared`);
        }
      }
    };

    checkCooldown();
  }, [storageKey]);

  // Update remaining time every second while disabled
  useEffect(() => {
    if (!isDisabled || remainingTime <= 0) return;

    const interval = setInterval(() => {
      const cooldownEnd = localStorage.getItem(storageKey);
      if (cooldownEnd) {
        const endTime = parseInt(cooldownEnd, 10);
        const now = Date.now();
        const remaining = endTime - now;

        if (remaining <= 0) {
          localStorage.removeItem(storageKey);
          setIsDisabled(false);
          setRemainingTime(0);
        } else {
          setRemainingTime(remaining);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isDisabled, remainingTime, storageKey]);

  // Start cooldown
  const startCooldown = useCallback(() => {
    const endTime = Date.now() + COOLDOWN_DURATION;
    localStorage.setItem(storageKey, endTime.toString());
    setIsDisabled(true);
    setRemainingTime(COOLDOWN_DURATION);
    console.log(`[Cooldown ${storageKey}] Started, will end at ${new Date(endTime).toLocaleTimeString()}`);
  }, [storageKey]);

  // Format remaining time as "Xm Ys" or "X minutes"
  const formatTime = useCallback(() => {
    if (remainingTime <= 0) return '';
    
    const minutes = Math.floor(remainingTime / 60000);
    const seconds = Math.floor((remainingTime % 60000) / 1000);
    
    if (minutes > 0) {
      return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
    }
    return `${seconds}s`;
  }, [remainingTime]);

  return {
    isDisabled,
    remainingTime,
    formatTime,
    startCooldown,
  };
}
