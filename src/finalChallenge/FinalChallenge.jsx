import React, { useEffect, useMemo, useRef, useState } from "react";
import { rooms } from "./escapeRoomData";
import LanguageSelector from "../components/LanguageSelector.jsx";
import { useI18n } from "../i18n/index.jsx";
import {
  getStartupProgress,
  readEscapeProgress,
  resetEscapeProgress,
  resolveContinueDestination,
  updateEscapeNavigation,
  writeEscapeProgress
} from "./useEscapeRoomProgress";
import {
  GAME_READY_TIMEOUT_MS,
  buildGameSrc,
  buildInitPayload,
  isDebugMode,
  normaliseRoomId,
  sendGameCommand,
  sendGameInit,
  validateEscapeRoomMessage
} from "./escapeRoomBridge";
import "./constructRuntime.css";


function roomById(roomId) {
  return rooms.find((room) => room.id === roomId || room.crystalId === roomId);
}

function collectRoomCrystal(roomId) {
  const room = roomById(roomId);
  if (!room) return readEscapeProgress();

  const current = readEscapeProgress();
  const next = {
    ...current,
    currentScreen: "room",
    currentRoom: room.id,
    currentStep: "complete",
    lastPlayedRoom: room.id,
    crystalCollected: { ...current.crystalCollected, [room.id]: true },
    completedRooms: { ...current.completedRooms, [room.id]: true },
    inventory: current.inventory.includes(room.crystalId) ? current.inventory : [...current.inventory, room.crystalId]
  };
  writeEscapeProgress(next);
  return readEscapeProgress();
}

function markFinalComplete() {
  const current = readEscapeProgress();
  writeEscapeProgress({ ...current, currentScreen: "room-select", currentRoom: null, currentStep: "final-complete", finalCompleted: true });
  return readEscapeProgress();
}

function sendInitToGame(iframe, escapeProgress, mainProgress, language = "en") {
  sendGameInit(iframe, buildInitPayload(escapeProgress, mainProgress, language));
}

function RuntimeOverlay({ status, onRetry, onBack, t }) {
  if (status === "ready") return null;
  const isError = status === "error";
  return <div className={`construct-runtime-overlay ${isError ? "error" : ""}`} role="status" aria-live="polite">
    <span className="runtime-spinner" aria-hidden="true" />
    <strong>{isError ? t("escapeRoom.errorTitle") : t("escapeRoom.loadingTitle")}</strong>
    <p>{isError ? t("escapeRoom.errorCopy") : t("escapeRoom.loadingCopy")}</p>
    {isError && <div>
      <button className="primary" type="button" onClick={onRetry}>{t("escapeRoom.retry")}</button>
      <button className="outline" type="button" onClick={onBack}>{t("escapeRoom.backToMissions")}</button>
    </div>}
  </div>;
}

function InventoryStrip({ progress }) {
  return <section className="construct-inventory" aria-label="Escape Room inventory">
    <header><strong>Crystals</strong><span>{progress.inventory.length} / {rooms.length}</span></header>
    <div>
      {rooms.map((room) => {
        const collected = progress.inventory.includes(room.crystalId);
        return <span key={room.id} className={collected ? "collected" : ""} style={{ "--room": room.accent }} title={room.crystalName}>
          <i>{collected ? "◆" : room.label.replace("Room ", "")}</i>
          <small>{room.title}</small>
        </span>;
      })}
    </div>
  </section>;
}

