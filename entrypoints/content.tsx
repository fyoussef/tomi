import { createRoot } from "react-dom/client";
import "../assets/tailwind.css";
import { Toolbar } from "../components/toolbar";

export default defineContentScript({
  matches: ["<all_urls>"],
  cssInjectionMode: "ui",

  async main(ctx) {
    let ui: Awaited<ReturnType<typeof createShadowRootUi>> | null = null;
    let selectionChanged = false;

    function closeUi() {
      ui?.remove();
      ui = null;
    }

    // Reseta a cada mousedown; selectionchange marca true se algo mudou
    // entre mousedown e mouseup. Assim distinguimos "criou seleção" de
    // "clicou em algum lugar".
    document.addEventListener("mousedown", (e) => {
      const target = e.target as Element | null;
      if (target?.closest?.("leitor-toolbar")) return;
      selectionChanged = false;
    });

    document.addEventListener("selectionchange", () => {
      selectionChanged = true;
    });

    document.addEventListener("mouseup", async (e) => {
      const target = e.target as Element | null;
      // Cliques dentro da própria toolbar não devem fechar nem recriar
      if (target?.closest?.("leitor-toolbar")) return;

      const selection = window.getSelection();
      const text = selection?.toString().trim() ?? "";
      const validSelection =
        selectionChanged &&
        !!selection &&
        !selection.isCollapsed &&
        text.length >= 3;

      if (!validSelection) {
        // Clique fora da seleção (ou seleção inválida) → para a fala e fecha
        closeUi();
        return;
      }

      const range = selection!.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      closeUi();

      ui = await createShadowRootUi(ctx, {
        name: "leitor-toolbar",
        position: "overlay",
        anchor: "body",
        append: "first",
        onMount(container) {
          Object.assign(container.style, {
            position: "absolute",
            top: `${rect.top + window.scrollY - 52}px`,
            left: `${rect.left + window.scrollX}px`,
            zIndex: "2147483647",
          });

          const root = createRoot(container);
          root.render(<Toolbar text={text} onClose={closeUi} />);
          return root;
        },
        onRemove(root) {
          // Desmonta o React pra disparar os useEffect cleanups
          // (ex.: speechSynthesis.cancel() no Toolbar).
          root?.unmount();
        },
      });

      ui.mount();
    });
  },
});
