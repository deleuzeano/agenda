const { useState } = React;

const HOURS = Array.from({ length: 19 }, (_, i) => i + 5); // 5h às 23h

const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const DAY_SHORT = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const CATEGORIES = {
  mestrado: { label: "Mestrado", color: "#7C3AED", emoji: "🎓" },
  direito: { label: "Direito", color: "#2563EB", emoji: "⚖️" },
  viagem: { label: "Viagem", color: "#D97706", emoji: "🚗" },
  psico: { label: "Psicóloga", color: "#059669", emoji: "🧠" },
  academia: { label: "Academia", color: "#DC2626", emoji: "💪" },
  tcc: { label: "TCC/Correções", color: "#7C2D12", emoji: "📝" },
  leitura: { label: "Leitura/Estudos", color: "#0F766E", emoji: "📚" },
  refeicao: { label: "Refeição", color: "#65A30D", emoji: "🍽️" },
  livre: { label: "Tempo livre", color: "#6B7280", emoji: "😌" },
  dormir: { label: "Dormir", color: "#1E3A5F", emoji: "😴" },
};

// Fixed schedule: [day(0-6), startHour, endHour, category, label]
const FIXED = [
  // SEGUNDA
  [0, 5, 7, "dormir", "Dormindo"],
  [0, 7, 8, "livre", "Acordar / Manhã"],
  [0, 8, 9, "leitura", "Leitura / Estudos"],
  [0, 9, 12, "tcc", "TCC / Correções"],
  [0, 12, 13, "refeicao", "Almoço"],
  [0, 13, 17, "leitura", "Leitura / Estudos"],
  [0, 17, 18, "livre", "Descanso / Prep. Direito"],
  [0, 18, 18.5, "viagem", "A pé p/ Direito"],
  [0, 18.5, 22, "direito", "Direito — Aula"],
  [0, 22, 23, "livre", "Jantar / Descanso"],

  // TERÇA
  [1, 5, 7, "dormir", "Dormindo"],
  [1, 7, 8, "livre", "Acordar / Manhã"],
  [1, 8, 9, "psico", "Psicóloga (online)"],
  [1, 9, 12, "leitura", "Leitura / Estudos"],
  [1, 12, 13, "refeicao", "Almoço"],
  [1, 13, 17, "tcc", "TCC / Correções"],
  [1, 17, 18, "academia", "Academia"],
  [1, 18, 18.5, "viagem", "A pé p/ Direito"],
  [1, 18.5, 22, "direito", "Direito — Aula"],
  [1, 22, 23, "livre", "Jantar / Descanso"],

  // QUARTA (normal)
  [2, 5, 7, "dormir", "Dormindo"],
  [2, 7, 8, "livre", "Acordar / Manhã"],
  [2, 8, 12, "leitura", "Leitura / Estudos"],
  [2, 12, 13, "refeicao", "Almoço"],
  [2, 13, 17, "tcc", "TCC / Correções"],
  [2, 17, 18, "academia", "Academia"],
  [2, 18, 18.5, "viagem", "A pé p/ Direito"],
  [2, 18.5, 22, "direito", "Direito — Aula"],
  [2, 22, 23, "livre", "Jantar / Descanso"],

  // QUINTA
  [3, 5, 6, "dormir", "Dormindo"],
  [3, 6, 8, "viagem", "Viagem (ida)"],
  [3, 8, 12, "mestrado", "Mestrado — Aula"],
  [3, 12, 14, "refeicao", "Almoço"],
  [3, 14, 18, "mestrado", "Mestrado — Aula"],
  [3, 18, 20, "viagem", "Viagem (volta)"],
  [3, 20, 20.5, "viagem", "Chegando / indo p/ Direito"],
  [3, 20.5, 22, "direito", "Direito — Aula"],
  [3, 22, 23, "livre", "Jantar / Descanso"],

  // SEXTA
  [4, 5, 7, "dormir", "Dormindo"],
  [4, 7, 9, "livre", "Recuperação / Manhã calma"],
  [4, 9, 12, "leitura", "Leitura / Estudos"],
  [4, 12, 13, "refeicao", "Almoço"],
  [4, 13, 17, "tcc", "TCC / Correções"],
  [4, 17, 18, "academia", "Academia"],
  [4, 18, 18.5, "viagem", "A pé p/ Direito"],
  [4, 18.5, 22, "direito", "Direito — Aula"],
  [4, 22, 23, "livre", "Jantar / Descanso"],

  // SÁBADO
  [5, 5, 8, "dormir", "Dormindo"],
  [5, 8, 10, "livre", "Manhã livre / Descanso"],
  [5, 10, 12, "tcc", "TCC / Correções"],
  [5, 12, 13, "refeicao", "Almoço"],
  [5, 13, 15, "leitura", "Leitura leve"],
  [5, 15, 23, "livre", "Tempo livre / Descanso"],

  // DOMINGO
  [6, 5, 9, "dormir", "Dormindo"],
  [6, 9, 12, "livre", "Manhã livre"],
  [6, 12, 13, "refeicao", "Almoço"],
  [6, 13, 16, "leitura", "Leitura / Prep. semana"],
  [6, 16, 23, "livre", "Descanso / Prep. semana"],
];

