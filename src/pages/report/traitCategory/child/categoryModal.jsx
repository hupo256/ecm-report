import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Modal, Form, Input, Row, Col, message, Upload, Icon, Select, InputNumber } from 'antd'
import Api from '@/common/api'
import config from '@/common/utils/config'
import Thumbnail from '../../thumbnail'
import E from 'wangeditor'
import { getStore } from '@/common/utils/localstore'
import styles from '../../newPage/child/textEdit.scss'
const { TextArea } = Input
const Option = Select.Option
const uploadUrl = config.host + 'product/imageUpload'
const FormItem = Form.Item
const uploadUrl2 = `${config.host}source/importContent`

class CategoryModalForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      imgArr4:[],
      imgArr5:[],
      reportList:[],
      editInfo:{},
      editorContent:'',
      adviseId:''
    }
  }
  componentDidMount () {
    const { isEdit, pageType } = this.props
    if (pageType === 1) {
      this.getReportUserReport()
      if (isEdit) {
        this.getReportTraitCategoryById()
      } else {
        this.setState({
          editInfo:{}
        })
      }
    } else {
      Api.getReportTraitCatAdvice({ cfgId:this.props.id }).then(res => {
        if (res) {
          console.log(res)
          this.setState({
            editorContent:res.advice,
            adviseId:res.id
          })
        }
      })
      setTimeout(() => {
        const elem = this.refs.editorElem
        // console.log(elem)
        if (elem && !elem.children.length) {
          const editor = new E(elem)
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
            uploadImgServer: uploadUrl2,
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
              // console.log(html)
              this.setState({
                editorContent: this.removeWordXml(html)
              })
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
          editor.txt.html(this.state.editorContent)
        }
      }, 500)
    }
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
  getReportUserReport=() => {
    Api.getReportUserReport().then(res => {
      if (res) {
        res.forEach((item) => {
          item.concatName = item.reportCode + '-' + item.reportName
        })
        this.setState({
          reportList:res
        })
      }
    })
  }
  getReportTraitCategoryById=() => {
    const { id } = this.props
    const params = { categoryId:id }
    const { imgArr4, imgArr5 } = this.state
    Api.getReportTraitCategoryById(params).then(res => {
      if (res) {
        if (res.categoryIconUrl !== '' && res.categoryIconUrl !== null) {
          imgArr4.push({
            filePath:res.categoryIconUrl.split('/').fill('', 0, 3).join('/').substr(3),
            fileUrl:res.categoryIconUrl
          })
        }
        if (res.categoryPicDesUrl !== '' && res.categoryPicDesUrl !== null) {
          imgArr5.push({
            filePath:res.categoryPicDesUrl.split('/').fill('', 0, 3).join('/').substr(3),
            fileUrl:res.categoryPicDesUrl
          })
        }
        this.setState({
          editInfo:Object.assign({}, res),
          imgArr4,
          imgArr5
        })
      }
    })
  }
  // 校验上传图片大小
  beforeUploads = (file) => {
    const isLt1M = (file.size / 1024 / 1024 * 100) / 100 < 10
    if (!isLt1M) {
      message.error('图片大小不可大于 10M!')
    }
    return isLt1M
  }
  // 上传图片
  handleChange = (info, type) => {
    if (info.file.status !== 'uploading') {
    }
    if (info.file.status === 'done') {
      if (+info.file.response.code === 0) {
        message.success(`${info.file.name} 上传成功。`)
        let { imgArr4, imgArr5 } = this.state
        switch (type) {
          case 4:
            imgArr4.push(info.file.response.result)
            this.setState({
              imgArr4
            }, () => {})
            break
          case 5:
            imgArr5.push(info.file.response.result)
            this.setState({
              imgArr5
            }, () => {})
            break
        }
      } else {
        message.error(`${info.file.name} 上传失败。`)
      }
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 上传失败。`)
    }
  }
  // 删除图片
  deleteIndexImg4 = (index) => {
    this.setState({ imgArr4:[] })
  }
  deleteIndexImg5 = (index) => {
    this.setState({ imgArr5:[] })
  }
  // 保存
  handleConfirm = () => {
    const { isEdit, id, pageType } = this.props
    const { imgArr4, imgArr5 } = this.state
    if (pageType === 1) {
      this.props.form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          let params = {
            reportConfigId:values.reportConfigId,
            categoryCode:values.categoryCode,
            categoryName:values.categoryName,
            englishName:values.englishName,
            categoryDesc:values.categoryDesc,
            categoryIconUrl:imgArr4.length ? imgArr4[0].filePath : '',
            categoryPicDesUrl:imgArr5.length ? imgArr5[0].filePath : '',
            categoryBackColorPre:values.categoryBackColorPre,
            categoryBackColorSuf:values.categoryBackColorSuf,
            categoryBackColor:values.categoryBackColor,
            categorySort:values.categorySort,
            buyFlag:values.buyFlag,
            fitProduct:values.fitProduct,
            deleteFlag:1,
            id: isEdit ? id : null,
          }
          if (params.id === null || params.id === '' || params.id === undefined) {
            delete params.id
          }
          if (isEdit) {
            Api.editReportTraitCategory(params)
              .then(res => {
                if (res) {
                  message.success('操作成功！')
                  this.handleCancel()
                  this.props.onLoadData()
                }
              })
          } else {
            Api.addReportTraitCategory(params)
              .then(res => {
                if (res) {
                  message.success('操作成功！')
                  this.handleCancel()
                  this.props.onLoadData()
                }
              })
          }
        }
      })
    } else {
      // console.log(this.state.editorContent)
      // console.log(document.getElementById('editor').innerText.trim())
      let params = {
        advice:document.getElementById('editor').innerText.trim() === '' ? '' : this.state.editorContent,
        id :this.state.adviseId,
        moduleRepCatCfgId:this.props.id,
        productCode:pageType === 3 ? this.props.productCode : ''
      }
      console.log(params)
      Api.insertOrUpdateReportAdvice(params)
        .then(res => {
          if (res) {
            message.success('操作成功！')
            this.handleCancel()
            this.props.onLoadData()
          }
        })
    }
  }
  // 取消
  handleCancel = (e) => {
    this.props.onCancel()
  }
  render () {
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    }
    const formItemLayout1 = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    }
    const { imgArr4, imgArr5, reportList, editInfo } = this.state
    const { isEdit, visible, form:{ getFieldDecorator }, pageType } = this.props
    const props = (type) => {
      return {
        name: 'file',
        action: uploadUrl,
        listType: 'picture-card',
        showUploadList: false,
        beforeUpload: (file) => {
          return this.beforeUploads(file)
        },
        onChange: (info) => {
          this.handleChange(info, type)
        }
      }
    }

    return (
      <div>
        <Modal
          visible={visible}
          maskClosable={false}
          onCancel={this.handleCancel}
          onOk={this.handleConfirm}
          width={850}
          title={pageType === 1 ? isEdit ? '编辑分类' : '新增分类' : '综合建议'}
        >
          <div>
            {
              pageType === 1
                ? <Form>
                  <Row>
                    <Col span={24}>
                      <FormItem label='报告名称' {...formItemLayout1}>
                        {
                          getFieldDecorator('reportConfigId', {
                            initialValue: Object.keys(editInfo).length > 0 ? editInfo.reportConfigId : undefined,
                            rules: [
                              { required: true, message: '请选择' }
                            ]
                          })(
                            <Select
                              style={{ width: '100%' }}
                              placeholder='请选择'
                              allowClear
                              showSearch
                              optionFilterProp='children'
                              filterOption={(input, option) =>
                                option.props.children.indexOf(input) >= 0
                              }
                            >
                              {
                                reportList.map((item, index) => (
                                  <Option value={item.reportConfigId} key={index}>{item.concatName}</Option>
                                ))
                              }
                            </Select>
                          )
                        }
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={12}>
                      <FormItem label='分类编号' {...formItemLayout}>
                        {
                          getFieldDecorator('categoryCode', {
                            initialValue: Object.keys(editInfo).length > 0 ? editInfo.categoryCode : '',
                            rules: [
                              { required: true, message: '请输入' }
                            ]
                          })(
                            <Input placeholder='请输入' autoComplete='off' />
                          )
                        }
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={12}>
                      <FormItem label='分类名称' {...formItemLayout}>
                        {
                          getFieldDecorator('categoryName', {
                            initialValue: Object.keys(editInfo).length > 0 ? editInfo.categoryName : '',
                            rules: [
                              { required: true, message: '请输入' }
                            ]
                          })(
                            <Input placeholder='请输入' autoComplete='off' />
                          )
                        }
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem label='分类英文名称' {...formItemLayout}>
                        {
                          getFieldDecorator('englishName', {
                            initialValue: Object.keys(editInfo).length > 0 ? editInfo.englishName : '',
                          })(
                            <Input placeholder='请输入' autoComplete='off' />
                          )
                        }
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={12}>
                      <FormItem label='分类描述' {...formItemLayout}>
                        {
                          getFieldDecorator('categoryDesc', {
                            initialValue: Object.keys(editInfo).length > 0 ? editInfo.categoryDesc : '',
                          })(
                            <TextArea rows={4} maxLength={100} placeholder='请输入' autoComplete='off' />
                          )
                        }
                      </FormItem>
                    </Col>
                  </Row>
                  <Row style={{ marginBottom: '24px' }}>
                    <Col span={4} style={{ textAlign: 'right', color: 'rgba(0,0,0,0.85)', lineHeight: '40px' }}>
                      <label>图标：</label>
                    </Col>
                    <Col span={8}>
                      {
                        imgArr4.length
                          ? <div>
                            {
                              imgArr4.map((item, index) => (
                                <Thumbnail key={index} imgUrl={item.fileUrl} imgIndex={index} onDelete={this.deleteIndexImg4} />
                              ))
                            }
                          </div>
                          : <div>
                            <Upload {...props(4)}
                            >
                              <Icon type='plus' />
                              <div>上传图片</div>
                            </Upload>
                          </div>
                      }
                    </Col>
                  </Row>
                  <Row style={{ marginBottom: '24px' }}>
                    <Col span={4} style={{ textAlign: 'right', color: 'rgba(0,0,0,0.85)', lineHeight: '40px' }}>
                      <label>分类页推荐缺省图片：</label>
                    </Col>
                    <Col span={8}>
                      {
                        imgArr5.length
                          ? <div>
                            {
                              imgArr5.map((item, index) => (
                                <Thumbnail key={index} imgUrl={item.fileUrl} imgIndex={index} onDelete={this.deleteIndexImg5} />
                              ))
                            }
                          </div>
                          : <div>
                            <Upload {...props(5)}
                            >
                              <Icon type='plus' />
                              <div>上传图片</div>
                            </Upload>
                          </div>
                      }
                    </Col>
                  </Row>
                  <Row>
                    <Col span={12}>
                      <FormItem label='前渐变色' {...formItemLayout}>
                        {
                          getFieldDecorator('categoryBackColorPre', {
                            initialValue: Object.keys(editInfo).length > 0 ? editInfo.categoryBackColorPre : '',
                            rules: [
                              { required: true, message: '请输入' }
                            ],

                          })(
                            <Input placeholder='请输入' />
                          )
                        }
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem label='后渐变色' {...formItemLayout}>
                        {
                          getFieldDecorator('categoryBackColorSuf', {
                            initialValue: Object.keys(editInfo).length > 0 ? editInfo.categoryBackColorSuf : '',
                            rules: [
                              { required: true, message: '请输入' }
                            ],

                          })(
                            <Input placeholder='请输入' />
                          )
                        }
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={12}>
                      <FormItem label='背景色' {...formItemLayout}>
                        {
                          getFieldDecorator('categoryBackColor', {
                            initialValue: Object.keys(editInfo).length > 0 ? editInfo.categoryBackColor : '',
                            rules: [
                              { required: true, message: '请输入' }
                            ],

                          })(
                            <Input placeholder='请输入' />
                          )
                        }
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={12}>
                      <FormItem label='分类排序' {...formItemLayout}>
                        {
                          getFieldDecorator('categorySort', {
                            initialValue: +editInfo.categorySort || 1,
                            rules: [
                              { required: true, message: '请输入' }
                            ]
                          })(
                            <InputNumber size='small' min={1} max={100}
                              style={{ width: '267px', height:'32px', lineHeight:'32px' }} />
                          )
                        }
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem label='购买标识' {...formItemLayout}>
                        {
                          getFieldDecorator('buyFlag', {
                            initialValue: Object.keys(editInfo).length > 0 ? editInfo.buyFlag : undefined,
                            rules: [
                              { required: true, message: '请选择' }
                            ]
                          })(
                            <Select
                              style={{ width: '100%' }}
                              placeholder='请选择'
                              allowClear
                              showSearch
                              optionFilterProp='children'
                              filterOption={(input, option) =>
                                option.props.children.indexOf(input) >= 0
                              }
                            >
                              <option value={0} key={0}>无需购买</option>
                              <option value={1} key={1}>需要购买</option>
                            </Select>
                          )
                        }
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={12}>
                      <FormItem label='使用成分' {...formItemLayout}>
                        {
                          getFieldDecorator('fitProduct', {
                            initialValue: Object.keys(editInfo).length > 0 ? editInfo.fitProduct : undefined,
                          })(
                            <Input placeholder='请输入' />
                          )
                        }
                      </FormItem>
                    </Col>
                  </Row>
                </Form>
                : <div className={styles.contentStyle} ref='editorElem' id='editor' style={{ width:'800px', height:'330px' }} />
            }

          </div>
        </Modal>
      </div>
    )
  }
}

CategoryModalForm.propTypes = {
  isEdit: PropTypes.bool,
  onCancel: PropTypes.func,
  visible: PropTypes.bool,
  form: PropTypes.object,
  onLoadData: PropTypes.func,
  id: PropTypes.number,
  pageType:PropTypes.number,
  productCode:PropTypes.string
}

const CategoryModal = Form.create()(CategoryModalForm)

export default CategoryModal
