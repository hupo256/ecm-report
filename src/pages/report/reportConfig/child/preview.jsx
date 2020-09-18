import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Modal, Form, Select, Row, Col, Button, message } from 'antd'
import Api from '@/common/api'
import QRCode from 'qrcode.react'

const FormItem = Form.Item
const Option = Select.Option

class Preview extends Component {
  constructor (props) {
    super(props)
    this.state = {
      resultList:[],
      codeUrl:'',
      reportList:[],
      productId:'',
      productCode:'',
      priviewTraitConclusion:'',
      showCode:false,
    }
  }
  componentDidMount () {
    console.log(this.props.record)
    const { record } = this.props
    this.getTraitBaseConclusionInfo(record.definitionId ? record.definitionId : record.id)
    this.getNewUserReportConfig(record.definitionId ? record.definitionId : record.id)
  }
  getTraitBaseConclusionInfo=(id) => {
    const { resultList } = this.state
    Api.getTraitBaseConclusionInfo({ traitId:id }).then(res => {
      if (res) {
        for (let i in res) {
          resultList.push(res[i])
        }
        this.setState({
          resultList:res,
          priviewTraitConclusion:res[0].conclusionValue
        })
      }
    })
  }
  getNewUserReportConfig = (id) => {
    Api.getNewUserReportConfig({ traitId:id }).then(res => {
      if (res) {
        res.map((item, index) => {
          item.concatName = item.productCode + '-' + item.reportName
        })
        this.setState({
          reportList: res,
          productId:res[0].productId,
          productCode:res[0].productCode
        })
      }
    })
  }
  handleCancel = (e) => {
    this.props.onCancel()
  }
  onChangeProduct=(value) => {
    const { reportList } = this.state
    this.setState({
      productId:value,
      productCode:reportList.filter(item => item.productId === value).length ? reportList.filter(item => item.productId === value)[0].productCode : ''
    })
  }
  onChangeResult=(value) => {
    console.log(value)
    this.setState({
      priviewTraitConclusion:value,
    })
  }
  makeCode=() => {
    const { record } = this.props
    console.log(record)
    const { productId, productCode, priviewTraitConclusion } = this.state
    let flag = true
    if (productId === '' || productId === undefined || priviewTraitConclusion === '') {
      flag = false
      return message.error('请先选择所属产品和预览结论！！！')
    }
    if (flag) {
      this.setState({
        showCode:true,
        codeUrl:`${record.previewReportUrl}/report4_2?isPreviewFlag=true&code=${productCode}&expirationDateTime=${encodeURIComponent(this.getTime())}&id=${productId}&priviewTraitConclusion=${encodeURIComponent(priviewTraitConclusion)}&traitId=${record.definitionId ? record.definitionId : record.id}`
      }, () => {
        console.log(this.getTime(), priviewTraitConclusion, productId)
        console.log(`${record.previewReportUrl}/report4_2?isPreviewFlag=true&code=${productCode}&expirationDateTime=${this.getTime()}&id=${productId}&priviewTraitConclusion=${priviewTraitConclusion}&traitId=${record.definitionId ? record.definitionId : record.id}`)
      })
    }
  }
  getTime=() => { // 获取时间
    var date = new Date()
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()
    // 这样写显示时间在1~9会挤占空间；所以要在1~9的数字前补零;
    if (hour < 10) {
      hour = '0' + hour
    }
    if (minute < 10) {
      minute = '0' + minute
    }
    if (second < 10) {
      second = '0' + second
    }
    return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second
  }
  render () {
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    }
    const { resultList, codeUrl, reportList, showCode } = this.state
    const { visible, form:{ getFieldDecorator } } = this.props
    return (
      <div>
        <Modal
          maskClosable={false}
          visible={visible}
          width={850}
          title={'报告预览'}
          onCancel={this.handleCancel}
          footer={null}
        >
          <div>
            <Form>
              <Row>
                <Col span={18}>
                  <FormItem label='所属产品' {...formItemLayout}>
                    {
                      getFieldDecorator('productCode', {
                        initialValue: reportList.length ? reportList[0].productId : undefined,
                        rules: [{ required: true, message: '请选择' }]
                      })(
                        <Select
                          showSearch
                          optionFilterProp='children'
                          filterOption={(input, option) =>
                            option.props.children.indexOf(input) >= 0
                          }
                          style={{ width: '100%' }}
                          placeholder='请选择'
                          allowClear
                          onChange={value => { this.onChangeProduct(value) }}
                        >
                          {
                            reportList.map((item, index) => {
                              return <Option value={item.productId} key={index}>{item.concatName}</Option>
                            })
                          }
                        </Select>
                      )
                    }
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span={18}>
                  <FormItem label='选择预览结论' {...formItemLayout}>
                    {
                      getFieldDecorator('result', {
                        initialValue: resultList.length ? resultList[0].conclusionValue : undefined,
                        rules: [{ required: true, message: '请选择' }]
                      })(
                        <Select
                          style={{ width: '100%' }}
                          placeholder='请选择'
                          onChange={value => { this.onChangeResult(value) }}
                        >
                          {
                            resultList.map((item, index) => {
                              return <Option value={item.conclusionValue} key={index}>{item.conclusionValue}-{item.conclusionValueDisplay}</Option>
                            })
                          }
                        </Select>
                      )
                    }
                  </FormItem>
                </Col>
              </Row>
              <div style={{ textAlign:'center' }}><Button type='primary' onClick={this.makeCode}>生成二维码</Button></div>
              <div style={{ textAlign:'center', marginTop:'20px' }}>
                {
                  showCode
                    ? <QRCode
                      value={codeUrl} // value参数为生成二维码的链接
                      size={200} // 二维码的宽高尺寸
                      fgColor='#000000' // 二维码的颜色
                    />
                    : ''
                }

              </div>
            </Form>
          </div>
        </Modal>
      </div>
    )
  }
}

Preview.propTypes = {
  onCancel: PropTypes.func,
  visible: PropTypes.bool,
  form: PropTypes.object,
  // onLoadData: PropTypes.func,
  record: PropTypes.object,
}

const PageSetting = Form.create()(Preview)

export default PageSetting
