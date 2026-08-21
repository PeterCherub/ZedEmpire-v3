// Shared palette. Values stay as RGB arrays because the renderer/UI use numeric channels.
// Retuned to a richer, deeper "modern empire" look: near-black indigo
// base, warmer/brighter gold, an added cyan `accent` used for tech-UI
// framing, and *Top/*Bright variants used to build gradients + glows.
export const theme = {
  bg:[0.043,0.039,0.058], bgTop:[0.086,0.068,0.098],
  panel:[0.124,0.100,0.140], panelTop:[0.162,0.130,0.168], panelBorder:[0.66,0.38,0.17],
  ledgerBg:[0.140,0.112,0.124], divider:[0.62,0.35,0.16],
  gold:[0.86,0.66,0.28], goldBright:[1.0,0.83,0.44],
  cream:[0.95,0.92,0.83], creamDim:[0.85,0.80,0.68],
  green:[0.27,0.58,0.38], greenBright:[0.42,0.80,0.50], greenDark:[0.14,0.24,0.16],
  red:[0.78,0.24,0.27], redSoft:[0.87,0.40,0.38],
  accent:[0.30,0.78,0.86], accentBright:[0.55,0.95,1.0],
  muted:[0.58,0.61,0.68], white:[1,1,1], dark:[0.075,0.065,0.085],
  disabled:[0.24,0.24,0.28], disabledText:[0.5,0.5,0.56]
};
export default theme;
