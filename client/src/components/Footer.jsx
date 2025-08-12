export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ padding: "12px 16px", textAlign: "center", color: "#6b7280", fontSize: 14 }}>
      <div style={{ marginBottom: 4 }}>
        <strong>Learn English</strong> — học tiếng Anh 1 kèm 1
      </div>
      <div>© {year} By Khang English</div>
    </footer>
  );
}
