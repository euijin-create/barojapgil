export {};

declare global {
  type KakaoMapTypeId = string | number;
  type KakaoControlPosition = string | number;

  interface KakaoLatLng {
    getLat(): number;
    getLng(): number;
  }

  interface KakaoMapInstance {
    addControl(
      control: KakaoZoomControl,
      position: KakaoControlPosition,
    ): void;
    addOverlayMapTypeId(mapTypeId: KakaoMapTypeId): void;
    removeOverlayMapTypeId(mapTypeId: KakaoMapTypeId): void;
    relayout(): void;
    setKeyboardShortcuts(active: boolean): void;
  }

  interface KakaoCircleInstance {
    setMap(map: KakaoMapInstance | null): void;
  }

  interface KakaoPolygonInstance {
    setMap(map: KakaoMapInstance | null): void;
    setOptions(options: {
      strokeWeight?: number;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeStyle?: string;
      fillColor?: string;
      fillOpacity?: number;
    }): void;
  }

  interface KakaoCustomOverlayInstance {
    setMap(map: KakaoMapInstance | null): void;
    setZIndex(zIndex: number): void;
  }

  interface KakaoZoomControl {
    readonly __kakaoZoomControlBrand?: never;
  }

  interface KakaoMapsNamespace {
    load(callback: () => void): void;
    Map: new (
      container: HTMLElement,
      options: {
        center: KakaoLatLng;
        level: number;
        draggable?: boolean;
        scrollwheel?: boolean;
      },
    ) => KakaoMapInstance;
    LatLng: new (latitude: number, longitude: number) => KakaoLatLng;
    Circle: new (options: {
      center: KakaoLatLng;
      radius: number;
      strokeWeight?: number;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeStyle?: string;
      fillColor?: string;
      fillOpacity?: number;
      clickable?: boolean;
    }) => KakaoCircleInstance;
    Polygon: new (options: {
      map?: KakaoMapInstance;
      path: KakaoLatLng[] | KakaoLatLng[][];
      strokeWeight?: number;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeStyle?: string;
      fillColor?: string;
      fillOpacity?: number;
      clickable?: boolean;
    }) => KakaoPolygonInstance;
    CustomOverlay: new (options: {
      map?: KakaoMapInstance;
      position: KakaoLatLng;
      content: HTMLElement;
      xAnchor?: number;
      yAnchor?: number;
      zIndex?: number;
      clickable?: boolean;
    }) => KakaoCustomOverlayInstance;
    ZoomControl: new () => KakaoZoomControl;
    ControlPosition: {
      RIGHT: KakaoControlPosition;
    };
    MapTypeId: {
      TRAFFIC: KakaoMapTypeId;
    };
    event: {
      addListener(
        target: KakaoCircleInstance | KakaoPolygonInstance,
        type: string,
        handler: () => void,
      ): void;
      removeListener(
        target: KakaoCircleInstance | KakaoPolygonInstance,
        type: string,
        handler: () => void,
      ): void;
    };
  }

  interface Window {
    kakao?: {
      maps: KakaoMapsNamespace;
    };
  }
}
