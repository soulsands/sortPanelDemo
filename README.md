一个demo， 主要功能是应用图标的自定义排序，类似于ios系统，点击之后抖动，然后可以抓取及时排序。





tasks：

- [x] toucheend 还要设定其他的状态下的行为，主要changing 

- [x] 优化获取，不要rankstatus了 

- [x] 目前再changing的时候不会判断hoverapp，这一点需要改变下，让hoverapp，最好设定一个flag，在changing的动话时也可以改变transform

- [ ] 优化寻找目标icon的算法，目前只是暴力获取。判断hover时的遍历需要优化, 最好根据图标的平面位置来设置遍历顺序,先遍历身边的元素,再一圈圈往外。
  最好改成根据坐标来判断最近的元素。知道元素left和top以及icon的布局，可以算出最近的元素。

- [x] debounce touchmove

- [ ] 流程需要更清晰，明确顺序过程，而不是延迟

- [ ] 属性应用和判断,目前transform没有判断兼容性

- [ ] 删除icon功能，返回对应数据

- [ ] 逻辑图

  