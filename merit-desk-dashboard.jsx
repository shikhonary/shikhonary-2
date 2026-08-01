import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";
import {
  Users, FileText, BookOpen, Percent, Search, Bell, ChevronRight,
  AlertTriangle, Clock, GraduationCap, Layers, ListChecks, Settings,
  LayoutGrid, Flame, ShieldAlert,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  MOCK DATA — shaped to mirror the Prisma schema's real entities     */
/* ------------------------------------------------------------------ */

const stats = {
  students: 1250,
  activeExamGroups: 6,
  mcqBank: 8942,
  avgMerit: 71.4,
};

const classes = [
  { name: "SSC 2027", students: 412 },
  { name: "HSC 1st Yr", students: 356 },
  { name: "HSC 2nd Yr", students: 298 },
  { name: "Admission Prep", students: 184 },
];

const subjectPerf = [
  { subject: "Physics", avg: 74 },
  { subject: "Chemistry", avg: 68 },
  { subject: "Biology", avg: 81 },
  { subject: "Higher Math", avg: 62 },
  { subject: "English", avg: 88 },
];

const examStatus = [
  { name: "Submitted", value: 68, color: "#1E9E6B" },
  { name: "In Progress", value: 12, color: "#E7A93D" },
  { name: "Auto-Submitted", value: 14, color: "#2F5EFF" },
  { name: "Abandoned", value: 6, color: "#E14B4B" },
];

const meritList = [
  { rank: 1, name: "Farhan Rahman", roll: "1042", cls: "HSC 2nd Yr", obtained: 287, total: 300, pct: 95.7, grade: "A+", gpa: 5.0, attempted: "6/6" },
  { rank: 2, name: "Tasnia Islam", roll: "0918", cls: "HSC 2nd Yr", obtained: 279, total: 300, pct: 93.0, grade: "A+", gpa: 5.0, attempted: "6/6" },
  { rank: 3, name: "Mahmudul Hasan", roll: "1201", cls: "HSC 2nd Yr", obtained: 271, total: 300, pct: 90.3, grade: "A+", gpa: 5.0, attempted: "5/6" },
  { rank: 4, name: "Nusrat Jahan", roll: "0754", cls: "HSC 2nd Yr", obtained: 264, total: 300, pct: 88.0, grade: "A+", gpa: 5.0, attempted: "6/6" },
  { rank: 5, name: "Rakibul Alam", roll: "1330", cls: "HSC 2nd Yr", obtained: 251, total: 300, pct: 83.7, grade: "A", gpa: 4.5, attempted: "6/6" },
  { rank: 6, name: "Sadia Afrin", roll: "0889", cls: "HSC 2nd Yr", obtained: 246, total: 300, pct: 82.0, grade: "A", gpa: 4.5, attempted: "5/6" },
];

const recentAttempts = [
  { student: "Farhan Rahman", exam: "Physics — Chapter 7 Weekly", status: "Submitted", score: 92, tabSwitches: 0, last: "2m ago" },
  { student: "Imran Kabir", exam: "HSC Model Test — Series 3", status: "In Progress", score: null, tabSwitches: 3, last: "just now" },
  { student: "Nusrat Jahan", exam: "Chemistry — Bonding MCQ", status: "Auto-Submitted", score: 64, tabSwitches: 1, last: "18m ago" },
  { student: "Tanvir Ahmed", exam: "HSC Model Test — Series 3", status: "Abandoned", score: 31, tabSwitches: 6, last: "1h ago" },
  { student: "Sadia Afrin", exam: "Biology — Chapter 4 Weekly", status: "Submitted", score: 88, tabSwitches: 0, last: "2h ago" },
];

const statusStyle = {
  Submitted: { bg: "#E9F7F0", fg: "#1E9E6B" },
  "In Progress": { bg: "#FCF3E1", fg: "#B9791F" },
  "Auto-Submitted": { bg: "#EAEFFF", fg: "#2F5EFF" },
  Abandoned: { bg: "#FBEAEA", fg: "#C63C3C" },
};

/* ------------------------------------------------------------------ */
/*  SIGNATURE ELEMENT — OMR bubble-grid, standing in for progress rings */
/* ------------------------------------------------------------------ */

function BubbleGrid({ pct, cols = 10, rows = 3, size = 7, gap = 3, fill = "#2F5EFF" }) {
  const total = cols * rows;
  const filled = Math.round((pct / 100) * total);
  const cells = Array.from({ length: total });
  const w = cols * (size + gap) - gap;
  const h = rows * (size + gap) - gap;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      {cells.map((_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const cx = col * (size + gap) + size / 2;
        const cy = row * (size + gap) + size / 2;
        const isFilled = i < filled;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={size / 2}
            fill={isFilled ? fill : "none"}
            stroke={isFilled ? fill : "#D3D8E0"}
            strokeWidth="1.1"
          />
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */

const navItems = [
  { label: "Overview", icon: LayoutGrid, active: true },
  { label: "Students", icon: Users },
  { label: "Exams", icon: FileText },
  { label: "Exam Groups", icon: Layers },
  { label: "Question Bank", icon: BookOpen },
  { label: "Classes & Subjects", icon: GraduationCap },
  { label: "Settings", icon: Settings },
];

export default function MeritDeskDashboard() {
  const [active, setActive] = useState("Overview");

  return (
    <div className="md-app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');

        .md-app {
          --ink: #12141C;
          --paper: #F2F4F7;
          --surface: #FFFFFF;
          --accent: #2F5EFF;
          --accent-soft: #EAEFFF;
          --correct: #1E9E6B;
          --incorrect: #E14B4B;
          --pending: #B9791F;
          --line: #E2E6EC;
          --muted: #6B7280;
          font-family: 'Inter', sans-serif;
          background: var(--paper);
          color: var(--ink);
          min-height: 100vh;
          display: flex;
          width: 100%;
        }
        .md-app * { box-sizing: border-box; }
        .md-mono { font-family: 'JetBrains Mono', monospace; }
        .md-display { font-family: 'Sora', sans-serif; }

        /* Sidebar */
        .md-sidebar {
          width: 236px;
          flex-shrink: 0;
          background: var(--ink);
          color: #E7E9EF;
          display: flex;
          flex-direction: column;
          padding: 22px 14px;
          position: sticky;
          top: 0;
          height: 100vh;
        }
        .md-logo {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 4px 10px 22px 10px;
        }
        .md-logo-mark {
          width: 26px; height: 26px;
          border-radius: 6px;
          background: var(--accent);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .md-logo-text { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 15.5px; letter-spacing: -0.01em; }
        .md-logo-sub { font-size: 10.5px; color: #8A8FA3; margin-top: 1px; }

        .md-nav { display: flex; flex-direction: column; gap: 2px; margin-top: 8px; }
        .md-nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 11px;
          border-radius: 8px;
          font-size: 13.5px;
          color: #C4C8D6;
          cursor: pointer;
          transition: background .12s ease, color .12s ease;
          border: none; background: none; width: 100%; text-align: left;
          font-family: inherit;
        }
        .md-nav-item:hover { background: #1D2030; color: #fff; }
        .md-nav-item.is-active { background: var(--accent); color: #fff; }
        .md-nav-item:focus-visible { outline: 2px solid #6E8BFF; outline-offset: 1px; }

        .md-sidebar-foot {
          margin-top: auto;
          padding: 12px 11px;
          border-top: 1px solid #22263A;
          font-size: 11.5px;
          color: #6F7488;
          line-height: 1.5;
        }

        /* Main */
        .md-main { flex: 1; min-width: 0; }
        .md-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 28px;
          border-bottom: 1px solid var(--line);
          background: var(--surface);
          position: sticky; top: 0; z-index: 5;
        }
        .md-page-title { font-family: 'Sora', sans-serif; font-weight: 600; font-size: 19px; }
        .md-page-eyebrow { font-size: 11.5px; color: var(--muted); margin-bottom: 2px; letter-spacing: .03em; text-transform: uppercase; }
        .md-search {
          display: flex; align-items: center; gap: 8px;
          border: 1px solid var(--line); border-radius: 8px;
          padding: 7px 11px; font-size: 13px; color: var(--muted);
          width: 260px;
        }
        .md-search input { border: none; outline: none; background: none; font-size: 13px; width: 100%; font-family: inherit; color: var(--ink); }
        .md-topbar-right { display: flex; align-items: center; gap: 16px; }
        .md-icon-btn {
          width: 34px; height: 34px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid var(--line); background: var(--surface); color: var(--muted);
          cursor: pointer;
        }
        .md-icon-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
        .md-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: var(--accent-soft); color: var(--accent);
          font-family: 'Sora', sans-serif; font-weight: 600; font-size: 12.5px;
          display: flex; align-items: center; justify-content: center;
        }

        .md-content { padding: 26px 28px 44px; }

        /* Stat cards */
        .md-stat-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 22px;
        }
        .md-stat-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 16px 18px;
        }
        .md-stat-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .md-stat-icon {
          width: 30px; height: 30px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          background: var(--accent-soft); color: var(--accent);
        }
        .md-stat-label { font-size: 12px; color: var(--muted); }
        .md-stat-value { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 25px; margin-top: 2px; }

        /* Panels */
        .md-grid-2 {
          display: grid;
          grid-template-columns: 1.35fr 1fr;
          gap: 14px;
          margin-bottom: 14px;
        }
        .md-panel {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 18px 20px 8px;
        }
        .md-panel-head {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 12px;
        }
        .md-panel-title { font-family: 'Sora', sans-serif; font-weight: 600; font-size: 14.5px; }
        .md-panel-sub { font-size: 11.5px; color: var(--muted); margin-top: 1px; }
        .md-panel-link {
          font-size: 12.5px; color: var(--accent); display: flex; align-items: center; gap: 2px;
          cursor: pointer; background: none; border: none; font-family: inherit;
        }

        .md-legend { display: flex; flex-direction: column; gap: 8px; margin-top: 4px; padding-bottom: 14px; }
        .md-legend-row { display: flex; align-items: center; justify-content: space-between; font-size: 12.5px; }
        .md-legend-left { display: flex; align-items: center; gap: 8px; }
        .md-dot { width: 8px; height: 8px; border-radius: 50%; }
        .md-legend-val { font-family: 'JetBrains Mono', monospace; color: var(--muted); }

        /* Table: merit list */
        .md-table { width: 100%; border-collapse: collapse; }
        .md-table th {
          text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .04em;
          color: var(--muted); font-weight: 600; padding: 8px 10px; border-bottom: 1px solid var(--line);
        }
        .md-table td { padding: 10px 10px; border-bottom: 1px solid #EEF0F3; font-size: 13px; vertical-align: middle; }
        .md-table tr:last-child td { border-bottom: none; }
        .md-rank { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: var(--muted); }
        .md-rank.top3 { color: var(--accent); }
        .md-name { font-weight: 600; }
        .md-roll { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--muted); }
        .md-score-cell { font-family: 'JetBrains Mono', monospace; }
        .md-grade-badge {
          display: inline-block; padding: 2px 8px; border-radius: 20px;
          background: var(--accent-soft); color: var(--accent);
          font-family: 'JetBrains Mono', monospace; font-size: 11.5px; font-weight: 600;
        }

        /* Recent attempts */
        .md-attempt-row {
          display: grid;
          grid-template-columns: 1.3fr 1.5fr .8fr .6fr .8fr;
          align-items: center;
          gap: 8px;
          padding: 11px 4px;
          border-bottom: 1px solid #EEF0F3;
          font-size: 13px;
        }
        .md-attempt-row:last-child { border-bottom: none; }
        .md-attempt-head {
          display: grid;
          grid-template-columns: 1.3fr 1.5fr .8fr .6fr .8fr;
          font-size: 11px; text-transform: uppercase; letter-spacing: .04em;
          color: var(--muted); font-weight: 600; padding: 0 4px 8px;
        }
        .md-badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 9px; border-radius: 20px; font-size: 11.5px; font-weight: 600;
          width: fit-content;
        }
        .md-flag { display: flex; align-items: center; gap: 4px; color: var(--incorrect); font-size: 12px; }
        .md-flag.ok { color: var(--muted); }
        .md-muted-mono { font-family: 'JetBrains Mono', monospace; color: var(--muted); font-size: 12px; }

        @media (max-width: 980px) {
          .md-grid-2 { grid-template-columns: 1fr; }
          .md-stat-row { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 720px) {
          .md-app { flex-direction: column; }
          .md-sidebar { width: 100%; height: auto; position: static; flex-direction: row; align-items: center; overflow-x: auto; padding: 12px 14px; }
          .md-logo { padding: 0 14px 0 0; }
          .md-nav { flex-direction: row; margin-top: 0; }
          .md-sidebar-foot { display: none; }
          .md-search { width: 150px; }
          .md-stat-row { grid-template-columns: 1fr 1fr; }
          .md-attempt-row, .md-attempt-head { grid-template-columns: 1.2fr 1fr .8fr; }
          .md-attempt-row > :nth-child(4), .md-attempt-row > :nth-child(5),
          .md-attempt-head > :nth-child(4), .md-attempt-head > :nth-child(5) { display: none; }
        }
      `}</style>

      {/* ---------------- Sidebar ---------------- */}
      <aside className="md-sidebar">
        <div className="md-logo">
          <div className="md-logo-mark">
            <ListChecks size={15} color="#fff" />
          </div>
          <div>
            <div className="md-logo-text">Merit Desk</div>
            <div className="md-logo-sub">Exam control panel</div>
          </div>
        </div>
        <nav className="md-nav">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`md-nav-item ${active === item.label ? "is-active" : ""}`}
              onClick={() => setActive(item.label)}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="md-sidebar-foot">
          Synced 2 min ago
          <br />
          Postgres · 12 active exam attempts
        </div>
      </aside>

      {/* ---------------- Main ---------------- */}
      <main className="md-main">
        <div className="md-topbar">
          <div>
            <div className="md-page-eyebrow">Wed, 29 Jul 2026</div>
            <div className="md-page-title">Overview</div>
          </div>
          <div className="md-topbar-right">
            <div className="md-search">
              <Search size={14} />
              <input placeholder="Search student, roll, exam…" />
            </div>
            <button className="md-icon-btn" aria-label="Notifications">
              <Bell size={16} />
            </button>
            <div className="md-avatar">AD</div>
          </div>
        </div>

        <div className="md-content">
          {/* Stat cards */}
          <div className="md-stat-row">
            <div className="md-stat-card">
              <div className="md-stat-top">
                <div>
                  <div className="md-stat-label">Total students</div>
                  <div className="md-stat-value md-mono">{stats.students.toLocaleString()}</div>
                </div>
                <div className="md-stat-icon"><Users size={15} /></div>
              </div>
            </div>
            <div className="md-stat-card">
              <div className="md-stat-top">
                <div>
                  <div className="md-stat-label">Active exam groups</div>
                  <div className="md-stat-value md-mono">{stats.activeExamGroups}</div>
                </div>
                <div className="md-stat-icon"><Layers size={15} /></div>
              </div>
            </div>
            <div className="md-stat-card">
              <div className="md-stat-top">
                <div>
                  <div className="md-stat-label">Questions in bank</div>
                  <div className="md-stat-value md-mono">{stats.mcqBank.toLocaleString()}</div>
                </div>
                <div className="md-stat-icon"><BookOpen size={15} /></div>
              </div>
            </div>
            <div className="md-stat-card">
              <div className="md-stat-top">
                <div>
                  <div className="md-stat-label">Avg merit score</div>
                  <div className="md-stat-value md-mono">{stats.avgMerit}%</div>
                </div>
                <div className="md-stat-icon"><Percent size={15} /></div>
              </div>
              <BubbleGrid pct={stats.avgMerit} />
            </div>
          </div>

          {/* Subject performance + status donut */}
          <div className="md-grid-2">
            <div className="md-panel">
              <div className="md-panel-head">
                <div>
                  <div className="md-panel-title">Subject-wise average score</div>
                  <div className="md-panel-sub">Across all attempted exams this term</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={subjectPerf} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#EEF0F3" />
                  <XAxis dataKey="subject" tick={{ fontSize: 11.5, fill: "#6B7280" }} axisLine={{ stroke: "#E2E6EC" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11.5, fill: "#6B7280" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    cursor={{ fill: "#F2F4F7" }}
                    contentStyle={{ borderRadius: 8, border: "1px solid #E2E6EC", fontSize: 12.5, fontFamily: "Inter" }}
                  />
                  <Bar dataKey="avg" radius={[5, 5, 0, 0]} fill="#2F5EFF" maxBarSize={44} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="md-panel">
              <div className="md-panel-head">
                <div>
                  <div className="md-panel-title">Exam attempt status</div>
                  <div className="md-panel-sub">Last 30 days</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={examStatus} dataKey="value" nameKey="name" innerRadius={38} outerRadius={58} paddingAngle={2}>
                    {examStatus.map((s, i) => (
                      <Cell key={i} fill={s.color} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="md-legend">
                {examStatus.map((s) => (
                  <div className="md-legend-row" key={s.name}>
                    <div className="md-legend-left">
                      <span className="md-dot" style={{ background: s.color }} />
                      {s.name}
                    </div>
                    <span className="md-legend-val">{s.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Class distribution + merit list */}
          <div className="md-grid-2">
            <div className="md-panel">
              <div className="md-panel-head">
                <div>
                  <div className="md-panel-title">Students by academic class</div>
                  <div className="md-panel-sub">{stats.students.toLocaleString()} total, 4 active classes</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", paddingBottom: "16px" }}>
                {classes.map((c) => {
                  const pct = Math.round((c.students / stats.students) * 100);
                  return (
                    <div key={c.name}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", marginBottom: "5px" }}>
                        <span>{c.name}</span>
                        <span className="md-muted-mono">{c.students}</span>
                      </div>
                      <div style={{ height: "6px", borderRadius: "4px", background: "#EEF0F3", overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: "#2F5EFF", borderRadius: "4px" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="md-panel">
              <div className="md-panel-head">
                <div>
                  <div className="md-panel-title">Live proctoring flags</div>
                  <div className="md-panel-sub">Attempts with tab-switch warnings</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingBottom: "16px" }}>
                {recentAttempts.filter(a => a.tabSwitches > 0).map((a) => (
                  <div key={a.student} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12.5px" }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{a.student}</div>
                      <div className="md-panel-sub">{a.exam}</div>
                    </div>
                    <div className="md-flag">
                      <ShieldAlert size={14} />
                      {a.tabSwitches} switches
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Merit list */}
          <div className="md-panel" style={{ marginBottom: "14px" }}>
            <div className="md-panel-head">
              <div>
                <div className="md-panel-title">HSC Model Test — Series 3 · Merit list</div>
                <div className="md-panel-sub">Ranked by percentage · calculation: SUM</div>
              </div>
              <button className="md-panel-link">
                Full result <ChevronRight size={14} />
              </button>
            </div>
            <table className="md-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Marks</th>
                  <th>Score</th>
                  <th>Grade</th>
                  <th>Exams attempted</th>
                </tr>
              </thead>
              <tbody>
                {meritList.map((m) => (
                  <tr key={m.rank}>
                    <td><span className={`md-rank ${m.rank <= 3 ? "top3" : ""}`}>#{m.rank}</span></td>
                    <td>
                      <div className="md-name">{m.name}</div>
                      <div className="md-roll">Roll {m.roll}</div>
                    </td>
                    <td>{m.cls}</td>
                    <td className="md-score-cell">{m.obtained}/{m.total}</td>
                    <td style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <BubbleGrid pct={m.pct} cols={5} rows={2} size={6} gap={2.5} fill={m.pct >= 90 ? "#1E9E6B" : "#2F5EFF"} />
                      <span className="md-score-cell">{m.pct}%</span>
                    </td>
                    <td><span className="md-grade-badge">{m.grade} · {m.gpa}</span></td>
                    <td className="md-muted-mono">{m.attempted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent attempts */}
          <div className="md-panel">
            <div className="md-panel-head">
              <div>
                <div className="md-panel-title">Recent exam attempts</div>
                <div className="md-panel-sub">Live and just-finished sessions</div>
              </div>
            </div>
            <div className="md-attempt-head">
              <span>Student</span>
              <span>Exam</span>
              <span>Status</span>
              <span>Score</span>
              <span>Activity</span>
            </div>
            {recentAttempts.map((a, i) => {
              const s = statusStyle[a.status];
              return (
                <div className="md-attempt-row" key={i}>
                  <span style={{ fontWeight: 600 }}>{a.student}</span>
                  <span style={{ color: "var(--muted)" }}>{a.exam}</span>
                  <span className="md-badge" style={{ background: s.bg, color: s.fg }}>{a.status}</span>
                  <span className="md-score-cell">{a.score !== null ? `${a.score}%` : "—"}</span>
                  <span className={`md-flag ${a.tabSwitches === 0 ? "ok" : ""}`}>
                    <Clock size={12} /> {a.last}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
