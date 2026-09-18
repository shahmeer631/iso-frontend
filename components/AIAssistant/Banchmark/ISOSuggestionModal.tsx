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
          background: "#131B2D",
          borderRadius: 24,
          maxWidth: 600,
          width: "100%",
          maxHeight: "90vh",
          padding: 32,
          position: "relative",
          border: "1px solid #1E293B",
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
          onMouseEnter={(e) => (e.currentTarget.style.color = "#F1F5F9")}
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
              background: "#00F0FF",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #00F0FF",
            }}
          >
            <BookOpen size={24} color="#F1F5F9" />
          </div>
          <div style={{ flex: 1 }}>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 500,
                color: "#F1F5F9",
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
                color: "#00F0FF",
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
            backgroundColor: "rgba(63, 62, 237, 0.1)",
            borderLeft: "4px solid #00F0FF",
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
              color: "#00F0FF",
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
              color: "#F1F5F9",
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
                color: "#F1F5F9",
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <FileCheck size={16} style={{ color: "#14B8A6" }} />
              Required Documents
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {suggestion.documents.map((doc, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#0A0F1C",
                    border: "1px solid #1E293B",
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
                      background: "#14B8A6",
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FileCheck size={14} color="#0A0F1C" />
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#F1F5F9",
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
                color: "#F1F5F9",
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <FileCheck size={16} style={{ color: "#00F0FF" }} />
              Required Records
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {suggestion.records.map((record, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#0A0F1C",
                    border: "1px solid #1E293B",
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
                      background: "#00F0FF",
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FileCheck size={14} color="#F1F5F9" />
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#F1F5F9",
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

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            width: "100%",
            background: "#00F0FF",
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
          onMouseLeave={(e) => (e.currentTarget.style.background = "#00F0FF")}
        >
          Close
        </button>
      </div>
    </div>
  );
};
