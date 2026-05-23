import { useEffect, useState } from "react";
import { Power } from "lucide-react";
import logo from "/icon/128.png";

const ENABLED_KEY = "enabled";

function App() {
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    browser.storage.local.get(ENABLED_KEY).then((result) => {
      const value = result[ENABLED_KEY] as boolean | undefined;
      setEnabled(value ?? true);
    });
  }, []);

  async function toggle() {
    if (enabled === null) return;
    const next = !enabled;
    setEnabled(next);
    await browser.storage.local.set({ [ENABLED_KEY]: next });
  }

  const isOn = enabled === true;
  const isLoading = enabled === null;

  return (
    <div className="relative w-[320px] h-[380px] overflow-hidden bg-zinc-950 text-white font-sans">
      <div
        className={`absolute inset-0 transition-all duration-700 ease-out ${
          isOn
            ? "bg-[radial-gradient(circle_at_50%_30%,rgba(99,102,241,0.35),transparent_60%)]"
            : "bg-[radial-gradient(circle_at_50%_30%,rgba(63,63,70,0.4),transparent_60%)]"
        }`}
      />

      <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] bg-[size:20px_20px]" />

      <div className="relative h-full flex flex-col">
        <header className="flex items-center gap-2 px-5 pt-5">
          <img
            src={logo}
            alt="Tomi"
            className="w-8 h-8 rounded-lg ring-1 ring-white/10 shadow-md"
          />
          <div>
            <h1 className="text-sm font-semibold tracking-tight leading-none">
              Tomi
            </h1>
            <p className="text-[10px] text-white/50 mt-1 leading-none">
              Leitor de seleção
            </p>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
          <button
            onClick={toggle}
            disabled={isLoading}
            aria-pressed={isOn}
            aria-label={isOn ? "Desativar extensão" : "Ativar extensão"}
            className="group relative outline-none disabled:cursor-not-allowed"
          >
            <span
              className={`absolute inset-0 rounded-full blur-2xl transition-all duration-700 ${
                isOn
                  ? "bg-indigo-500/60 scale-110 animate-pulse"
                  : "bg-zinc-700/30 scale-95"
              }`}
            />

            <span
              className={`absolute inset-0 rounded-full transition-all duration-500 ${
                isOn
                  ? "ring-2 ring-indigo-400/40 ring-offset-4 ring-offset-zinc-950 scale-105"
                  : "ring-1 ring-zinc-700 scale-100"
              }`}
            />

            <span
              className={`relative flex items-center justify-center w-28 h-28 rounded-full transition-all duration-500 transform group-active:scale-95 ${
                isOn
                  ? "bg-gradient-to-br from-indigo-400 via-indigo-500 to-violet-600 shadow-[0_0_40px_rgba(99,102,241,0.6)]"
                  : "bg-gradient-to-br from-zinc-800 to-zinc-900 shadow-inner"
              }`}
            >
              <Power
                size={36}
                strokeWidth={2.2}
                className={`transition-all duration-500 ${
                  isOn
                    ? "text-white"
                    : "text-zinc-500 group-hover:text-zinc-300"
                }`}
              />
            </span>
          </button>

          <div className="flex flex-col items-center gap-1.5 h-12">
            <div className="flex items-center gap-2">
              <span
                className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                  isOn
                    ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                    : "bg-zinc-600"
                }`}
              />
              <span
                className={`text-xs font-medium tracking-wide uppercase transition-colors duration-500 ${
                  isOn ? "text-emerald-300" : "text-zinc-500"
                }`}
              >
                {isLoading ? "Carregando" : isOn ? "Ativado" : "Desativado"}
              </span>
            </div>
            <p className="text-[11px] text-white/40 text-center max-w-[220px] leading-snug">
              {isOn
                ? "Selecione um texto em qualquer página para ouvir"
                : "Clique no botão para ativar a leitura"}
            </p>
          </div>
        </div>

        <footer className="px-5 pb-4 flex items-center justify-between text-[10px] text-white/30">
          <span>v0.0.0</span>
          <span className="tracking-wider">
            {isOn ? "ON · AIR" : "STAND BY"}
          </span>
        </footer>
      </div>
    </div>
  );
}

export default App;
