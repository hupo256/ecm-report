import React from 'react'
import PropTypes from 'prop-types'
import { Form, Row, Col, Button, Input } from 'antd'
const FormItem = Form.Item
/**
 * @param {Object[]} items - 列表项数组
 * id: 唯一标识字符串
 * label: 名称
 * componet: 组件
 * key: 唯一key(非必填)
 * layout: 自定义布局(非必填)
 * colSpan: 宽度(非必填)
 * options: 必填以及校验规则配置(非必填)
 * @param {Function} onSearch - 搜索回调函数
 * @param {Function} reset - 重置回调函数(非必填)
 * @param {Object[]} btns - 扩展按钮
 * name: 按钮名称
 * type: 按钮样式
 * onClick: 点击事件回调函数
 * @class SearchForm
 * @extends {React.Component}
 */
class SearchForm extends React.Component {
  formRef = React.createRef();

  componentDidMount(){
    this.setTheForm()
  }

  setTheForm = () => {
    const params = sessionStorage.params && JSON.parse(sessionStorage.params)
    if (this.props.location.state) {
      if(params) this.formRef.current.setFieldsValue(params)
    }
  }

  handleSearch = (fn) => {
    // e.preventDefault()
    const { format = [] } = this.props
    this.formRef.current.validateFields().then(values => {
      let obj = {}
      if (format.length) {
        format.map(item => {
          const type = item.type || 'YYYY-MM-DD'
          const name = item.name
          if (typeof name === 'object') {
            const [start, end] = name
            if (values[start] && values[start].length) {
              obj[end] = values[start][1].format(type)
              obj[start] = values[start][0].format(type)
              return
            }
            values[start] = ''
            values[end] = ''
          } else {
            obj[name] = values[name] ? values[name].format(type) : ''
          }
        })
      }
      fn({ ...values, ...obj })
    })
  }

  handleReset = () => {
    this.props.form.resetFields()
    this.props.reset && this.props.reset()
  }
  handleValuesChange = (e) => {
    console.log(e)
  }
  render() {
    const { form, items, btns = [], title, visibleReset, dataBtns = [], onSearch } = this.props
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    }

    return (
      <Form
        ref={this.formRef}
        onFinish={this.handleSearch}
        style={{ padding: '0 24px 15px 24px' }}
      >
        <Row gutter={10}>
          {items.map(item => {
            return <Col span={item.colSpan || 6} key={item.id} style={{ textAlign: 'left' }}>
              <FormItem
                label={item.label}
                key={item.key}
                name={item.id}
                initialValue={item.options ? item.options.initialValue : null}
                {...(item.layout || formItemLayout)}
              >
                {item.componet || <Input disabled={item.disabled} />}
              </FormItem>
            </Col>
          })
          }
        </Row>
        <Row>
          <Col span={24} style={{ textAlign: 'right' }}>
            <Button type='primary'
              onClick={() => { this.handleSearch(onSearch) }}
            >{title || '搜索'}</Button>
            {
              !visibleReset
                ? <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>重置</Button> : ''
            }
            {btns.map((item, index) => (
              <Button
                key={`btn-${index}`}
                type={item.type || 'primary'}
                style={{ marginLeft: 8 }}
                onClick={() => item.onClick()}>{item.name}</Button>
            ))}
            {dataBtns.map((item, index) => (
              <Button
                key={`btn-${index}`}
                type={item.type || 'primary'}
                style={{ marginLeft: 8 }}
                onClick={() => this.handleSearch(item.onClick)}>{item.name}</Button>
            ))}
          </Col>
        </Row>
      </Form>
    )
  }
}

SearchForm.propTypes = {
  form: PropTypes.object.isRequired,
  items: PropTypes.array.isRequired,
  onSearch: PropTypes.func.isRequired,
  btns: PropTypes.array,
  dataBtns: PropTypes.array,
  title: PropTypes.string,
  reset: PropTypes.func,
  format: PropTypes.array,
  visibleReset: PropTypes.bool
}

export default SearchForm
// export default Form.create()(SearchForm)