function fmtHour(h) {
  const hh = Math.floor(h);
  const mm = (h % 1) * 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function Agenda() {
  const [activeDay, setActiveDay] = useState(0);
  const [notes, setNotes] = useState({});
  const [checked, setChecked] = useState({});
  const [quartaEspecial, setQuartaEspecial] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const todayBlocks = FIXED.filter(([d]) => d === activeDay);

  // Para quarta especial (1x por mês)
  const blocks = todayBlocks.map(b => {
    if (quartaEspecial && activeDay === 2) {
      if (b[1] >= 5 && b[2] <= 8) return [2, b[1], b[2], "dormir", b[4]];
      if (b[1] === 8 && b[2] === 12) return [2, 6, 8, "viagem", "Viagem (ida)"];
    }
    return b;
  });

  const extraQuarta = quartaEspecial && activeDay === 2
    ? [[2, 8, 12, "mestrado", "Quarta Especial — Aula"]]
    : [];

  const allBlocks = [...blocks, ...extraQuarta].sort((a, b) => a[1] - b[1]);

  const totalTasks = allBlocks.filter(b => b[3] !== "dormir" && b[3] !== "livre" && b[3] !== "refeicao").length;
  const doneCount = allBlocks.filter(b => checked[`${activeDay}-${b[1]}`]).length;
  const progress = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;

  const isActive = (start, end) => currentHour >= start && currentHour < end;

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#0f0f1a", minHeight: "100vh", color: "#fff", padding: "16px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, background: "linear-gradient(90deg,#a78bfa,#60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          📅 Minha Agenda
        </h1>
        <p style={{ color: "#9ca3af", fontSize: 13, margin: "4px 0 0" }}>Mestrado + Direito</p>
      </div>

      {/* Day selector */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
        {DAYS.map((d, i) => (
          <button key={i} onClick={() => setActiveDay(i)} style={{
            flexShrink: 0, padding: "8px 12px", borderRadius: 12, border: "none", cursor: "pointer",
            background: activeDay === i ? "linear-gradient(135deg,#7c3aed,#2563eb)" : "#1e1e2e",
            color: activeDay === i ? "#fff" : "#9ca3af", fontWeight: activeDay === i ? 700 : 400,
            fontSize: 13, transition: "all .2s"
          }}>
            {DAY_SHORT[i]}
          </button>
        ))}
      </div>

      {/* Quarta especial toggle (1x por mês) */}
      {activeDay === 2 && (
        <div style={{ background: "#1e1e2e", borderRadius: 12, padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: "#c4b5fd" }}>📅 Quarta Especial (1x/mês)</span>
          <button onClick={() => setQuartaEspecial(v => !v)} style={{
            background: quartaEspecial ? "#7c3aed" : "#374151", border: "none", borderRadius: 20,
            padding: "4px 14px", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700
          }}>
            {quartaEspecial ? "ATIVO" : "Normal"}
          </button>
        </div>
      )}

      {/* Progress */}
      <div style={{ background: "#1e1e2e", borderRadius: 12, padding: "10px 14px", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12 }}>
          <span style={{ color: "#a78bfa" }}>⚡ Progresso do dia</span>
          <span style={{ color: "#60a5fa", fontWeight: 700 }}>{doneCount}/{totalTasks} tarefas</span>
        </div>
        <div style={{ background: "#374151", borderRadius: 99, height: 10, overflow: "hidden" }}>
          <div style={{
            width: `${progress}%`, height: "100%",
            background: "linear-gradient(90deg,#7c3aed,#60a5fa)",
            transition: "width .4s", borderRadius: 99
          }} />
        </div>
        {progress === 100 && <p style={{ color: "#34d399", fontSize: 12, margin: "6px 0 0", textAlign: "center" }}>🎉 Você arrasou hoje! Descanse bem.</p>}
        {progress >= 50 && progress < 100 && <p style={{ color: "#fbbf24", fontSize: 12, margin: "6px 0 0", textAlign: "center" }}>💪 Mais da metade! Você consegue!</p>}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {Object.entries(CATEGORIES).map(([k, v]) => (
          <span key={k} style={{ fontSize: 11, background: v.color + "33", color: v.color, border: `1px solid ${v.color}55`, borderRadius: 8, padding: "2px 8px" }}>
            {v.emoji} {v.label}
          </span>
        ))}
      </div>

      {/* Blocks */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {allBlocks.map((b, idx) => {
          const [day, start, end, cat, label] = b;
          const cfg = CATEGORIES[cat];
          const key = `${day}-${start}`;
          const done = !!checked[key];
          const active = isActive(start, end);
          const isCheckable = cat !== "dormir" && cat !== "livre" && cat !== "refeicao";

          return (
            <div key={idx} style={{
              background: active ? cfg.color + "33" : "#1e1e2e",
              border: `2px solid ${active ? cfg.color : cfg.color + "44"}`,
              borderRadius: 14, padding: "10px 14px",
              opacity: done ? 0.6 : 1,
              transition: "all .2s",
              boxShadow: active ? `0 0 12px ${cfg.color}55` : "none"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* Time */}
                <div style={{ minWidth: 90, fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>
                  {fmtHour(start)} – {fmtHour(end)}
                </div>
                {/* Emoji + label */}
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: cfg.color }}>
                    {cfg.emoji} {label}
                  </span>
                  {active && <span style={{ marginLeft: 8, fontSize: 11, background: cfg.color, color: "#fff", borderRadius: 6, padding: "1px 6px" }}>AGORA</span>}
                </div>
                {/* Checkbox */}
                {isCheckable && (
                  <button onClick={() => setChecked(c => ({ ...c, [key]: !c[key] }))} style={{
                    width: 28, height: 28, borderRadius: 8, border: `2px solid ${cfg.color}`,
                    background: done ? cfg.color : "transparent", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0
                  }}>
                    {done ? "✓" : ""}
                  </button>
                )}
              </div>
              {/* Notes */}
              {editingNote === key ? (
                <textarea
                  autoFocus
                  value={notes[key] || ""}
                  onChange={e => setNotes(n => ({ ...n, [key]: e.target.value }))}
                  onBlur={() => setEditingNote(null)}
                  placeholder="Anotação..."
                  style={{
                    marginTop: 8, width: "100%", background: "#0f0f1a", border: `1px solid ${cfg.color}55`,
                    borderRadius: 8, padding: "6px 10px", color: "#fff", fontSize: 12, resize: "vertical",
                    boxSizing: "border-box", minHeight: 60
                  }}
                />
              ) : (
                <div
                  onClick={() => setEditingNote(key)}
                  style={{
                    marginTop: 6, fontSize: 12, color: notes[key] ? "#d1d5db" : "#4b5563",
                    cursor: "text", padding: "4px 0"
                  }}
                >
                  {notes[key] || "＋ Adicionar anotação"}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ height: 40 }} />
    </div>
  );
}

// Renderizar o app
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<Agenda />);
}
