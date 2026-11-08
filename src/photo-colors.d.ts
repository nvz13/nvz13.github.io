declare module 'virtual:photo-colors' {
  /** "<folder>/<file>" -> [hue 0-360, saturation 0-1, lightness 0-1], computed by photo-colors-plugin.js */
  const colors: Record<string, [number, number, number]>;
  export default colors;
}
