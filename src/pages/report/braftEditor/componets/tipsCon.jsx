import React, { useState, useEffect, useContext } from 'react'
import { Modal, Form, Input, message } from 'antd'
import annimg from '@/assets/images/annotation.png'
import { ctx } from './context'
const FormItem = Form.Item

export default function TipsCon(props) {
  const [form] = Form.useForm()
  const { tipsCon, settipsCon, currTips, setcurrTips } = useContext(ctx)
  const {tipsTit='', tipsInfor=''} = currTips || {}

  useEffect(() => {
    form.setFieldsValue(currTips)
  }, [])
  
  function touchTips() {
    form.validateFields().then(values => {
      console.log(values)
      const {tipsTit, tipsInfor} = values
      const htm = `<a class="tipsCon" href="#" data-tips-infor="${tipsInfor}">${tipsTit || ''}<img src=${annimg} height="18px"/></a><span>&#8203;</span>`
      if(currTips && currTips.tipsInfor){
        const dom = props.editor.selection.getSelectionContainerElem()[0]
        dom.dataset.tipsInfor = tipsInfor
      }else{
        props.editor.cmd.do('insertHTML', htm)
      }
      settipsCon(!tipsCon)
      setcurrTips(null)
    })
  }

  function cancelHandle(){
    settipsCon(!tipsCon)
    setcurrTips(null)
  }

  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 17 },
  }

  return (
    <Modal
      destroyOnClose={true}
      title='插入注释'
      visible={tipsCon}
      onCancel={cancelHandle}
      onOk={touchTips}
    >
      <Form {...formItemLayout} form={form} preserve={false}>
        <FormItem
          label='注释文本'
          name="tipsTit"
        >
          <Input disabled={tipsInfor} placeholder={`${tipsInfor ? '' : '输入注释文本'}`} />
        </FormItem>

        <FormItem
          label='注释内容'
          name="tipsInfor"
          rules={[{ required: true, message: '请输入注释内容' }]}
        >
          <textarea rows="3" style={{width: '100%', borderColor: '#ccc'}} />
        </FormItem>
      </Form>
    </Modal>
  )
}