"use client";

import { useState } from "react";
import { FaStar, FaMapMarkerAlt, FaTrain, FaChevronLeft, FaChevronRight } from "react-icons/fa";

type Option = {
  name: string;
  rating?: number | string;
  photo_reference?: string | null;
  location?: { lat: number; lng: number } | null;
  description?: string;
  mapLink?: string;
  transit?: string;
};

type Props = {
  time: string;
  duration: string;
  options: (string | Option)[];
  onSelect?: (place: string) => void;
  onEdit?: (prompt: string) => void;
  startIndex?: number;
  isFirst?: boolean;
  isLast?: boolean;
};

export default function ItineraryCard({
  time,
  duration,
  options,
  onSelect,
  onEdit,
  startIndex = 0,
  isLast = false,
}: Props) {
  const [index, setIndex] = useState(startIndex);
  const [isEditing, setIsEditing] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");

  const nextOption = () => {
    if (options.length === 0) return;
    const newIndex = (index + 1) % options.length;
    setIndex(newIndex);
    const selected = options[newIndex];
    if (onSelect) onSelect(typeof selected === 'string' ? selected : selected.name);
  };

  const prevOption = () => {
    if (options.length === 0) return;
    const newIndex = (index - 1 + options.length) % options.length;
    setIndex(newIndex);
    const selected = options[newIndex];
    if (onSelect) onSelect(typeof selected === 'string' ? selected : selected.name);
  };

  const handleEditSubmit = () => {
    if (customPrompt.trim() && onEdit) {
      onEdit(customPrompt);
      setIsEditing(false);
      setCustomPrompt("");
    }
  };

  const currentOption = options[index];
  const displayName = typeof currentOption === 'string' 
    ? currentOption 
    : currentOption?.name || "Loading...";

  const photoRef = typeof currentOption === 'object' ? currentOption?.photo_reference : null;

  return (
    <div className="relative pl-8 mb-6">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-2.5 top-8 bottom-[-24px] w-[2px] bg-slate-700" />
      )}
      
      {/* Timeline dot */}
      <div className="absolute left-[5px] top-6 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-black z-10" />

      <div className="bg-slate-800/80 backdrop-blur-sm p-4 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors shadow-lg">
        
        {photoRef && (
          <div className="w-full h-32 mb-4 rounded-lg overflow-hidden relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
<img 
              src={`/api/photo?ref=${photoRef}`} 
              alt={displayName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={prevOption}
              className="text-lg px-2 text-slate-400 hover:text-blue-400 disabled:opacity-50"
              disabled={options.length <= 1}
            >
              <FaChevronLeft />
            </button>

            <div className="flex-1 text-center sm:text-left">
              <div className="text-blue-400 font-mono text-sm mb-1 tracking-wider font-semibold">
                {time}
                {duration && <span className="text-slate-500 ml-2 font-normal text-xs">• {duration}</span>}
              </div>
              <h3 className="text-lg font-bold text-slate-100 leading-tight">
                {displayName}
              </h3>
              {typeof currentOption === 'object' && currentOption?.description && (
                <p className="text-slate-400 text-sm mt-1">
                  {currentOption.description}
                </p>
              )}
              {typeof currentOption === 'object' && currentOption?.rating && (
                <div className="flex items-center gap-1 text-yellow-400 text-sm mt-1">
                  <FaStar /> {currentOption.rating}
                </div>
              )}
              {typeof currentOption === 'object' && (currentOption?.transit || currentOption?.mapLink) && (
                <div className="flex flex-wrap gap-3 mt-2">
                  {currentOption.transit && (
                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-md flex items-center gap-1">
                      <FaTrain /> {currentOption.transit}
                    </span>
                  )}
                  {currentOption.mapLink && (
                    <a 
                      href={currentOption.mapLink} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs bg-blue-900/30 text-blue-400 hover:text-blue-300 px-2 py-1 rounded-md flex items-center gap-1 border border-blue-800/50 transition-colors"
                    >
                      <FaMapMarkerAlt /> View on Map
                    </a>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={nextOption}
              className="text-lg px-2 text-slate-400 hover:text-blue-400 disabled:opacity-50"
              disabled={options.length <= 1}
            >
              <FaChevronRight />
            </button>
          </div>

          {onEdit && (
            <div className="flex justify-center sm:justify-end">
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded-lg transition-colors border border-slate-600"
              >
                ✏️ Edit
              </button>
            </div>
          )}
        </div>

        {/* Edit Dialog */}
        {isEditing && (
          <div className="mt-4 pt-4 border-t border-slate-700 animate-in fade-in slide-in-from-top-4 duration-200">
            <p className="text-sm text-slate-400 mb-2">Want something else? Describe your preference:</p>
            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="e.g. A family friendly park nearby"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEditSubmit()}
              />
              <button 
                onClick={handleEditSubmit}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                disabled={!customPrompt.trim()}
              >
                Update
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}