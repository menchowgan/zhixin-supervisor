<script lang="ts" setup>
import { onHide, onShow } from "@dcloudio/uni-app";
import { ref, nextTick } from "vue";
import items, { numberToChinese } from "@/utils/items";
import TakePhoto from "./TakePhoto.vue";

const emits = defineEmits(["submit"]);

const TEMP_KEY = "tempary_data_items";
const getStor = () => {
  try {
    const result = uni.getStorageSync(TEMP_KEY);
    console.log("temp data", result);
    if (result) {
      const resultData = JSON.parse(result);
      if (resultData) {
        itemsList.value = resultData;
      }
    }
  } catch (e) {
    console.error(e);
  }
};

onHide(() => {
  uni.setStorageSync(TEMP_KEY, JSON.stringify(itemsList.value));
});

onShow(() => {
  getStor();
});

const itemsList = ref<
  {
    desc: string;
    results: {
      url: string;
      comments: string;
      isBad: boolean;
    }[];
  }[]
>(
  items.map((item) => {
    return {
      desc: item.desc,
      results: [],
    };
  })
);

const titleGen2 = (item: string, idx: number) => {
  return `${numberToChinese(idx + 1)}  ${item}`;
};

const submit = () => {
  const resultMap: {
    desc: string;
    results: {
      url: string;
      comments: string;
      isBad: boolean;
    }[];
  }[] = [];
  for (let i = 0; i < itemsList.value.length; i++) {
    const item = itemsList.value[i];
    if (item.results.length === 0) {
      continue;
    }
    const itemNo = numberToChinese(i + 1);
    const m: {
      desc: string;
      length: number;
      results: {
        url: string;
        comments: string;
        isBad: boolean;
      }[];
    } = {
      desc: item.desc,
      results: [],
      length: 0,
    };
    for (let j = 0; j < item.results.length; j++) {
      const result = item.results[j];
      if (result.url === "") {
        uni.showToast({
          title: `不合格项(第${itemNo}项第${j + 1}条) 必须添加照片`,
          icon: "none",
        });
        return;
      }
      m.results.push({
        url: result.url,
        comments: result.comments,
        isBad: result.isBad,
      });
    }
    if (m.results.length > 0) {
      m.length = m.results.length;
      resultMap.push(m);
    }
  }
  emits("submit", resultMap);
};

const openTakePhoto = ref(false);
const closePhoto = () => {
  openTakePhoto.value = false;
};

const collapse = ref(null);
const addComments = (i: number) => {
  itemsList.value[i].results.push({
    url: "",
    comments: "",
    isBad: false,
  });
  nextTick(() => {
    (collapse.value as any)?.resize();
  });
};

let cur: any = null;
const toTake = (v: any) => {
  cur = v;
  openTakePhoto.value = true;
};

const onTakePhotoConfirm = (url: string) => {
  if (cur) {
    cur.url = url;
  }
  closePhoto();
  cur = null;
};

const onDelete = (i: number, j: number) => {
  uni.showModal({
    title: "提示",
    content: "确定删除吗？",
    success: function (res) {
      if (res.confirm) {
        itemsList.value[i].results.splice(j, 1);
        nextTick(() => {
          (collapse.value as any)?.resize();
        });
      } else if (res.cancel) {
        console.debug("用户点击取消");
      }
    },
  });
};

const previewSrc = ref("");
const previewPhoto = (url: string) => {
  previewSrc.value = url;
};
</script>

<template>
  <uni-collapse class="items" ref="collapse">
    <uni-collapse-item
      class="collapse-item"
      v-for="(item, i) in itemsList"
      :key="i"
      :title="titleGen2(item.desc, i)"
      open
    >
      <view class="comments">
        <view class="add-comments-title">
          <image
            src="https://www.simple-life-space.xyz/pdf-resource/default/down.svg"
            mode="aspectFit"
          ></image>
          <label
            style="color: #f56c6c; font-size: 32rpx"
            @click="() => addComments(i)"
            >点击添加照片和描述</label
          >
        </view>
        <template v-if="item.results.length > 0">
          <uni-card
            v-for="(v, j) in item.results"
            :key="j"
            :is-shadow="false"
            class="card"
          >
            <view class="card-content">
              <image
                v-if="v.url"
                :src="v.url"
                mode="aspectFit"
                @click="() => previewPhoto(v.url)"
              ></image>
              <image
                v-else
                src="https://www.simple-life-space.xyz/pdf-resource/default/add.svg"
                mode="aspectFit"
                @click="() => toTake(v)"
              ></image>
              <view
                style="
                  flex: 1;
                  height: 100%;
                  display: flex;
                  flex-direction: column;
                "
              >
                <textarea
                  class="textarea"
                  placeholder="请输入描述"
                  v-model="v.comments"
                ></textarea>
                <view>
                  <text style="font-size: 24rpx; color: #f56c6c">
                    是否严重
                  </text>
                  <switch
                    :checked="v.isBad"
                    @change="(e) => v.isBad = (e as any).detail.value"
                    color="#f56c6c"
                    style="transform: scale(0.6)"
                  />
                </view>
              </view>
              <image
                class="delete"
                src="https://www.simple-life-space.xyz/pdf-resource/default/delete.svg"
                mode="aspectFit"
                @click="() => onDelete(i, j)"
              ></image>
            </view>
          </uni-card>
        </template>
      </view>
    </uni-collapse-item>

    <TakePhoto
      v-if="openTakePhoto"
      @close="closePhoto"
      @confirm="onTakePhotoConfirm"
    />
  </uni-collapse>
  <image
    v-if="previewSrc"
    :src="previewSrc"
    class="photo-preview"
    @click="() => (previewSrc = '')"
  ></image>
  <button type="primary" class="submit-btn" @click="submit">生成pdf</button>
</template>

<style lang="scss" scoped>
.items {
  width: 100%;
  .collapse-item {
    overflow: scroll;
    height: auto;
    & :deep(text) {
      font-size: 38rpx;
      font-weight: bold;
    }
  }
  .comments {
    width: calc(100% - 20rpx);
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 10rpx;
    .add-comments-title {
      width: 90%;
      display: flex;
      flex-direction: row;
      align-items: center;
      image {
        width: 40rpx;
        height: 40rpx;
        margin-right: 10rpx;
      }
    }
    label {
      margin-top: 0;
    }
    .card {
      width: 100%;
      padding-left: 0;
      padding-right: 0;
      .card-content {
        width: 100%;
        height: 120rpx;
        display: flex;
        flex-direction: row;
        align-items: center;
        image {
          width: 100rpx;
          height: 100rpx;
          margin-right: 20rpx;
          border: 1rpx solid #ccc;
          object-fit: cover;
        }
        .delete {
          width: 40rpx;
          height: 40rpx;
          margin-left: 20rpx;
          border: none;
        }
        .textarea {
          width: 100%;
          min-height: 64rpx;
          padding: 10rpx;
        }
      }
    }
  }
  .content {
    width: calc(100% - 50rpx);
    display: flex;
    flex-direction: column;
    padding: 10rpx 25rpx;
    overflow: scroll;
    height: auto;

    .result {
      display: flex;
      flex-direction: row;
      align-items: center;
      margin-top: 10rpx;
      padding-bottom: 10rpx;
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

.photo-preview {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
}
</style>
