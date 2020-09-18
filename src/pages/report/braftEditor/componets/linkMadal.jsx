import React, { useState, useEffect, useContext } from 'react'
import { Modal, Form, Input, message } from 'antd'
import annimg from '@/assets/images/annotation.png'
import { ctx } from './context'
const FormItem = Form.Item

export default function TipsCon(props) {
  const [form] = Form.useForm()
  const {linkCon, setlinkCon, currLink, setcurrLink, imgTag, setimgTag} = useContext(ctx)
  const {linkTex='', link=''} = currLink || {}

  useEffect(() => {
    form.setFieldsValue(currLink)
  }, [])
  
  function touchLink() {
    form.validateFields().then(values => {
      console.log(values)
      const {link, linkTex} = values
      const imgDom = imgTag ? `<img class="linkImg" src="${imgTag.src}" style="max-width:100%;" />` : ''
      const tex = imgDom || linkTex || link
      const htm = `<a class="linkUrl" href=${link}>${tex}</a>`
      // const htm = `<a class="linkUrl" href=${link}>${tex}</a><span>&#8203;</span>`
      if(currLink && currLink.link){
        const dom = props.editor.selection.getSelectionContainerElem()[0]
        dom.href = link
      }else{
        props.editor.cmd.do('insertHTML', htm)
      }
      setlinkCon(!linkCon)
      setcurrLink(null)
      setimgTag(null)
    })
  }

  function cancelHandle(){
    setlinkCon(!linkCon)
    setcurrLink(null)
    setimgTag(null)
  }

  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 17 },
  }

  return (
    <Modal
      destroyOnClose={true}
      title='插入链接'
      visible={linkCon}
      onCancel={cancelHandle}
      onOk={touchLink}
    >
      <Form {...formItemLayout} form={form} preserve={false}>
        <FormItem
          label='链接文本'
          name="linkTex"
        >
          <Input disabled={linkTex || imgTag} placeholder={`${imgTag? '已选中内容' : '输入链接文本'}`} />
        </FormItem>

        <FormItem
          label='链接地址'
          name="link"
          rules={[{ required: true, message: '请输入链接地址' }]}
        >
          <Input placeholder='输入链接地址' />
        </FormItem>
      </Form>
    </Modal>
  )
}