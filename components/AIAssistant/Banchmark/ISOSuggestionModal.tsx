"use client";

import React from "react";
import { X, BookOpen, FileCheck, Pin } from "lucide-react";
import { ISOSuggestion } from "@/types/benchmark";

interface ISOSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestion: ISOSuggestion | null;
}

export const ISOSuggestionModal: React.FC<ISOSuggestionModalProps> = ({
  isOpen,
  onClose,
  suggestion,
}) => {
  if (!isOpen || !suggestion) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--ib-card)",
          borderRadius: 24,
          maxWidth: 600,
          width: "100%",
          maxHeight: "90vh",
          padding: 32,
          position: "relative",
          border: "1px solid var(--ib-ink)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            color: "#94A3B8",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
          <div
            style={{
              width: 48,
              height: 48,
              background: "var(--ib-acc)",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid var(--ib-acc)",
            }}
          >
            <BookOpen size={24} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 500,
                color: "var(--ib-ink)",
                margin: 0,
                marginBottom: 4,
              }}
            >
              {suggestion.standard}
            </h2>
            <p
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "var(--ib-acc)",
                margin: 0,
              }}
            >
              {suggestion.title}
            </p>
          </div>
        </div>

        {/* Relevance */}
        <div
          style={{
            backgroundColor: "var(--ib-accbg)",
            borderLeft: "4px solid var(--ib-acc)",
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              fontWeight: 500,
              color: "var(--ib-acc)",
              marginBottom: 8,
              textTransform: "uppercase",
            }}
          >
            <Pin size={14} />
            <span>Relevance</span>
          </div>
          <p
            style={{
              fontSize: 13,
              color: "var(--ib-ink)",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            {suggestion.relevance}
          </p>
        </div>

        {/* Documents Section */}
        {suggestion.documents && suggestion.documents.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h3
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "var(--ib-ink)",
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <FileCheck size={16} style={{ color: "var(--ib-ok)" }} />
              Required Documents
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {suggestion.documents.map((doc, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "var(--ib-bg)",
                    border: "1px solid var(--ib-ink)",
                    borderRadius: 12,
                    padding: 12,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      background: "var(--ib-ok)",
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FileCheck size={14} color="var(--ib-bg)" />
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "var(--ib-ink)",
                        margin: 0,
                        marginBottom: 2,
                      }}
                    >
                      {doc.title}
                    </p>
                    <p
                      style={{
                        fontSize: 11,
                        color: "#94A3B8",
                        margin: 0,
                      }}
                    >
                      Clause {doc.clause}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Records Section */}
        {suggestion.records && suggestion.records.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h3
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "var(--ib-ink)",
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <FileCheck size={16} style={{ color: "var(--ib-acc)" }} />
              Required Records
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {suggestion.records.map((record, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "var(--ib-bg)",
                    border: "1px solid var(--ib-ink)",
                    borderRadius: 12,
                    padding: 12,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      background: "var(--ib-acc)",
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FileCheck size={14} color="#fff" />
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "var(--ib-ink)",
                        margin: 0,
                        marginBottom: 2,
                      }}
                    >
                      {record.title}
                    </p>
                    <p
                      style={{
                        fontSize: 11,
                        color: "#94A3B8",
                        margin: 0,
                      }}
                    >
                      Clause {record.clause}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(suggestion.opportunities_for_improvement?.length ||
          suggestion.potential_gaps?.length ||
          suggestion.common_nonconformities?.length) ? (
          <div style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 12 }}>
            {suggestion.opportunities_for_improvement?.length ? (
              <div
                style={{
                  border: "1px solid var(--ib-line)",
                  background: "var(--ib-bg)",
                  borderRadius: 12,
                  padding: 14,
                }}
              >
                <p
                  style={{
                    margin: "0 0 8px",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--ib-acc)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Opportunities for improvement
                </p>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {suggestion.opportunities_for_improvement.map((item, i) => (
                    <li key={i} style={{ fontSize: 13, color: "var(--ib-ink)", marginBottom: 4 }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {suggestion.potential_gaps?.length ? (
              <div
                style={{
                  border: "1px solid rgba(239,68,68,0.25)",
                  background: "rgba(254,242,242,0.7)",
                  borderRadius: 12,
                  padding: 14,
                }}
              >
                <p
                  style={{
                    margin: "0 0 8px",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#DC2626",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Potential gaps
                </p>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {suggestion.potential_gaps.map((item, i) => (
                    <li key={i} style={{ fontSize: 13, color: "var(--ib-ink)", marginBottom: 4 }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {suggestion.common_nonconformities?.length ? (
              <div
                style={{
                  border: "1px solid rgba(245,158,11,0.3)",
                  background: "rgba(255,251,235,0.8)",
                  borderRadius: 12,
                  padding: 14,
                }}
              >
                <p
                  style={{
                    margin: "0 0 8px",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#B45309",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Common non-conformities
                </p>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {suggestion.common_nonconformities.map((item, i) => (
                    <li key={i} style={{ fontSize: 13, color: "var(--ib-ink)", marginBottom: 4 }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            width: "100%",
            background: "var(--ib-acc)",
            color: "#FFFFFF",
            padding: "14px 0",
            borderRadius: 16,
            fontWeight: 500,
            fontSize: 14,
            border: "none",
            cursor: "pointer",
            transition: "background 0.2s",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#3433D6")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--ib-acc)")}
        >
          Close
        </button>
      </div>
    </div>
  );
};
