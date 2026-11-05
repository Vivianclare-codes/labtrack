"use client";

import { createElement, useSyncExternalStore } from "react";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatDate(date: Date): string {
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

const subscribe = () => () => {};

export function CurrentDate({
  className = "",
}: {
  className?: string;
}) {
  const label = useSyncExternalStore(
    subscribe,
    () => formatDate(new Date()),
    () => ""
  );

  return createElement("span", { className }, label);
}