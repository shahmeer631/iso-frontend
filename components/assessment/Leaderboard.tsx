"use client";

import React from "react";
import { Trophy, Loader2, AlertCircle } from "lucide-react";
import { useGetLeaderboardQuery } from "@/lib/redux/api/isoStandardsApi";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/client";

const Leaderboard = () => {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useGetLeaderboardQuery();
  const performers = data?.data ?? [];

  const getRankStyles = (rank: number) => {
    if (rank === 1) return { card: "border-[#D4AF37] bg-[rgba(212,175,55,0.05)]", icon: "bg-[#D4AF37] text-[#FFFFFF]" };
    if (rank === 2) return { card: "border-[#A0AAB2] bg-[rgba(212,175,55,0.05)]", icon: "bg-[#FFFFFF] text-[#0F111A]" };
    if (rank === 3) return { card: "border-[#D97706] bg-[rgba(217,119,6,0.05)]", icon: "bg-[#D97706] text-[#FFFFFF]" };
    return { card: "border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)]", icon: "bg-[rgba(255,255,255,0.1)] text-[#FFFFFF]" };
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{
        padding: "20px 16px",
        background: "linear-gradient(135deg, rgba(0,240,255,0.1), rgba(176,38,255,0.1))",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        textAlign: "left"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Trophy size={18} color="#00F0FF" />
          <h3 className="space-grotesk" style={{ fontSize: 12, fontWeight: 700, color: "#FFFFFF", margin: 0 }}>
            {t('mastery.leaderboardTitle')}
          </h3>
        </div>
        <p style={{ color: "#A0AAB2", fontSize: 11, margin: 0, fontWeight: 500, marginBottom: 2 }}>
          {t('mastery.seeHowOthersPerform')}
        </p>
        <p style={{ color: "#A0AAB2", fontSize: 10, margin: 0, fontWeight: 500 }}>
          {t('mastery.compareResults')}
        </p>
      </div>

      {/* Performers List */}
      <div style={{ padding: "20px 16px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
        {isLoading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "40px 0", color: "#00F0FF" }}>
            <Loader2 size={24} className="animate-spin" />
            <p className="font-inter" style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t('mastery.loadingRankings')}</p>
          </div>
        )}

        {isError && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "40px 0", color: "#FFB800" }}>
            <AlertCircle size={24} />
            <p className="font-inter" style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {t('mastery.failedLoadLeaderboard')}
            </p>
          </div>
        )}

        {!isLoading && !isError && performers.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "40px 0", color: "#A0AAB2" }}>
            <Trophy size={24} />
            <p className="font-inter" style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t('mastery.noRankingsYet')}</p>
          </div>
        )}

        {!isLoading &&
          !isError &&
          performers.slice(0, 6).map((performer: any) => {
            const { card, icon } = getRankStyles(performer.rank);

            return (
              <div
                key={`${performer.userId}-${performer.rank}`}
                className={card}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", padding: 10,
                  borderRadius: 10, borderStyle: "solid", borderWidth: 1,
                  transition: "transform 0.2s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <div
                    className={icon}
                    style={{
                      width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: 11, flexShrink: 0
                    }}
                  >
                    {performer.rank <= 3 ? (
                      <Trophy size={14} />
                    ) : (
                      `#${performer.rank}`
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h4 className="font-inter" style={{ fontWeight: 600, color: "#FFFFFF", fontSize: 18, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {performer.name}
                    </h4>
                    <p className="font-inter" style={{ color: "#A0AAB2", fontSize: 9, fontWeight: 600, margin: "2px 0 0", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {performer.category}
                    </p>
                  </div>
                </div>
                <div className="font-inter" style={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF", marginLeft: 8, flexShrink: 0 }}>
                  {performer.score}%
                </div>
              </div>
            );
          })}
      </div>

      {/* Footer */}
      <div style={{ background: "rgba(0,0,0,0.2)", padding: 24, textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <p style={{ color: "#A0AAB2", fontSize: 12, fontWeight: 500, margin: 0, lineHeight: 1.5 }}>
          {t('mastery.joinLeaderboard')}
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;