import React from 'react';

interface LogoProps {
    className?: string;
    size?: number;
    hideText?: boolean;
    light?: boolean;
}

export default function Logo({ className = '', size = 120, hideText = false, light = false }: LogoProps) {
    return (
        <div className={`flex flex-col items-center justify-center text-center ${className}`}>
            {/* Editorial Vector Logo - Pure, smooth outline without boundaries or white backgrounds */}
            <div
                className="relative flex items-center justify-center transition-transform duration-500 hover:scale-[1.03]"
                style={{ width: size, height: size }}
            >
                <svg
                    viewBox="0 0 200 200"
                    className="w-full h-full"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Subtle Ambient Radial Gradients */}
                    <defs>
                        <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor={light ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)"} />
                            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
                        </radialGradient>
                        <linearGradient id="eyeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={light ? "#FFFFFF" : "#1A1A1A"} />
                            <stop offset="50%" stopColor={light ? "#E5E5E5" : "#333333"} />
                            <stop offset="100%" stopColor={light ? "#A3A3A3" : "#555555"} />
                        </linearGradient>
                    </defs>

                    {/* Background Ambient Glow */}
                    <circle cx="100" cy="100" r="90" fill="url(#eyeGlow)" />

                    {/* Concentric Arch waves around the eye - upper */}
                    <path
                        d="M 40 70 A 75 75 0 0 1 160 70"
                        stroke="url(#eyeGradient)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        opacity="0.25"
                    />
                    <path
                        d="M 30 60 A 85 85 0 0 1 170 60"
                        stroke="url(#eyeGradient)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        opacity="0.15"
                    />

                    {/* Concentric Arch waves around the eye - lower */}
                    <path
                        d="M 40 130 A 75 75 0 0 0 160 130"
                        stroke="url(#eyeGradient)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        opacity="0.25"
                    />
                    <path
                        d="M 30 140 A 85 85 0 0 0 170 140"
                        stroke="url(#eyeGradient)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        opacity="0.15"
                    />

                    {/* Eye Outline */}
                    <path
                        d="M 35 100 Q 100 45 165 100"
                        stroke="url(#eyeGradient)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        opacity="0.9"
                    />
                    <path
                        d="M 35 100 Q 100 155 165 100"
                        stroke="url(#eyeGradient)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        opacity="0.9"
                    />

                    {/* Internal fine contour lines */}
                    <path
                        d="M 50 100 C 50 85, 150 85, 150 100"
                        stroke="url(#eyeGradient)"
                        strokeWidth="2.0"
                        strokeLinecap="round"
                        fill="none"
                        opacity="0.5"
                    />
                    <path
                        d="M 50 100 C 50 115, 150 115, 150 100"
                        stroke="url(#eyeGradient)"
                        strokeWidth="2.0"
                        strokeLinecap="round"
                        fill="none"
                        opacity="0.5"
                    />

                    {/* Iris and Pupil */}
                    <circle
                        cx="100"
                        cy="100"
                        r="26"
                        stroke="url(#eyeGradient)"
                        strokeWidth="3"
                        opacity="0.8"
                    />

                    <circle
                        cx="100"
                        cy="100"
                        r="12"
                        fill="url(#eyeGradient)"
                    />

                    {/* Center reflection point */}
                    <circle
                        cx="95"
                        cy="95"
                        r="3"
                        fill="white"
                        opacity="0.95"
                    />
                </svg>

                {/* Small subtle target decoration ring */}
                <div className={`absolute inset-0 border rounded-full pointer-events-none scale-90 ${light ? 'border-white/5' : 'border-black/5'}`} />
            </div>

            {!hideText && (
                <div className="mt-4 flex flex-col items-center">
                    <h1
                        className={`text-[13px] font-bold tracking-[0.4em] uppercase font-sans ${light ? 'text-white' : 'text-slate-900'
                            }`}
                    >
                        Local Eyes
                    </h1>
                    <p
                        className={`mt-1.5 text-[10px] font-medium italic font-serif tracking-widest ${light ? 'text-neutral-400' : 'text-slate-600'}`}
                        style={{ letterSpacing: '0.15em' }}
                    >
                        Spot It. Report It. Fix It.
                    </p>
                </div>
            )}
        </div>
    );
}

