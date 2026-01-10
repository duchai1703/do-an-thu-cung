"use client";

// Cute dog mascot SVG component that covers eyes when user types password
export default function DogMascot({ isPasswordFocused = false, isHappy = false }) {
  return (
    <div className="relative w-32 h-32 mx-auto mb-4">
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-lg"
        style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
      >
        {/* Dog Face Background */}
        <ellipse cx="100" cy="110" rx="70" ry="60" fill="#F5D6BA" />
        
        {/* Ears */}
        <ellipse cx="45" cy="70" rx="25" ry="40" fill="#D4A574" transform="rotate(-15 45 70)" />
        <ellipse cx="155" cy="70" rx="25" ry="40" fill="#D4A574" transform="rotate(15 155 70)" />
        <ellipse cx="45" cy="70" rx="15" ry="25" fill="#E8C4A0" transform="rotate(-15 45 70)" />
        <ellipse cx="155" cy="70" rx="15" ry="25" fill="#E8C4A0" transform="rotate(15 155 70)" />
        
        {/* Face highlight */}
        <ellipse cx="100" cy="105" rx="50" ry="40" fill="#FAE5D3" />
        
        {/* Snout */}
        <ellipse cx="100" cy="130" rx="25" ry="20" fill="#FAE5D3" />
        
        {/* Nose */}
        <ellipse cx="100" cy="120" rx="12" ry="8" fill="#4A3728" />
        <ellipse cx="97" cy="118" rx="4" ry="3" fill="#6B4D3A" opacity="0.5" />
        
        {/* Mouth */}
        <path
          d={isHappy 
            ? "M 85 135 Q 100 150 115 135" 
            : "M 90 138 Q 100 142 110 138"
          }
          fill="none"
          stroke="#4A3728"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        
        {/* Tongue (when happy/loading) */}
        {isHappy && (
          <ellipse cx="100" cy="148" rx="8" ry="12" fill="#FF8B8B" className="animate-pulse" />
        )}
        
        {/* Eyes or Paws covering eyes */}
        {isPasswordFocused ? (
          // Paws covering eyes - cute password hiding!
          <>
            {/* Left Paw */}
            <g className="animate-bounce-slight" style={{ animationDelay: '0ms' }}>
              <ellipse cx="75" cy="95" rx="22" ry="18" fill="#D4A574" />
              <ellipse cx="65" cy="85" rx="8" ry="6" fill="#D4A574" />
              <ellipse cx="75" cy="82" rx="8" ry="6" fill="#D4A574" />
              <ellipse cx="85" cy="85" rx="8" ry="6" fill="#D4A574" />
              {/* Paw pads */}
              <ellipse cx="75" cy="100" rx="10" ry="8" fill="#4A3728" opacity="0.3" />
              <circle cx="67" cy="90" r="4" fill="#4A3728" opacity="0.3" />
              <circle cx="75" cy="87" r="4" fill="#4A3728" opacity="0.3" />
              <circle cx="83" cy="90" r="4" fill="#4A3728" opacity="0.3" />
            </g>
            
            {/* Right Paw */}
            <g className="animate-bounce-slight" style={{ animationDelay: '100ms' }}>
              <ellipse cx="125" cy="95" rx="22" ry="18" fill="#D4A574" />
              <ellipse cx="115" cy="85" rx="8" ry="6" fill="#D4A574" />
              <ellipse cx="125" cy="82" rx="8" ry="6" fill="#D4A574" />
              <ellipse cx="135" cy="85" rx="8" ry="6" fill="#D4A574" />
              {/* Paw pads */}
              <ellipse cx="125" cy="100" rx="10" ry="8" fill="#4A3728" opacity="0.3" />
              <circle cx="117" cy="90" r="4" fill="#4A3728" opacity="0.3" />
              <circle cx="125" cy="87" r="4" fill="#4A3728" opacity="0.3" />
              <circle cx="133" cy="90" r="4" fill="#4A3728" opacity="0.3" />
            </g>
          </>
        ) : (
          // Normal cute eyes
          <>
            {/* Left Eye */}
            <g>
              <ellipse cx="75" cy="95" rx="14" ry="16" fill="white" />
              <ellipse 
                cx="77" 
                cy="97" 
                rx="8" 
                ry="10" 
                fill="#4A3728" 
                className={isHappy ? "animate-eye-happy" : ""}
              />
              <circle cx="80" cy="93" r="3" fill="white" />
            </g>
            
            {/* Right Eye */}
            <g>
              <ellipse cx="125" cy="95" rx="14" ry="16" fill="white" />
              <ellipse 
                cx="127" 
                cy="97" 
                rx="8" 
                ry="10" 
                fill="#4A3728"
                className={isHappy ? "animate-eye-happy" : ""}
              />
              <circle cx="130" cy="93" r="3" fill="white" />
            </g>
            
            {/* Eyebrows */}
            <path d="M 60 80 Q 75 75 90 82" fill="none" stroke="#D4A574" strokeWidth="3" strokeLinecap="round" />
            <path d="M 140 80 Q 125 75 110 82" fill="none" stroke="#D4A574" strokeWidth="3" strokeLinecap="round" />
          </>
        )}
        
        {/* Blush marks */}
        <ellipse cx="55" cy="115" rx="10" ry="6" fill="#FFACAC" opacity="0.5" />
        <ellipse cx="145" cy="115" rx="10" ry="6" fill="#FFACAC" opacity="0.5" />
      </svg>
      
      {/* Speech bubble when password is being typed */}
      {isPasswordFocused && (
        <div className="absolute -top-2 -right-4 bg-white rounded-full px-3 py-1 shadow-md text-sm animate-bounce-slight">
          🙈
        </div>
      )}
    </div>
  );
}
