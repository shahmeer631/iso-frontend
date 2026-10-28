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
    if (rank === 1)
      return {
        card: "border-[var(--ib-acc)] bg-[color-mix(in_srgb,var(--ib-acc)_6%,var(--ib-card))]",
        icon: "bg-[var(--ib-acc)] text-white",
      };
    if (rank === 2)
      return {
        card: "border-[var(--ib-mute)] bg-[color-mix(in_srgb,var(--ib-mute)_6%,var(--ib-card))]",
        icon: "bg-[var(--ib-bg)] text-[var(--ib-ink)] border border-[var(--ib-line)]",
      };
    if (rank === 3)
      return {
        card: "border-[#D97706] bg-[rgba(217,119,6,0.06)]",
        icon: "bg-[#D97706] text-white",
      };
    return {
      card: "border-[var(--ib-line)] bg-[var(--ib-bg)]",
      icon: "bg-[var(--ib-accbg)] text-[var(--ib-ink)]",
    };
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[var(--ib-line)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--ib-acc)_10%,transparent),color-mix(in_srgb,var(--ib-acc)_6%,transparent))] px-4 py-5 text-left">
        <div className="mb-1 flex items-center gap-2">
          <Trophy size={18} className="text-[var(--ib-acc)]" aria-hidden />
          <h3 className="mb-0! text-[13px] font-bold text-[var(--ib-ink)]">
            {t("mastery.leaderboardTitle", "Leaderboard")}
          </h3>
        </div>
        <p className="m-0 text-[11px] font-medium text-[var(--ib-mute)]">
          {t("mastery.seeHowOthersPerform", "See how others perform")}
        </p>
        <p className="mt-0.5 text-[10px] font-medium text-[var(--ib-mute)]">
          {t("mastery.compareResults", "Compare your assessment results")}
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-5">
        {isLoading && (
          <div className="flex flex-col items-center gap-3 py-10 text-[var(--ib-acc)]">
            <Loader2 size={24} className="animate-spin" />
            <p className="text-[12px] font-semibold uppercase tracking-[0.05em]">
              {t("mastery.loadingRankings", "Loading rankings...")}
            </p>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center gap-3 py-10 text-[#D97706]">
            <AlertCircle size={24} />
            <p className="text-[12px] font-semibold uppercase tracking-[0.05em]">
              {t("mastery.failedLoadLeaderboard", "Failed to load leaderboard")}
            </p>
          </div>
        )}

        {!isLoading && !isError && performers.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-10 text-[var(--ib-mute)]">
            <Trophy size={24} />
            <p className="text-[12px] font-semibold uppercase tracking-[0.05em]">
              {t("mastery.noRankingsYet", "No rankings yet")}
            </p>
          </div>
        )}

        {!isLoading &&
          !isError &&
          performers.slice(0, 6).map((performer: any) => {
            const { card, icon } = getRankStyles(performer.rank);

            return (
              <div
                key={`${performer.userId}-${performer.rank}`}
                className={`${card} flex items-center justify-between rounded-[10px] border border-solid p-2.5 transition-transform duration-200 hover:scale-[1.02]`}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <div
                    className={`${icon} flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold`}
                  >
                    {performer.rank <= 3 ? (
                      <Trophy size={14} aria-hidden />
                    ) : (
                      `#${performer.rank}`
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="m-0 truncate text-[15px] font-semibold text-[var(--ib-ink)]">
                      {performer.name}
                    </h4>
                    <p className="m-0 mt-0.5 truncate text-[9px] font-semibold uppercase text-[var(--ib-mute)]">
                      {performer.category || performer.industry || "Mastery Lab"}
                    </p>
                  </div>
                </div>
                <div className="ml-2 shrink-0 text-[14px] font-bold text-[var(--ib-ink)]">
                  {performer.score}%
                </div>
              </div>
            );
          })}
      </div>

      <div className="border-t border-[var(--ib-line)] bg-[color-mix(in_srgb,var(--ib-bg)_80%,transparent)] px-5 py-5 text-center">
        <p className="m-0 text-[12px] font-medium leading-relaxed text-[var(--ib-mute)]">
          {t(
            "mastery.joinLeaderboard",
            "Complete an assessment to join the leaderboard."
          )}
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;
