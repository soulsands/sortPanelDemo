export const findParentByClassFromEvent = (
  event: Event,
  className: string
): HTMLElement | null => {
  if (!Object.prototype.toString.call(event.srcElement).includes("HTML")) {
    throw new Error("Not a HTMLelement");
  }
  // console.log(event);
  let targetElement = (event.target || event.srcElement) as HTMLElement | null;
  if (targetElement !== null) {
    while (
      targetElement?.className
        .split(" ")
        .findIndex(value => value === className) === -1
    ) {
      targetElement = targetElement.parentElement;
    }
  }
  return targetElement;
};

function checkELe(ele: HTMLElement): void {
  if (!ele) {
    console.warn(ele + " is not available");
  }
}

export const hasClass = (ele: HTMLElement, className: string): boolean => {
  checkELe(ele);
  return ele.className.split(/\s+/g).some(name => {
    return name === className;
  });
};
export const addClass = (ele: HTMLElement, className: string): void => {
  checkELe(ele);
  if (!hasClass(ele, className)) {
    ele.className += " " + className;
  }
};
export const removeClass = (
  ele: HTMLElement,
  className: string | RegExp
): void => {
  checkELe(ele);
  ele.className = ele.className
    .split(/\s+/g)
    .filter(name => {
      if (typeof className === "string") {
        return name !== className;
      }
      if (typeof className === "object") {
        (className as RegExp).test(name);
      }
    })
    .join(" ");
};

export const switchEles = (
  ele: HTMLElement,
  targetEle: HTMLElement | null,
  forward: boolean
): void => {
  if (ele && targetEle) {
    if (forward) {
      ele.parentElement?.insertBefore(ele, targetEle.nextElementSibling);
    } else {
      if (!targetEle.nextElementSibling) {
        targetEle = null;
      }
      ele.parentElement?.insertBefore(ele, targetEle);
    }
  }
};

export const ArrayInsertItemBefore = (
  arr: unknown[],
  first: number,
  second: number
): unknown[] => {
  arr.splice(second, 0, arr.splice(first, 1)[0]);
  return arr;
};

export const getEleIndex = (element: HTMLElement): number => {
  let index = null;

  if (!Object.prototype.toString.call(element).includes("HTML")) {
    throw new Error("Not a HTMLelement");
  } else {
    index = Array.prototype.indexOf.call(
      element.parentElement?.children,
      element
    );
  }
  return index;
};

export function debounce(cb: Function, delay: number): Function {
  let timer: NodeJS.Timeout;
  return function(...args: unknown[]): void {
    clearTimeout(timer);
    timer = setTimeout(() => {
      cb.apply(this, args);
    }, delay);
  };
}
//
/* export function has3d(): boolean {
  if (!window.getComputedStyle) {
    return false;
  }

  const el = document.createElement("p"),
    has3d,
    transforms = {
      webkitTransform: "-webkit-transform",
      OTransform: "-o-transform",
      msTransform: "-ms-transform",
      MozTransform: "-moz-transform",
      transform: "transform"
    };

  // Add it to the body to get the computed style.
  document.body.insertBefore(el, null);

  for (const t in transforms) {
    if (el.style[t] !== undefined) {
      el.style[t] = "translate3d(1px,1px,1px)";
      has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
    }
  }

  document.body.removeChild(el);

  return has3d !== undefined && has3d.length > 0 && has3d !== "none";
} */
