import { QRCodeSVG } from "qrcode.react";
import { getMajorLabel, type Major } from "@/lib/types";

type CardStudent = {
  name: string;
  nisn: string;
  class: string;
  major: Major;
  password: string;
  login_token: string;
};

/**
 * Kartu kredensial siswa — ukuran fisik 85,6 × 53,98 mm (standar ID-1/KTP),
 * orientasi landscape. Ukuran & tata letak diatur di app/globals.css (.cred-card).
 */
export function CredentialCard({ student, qrUrl }: { student: CardStudent; qrUrl: string }) {
  return (
    <article className="cred-card">
      <header className="cred-head">
        <img
          className="cred-mark"
          src="/logo.webp"
          alt=""
          width={384}
          height={384}
        />
        <div className="cred-brand">
          Kartu Kunjungan Industri <span>2026</span>
        </div>
      </header>

      <div className="cred-body">
        <div className="cred-info">
          <h2 className="cred-name">{student.name}</h2>
          <p className="cred-class">
            {student.class} · {getMajorLabel(student.major)}
          </p>

          <div className="cred-field">
            <div className="cred-label">NISN</div>
            <div className="cred-value">{student.nisn}</div>
          </div>

          <div className="cred-pass-box">
            <div className="cred-label">Password</div>
            <div className="cred-pass">{student.password}</div>
          </div>
        </div>

        <div className="cred-qr">
          <QRCodeSVG
            value={qrUrl}
            size={256}
            level="M"
            marginSize={1}
            bgColor="#ffffff"
            fgColor="#101828"
            title={`QR login ${student.name}`}
          />
          <span>Scan untuk login</span>
        </div>
      </div>

      <footer className="cred-foot">
        Scan QR atau login memakai <strong>NISN + password</strong>
      </footer>
    </article>
  );
}
