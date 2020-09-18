import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Modal, Form, Row, Col, Select, message, Checkbox, Upload, Icon } from 'antd'
import Api from '@/common/api'
import { getStore } from '@/utils/localstore.js'
import { config } from '@/common/tools.js'
import Thumbnail from '../../thumbnail'
const FormItem = Form.Item
const Option = Select.Option
const uploadUrl = config.host + 'product/imageUpload'

class QuestionModalMoreForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      questionList:[],
      checked: false,
      picList: [],
      detailInfo: {}
    }
  }

  handleCancel = (e) => {
    this.props.onCancel()
  }
  componentDidMount () {
    this.qnaireMenuInfo()
    this.handleQueryQnaireInfo()
  }
  handleQueryQnaireInfo = () => {
    const { id } = this.props
    Api.getReportQnaireInfo({ productCode:id }).then(res => {
      const { exampleUrl, issueFlag } = res || {}
      const picList = []
      if (exampleUrl) {
        picList.push({
          filePath: exampleUrl.split('/').fill('', 0, 3).join('/').substr(3),
          fileUrl: exampleUrl
        })
      }
      this.setState({
        detailInfo: res || {},
        checked: issueFlag === 1,
        picList
      })
    })
  }
  qnaireMenuInfo = () => {
    Api.getNewQnaireList().then(res => {
      if (res) {
        this.setState({
          questionList: res,
        })
      }
    })
  }
  onchange = e => {
    this.setState({
      checked: e.target.checked
    })
  }
  // 校验上传图片大小
  beforeUpload = (file) => {
    const isLt1M = (file.size / 1024 / 1024 * 100) / 100 < 10
    if (!isLt1M) {
      message.error('图片大小不可大于 10M!')
    }
    return isLt1M
  }
  // 上传图片
  handleChange = (info, type, type1) => {
    if (info.file.status !== 'uploading') {
    }
    if (info.file.status === 'done') {
      if (+info.file.response.code === 0) {
        message.success(`${info.file.name} 上传成功。`)
        let name = info.file.response.result
        let { picList } = this.state
        picList.push(name)
        this.setState({ picList })
      } else {
        message.error(`${info.file.name} 上传失败。`)
      }
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 上传失败。`)
    }
  }
  deleteIndexImg = (type) => {
    this.setState({
      picList: []
    })
    this.props.form.setFieldsValue({
      exampleUrl: ''
    })
  }
  handleConfirm=(e) => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { id ,paramsId} = this.props
        const { checked, picList } = this.state
        console.log(picList)
        let params = {
          newQnaireId: values.newQnaireId,
          productCode: id,
          exampleUrl: picList[0].filePath,
          issueFlag: checked ? 1 : 0,
          id:paramsId
        }
        Api.setReportQnaireInfo(params).then(res => {
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
    const { checked, questionList, picList, detailInfo } = this.state
    const { form:{ getFieldDecorator } } = this.props
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    }
    const props = (type) => {
      return {
        name: 'file',
        action: uploadUrl,
        listType: 'picture-card',
        showUploadList: false,
        headers: {
          token: getStore('token')
        },
        beforeUpload: (file) => {
          return this.beforeUpload(file)
        },
        onChange: (info) => {
          this.handleChange(info, type)
        }
      }
    }
    return (
      <Modal
        title='问卷配置'
        maskClosable={false}
        visible
        width={600}
        onCancel={this.handleCancel}
        onOk={this.handleConfirm}
      >
        <div>
          <Form>
            <Row>
              <Col>
                <FormItem label='选择问卷' {...formItemLayout}>
                  {
                    getFieldDecorator('newQnaireId', {
                      initialValue: detailInfo.newQnaireId || '',
                      rules: [
                        { required: true, message: '请选择' }
                      ]
                    })(
                      <Select style={{ width: '100%' }}
                        placeholder='请选择'
                        allowClear
                        showSearch
                        optionFilterProp='children'
                        filterOption={(input, option) =>
                          option.props.children.indexOf(input) >= 0
                        }
                      >
                        {
                          questionList.map((item, index) => (
                            <Option value={item.id} key={index}>{item.name}</Option>
                          ))
                        }
                      </Select>
                    )
                  }
                </FormItem>
                <FormItem label='示例结果图片' {...formItemLayout}>
                  {
                    getFieldDecorator('exampleUrl', {
                      initialValue: detailInfo.exampleUrl || '',
                      rules: [
                        { required: true, message: '请上传图片' }
                      ]
                    })(
                      <div>
                        {
                          picList.length ? <span>
                            {
                              picList.map((item, index) => (
                                <Thumbnail key={index}
                                  imgUrl={item.fileUrl}
                                  imgIndex={index}
                                  onDelete={this.deleteIndexImg} />
                              ))
                            }
                          </span> : <span>
                            <Upload {...props(2)}
                            >
                              <Icon type='plus' />
                              <div>上传图片</div>
                            </Upload>
                          </span>
                        }
                      </div>
                    )
                  }
                </FormItem>
                <FormItem label='模块状态' {...formItemLayout}>
                  {
                    getFieldDecorator('issueFlag', {
                    })(
                      <Checkbox checked={checked} onClick={this.onchange}>发布</Checkbox>
                    )
                  }
                </FormItem>
              </Col>
            </Row>
          </Form>
        </div>
      </Modal>
    )
  }
}

QuestionModalMoreForm.propTypes = {
  form: PropTypes.object,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func,
  id: PropTypes.string,
}

const QuestionSettingMore = Form.create()(QuestionModalMoreForm)

export default QuestionSettingMore