function ProgressPanel({ progress, debug, status, onReset, onReload }) {
  return <aside className="construct-progress-panel">
    <section>
      <h2>Escape Room Status</h2>
      <p>Status: <strong>{status}</strong></p>
      <p>Screen: <strong>{progress.currentScreen || "room-select"}</strong></p>
      <p>Final Exit: <strong>{progress.finalCompleted ? "completed and reviewable" : "not completed"}</strong></p>
      <p>The escape room runs inside the iframe. AI Explorer stores crystals and progress outside the game.</p>
    </section>
    <section>
      <h3>Crystals</h3>
      <div className="construct-room-list">
        {rooms.map((room) => {
          const done = progress.completedRooms[room.id] && progress.crystalCollected[room.id] && progress.inventory.includes(room.crystalId);
          return <span key={room.id} className={done ? "done" : ""} style={{ "--room": room.accent }}>
            <b>{done ? "✓" : room.label.replace("Room ", "")}</b>
            <em>{room.crystalName}{done ? " · replayable" : ""}</em>
          </span>;
        })}
      </div>
    </section>
    <section>
      <h3>Final Exit</h3>
      <p>The final door is an AI Brain puzzle. Learners place all six crystals, build how text is generated, then add the human checking steps.</p>
      <div className="construct-room-list compact">
        <span><b>1</b><em>Place crystals around the AI Brain</em></span>
        <span><b>2</b><em>Build the generation chain</em></span>
        <span><b>3</b><em>Verify, check bias, and use AI critically</em></span>
      </div>
    </section>
    {debug && <div className="construct-panel-actions">
      <button className="outline" type="button" onClick={onReload}>Reload Runtime</button>
      <button className="outline danger" type="button" onClick={onReset}>Reset Escape</button>
    </div>}
  </aside>;
}

