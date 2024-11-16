<script lang="ts" setup>
import { ref } from "vue";
import items, { numberToChinese } from "@/utils/items";

enum ResultType {
  good = 1,
  bad = 0,
  unknown = -1
}

const itemsList = ref(items.map(item => {
  return {
    desc: item.desc,
    results: item.items.map(it => ({
      result: ResultType.good,
      list: []
    }))
  }
}));

const titleGen = (item: string, idx: number) => {
  return `${idx + 1}.  ${item}`;
};

const titleGen2 = (item: string, idx: number) => {
  return `${numberToChinese(idx + 1)}.  ${item}`;
}

const resultsOptions = [
  { text: '合格', value: ResultType.good },
  { text: '不合格', value: ResultType.bad },
  { text: '不涉及', value: ResultType.unknown },
];

const submit = () => {
  console.log(itemsList.value);
}
</script>

<template>
  <text class="label">验收项目</text>
  <uni-collapse class="items" accordion>
    <uni-collapse-item 
      class="collapse-item"
      v-for="(item, i) in items"
      :key="i"
      :title="titleGen2(item.desc, i)"
    >
      <view class="content">
        <view class="item" v-for="(it, j) in item.items" :key="j">
          <text>{{ titleGen(it, j) }}</text>
          <view class="result">
            <label for="result">结果：</label>
				    <uni-data-checkbox v-model="itemsList[i].results[j].result" :localdata="resultsOptions"></uni-data-checkbox>
          </view>
        </view>
      </view>
    </uni-collapse-item>
  </uni-collapse>
  
  <button type="primary" class="submit-btn" @click="submit">生成pdf</button>
</template>

<style lang="scss" scoped>
.label {
  font-size: 40rpx;
  font-weight: bold;
  margin: 32rpx;
}
.items {
  width: 100%;
  .collapse-item {
    & :deep(text) {
      font-size: 38rpx;
      font-weight: bold;
    }
  }
  .content {
    width: calc(100% - 50rpx);
    display: flex;
    flex-direction: column;
    padding: 10rpx 25rpx;
    .item {
      display: flex;
      flex-direction: column;
      margin-bottom: 20rpx;
      text {
        width: 100%;
        font-size: 36rpx;
        color: #bbb;
      }
    }
    .result {
      display: flex;
      flex-direction: row;
      align-items: center;
      margin-top: 10rpx;
      padding-bottom: 10rpx;
      // border-bottom: 1rpx solid #ccc;
      label {
        font-size: 36rpx;
        color: #999;
      }
    }
  }
}


.submit-btn {
  width: calc(100% - 40rpx);
  height: 80rpx;
  font-size: 32rpx;
  margin: 20rpx;
}
</style>
