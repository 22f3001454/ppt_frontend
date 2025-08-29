import React, { useState } from "react";

const BACKEND = " https://ppt-backend-4u6d.onrender.com";

export default function App() {
  const [text, setText] = useState("");
  const [tone, setTone] = useState("");
  const [provider, setProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");
  const [file, setFile] = useState(null);
  const [planning, setPlanning] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handlePlan = async () => {
    setError(""); setBusy(true);
    try {
      const fd = new FormData();
      fd.append("text", text);
      fd.append("provider", provider);
      fd.append("api_key", apiKey);
      if (tone) fd.append("tone", tone);
      const res = await fetch(`${BACKEND}/plan`, { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setPlanning(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      const fd = new FormData();
      fd.append("text", text);
      fd.append("provider", provider);
      fd.append("api_key", apiKey);
      if (tone) fd.append("tone", tone);
      if (file) fd.append("template", file);

      const res = await fetch(`${BACKEND}/generate`, { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "generated.pptx";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ fontFamily: "system-ui, Arial, sans-serif", minHeight: "100vh", background: "#f7f7f8" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>Your Text, Your Style – Auto-Generate a Presentation</h1>
        <p style={{ color: "#555", marginBottom: 20 }}>
          Paste text, pick an LLM provider, add your API key, optionally upload a .pptx/.potx template, and download the generated slides.
        </p>

        <form onSubmit={handleGenerate} style={{ display: "grid", gap: 12 }}>
          <label>
            <div>Provider</div>
            <select value={provider} onChange={(e) => setProvider(e.target.value)}>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="gemini">Google Gemini</option>
            </select>
          </label>

          <label>
            <div>API Key (never stored)</div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your provider API key"
              required
              style={{ width: "100%" }}
            />
          </label>

          <label>
            <div>Optional tone / style (e.g., “investor pitch”, “technical”)</div>
            <input value={tone} onChange={(e) => setTone(e.target.value)} placeholder="professional, investor pitch, research summary…" />
          </label>

          <label>
            <div>Your text</div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              placeholder="Paste a large block of text or markdown…"
              required
              style={{ width: "100%" }}
            />
          </label>

          <label>
            <div>PowerPoint template (.pptx / .potx) — optional</div>
            <input type="file" accept=".pptx,.potx" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>

          <div style={{ display: "flex", gap: 12 }}>
            <button type="button" onClick={handlePlan} disabled={busy || !text || !apiKey}>
              {busy ? "Planning…" : "Preview Plan"}
            </button>
            <button type="submit" disabled={busy || !text || !apiKey}>
              {busy ? "Generating…" : "Generate .pptx"}
            </button>
          </div>

          {error && <div style={{ color: "crimson" }}>Error: {error}</div>}
        </form>

        {planning && (
          <div style={{ marginTop: 24, background: "white", padding: 16, borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,.08)" }}>
            <h2 style={{ marginTop: 0 }}>Slide Preview</h2>
            <ol>
              {planning.slides.map((s, i) => (
                <li key={i} style={{ marginBottom: 12 }}>
                  <strong>{s.title}</strong>
                  <ul>{s.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>
                  {s.notes && <details><summary>Notes</summary><p>{s.notes}</p></details>}
                </li>
              ))}
            </ol>
          </div>
        )}

        <footer style={{ marginTop: 40, color: "#666" }}>
          <div>⭐ Optional enhancements supported: speaker notes, tone control, plan preview.</div>
        </footer>
      </div>
    </div>
  );
}