export default function FinalChallenge({ progress: mainProgress, setProgress, navigate, notify }) {
  const { t, language } = useI18n();
  const iframeRef = useRef(null);
  const readyTimerRef = useRef(null);
  const debug = isDebugMode();
  const [escapeProgress, setEscapeProgress] = useState(getStartupProgress);
  const [frameKey, setFrameKey] = useState(0);
  const [runtimeStatus, setRuntimeStatus] = useState("idle");
  const [isExpanded, setIsExpanded] = useState(false);

  const completedCount = useMemo(() => rooms.filter((room) => escapeProgress.completedRooms[room.id] && escapeProgress.crystalCollected[room.id] && escapeProgress.inventory.includes(room.crystalId)).length, [escapeProgress]);
  const gameSrc = useMemo(() => buildGameSrc(debug), [debug]);

  function refreshProgress(sendInit = true) {
    const next = readEscapeProgress();
    setEscapeProgress(next);
    if (sendInit) window.setTimeout(() => sendInitToGame(iframeRef.current, next, mainProgress, language), 0);
    return next;
  }

  function syncNavigation(next, commandType, payload = {}) {
    setEscapeProgress(next);
    sendGameCommand(iframeRef.current, commandType, { ...payload, progress: buildInitPayload(next, mainProgress, document.documentElement.lang || "en") });
  }

  function openHub() {
    const next = updateEscapeNavigation({ currentScreen: "room-select", currentRoom: null, currentStep: "hub" });
    syncNavigation(next, "ESCAPE_ROOM_OPEN_HUB");
    notify?.(t("escapeRoom.mapOpened"));
  }

  function continueAdventure() {
    const destination = resolveContinueDestination();
    if (destination.screen === "room-select") {
      const next = updateEscapeNavigation({ currentScreen: "room-select", currentRoom: null, currentStep: "hub" });
      syncNavigation(next, "ESCAPE_ROOM_CONTINUE", { destination });
      notify?.(t("escapeRoom.allRoomsComplete"));
      return;
    }
    if (destination.screen === "final-exit") {
      const next = updateEscapeNavigation({ currentScreen: "final-exit", currentRoom: null, currentStep: "final-exit" });
      syncNavigation(next, "ESCAPE_ROOM_OPEN_FINAL_EXIT", { destination });
      notify?.("Final Exit opened.");
      return;
    }

    const room = roomById(destination.roomId);
    const next = updateEscapeNavigation({ currentScreen: "room", currentRoom: room.id, currentStep: "playing", lastPlayedRoom: room.id });
    syncNavigation(next, "ESCAPE_ROOM_CONTINUE", { destination, roomId: room.id, roomNumber: destination.roomNumber, replay: false, rewardEligible: true });
    notify?.(`${room.label} opened.`);
  }

  function handleRoomComplete(payload) {
    const roomId = normaliseRoomId(payload.roomId || payload.crystal);
    const room = roomById(roomId);
    if (!room) {
      notify?.("Escape Room message ignored: unknown room.");
      return;
    }

    const before = readEscapeProgress();
    const alreadyCompleted = before.completedRooms[room.id] && before.crystalCollected[room.id] && before.inventory.includes(room.crystalId);
    collectRoomCrystal(room.id);
    refreshProgress(false);

    if (!alreadyCompleted) notify?.(`${room.crystalName} collected. Progress saved.`);
    else notify?.(`${room.crystalName} already collected. Progress restored.`);
  }

  function handleFinalComplete(payload) {
    const current = readEscapeProgress();
    const allRoomsDone = rooms.every((room) => current.completedRooms[room.id] && current.crystalCollected[room.id] && current.inventory.includes(room.crystalId));
    if (!allRoomsDone) {
      notify?.("The final exit still needs all six crystals.");
      sendInitToGame(iframeRef.current, current, mainProgress, language);
      return;
    }

    markFinalComplete();
    refreshProgress();
    notify?.(t("escapeRoom.completeSaved"));
  }

  useEffect(() => {
    setRuntimeStatus("loading");
    window.clearTimeout(readyTimerRef.current);
    readyTimerRef.current = window.setTimeout(() => setRuntimeStatus((status) => status === "ready" ? status : "error"), GAME_READY_TIMEOUT_MS);
    return () => window.clearTimeout(readyTimerRef.current);
  }, [frameKey, gameSrc]);

  useEffect(() => {
    if (runtimeStatus !== "loading") return undefined;
    const timer = window.setInterval(() => {
      sendGameCommand(iframeRef.current, "ESCAPE_ROOM_REQUEST_STATE", {
        progress: buildInitPayload(readEscapeProgress(), mainProgress, document.documentElement.lang || "en")
      });
    }, 800);
    return () => window.clearInterval(timer);
  }, [runtimeStatus, mainProgress]);

  useEffect(() => {
    function onMessage(event) {
      const message = validateEscapeRoomMessage(event);
      if (!message.ok) {
        if (debug && message.reason !== "Unknown Escape Room message type.") console.warn(message.reason);
        return;
      }

      if (message.type === "ESCAPE_ROOM_READY") {
        window.clearTimeout(readyTimerRef.current);
        setRuntimeStatus("ready");
        sendInitToGame(iframeRef.current, readEscapeProgress(), mainProgress, language);
      }

      if (message.type === "ESCAPE_ROOM_REQUEST_STATE") sendInitToGame(iframeRef.current, readEscapeProgress(), mainProgress, language);

      if (message.type === "ESCAPE_ROOM_PROGRESS") {
        const current = readEscapeProgress();
        writeEscapeProgress({ ...current, currentScreen: "room", currentRoom: message.payload.roomId, currentStep: message.payload.step || current.currentStep || "playing" });
        refreshProgress(false);
      }

      if (message.type === "ESCAPE_ROOM_SCREEN_CHANGED") {
        const screen = message.payload.currentScreen === "completion" ? "room" : message.payload.currentScreen;
        const next = updateEscapeNavigation({
          currentScreen: screen,
          currentRoom: screen === "room" ? message.payload.roomId : null,
          currentStep: message.payload.currentScreen === "completion" ? "completion" : message.payload.step || (screen === "room-select" ? "hub" : "playing"),
          lastPlayedRoom: message.payload.roomId || undefined
        });
        setEscapeProgress(next);
      }

      if (message.type === "ESCAPE_ROOM_ROOM_STARTED") {
        const room = roomById(message.payload.roomId);
        const next = updateEscapeNavigation({ currentScreen: "room", currentRoom: room.id, currentStep: "playing", lastPlayedRoom: room.id });
        setEscapeProgress(next);
      }

      if (message.type === "ESCAPE_ROOM_RETURNED_TO_HUB") {
        const next = updateEscapeNavigation({ currentScreen: "room-select", currentRoom: null, currentStep: "hub" });
        setEscapeProgress(next);
      }

      if (message.type === "ESCAPE_ROOM_ROOM_COMPLETE") handleRoomComplete(message.payload);
      if (message.type === "ESCAPE_ROOM_COMPLETE") handleFinalComplete(message.payload);
      if (message.type === "ESCAPE_ROOM_NAVIGATE") navigate(message.payload.route);
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [debug, language, mainProgress, navigate]);

  useEffect(() => {
    function onKeyDown(event) {
      const tagName = document.activeElement?.tagName;
      const isTyping = tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT";
      if (event.key === "Escape") setIsExpanded(false);
      if (!isTyping && event.key.toLowerCase() === "f") setIsExpanded((value) => !value);
    }

    window.addEventListener("keydown", onKeyDown);
    document.body.classList.toggle("escape-room-expanded", isExpanded);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("escape-room-expanded");
    };
  }, [isExpanded]);

  function resetAll() {
    const next = resetEscapeProgress();
    setEscapeProgress(next);
    sendGameCommand(iframeRef.current, "ESCAPE_ROOM_RESET", { progress: next });
    setFrameKey((key) => key + 1);
    notify?.(t("escapeRoom.resetSaved"));
  }

  function retryRuntime() {
    setRuntimeStatus("loading");
    setFrameKey((key) => key + 1);
  }

  return <div className={`final-challenge-page construct-wrapper-page ${isExpanded ? "is-expanded" : ""}`}>
    <header className="mission-header final-header">
      <button className="outline" onClick={() => navigate("/missions")}>‹ {t("escapeRoom.backToMissions")}</button>
      <div className="mission-mid"><strong>{t("escapeRoom.pageTitle")}</strong><span className="mission-dots">{rooms.map((room) => <i key={room.id} className={escapeProgress.inventory.includes(room.crystalId) ? "filled" : ""} />)}</span></div>
      <div className="mission-header-actions"><LanguageSelector compact /><button className="icon-button" aria-label={t("common.topbar.settings")} onClick={() => notify?.(t("escapeRoom.integrationInfo"))}>⚙</button></div>
    </header>

    <main className="construct-shell">
      <section className="construct-game-frame">
        <div className="construct-frame-header">
          <div><span>{t("escapeRoom.eyebrow")}</span><h1>{t("escapeRoom.runtimeTitle")}</h1></div>
          <div className="construct-top-actions" aria-label="Escape Room navigation">
            <button type="button" className="outline" onClick={openHub}>{t("escapeRoom.roomMap")}</button>
            <button type="button" className="primary" onClick={continueAdventure}>{t("escapeRoom.continue")}</button>
            <button
              type="button"
              className="outline fullscreen-toggle"
              onClick={() => setIsExpanded((value) => !value)}
              aria-pressed={isExpanded}
              title={isExpanded ? "Exit full screen (Esc)" : "Full screen Escape Room (F)"}
            >
              {isExpanded ? t("escapeRoom.exitFullScreen") : t("escapeRoom.fullScreen")}
            </button>
            <strong>{t("escapeRoom.roomsComplete", { completed: completedCount, total: rooms.length })}</strong>
          </div>
        </div>
        <div className="construct-iframe-wrap">
          <iframe
            key={frameKey}
            ref={iframeRef}
            src={gameSrc}
            title={`${t("escapeRoom.runtimeTitle")} game`}
            allowFullScreen
            onLoad={() => setRuntimeStatus((status) => status === "ready" ? "ready" : "loading")}
          />
          <RuntimeOverlay status={runtimeStatus} onRetry={retryRuntime} onBack={() => navigate("/missions")} t={t} />
        </div>
        {debug && !isExpanded && <InventoryStrip progress={escapeProgress} />}
      </section>
      {debug && <ProgressPanel progress={escapeProgress} debug={debug} status={runtimeStatus} onReset={resetAll} onReload={retryRuntime} />}
    </main>
  </div>;
}
