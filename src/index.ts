import "./style.css";
import {
  addClass,
  removeClass,
  switchEles,
  ArrayInsertItemBefore,
  getEleIndex,
} from "./helper";

interface IconSortConfig {
  wrapperSelector: string;
  iconSelector: string;
  data: object[];
}
// eslint-disable-next-line
function noop() {}

type statusHold = "OFF" | "HOLDING" | "MOVING" | "HOMMING";
type status = "OFF" | "ON" | "CHANGING";

const status = {
  OFF: "OFF",
  ON: "ON",
  CHANGING: "CHANGING",
};

const statusHold = {
  OFF: "OFF",
  HOLDING: "HOLDING",
  MOVING: "MOVING",
  HOMMING: "HOMMING",
};

console.log(process.env);
export default class IconSort {
  status: string;
  statusHold: string;
  dataHolding: {
    timeCounter: NodeJS.Timeout | undefined;
    holdingIconIndex: number;
    holdingIconEle: HTMLElement | null;
  };
  dataMoving: {
    grabbedIconIndex: number;
    grabbedIconEle: HTMLElement | null;

    moveStartX: number;
    moveStartY: number;
    hoverIconIndex: number;
    movingX: number;
    movingY: number;
    moveDistanceX: number;
    moveDistanceY: number;
    moveDebounce: NodeJS.Timeout | undefined;
  };
  dataChanging: {
    grabbedIconIndex: number;
    targetIconIndex: number;
    gap: number;
    grabbedEle: HTMLElement | null;
    targetEle: HTMLElement | null;
    elesToSwitch: HTMLElement[];
    transitionendDebounce: NodeJS.Timeout | undefined;
  };
  icons: HTMLElement[];
  iconWidth: number;
  iconHeight: number;
  diameter: number;
  diameterRate: number;
  rows: number;
  cols: number;
  stepX: number;
  stepY: number;
  coordinates: { X: number; Y: number; index: number }[];

