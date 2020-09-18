import React, { Component } from 'react'
import { Input, Select, Modal, Form } from 'antd'
import SearchForm from '@/components/search-form'
import DataTable from '@/components/data-table'
import Api from '../service'

// import TraitConfigModal from './child/traitConfigModal'
// import ScientificText from './child/scientificText'
// import ImportModal from './child/importModal'
// import Preview from '../reportConfig/child/preview'
const Option = Select.Option
const confirm = Modal.confirm

export default class TraitConfig extends Component {
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
      id:'',
      scientificTextFlag:false,
      lookText:{},
      importVisible:false,
      pageConfigInfoList:[],
      reportList:[],
      previewFlag:false, // 预览报告
      record:{},
      traitName:'',
      traitCode:'',
      productCode:''
    }
    this.columns = [
      {
        title: 'Trait_code',
        dataIndex: 'traitCode'
      },
      {
        title: 'Trait_name',
        dataIndex: 'traitName'
      },
      {
        title: '场景',
        dataIndex: 'theme'
      },
      {
        title: '应用人群',
        render: (record) => (
          <span>
            {record.applicableU === 'KID' ? '宝宝' : '成人'}
          </span>
        )
      },
      {
        title: '更新时间',
        dataIndex: 'updateTime'
      },
      {
        title: '所属报告',
        width:'300px',
        dataIndex: 'subordinateProduct'
      },
      {
        title: '操作',
        width:'340px',
        render: (record) => (
          <div>
            <a onClick={() => { this.doUpdate(record.id, record.pageConfigInfoList) }}>编辑</a>
            <a style={{ marginLeft:'10px' }} onClick={() => { this.textLook(record) }}>查看doc文案</a>
            <a style={{ marginLeft:'10px' }} onClick={() => this.goPageDetail(record)} >报告配置</a>
            <a style={{ margin:'0 10px' }}onClick={() => { this.previewReport(record) }}>预览</a>
            {
              record.isRenovateFlag === 2
                ? ''
                : record.isRenovateFlag === 1
                  ? <a onClick={() => { this.updateThis(record.id) }}>更新内容</a>
                  : <a style={{ color:'#666' }}>已更新</a>
            }
          </div>
        )
      }
    ]
  }
  componentDidMount = () => {
    if (this.props.location.state === undefined) {
      sessionStorage.setItem('params', JSON.stringify({ 'pageNum':1, 'pageSize':20 }))
    }
    this.setState({
      traitName:sessionStorage.params ? JSON.parse(sessionStorage.params).traitName : '',
      traitCode:sessionStorage.params ? JSON.parse(sessionStorage.params).traitCode : '',
      productCode:sessionStorage.params ? JSON.parse(sessionStorage.params).productCode : ''
    }, () => {
      this.traitList()
    })
    this.getNewUserReportConfig()
  }
  traitList = () => {
    const { pages, query, traitName, traitCode, productCode } = this.state
    const params = {
      pageNum: pages.pageNum,
      pageSize: pages.pageSize,
      // ...query,
      traitName,
      traitCode,
      productCode,
      loadingTag:1,
    }
    sessionStorage.setItem('params', JSON.stringify(params))
    Api.getTraitList(params).then(res => {
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

  getNewUserReportConfig = () => {
    Api.getNewUserReportConfig({ traitId:'' }).then(res => {
      if (res) {
        res.map((item, index) => {
          item.concatName = item.productCode + '-' + item.reportName
        })
        this.setState({
          reportList: res,
        })
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
    this.traitList()
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
    this.traitList()
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
    scientificTextFlag:false,
    previewFlag:false
  })
}
doUpdate = (id, list) => {
  console.log(list)
  this.setState({
    storeVisible: true,
    isEdit: true,
    id: id,
    pageConfigInfoList:list === null ? [] : list
  })
}
textLook=(record) => {
  // console.log(record)
  this.setState({
    scientificTextFlag: true,
    lookText:Object.assign({}, record),
  })
}
importThis=() => {
  const { importVisible } = this.state
  this.setState({ importVisible:!importVisible })
}
goPage=(value) => {
  console.log(value)
}
goPageDetail=(record) => {
  this.props.history.push('/report/braftEditors')
  localStorage.setItem('record', JSON.stringify(record))
  localStorage.setItem('fromPage', 1)
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
           _this.traitList()
         }
       })
     }
   })
 }
 render () {
   const { tableData, pages, storeVisible, isEdit, id, scientificTextFlag, lookText, importVisible,
     pageConfigInfoList, reportList, previewFlag, record, traitName, traitCode, productCode } = this.state
   const _btns = [
     {
       name:'导入检测项基础信息',
       onClick:() => { this.importThis() }
     },
   ]
   const _items = [
     {
       colSpan: 6,
       id: 'traitName',
       label: '检测名称',
       key: '2',
       layout: {
         labelCol: { span: 8 },
         wrapperCol: { span: 16 },
       },
       options: { initialValue:traitName },
       componet: (
         <Input placeholder='请输入' autoComplete='off' onChange={(e) => this.setState({ traitName:e.target.value })} />
       )
     },
     {
       colSpan: 6,
       id: 'traitCode',
       label: '检测码',
       key: '1',
       layout: {
         labelCol: { span: 8 },
         wrapperCol: { span: 16 },
       },
       options: { initialValue:traitCode },
       componet: (
         <Input placeholder='请输入' autoComplete='off' onChange={(e) => this.setState({ traitCode:e.target.value })} />
       )
     },
     {
       colSpan: 6,
       id: 'productCode',
       label: '所属报告',
       key: '3',
       layout: {
         labelCol: { span: 8 },
         wrapperCol: { span: 16 },
       },
       options: { initialValue:productCode },
       componet: (
         <Select style={{ width: '100%' }}
           placeholder='请选择'
           allowClear
           showSearch
           optionFilterProp='children'
           filterOption={(input, option) =>
             option.props.children.indexOf(input) >= 0
           }
           onChange={(value) => this.setState({ productCode:value })}
         >
           {
             reportList.map((item, index) => (
               <Option value={item.productCode} key={index}>{item.concatName}</Option>
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
           ? <TraitConfigModal
             visible={storeVisible}
             isEdit={isEdit}
             id={id}
             pageConfigInfoList={pageConfigInfoList}
             onLoadData={this.traitList}
             onCancel={this.doCancelModal}
           /> : null
       }
       {
         scientificTextFlag
           ? <ScientificText
             visible={scientificTextFlag}
             isEdit={isEdit}
             lookText={lookText}
             onLoadData={this.traitList}
             onCancel={this.doCancelModal}
           /> : null
       }
       {
         importVisible
           ? (
             <ImportModal
               visible={importVisible}
               onCancel={this.importThis}
               onLoadData={this.getActivContentLabelPageList}
             />
           )
           : ''
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
