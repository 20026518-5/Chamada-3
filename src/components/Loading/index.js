import React from "react";
import { FaSpinner } from "react-icons/fa";
import "./loading.css";

export default function Loading({ size = 32, color = "#fff" }) {
  return (
    <div className="loading-container">
      <FaSpinner
        size={size}
        color={color}
        className="loading-spinner"
      />
    </div>
  );
}
