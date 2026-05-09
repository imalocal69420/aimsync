/**
 * converter.js — Sensitivity Conversion Engine
 *
 * Core math:
 *   360° distance (cm) = 36000 / (yaw * sens * DPI)
 *   Cross-game: targetSens = (sourceSens * sourceYaw) / targetYaw
 *
 * All calculations use real yaw values from games.js.
 * Architecture is modular and prepared for:
 *   - FOV matching module
 *   - ADS sensitivity calculator module
 *   - Profile save/load module
 *   - History/comparison module
 */

const SensConverter = (() => {

  // ─── Core Math ──────────────────────────────────────────────────────────────

  /**
   * Convert sensitivity from one game to another using yaw values.
   * @param {string} fromId - Source game ID
   * @param {string} toId   - Target game ID
   * @param {number} sens   - Source sensitivity value
   * @returns {number|null} Converted sensitivity
   */
  function convert(fromId, toId, sens) {
    const src = GameDB.getGame(fromId);
    const dst = GameDB.getGame(toId);
    if (!src || !dst || isNaN(sens) || sens <= 0) return null;
    return (sens * src.yaw) / dst.yaw;
  }

  /**
   * Calculate eDPI (effective DPI).
   * @param {number} dpi
   * @param {number} sens
   * @returns {number}
   */
  function calcEDPI(dpi, sens) {
    return dpi * sens;
  }

  /**
   * Calculate cm per 360° rotation.
   * Formula: 36000 / (yaw * sens * DPI)
   * @param {string} gameId
   * @param {number} sens
   * @param {number} dpi
   * @returns {number|null}
   */
  function calcCm360(gameId, sens, dpi) {
    const game = GameDB.getGame(gameId);
    if (!game || !dpi || dpi <= 0 || !sens || sens <= 0) return null;
    return 36000 / (game.yaw * sens * dpi);
  }

  /**
   * Calculate inches per 360° rotation.
   * @param {string} gameId
   * @param {number} sens
   * @param {number} dpi
   * @returns {number|null}
   */
  function calcIn360(gameId, sens, dpi) {
    const cm = calcCm360(gameId, sens, dpi);
    return cm ? cm / 2.54 : null;
  }

  /**
   * Full conversion result object.
   * @param {string} fromId
   * @param {string} toId
   * @param {number} sourceSens
   * @param {number} dpi
   * @returns {object}
   */
  function getFullResult(fromId, toId, sourceSens, dpi, targetDpi) {
    const targetSensYawOnly = convert(fromId, toId, sourceSens);
    const hasSourceDpi = dpi && dpi > 0;
    const hasTargetDpi = targetDpi && targetDpi > 0;
    const tDpi = hasTargetDpi ? targetDpi : dpi;
    const targetSens = (hasSourceDpi && tDpi) ? targetSensYawOnly * (dpi / tDpi) : targetSensYawOnly;

    return {
      sourceSens,
      targetSens,
      sourceGame: GameDB.getGame(fromId),
      targetGame: GameDB.getGame(toId),
      dpi: hasSourceDpi ? dpi : null,
      targetDpi: tDpi ? tDpi : null,

      // Source stats
      sourceEDPI:  hasSourceDpi ? calcEDPI(dpi, sourceSens)   : null,
      sourceCm360: hasSourceDpi ? calcCm360(fromId, sourceSens, dpi) : null,
      sourceIn360: hasSourceDpi ? calcIn360(fromId, sourceSens, dpi) : null,

      // Target stats
      targetEDPI:  (tDpi && targetSens) ? calcEDPI(tDpi, targetSens)   : null,
      targetCm360: (tDpi && targetSens) ? calcCm360(toId, targetSens, tDpi) : null,
      targetIn360: (tDpi && targetSens) ? calcIn360(toId, targetSens, tDpi) : null,

      // Metadata
      timestamp: Date.now(),
    };
  }

  // ─── Validation ─────────────────────────────────────────────────────────────

  function validateSens(gameId, value) {
    const game = GameDB.getGame(gameId);
    if (!game) return { valid: false, message: "Unknown game" };
    const num = parseFloat(value);
    if (isNaN(num)) return { valid: false, message: "Enter a number" };
    if (num < game.sensMin) return { valid: false, message: `Min: ${game.sensMin}` };
    if (num > game.sensMax) return { valid: false, message: `Max: ${game.sensMax}` };
    return { valid: true };
  }

  function validateDpi(value) {
    if (!value || value === "") return { valid: true }; // optional
    const num = parseFloat(value);
    if (isNaN(num) || num < 100) return { valid: false, message: "Min: 100 DPI" };
    if (num > 32000)              return { valid: false, message: "Max: 32,000 DPI" };
    return { valid: true };
  }

  // ─── Formatting ─────────────────────────────────────────────────────────────

  /**
   * Format sensitivity for display — trims trailing zeros, shows enough precision.
   */
  function formatSens(value, gameId) {
    if (value === null || value === undefined || isNaN(value)) return "—";
    const game = GameDB.getGame(gameId);
    // Choose precision based on yaw scale
    let decimals = 4;
    if (game && game.yaw >= 0.1)  decimals = 4;
    if (game && game.yaw < 0.01)  decimals = 2;

    const fixed = value.toFixed(decimals);
    // Remove trailing zeros but keep at least 3 decimal places for small values
    return fixed.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '.0');
  }

  function formatCm360(value) {
    if (value === null || isNaN(value)) return "—";
    return value.toFixed(1) + " cm";
  }

  function formatEDPI(value) {
    if (value === null || isNaN(value)) return "—";
    return Math.round(value).toLocaleString();
  }

  // ─── Future Module Stubs ────────────────────────────────────────────────────

  /**
   * FOV MATCHING MODULE (stub)
   * Given source game FOV and target game FOV, adjusts sensitivity to maintain
   * the same perceived movement speed at the center of the screen.
   * Will use: targetSens = sourceSens * tan(sourceFOV/2) / tan(targetFOV/2) * (sourceYaw/targetYaw)
   */
  function convertWithFOV(fromId, toId, sens, sourceFov, targetFov) {
    // Stub — to be implemented in fov-module.js
    console.warn("FOV matching module not yet implemented.");
    return convert(fromId, toId, sens);
  }

  /**
   * ADS SENSITIVITY MODULE (stub)
   * Calculates ADS sensitivity values using per-game zoom multipliers.
   */
  function calcADSSens(gameId, hipfireSens, scopeMultiplier) {
    // Stub — to be implemented in ads-module.js
    console.warn("ADS module not yet implemented.");
    return hipfireSens * scopeMultiplier;
  }

  /**
   * PROFILE MODULE (stub)
   * Save/load sensitivity profiles to localStorage.
   */
  const ProfileModule = {
    save(name, data) {
      // Stub — to be implemented in profile-module.js
    },
    load(name) {
      // Stub
    },
    list() {
      return [];
    },
  };

  // ─── Public API ─────────────────────────────────────────────────────────────

  return {
    convert,
    calcEDPI,
    calcCm360,
    calcIn360,
    getFullResult,
    validateSens,
    validateDpi,
    formatSens,
    formatCm360,
    formatEDPI,
    // Future modules
    convertWithFOV,
    calcADSSens,
    ProfileModule,
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = { SensConverter };
}
