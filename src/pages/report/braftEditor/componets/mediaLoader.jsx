import React, { useState, useContext } from 'react'
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { Modal, Form, Input, Upload, message, Button } from 'antd'
import { ContentUtils } from 'braft-utils'
import { ctx } from './context'
import { uploadUrl } from '@/common/tools'
const FormItem = Form.Item

export default function MediaLoader(props) {
  const [form] = Form.useForm()
  const { mdaLoader, setmdaLoader } = useContext(ctx)

  function touchMedia() {
    form.validateFields().then(values => {
      const { resoure, mainTitle, subtitle } = values
      const htm = `<div class="audiobox"><h4>${mainTitle}</h4><p>${subtitle || ''}</p><audio src="${resoure}" data-tit=${mainTitle} data-subtit=${subtitle} controls></audio></div>`
      props.editor.cmd.do('insertHTML', htm)
      setmdaLoader(false)
    })
  }

  const config = {
    name: 'file',
    action: uploadUrl,
    // accept: 'audio/mp3',
    accept: '.mp3, .wma, .wav, .amr, .m4a',
    headers: {
      token: localStorage.getItem('token'),
    },
    onChange(info) {
      console.log(info)
      const { status, response, name } = info.file
      if (status === 'done') {
        if (+response.code === 0) {
          message.success(`${name} 上传成功。`)
          console.log(response.result.fileUrl)
          form.setFieldsValue({
            mainTitle: name.split('.')[0],
            resoure: response.result.fileUrl
          })
        } else {
          message.error(`${name} 上传失败。`)
        }
      } else if (status === 'error') {
        message.error(`${name} 上传失败。`)
      }
    },
    beforeUpload(info) {
      const isLt1M = (info.size / 1024 / 1024 * 100) / 100 < 10
      if (!isLt1M) {
        message.error('图片大小不可大于 10M!')
      }
      return isLt1M
    }
  }

  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 17 },
  }

  return (
    <Modal
      destroyOnClose={true}
      title='插入音频'
      visible={mdaLoader}
      onCancel={() => setmdaLoader(false)}
      onOk={touchMedia}
    >
      <Form {...formItemLayout} form={form} preserve={false}>
        <FormItem label='插入音频' name="resoure"
          rules={[{ required: true, message: '请上传音频文件' }]}
        >
          <Upload {...config}>
            <Button icon={<UploadOutlined />}>点击上传</Button>
          </Upload>
          <p style={{margin:0, color: 'red'}}>*格式支持mp3、wma、wav、amr、m4a，文件大小不超过200M，音频时长不超过1小时</p>
        </FormItem>

        <FormItem label='标题' name="mainTitle"
          rules={[{ required: true, message: '请写入标题' }]}
        >
          <Input />
        </FormItem>

        <FormItem label='副标题' name="subtitle">
          <Input />
        </FormItem>
      </Form>
    </Modal>
  )
}