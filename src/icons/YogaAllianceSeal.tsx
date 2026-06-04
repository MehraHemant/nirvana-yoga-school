import type { IconProps } from "./types";
import { iconSize } from "./types";

export default function YogaAllianceSeal({
  size = 64,
  className = "",
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      {...iconSize(size, props)}
      {...props}
    >
      {/* Outer decorative dotted circle */}
      <circle
        cx="50"
        cy="50"
        r="46"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="3,3"
      />
      {/* Inner solid border */}
      <circle
        cx="50"
        cy="50"
        r="42"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Center circle */}
      <circle
        cx="50"
        cy="50"
        r="32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
      {/* Seal teeth / starburst outline */}
      <path
        d="M 50 10 L 52 20 L 60 12 L 60 23 L 70 18 L 67 28 L 77 26 L 72 35 L 81 37 L 74 45 L 82 50 L 74 55 L 81 63 L 72 65 L 77 74 L 67 72 L 70 82 L 60 77 L 60 88 L 52 80 L 50 90 L 48 80 L 40 88 L 40 77 L 30 82 L 33 72 L 23 74 L 28 65 L 19 63 L 26 55 L 18 50 L 26 45 L 19 37 L 28 35 L 23 26 L 33 28 L 30 18 L 40 23 L 40 12 L 48 20 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.75"
        opacity="0.8"
      />
      {/* Inner text path definition */}
      <path id="sealTextPath" d="M 50 18 A 32 32 0 1 1 49.9 18" fill="none" />
      <text className="text-[6.5px] font-sans font-bold tracking-widest uppercase fill-current">
        <textPath href="#sealTextPath" startOffset="0%">
          • REGISTERED YOGA SCHOOL • YOGA ALLIANCE USA
        </textPath>
      </text>
      {/* Center Lotus Flower representation */}
      <path
        d="M 50 40 C 47 47, 44 48, 44 53 C 44 57, 50 62, 50 62 C 50 62, 56 57, 56 53 C 56 48, 53 47, 50 40 Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M 50 46 C 45 50, 41 51, 41 55 C 41 58, 46 61, 50 62 C 50 62, 54 61, 59 55 C 59 51, 55 50, 50 46 Z"
        fill="currentColor"
        opacity="0.6"
      />
    </svg>
  );
}
