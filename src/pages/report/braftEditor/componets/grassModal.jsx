import React, { useEffect, useState, useContext } from 'react'
import { Modal, Form, Input, Radio, Row, Select, message, Button } from 'antd'
import { ctx } from './context'
import { ContentUtils } from 'braft-utils'
import Api from '../../service'
const RadioGroup = Radio.Group
const FormItem = Form.Item
const Option = Select.Option
const grassTit = ['检测项（当前检测人）', '商品（当前检测人）', '商品（新购）']

export default function GrassModal(props) {
  const [form] = Form.useForm()
  const { currGrass, setcurrGrass, visible, setvisible } = useContext(ctx)
  const [grassFlag, setgrassFlag] = useState(NaN)
  const [chooseObj, setchooseObj] = useState({})
  const [typeList, settypeList] = useState([])
  const [btnLoading, setbtnLoading] = useState(false)

  useEffect(() => {
    const { grassFlag, replaceDoc = '', itemId } = currGrass || {}
    if (grassFlag) {
      Api.productTraitList({ recType: grassFlag }).then(res => {
        if (res.code) return
        settypeList(res)
        setchooseObj(() => res.filter(e => e.displayName === itemId)[0])
      })
    }
    setgrassFlag(grassFlag)
    form.setFieldsValue(currGrass)
  }, [])

  function handleConfirm() {
    form.validateFields().then(values => {
      // console.log(values)
      setbtnLoading(true)
      const { grassFlag, replaceDoc } = values
      Api.productTraitRule({
        id: currGrass ? currGrass.gid : '',
        moduleTitle: localStorage.moduleContentTitle || '',
        sourceTraitId: localStorage.traitId || '',  // 检测项id
        recProductCode: chooseObj.productCode,
        recTraitId: chooseObj.traitId,
        recType: grassFlag,
        replaceDoc,
      }).then(res => {
        if(!res) return
        const tex = replaceDoc || res.displayDoc
        const htm = `<a class="grassTag grassTag_${res.id}" href="#">${tex}</a><rec></rec>`
        // const htm = `<rec class="grassTag grassTag_${res.id}">${tex}</rec><span>&#8203;</span>`
        console.log(htm)
        if(currGrass && currGrass.gid){
          const rec = props.editor.selection.getSelectionContainerElem()[0]
          rec.innerHTML = tex
        }else{
          props.editor.cmd.do('insertHTML', htm)
        }
        setvisible(!visible)
        setcurrGrass(null)
      })
    })
  }

  function chooseThis(val) {
    setchooseObj(typeList[val])
  }

  function modalCancel(e) {
    e.stopPropagation()
    setvisible(!visible)
    setcurrGrass(null)
  }

  function touchGrassFlag(e) {
    const val = e.target.value
    settypeList([])
    setgrassFlag(val)
    Api.productTraitList({ recType: val }).then(res => {
      res.code || settypeList(res)
    })
  }

  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  }

  return (
    <React.Fragment>
      <Modal
        title='检测项/商品种草'
        visible={visible}
        onCancel={(e) => modalCancel(e)}
        onOk={handleConfirm}
        footer={[
          <Button key="cancel" onClick={(e) => modalCancel(e)}>取消</Button>,
          <Button key="ok" onClick={handleConfirm} type="primary" loading={btnLoading}>确定</Button>,
        ]}
      >
        <Form {...formItemLayout} form={form} preserve={false}>
          <FormItem
            label='添加种草'
            name="grassFlag"
            rules={[{ required: true, message: '请选择种草规则' }]}
          >
            <RadioGroup onChange={e => touchGrassFlag(e)}>
              {grassTit.map((tit, index) => {
                const val = index + 1
                return <Row key={index}>
                  <Radio value={val}>{tit}</Radio>
                  {grassFlag === val &&
                    <FormItem
                      name="itemId"
                      rules={[{ required: true, message: '请添加种草的检测项/商品' }]}
                      style={{ width: '100%' }}
                    >
                      <Select
                        onClick={e => e.stopPropagation()}
                        placeholder={'请选择'}
                        allowClear
                        showSearch
                        optionFilterProp='children'
                        filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                        onChange={value => chooseThis(value)}
                        style={{width: '100%'}}
                      >
                        {typeList.length > 0 && typeList.map((item, ind) => (
                          <Option value={ind} key={ind}>{item.displayName}</Option>
                        ))}
                      </Select>
                    </FormItem>
                  }
                </Row>
              })}
            </RadioGroup>
          </FormItem>
          <FormItem label='替换文案' name="replaceDoc">
            <Input placeholder='请输入' />
          </FormItem>
        </Form>
      </Modal>
    </React.Fragment >
  )
}