import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LEVELS, LevelName } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const getLevelInfo = (minutesThisWeek: number) => {
  const entries = Object.entries(LEVELS);
  let currentLevel: LevelName = 'Bronze';
  let nextLevel: LevelName | null = null;
  let nextThreshold = 0;

  for (let i = 0; i < entries.length; i++) {
    const [lvl, threshold] = entries[i];
    if (minutesThisWeek >= threshold) {
      currentLevel = lvl as LevelName;
      if (i < entries.length - 1) {
        nextLevel = entries[i + 1][0] as LevelName;
        nextThreshold = entries[i + 1][1] as number;
      } else {
        nextLevel = null;
      }
    }
  }

  return { currentLevel, nextLevel, nextThreshold };
};

// Simple beep sound using Web Audio API to avoid assets
export const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.value = 880; // A5
    gain.gain.value = 0.1;

    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
    setTimeout(() => osc.stop(), 500);
  } catch (e) {
    console.error("Audio play failed", e);
  }
};

export const formatDateKey = (date: Date) => date.toISOString().split('T')[0];

// Toast notification function
export const showNotification = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
  // Create a toast notification element
  const toast = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-success-500' : type === 'warning' ? 'bg-warning-500' : 'bg-info-500';
  
  toast.className = `fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white font-medium text-lg z-50 animate-pulse ${bgColor} transition-all duration-300`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

// Chime sound for timer start/stop using Web Audio API
let audioContextInstance: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  try {
    if (!audioContextInstance) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioContextInstance = new AudioContext();
      }
    }
    if (audioContextInstance && audioContextInstance.state === 'suspended') {
      audioContextInstance.resume();
    }
    return audioContextInstance;
  } catch (e) {
    console.error("Failed to get audio context", e);
    return null;
  }
};

export const playChimeSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) {
      console.warn("Audio context not available");
      return;
    }
    
    const now = ctx.currentTime;
    
    // Create two notes for a pleasant chime: E5 (330Hz) then C5 (262Hz)
    const notes = [
      { freq: 330, duration: 0.3 }, // E5
      { freq: 262, duration: 0.4 }  // C5
    ];
    
    notes.forEach((note, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.value = note.freq;
      gain.gain.setValueAtTime(0.2, now + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + i * 0.15 + note.duration);
      
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + note.duration);
    });
    console.log("Chime played at", now);
  } catch (e) {
    console.error("Chime play failed", e);
  }
};

// Background music player
let musicPlayer: HTMLAudioElement | null = null;

export const getMusicUrl = (musicType: string): string => {
  const musicUrls: { [key: string]: string } = {
    rainfall: 'https://assets.mixkit.co/active_storage/sfx/2392/2392-preview.mp3',
    ambient: '/Focus-Forge/audio/mixkit-european-forest-ambience-1213.wav',
    deepfocus: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg',
    chill: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    lofi: '/Focus-Forge/audio/focus-glow-lofi-269098.mp3',
  };
  return musicUrls[musicType] || '';
};

export const playBackgroundMusic = (musicType: string, volume: number = 0.5) => {
  try {
    // Stop any existing music
    if (musicPlayer) {
      musicPlayer.pause();
      musicPlayer.currentTime = 0;
    }

    if (musicType === 'none') {
      musicPlayer = null;
      return;
    }

    const url = getMusicUrl(musicType);
    if (!url) return;

    musicPlayer = new Audio(url);
    musicPlayer.loop = true;
    musicPlayer.volume = Math.max(0, Math.min(1, volume / 100));
    musicPlayer.play().catch(e => console.warn('Audio play failed:', e));
    
    console.log(`Playing ${musicType} music at volume ${volume}`);
  } catch (e) {
    console.error('Background music failed:', e);
  }
};

export const stopBackgroundMusic = () => {
  if (musicPlayer) {
    musicPlayer.pause();
    musicPlayer.currentTime = 0;
    musicPlayer = null;
  }
};

export const setMusicVolume = (volume: number) => {
  if (musicPlayer) {
    musicPlayer.volume = Math.max(0, Math.min(1, volume / 100));
  }
};

