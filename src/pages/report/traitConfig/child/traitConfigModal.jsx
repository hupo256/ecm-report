import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Modal, Form, Input, Row, Col, message, Upload, Icon, Select, Tabs, Button } from 'antd'
import Api from '@/common/api'
import config from '@/common/utils/config'
import Thumbnail from '../../thumbnail'
const uploadUrl = config.host + 'product/imageUpload'
const FormItem = Form.Item
const confirm = Modal.confirm
const { TabPane } = Tabs
const { TextArea } = Input
const { Option } = Select

class TraitConfigModalForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      imgArr1:[],
      imgArr2:[],
      editInfo:{},
      activeKey:'1',
      indexPicUrl:[],
      productInfo:{},
      productDetail:{},
      productId:'',
      reportTraitTypeList:[],
      detectionResultList:[],
      scienceDetailsList:[],
      detectionResultId:'',
      scienceDetailsId:''
    }
  }
  componentDidMount () {
    const { isEdit, pageConfigInfoList } = this.props
    if (pageConfigInfoList.length > 0) {
      if (pageConfigInfoList.length === 1) {
        this.setState({
          detectionResultId:pageConfigInfoList[0].pageCode === '401' ? pageConfigInfoList[0].pageId : undefined,
          scienceDetailsId:pageConfigInfoList[0].pageCode === '402' ? pageConfigInfoList[0].pageId : undefined,
        })
      } else {
        this.setState({
          detectionResultId:pageConfigInfoList[0].pageCode === '401' ? pageConfigInfoList[0].pageId : pageConfigInfoList[1].pageId,
          scienceDetailsId:pageConfigInfoList[0].pageCode === '402' ? pageConfigInfoList[0].pageId : pageConfigInfoList[1].pageId
        })
      }
    }
    this.getReportTraitDropDownList()
    if (isEdit) {
      this.getReportTraitById()
    } else {
      this.setState({
        editInfo:{}
      })
    }
  }
  getReportTraitDropDownList=() => {
    Api.getReportTraitDropDownList().then(res => {
      if (res) {
        this.setState({
          reportTraitTypeList:res.reportTraitTypeList,
          detectionResultList:res.detectionResultList,
          scienceDetailsList:res.scienceDetailsList
        })
      }
    })
  }
  getReportTraitById=() => {
    const { id } = this.props
    const params = { traitId:id }
    const { imgArr1, imgArr2, indexPicUrl } = this.state
    Api.getReportTraitById(params).then(res => {
      if (res) {
        if (res.trait.traitBackImageUrl !== '' && res.trait.traitBackImageUrl !== null) {
          imgArr1.push({
            fileUrl:res.trait.traitBackImageUrl
          })
        }
        if (res.trait.traitBackImageAbstractUrl !== '' && res.trait.traitBackImageAbstractUrl !== null) {
          imgArr2.push({
            fileUrl:res.trait.traitBackImageAbstractUrl
          })
        }
        if (res.product !== null && res.product.productDetail.indexPicUrl !== '' && res.product.productDetail.indexPicUrl !== null) {
          indexPicUrl.push({
            fileUrl:res.product.productDetail.indexPicUrl
          })
        }
        if (res.product !== null) {
          this.setState({
            productId:res.product.id,
            productInfo:Object.assign({}, res.product),
            productDetail:res.product.productDetail,
          })
        }
        this.setState({
          editInfo:Object.assign({}, res.trait),
          imgArr1,
          imgArr2,
          indexPicUrl
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
        let { imgArr1, imgArr2, indexPicUrl } = this.state
        if (type === 1) {
          imgArr1.push(info.file.response.result)
          this.setState({
            imgArr1
          }, () => {})
        }
        if (type === 2) {
          imgArr2.push(info.file.response.result)
          this.setState({
            imgArr2
          }, () => {})
        }
        if (type === 3) {
          indexPicUrl.push(info.file.response.result)
          this.setState({
            indexPicUrl
          }, () => {})
        }
      } else {
        message.error(`${info.file.name} 上传失败。`)
      }
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 上传失败。`)
    }
  }
  // 删除图片
  deleteIndexImg1 = (index) => {
    this.setState({ imgArr1:[] })
  }
  deleteIndexImg2 = (index) => {
    this.setState({ imgArr2:[] })
  }
  deleteIndexImg3 = (index) => {
    this.setState({ indexPicUrl:[] })
  }
  // 保存
  handleSave = () => {
    const { isEdit, id } = this.props
    const { imgArr1, imgArr2, indexPicUrl, productId } = this.state
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        if (indexPicUrl.length === 0) {
          message.error('请上传检测项图片')
          return
        }
        let _this = this
        let params = {
          reportTraitEditReq:{
            traitCode:values.traitCode,
            traitName:values.traitName,
            traitBackColorPre:values.traitBackColorPre,
            traitBackColorSuf:values.traitBackColorSuf,
            displayType:values.displayType,
            channelCode:values.channelCode,
            theme:values.theme,
            applicableU:values.applicableU,
            traitBackImageUrl:isEdit ? imgArr1.length ? imgArr1[0].fileUrl : '' : imgArr1.length ? imgArr1[0].filePath : '',
            traitBackImageAbstractUrl:isEdit ? imgArr2.length ? imgArr2[0].fileUrl : '' : imgArr2.length ? imgArr2[0].filePath : '',
            deleteFlag:1,
            traitType:values.traitType,
            detectionResultId:values.detectionResultId,
            scienceDetailsId:values.scienceDetailsId,
            id: isEdit ? id : null,
          },
          traitProductRequest:{
            productLabelList:values.productLabelList.indexOf('|') ? values.productLabelList.split('|') : [].push(values.productLabelList),
            productDesc:values.productDesc,
            indexPicUrl:indexPicUrl[0].filePath,
            productOriginPrice:+values.productOriginPrice,
            productPrice:+values.productPrice,
            unlockPrice:+values.unlockPrice,
            id:isEdit ? productId : null,
          }

        }
        console.log(params)
        confirm({
          title: '确定要执行此操作吗？',
          content: '编辑的内容将应用到所有用到该检测项的报告，请再次确认是否提交修改。',
          onOk () {
            if (isEdit) {
              Api.editReportTrait(params)
                .then(res => {
                  if (res) {
                    message.success('操作成功！')
                    _this.handleCancel()
                    _this.props.onLoadData()
                  }
                })
            } else {
              Api.addReportTrait(params)
                .then(res => {
                  if (res) {
                    message.success('操作成功！')
                    _this.handleCancel()
                    _this.props.onLoadData()
                  }
                })
            }
          }
        })
      }
    })
  }
  // 取消
  handleCancel = (e) => {
    this.props.onCancel()
  }
  onChangeTab = (num) => {
    if (num === '2') {
      this.handleNextTwo()
    } else if (num === '1') {
      this.setState({ activeKey: '1' })
    }
  }
  handleNextTwo = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ activeKey: '2' })
      }
    })
  }
  handlePrevTwo = () => {
    this.setState({ activeKey: '1' })
  }
  render () {
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    }
    const { imgArr1, imgArr2, editInfo, activeKey, indexPicUrl, productInfo, productDetail,
      reportTraitTypeList, detectionResultList, scienceDetailsList, detectionResultId, scienceDetailsId } = this.state
    const { isEdit, visible, form:{ getFieldDecorator } } = this.props
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
    const reportItem = (
      <Form>
        <Row>
          <Col span={12}>
            <FormItem label='Trait_code' {...formItemLayout}>
              {
                getFieldDecorator('traitCode', {
                  initialValue: Object.keys(editInfo).length > 0 ? editInfo.traitCode : '',
                })(
                  <Input placeholder='请输入' autoComplete='off' />
                )
              }
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label='Trait_type' {...formItemLayout}>
              {
                getFieldDecorator('traitType', {
                  initialValue: Object.keys(editInfo).length > 0 ? editInfo.traitType : '',
                  rules: [{ required: true, message: '请输入' }]
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
                      reportTraitTypeList.map(item => {
                        return <Option value={item.traitType} key={item.traitType}>{item.traitTypeName}</Option>
                      })
                    }
                  </Select>
                )
              }
            </FormItem>
          </Col>

        </Row>
        <Row>
          <Col span={12}>
            <FormItem label='traitName' {...formItemLayout}>
              {
                getFieldDecorator('traitName', {
                  initialValue: Object.keys(editInfo).length > 0 ? editInfo.traitName : '',

                })(
                  <Input placeholder='请输入' autoComplete='off' />
                )
              }
            </FormItem>
          </Col>
        </Row>
        <Row style={{ marginBottom: '24px' }}>
          <Col span={4} style={{ textAlign: 'right', color: 'rgba(0,0,0,0.85)', lineHeight: '40px' }}>
            <label>报告卡片头图：</label>
          </Col>
          <Col span={8}>
            {
              imgArr1.length
                ? <div>
                  {
                    imgArr1.map((item, index) => (
                      <Thumbnail key={index} imgUrl={item.fileUrl} imgIndex={index} onDelete={this.deleteIndexImg1} />
                    ))
                  }
                </div>
                : <div>
                  <Upload {...props(1)}
                  >
                    <Icon type='plus' />
                    <div>上传图片</div>
                  </Upload>
                </div>
            }
          </Col>
        </Row>
        { <Row style={{ marginBottom: '24px' }}>
          <Col span={4} style={{ textAlign: 'right', color: 'rgba(0,0,0,0.85)', lineHeight: '40px' }}>
            <label>报告卡片头图缩略图：</label>
          </Col>
          <Col span={8}>
            {
              imgArr2.length
                ? <div>
                  {
                    imgArr2.map((item, index) => (
                      <Thumbnail key={index} imgUrl={item.fileUrl} imgIndex={index} onDelete={this.deleteIndexImg2} />
                    ))
                  }
                </div>
                : <div>
                  <Upload {...props(2)}
                  >
                    <Icon type='plus' />
                    <div>上传图片</div>
                  </Upload>
                </div>
            }
          </Col>
        </Row> }
        <Row>
          <Col span={12}>
            <FormItem label='前渐变色' {...formItemLayout}>
              {
                getFieldDecorator('traitBackColorPre', {
                  initialValue: Object.keys(editInfo).length > 0 ? editInfo.traitBackColorPre : '',
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
                getFieldDecorator('traitBackColorSuf', {
                  initialValue: Object.keys(editInfo).length > 0 ? editInfo.traitBackColorSuf : '',
                  rules: [
                    { required: true, message: '请选择' }
                  ]

                })(
                  <Input placeholder='请输入' />
                )
              }
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem label='displayType' {...formItemLayout}>
              {
                getFieldDecorator('displayType', {
                  initialValue: Object.keys(editInfo).length > 0 ? editInfo.displayType : '',
                })(
                  <Input placeholder='请输入' />
                )
              }
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label='channelCode' {...formItemLayout}>
              {
                getFieldDecorator('channelCode', {
                  initialValue: Object.keys(editInfo).length > 0 ? editInfo.channelCode : '',
                })(
                  <Input placeholder='请输入' />
                )
              }
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem label='场景' {...formItemLayout}>
              {
                getFieldDecorator('theme', {
                  initialValue: Object.keys(editInfo).length > 0 ? editInfo.theme : '',
                })(
                  <Input placeholder='请输入' />
                )
              }
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label='应用人群' {...formItemLayout}>
              {
                getFieldDecorator('applicableU', {
                  initialValue: Object.keys(editInfo).length > 0 ? editInfo.applicableU : undefined,
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
                    <option value={'ADULT'} key={1}>成人</option>
                    <option value={'KID'} key={2}>宝宝</option>
                  </Select>
                )
              }
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem label='检测项详情页-检测结果' {...formItemLayout}>
              {
                getFieldDecorator('detectionResultId', {
                  initialValue: detectionResultId,
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
                      detectionResultList.map(item => {
                        return <Option value={item.reportPageId} key={item.reportPageId}>{item.reportPageName}</Option>
                      })
                    }
                  </Select>
                )
              }
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label='检测项详情页-科学细节' {...formItemLayout}>
              {
                getFieldDecorator('scienceDetailsId', {
                  initialValue: scienceDetailsId,
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
                      scienceDetailsList.map(item => {
                        return <Option value={item.reportPageId} key={item.reportPageId}>{item.reportPageName}</Option>
                      })
                    }
                  </Select>
                )
              }
            </FormItem>
          </Col>
        </Row>
      </Form>
    )
    const goodsItem = (
      <Form>
        {
          activeKey === '2'
            ? <Row>
              <Col span={12}>
                <FormItem label='检测项标签' {...formItemLayout}>
                  {
                    getFieldDecorator('productLabelList', {
                      initialValue: isEdit ? productDetail.productLabel : '',
                      rules: [{ required: true, message: '请输入' }]
                    })(
                      <Input placeholder='请输入多个用|隔开' />
                    )
                  }
                </FormItem>
              </Col>
            </Row>
            : ''
        }
        {
          activeKey === '2'
            ? <Row>
              <Col span={12}>
                <FormItem label='检测项描述' {...formItemLayout}>
                  {
                    getFieldDecorator('productDesc', {
                      initialValue: isEdit ? productDetail.productDesc : '',
                      rules: [{ required: true, message: '请输入' }]
                    })(
                      <TextArea rows={4} placeholder='请输入' autoComplete='off' />
                    )
                  }
                </FormItem>
              </Col>
            </Row>
            : ''
        }
        {
          activeKey === '2'
            ? <Row>
              <Col span={12}>
                <FormItem label='检测项图片' {...formItemLayout}>
                  {
                    getFieldDecorator('indexPicUrl', {
                      initialValue: isEdit ? indexPicUrl.length > 0 ? indexPicUrl[0].fileUrl : '' : '',
                      rules: [{ required: true, message: '请上传' }]
                    })(
                      indexPicUrl.length ? <div>
                        {
                          indexPicUrl.map((item, index) => (
                            <Thumbnail key={index} imgUrl={item.fileUrl} imgIndex={index} onDelete={this.deleteIndexImg3} />
                          ))
                        }
                      </div> : <div>
                        <Upload {...props(3)}>
                          <Icon type='plus' />
                          <div>上传图片</div>
                        </Upload>
                      </div>
                    )
                  }
                  {
                    <span style={{ color:'red' }}>尺寸630*630px,大小限制200k</span>
                  }
                </FormItem>
              </Col>
            </Row>
            : ''
        }
        {
          activeKey === '2'
            ? <Row>
              <Col span={8}>
                <FormItem label='原价' {...formItemLayout}>
                  {
                    getFieldDecorator('productOriginPrice', {
                      initialValue:  productInfo.productOriginPrice,
                      rules: [{
                        validator: (rule, value, callback) => {
                          if (value) {
                            if (/^(([1-9]\d*)(\.\d{1,2})?)$|(0\.0?([1-9]\d?))$/.test(value)) {
                              callback()
                            } else {
                          callback('请输入正确价格') // eslint-disable-line
                            }
                          } else {
                        callback('请输入')// eslint-disable-line
                          }
                        },
                        type:'number',
                        required:true
                      }]
                    })(
                      <Input placeholder='请输入' />
                    )
                  }
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label='销售价' {...formItemLayout}>
                  {
                    getFieldDecorator('productPrice', {
                      initialValue: productInfo.productPrice,
                      rules: [{
                        validator: (rule, value, callback) => {
                          if (value) {
                            if (/^(([1-9]\d*)(\.\d{1,2})?)$|(0\.0?([1-9]\d?))$/.test(value)) {
                              callback()
                            } else {
                          callback('请输入正确价格') // eslint-disable-line
                            }
                          } else {
                        callback('请输入')// eslint-disable-line
                          }
                        },
                        type:'number',
                        required:true
                      }]
                    })(
                      <Input placeholder='请输入' />
                    )
                  }
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label='解锁价' {...formItemLayout}>
                  {
                    getFieldDecorator('unlockPrice', {
                      initialValue: productInfo.unlockPrice,
                      rules: [{
                        validator: (rule, value, callback) => {
                          if (value) {
                            if (/^(([1-9]\d*)(\.\d{1,2})?)$|(0\.0?([1-9]\d?))$/.test(value)) {
                              callback()
                            } else {
                          callback('请输入正确价格') // eslint-disable-line
                            }
                          } else {
                        callback('请输入')// eslint-disable-line
                          }
                        },
                        type:'number',
                        required:true
                      }]
                    })(
                      <Input placeholder='请输入' />
                    )
                  }
                </FormItem>
              </Col>
            </Row>
            : ''
        }
      </Form>
    )
    return (
      <div>
        <Modal
          visible={visible}
          maskClosable={false}
          onCancel={this.handleCancel}
          width={980}
          title={isEdit ? '编辑模块' : '新增模块'}
          footer={activeKey === '1' ? [
            <Button key='cancel' onClick={this.handleCancel} >取消</Button>,
            <Button key='next' type='primary' onClick={this.handleNextTwo} >下一步</Button>
          ] : [
            <Button key='cancel' onClick={this.handleCancel} >取消</Button>,
            <Button key='prev' onClick={this.handlePrevTwo} >上一步</Button>,
            <Button key='next' type='primary' onClick={this.handleSave} >保存</Button>
          ]}
        >
          <div />
          <Tabs activeKey={activeKey}
            onChange={(activeKey) => this.onChangeTab(activeKey)}>
            <TabPane tab='报告配置' key='1'>
              {reportItem}
            </TabPane>
            <TabPane tab='商品配置' key='2'>
              {goodsItem}
            </TabPane>
          </Tabs>
        </Modal>
      </div>
    )
  }
}

TraitConfigModalForm.propTypes = {
  isEdit: PropTypes.bool,
  onCancel: PropTypes.func,
  visible: PropTypes.bool,
  form: PropTypes.object,
  onLoadData: PropTypes.func,
  id: PropTypes.number
}

const TraitConfigModal = Form.create()(TraitConfigModalForm)

export default TraitConfigModal
