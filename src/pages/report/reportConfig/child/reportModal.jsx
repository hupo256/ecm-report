import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Modal, Form, Input, Select, Row, Col, message, Upload, Icon, InputNumber } from 'antd'
import Api from '../../service'
import Thumbnail from '../../thumbnail'
import { uploadUrl } from '@/common/tools'

const FormItem = Form.Item
const Option = Select.Option
const reportTypeList = [
  { id:11, name:'11-系列' },
  { id:12, name:'12-标品' },
  { id:21, name:'21-特殊化报告' },
  { id:31, name:'31-个性化' },
  { id:41, name:'41-卡片' },
  { id:51, name:'51-跳转H5链接' },
  { id:61, name:'61-一级分类报告' },
]

class ReportModalForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      imgList:[],
      imgList2:[],
      editInfo:{},
      allPrdList:[],
      typeList:[]
    }
  }
  componentDidMount () {
    this.getProductList()
    this.getTypeList()
    const { isEdit } = this.props
    if (isEdit) {
      this.getUserReportConfigById()
    } else {
      this.setState({
        editInfo:{}
      })
    }
  }
  getTypeList=() => {
    const { isEdit, productId } = this.props
    Api.getReportCategoryConfigInfoAllList(
      isEdit ? { id:productId } : {}
    ).then(res => {
      res && this.setState({
        typeList: res
      })
    })
  }
  getUserReportConfigById=() => {
    const { id } = this.props
    let params = {
      id:id
    }
    Api.getUserReportConfigById(params).then(res => {
      if (res) {
        const { imgList, imgList2 } = this.state
        if (res.reportListPic !== '' && res.reportListPic !== null) {
          imgList.push({
            filePath:res.reportListPic.split('/').fill('', 0, 3).join('/').substr(3),
            fileUrl:res.reportListPic
          })
        }
        if (res.unlockMultiplyPicUrl !== '' && res.unlockMultiplyPicUrl !== null) {
          imgList2.push({
            filePath:res.unlockMultiplyPicUrl.split('/').fill('', 0, 3).join('/').substr(3),
            fileUrl:res.unlockMultiplyPicUrl
          })
        }
        this.setState({
          editInfo:Object.assign({}, res),
          imgList,
          imgList2
        })
      }
    })
  }
  getProductList = () => {
    let params = {
      pageNum: 1,
      pageSize: 999
    }
    Api.listAllProduct(params).then(res => {
      if (res) {
        res.forEach(item => {
          item.concatName = item.productCode + '-' + item.productName
        })
        this.setState({
          allPrdList: res
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
  // 上传图片/
  handleChange = (info, type) => {
    if (info.file.status !== 'uploading') {
    }
    if (info.file.status === 'done') {
      if (+info.file.response.code === 0) {
        message.success(`${info.file.name} 上传成功。`)
        let { imgList, imgList2 } = this.state
        if (type === 1) {
          imgList.push(info.file.response.result)
          this.setState({ imgList })
        } else {
          imgList2.push(info.file.response.result)
          this.setState({ imgList2 })
        }
      } else {
        message.error(`${info.file.name} 上传失败。`)
      }
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 上传失败。`)
    }
  }
  // 删除图片
  deleteIndexImg = (index) => {
    this.setState({
      imgList:[]
    })
  }
  deleteIndexImg2 = (index) => {
    this.setState({
      imgList2:[]
    })
  }
  // 保存
  handleConfirm = () => {
    const { isEdit, id } = this.props
    const { imgList, imgList2, allPrdList } = this.state
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log(values)
        if (imgList.length === 0) {
          message.error('请上传报告列表图片！')
          return false
        }
        let _productName = ''
        allPrdList.forEach(item => {
          if (values.productId === item.id) {
            _productName = item.productName
          }
        })
        let params = {
          productCode:values.productCode,
          reportName:values.reportName,
          type:values.type,
          reportShowType:values.reportShowType,
          productReportType:+values.productReportType,
          productId:values.productId,
          productName:_productName,
          h5ShowType:+values.h5ShowType,
          categoryFlag:values.categoryFlag,
          highLightLevelFlag:values.highLightLevelFlag,
          traitCount:+values.traitCount,
          jsonVersion:values.jsonVersion,
          reportListPic:imgList.length ? imgList[0].filePath : '',
          unlockMultiplyPicUrl:imgList2.length ? imgList2[0].filePath : '',
          id: isEdit ? id : null,

          categoryConfigId:values.categoryConfigId,
          isShareFlag:values.isShareFlag,
          reportColour:values.reportColour,
        }
        if (params.id === null || params.id === '' || params.id === undefined) {
          delete params.id
        }
        if (isEdit) {
          Api.updateUserReportConfig(params)
            .then(res => {
              if (res) {
                message.success('操作成功！')
                this.handleCancel()
                this.props.onLoadData()
              }
            })
        } else {
          Api.saveUserReportConfig(params)
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
    const { imgList, imgList2, editInfo, allPrdList, typeList } = this.state
    const { isEdit, visible, form:{ getFieldDecorator } } = this.props
    const { productCode } = editInfo
    let isAnxiaoruan = productCode == 'KCGD' || productCode == 'KCGE' || productCode == 'KCGF'

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
          width={900}
          title={isEdit ? '编辑报告' : '新增报告'}
        >
          <div>
            <Form>
              <Row>
                <Col span={12}>
                  <FormItem label='报告码' {...formItemLayout}>
                    {
                      getFieldDecorator('productCode', {
                        initialValue: Object.keys(editInfo).length > 0 ? editInfo.productCode : '',
                        rules: [
                          { required: true, message: '请输入' }
                        ]
                      })(
                        <Input placeholder='请输入' autoComplete='off' disabled={isEdit} />
                      )
                    }
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label='报告名称' {...formItemLayout}>
                    {
                      getFieldDecorator('reportName', {
                        initialValue: Object.keys(editInfo).length > 0 ? editInfo.reportName : '',
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
                  <FormItem label='报告类型' {...formItemLayout}>
                    {
                      getFieldDecorator('type', {
                        initialValue: Object.keys(editInfo).length > 0 ? editInfo.type : undefined,
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
                          <option value={'1'} key={1}>h5</option>
                          <option value={'2'} key={2}>pdf</option>
                          <option value={'3'} key={3}>纸质</option>
                        </Select>
                      )
                    }
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label='报告展示类型' {...formItemLayout}>
                    {
                      getFieldDecorator('reportShowType', {
                        initialValue: Object.keys(editInfo).length > 0 ? editInfo.reportShowType : undefined,
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
                          <option value={1} key={1}>常规</option>
                          <option value={2} key={2}>场景化</option>
                          <option value={3} key={3}>特殊类</option>
                        </Select>
                      )
                    }
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <FormItem label='产品对应报告类型' {...formItemLayout}>
                    {
                      getFieldDecorator('productReportType', {
                        initialValue: Object.keys(editInfo).length > 0 ? editInfo.productReportType : undefined,
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
                            reportTypeList.map(item => (
                              <Option value={item.id} key={item.id}>{item.name}</Option>
                            ))
                          }
                        </Select>
                      )
                    }
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label='对应产品' {...formItemLayout}>
                    {
                      getFieldDecorator('productId', {
                        initialValue: Object.keys(editInfo).length > 0 ? editInfo.productId : undefined,
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
                            allPrdList.map(item => (
                              <Option value={item.id} key={item.id}>{item.concatName}</Option>
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
                  <FormItem label='H5报告展示形式' {...formItemLayout}>
                    {
                      getFieldDecorator('h5ShowType', {
                        initialValue: Object.keys(editInfo).length > 0 ? editInfo.h5ShowType : undefined,
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
                          <option value={1} key={1}>H5</option>
                          <option value={2} key={2}>H5套卡片</option>
                          <option value={3} key={3}>卡片</option>
                        </Select>
                      )
                    }
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label='是否有分类检测项' {...formItemLayout}>
                    {
                      getFieldDecorator('categoryFlag', {
                        initialValue: Object.keys(editInfo).length > 0 ? editInfo.categoryFlag : undefined,
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
                          <option value={1} key={1}>有</option>
                          <option value={0} key={2}>无</option>
                        </Select>
                      )
                    }
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <FormItem label='红亮点标识' {...formItemLayout}>
                    {
                      getFieldDecorator('highLightLevelFlag', {
                        initialValue: Object.keys(editInfo).length > 0 ? editInfo.highLightLevelFlag : undefined,
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
                          <option value={'00'} key={1}>均无</option>
                          <option value={'01'} key={3}>红点</option>
                          <option value={'10'} key={2}>亮点</option>
                          <option value={'11'} key={4}>红亮点</option>
                        </Select>
                      )
                    }
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label='检测项个数' {...formItemLayout}>
                    {
                      getFieldDecorator('traitCount', {
                        initialValue: Object.keys(editInfo).length > 0 ? editInfo.traitCount : '',
                        rules: [
                          { required: true, message: '请输入' }
                        ]
                      })(
                        <InputNumber placeholder='请输入' size='small' min={0} autoComplete='off'
                          style={{ width: '267px', height:'32px', lineHeight:'32px' }}
                        />

                      )
                    }
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <FormItem label='适配json版本' {...formItemLayout}>
                    {
                      getFieldDecorator('jsonVersion', {
                        initialValue: Object.keys(editInfo).length > 0 ? editInfo.jsonVersion : '',
                        rules: [
                          { required: true, message: '请输入' }
                        ]
                      })(
                        <Input placeholder='请输入' autoComplete='off' />
                      )
                    }
                  </FormItem>
                </Col>
                {
                  !isAnxiaoruan ? <Col span={12}>
                    <FormItem label='报告所属分类' {...formItemLayout}>
                      {
                        getFieldDecorator('categoryConfigId', {
                          initialValue: Object.keys(editInfo).length > 0 ? editInfo.categoryConfigId : undefined,
                          // rules: [
                          //   { required: true, message: '请选择' }
                          // ]
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
                            {typeList && typeList.map(item => (
                              <option value={item.id} key={item.id}>{item.categoryName}</option>
                            ))}
                          </Select>
                        )
                      }
                    </FormItem>
                  </Col> : ''
                }
              </Row>
              {
                !isAnxiaoruan ? <Row>
                  <Col span={12}>
                    <FormItem label='展示分享海报' {...formItemLayout}>
                      {
                        getFieldDecorator('isShareFlag', {
                          initialValue: Object.keys(editInfo).length > 0 ? editInfo.isShareFlag : undefined,
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
                            <option value={1} key={1}>是</option>
                            <option value={0} key={0}>否</option>
                          </Select>
                        )
                      }
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem label='报告首页底色' {...formItemLayout}>
                      {
                        getFieldDecorator('reportColour', {
                          initialValue: Object.keys(editInfo).length > 0 ? editInfo.reportColour : '',
                          // rules: [
                          //   { required: true, message: '请输入' }
                          // ]
                        })(
                          <Input placeholder='请输入' autoComplete='off' />
                        )
                      }
                    </FormItem>
                  </Col>
                </Row> : ''
              }

              <Row style={{ marginBottom: '24px' }}>
                <Col>
                  <Col span={12}>
                    <FormItem label='报告列表图片' {...formItemLayout}>
                      {
                        getFieldDecorator('reportListPic', {
                          initialValue: Object.keys(editInfo).length > 0 ? editInfo.reportListPic : '',
                          rules: [
                            { required: true, message: '请上传' }
                          ]
                        })(
                          imgList.length ? <div>
                            {
                              imgList.map((item, index) => (
                                <Thumbnail key={index} imgUrl={item.fileUrl} imgIndex={index} onDelete={this.deleteIndexImg} />
                              ))
                            }
                          </div> : <div>
                            <Upload {...props(1)}
                            >
                              <Icon type='plus' />
                              <div>上传图片</div>
                            </Upload>
                          </div>
                        )
                      }
                    </FormItem>
                  </Col>
                </Col>
              </Row>
              <Row style={{ marginBottom: '24px' }}>
                <Col>
                  <Col span={12}>
                    <FormItem label='解锁展示图片' {...formItemLayout}>
                      {
                        getFieldDecorator('unlockMultiplyPicUrl', {
                          initialValue: Object.keys(editInfo).length > 0 ? editInfo.unlockMultiplyPicUrl : '',
                        })(
                          imgList2.length ? <div>
                            {
                              imgList2.map((item, index) => (
                                <Thumbnail key={index} imgUrl={item.fileUrl} imgIndex={index} onDelete={this.deleteIndexImg2} />
                              ))
                            }
                          </div> : <div>
                            <Upload {...props(2)}
                            >
                              <Icon type='plus' />
                              <div>上传图片</div>
                            </Upload>
                          </div>
                        )
                      }
                    </FormItem>
                  </Col>
                </Col>
              </Row>
            </Form>
          </div>
        </Modal>
      </div>
    )
  }
}

ReportModalForm.propTypes = {
  isEdit: PropTypes.bool,
  onCancel: PropTypes.func,
  visible: PropTypes.bool,
  form: PropTypes.object,
  onLoadData: PropTypes.func,
  id: PropTypes.number
}

// const ReportModal = Form.create()(ReportModalForm)

export default ReportModal
