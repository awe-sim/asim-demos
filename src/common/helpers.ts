export function prevent(ev: React.MouseEvent) {
  ev.preventDefault();
  ev.stopPropagation();
}