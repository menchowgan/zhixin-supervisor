<script setup lang="ts">
import { ref } from "vue";
import Items from "@/components/Items.vue";
import { onHide, onShow } from "@dcloudio/uni-app";

const TEMP_KEY = "tempary_data_form";

const form = ref({
  name: "",
  phone: "",
  superviser: "",
  address: "",
  door: "",
});

type Result = {
  desc: string;
  results: {
    url: string;
    comments: string;
    isBad: boolean;
  }[];
};

const createPdf = (comments: Result[]) => {
  if (!form.value.name) {
    uni.showToast({
      title: "姓名不能为空",
      icon: "none",
    });
    return;
  }
  if (!form.value.superviser) {
    uni.showToast({
      title: "监理不能为空",
      icon: "none",
    });
    return;
  }
  if (comments.length === 0) {
    uni.showModal({
      title: "提示",
      content: "当前没有不合格项目，请先添加再生成报告",
      success: function (res) {
        if (res.confirm) {
          console.log("用户点击确定");
        } else if (res.cancel) {
          console.log("用户点击取消");
        }
      },
    });
    return;
  }
  uni.showModal({
    title: "提示",
    content: "确定生成pdf吗？",
    success: function (res) {
      if (res.confirm) {
        console.log("用户点击确定");
        sendRes(comments);
      } else if (res.cancel) {
        console.log("用户点击取消");
      }
    },
  });
};

const sendRes = (comments: Result[]) => {
  const results = {
    name: form.value.name,
    phone: form.value.phone,
    superviser: form.value.superviser,
    address: form.value.address,
    door: form.value.door,
    results: comments,
  };
  uni
    .request({
      url: "https://www.simple-life-space.xyz/pdf-generate",
      method: "POST",
      data: results,
    })
    .then((res) => {
      console.debug(res);
      if (res.statusCode == 200) {
        uni.setStorageSync("tempary_data_form", "");
        uni.setStorageSync("tempary_data_items", "");
        uni.showModal({
          title: "提示",
          content:
            "已生成，条码为：" + (res.data as any).code + " 点击确定后可复制",
          success: function (r) {
            if (r.confirm) {
              uni.setClipboardData({
                data: (res.data as any).code,
                success: function () {
                  uni.showToast({
                    title: "复制成功",
                    icon: "success",
                  });
                },
              });
            }
          },
        });
      } else {
        uni.showToast({
          title: "生成失败",
          icon: "none",
        });
      }
    });
};

onHide(() => {
  uni.setStorageSync(
    TEMP_KEY,
    JSON.stringify({
      name: form.value.name,
      phone: form.value.phone,
      superviser: form.value.superviser,
      address: form.value.address,
      door: form.value.door,
    })
  );
});

const getStor = () => {
  try {
    const result = uni.getStorageSync(TEMP_KEY);
    console.log("temp form", result);
    if (result) {
      const resultData = JSON.parse(result);
      if (resultData) {
        form.value = resultData;
      }
    }
  } catch (e) {
    console.debug(e);
  }
};

onShow(() => {
  getStor();
});
</script>

