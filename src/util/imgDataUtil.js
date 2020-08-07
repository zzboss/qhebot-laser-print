/**
 * 图片数据处理工具
 * 由于图片数据不可以修改引用, 所以工具函数直接修改原数据, 不返回新数据
 * @author zzboss 2020.07.23
 */
const imgDataUtil = {
  /**
   *
   * @param {Array} data 图片数据
   * @param {Function} dataProcessor 数据处理器
   * @param {Object} param 数据处理过程需要的参数
   */
  transformImgData(data, dataProcessor, param) {
    for (let i = 0; i < data.length; i += 4) {
      let grayVal = dataProcessor(data, i, param);
      data[i] = grayVal;
      data[i + 1] = grayVal;
      data[i + 2] = grayVal;
    }
  },
  /**
   * 将图片灰化(r, g, b 取均值即可)
   * @param {Array} data 图片数据
   */
  grayImg(data) {
    this.transformImgData(
      data,
      (data, i) => (data[i] + data[i + 1] + data[i + 2]) / 3
    );
  },
  /**
   * 将图片黑白化 (r, g, b 取均值后通过传入的中间值判断当前点是黑还是白)
   * @param {Array} data 图片数据
   * @param {Number} mediumVal 黑白化中间值(0~255)
   */
  blackImg(data, mediumVal) {
    this.transformImgData(
      data,
      (data, i, mediumVal) => {
        let grayVal = (data[i] + data[i + 1] + data[i + 2]) / 3;
        return grayVal > mediumVal ? 255 : 0;
      },
      mediumVal
    );
  },

  /**
   * 将灰色图片轮廓化
   * @param {Array} data 图片数据
   * @param {Number} similarVal 相似值范围
   * @param {Number} w 图宽
   * @param {Number} h 图高
   */
  lineImgWithGray(data, similarVal, w, h) {
    this.grayImg(data);
    this.transformImgData(
      data,
      (data, i, params) => {
        const [similarVal, w, h] = [...params];
        return this.isUniqueWithGray(data, i / 4, w, h, similarVal) ? 0 : 255;
      },
      [similarVal, w, h]
    );
  },
  /**
   * 将彩色图片轮廓化
   * @param {Array} data 图片数据
   * @param {Number} similarVal 相似值范围
   * @param {Number} w 图宽
   * @param {Number} h 图高
   */
  lineImgWithRgb(data, similarVal, w, h) {
    this.transformImgData(
      data,
      (data, i, params) => {
        const [similarVal, w, h] = [...params];
        return this.isUniqueWithRgb(data, i / 4, w, h, similarVal) ? 0 : 255;
      },
      [similarVal, w, h]
    );
  },
  /**
   * 判断黑色图片相邻点色值是否相同
   * @param {Array} data 图片数据
   * @param {Number} position 像素点位置
   * @param {Number} w 图宽
   * @param {Number} h 图高
   */
  isUniqueWithBlack(data, position, w, h) {
    let right = position + 1;
    let down = position + w;
    if (right % w === 0) {
      return !this.eqColor(data, position, down);
    } else if (down / w > h) {
      return !this.eqColor(data, position, right);
    }
    return !(
      this.eqColor(data, position, right) && this.eqColor(data, position, down)
    );
  },
  /**
   * 判断灰色图片相邻点色值是否相似
   * @param {Array} data 图片数据
   * @param {Number} position 像素点位置
   * @param {Number} w 图宽
   * @param {Number} h 图高
   * @param {Number} similarVal 相似范围
   */
  isUniqueWithGray(data, position, w, h, similarVal) {
    let right = position + 1;
    let down = position + w;
    if (right % w === 0) {
      return !this.similarColor(data, position, down, similarVal);
    } else if (down / w > h) {
      return !this.similarColor(data, position, right, similarVal);
    }
    return !(
      this.similarColor(data, position, right, similarVal) &&
      this.similarColor(data, position, down, similarVal)
    );
  },
  /**
   * 判断彩色图片相邻点rgb色值是否相似
   * @param {Array} data 图片数据
   * @param {Number} position 像素点位置
   * @param {Number} w 图宽
   * @param {Number} h 图高
   * @param {Number} similarVal 相似范围
   */
  isUniqueWithRgb(data, position, w, h, similarVal) {
    let right = position + 1;
    let down = position + w;
    if (right % w === 0) {
      return !this.similarRgb(data, position, down, similarVal);
    } else if (down / w > h) {
      return !this.similarRgb(data, position, right, similarVal);
    }
    return !(
      this.similarRgb(data, position, right, similarVal) &&
      this.similarRgb(data, position, down, similarVal)
    );
  },
  /**
   * 比较两个灰色点的色值是否相同
   * @param {Array} data 图片数据
   * @param {Number} a 点a
   * @param {Number} b 点b
   */
  eqColor: (data, a, b) => data[a * 4] === data[b * 4],
  /**
   * 比较两个灰色点的色值是否相似(色值相差在一定范围内视为相似)
   * @param {*} data 图片数据
   * @param {*} a 点a
   * @param {*} b 点b
   * @param {*} similarVal 相似值范围
   */
  similarColor: (data, a, b, similarVal) =>
    Math.abs(data[a * 4] - data[b * 4]) < similarVal,
  /**
   * 判断rgb色值是否相似
   */
  similarRgb: (data, a, b, similarVal) =>
    Math.abs(data[a * 4] - data[b * 4]) < similarVal &&
    Math.abs(data[a * 4 + 1] - data[b * 4 + 1]) < similarVal &&
    Math.abs(data[a * 4 + 2] - data[b * 4 + 2]) < similarVal
};
export default imgDataUtil;
