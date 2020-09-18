import React from 'react'
import PropTypes from 'prop-types'
import { Table } from 'antd'

class DataTable extends React.Component {
  render () {
    const { columns, page, pageSize, total, onChange, list, rowRender } = this.props
    return <Table
      style={{ padding:'0 20px' }}
      bordered
      // rowKey='id'
      rowkey={record=>record.id || record.catTraitCfgId}
      pagination={{
        current:page,
        pageSize: pageSize,
        total: total,
        showQuickJumper: false,
        showTotal: total => `总计 ${total} 条`,
        pageSizeOptions: ['10', '20', '50', '100'],
        showSizeChanger: true,
        hideOnSinglePage:false
      }}
      scroll={scroll}
      onChange={onChange}
      dataSource={list}
      columns={columns}
      expandedRowRender={rowRender}
      {...this.props} />
  }
}

DataTable.propTypes = {
  columns:PropTypes.array.isRequired,
  list: PropTypes.array.isRequired,
  page: PropTypes.number,
  pageSize: PropTypes.number,
  scroll: PropTypes.object,
  total: PropTypes.number,
  onChange: PropTypes.func,
  rowRender: PropTypes.func
}

export default DataTable
