import { Link } from "react-router-dom";

interface LogoProps {
    className?: string;
    onClick?: () => void;
    showText?: boolean;
}

export function Logo({ className = "", onClick, showText = true }: LogoProps) {
    const content = (
        <>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-hero shrink-0 shadow-sm">
                <svg
                    viewBox="0 0 40 40"
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Escrow Nigeria logo"
                >
                    {/* Outer border */}
                    <rect x="1" y="1" width="38" height="38" rx="2" fill="none" stroke="white" strokeWidth="3" />

                    {/* Top-left U-channel (opens right) */}
                    <rect x="5" y="5" width="14" height="3" fill="white" />
                    <rect x="5" y="5" width="3" height="13" fill="white" />
                    <rect x="5" y="15" width="9" height="3" fill="white" />

                    {/* Top-right U-channel (opens down) */}
                    <rect x="21" y="5" width="14" height="3" fill="white" />
                    <rect x="32" y="5" width="3" height="13" fill="white" />
                    <rect x="24" y="15" width="11" height="3" fill="white" />

                    {/* Bottom-left U-channel (opens up) */}
                    <rect x="5" y="22" width="11" height="3" fill="white" />
                    <rect x="5" y="22" width="3" height="13" fill="white" />
                    <rect x="5" y="32" width="14" height="3" fill="white" />

                    {/* Bottom-right U-channel (opens left) */}
                    <rect x="24" y="22" width="11" height="3" fill="white" />
                    <rect x="32" y="22" width="3" height="13" fill="white" />
                    <rect x="21" y="32" width="14" height="3" fill="white" />

                    {/* Center square */}
                    <rect x="16" y="16" width="8" height="8" fill="white" />
                </svg>
            </div>
            {showText && (
                <div className="flex flex-col items-start leading-tight">
                    <span className="text-xl font-bold text-primary tracking-tight">Escrow Nigeria</span>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground tracking-[0.2em] uppercase">
                        <span className="w-5 h-[1.5px] bg-muted-foreground/50 inline-block"></span>
                        EN
                        <span className="w-5 h-[1.5px] bg-muted-foreground/50 inline-block"></span>
                    </span>
                </div>
            )}
        </>
    );

    return (
        <Link to="/" className={`flex items-center gap-2.5 ${className}`} onClick={onClick}>
            {content}
        </Link>
    );
}
