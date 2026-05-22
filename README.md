# Tomi — Leitor de Texto

Extensão de browser que lê em voz alta qualquer texto selecionado em qualquer
página, usando a síntese de voz nativa do navegador (Web Speech API). Aparece
uma toolbar flutuante junto à seleção com controles de **Play**, **Pause**,
**Volume** e **Parar**.

## Demo

<https://github.com/fyoussef/tomi/raw/main/docs/assets/usage-example.mp4>

## Funcionalidades

- Toolbar flutuante aparece ao selecionar texto (3+ caracteres) em qualquer site.
- **Play / Pause** com retomada do ponto atual (sem voltar ao início).
- **Volume ao vivo** — slider que mantém a fala tocando e retoma da palavra
  atual (rastreada via `onboundary`) com o novo volume aplicado.
- **Auto-stop** ao clicar fora da seleção: a toolbar fecha e a fala é
  cancelada (sem áudio "fantasma" em background).
- Voz selecionada automaticamente: prefere `pt-BR`, depois qualquer `pt-*`,
  depois a voz default do sistema.
- UI isolada via Shadow DOM (não conflita com o CSS da página host).

## Stack

- [WXT](https://wxt.dev) — framework de browser extensions.
- React 19 + TypeScript.
- Tailwind CSS 4.
- Web Speech API (`speechSynthesis`).
- `lucide-react` para os ícones.

## Pré-requisitos

- Node.js 18+
- pnpm (recomendado) ou npm/yarn

## Rodando em DEV

```bash
# 1. Instalar dependências
pnpm install

# 2. Subir o dev server (Chrome/Edge)
pnpm dev

# Alternativa: Firefox
pnpm dev:firefox
```

O comando `dev` abre uma janela do navegador já com a extensão carregada e
hot-reload ativo. Editar arquivos em [`components/`](components/) ou
[`entrypoints/`](entrypoints/) recarrega a extensão automaticamente.

### Carregando a build manualmente (Chrome)

Se preferir carregar a build manualmente em vez do dev server:

```bash
pnpm build
```

1. Abra `chrome://extensions`.
2. Ative o **Modo desenvolvedor**.
3. Clique em **Carregar sem compactação**.
4. Selecione a pasta `.output/chrome-mv3/`.

## Estrutura

```
entrypoints/
  content.tsx       # injeta a toolbar em <all_urls>, detecta seleção
components/
  toolbar.tsx       # UI + lógica de TTS (play/pause/volume)
docs/assets/
  usage-example.mp4 # vídeo demo
wxt.config.ts       # config WXT + Tailwind
```

## Scripts disponíveis

| Comando              | O que faz                                    |
| -------------------- | -------------------------------------------- |
| `pnpm dev`           | Dev server para Chrome (com hot-reload)      |
| `pnpm dev:firefox`   | Dev server para Firefox                      |
| `pnpm build`         | Build de produção para Chrome                |
| `pnpm build:firefox` | Build de produção para Firefox               |
| `pnpm zip`           | Build + empacota em `.zip` para distribuição |
| `pnpm compile`       | Type-check sem emitir arquivos               |

## Como usar

1. Abra qualquer página da web com a extensão carregada.
2. Selecione um trecho de texto (3+ caracteres).
3. A toolbar aparece logo acima da seleção.
4. Clique em **Play** para iniciar a leitura.
5. Use **Pause** para pausar, ou ajuste o **Volume** no popover do ícone de
   alto-falante. Clique em **Stop** (quadrado) ou em qualquer lugar fora da
   seleção para encerrar.

## Notas técnicas

- A Web Speech API ignora alterações de `volume` em utterances já em
  reprodução. Workaround: recriar o utterance a partir da palavra atual
  (via `onboundary`) com o novo volume.
- Vozes disponíveis dependem do sistema operacional. Em Windows, instale
  vozes adicionais em **Configurações → Hora e idioma → Idioma e região**.
