import React, { createContext, useContext, useState, useCallback } from 'react';

const TemporalContext = createContext(null);

export function TemporalProvider({ children }) {
  const [temporalData, setTemporalData] = useState([]);
  const [activeEventId, setActiveEventId] = useState(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [mapCoordinates, setMapCoordinates] = useState([]);
  const [viewMode, setViewMode] = useState("list"); // list | calendar | timeline

  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const saveHistory = useCallback((newData) => {
    setHistory(prev => [...prev, temporalData]);
    setRedoStack([]);
    setTemporalData(newData);
  }, [temporalData]);

  const undo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setRedoStack(prev => [...prev, temporalData]);
    setHistory(prev => prev.slice(0, -1));
    setTemporalData(previous);
  }, [history, temporalData]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setHistory(prev => [...prev, temporalData]);
    setRedoStack(prev => prev.slice(0, -1));
    setTemporalData(next);
  }, [redoStack, temporalData]);

  const globalState = {
    temporalData, setTemporalData, saveHistory,
    activeEventId, setActiveEventId,
    selectedDay, setSelectedDay,
    mapCoordinates, setMapCoordinates,
    viewMode, setViewMode,
    history, undo, redo, redoStack
  };

  return (
    <TemporalContext.Provider value={globalState}>
      {children}
    </TemporalContext.Provider>
  );
}

export const useTemporal = () => useContext(TemporalContext);
