/**
 * games.js — Sensitivity Game Database
 * All yaw values are real degrees-per-count values sourced from game engine data.
 * Formula: cm/360 = 36000 / (yaw * sensitivity * DPI)
 * Cross-game conversion: targetSens = (sourceSens * sourceYaw) / targetYaw
 *
 * Architecture is prepared for future modules:
 *   - FOV matching (fov, fovType fields)
 *   - ADS multipliers (adsMultipliers object)
 *   - Scope sensitivity modifiers (scopeSens object)
 */

const GAMES = {
  cs2: {
    id: "cs2",
    name: "Counter-Strike 2",
    shortName: "CS2",
    color: "#f6a623",
    colorDim: "rgba(246,166,35,0.12)",
    // CS2 / Source engine yaw: 0.022 deg/count (unchanged since CS:GO)
    yaw: 0.022,
    sensMin: 0.01,
    sensMax: 10,
    sensStep: 0.001,
    sensPlaceholder: "1.000",
    sensDefault: 1.0,
    // FOV data (prepared for future FOV module)
    fov: 90,
    fovType: "actual", // actual | vertical | horizontal
    // ADS data (prepared for future ADS module)
    adsMultipliers: {
      default: 1.0,
    },
    notes: "Source engine. Yaw = 0.022°/count.",
  },

  valorant: {
    id: "valorant",
    name: "Valorant",
    shortName: "VALO",
    color: "#ff4655",
    colorDim: "rgba(255,70,85,0.12)",
    // Valorant yaw: 0.07 deg/count (Riot confirmed, Unreal Engine)
    yaw: 0.07,
    sensMin: 0.01,
    sensMax: 10,
    sensStep: 0.001,
    sensPlaceholder: "0.320",
    sensDefault: 0.32,
    fov: 103,
    fovType: "actual",
    adsMultipliers: {
      default: 1.0,
    },
    notes: "Unreal Engine. Yaw = 0.07°/count.",
  },

  apex: {
    id: "apex",
    name: "Apex Legends",
    shortName: "APEX",
    color: "#fc4b08",
    colorDim: "rgba(252,75,8,0.12)",
    // Apex Legends yaw: 0.022 deg/count (Source engine derivative)
    yaw: 0.022,
    sensMin: 0.1,
    sensMax: 50,
    sensStep: 0.1,
    sensPlaceholder: "3.0",
    sensDefault: 3.0,
    fov: 90,
    fovType: "actual",
    adsMultipliers: {
      default: 1.0,
      "1x": 1.0,
      "2x": 1.0,
      "3x": 0.5,
      "4x": 0.4,
      "6x": 0.25,
      "8x": 0.175,
    },
    // Apex uses a different internal scale at high sens values.
    // The yaw is identical to Source for hipfire.
    notes: "Source derivative. Hipfire yaw = 0.022°/count.",
  },

  fortnite: {
    id: "fortnite",
    name: "Fortnite",
    shortName: "FNBR",
    color: "#00d4ff",
    colorDim: "rgba(0,212,255,0.12)",
    // Fortnite X-axis sensitivity: the internal multiplier is 0.5573.
    // Yaw per count = 0.5573 * (sens/100) — sens is 0-1 in Fortnite (expressed as %).
    // Effective yaw when sens=1.0 (100%): 0.5573. We normalise to sens% so yaw=0.5573.
    yaw: 0.5573,
    sensMin: 0.01,
    sensMax: 1.0,
    sensStep: 0.001,
    sensPlaceholder: "0.070",
    sensDefault: 0.07,
    fov: 80,
    fovType: "vertical",
    adsMultipliers: {
      default: 0.65,
    },
    notes: "Unreal Engine. Yaw = 0.5573°/count at sens 1.0 (100%).",
  },

  overwatch2: {
    id: "overwatch2",
    name: "Overwatch 2",
    shortName: "OW2",
    color: "#f99e1a",
    colorDim: "rgba(249,158,26,0.12)",
    // Overwatch 2 yaw: 0.0066 deg/count
    // OW sensitivity 1 = 3.33°/count * 0.002 internal = 0.006 effective.
    // Confirmed: yaw = 0.0066 deg/count at sens 1
    yaw: 0.0066,
    sensMin: 1,
    sensMax: 100,
    sensStep: 1,
    sensPlaceholder: "7",
    sensDefault: 7,
    fov: 103,
    fovType: "actual",
    adsMultipliers: {
      default: 1.0,
    },
    notes: "Proprietary engine. Yaw = 0.0066°/count.",
  },

  r6siege: {
    id: "r6siege",
    name: "Rainbow Six Siege",
    shortName: "R6",
    color: "#009bde",
    colorDim: "rgba(0,155,222,0.12)",
    // R6 Siege yaw: 0.00572957795 deg/count (= 1/174.53 radians, AngleConversionFactor)
    // This is for the "Mouse Sensitivity" slider at 1.
    yaw: 0.00572957795,
    sensMin: 1,
    sensMax: 100,
    sensStep: 1,
    sensPlaceholder: "18",
    sensDefault: 18,
    fov: 60,
    fovType: "vertical",
    adsMultipliers: {
      "1x": 1.0,
      "1.5x": 0.7,
      "2x": 0.5,
      "2.5x": 0.4,
      "3x": 0.3,
      "4x": 0.25,
      "5x": 0.2,
      "6x": 0.15,
      "12x": 0.1,
    },
    notes: "AnvilNext engine. Yaw = 0.00573°/count.",
  },

  warzone: {
    id: "warzone",
    name: "Call of Duty: Warzone",
    shortName: "WZ",
    color: "#7cfc00",
    colorDim: "rgba(124,252,0,0.12)",
    // CoD / IW8 engine yaw: 0.0066 deg/count
    // CoD engine uses same yaw as Modern Warfare engine family
    yaw: 0.0066,
    sensMin: 1,
    sensMax: 20,
    sensStep: 0.1,
    sensPlaceholder: "6.0",
    sensDefault: 6.0,
    fov: 80,
    fovType: "actual",
    adsMultipliers: {
      "default": 1.0,
      "1x-2x": 0.8,
      "3x": 0.6,
      "4x": 0.5,
      "6x": 0.4,
      "8x": 0.3,
    },
    notes: "IW8 engine. Yaw = 0.0066°/count.",
  },
};

/**
 * GameDB — public API for the game database
 * Prepared for future features (FOV module, ADS module, etc.)
 */
const GameDB = (() => {
  function getGame(id) {
    return GAMES[id] || null;
  }

  function getAllGames() {
    return Object.values(GAMES);
  }

  function getGameIds() {
    return Object.keys(GAMES);
  }

  /**
   * Returns real effective degrees-per-count for a game at a given sensitivity.
   * For most games: degreesPerCount = yaw * sensitivity
   * This is the key value for cross-game comparison.
   */
  function getDegreesPerCount(gameId, sensitivity) {
    const game = getGame(gameId);
    if (!game) return null;
    return game.yaw * sensitivity;
  }

  /**
   * Future: FOV-adjusted yaw for viewport-matched sensitivity.
   * Prepared stub — not yet wired to UI.
   */
  function getFovAdjustedYaw(gameId, targetFov) {
    const game = getGame(gameId);
    if (!game) return null;
    // Placeholder: full implementation in fov-module.js
    return game.yaw;
  }

  return { getGame, getAllGames, getGameIds, getDegreesPerCount, getFovAdjustedYaw };
})();

// Export for use in converter.js (works in both module and script context)
if (typeof module !== "undefined" && module.exports) {
  module.exports = { GAMES, GameDB };
}
