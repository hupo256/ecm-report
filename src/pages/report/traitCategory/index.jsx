import React, { Component } from 'react'
import { Input, Select, Form } from 'antd'
import SearchForm from '@/components/search-form'
import DataTable from '@/components/data-table'
import Api from '../service'
// import CategoryModal from './child/categoryModal'
const Option = Select.Option

export default class TraitCategoryConfig extends Component {
  constructor (props) {
    super(props)
    this.state = {
      query: {}, // 搜索条件
      pages: { total: 0, pageNum: 1, pageSize: 20 },
      tableData: [],
      visible: false, // 模态框
      isEdit: false,
      showModal: false,
      reportInfo: {},
      codeimg: {},
      storeVisible: false,
      reportList:[],
      id:'',
      pageType:1,
    }
    this.columns = [
      {
        title: '报告名称',
        dataIndex: 'reportName'
      },
      {
        title: '分类编号',
        dataIndex: 'categoryCode'
      },
      {
        title: '分类名称',
        dataIndex: 'categoryName'
      },
      {
        title: '分类描述',
        ataIndex: 'categoryDesc'
      },
      {
        title: '更新时间',
        dataIndex: 'updateTime'
      },
      {
        title: '操作',
        render: (record) => (
          <div>
            <a href='javascript:void(0)' style={{ marginRight:'15px' }} onClick={() => { this.doUpdate(record.id, 1) }}>编辑</a>
            <a href='javascript:void(0)' onClick={() => { this.advise(record.id, 2) }}>综合建议</a>
          </div>
        )
      }
    ]
  }

  componentDidMount = () => {
    this.getReportUserReport()
    this.getTraitCategoryList()
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
  getTraitCategoryList = () => {
    const { pages, query } = this.state
    const params = {
      pageNum: pages.pageNum,
      pageSize: pages.pageSize,
      ...query
    }
    Api.getTraitCategoryList(params).then(res => {
      if (res) {
        const { total } = res
        this.setState({
          tableData: res.data,
          pages: {
            ...pages,
            total
          }
        }, () => { })
      }
    })
  }

doSearch = (formdata = {}) => {
  const { pages } = this.state
  this.setState({
    query: {
      ...formdata,
    },
    pages: {
      ...pages,
      pageNum: 1,
      pageSize: 20
    }
  }, () => {
    this.getTraitCategoryList()
  })
}
pageChange = (obj) => {
  const { pages } = this.state
  this.setState({
    pages: {
      ...pages,
      pageNum: obj.current,
      pageSize: obj.pageSize
    }
  }, () => {
    this.getTraitCategoryList()
  })
}
doAdd = () => {
  this.setState({
    storeVisible: true,
    isEdit: false,
    pageType:1
  })
}
doCancelModal = () => {
  this.setState({
    storeVisible: false
  })
}
doUpdate = (id, type) => {
  this.setState({
    storeVisible: true,
    isEdit: true,
    id: id,
    pageType:type
  })
}
advise=(id, type) => {
  this.setState({
    storeVisible: true,
    id: id,
    pageType:type
  })
}
render () {
  const { tableData, pages, storeVisible, isEdit, id, reportList, pageType } = this.state
  const _btns = [
    {
      name: '新增',
      onClick: () => {
        this.doAdd()
      }
    }
  ]
  const _items = [
    {
      colSpan: 6,
      id: 'categoryCode',
      label: '检测项分类编号',
      key: '1',
      layout: {
        labelCol: { span: 8 },
        wrapperCol: { span: 16 },
      },
      componet: (
        <Input placeholder='请输入' autoComplete='off' />
      )
    },
    {
      colSpan: 6,
      id: 'categoryName',
      label: '检测项分类名称',
      key: '3',
      layout: {
        labelCol: { span: 8 },
        wrapperCol: { span: 16 },
      },
      componet: (
        <Input placeholder='请输入' autoComplete='off' />
      )
    },
    {
      colSpan: 6,
      id: 'reportId',
      label: '报告名称',
      key: '1',
      layout: {
        labelCol: { span: 8 },
        wrapperCol: { span: 16 },
      },
      componet: (
        <Select style={{ width: '100%' }}
          placeholder='请选择...'
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
    },
  ]
  return (
    <div>
      <div style={{ paddingTop: '15px' }}>
        <SearchForm
          items={_items}
          dataBtns={_btns}
          visibleReset
          onSearch={this.doSearch}
          form={Form}
          location={this.props.location}
        />
      </div>
      <div>
        <DataTable
          rowKey='id'
          columns={this.columns}
          list={tableData}
          total={pages.total}
          page={pages.pageNum}
          pageSize={pages.pageSize}
          onChange={this.pageChange}
        />
      </div>
      {/* {
        storeVisible
          ? <CategoryModal
            visible={storeVisible}
            isEdit={isEdit}
            pageType={pageType}
            id={id}
            onLoadData={this.getTraitCategoryList}
            onCancel={this.doCancelModal}
          /> : null
      } */}
    </div>
  )
}
}
