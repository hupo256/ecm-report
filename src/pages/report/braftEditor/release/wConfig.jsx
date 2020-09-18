
import { Modal, Form, Input, message } from 'antd'
import { uploadUrl } from '@/common/tools'
export const uploadConfig = {
  uploadImgServer: uploadUrl,
  uploadImgParams: { sourceType: 1 },
  uploadFileName: 'file',
  uploadImgHeaders: { 'Token': localStorage.getItem('token'), },
  uploadImgHooks: {
    success: function (xhr, editor, result) {
      message.success('图片上传成功！')
    },
    fail: function (xhr, editor, resultMsg) {
      const { code, msg } = resultMsg
      if (!code) {
        message.error(msg)
      }
    },
    error: function (xhr, editor) {
      message.error('图片上传失败！')
    },
    customInsert: function (insertImg, resultMsg, editor) {
      const { result: { fileUrl } } = resultMsg
      insertImg(fileUrl)
    }
  },

  zIndex: 9,
  pasteIgnoreImg: true,
}

export const menus = [
  'undo', // 撤销
  'redo', // 重复
  'head', // 标题
  'bold', // 粗体
  // 'fontSize', // 字号
  // 'fontName', // 字体
  'italic', // 斜体
  'underline', // 下划线
  'strikeThrough', // 删除线
  'foreColor', // 文字颜色
  // 'backColor', // 背景颜色
  'link', // 插入链接
  'list', // 列表
  // 'justify', // 对齐方式
  // 'quote', // 引用
  'image', // 插入图片
  // 'highline',  //高亮
  'audio',  //音频
  // 'video',  //音频
  // 'table', // 表格
  // 'video', // 插入视频
  'grass', //种草
  'tips',  //注释
]
export const colors = [
  '#424242',
  '#3C3FC9',
  '#FF4B4B',
]

export default { menus, colors, uploadConfig }
