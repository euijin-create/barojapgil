"use client";

import { useCallback, useEffect, useRef } from "react";
import Script from "next/script";

export type KakaoSdkErrorCode =
  | "SDK_LOAD_FAILED"
  | "SDK_UNAVAILABLE"
  | "SDK_READY_TIMEOUT";

interface KakaoMapSdkProps {
  appKey: string;
  onReady: (maps: KakaoMapsNamespace) => void;
  onError: (code: KakaoSdkErrorCode) => void;
}

const KAKAO_SDK_SCRIPT_ID = "kakao-maps-sdk";
const SDK_READY_TIMEOUT_MS = 10_000;

export function KakaoMapSdk({
  appKey,
  onReady,
  onError,
}: KakaoMapSdkProps) {
  const timeoutRef = useRef<number | null>(null);
  const loadingRef = useRef(false);
  const settledRef = useRef(false);
  const mountedRef = useRef(true);

  const clearReadyTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearReadyTimeout();
    };
  }, [clearReadyTimeout]);

  const handleScriptReady = useCallback(() => {
    if (loadingRef.current || settledRef.current) return;

    const maps = window.kakao?.maps;
    if (!maps?.load) {
      settledRef.current = true;
      onError("SDK_UNAVAILABLE");
      return;
    }

    loadingRef.current = true;
    timeoutRef.current = window.setTimeout(() => {
      if (!mountedRef.current || settledRef.current) return;
      settledRef.current = true;
      loadingRef.current = false;
      onError("SDK_READY_TIMEOUT");
    }, SDK_READY_TIMEOUT_MS);

    maps.load(() => {
      if (!mountedRef.current || settledRef.current) return;
      clearReadyTimeout();
      settledRef.current = true;
      loadingRef.current = false;
      onReady(maps);
    });
  }, [clearReadyTimeout, onError, onReady]);

  const handleScriptError = useCallback(() => {
    if (settledRef.current) return;
    clearReadyTimeout();
    settledRef.current = true;
    loadingRef.current = false;
    onError("SDK_LOAD_FAILED");
  }, [clearReadyTimeout, onError]);

  return (
    <Script
      id={KAKAO_SDK_SCRIPT_ID}
      src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(appKey)}&autoload=false`}
      strategy="afterInteractive"
      onReady={handleScriptReady}
      onError={handleScriptError}
    />
  );
}
