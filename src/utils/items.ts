// 请将上述内容组织成一个对象数组 对象包括desc描述大类 items数组包括下面的子类
const items: Array<{
  desc: string,
}> = [
  {
    desc: '客餐厅',
  },
  {
    desc: '厨房',
  },
  {
    desc: '主卧',
  },
  {
    desc: '次卧',
  },
  {
    desc: '卫生间-主卫',
  },
  {
    desc: '卫生间-次卫',
  },
  {
    desc: '阳台',
  },
]

export default items

export function numberToChinese(number: number): string {
  // 定义数字和对应的大写汉字
  const chineseNumbers = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  // 定义位数单位
  const units = ["", "十", "百", "千", "万", "亿"];
  
  // 处理负数
  if (number < 0) {
      return "负" + numberToChinese(-number);
  }
  
  // 处理零
  if (number === 0) {
      return chineseNumbers[0];
  }
  
  // 将数字转换为字符串，方便处理每一位
  const numberStr = number.toString();
  const length = numberStr.length;
  
  // 初始化结果字符串
  let result = "";
  
  // 遍历每一位数字
  for (let i = 0; i < length; i++) {
      const digit = parseInt(numberStr[i]);
      const unit = units[(length - 1 - i) % 4];
      
      // 处理万位和亿位
      if ((length - 1 - i) % 4 === 0 && digit !== 0) {
          result += chineseNumbers[digit] + units[(length - 1 - i) / 4];
      } else {
          result += chineseNumbers[digit] + unit;
      }
  }
  
  // 去除多余的"一十"
  if (result.startsWith("一十")) {
      result = result.slice(1);
  }

  // 去除多余的"零"
  result = result.replace(/零+/g, "零");

  // 处理末尾的"零"
  if (result.endsWith("零")) {
      result = result.slice(0, -1);
  }
  
  return result;
}