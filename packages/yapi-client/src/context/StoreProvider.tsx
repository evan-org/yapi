"use client"
import React, { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore } from "@/store/store.ts";

interface StoreProviderProps {
  children: React.ReactNode;
}
export default function StoreProvider({ children }: StoreProviderProps) {
  const storeRef = useRef<ReturnType<typeof makeStore>>(null);
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    storeRef.current = makeStore();
  }
  return <Provider store={storeRef.current}>{children}</Provider>
}
