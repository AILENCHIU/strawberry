import React, { createContext, useContext, useState, useCallback } from "react";
import UploadModal from "@/components/UploadModal";

const UploadContext = createContext(null);

export const useUpload = () => useContext(UploadContext);

export function UploadProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const openUpload = useCallback(() => setOpen(true), []);
  const onDone = useCallback(() => setRefreshKey((k) => k + 1), []);
  return (
    <UploadContext.Provider value={{ openUpload, refreshKey }}>
      {children}
      <UploadModal open={open} onOpenChange={setOpen} onDone={onDone} />
    </UploadContext.Provider>
  );
}