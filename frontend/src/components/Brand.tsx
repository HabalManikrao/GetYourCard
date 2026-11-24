import { Link } from "react-router-dom";

export function Brand({ small }: { small?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-3 no-underline">
      <span
        className={`flex items-center justify-center rounded-full bg-maroon text-gold-light ${
          small ? "h-9 w-9 text-lg" : "h-12 w-12 text-2xl"
        }`}
        aria-hidden
      >
        ॐ
      </span>
      <span className="leading-tight">
        <span className={`block font-display font-semibold text-maroon ${small ? "text-lg" : "text-2xl"}`}>
          Shubha Muhurta
        </span>
        {!small && <span className="block text-sm italic text-gold">Universal Card Studio</span>}
      </span>
    </Link>
  );
}
