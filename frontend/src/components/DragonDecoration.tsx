export default function DragonDecoration() {
  // Pre-calculated scale positions along the body S-curve
  const scaleGroups = [
    // [cx, cy, size, rot]  — bottom section
    [368, 862, 28, -42],
    [336, 826, 28, -34],
    [304, 793, 28, -22],
    [278, 756, 28, -8],
    [258, 716, 26, 6],
    [248, 675, 26, 18],
    // — mid section
    [252, 635, 26, 30],
    [264, 596, 26, 44],
    [282, 560, 26, 46],
    [300, 526, 24, 38],
    [316, 492, 24, 26],
    [322, 456, 24, 12],
    [316, 420, 24, -4],
    [300, 386, 24, -18],
    // — upper section
    [274, 358, 22, -32],
    [246, 334, 22, -38],
    [218, 308, 22, -38],
    [196, 278, 22, -30],
    [180, 246, 20, -18],
    [172, 212, 20, -6],
    [178, 178, 20, 8],
    [190, 146, 20, 18],
    [206, 114, 18, 24],
    [226, 84, 18, 26],
    [248, 60, 16, 22],
  ];

  return (
    <svg
      viewBox="0 0 460 940"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute right-0 top-0 h-full w-auto pointer-events-none select-none"
      style={{ opacity: 0.17 }}
      aria-hidden="true"
    >
      <defs>
        {/* Clip to body shape for scales */}
        <clipPath id="dragonBodyClip">
          <path
            d="M 395 910 C 360 872 312 846 280 794 C 248 742 244 690 264 642 C 284 594 320 564 332 516 C 344 468 332 420 296 384 C 260 348 216 330 190 284 C 164 238 168 182 190 134 C 208 94 242 70 262 44"
            stroke="white"
            strokeWidth="82"
            strokeLinecap="round"
          />
        </clipPath>
      </defs>

      {/* ── BODY ───────────────────────────────────────────────── */}
      {/* Outer dark body */}
      <path
        d="M 395 910 C 360 872 312 846 280 794 C 248 742 244 690 264 642 C 284 594 320 564 332 516 C 344 468 332 420 296 384 C 260 348 216 330 190 284 C 164 238 168 182 190 134 C 208 94 242 70 262 44"
        stroke="#374151"
        strokeWidth="90"
        strokeLinecap="round"
      />
      {/* Mid gray body */}
      <path
        d="M 395 910 C 360 872 312 846 280 794 C 248 742 244 690 264 642 C 284 594 320 564 332 516 C 344 468 332 420 296 384 C 260 348 216 330 190 284 C 164 238 168 182 190 134 C 208 94 242 70 262 44"
        stroke="#6b7280"
        strokeWidth="70"
        strokeLinecap="round"
      />
      {/* Underbelly lighter stripe */}
      <path
        d="M 395 910 C 360 872 312 846 280 794 C 248 742 244 690 264 642 C 284 594 320 564 332 516 C 344 468 332 420 296 384 C 260 348 216 330 190 284 C 164 238 168 182 190 134 C 208 94 242 70 262 44"
        stroke="#9ca3af"
        strokeWidth="22"
        strokeLinecap="round"
        opacity="0.55"
      />

      {/* ── SCALES ─────────────────────────────────────────────── */}
      {scaleGroups.map(([cx, cy, r, rot], i) => (
        <g key={i} clipPath="url(#dragonBodyClip)">
          {/* Main scale arc */}
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            stroke="#9ca3af"
            strokeWidth="1.5"
            transform={`rotate(${rot} ${cx} ${cy})`}
            opacity="0.6"
          />
          {/* Inner scale detail */}
          <path
            d={`M ${cx - r * 0.6} ${cy - r * 0.1} A ${r * 0.6} ${r * 0.6} 0 0 1 ${cx + r * 0.6} ${cy - r * 0.1}`}
            stroke="#6b7280"
            strokeWidth="1"
            transform={`rotate(${rot} ${cx} ${cy})`}
            opacity="0.4"
          />
        </g>
      ))}

      {/* ── FLAMES ─────────────────────────────────────────────── */}
      {/* Flame cluster 1 – at mid-body bend ~y=500 */}
      <g fill="#c41e1e" opacity="0.88">
        <path d="M 346 505 C 374 480 388 450 368 426 C 394 442 406 410 380 388 C 406 400 416 368 388 346 C 368 336 344 346 332 364 C 337 340 328 316 308 308 C 318 328 314 348 302 360 C 292 334 276 320 256 324 C 272 332 284 348 278 364 C 300 358 314 374 306 392 C 330 384 342 402 330 420 C 352 412 365 432 350 452 C 340 470 322 477 304 482 Z"/>
        {/* Small accent flame */}
        <path d="M 270 620 C 252 602 244 578 256 558 C 242 574 236 552 250 534 C 265 526 282 533 286 550 C 282 532 290 516 306 512 C 297 528 298 546 308 556 C 320 534 334 524 350 530 C 335 536 328 550 334 564 C 316 560 308 574 315 590 C 321 604 337 610 351 614 Z" opacity="0.85"/>
      </g>

      {/* Flame cluster 2 – upper bend ~y=260 */}
      <g fill="#c41e1e" opacity="0.85">
        <path d="M 202 266 C 174 246 162 218 176 196 C 158 214 150 188 166 168 C 186 158 208 166 212 186 C 208 164 218 146 238 142 C 228 160 232 180 244 190 C 254 168 270 158 286 164 C 270 170 262 186 268 202 C 248 198 238 214 246 232 C 226 228 218 246 228 264 C 236 278 252 282 268 286 Z"/>
      </g>

      {/* ── HEAD ───────────────────────────────────────────────── */}
      {/* Head base form */}
      <ellipse cx="268" cy="50" rx="35" ry="24" fill="#6b7280" transform="rotate(-28 268 50)"/>

      {/* Upper snout / jaw */}
      <path
        d="M 244 36 C 258 20 290 17 308 30 C 323 42 326 62 314 73 C 300 84 278 84 263 76 C 246 68 238 52 244 36 Z"
        fill="#6b7280"
      />

      {/* Lower jaw */}
      <path
        d="M 252 66 C 265 80 288 82 308 73 C 318 87 310 105 290 110 C 270 114 253 100 250 84 Z"
        fill="#4b5563"
      />

      {/* Teeth — upper */}
      <path d="M 270 74 L 275 86 L 265 86 Z" fill="white" opacity="0.9"/>
      <path d="M 283 77 L 288 89 L 278 89 Z" fill="white" opacity="0.9"/>
      <path d="M 296 75 L 301 87 L 291 87 Z" fill="white" opacity="0.9"/>

      {/* Eye */}
      <circle cx="268" cy="39" r="10" fill="#0a0a0a"/>
      <circle cx="268" cy="39" r="8" fill="#c41e1e"/>
      <ellipse cx="268" cy="39" rx="2.5" ry="6" fill="#0a0a0a"/>
      <circle cx="271" cy="36" r="2.5" fill="white" opacity="0.85"/>

      {/* Nostrils */}
      <ellipse cx="304" cy="50" rx="4" ry="3" fill="#374151" transform="rotate(-25 304 50)"/>
      <ellipse cx="311" cy="44" rx="3" ry="2.5" fill="#374151" transform="rotate(-30 311 44)"/>

      {/* Horn 1 (main) */}
      <path d="M 260 26 C 254 8 238 -10 228 -3 C 237 0 243 12 248 22 Z" fill="#6b7280"/>
      {/* Horn 2 */}
      <path d="M 272 20 C 270 2 264 -14 272 -11 C 278 -7 280 6 278 17 Z" fill="#4b5563"/>
      {/* Small rear horn */}
      <path d="M 248 44 C 232 40 218 30 214 16 C 219 22 227 32 238 36 Z" fill="#4b5563"/>

      {/* Whiskers — gold */}
      <line x1="314" y1="42" x2="402" y2="28" stroke="#d4a017" strokeWidth="2" strokeLinecap="round" opacity="0.95"/>
      <line x1="316" y1="50" x2="406" y2="48" stroke="#d4a017" strokeWidth="2" strokeLinecap="round" opacity="0.95"/>
      <line x1="314" y1="58" x2="400" y2="72" stroke="#d4a017" strokeWidth="1.5" strokeLinecap="round" opacity="0.85"/>
      {/* Whisker beads */}
      <circle cx="402" cy="28" r="3" fill="#d4a017" opacity="0.9"/>
      <circle cx="406" cy="48" r="3" fill="#d4a017" opacity="0.9"/>
      <circle cx="400" cy="72" r="2.5" fill="#d4a017" opacity="0.85"/>

      {/* ── CLAWS ─ gold ──────────────────────────────────────── */}
      {/* Limb emergence from body near the lower bend */}
      <path d="M 268 770 C 250 766 236 770 228 782 L 246 776 Z" fill="#6b7280" opacity="0.9"/>

      <g fill="#d4a017" opacity="0.95">
        {/* Claw 1 */}
        <path d="M 240 782 C 228 800 224 822 234 836 C 222 820 214 800 222 782 C 210 798 208 820 218 836 C 205 820 204 798 212 778 C 221 788 228 802 228 812 C 229 795 236 781 248 775 Z"/>
        {/* Claw 2 */}
        <path d="M 257 774 C 247 793 246 816 256 830 C 244 814 238 792 246 774 C 235 790 234 814 244 828 C 231 812 230 790 239 772 C 247 783 252 797 252 808 C 252 790 259 775 272 770 Z"/>
        {/* Claw 3 */}
        <path d="M 276 780 C 268 800 268 824 278 838 C 266 820 262 798 270 780 C 259 796 259 820 269 834 C 256 818 255 794 264 776 C 272 788 276 802 275 814 C 276 796 285 783 298 778 Z"/>
      </g>
    </svg>
  );
}
