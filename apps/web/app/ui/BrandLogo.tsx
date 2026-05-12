type BrandLogoProps = {
  className?: string;
  size?: number;
  showText?: boolean;
};

export default function BrandLogo({ className = "", size = 36, showText = false }: BrandLogoProps) {
  return (
    <span className={`brandLogo ${showText ? "brandLogoLockup" : ""} ${className}`} aria-label="RutaSegura">
      <svg
        aria-hidden="true"
        className="brandLogoMark"
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="64" height="64" rx="16" fill="#1D7A5C" />
        <path
          d="M32 10.5L48.5 17V28.8C48.5 40.5 41.4 50.1 32 54.2C22.6 50.1 15.5 40.5 15.5 28.8V17L32 10.5Z"
          fill="#FFFFFF"
        />
        <path
          d="M22.8 39.2C27.4 31.6 36.7 35.4 40.9 26.3"
          stroke="#255C99"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle cx="23" cy="39" r="4.5" fill="#B36B00" />
        <path
          d="M40.8 19.5C36.6 19.5 33.2 22.8 33.2 27C33.2 32.7 40.8 39.8 40.8 39.8C40.8 39.8 48.4 32.7 48.4 27C48.4 22.8 45 19.5 40.8 19.5Z"
          fill="#1D7A5C"
        />
        <circle cx="40.8" cy="27" r="2.6" fill="#FFFFFF" />
      </svg>
      {showText ? (
        <span className="brandLogoText">
          <strong>RutaSegura</strong>
          <span>Cartagena</span>
        </span>
      ) : null}
    </span>
  );
}
