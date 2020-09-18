import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Modal, Form, Input, message } from 'antd'
import Api from '@/common/api'
import DataTable from '@/components/data-table'
import TextArea from 'antd/lib/input/TextArea'
import BraftEditor from '@/routes/braftEditor/home.jsx'
import config from '@/common/utils/config'
import { getStore } from '@/common/utils/localstore'
import styles from './scientific.scss'
const confirm = Modal.confirm
const uploadUrl = `${config.host}source/importContent`

class ScientificTextModalForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      imgArr1:[],
      imgArr2:[],
      editInfo:{},
      scientificArr:[],
      lrresp:[],
      hmexpertResp:[], // 专家解读
      arr:[],
    }
    this.columns = [
      {
        title: 'value',
        width:180,
        render: (record, index) => (
          <Input defaultValue={record.conclusionValue} style={{ textAlign:'center' }}
            onChange={(e) => { record.conclusionValue = e.target.value }} />
        )
      },
      {
        title: 'value_display',
        render: (record, index) => (
          <TextArea defaultValue={record.conclusionValueDisplay}
            autosize={{ minRows: 1, maxRows: 20 }}
            onChange={(e) => { record.conclusionValueDisplay = e.target.value }} />
        )
      }
    ],
    this.columns2 = [
      {
        title: 'value',
        width:180,
        render: (record, index) => (
          <Input defaultValue={record.lrTitle} style={{ textAlign:'center' }}
            onChange={(e) => { record.lrTitle = e.target.value }} />
        )
      },
      {
        title: 'value_display',
        render: (record, index) => (
          <TextArea defaultValue={record.lrValue}
            autosize={{ minRows: 1, maxRows: 20 }}
            onChange={(e) => { record.lrValue = e.target.value }} />
        )
      },
    ]
  }
  componentDidMount () {
    this.getTraitDocContent()
  }
  getTraitDocContent=() => {
    const { lookText } = this.props
    const { scientificArr } = this.state
    let params = {
      applicableU :lookText.applicableU,
      channelCode:lookText.channelCode,
      displayType:lookText.displayType,
      theme:lookText.theme,
      traitCode:lookText.traitCode,
    }
    Api.getTraitDocContent(params)
      .then(res => {
        if (res) {
          if (res.lrresp !== null) {
            let arr = []
            arr.push(res.lrresp)
            this.setState({
              lrresp:Object.assign([], arr),
            }, () => {
              console.log(this.state.lrresp)
            })
          }
          for (let key in res) {
            if (typeof (res[key]) === 'object' && res[key] !== null && key !== 'lrresp' && key !== 'hmexpertResp') {
              scientificArr.push(res[key])
            }
          }
          if (res.hmexpertResp !== null) {
            let arr = []
            arr.push(res.hmexpertResp)
            this.setState({
              hmexpertResp:Object.assign([], arr),
            })
          }
          scientificArr.map(item => {
            item.tagConclusionRespList.map((v, i) => {
              if (v === null) {
                item.tagConclusionRespList.splice(i, 1)
              }
            })
          })
          console.log(scientificArr)
          this.setState({
            editInfo:Object.assign({}, res),
            scientificArr
          }, () => {
            console.log(this.state.scientificArr)
          })
        }
      })
  }
  removeWordXml (text) {
    var html = text
    html = html.replace(/<\/?SPANYES[^>]*>/gi, '')//  Remove  all  SPAN  tags
    html = html.replace(/<(\w[^>]*) {2}lang=([^|>]*)([^>]*)/gi, '<$1$3')//  Remove  Lang  attributes
    html = html.replace(/<\\?\?xml[^>]*>/gi, '')//  Remove  XML  elements  and  declarations
    html = html.replace(/<\/?\w+:[^>]*>/gi, '')//  Remove  Tags  with  XML  namespace  declarations:  <o:p></o:p>
    html = html.replace(/&nbsp;/, '')//  Replace  the  &nbsp;
    html = html.replace(/\n(\n)*( )*(\n)*\n/gi, '\n')
    html = html.replace(/spanyes'/g, 'span style="')
    html = html.replace(/<b>/g, '') // 去掉 <b>标签</b>
    html = html.replace(/<u>/g, '') // 去掉 <u>标签</u>
    html = html.replace(/class="/g, `class="aaaaa`)
    return html
  }
  handleCancel = (e) => {
    this.props.onCancel()
  }
  handleConfirm=(e) => {
    const { scientificArr, editInfo } = this.state
    let _this = this
    console.log(scientificArr)
    scientificArr.map(item => {
      for (let key in editInfo) {
        if (editInfo[key] !== null) {
          if (item.tagId === editInfo[key].tagId) {
            editInfo[key] = item
          }
        }
      }
    })
    console.log(editInfo)
    confirm({
      title: '确定要执行此操作吗？',
      content: '编辑的内容将应用到所有用到该检测项的报告，请再次确认是否提交修改。',
      onOk () {
        Api.editTraitDocContent(editInfo).then(res => {
          if (res) {
            message.success('操作成功！')
            _this.handleCancel()
            _this.props.onLoadData()
          }
        })
      }
    })
  }
  render () {
    const { editInfo, scientificArr, lrresp, hmexpertResp } = this.state
    const { visible } = this.props
    return (
      <div>
        <Modal
          visible={visible}
          maskClosable={false}
          onCancel={this.handleCancel}
          onOk={this.handleConfirm}
          width={1220}
          title={'科学文案'}
        >
          <div>
            <div style={{ clear:'both' }} />
            {
              scientificArr.length
                ? <div>
                  <p>doc内检测项名称：{editInfo.traitName}</p>
                  <p>doc内检测项描述：{editInfo.traitDesc}</p>
                </div>
                : <div>暂无科学文案</div>
            }
            {
              scientificArr.length
                ? scientificArr.map((item, i) => (
                  <div key={i} style={{ clear:'both' }}>
                    <h3>
                      {item.tagTitle}
                    </h3>
                    {
                      <DataTable style={{ padding:'0px', marginBottom:'25px' }}
                        rowKey='id'
                        columns={this.columns}
                        list={item.tagConclusionRespList}
                        pagination={false}
                      />
                    }
                  </div>
                ))
                : null
            }
            {
              hmexpertResp.length
                ? <div style={{ marginBottom:'20px', float:'left' }}>
                  <h3>专家解读</h3>
                  <p style={{ height:'54px', border:'1px solid #e8e8e8', background:'#fafafa', marginBottom:'0' }}>
                    <span style={{ display:'inline-block', width:'180px', padding:'16px', color:'rgba(0,0,0,.85)', fontWeight:'500', borderRight:'1px solid #e8e8e8' }}>value</span>
                    <span style={{ display:'inline-block', padding:'16px', color:'rgba(0,0,0,.85)', fontWeight:'500' }}>value_display</span>
                  </p>
                  <div>
                    {
                      hmexpertResp[0].tagConclusionRespList.map((v, index) => (
                        <div key={index} style={{ width:'1172px', float:'left', border:'1px solid #e8e8e8', borderTop:'0', borderRight:'0' }}>
                          <Input
                            style={{ textAlign:'center', flaot:'left', width:'147px', margin:'16px' }}
                            defaultValue={v.conclusionValue}
                            onChange={(e) => { v.conclusionValue = e.target.value }} />

                          <div style={{ float:'right', width:'992px' }}>
                            <BraftEditor
                              texContent={v.conclusionValueDisplay}
                              changeHtml={val => this.editorChange(val, index)}
                            />
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
                : null
            }
            {
              lrresp.length
                ? <div style={{ clear:'both' }}>
                  <h3>科学文献</h3>
                  <DataTable style={{ padding:'0px', marginBottom:'25px' }}
                    rowKey='id'
                    columns={this.columns2}
                    list={lrresp}
                    pagination={false}
                  />
                </div>
                : null
            }
            {
              scientificArr.length
                ? <div>
                  <h3>检测的基因</h3>
                  <p>备注：JUMBO内取值</p>
                </div>
                : null
            }
          </div>
        </Modal>
      </div>
    )
  }
}

ScientificTextModalForm.propTypes = {
  onCancel: PropTypes.func,
  visible: PropTypes.bool,
  onLoadData: PropTypes.func,
  lookText:PropTypes.object,
}

const ScientificTextModal = Form.create()(ScientificTextModalForm)

export default ScientificTextModal
