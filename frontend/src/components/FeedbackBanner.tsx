import './FeedbackBanner.css';

interface FeedbackBannerProps {
  type: 'success' | 'error' | 'info';
  message: string | null;
  onClose?: () => void;
}

const FeedbackBanner = ({ type, message, onClose }: FeedbackBannerProps) => {
  if (!message) return null;

  return (
    <div className={`feedback feedback--${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <span>{message}</span>
      {onClose && (
        <button type="button" className="feedback__close" onClick={onClose} aria-label="Dismiss notification">
          ×
        </button>
      )}
    </div>
  );
};

export default FeedbackBanner;