<template>
  <view class="content">
    <view class="form">
      <view class="form-item owner">
        <label for="owner">姓名</label>
        <input id="owner" type="text" v-model="form.name" />
      </view>
      <view class="form-item">
        <label for="superviser">监理</label>
        <input id="superviser" type="text" v-model="form.superviser" />
      </view>
      <view class="form-item">
        <label for="address">楼盘</label>
        <input id="address" type="text" v-model="form.address" />
      </view>
      <view class="form-item">
        <label for="door">房号</label>
        <input id="door" type="text" v-model="form.door" />
      </view>
    </view>

    <Items @submit="createPdf" class="items"></Items>

    <view class="tips">
      <text
        style="
          width: 100%;
          font-weight: bold;
          text-align: center;
          margin-bottom: 10rpx;
        "
      >
        检测声明
      </text>
      <text
        >经委托人委托，对于受检工程 (商品房)
        进行套内及部分公共部位进行查验。本报告内容均依
        据国家与地方相关法律法规，按照《房屋建筑工程质量保修管理办法》和《城市房地产开发经
        营管理条例》之要求：“施工单位应履行保修义务，对房屋建筑工程竣工验收后在保修期限内出
        现的质量缺陷，予以修复，且保修费用由质量缺陷的责任方承担”。本报告仅对验房师实体查验
        时房屋质量进行综合评价，并负责对房屋情况报告内容进行异议解释和说明，但不代表受委托
        人与建设单位、施工单位等第三方争议之影响或约束。特此声明。\n\n</text
      >
      <text
        style="
          width: 100%;
          font-weight: bold;
          text-align: center;
          margin-bottom: 10rpx;
        "
        >国家标准</text
      >
      <text>1) 住宅设计规范 GB50096-2011</text>
      <text>2) 住宅建筑规范 GB50368-2012</text>
      <text>3) 民用建筑设计统一标准 GB50352-2019</text>
      <text>4) 地下防水工程质量验收规范 GB50208-2011</text>
      <text>5) 混凝土结构工程质量验收规范 GB50204-2015</text>
      <text>6) 建筑工程地面施工质量验收规范 GB50209-2010</text>
      <text>7) 砌体工程施工质量验收规范 GB50203-2011</text>
      <text>8) 屋面工程质量验收规范 GB50207-2012</text>
      <text>9) 建筑装饰装修工程质量验收标准 GB50210-2018</text>
      <text>10) 建筑电气工程施工质量验收规范 GB50303-2015</text>
      <text>11) 建筑给排水工程质量验收规范 GB50242-2016</text>
      <text>12) 通风与空调工程质量验收规范 GB50243-2016</text>
      <text>13) 建筑设计防火规范 GB50016— 2018</text>
      <text>14) 高层民用建筑设计防火规范 GB50045-95-2015</text>
      <text>15) 建筑节能工程施工质量验收规范 GB50411-2019\n\n</text>

      <text
        style="
          width: 100%;
          font-weight: bold;
          text-align: center;
          margin-bottom: 10rpx;
        "
        >备注内容</text
      >
      <text>1) 室内灯具安装后，建议连续通电试验 8 小时，无故障为合格。</text>
      <text
        >2) 室内燃气开通后，建议地暖温度设定 25℃，持续开启 48
        小时，无故障为合格。</text
      >
      <text
        >3) 室内电路开通后，建议新风系统及空调系统不间断开启 24
        小时，无故障为合格。</text
      >
      <text
        >4)
        建议后期注意室内墙体出现的温度伸缩缝，雨后注意观察外墙、外窗渗水情况。</text
      >
      <text
        >注意：新房入住前，建议进行室内环境 (甲醛、甲苯、二甲苯、苯、TVOC)
        检测，装修材料或新购家具造成的室内空气污染，避免对家人身体健康造成伤害。\n\n</text
      >

      <text
        style="
          width: 100%;
          font-weight: bold;
          text-align: center;
          margin-bottom: 10rpx;
        "
        >主要内容说明分析</text
      >
      <text
        >1、建议查看：相关证件
        (参照《中华人民共和国消费者权益保护法》第二章第七条)
        查看依据：消费者有权要求经营者提供的商品和服务，符合保障人身、财产安全的要求。</text
      >
      <text
        >2、验收内容：地面镶贴 (参照标准：住宅装饰装修验收标准 DB 31/30-2003 第
        7.2.)
        验收标准：镶贴应牢固，表面平整干净，无漏贴错贴；缝隙均匀，周边顺直，砖面无裂纹，掉角、缺愣等现象，留边宽度应一致；地面镶贴间隙宽度≤2.0mm。</text
      >
      <text
        >3、检验内容：墙、地面砖铺贴 (参照标准：住宅工程套内质量验收规范
        J11493-2009 第 7.2.)
        验收标准：镶贴应牢固，无空鼓、脱落，小锤轻轻敲击，空鼓面积大于总数的
        5%或有脱落即为不合格，(单块空鼓面积小于该砖面积的 15%可不计)。
        (参照标准：住宅工程套内质量验收规范 J11493-2009 第7.2. )</text
      >
      <text
        >4、检测内容：门窗套 (参照标准：建筑装饰装修工程质量验收规范
        GB50210-2001 5.3.8)
        验收标准：金属门窗与墙体之间的缝隙应填嵌饱满，并采用密封胶密封，密封胶表面应光滑、顺直，无裂纹。</text
      >
      <text
        >5、验收内容：排水坡度(参照标准：建筑装饰装修工程质量验收规范
        GB50210-2001 5.3.8) 验收标准：地砖坡度≥2‰，无积水，满足排水需要。</text
      >
      <view class="gongzhang">
        <image
          src="https://www.simple-life-space.xyz/pdf-resource/default/gongzhnag.png"
        ></image>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;

  .form {
    padding: 20rpx;
    width: calc(100% - 40rpx);
    border-radius: 10rpx;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    padding-top: 50rpx;
    background-color: #f3fbff;
    // background-color: #a9ddfb;

    .form-item {
      display: flex;
      flex-direction: column;
      margin-bottom: 32rpx;
      padding-left: 20rpx;
      padding-right: 20rpx;
      width: calc(100% - 50rpx);

      label {
        width: 150rpx;
        font-size: 38rpx;
        color: #535353;
        font-weight: bold;
      }

      input {
        width: calc(100% - 10rpx);
        flex: 1;
        height: 60rpx;
        border-radius: 10rpx;
        font-size: 28rpx;
        padding-left: 10rpx;
        background-color: #efefef;
        margin-top: 10rpx;
      }
    }
  }
}

.items {
  width: 100%;
  margin-top: 32rpx;
}

.tips {
  position: relative;
  width: calc(100% - 40rpx);
  padding: 20rpx;
  font-size: 20rpx;
  color: #aaa;
  line-height: 1.8;
  text-align: justify;
  display: flex;
  flex-direction: column;
}

.gongzhang {
  width: 330rpx;
  height: 600rpx;
  float: right;
  position: absolute;
  right: 0;
  top: 0;
  image {
    width: 100%;
    height: 100%;
  }
}
</style>


