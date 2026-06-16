export default function Logo({ compact = false }) {
  return (
    <div className={`logo ${compact ? "compact" : ""}`} aria-label="متجر الشامل">
      <img className="logo-mark" src="/alshamel-logo.png" alt="شعار متجر الشامل" />
      {!compact && (
        <span>
          <b>متجر الشامل</b>
          <small>كل ما تحتاجه في مكان واحد</small>
        </span>
      )}
    </div>
  );
}
