import React from "react";
import "./Loader.css";

interface LoaderProps {
  isLoading: boolean;
  text?: string;
  variant?: "classic" | "aurora";
}

const Loader: React.FC<LoaderProps> = ({ isLoading, text = "Loading", variant = "classic" }) => {
  if (!isLoading) {
    return null;
  }

  const renderClassic = () => (
    <div className="loader-stack">
      <div className="loader-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p className="loader-text">
        {text}
        <span className="loader-ellipsis" aria-hidden="true">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </p>
    </div>
  );

  const renderAurora = () => (
    <div className="loader-aurora">
      <div className="loader-aurora-glow" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p className="loader-text">
        {text}
        <span className="loader-ellipsis" aria-hidden="true">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </p>
    </div>
  );

  return (
    <div className="loader-overlay" role="status" aria-live="polite" aria-atomic="true">
      {variant === "aurora" ? renderAurora() : renderClassic()}
    </div>
  );
};

export default Loader;
