import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Modal, Form, Row, Col, Select, message } from 'antd'
import Api from '@/common/api'
const FormItem = Form.Item
const Option = Select.Option

class QuestionModalForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      questionList:[]
    }
  }

  handleCancel = (e) => {
    this.props.onCancel()
  }
  componentDidMount () {
    this.qnaireMenuInfo()
  }
  qnaireMenuInfo = () => {
    Api.qnaireMenuInfo().then(res => {
      if (res) {
        res.forEach((item, index) => {
          item.concatName = item.qnaireCode + '-' + item.questionaireName
        })
        this.setState({
          questionList: res,
        })
      }
    })
  }
  handleConfirm=(e) => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { id } = this.props
        console.log(values)
        let params = {
          qnaireId:values.qnaireId,
          reportId:id,
        }
        Api.reportBindQnaire(params)
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
    const { form:{ getFieldDecorator } } = this.props
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
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
                    getFieldDecorator('qnaireId', {
                    //  initialValue: Object.keys(detailInfo).length > 0 ? detailInfo.channelCategory : undefined,
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
                          this.state.questionList.map((item, index) => (
                            <Option value={item.id} key={index}>{item.concatName}</Option>
                          ))
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
    )
  }
}

QuestionModalForm.propTypes = {
  form: PropTypes.object,
  onCancel: PropTypes.func
}

const QuestionSetting = Form.create()(QuestionModalForm)

export default QuestionSetting
