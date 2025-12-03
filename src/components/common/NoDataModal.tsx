import React from 'react';
import './NoDataModal.css';

interface NoDataModalProps {
  show: boolean;
  message?: string;
  onOk: () => void;
  buttonLabel?: string;
}

const NoDataModal: React.FC<NoDataModalProps> = ({
  show,
  message = 'No data available',
  onOk,
  buttonLabel = 'OK',
}) => {
  if (!show) return null;

  return (
    <div className="no-data-overlay">
      <div className="no-data-box">
        <p className="no-data-text">{message}</p>
        <button type="button" className="Finish-button_modal" onClick={onOk}>
          {buttonLabel}
        </button>
      </div>
    </div>
  );
};

export default NoDataModal;
