"use client";

import { useEffect } from "react";

// Google Translate integration component

export default function GoogleTranslate() {
  useEffect(() => {
    // Prevent double-init
    if (document.getElementById("google-translate-script")) return;

    // --- CSS: Hide ALL Google Translate UI, keep functionality ---
    const style = document.createElement("style");
    style.id = "gt-hide-style";
    style.innerHTML = `
      /* Hide the Google Translate banner/toolbar that pushes the page down */
      .goog-te-banner-frame,
      iframe.goog-te-banner-frame,
      #goog-gt-tt,
      .goog-te-balloon-frame,
      .goog-te-menu-frame,
      .goog-logo-link,
      .goog-te-gadget-icon,
      .goog-te-spinner-pos,
      .VIpgJd-ZVi9od-aZ2wEe-wOHMyf,
      .VIpgJd-ZVi9od-aZ2wEe-OiiCO-ti6hGc {
        display: none !important;
        visibility: hidden !important;
      }
      /* Prevent the body from being pushed down by the banner */
      body {
        top: 0px !important;
        position: static !important;
      }
      /* Hide the translate element container itself */
      #google_translate_element {
        display: none !important;
      }
    `;
    document.head.appendChild(style);

    // --- Google Translate Initialization ---
    (window as any).googleTranslateElementInit = () => {
      const win = window as any;
      if (win.google?.translate?.TranslateElement) {
        new win.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            autoDisplay: false,
          },
          "google_translate_element"
        );
      }
    };

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    // --- MutationObserver: aggressively hide any new GT UI elements ---
    const observer = new MutationObserver(() => {
      // Prevent body top offset
      if (document.body.style.top && document.body.style.top !== "0px") {
        document.body.style.setProperty("top", "0px", "important");
      }

      // Hide banner frames
      const frame = document.querySelector<HTMLElement>(
        "iframe.goog-te-banner-frame, .goog-te-banner-frame"
      );
      if (frame) {
        frame.style.setProperty("display", "none", "important");
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Hidden container — required by Google Translate to attach the widget
  return <div id="google_translate_element" aria-hidden="true" />;
}