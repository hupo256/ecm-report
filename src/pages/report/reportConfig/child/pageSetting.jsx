import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Modal, Form, Select, Row, Col, message } from 'antd'
import Api from '@/common/api'

const FormItem = Form.Item
const Option = Select.Option

class PageSettingForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      editInfo:{},
      chooseList:{},
      reportCJHPage:{},
      reportCJHJCXPPage:{},
      reportDetailJCJGPage:{},
      reportDetailKXXJPage:{},
      reportNomalPage:{}
    }
  }
  componentDidMount () {
    this.queryReportPageTypeByUserReportConfigId()
    this.getUserReportConfigById()
    this.queryReportPageTypeList()
  }
  getUserReportConfigById=() => {
    const { id } = this.props
    let params = {
      id:id
    }
    Api.getUserReportConfigById(params).then(res => {
      if (res) {
        this.setState({
          editInfo:Object.assign({}, res),
        })
      }
    })
  }
  queryReportPageTypeByUserReportConfigId=() => {
    const { id } = this.props
    let params = {
      userReportConfigId:id
    }
    Api.queryReportPageTypeByUserReportConfigId(params).then(res => {
      if (res) {
        this.setState({
          reportCJHPage:Object.assign({}, res.reportPageType.reportCJHPage),
          reportCJHJCXPPage:Object.assign({}, res.reportPageType.reportCJHJCXPPage),
          reportDetailJCJGPage:Object.assign({}, res.reportPageType.reportDetailJCJGPage),
          reportDetailKXXJPage:Object.assign({}, res.reportPageType.reportDetailKXXJPage),
          reportNomalPage:Object.assign({}, res.reportPageType.reportNomalPage),
        })
      }
    })
  }
  queryReportPageTypeList=() => {
    Api.queryReportPageTypeList({ pageType:0 }).then(res => {
      if (res) {
        this.setState({
          chooseList:Object.assign({}, res),
        })
      }
    })
  }
  handleCancel = (e) => {
    this.props.onCancel()
  }
  handleConfirm=(e) => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log(values)
        const { id } = this.props
        let params = {
          reportCJHJCXPageId:values.reportCJHJCXPageId,
          reportCJHPageId:values.reportCJHPageId,
          reportDetailJCJGPageId:values.reportDetailJCJGPageId,
          reportDetailKXXJPageId:values.reportDetailKXXJPageId,
          reportNomalPageId:values.reportNomalPageId,
          userName:'',
          userReportConfigId:id
        }
        Api.saveReportChangePage(params)
          .then(res => {
            if (res) {
              message.success('操作成功！')
              this.handleCancel()
              this.props.onLoadData()
            }
          })
      }
    })
  }
  render () {
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    }
    const { editInfo, chooseList, reportCJHPage, reportCJHJCXPPage, reportDetailJCJGPage, reportDetailKXXJPage, reportNomalPage } = this.state
    const { visible, form:{ getFieldDecorator } } = this.props
    return (
      <div>
        <Modal
          maskClosable={false}
          visible={visible}
          onCancel={this.handleCancel}
          onOk={this.handleConfirm}
          width={850}
          title={'配置页面'}
        >
          <div>
            <Form>
              <Row>
                <Col span={12}>
                  <p>报告码：{editInfo.productCode}</p>
                </Col>
                <Col span={12}>
                  <p>报告名称：{editInfo.productName}</p>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <p>报告展示类型：
                    {
                      editInfo.reportShowType === 1 ? '常规' : editInfo.reportShowType === 2 ? '场景化' : editInfo.reportShowType === 3 ? '特殊类' : ''
                    }
                  </p>
                </Col>
                <Col span={12} />
              </Row>
              <Row>
                <h3>配置页面</h3>
              </Row>
              {
                editInfo.reportShowType === 1
                  ? <Row>
                    <Col span={12}>
                      <FormItem label='常规报告页' {...formItemLayout}>
                        {
                          getFieldDecorator('reportNomalPageId', {
                            initialValue:Object.keys(reportNomalPage).length > 0 ? reportNomalPage.id : undefined,
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
                                chooseList.reportNomalPage
                                  ? chooseList.reportNomalPage.map(item => (
                                    <Option value={item.id} key={item.id}>{item.pageName}</Option>
                                  ))
                                  : null
                              }
                            </Select>
                          )
                        }
                      </FormItem>
                    </Col>
                  </Row>
                  : editInfo.reportShowType === 2
                    ? <Row>
                      <Col span={12}>
                        <FormItem label='场景化报告页' {...formItemLayout}>
                          {
                            getFieldDecorator('reportCJHPageId', {
                              initialValue: Object.keys(reportCJHPage).length > 0 ? reportCJHPage.id : undefined,
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
                                  chooseList.reportCJHPage
                                    ? chooseList.reportCJHPage.map(item => (
                                      <Option value={item.id} key={item.id}>{item.pageName}</Option>
                                    ))
                                    : null
                                }
                              </Select>
                            )
                          }
                        </FormItem>
                      </Col>
                    </Row>
                    : null
              }
              {
                editInfo.reportShowType === 2
                  ? <Row>
                    <Col span={12}>
                      <FormItem label='场景化检测项分类页' {...formItemLayout}>
                        {
                          getFieldDecorator('reportCJHJCXPageId', {
                            initialValue: Object.keys(reportCJHJCXPPage).length > 0 ? reportCJHJCXPPage.id : undefined,
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
                                chooseList.reportCJHJCXPPage
                                  ? chooseList.reportCJHJCXPPage.map(item => (
                                    <Option value={item.id} key={item.id}>{item.pageName}</Option>
                                  ))
                                  : null
                              }
                            </Select>
                          )
                        }
                      </FormItem>
                    </Col>
                  </Row>
                  : null
              }
              <Row>
                <Col span={12}>
                  <FormItem label='检测项详情页-检测结果' {...formItemLayout}>
                    {
                      getFieldDecorator('reportDetailJCJGPageId', {
                        initialValue: Object.keys(reportDetailJCJGPage).length > 0 ? reportDetailJCJGPage.id : undefined,
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
                            chooseList.reportDetailJCJGPage
                              ? chooseList.reportDetailJCJGPage.map(item => (
                                <Option value={item.id} key={item.id}>{item.pageName}</Option>
                              ))
                              : null
                          }
                        </Select>
                      )
                    }
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <FormItem label='检测项详情页-科学细节' {...formItemLayout}>
                    {
                      getFieldDecorator('reportDetailKXXJPageId', {
                        initialValue:Object.keys(reportDetailKXXJPage).length > 0 ? reportDetailKXXJPage.id : undefined,
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
                            chooseList.reportDetailKXXJPage
                              ? chooseList.reportDetailKXXJPage.map(item => (
                                <Option value={item.id} key={item.id}>{item.pageName}</Option>
                              ))
                              : null
                          }
                        </Select>
                      )
                    }
                  </FormItem>
                </Col>
              </Row>
            </Form>
          </div>
        </Modal>
      </div>
    )
  }
}

PageSettingForm.propTypes = {
  onCancel: PropTypes.func,
  visible: PropTypes.bool,
  form: PropTypes.object,
  // onLoadData: PropTypes.func,
  id: PropTypes.number,
}

const PageSetting = Form.create()(PageSettingForm)

export default PageSetting
