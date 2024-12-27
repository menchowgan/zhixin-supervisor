<script setup lang="ts">
import { ref } from "vue";
const emits = defineEmits(["close", "confirm"]);
const onClose = () => {
  emits("close");
};

const photoSaver = (tempImagePath: string) => {
  return () => {
    uni.saveImageToPhotosAlbum({
      filePath: tempImagePath,
      success() {
        console.log("save success");
      },
    });
  };
};

let saver: (() => void) | null = null;

const taking = ref(false);
const src = ref("");
const takePhoto = () => {
  const ctx = uni.createCameraContext();
  ctx.takePhoto({
    quality: "normal",
    success: (res) => {
      saver = photoSaver(res.tempImagePath);
      uni.uploadFile({
        url: "https://www.simple-life-space.xyz/pdf-images",
        filePath: res.tempImagePath,
        name: "file",
        formData: {
          userId: "123",
        },
        success: function (r) {
          if (r.statusCode === 200) {
            const data = JSON.parse(r.data);
            src.value =
              "https://www.simple-life-space.xyz/pdf-resource/" + data.data;
            taking.value = true;
          } else {
            console.log("上传失败", r);
            photoTempSaver(res.tempImagePath);
          }
        },
        fail: function (err) {
          console.log("上传失败", JSON.stringify(err));
          photoTempSaver(res.tempImagePath);
        },
      });
    },
  });
};

// 上传失败时直接使用base64数据
const photoTempSaver = (tempImagePath) => {
  const fileSystemManager = uni.getFileSystemManager();
  fileSystemManager.readFile({
    filePath: tempImagePath, // 图片路径
    encoding: "base64", // 编码格式为base64
    success: (readFileRes) => {
      // 成功获取base64字符串
      const base64Data = readFileRes.data;
      // 将拿到的base64给img标签的src属性
      src.value = "data:image/jpeg;base64," + base64Data;
      taking.value = true;
    },
    fail: (error) => {
      console.error("读取文件失败:", error);
    },
  });
};

const onCancel = () => {
  taking.value = false;
  src.value = "";
};

const error = () => {
  taking.value = false;
};

const onConfirm = () => {
  if (saver) {
    saver();
    saver = null;
  }
  const url = src.value;
  taking.value = false;
  src.value = "";
  emits("confirm", url);
};
</script>

<template>
  <view class="take-photo">
    <view
      class="close-btn"
      @click="
        () => {
          if (taking && src) {
            onCancel();
          }
        }
      "
    >
      <image
        v-if="!taking"
        src="https://www.simple-life-space.xyz/pdf-resource/default/Close.svg"
        @click="onClose"
      ></image>
      <test
        style="
          color: white;
          margin-right: 30rpx;
          margin-top: 30rpx;
          font-weight: bold;
        "
        v-else
        >取消</test
      >
    </view>
    <template v-if="!taking">
      <camera
        class="camera"
        device-position="back"
        flash="off"
        @error="error"
        style="width: 100%; height: 100vh"
      ></camera>
      <view class="taken-photo" @click="takePhoto">
        <view class="taken-photo-child"></view>
      </view>
    </template>
    <image class="preview" v-if="taking" mode="widthFix" :src="src"></image>
    <view v-if="taking" class="confirm">
      <button type="primary" @click="onConfirm">确定</button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.take-photo {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  // justify-content: center;
  align-items: center;
  z-index: 999;

  .close-btn {
    width: 100%;
    height: 100rpx;
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    padding: 20rpx;
    position: absolute;
    top: 0;
    right: 0;
    z-index: 999;
    image {
      width: 50rpx;
      height: 50rpx;
      margin-right: 20rpx;
    }
  }

  .camera {
    width: 100%;
    height: 100vh;
    position: absolute;
    top: 0;
    left: 0;
  }

  .preview {
    width: 100%;
    height: 100vh;
    position: absolute;
    top: 0;
    left: 0;
  }

  .confirm {
    width: 100%;
    height: 250rpx;
    position: absolute;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    font-size: 30rpx;
    button {
      width: 250rpx;
      height: 80rpx;
      border-radius: 10rpx;
    }
  }

  .taken-photo {
    width: 120rpx;
    height: 120rpx;
    position: absolute;
    bottom: 100rpx;
    left: 50%;
    transform: translateX(-50%);
    z-index: 999;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background-color: #fff;
    .taken-photo-child {
      width: 100rpx;
      height: 100rpx;
      border-radius: 50%;
      background-color: #fff;
      border: 1px solid #ccc;
    }
  }
}
</style>