  constructor({ wrapperSelector, data, iconSelector }: IconSortConfig) {
    this.status = "OFF";
    this.statusHold = "OFF";
    this.dataHolding = {
      timeCounter: undefined,
      holdingIconIndex: -1,
      holdingIconEle: null,
    };
    this.dataMoving = {
      grabbedIconIndex: -1,
      grabbedIconEle: null,
      moveStartX: -1,
      moveStartY: -1,
      moveDebounce: undefined,
      //移动时候会变的
      hoverIconIndex: -1,
      movingX: -1,
      movingY: -1,
      moveDistanceX: -1,
      moveDistanceY: -1,
    };
    this.dataChanging = {
      grabbedIconIndex: -1,
      grabbedEle: null,
      targetIconIndex: -1,
      targetEle: null,
      elesToSwitch: [],
      gap: -1,
      transitionendDebounce: undefined,
    };

    const icons = document
      .querySelector(wrapperSelector)
      ?.querySelectorAll(iconSelector);
    if (!icons) {
      throw new Error();
    } else {
      this.icons = Array.from(icons) as HTMLElement[];
      this.iconWidth = this.icons[0].offsetWidth;
      this.iconHeight = this.icons[0].offsetHeight;
    }
    this.coordinates = [];
    this.diameter = -1;
    this.diameterRate = 1;
    this.rows = -1;
    this.cols = -1;
    this.stepX = -1;
    this.stepY = -1;

    this.setIconsLocation();
    this.setIconConfig();
    this.addIconEvents();
    console.log(this);
  }
  setIconsLocation(): void {
    this.coordinates = this.icons.map((iconEle, index) => {
      return {
        index,
        X: iconEle.offsetLeft + iconEle.offsetWidth / 2,
        Y: iconEle.offsetTop + iconEle.offsetHeight / 2,
      };
    });
  }
  setIconConfig(): void {
    const iconEle = this.icons[0];
    if (iconEle) {
      this.diameter = this.iconWidth / 2;
    }
    this.coordinates.some((_, index, coordinates) => {
      if (coordinates[index].Y !== coordinates[index + 1].Y) {
        console.log(index);
        this.cols = index + 1;
        this.rows = Math.ceil(coordinates.length / this.cols);
        this.stepX = coordinates[1].X - coordinates[0].X;
        this.stepY =
          this.rows > 1 ? coordinates[this.cols].Y - coordinates[0].Y : 0;
        return true;
      }
    });
  }
  isStatusHold(status: string): boolean {
    return this.statusHold === status;
  }
  turnStatusHold(status: string): void {
    this.statusHold = status;
  }
  isStatus(status: string): boolean {
    return this.status === status;
  }
  turnStatus(status: string): void {
    this.status = status;
  }
  addIconEvents(): void {
    this.icons.forEach((IconEle) => {
      this.addTouchStart(IconEle);
      this.addTouchMove(IconEle);
      this.addTransitionend(IconEle);
      this.addTouchend(IconEle);
    });
  }
  addTouchStart(IconEle: HTMLElement): void {
    IconEle.addEventListener("touchstart", (event) => {
      const e = event as TouchEvent;
      console.time("touchstart");
      if (this.isStatus(status.OFF) && this.isStatusHold(statusHold.OFF)) {
        this.turnStatusHold(statusHold.HOLDING);
        this.setHoldingIcon(e);
        this.countHoldTime(() => {
          this.enlargeHoldIcon();
          //grabIcon应该放到transitionend里面，但事件再这里
          this.grabIcon(e);
        });
      }

      if (this.isStatus(status.ON) && this.isStatusHold(statusHold.OFF)) {
        e.preventDefault();
        this.turnStatusHold(statusHold.HOLDING);
        this.setHoldingIcon(e);
        setTimeout(() => {
          this.enlargeHoldIcon();
          this.grabIcon(e);
        }, 20);
      }
    });
  }
  setHoldingIcon(e: TouchEvent): void {
    console.log("setHoldingIcon");

    this.dataHolding.holdingIconIndex = getEleIndex(
      (e.target || e.srcElement) as HTMLElement
    );
    this.dataHolding.holdingIconEle = this.icons[
      this.dataHolding.holdingIconIndex
    ];
    addClass(this.dataHolding.holdingIconEle as HTMLElement, "holding");
  }
  countHoldTime(callback: Function): void {
    this.dataHolding.timeCounter = setTimeout(() => {
      callback();
    }, 700);
  }
  cancelHold(): void {
    this.resetHoldingIcon();
    this.turnStatusHold(statusHold.OFF);
    clearTimeout(this.dataHolding.timeCounter as NodeJS.Timeout);
  }
  grabIcon(e: TouchEvent): void {
    this.dataMoving.grabbedIconIndex = this.dataHolding.holdingIconIndex;
    this.dataMoving.grabbedIconEle = this.dataHolding.holdingIconEle;
    this.dataMoving.moveStartX = e.touches[0].pageX;
    this.dataMoving.moveStartY = e.touches[0].pageY;
    console.timeEnd("touchstart");
  }
  enlargeHoldIcon(): void {
    if (this.dataHolding.holdingIconEle) {
      this.dataHolding.holdingIconEle.style.transform =
        "translateX(0px) translateY(0px)  scale(1.1)  translateZ(0px)";
    }
  }
  addTouchMove(IconEle: HTMLElement): void {
    //off的时候要保持原生的滚动效果,才能滚动应用
    IconEle.addEventListener("touchmove", (e: TouchEvent) => {
      //按住不足一秒时移动位置

      if (this.isStatusHold(statusHold.MOVING) && this.isStatus(status.ON)) {
        e.stopPropagation();
        e.preventDefault();
        this.moveIconTransform(e);
        //这里要判断被抓去的图标和别的图标距离多远
        clearTimeout(this.dataMoving.moveDebounce as NodeJS.Timeout);
        this.dataMoving.moveDebounce = setTimeout(() => {
          console.log("这里在寻找");

          this.findHoveringIcon();
        }, 20);
        return;
      }
      if (this.isStatus(status.CHANGING)) {
        e.stopPropagation();
        e.preventDefault();
        this.moveIconTransform(e);
        console.log("正在改变");
        return;
      }
      if (this.isStatusHold(statusHold.HOLDING)) {
        e.preventDefault();
        this.cancelHold();
        return;
      }
    });
    //holding状态时候改成
  }
  resetHoldingIcon(): void {
    console.log("resetHoldingIcon");
    //setHoldingIcon ,为放大的动画添加类名
    (this.dataHolding.holdingIconEle as HTMLElement).style.transform = "";
    removeClass(this.dataHolding.holdingIconEle as HTMLElement, "holding");
    this.dataHolding.holdingIconIndex = -1;
    this.dataHolding.holdingIconEle = null;
  }
  moveIconTransform(e: TouchEvent): void {
    const icon = this.dataMoving.grabbedIconEle as HTMLElement;
    this.dataMoving.movingX = e.touches[0].pageX;
    this.dataMoving.movingY = e.touches[0].pageY;

    this.dataMoving.moveDistanceX =
      this.dataMoving.movingX - this.dataMoving.moveStartX;
    this.dataMoving.moveDistanceY =
      this.dataMoving.movingY - this.dataMoving.moveStartY;
    icon.style.transform =
      "translateX(" +
      this.dataMoving.moveDistanceX +
      "px) translateY(" +
      this.dataMoving.moveDistanceY +
      "px)  scale(1.1) translateZ(0px)";
  }
  findHoveringIcon(): void {
    const grabbedIconCoordinate = this.coordinates[
      this.dataMoving.grabbedIconIndex
    ];
    const movingIcon = {
      X: grabbedIconCoordinate.X + this.dataMoving.moveDistanceX,
      Y: grabbedIconCoordinate.Y + this.dataMoving.moveDistanceY,
    };
    /*  console.log(movingIcon); */

    this.dataMoving.hoverIconIndex = -1;
    console.time("test");

    for (let index = 0, len = this.icons.length; index < len; index++) {
      if (this.dataMoving.grabbedIconIndex === index) continue;

      const iconLoc = this.coordinates[index];
      const sumDistance =
        Math.sqrt(
          Math.pow((iconLoc.X | 0) - (movingIcon.X | 0), 2) +
            Math.pow((iconLoc.Y | 0) - (movingIcon.Y | 0), 2)
        ) | 0;

      console.log(iconLoc);
      console.log(sumDistance);

      //不是自己, 并且和别的应用靠得很近
      if (sumDistance < this.diameter * this.diameterRate) {
        this.dataMoving.hoverIconIndex = index;
        console.log(index);
        this.turnStatus(status.CHANGING);
        /*  console.log(this); */
        this.findElementToSwitch();

        this.elementsSwitch();

        break;
      }
    }
    console.timeEnd("test");
  }
  findElementToSwitch(): void {
    this.dataChanging.grabbedIconIndex = this.dataMoving.grabbedIconIndex;
    this.dataChanging.targetIconIndex = this.dataMoving.hoverIconIndex;
    this.dataChanging.gap =
      this.dataChanging.targetIconIndex - this.dataChanging.grabbedIconIndex;

    this.dataChanging.grabbedEle = this.icons[
      this.dataChanging.grabbedIconIndex
    ];
    this.dataChanging.targetEle = this.icons[this.dataChanging.targetIconIndex];
  }
  elementsSwitch(): void {
    const forward = this.dataChanging.gap > 0;
    const grabbedIndex = this.dataChanging.grabbedIconIndex;
    const targetIconIndex = this.dataChanging.targetIconIndex;
    const startIndex = forward ? grabbedIndex + 1 : targetIconIndex;
    const endIndex = forward ? targetIconIndex + 1 : grabbedIndex;
    const elesToSwitch = (this.dataChanging.elesToSwitch = this.icons.slice(
      startIndex,
      endIndex
    ));
    console.log(elesToSwitch);
    elesToSwitch.forEach((ele) => {
      addClass(ele, "changing");
    });
    elesToSwitch.forEach((ele, index) => {
      //判断出行数和列数有多少个，可以
      /*  console.time("1");
      let stepEleTransX: number, stepEleTransY: number;
      if (forward) {
        const isEdge = (startIndex + index) % this.cols === 0;
        if (isEdge) {
          stepEleTransX = this.stepX * (this.cols - 1);
          stepEleTransY = -this.stepY;
        } else {
          stepEleTransX = -this.stepX;
          stepEleTransY = 0;
        }
      } else {
        const isEdge = (startIndex + index + 1) % this.cols === 0;
        if (isEdge) {
          stepEleTransX = -this.stepX * (this.cols - 1);
          stepEleTransY = this.stepY;
        } else {
          stepEleTransX = this.stepX;
          stepEleTransY = 0;
        }
      }
      console.timeEnd("1"); */
      console.time("2");
      const stepEleTransX =
          this.coordinates[startIndex + index - (forward ? 1 : -1)].X -
          this.coordinates[startIndex + index].X,
        stepEleTransY =
          this.coordinates[startIndex + index - (forward ? 1 : -1)].Y -
          this.coordinates[startIndex + index].Y;
      console.timeEnd("2");
      console.log(stepEleTransX, stepEleTransY);
      // console.log(stepEleTransX1, stepEleTransY1);
      //  return;
      setTimeout(() => {
        ele.style.transform =
          "translateX(" +
          stepEleTransX +
          "px) translateY( " +
          stepEleTransY +
          "px)  translateZ(0px)";
      }, 20); //10毫秒i的画会出问题
    });
  }
  addTransitionend(IconEle: HTMLElement): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    IconEle.addEventListener("transitionend", (event) => {
      clearTimeout(this.dataChanging.transitionendDebounce as NodeJS.Timeout);
      this.dataChanging.transitionendDebounce = setTimeout(() => {
        console.log("transitionend");
        //长按时放大图标,改变状态到on 和 moving
        if (
          this.isStatus(status.OFF) &&
          this.isStatusHold(statusHold.HOLDING)
        ) {
          this.turnStatusHold(statusHold.MOVING);
          removeClass(
            this.dataHolding.holdingIconEle as HTMLElement,
            "holding"
          );
          this.dataHolding.holdingIconIndex = -1;
          this.dataHolding.holdingIconEle = null;
          addClass(this.dataMoving.grabbedIconEle as HTMLElement, "grabbed");
          this.turnStatus(status.ON);
          this.icons.forEach((ele, index) => {
            addClass(ele, "on" + (index % 3));
          });
          return;
        }
        //已经是on了, 长按hold
        if (this.isStatus(status.ON) && this.isStatusHold(statusHold.HOLDING)) {
          this.turnStatusHold(statusHold.MOVING);
          removeClass(
            this.dataHolding.holdingIconEle as HTMLElement,
            "holding"
          );
          this.dataHolding.holdingIconIndex = -1;
          this.dataHolding.holdingIconEle = null;
          addClass(this.dataMoving.grabbedIconEle as HTMLElement, "grabbed");
          console.log("this.isStatus(status.ON)");
        }
        //status正在changing, hold正在moving
        if (
          this.isStatus(
            status.CHANGING
          ) /* &&
          this.isStatusHold(statusHold.MOVING) */
        ) {
          console.log("调换阶段");
          setTimeout(() => {
            this.resetChangingView();
          }, 20);
        }
        if (this.isStatus(status.ON) && this.isStatusHold(statusHold.HOMMING)) {
          console.log("回归");
          removeClass(
            this.dataMoving.grabbedIconEle as HTMLElement,
            "changing"
          );
          this.dataMoving.grabbedIconEle = null;
          this.turnStatusHold(statusHold.OFF);
        }
        console.log("last one");
        console.log(event);
        console.log(this);
        console.log(this.dataChanging.gap);
      }, 50); //debounce时间不饿能太短，因为有时候浏览器不只负责js运行
    });
  }
  resetChangingView(): void {
    console.log("resetchangingview");

    const forward = this.dataChanging.gap > 0;
    const grabbedEle = this.dataChanging.grabbedEle as HTMLElement;
    switchEles(
      grabbedEle,
      this.icons[this.dataChanging.targetIconIndex],
      forward
    );
    this.setGrabbedIconTransform();
    this.dataChanging.elesToSwitch.forEach((ele) => {
      removeClass(ele, "changing");
      ele.style.transform = "";
    });
    this.resetIconEles();
    this.resetMovingStatus();
    this.resetChangeStatus();
    this.turnStatus(status.ON);
    console.log(this.statusHold);

    setTimeout(() => {
      if (this.isStatusHold(statusHold.HOMMING)) {
        removeClass(this.dataMoving.grabbedIconEle as HTMLElement, "grabbed");
        addClass(this.dataMoving.grabbedIconEle as HTMLElement, "changing");
        /*  setTimeout(() => { */
        if (this.dataMoving.grabbedIconEle) {
          this.dataMoving.grabbedIconEle.style.transform = "";
        }
        console.log("480清空");

        this.dataMoving.grabbedIconIndex = -1;
        this.dataMoving.moveStartX = -1;
        this.dataMoving.moveStartY = -1;
        this.dataMoving.movingX = -1;
        this.dataMoving.movingY = -1;
        this.dataMoving.moveDistanceX = -1;
        this.dataMoving.moveDistanceY = -1;
        /* }, 10); */
        return;
      }
      this.findHoveringIcon();
    }, 30);
    console.log(this);
  }
  setGrabbedIconTransform(): void {
    const switchX =
      this.coordinates[this.dataChanging.targetIconIndex].X -
      this.coordinates[this.dataChanging.grabbedIconIndex].X;
    const switchY =
      this.coordinates[this.dataChanging.targetIconIndex].Y -
      this.coordinates[this.dataChanging.grabbedIconIndex].Y;
    console.log(switchX, switchY);
    /// this.dataChanging.grabbedIconIndex;
    this.dataMoving.moveStartX += switchX;
    this.dataMoving.moveStartY += switchY;

    this.dataMoving.moveDistanceX -= switchX;
    this.dataMoving.moveDistanceY -= switchY;
    (this.dataChanging.grabbedEle as HTMLElement).style.transform =
      "translateX(" +
      this.dataMoving.moveDistanceX +
      "px) translateY(" +
      this.dataMoving.moveDistanceY +
      "px)  scale(1.1)  translateZ(0px)";
  }
  resetIconEles(): void {
    this.icons = ArrayInsertItemBefore(
      this.icons,
      this.dataChanging.grabbedIconIndex,
      this.dataChanging.targetIconIndex
    ) as HTMLElement[];
  }
  resetChangeStatus(): void {
    console.log("525清空");

    this.dataChanging.grabbedIconIndex = -1;
    this.dataChanging.targetIconIndex = -1;
    this.dataChanging.gap = -1;
    this.dataChanging.grabbedEle = null;
    this.dataChanging.targetEle = null;
    this.dataChanging.elesToSwitch = [];
    this.dataChanging.transitionendDebounce = undefined;
  }
  resetMovingStatus(): void {
    this.dataMoving.grabbedIconIndex = this.dataChanging.targetIconIndex;
    this.dataMoving.hoverIconIndex = -1;
  }
  addTouchend(IconEle: HTMLElement): void {
    IconEle.addEventListener("touchend", (event) => {
      console.log("touchend");
      console.time("touchend");
      //todo on changing 的情况还没处理

      if (this.isStatusHold(statusHold.MOVING) /* &&  */) {
        //按住的情况要重置
        console.log("HOMMING");
        this.turnStatusHold(statusHold.HOMMING);
        //如果有这个，会触发
        clearTimeout(this.dataMoving.moveDebounce as NodeJS.Timeout);

        if (this.isStatus(status.CHANGING)) {
          console.log("松开点击时,正在调换");
        }
        if (this.isStatus(status.ON)) {
          removeClass(this.dataMoving.grabbedIconEle as HTMLElement, "grabbed");
          addClass(this.dataMoving.grabbedIconEle as HTMLElement, "changing");
          /*   setTimeout(() => { */
          //触发transition
          if (this.dataMoving.grabbedIconEle) {
            this.dataMoving.grabbedIconEle.style.transform = "";
          }
          console.log("564清空");

          this.dataMoving.grabbedIconIndex = -1;
          this.dataMoving.moveStartX = -1;
          this.dataMoving.moveStartY = -1;
          this.dataMoving.movingX = -1;
          this.dataMoving.movingY = -1;
          this.dataMoving.moveDistanceX = -1;
          this.dataMoving.moveDistanceY = -1;
          /*   }, 10); */
        }
        console.timeEnd("touchend");

        return;
      }
      if (this.isStatus(status.OFF) && this.isStatusHold(statusHold.OFF))
        return;
      if (this.isStatusHold(statusHold.HOLDING)) {
        console.log("cancelHold");
        this.cancelHold();
        return;
      }
    });
  }
}
