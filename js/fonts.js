// js/fonts.js
// LÖVE's ui/fonts.lua cached one Font object per size to avoid
// reallocating every frame. Canvas doesn't have that cost -- a font
// string is just a string -- so this just centralizes the family
// names and gives helpers that match the old fonts.get(size) /
// fonts.getBold(size) call shape, so the rest of the port reads the
// same way it did in Lua.
//
// Also carries a display face (Orbitron, loaded via the <link> in
// index.html) used for headline text -- titles, chapter headings,
// panel headers -- so the game reads as a deliberately-designed
// modern UI rather than default system type throughout.

const REGULAR = "'DejaVu Sans', sans-serif";
const BOLD = "'DejaVu Sans Bold', 'DejaVu Sans', sans-serif";
const DISPLAY = "'Orbitron', 'DejaVu Sans Bold', sans-serif";

const fonts = {
  get(size) {
    return `${size}px ${REGULAR}`;
  },
  getBold(size) {
    return `${size}px ${BOLD}`;
  },
  getDisplay(size, weight = 700) {
    return `${weight} ${size}px ${DISPLAY}`;
  },
};

// Both weights must be loaded before the first frame draws, or text
// silently falls back to the browser default font for that frame.
export async function loadFonts() {
  const regular = new FontFace("DejaVu Sans", "url(assets/fonts/DejaVuSans.ttf)");
  const bold = new FontFace("DejaVu Sans Bold", "url(assets/fonts/DejaVuSans-Bold.ttf)");
  const loads = [regular.load(), bold.load()];

  // Orbitron comes from the Google Fonts <link> in index.html rather
  // than a local file -- document.fonts.load() just waits for the CSS
  // @font-face that link already registered. If the player is offline
  // this quietly falls back to the bold DejaVu face (see DISPLAY
  // above), so it never blocks startup.
  const display = document.fonts.load("700 32px Orbitron").catch(() => []);

  const [r, b] = await Promise.all(loads);
  document.fonts.add(r);
  document.fonts.add(b);
  await Promise.race([display, new Promise((res) => setTimeout(res, 1200))]);
}

export default fonts;
