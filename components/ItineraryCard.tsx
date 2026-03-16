"use client";

import { useState } from "react";

type Props = {
  time: string;
  duration: string;
  options: string[];
  onSelect?: (place: string) => void;
  startIndex?: number;
};

export default function ItineraryCard({
  time,
  duration,
  options,
  onSelect,
  startIndex = 0,
}: Props) {

  const [index, setIndex] = useState(startIndex);

  const nextOption = () => {

    const newIndex = (index + 1) % options.length;

    setIndex(newIndex);

    if (onSelect) onSelect(options[newIndex]);
  };

  const prevOption = () => {

    const newIndex = (index - 1 + options.length) % options.length;

    setIndex(newIndex);

    if (onSelect) onSelect(options[newIndex]);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-xl flex items-center justify-between">

      <button
        onClick={prevOption}
        className="text-xl px-2 hover:text-blue-400"
      >
        ◀
      </button>

      <div className="text-center">

        <p className="text-gray-400 text-sm">
          {time}
        </p>

        <p className="text-lg font-semibold">
          {options[index]}
        </p>

        <p className="text-gray-500 text-xs">
          Duration: {duration}
        </p>

      </div>

      <button
        onClick={nextOption}
        className="text-xl px-2 hover:text-blue-400"
      >
        ▶
      </button>

    </div>
  );
}