import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Modal, Form, Input, message } from 'antd'
import Api from '@/common/api'
import DataTable from '@/components/data-table'
import TextArea from 'antd/lib/input/TextArea'
import E from 'wangeditor'
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
          // <div ref='editorElem' id='editor' />
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
            }, () => {
              console.log(this.state.hmexpertResp)
              // 编辑器
              this.state.hmexpertResp[0].tagConclusionRespList.map((v, i) => {
                const editor = new E(document.getElementById(`editorElem${i + 1}`))
                editor.customConfig = {
                  menus: [
                    'head', // 标题
                    'bold', // 粗体
                    'fontSize', // 字号
                    'fontName', // 字体
                    'italic', // 斜体
                    'underline', // 下划线
                    'strikeThrough', // 删除线
                    'foreColor', // 文字颜色
                    'backColor', // 背景颜色
                    'link', // 插入链接
                    'list', // 列表
                    'justify', // 对齐方式
                    'quote', // 引用
                    'image', // 插入图片
                    'table', // 表格
                    'video', // 插入视频
                    'undo', // 撤销
                    'redo' // 重复
                  ],
                  uploadImgServer: uploadUrl,
                  uploadImgParams: {
                    sourceType: 1
                  },
                  uploadFileName: 'file',
                  uploadImgHeaders: {
                    'Token': getStore('token')
                  },
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
                  customAlert: function (xhr, editor, result) {
                  },
                  onchange: (html) => {
                    v.conclusionValueDisplay = this.removeWordXml(html)
                  }
                }
                editor.customConfig.colors = [
                  '#88889D',
                  '#333333',
                  '#666666',
                  '#000000',
                  '#eeece0',
                  '#1c487f',
                  '#4d80bf',
                  '#c24f4a',
                  '#8baa4a',
                  '#7b5ba1',
                  '#46acc8',
                  '#f9963b',
                ]
                editor.create()
                document.getElementById(`editorElem${i + 1}`).style.height = 'auto'
                document.getElementsByClassName('w-e-text-container')[i].style.height = 'auto'
                editor.txt.html(v.conclusionValueDisplay)
              })
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
                          <p className={styles.contentStyle} style={{ float:'right', width:'992px' }} ref={`editorElem${index + 1}`} id={`editorElem${index + 1}`} />
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
