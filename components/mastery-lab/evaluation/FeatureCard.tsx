import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  cta: string;
  href: string;
  icon: React.ElementType;
  iconBgColor?: string;
  iconColor?: string;
}

export default function FeatureCard({
  title,
  description,
  cta,
  href,
  icon: Icon,
  iconBgColor = "#FFFFFF",
  iconColor = "#00F0FF",
}: FeatureCardProps) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      borderRadius: 24,
      border: "1px solid rgba(255,255,255,0.05)",
      padding: 24,
      transition: "all 0.2s ease-in-out",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column"
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "scale(1.02)";
      e.currentTarget.style.borderColor = "rgba(0,240,255,0.3)";
      e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,240,255,0.05)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "scale(1)";
      e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
      e.currentTarget.style.boxShadow = "none";
    }}
    >
      {/* Icon */}
      <div style={{
        width: 48, height: 48, borderRadius: 12, background: iconBgColor,
        display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20,
      }}>
        <Icon size={24} color={iconColor} />
      </div>

      {/* Title */}
      <h3 className="font-inter" style={{ fontSize: 20, fontWeight: 600, color: "#FFFFFF", marginBottom: 12 }}>
        {title}
      </h3>

      {/* Description */}
      <p style={{ color: "#A0AAB2", fontSize: 15, lineHeight: 1.6, marginBottom: 24, flex: 1 }}>
        {description}
      </p>

      {/* CTA */}
      <Link
        href={href}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8, color: "#00F0FF",
          fontWeight: 600, fontSize: 15, textDecoration: "none"
        }}
      >
        {cta}
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
