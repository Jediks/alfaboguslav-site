"use client";

import { useEffect } from "react";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("[global.error]", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <html lang="uk">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          fontFamily: "system-ui, sans-serif",
          background: "#fdfaf3",
          color: "#0b1f44",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 480 }}>
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#0b1f44",
              opacity: 0.6,
              margin: 0,
            }}
          >
            Alpha Boguslav
          </p>
          <h1 style={{ margin: "12px 0", fontSize: 28 }}>
            Сталася помилка / Something went wrong
          </h1>
          <p style={{ margin: 0, opacity: 0.7 }}>
            Спробуйте ще раз. Якщо помилка повторюється — зв&apos;яжіться з менеджером.
          </p>
          {error.digest && (
            <p
              style={{
                marginTop: 12,
                fontFamily: "ui-monospace, monospace",
                fontSize: 12,
                opacity: 0.6,
              }}
            >
              ref: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: 20,
              padding: "10px 22px",
              borderRadius: 9999,
              background: "#0b1f44",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Спробувати знову / Retry
          </button>
        </div>
      </body>
    </html>
  );
}
