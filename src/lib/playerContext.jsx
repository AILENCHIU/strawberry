import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from "react";

const PlayerContext = createContext(null);

export function usePlayer() {
  return useContext(PlayerContext);
}

export function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  const [current, setCurrent] = useState(null);
  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const queueRef = useRef([]);
  const indexRef = useRef(-1);
  const shuffleRef = useRef(false);
  queueRef.current = queue;
  indexRef.current = index;
  shuffleRef.current = shuffle;

  const loadAndPlay = useCallback((track) => {
    const audio = audioRef.current;
    if (!audio || !track?.audio_url) return;
    audio.src = track.audio_url;
    audio.play().catch(() => {});
    setCurrent(track);
  }, []);

  const playTrack = useCallback((track, newQueue) => {
    if (newQueue && newQueue.length) {
      setQueue(newQueue);
      const i = newQueue.findIndex((t) => t.id === track.id);
      setIndex(i >= 0 ? i : 0);
    }
    loadAndPlay(track);
  }, [loadAndPlay]);

  const next = useCallback(() => {
    const q = queueRef.current;
    if (!q.length) return;
    let nIdx;
    if (shuffleRef.current && q.length > 1) {
      do { nIdx = Math.floor(Math.random() * q.length); } while (nIdx === indexRef.current);
    } else {
      nIdx = (indexRef.current + 1) % q.length;
    }
    setIndex(nIdx);
    loadAndPlay(q[nIdx]);
  }, [loadAndPlay]);

  const prev = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const q = queueRef.current;
    if (!q.length) return;
    const pIdx = (indexRef.current - 1 + q.length) % q.length;
    setIndex(pIdx);
    loadAndPlay(q[pIdx]);
  }, [loadAndPlay]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }, [current]);

  const seek = useCallback((time) => {
    if (audioRef.current) audioRef.current.currentTime = time;
  }, []);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    const onTime = () => {
      setProgress(audio.currentTime || 0);
      setDuration(audio.duration || 0);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", next);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", next);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [next]);

  const value = {
    current, queue, index, isPlaying, shuffle, progress, duration,
    playTrack, togglePlay, next, prev, seek, setShuffle,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}