type BrandLogoProps = {
  className?: string;
  size?: number;
  showText?: boolean;
};

export default function BrandLogo({ className = "", size = 36, showText = false }: BrandLogoProps) {
  // Use a standard img tag with a simple cache-buster to avoid Next.js Image configuration issues
  // for local development assets while ensuring the new logo is picked up.
  const logoSrc = `/logo-rutasegura.png?v=1`; 

  return (
    <span className={`flex items-center gap-2 ${className}`} aria-label="RutaSegura">
      <div 
        style={{ width: size, height: size }} 
        className="relative flex-shrink-0"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt="RutaSegura Logo"
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain',
            filter: 'brightness(0) invert(1)' // This turns the image white
          }}
        />
      </div>
      {showText ? (
        <span className="flex flex-col">
          <strong className="font-headline font-extrabold text-primary leading-tight">RutaSegura</strong>
          <span className="text-[10px] font-bold text-outline uppercase tracking-widest">Cartagena</span>
        </span>
      ) : null}
    </span>
  );
}
