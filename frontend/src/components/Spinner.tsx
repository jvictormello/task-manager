import './Spinner.css';

const Spinner = () => (
  <div className="spinner" role="status" aria-live="polite" aria-label="Loading">
    <span className="spinner__circle" />
  </div>
);

export default Spinner;
