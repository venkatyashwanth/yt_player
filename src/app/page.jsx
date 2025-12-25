"use client";

import Header from "@/components/Header";
import Player from "@/components/Player";
import Playlist from "@/components/Playlist";
import { useEffect, useState } from "react";

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [toggleSignal, setToggleSignal] = useState(0);

  function handleTogglePlay(index) {
    console.log(index);
    if (index === currentIndex) {
      setToggleSignal((n) => n + 1);
    } else {
      setCurrentIndex(index);
    }
  }

  return (
    <>
      <Header />
      <div className="container player-wrap">
        <Player
          currentIndex={currentIndex}
          toggleSignal={toggleSignal}
          onPlayingChange={setIsPlaying}
        />
        <Playlist
          currentIndex={currentIndex}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
        />
      </div>
    </>
  );
}
