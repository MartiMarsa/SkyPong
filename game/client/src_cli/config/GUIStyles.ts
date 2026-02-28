import { Control } from "@babylonjs/gui";

export interface ITextStyle {
  color: string;
  fontSize: number;
  fontFamily?: string;
  fontWeight?: string;
  outlineWidth?: number;
  outlineColor?: string;
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowBlur?: number;
  horizontalAlignment?: number;
  verticalAlignment?: number;
  top?: string;
  textVerticalAlignment?: number;
}

export interface IButtonStyle {
  width: string;
  height: string;
  color: string;
  background: string;
  fontSize: number;
  cornerRadius: number;
  horizontalAlignment?: number;
  verticalAlignment?: number;
  top?: string;
  zIndex?: number;
}

export interface IIconButtonStyle {
  width: string;
  height: string;
  background: string;
  iconUrl: string;
  iconWidth: string;
  iconHeight: string;
  cornerRadius: number;
  paddingRight?: string;
  paddingLeft?: string;
}

export interface IContainerStyle {
  background: string;
  cornerRadius: number;
  thickness: number;
  verticalAlignment: number;
  width?: string;
  height?: string;
}

export const GUI_STYLES = {
  TEXT: {
    DEFAULT: {
      color: "#FFFFFF",
      fontSize: 24,
      outlineWidth: 0,
    } as ITextStyle,
    HUD_NAME: {
      color: "#FFFFFF",
      fontSize: 52,
      fontWeight: "bold",
      shadowColor: "#80808080",
      shadowOffsetX: 1,
      shadowOffsetY: 1,
      shadowBlur: 4,
      horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_CENTER,
    } as ITextStyle,
    HUD_SCORE: {
      color: "#4CAF50",
      fontSize: 48,
      fontWeight: "bold",
      shadowColor: "#FFFFFF80",
      shadowOffsetX: 1,
      shadowOffsetY: 1,
      shadowBlur: 4,
      horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_CENTER,
    } as ITextStyle,
    COUNTDOWN: {
      color: "#4CAF50",
      fontSize: 120,
      fontWeight: "bold",
      outlineWidth: 4,
      outlineColor: "black",
      horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_CENTER,
      verticalAlignment: Control.VERTICAL_ALIGNMENT_CENTER,
    } as ITextStyle,
    GAME_OVER_TITLE: {
      color: "#FFD700",
      fontSize: 64,
      fontWeight: "bold",
      outlineWidth: 4,
      outlineColor: "black",
      horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_CENTER,
    } as ITextStyle,
    GAME_OVER_WINNER: {
      color: "#FFFFFF",
      fontSize: 48,
      fontWeight: "bold",
      outlineWidth: 3,
      outlineColor: "black",
      horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_CENTER,
    } as ITextStyle,
    GAME_OVER_SCORE: {
      color: "#AAAAAA",
      fontSize: 36,
      fontWeight: "bold",
      horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_CENTER,
    } as ITextStyle,
  },

  BUTTON: {
    DEFAULT: {
      width: "200px",
      height: "60px",
      color: "#FFFFFF",
      background: "#4CAF50",
      fontSize: 24,
      cornerRadius: 10,
      horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_CENTER,
    } as IButtonStyle,
  },

  ICON_BUTTON: {
    LEFT: {
      width: "80px",
      height: "60px",
      background: "transparent",
      iconUrl:
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik0xNSA5bC03IDdsNyA3Ii8+PC9zdmc+",
      iconWidth: "32px",
      iconHeight: "32px",
      cornerRadius: 10,
      paddingRight: "20px",
    } as IIconButtonStyle,
    RIGHT: {
      width: "80px",
      height: "60px",
      background: "transparent",
      iconUrl:
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik05IDlsNyA3bC03IDciLz48L3N2Zz4=",
      iconWidth: "32px",
      iconHeight: "32px",
      cornerRadius: 10,
      paddingLeft: "20px",
    } as IIconButtonStyle,
  },

  CONTAINER: {
    DEFAULT: {
      background: "transparent",
      cornerRadius: 0,
      thickness: 0,
      verticalAlignment: Control.VERTICAL_ALIGNMENT_CENTER,
    } as IContainerStyle,
    OVERLAY: {
      background: "rgba(0, 0, 0, 0.8)",
      cornerRadius: 0,
      thickness: 0,
      verticalAlignment: Control.VERTICAL_ALIGNMENT_CENTER,
      width: "100%",
      height: "100%",
    } as IContainerStyle,
  },

  TOUCH_CONTAINER: {
    height: "80px",
    horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_CENTER,
    verticalAlignment: Control.VERTICAL_ALIGNMENT_BOTTOM,
  },

  HUD_POSITIONS: {
    PLAYER1_NAME: {
      top: "-100px",
      verticalAlignment: Control.VERTICAL_ALIGNMENT_BOTTOM,
    },
    PLAYER1_SCORE: {
      top: "-50px",
      verticalAlignment: Control.VERTICAL_ALIGNMENT_BOTTOM,
    },
    PLAYER2_NAME: {
      top: "60px",
      verticalAlignment: Control.VERTICAL_ALIGNMENT_TOP,
    },
    PLAYER2_SCORE: {
      top: "110px",
      verticalAlignment: Control.VERTICAL_ALIGNMENT_TOP,
    },
  },

  GAME_OVER_POSITIONS: {
    TITLE: { top: "-200px" },
    WINNER: { top: "-80px" },
    SCORE: { top: "20px" },
    BUTTON: { top: "150px" },
  },

  DEBUG: {
    BOTTOM: "10px",
    LEFT: "10px",
    UPDATE_INTERVAL_FRAMES: 3,
  },
};
