import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Modal, Form, Select, Row, Col, Button, InputNumber, Popconfirm, Icon, message, } from 'antd'
import Api from '@/common/api'
import DataTable from '@/components/data-table'
const confirm = Modal.confirm
const FormItem = Form.Item
const Option = Select.Option
class TraitSettingForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      imgList:[],
      editInfo:{},
      categoryList:[],
      traitList:[],
      tableData:[],
      categoryId:'',
      traitId:''
    }
    this.columns = [
      {
        title: '检测项分类',
        dataIndex: 'categoryName'
      },
      {
        title: 'Trait_code',
        dataIndex: 'traitCode'
      },
      {
        title: 'Trait_name',
        dataIndex: 'traitName'
      },
      {
        title: '权重',
        render: (text, record, index) => (
          <InputNumber size='small' min={1} defaultValue={record.traitSort}
            onBlur={(e) => this.editThis(record, e.target.value)}
            style={{ width: '150px', height:'32px', lineHeight:'32px' }} />
        )
      },
      {
        title: '操作',
        render: (record) => (
          <Popconfirm
            title='确认删除吗？'
            icon={<Icon type='question-circle-o' style={{ color: 'red' }} />}
            onConfirm={() => this.onDelete(record)}
          >
            <a href='#'>删除</a>
          </Popconfirm>

        )
      }
    ]
  }
  componentDidMount () {
    const { categoryFlag } = this.props
    if (categoryFlag === 1) {
      this.getTraitCategoryListByReportId()
    }
    this.getAllTraitList()
    this.getDefinitionUserReportConfigByConfigId()
  }
  // 获取检测项分类
  getTraitCategoryListByReportId=() => {
    const { id } = this.props
    let params = {
      reportId:id
    }
    Api.getTraitCategoryListByReportId(params).then(res => {
      if (res) {
        this.setState({
          categoryList:Object.assign([], res)
        })
      }
    })
  }
  // 选择检测项
  getAllTraitList=() => {
    Api.getAllTraitList().then(res => {
      if (res) {
        res.forEach(item => {
          item.concatName = item.traitName + '(' + item.traitCode + ')' + ' ' + item.displayType + '-' + item.channelCode + '-' + item.applicableU + '-' + item.theme
        })
        this.setState({
          traitList:Object.assign([], res)
        })
      }
    })
  }
  // 配置检测项列表
  getDefinitionUserReportConfigByConfigId =() => {
    const { id } = this.props
    let params = {
      userReportConfigId:id
    }
    Api.getDefinitionUserReportConfigByConfigId(params).then(res => {
      if (res) {
        this.setState({
          tableData:Object.assign([], res)
        })
      }
    })
  }
  addTrait=() => {
    const { id } = this.props
    const { tableData, traitList, categoryList } = this.state
    const { categoryFlag } = this.props
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let params = {
          categoryId:values.categoryId,
          traitId:values.traitId,
          traitSort:100,
          reportConfigId:id
        }
        Api.saveReportModuleRepCatTraitCfg(params).then(res => {
          if (res) {
            let _traitCode, _traitName, _categoryName
            if (categoryFlag === 1) {
              categoryList.forEach(item => {
                if (item.id === values.categoryId) {
                  _categoryName = item.categoryName
                }
              })
            }
            traitList.forEach(item => {
              if (item.id === values.traitId) {
                _traitCode = item.traitCode
                _traitName = item.traitName
              }
            })
            message.success('添加成功！')
            this.getDefinitionUserReportConfigByConfigId()
            // tableData.push({
            //   categoryId:values.categoryId,
            //   categoryName:categoryFlag === 1 ? _categoryName : '',
            //   traitId:values.traitId,
            //   traitCode:_traitCode,
            //   traitName:_traitName,
            //   traitSort:100,
            //   reportConfigId:id
            // })
            // this.setState({
            //   tableData
            // })
          }
        })
      }
    })
  }
  editThis=(record, val) => {
    console.log(record)
    const { categoryFlag } = this.props
    if (record.catTraitCfgId === undefined) {

    } else {
      let params = {
        id:record.catTraitCfgId,
        categoryId:categoryFlag === 1 ? record.categoryId : '',
        traitId:record.definitionId,
        traitSort:+val,
        reportConfigId:record.userReportConfigId
      }
      Api.updateReportModuleRepCatTraitCfg(params).then(res => {
        if (res) {
          message.success('编辑成功！')
        }
      })
    }
  }
  onDelete=(record) => {
    const { tableData } = this.state
    let params = {
      id:record.catTraitCfgId,
    }
    Api.deleteReportModuleRepCatTraitCfg(params).then(res => {
      if (res) {
        message.success('删除成功！')
        tableData.forEach((item, index) => {
          if (item.catTraitCfgId === record.catTraitCfgId) {
            tableData.splice(index, 1)
          }
        })
        this.setState({
          tableData
        })
      }
    })
  }
  handleCancel = (e) => {
    this.props.onCancel()
  }
  handleConfirm = (e) => {
    const {productCode} = this.props;
    let _self = this;
    confirm({
      title: '',
      content: '已有当前报告的用户，可在新增报告模块中查看到新添加的检测项，是否确定添加？',
      onOk () {
        Api.getcheckTraitInfoToMsg({ productCode }).then(res => {
          if (res) {
            message.success('配置成功！')
            _self.props.onLoadData()
            _self.handleCancel()
          }
        })
      },
      cancelButtonProps: {
        style: { display: 'none' },
      },
    })

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
    const { categoryList, traitList, tableData, categoryId, traitId } = this.state
    const { visible, form:{ getFieldDecorator }, categoryFlag } = this.props

    return (
      <div>
        <Modal
          visible={visible}
          maskClosable={false}
          onCancel={this.handleCancel}
          onOk={this.handleConfirm}
          width={900}
          title={'配置检测项'}
        >
          <div>
            <Form>
              <Row>
                {
                  categoryFlag === +1
                    ? <Col span={20}>
                      <FormItem label='检测项分类' {...formItemLayout1}>
                        {
                          getFieldDecorator('categoryId', {
                            initialValue: categoryId,
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
                                categoryList.map((item, index) => (
                                  <Option value={item.id} key={index}>{item.categoryName}</Option>
                                ))
                              }
                            </Select>
                          )
                        }
                      </FormItem>
                    </Col>
                    : null
                }
              </Row>
              <Row>
                <Col span={20}>
                  <FormItem label='选择检测项' {...formItemLayout1}>
                    {
                      getFieldDecorator('traitId', {
                        initialValue: traitId,
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
                            traitList.map((item, index) => (
                              <Option value={item.id} key={index}>{item.concatName}</Option>
                            ))
                          }
                        </Select>
                      )
                    }
                  </FormItem>
                </Col>
                <Col span={4}>
                  <Button type='primary' style={{ marginLeft:'10px', marginTop:'5px' }} onClick={() => this.addTrait()}>添加</Button>
                </Col>
              </Row>
            </Form>
            {
              <div>
                <DataTable
                  rowKey='id'
                  columns={categoryFlag === 1 ? this.columns : this.columns.slice(1)}
                  list={tableData}
                  pagination={false}
                />
              </div>
            }
          </div>
        </Modal>
      </div>
    )
  }
}
TraitSettingForm.propTypes = {
  onCancel: PropTypes.func,
  visible: PropTypes.bool,
  form: PropTypes.object,
  onLoadData: PropTypes.func,
  id: PropTypes.number,
  categoryFlag:PropTypes.number
}

const TraitSetting = Form.create()(TraitSettingForm)

export default TraitSetting
