"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

const ReferenceNowContext = createContext<Date | null>(null);

export function ReferenceNowProvider({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  const referenceNow = useMemo(() => new Date(value), [value]);

  return (
    <ReferenceNowContext.Provider value={referenceNow}>
      {children}
    </ReferenceNowContext.Provider>
  );
}

export function useReferenceNow() {
  const context = useContext(ReferenceNowContext);

  if (!context) {
    throw new Error(
      "useReferenceNow must be used within ReferenceNowProvider"
    );
  }

  return context;
}
