// utils/dom.ts
export function getScrollableParent(element: HTMLElement | null): HTMLElement | null {
  let parent = element?.parentElement;
  while (parent) {
    const style = getComputedStyle(parent);
    const overflowY = style.overflowY;
    if (overflowY === "auto" || overflowY === "scroll") return parent;
    parent = parent.parentElement;
  }
  return null;
}

export function isElementPartiallyVisible(el: HTMLElement, parent: HTMLElement) {
  const elRect = el.getBoundingClientRect();
  const parentRect = parent.getBoundingClientRect();
  return elRect.bottom > parentRect.top && elRect.top < parentRect.bottom;
}

export function isElementFullyVisible(el: HTMLElement, parent: HTMLElement) {
  const elRect = el.getBoundingClientRect();
  const parentRect = parent.getBoundingClientRect();
  return elRect.top >= parentRect.top && elRect.bottom <= parentRect.bottom;
}
