"use client";

import React from "react";
import Image from "next/image";
import { Clock } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

const bundleData = [
  {
    id: 1,
    slug: "quality-management",
    category: "QUALITY MANAGEMENT SYSTEMS",
    title: "Quality Management Systems (QMS)",
    image: "/top-publications-1.png",
    modules: 15,
    description: "The most popular ISO standard, providing a framework for consistent quality in products and services."
  },
  {
    id: 2,
    slug: "environmental-management",
    category: "ENVIRONMENTAL MANAGEMENT SYSTEMS",
    title: "Environmental Management Systems (EMS) ",
    image: "/top-publications-2.png",
    modules: 10,
    description: "Focuses on minimizing environmental impact, crucial for sustainability."
  },
  {
    id: 3,
    slug: "information-security",
    category: "INFORMATION SECURITY MANAGEMENT",
    title: "Information Security Management Systems (ISMS)",
    image: "/top-publications-3.png",
    modules: 12,
    description: "Vital for safeguarding sensitive data and cybersecurity."
  }
];

const ComplianceBundles = () => {
  const router = useRouter();
  const params = useParams();
  const lang = params?.lang || "en";

  const handleCardClick = (slug: string) => {
    router.push(`/${lang}/academy/${slug}`);
  };

  return (
    <section style={{ padding: "80px 24px", background: "#0B0F19" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <h2 className="space-grotesk" style={{
          fontSize: "42px",
          fontWeight: 700,
          color: "#FFFFFF",
          marginBottom: 48,
          textAlign: "center"
        }}>
          Featured Management Systems
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: 32,
          justifyContent: "center"
        }}>
          {bundleData.map((bundle) => (
            <div
              key={bundle.id}
              onClick={() => handleCardClick(bundle.slug)}
              style={{
                background: "#161A22",
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.05)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.4)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Image Container */}
              <div style={{
                position: "relative",
                height: 200,
                width: "100%",
                background: "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Image
                  src={bundle.image}
                  alt={bundle.title}
                  fill
                  style={{ objectFit: "cover", opacity: 0.8 }}
                />
                {/* Dark overlay for smooth transition */}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 50%, rgba(22, 26, 34, 1) 100%)" }} />
              </div>

              {/* Content Container */}
              <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column", borderTop: "1px solid rgba(255,255,255,0.02)" }}>
                <span style={{ color: "#00F0FF", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
                  {bundle.category}
                </span>

                <h3 className="font-inter" style={{
                  fontSize: 22,
                  fontWeight: 600,
                  color: "#FFFFFF",
                  marginBottom: 20,
                  lineHeight: 1.3
                }}>
                  {bundle.title}
                </h3>



                <p style={{
                  color: "#A0AAB2",
                  fontSize: 14,
                  lineHeight: 1.6,
                  margin: 0,
                  flex: 1
                }}>
                  {bundle.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ComplianceBundles;
