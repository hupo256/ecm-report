import React, { useState, useEffect } from 'react'
import { Modal, Form, Radio, Select, Button } from 'antd'
import Api from '../../service'
import {getStorage} from '@/common/tools'
import styles from '../braftbox.less'

const RadioGroup = Radio.Group
const FormItem = Form.Item
const Option = Select.Option

const rolArr = [{
  tex: '全部',val: '11'
}, {
  tex: '男',val: '10'
}, {
  tex: '女',val: '01'
}]
const ruleAgeArr = (function(){
  const month = [], year = []
  for(let i=0; i<36; i++){
    month.push(`${i}月`)
  }
  for(let i=3; i<121; i++){
    year.push(`${i}岁`)
  }
  return [...month, ...year]
})()

export default function RoleRuleModal(props) {
  const [form] = Form.useForm()
  const {doRule, setdoRule, touchRuleList, currentRule} = props
  const [maxAge, setmaxAge] = useState([])
  const [ruleConclusion, setruleConclusion] = useState([])
  const [btnLoading, setbtnLoading] = useState(false)

  useEffect(() => {
    const { definitionId, id } = getStorage('record')
    Api.traitConcDisplayRelation({traitId: definitionId || id}).then(res=>{
      if(!res) return
      setruleConclusion(res)
      if(currentRule) {
        sageChange(currentRule.ruleAgeMin)
        form.setFieldsValue(currentRule)
      }
    })
  }, [])

  function touchTheRule() {
    form.validateFields().then(values => {
      console.log(values)
      setbtnLoading(true)
      const { definitionId, id } = getStorage('record')
      const prams = { ...currentRule, traitId:definitionId || id, ...values}
      Api.uptTraitRule(prams).then(res=>{
        if(!res) return
        touchRuleList(res)
      })
    })
  }

  function sageChange(val){
    const ind = ruleAgeArr.indexOf(val)
    setmaxAge([])
    setTimeout(() => {
      setmaxAge(ruleAgeArr.slice(ind+1))
    },400)
  }

  function transtoNum(str){
    const unit = str.slice(-1)
    const num = +str.split(unit)[0]
    if(unit === '月') {
      return +num
    }else{
      return (+num)*12
    }
  }

  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  }

  return (
    <Modal
      destroyOnClose={true}
      title='新增/编辑人群'
      visible={doRule}
      maskClosable={false}
      onCancel={() => setdoRule(!doRule)}
      onOk={touchTheRule}
      footer={[
        <Button key="cancel" onClick={() => setdoRule(!doRule)}>取消</Button>,
        <Button key="ok" onClick={touchTheRule} type="primary" loading={btnLoading}>确定</Button>,
      ]}
    >
      <Form {...formItemLayout} form={form} preserve={false}>
        <FormItem
          label='性别'
          name="ruleGender"
          rules={[{ required: true, message: '请选择性别' }]}
        >
          <RadioGroup>
            {rolArr.map((item, index) => {
              const { tex, val } = item
              return <Radio key={index} value={val}>{tex}</Radio>
            })}
          </RadioGroup>
        </FormItem>

        <FormItem
          label='检测结果'
          name="ruleConclusions"
          rules={[{ required: true, message: '请选检测结果' }]}
        >
          <Select
            mode="multiple"
            showArrow={true}
            placeholder='请选择检测结果'
            style={{ width: '70%' }}
          >
            {ruleConclusion.map((item, ind) => 
              <Option value={item} key={ind}>{item}</Option>
            )}
          </Select>
        </FormItem>

        <FormItem>
          <label style={{display:'inline-block',width:'30%',marginRight:'10px',textAlign:'right'}}> 
            <span style={{color:'red'}}>* </span>年龄: 
          </label>
          <FormItem 
            name='ruleAgeMin'
            rules={[{ required: true, message: '请选年龄范围'}]}
            style={{ display:'inline-block',width:'29%',marginRight:'10px'}}
          >
            <Select placeholder='请选择' onChange={val => sageChange(val)}>
              {ruleAgeArr.map((opt, ind) => 
                <Option key={ind} value={opt}>{opt}</Option>
              )}
            </Select>
          </FormItem>
          -
          <FormItem 
            name='ruleAgeMax'
            rules={[
              { required: true, message: '请选年龄范围'},
              ({ getFieldsValue }) => ({
                validator(rule, value) {
                  const {ruleAgeMin, ruleAgeMax} = getFieldsValue()
                  const min = transtoNum(ruleAgeMin)
                  const max = transtoNum(ruleAgeMax)
                  if(min <= max) {
                    return Promise.resolve();
                  }
                  return Promise.reject('年龄选择有误');
                },
              }),
            ]}
            style={{display:'inline-block',width: '29%',marginLeft:'10px'}}
          >
            <Select placeholder='请选择' disabled={!maxAge.length && !currentRule}>
              {maxAge.map((opt, ind) => 
                <Option key={ind} value={opt}>{opt}</Option>
              )}
            </Select>
          </FormItem>
        </FormItem>
      </Form>
    </Modal>
  )
}