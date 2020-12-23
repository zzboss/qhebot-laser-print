let current;
const STEP_UNIT = 0.5;
const N_ARC_CORRECTION = 25;

/**
 * 求输入参数的平方
 * @param {Number} num 底数
 */
function sq(num) {
  return Math.pow(num, 2);
}

/**
 * 坐标点类
 * @param {Number} x x坐标
 * @param {Number} y y坐标
 */
function Coordinate(x, y) {
  this.x = Number(x);
  this.y = Number(y);

  /**
   * 判断两点是否在同一个位置
   * @param {Coordinate} target 目标点
   */
  this.eq = function(target) {
    return this.x === target.x && this.y === target.y;
  };
}

/**
 *
 * @param {Coordinate} start       起点
 * @param {Coordinate} target      终点
 * @param {Coordinate} startOffet  起始点相对于圆心的偏移坐标
 * @param {Number}     dir         圆弧方向: 顺时针(1)---逆时针(0)
 */
function Arc(start, target, startOffet, dir) {
  this.start = start;
  this.target = target;
  this.startOffset = startOffet;
  this.center = new Coordinate(
    this.start.x + this.startOffset.x,
    this.start.y + this.startOffset.y
  );
  this.targetOffset = new Coordinate(
    this.target.x - this.center.x,
    this.target.y - this.center.y
  );
  this.dir = dir;
  // 求圆弧半径
  this.getRadius = function() {
    return Math.sqrt(sq(this.startOffset.x) + sq(this.startOffset.y));
  };
  // 求圆弧夹角弧度
  this.getRadians = function() {
    let angular_travel;
    const [r_P, r_Q] = [-this.startOffset.x, -this.startOffset.y];
    const [rt_X, rt_Y] = [this.targetOffset.x, this.targetOffset.y];
    angular_travel = Math.atan2(
      r_P * rt_Y - r_Q * rt_X,
      r_P * rt_X + r_Q * rt_Y
    );
    if (angular_travel < 0) angular_travel += Math.PI * 2;
    if (this.dir > 0) angular_travel -= Math.PI * 2;
    if (angular_travel == 0 && this.start.eq(this.target)) {
      angular_travel = Math.PI * 2;
    }
    return angular_travel;
  };
  // 求弧长
  this.getArcLength = function() {
    return Math.abs(this.getRadius() * this.getRadians());
  };
}

/**
 * 解析 g 代码
 * @param {String} gcode g代码
 * @returns g 代码解析结果
 */
function parseGcode(gcode) {
  gcode = gcode.toUpperCase();
  let res;
  let command = gcode.split(" ").filter(item => item)[0];
  switch (command) {
    case "Z-1":
    case "Z0":
    case "Z1":
      res = command;
      break;
    case "M05":
      res = "Z-1";
      break;
    case "M03":
      res = "Z1";
      break;
    case "G0":
    case "G1":
      res = parseG1_or_G0(gcode);
      break;
    case "G2":
    case "G3":
      res = parseG2_Or_G3_to_G1(gcode);
      break;
    default:
      res = null;
  }
  return res;
}

/**
 * g1代码忽略速度设置
 * g1 格式: G1 X12.233 Y-45.22
 * @param {String} gcode g1 部分代码
 */
function parseG1_or_G0(gcode) {
  if (gcode.indexOf("X") < 0 && gcode.indexOf("Y") < 0) {
    return null;
  }
  let position = gcode.split(" ").filter(item => item);
  let x = position[1].substring(1);
  let y = position[2].substring(1);
  current = new Coordinate(x, y);
  return `G1 X${Number(x).toFixed(2)} Y${Number(y).toFixed(2)}`;
}

/**
 * 将圆弧插补的 gcode 转为直线插补
 * g2/g3 格式：G2 X-76.8803 Y-160.5227 I4.1553 J28.6044
 * 特殊格式: G2 X56.8891 Y214.0434 R190099.764940
 * (X, Y) 为目标点坐标, (I, J) 为圆心坐标, R 为圆弧半径
 *
 * @param {String} gcode g2 或 g3 的gcode
 * @returns 直线插补命令集
 */
function parseG2_Or_G3_to_G1(gcode) {
  let dir = gcode.indexOf("G2") + 1;
  let args = gcode.split(" ").filter(item => item);
  let targetX = args[1].substring(1);
  let targetY = args[2].substring(1);
  let startOffset;
  let target = new Coordinate(targetX, targetY);
  if (gcode.indexOf("R") > -1) {
    let r = args[3].substring(1);
    let center = findCenter(current, target, dir, r);
    startOffset = new Coordinate(center.x - current.x, center.y - current.y);
  } else {
    let startOffsetX = args[3].substring(1);
    let startOffsetY = args[4].substring(1);
    startOffset = new Coordinate(startOffsetX, startOffsetY);
  }
  let arc = new Arc(current, target, startOffset, dir);
  let points = arcToLine(arc, STEP_UNIT);
  current = target;
  return points.map(item => {
    return `G1 X${item.x.toFixed(2)} Y${item.y.toFixed(2)}`;
  });
}

/**
 * 将弧线根据步长转为从起始点到终止点的点集
 * @param {Coordinate} start  起始点
 * @param {Coordinate} end    终止点
 * @param {Number}     dir    圆弧方向: 顺时针(1)---逆时针(0)
 * @param {Number}     r      圆弧半径
 * @return 圆心坐标
 */
function findCenter(start, end, dir, r) {
  let e = dir ^ (r < 0) ? -1 : 1;
  let dx = end.x - start.x;
  let dy = end.y - start.y;
  let d = Math.sqrt(sq(dx) + sq(dy));
  let h = Math.sqrt(sq(r) - sq(d * 0.5));
  let mx = (start.x + end.x) * 0.5;
  let my = (start.y + end.y) * 0.5;
  let sx = -dy / d;
  let sy = dx / d;
  let cx = mx + e * h * sx;
  let cy = my + e * h * sy;
  return new Coordinate(cx, cy);
}

/**
 * 将圆弧转化为点集
 * @param {Arc}    arc  圆弧信息
 * @param {Number} unit 每个点的间距
 * @returns points 圆弧分解后的点集
 */
function arcToLine(arc, unit = 1) {
  let angular_travel = arc.getRadians();
  //第一个参数是弧长计算
  const mm_of_travel = arc.getArcLength();
  if (mm_of_travel < 0.001) return [];

  let segments = mm_of_travel / unit;
  if (segments < 1) segments = 1;

  const theta_per_segment = angular_travel / segments;
  //小角度近似
  const sin_T = theta_per_segment;
  const cos_T = 1 - 0.5 * sq(theta_per_segment);
  let arc_recalc_count = N_ARC_CORRECTION;
  let [r_P, r_Q] = [-arc.startOffset.x, -arc.startOffset.y];
  let points = [];
  for (let i = 1; i < segments; i++) {
    if (--arc_recalc_count) {
      const r_new_Y = r_P * sin_T + r_Q * cos_T;
      r_P = r_P * cos_T - r_Q * sin_T;
      r_Q = r_new_Y;
    } else {
      arc_recalc_count = N_ARC_CORRECTION;
      const cos_Ti = Math.cos(i * theta_per_segment),
        sin_Ti = Math.sin(i * theta_per_segment);
      r_P = -arc.startOffset.x * cos_Ti + arc.startOffset.y * sin_Ti;
      r_Q = -arc.startOffset.x * sin_Ti - arc.startOffset.y * cos_Ti;
    }
    let point = new Coordinate(arc.center.x + r_P, arc.center.y + r_Q);
    points.push(point);
  }
  return points;
}

module.exports = { parseGcode };
