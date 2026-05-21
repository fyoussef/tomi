import { Play, Pause, Square, Volume2, VolumeX } from "lucide-react";

interface Props {
  text: string;
  onClose: () => void;
}

type State = "idle" | "playing" | "paused";

const CHARS_PER_SECOND = 15;

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  return (
    voices.find((v) => v.lang === "pt-BR") ||
    voices.find((v) => v.lang.startsWith("pt")) ||
    voices.find((v) => v.default) ||
    voices[0]
  );
}

export function Toolbar({ text, onClose }: Props) {
  const [state, setState] = useState<State>("idle");
  const [volume, setVolume] = useState(1);
  const [showVolume, setShowVolume] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const charIndexRef = useRef(0);
  const baseOffsetRef = useRef(0);
  const speechStartedAtRef = useRef(0);
  const volumeDebounceRef = useRef<number | null>(null);

  useEffect(() => {
    window.speechSynthesis.getVoices();
    const onVoices = () => window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener("voiceschanged", onVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
      if (volumeDebounceRef.current !== null) {
        window.clearTimeout(volumeDebounceRef.current);
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  function buildUtterance(startFrom: number, vol: number) {
    const u = new SpeechSynthesisUtterance(text.slice(startFrom));
    u.volume = vol;
    const voice = pickVoice();
    if (voice) {
      u.voice = voice;
      u.lang = voice.lang;
    }
    baseOffsetRef.current = startFrom;
    charIndexRef.current = startFrom;
    speechStartedAtRef.current = 0;

    // Guardas: ignoram eventos de utterances obsoletos (após cancel),
    // senão eles corrompem os refs do novo utterance.
    u.onstart = () => {
      if (utteranceRef.current !== u) return;
      speechStartedAtRef.current = Date.now();
    };
    u.onboundary = (e) => {
      if (utteranceRef.current !== u) return;
      charIndexRef.current = baseOffsetRef.current + e.charIndex;
    };
    u.onend = () => {
      if (utteranceRef.current !== u) return;
      utteranceRef.current = null;
      charIndexRef.current = 0;
      baseOffsetRef.current = 0;
      speechStartedAtRef.current = 0;
      setState("idle");
    };
    u.onerror = () => {
      if (utteranceRef.current !== u) return;
      setState("idle");
    };
    return u;
  }

  function currentPosition(): number | null {
    // Posição confiável: onboundary já avançou
    if (charIndexRef.current > baseOffsetRef.current) {
      return charIndexRef.current;
    }
    // Fallback por tempo decorrido — só se faz sentido estimar
    const start = speechStartedAtRef.current;
    if (!start) return null;
    const elapsedMs = Date.now() - start;
    if (elapsedMs < 500) return null;
    return (
      baseOffsetRef.current +
      Math.floor((elapsedMs / 1000) * CHARS_PER_SECOND)
    );
  }

  function speak() {
    const u = buildUtterance(0, volume);
    utteranceRef.current = u;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    setState("playing");
  }

  function handlePlay() {
    if (state === "paused") {
      window.speechSynthesis.resume();
      setState("playing");
      return;
    }
    if (state === "playing") return;
    speak();
  }

  function handlePause() {
    if (state !== "playing") return;
    window.speechSynthesis.pause();
    setState("paused");
  }

  function handleStop() {
    utteranceRef.current = null;
    window.speechSynthesis.cancel();
    charIndexRef.current = 0;
    baseOffsetRef.current = 0;
    speechStartedAtRef.current = 0;
    setState("idle");
    onClose();
  }

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseFloat(e.target.value);
    setVolume(v);

    if (volumeDebounceRef.current !== null) {
      window.clearTimeout(volumeDebounceRef.current);
    }

    volumeDebounceRef.current = window.setTimeout(() => {
      volumeDebounceRef.current = null;
      const speaking = window.speechSynthesis.speaking;
      const paused = window.speechSynthesis.paused;
      if (!speaking && !paused) return;

      const position = currentPosition();
      // Sem posição confiável (muito no começo): não reinicia.
      // Volume novo já está no state — aplica na próxima play.
      if (position === null) return;

      const u = buildUtterance(position, v);
      utteranceRef.current = u;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
      if (paused) {
        window.speechSynthesis.pause();
        setState("paused");
      } else {
        setState("playing");
      }
    }, 250);
  }

  return (
    <div className="flex items-center gap-1 px-2 py-1.5 bg-zinc-900 rounded-lg shadow-xl border border-zinc-700">
      <button
        onClick={handlePlay}
        title={state === "paused" ? "Continuar" : "Reproduzir"}
        className="flex items-center justify-center w-8 h-8 rounded-md text-white hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={state === "playing"}
      >
        <Play size={16} />
      </button>

      <button
        onClick={handlePause}
        title="Pausar"
        className="flex items-center justify-center w-8 h-8 rounded-md text-white hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={state !== "playing"}
      >
        <Pause size={16} />
      </button>

      <div className="relative">
        <button
          onClick={() => setShowVolume((s) => !s)}
          title="Volume"
          className="flex items-center justify-center w-8 h-8 rounded-md text-white hover:bg-zinc-700 transition-colors"
        >
          {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        {showVolume && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-zinc-900 rounded-lg border border-zinc-700 shadow-xl z-10">
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={handleVolumeChange}
              className="w-24 accent-white cursor-pointer"
            />
          </div>
        )}
      </div>

      <button
        onClick={handleStop}
        title="Parar e fechar"
        className="flex items-center justify-center w-8 h-8 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
      >
        <Square size={14} />
      </button>

      {/* Texto truncado como preview */}
      <span className="text-zinc-400 text-xs max-w-45 truncate px-1 border-l border-zinc-700 ml-1 pl-2">
        {text}
      </span>
    </div>
  );
}
