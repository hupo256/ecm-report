import React, { Component } from 'react'
import { Input, Select, Modal, Form } from 'antd'
import SearchForm from '@/components/search-form'
import DataTable from '@/components/data-table'
import Api from '../service'
// import ReportModal from './child/reportModal'
// import TraitSetting from './child/traitSetting'
// import DetailModal from './child/detailModal'
// import PageSetting from './child/pageSetting'
// import QuestionSetting from './child/questionSetting'
// import QuestionSettingMore from './child/questionSettingMore'
// import CategoryModal from '../traitCategoryConfig/child/categoryModal'
// import Preview from './child/preview'

const confirm = Modal.confirm
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
export default class reportConfig extends Component {
  constructor (props) {
    super(props)
    this.state = {
      query: {}, // 搜索条件
      pages: { total: 0, pageNum: 1, pageSize: 20 },
      tableData: [],
      visible: false, // 模态框
      isEdit: false,
      showModal: false,
      showDetail:false,
      reportInfo: {},
      codeimg: {},
      storeVisible: false,
      id:'',
      paramsId:'',
      settingVisible:false, // 配置检测项
      categoryFlag:0, // 是否有检测项分类
      pageSettingFlag:'',
      questionSettingFlag:false,
      adviseFlag:false, // 综合建议
      productCode:'',
      productCodeConfig:'',
      previewFlag:false, // 预览报告
      record:{},
      reportShowType:'',
      isHaveQnaire:'',
      qnaireStatus:'',
      reportName:'',
      productId:'',
      questionSettingMoreFlag: false // 配置综合问卷弹框
    }
    this.columns = [
      {
        title: '报告码',
        dataIndex: 'productCode'
      },
      {
        title: '报告名称',
        dataIndex: 'reportName'
      },
      {
        title: '产品对应报告类型',
        render: (record) => (
          <span>
            {
              reportTypeList.map(item => {
                if (item.id === record.productReportType) {
                  return item.name
                }
              })
            }
          </span>
        )
      },
      {
        title: '报告列图片',
        width:80,
        render: (record) => (
          <div>
            <a onClick={() => { this.handleLookImg(record.reportListPic == null ? [] : record.reportListPic) }}>查看</a>
          </div>
        )
      },
      {
        title: '对应产品ID',
        dataIndex:'productId'
      },
      {
        title: '是否有分类检测项',
        width:100,
        render: (record) => (
          <span>
            {
              record.categoryFlag === 1 ? '是' : '否'
            }
          </span>
        )
      },
      {
        title: '报告展示类型',
        width:80,
        render: (record) => (
          <span>
            {
              record.reportShowType === 1 ? '常规' : record.reportShowType === 2 ? '场景化' : record.reportShowType === 3 ? '特殊类' : ''
            }
          </span>
        )
      },
      {
        title: '更新时间',
        dataIndex: 'updateTime'
      },
      {
        title: '操作',
        width: 280,
        // fixed: 'right',
        render: (record) => (
          <div>
            <a onClick={() => { this.doUpdate(record) }}>编辑</a>
            <a style={{ margin:'0 10px' }}onClick={() => { this.reportSetting(record, record.categoryFlag) }}>配置检测项</a>
            <a onClick={() => { this.pageSetting(record.id) }}>配置页面</a>
            <a style={{ marginLeft:'10px' }} onClick={() => { this.questionSetting(record.productCode) }}>配置问卷</a>
            {
              record.isCompreSugFlag === 1 ? <a style={{ marginRight:'10px' }} onClick={() => { this.advise(record) }}>综合建议</a> : ''
            }
            {
              record.isRedirectH5 === 1
                ? <a style={{ color:'#666' }}>已发布H5</a>
                : <a onClick={() => { this.releaseH5(record.id) }}>发布H5报告</a>
            }
            <a style={{ marginLeft:'10px' }} onClick={() => { this.questionSettingMore(record.productCode,record.id) }}>配置综合问卷</a>
          </div>
        )
      }
    ]
    this.secordColumns = [
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
        title: '操作',
        width: 200,
        render: (record) => (
          <div>
            <a onClick={() => { this.goNewPage(record) }}>报告配置</a>
            <a style={{ margin:'0 10px' }}onClick={() => { this.previewReport(record) }}>预览</a>
            {
              record.isRenovateFlag === 2
                ? ''
                : record.isRenovateFlag === 1
                  ? <a onClick={() => { this.updateThis(record.definitionId) }}>更新内容</a>
                  : <a style={{ color:'#666' }}>已更新</a>
            }
          </div>
        )
      },
      {
        title: '操作人',
        dataIndex: 'updateUser'
      },
    ]
  }

  componentDidMount = () => {
    if (this.props.location.state === undefined) {
      sessionStorage.setItem('params', JSON.stringify({ 'pageNum':1, 'pageSize':20 }))
    }
    this.setState({
      reportShowType:sessionStorage.params ? JSON.parse(sessionStorage.params).reportShowType : '',
      reportName:sessionStorage.params ? JSON.parse(sessionStorage.params).reportName : '',
      productCode:sessionStorage.params ? JSON.parse(sessionStorage.params).productCode : '',
      qnaireStatus:sessionStorage.params ? JSON.parse(sessionStorage.params).qnaireStatus : '',
    }, () => {
      this.getUserReportConfigList()
    })
  }
  getUserReportConfigList = () => {
    const { pages, query, reportShowType, reportName, productCode,isHaveQnaire,qnaireStatus } = this.state
    const params = {
      pageNum: pages.pageNum,
      pageSize: pages.pageSize,
      reportShowType,
      reportName,
      productCode,
      isHaveQnaire,
      qnaireStatus
    }
    sessionStorage.setItem('params', JSON.stringify(params))
    Api.getUserReportConfigList(params).then(res => {
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
  doUpdate=(record) => {
    this.setState({
      storeVisible: true,
      isEdit: true,
      id: record.id,
      productId:record.productId
    })
  }
  handleLookImg = (imgs) => {
    const { showDetail } = this.state
    this.setState({
      curImgs: imgs,
      showDetail: !showDetail
    })
  }

// 搜索事件
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
    this.getUserReportConfigList()
  })
}
doAdd = () => {
  this.setState({
    storeVisible: true,
    isEdit: false,
  })
}
doCancelModal = () => {
  this.setState({
    storeVisible: false,
    settingVisible: false,
    pageSettingFlag:false,
    questionSettingFlag:false,
    adviseFlag:false,
    previewFlag:false,
    questionSettingMoreFlag: false
  })
}
reportSetting=(record, flag) => {
  this.setState({
    settingVisible: true,
    id:record.id,
    productCodeConfig:record.productCode,
    categoryFlag:flag
  })
}
pageSetting=(id) => {
  this.setState({
    pageSettingFlag: true,
    id:id,
  })
}
questionSetting=(id) => {
  this.setState({
    questionSettingFlag: true,
    id:id,
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
    this.getUserReportConfigList()
  })
}
closeModal = () => {
  this.setState({
    visible: false,
    showDetail: false,
    isEdit: false,
    rowDetail: {},
    curImgs: ''
  })
}
 // 渲染明细
 renderOrderDetail = (data) => {
   console.log(data)
   return (
     <div style={{ width: '800px' }}>
       <DataTable
         rowKey='id'
         columns={this.secordColumns}
         list={data || []}
         pagination={false}
       />
     </div>
   )
 }
 advise=(record) => {
   this.setState({
     adviseFlag: true,
     id: record.id,
     productCode:record.productCode
   })
 }
 // 发布h5报告
 releaseH5=(id) => {
   let _this = this
   confirm({
     title: '确定要执行此操作吗？',
     content: '发布后即从原生报告更新为H5报告，确定执行此操作？',
     onOk () {
       Api.releaseRedirectH5({ reportConfigId:id }).then(res => {
         if (res) {
           _this.getUserReportConfigList()
         }
       })
     }
   })
 }
 previewReport=(record) => {
   this.setState({
     previewFlag: true,
     record:record,
   })
 }
 // 更新内容
 updateThis=(id) => {
   let _this = this
   confirm({
     title: '确定要执行此操作吗？',
     content: '确认更新内容吗，确定执行此操作？',
     onOk () {
       Api.renovatePageModuleContent({ traitId:id }).then(res => {
         if (res) {
           _this.getUserReportConfigList()
         }
       })
     }
   })
 }
  // 报告配置
  goNewPage=(record) => {
    this.props.history.push('/report/braftEditors')
    localStorage.setItem('record', JSON.stringify(record))
    localStorage.setItem('fromPage', 2)
  }

  onExpand=(expanded, record) => {
    const { id, categoryFlag } = record
    const { tableData } = this.state
    let _index = tableData.findIndex(item => { return item.id == id })
    if (expanded && _index >= 0) {
      let params = {
        id, categoryFlag,
        loadingTag: 1,
      }
      if (tableData[_index].extendData && tableData[_index].extendData.length >= 0) return
      Api.getreportModuleTraitDefinition(params).then(res => {
        if (res) {
          tableData[_index].extendData = res
          this.setState({ tableData })
        }
      })
    }
  }
  // 配置综合问卷
  questionSettingMore = (id,paramsId) => {
    this.setState({
      questionSettingMoreFlag: true,
      id,
      paramsId
    })
  }
  render () {
    const { tableData, pages, storeVisible, isEdit, id, settingVisible, categoryFlag, curImgs, showDetail,
      pageSettingFlag, questionSettingFlag, adviseFlag, productCode, previewFlag, record, reportShowType,
      reportName, productCodeConfig, productId, questionSettingMoreFlag ,isHaveQnaire,
      qnaireStatus,paramsId} = this.state
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
        id: 'reportShowType',
        label: '报告展示类型',
        key: '1',
        layout: {
          labelCol: { span: 8 },
          wrapperCol: { span: 16 },
        },
        options: { initialValue:reportShowType },
        componet: (
          <Select style={{ width: '100%' }}
            placeholder='请选择...'
            allowClear
            showSearch
            optionFilterProp='children'
            filterOption={(input, option) =>
              option.props.children.indexOf(input) >= 0
            }
            onChange={(value) => this.setState({ reportShowType:value })}
          >
            <Option value={1} key={1}>常规</Option>
            <Option value={2} key={2}>场景化</Option>
            <Option value={3} key={3}>特殊类</Option>
          </Select>
        )
      },
      {
        colSpan: 6,
        id: 'reportName',
        label: '报告名称',
        key: '2',
        layout: {
          labelCol: { span: 8 },
          wrapperCol: { span: 16 },
        },
        options: { initialValue:reportName },
        componet: (
          <Input placeholder='请输入...' autoComplete='off' onChange={(e) => this.setState({ reportName:e.target.value })} />
        )
      },
      {
        colSpan: 6,
        id: 'productCode',
        label: '报告码',
        key: '3',
        layout: {
          labelCol: { span: 8 },
          wrapperCol: { span: 16 },
        },
        options: { initialValue:productCode },
        componet: (
          <Input placeholder='请输入...' autoComplete='off' onChange={(e) => this.setState({ productCode:e.target.value })} />
        )
      },
      {
        colSpan: 8,
        id: 'isHaveQnaire',
        label: '是否配置综合问卷',
        key: '1',
        layout: {
          labelCol: { span: 8 },
          wrapperCol: { span: 16 },
        },
        options: { initialValue:isHaveQnaire },
        componet: (
          <Select style={{ width: '100%' }}
            placeholder='请选择...'
            allowClear
            showSearch
            optionFilterProp='children'
            filterOption={(input, option) =>
              option.props.children.indexOf(input) >= 0
            }
            onChange={(value) => this.setState({ isHaveQnaire:value })}
          >
            <Option value={1} key={1}>是</Option>
            <Option value={0} key={0}>否</Option>
          </Select>
        )
      },
      {
        colSpan: 6,
        id: 'qnaireStatus',
        label: '发布状态',
        key: '1',
        layout: {
          labelCol: { span: 8 },
          wrapperCol: { span: 16 },
        },
        options: { initialValue:qnaireStatus },
        componet: (
          <Select style={{ width: '100%' }}
            placeholder='请选择...'
            allowClear
            showSearch
            optionFilterProp='children'
            filterOption={(input, option) =>
              option.props.children.indexOf(input) >= 0
            }
            onChange={(value) => this.setState({ qnaireStatus:value })}
          >
            <Option value={1} key={1}>是</Option>
            <Option value={0} key={0}>否</Option>
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
            scroll={{ x: 1290 }}
            onExpand={(expanded, record) => this.onExpand(expanded, record)}
            expandedRowRender={(record, index) => (
              this.renderOrderDetail(record.extendData)
            )}
            total={pages.total}
            pageSize={pages.pageSize}
            page={pages.pageNum}
            onChange={this.pageChange}
          />
        </div>
        {/* {
          storeVisible
            ? <ReportModal
              visible={storeVisible}
              isEdit={isEdit}
              id={id}
              productId={productId}
              onLoadData={this.getUserReportConfigList}
              onCancel={this.doCancelModal}
            /> : null
        } */}
        {/* {
          settingVisible
            ? <TraitSetting
              productCode={productCodeConfig}
              visible={settingVisible}
              id={id}
              categoryFlag={categoryFlag}
              onLoadData={this.getUserReportConfigList}
              onCancel={this.doCancelModal}
            /> : null
        }
        {
          pageSettingFlag
            ? <PageSetting
              visible={pageSettingFlag}
              id={id}
              onLoadData={this.getUserReportConfigList}
              onCancel={this.doCancelModal}
            /> : null
        }
        {
          showDetail ? <DetailModal
            imgs={curImgs}
            onCancel={this.closeModal}
          /> : null
        }
        {
          questionSettingFlag ? <QuestionSetting
            visible={questionSettingFlag}
            id={id}
            onLoadData={this.getUserReportConfigList}
            onCancel={this.doCancelModal}
          /> : null
        } */}
        {/* 配置综合问卷 */}
        {/* {
          questionSettingMoreFlag
            ? <QuestionSettingMore
              id={id}
              paramsId={paramsId}
              onLoadData={this.getUserReportConfigList}
              onCancel={this.doCancelModal}
            />
            : null
        }
        {
          adviseFlag
            ? <CategoryModal
              visible={adviseFlag}
              pageType={3}
              productCode={productCode}
              id={id}
              onLoadData={this.getUserReportConfigList}
              onCancel={this.doCancelModal}
            /> : null
        }
        {
          previewFlag
            ? <Preview
              visible={previewFlag}
              record={record}
              onLoadData={this.getUserReportConfigList}
              onCancel={this.doCancelModal}
            /> : null
        } */}
      </div>
    )
  }
}
