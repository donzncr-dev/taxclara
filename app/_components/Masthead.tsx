import Link from "next/link";
import { Icon } from "./Icon";

// Üst pano — brend + ixtiyari sağ slot (status çipi və s.).
export function Masthead({
  subtitle,
  right,
}: {
  subtitle: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="top">
      <Link href="/" className="brandrow">
        <div className="logo">
          <Icon name="scale" size={18} color="#A67C2E" />
        </div>
        <div>
          <div className="brand-t">
            Taxclara<span className="dot">.</span>az
          </div>
          <div className="brand-s">{subtitle}</div>
        </div>
      </Link>
      {right}
    </header>
  );
}
