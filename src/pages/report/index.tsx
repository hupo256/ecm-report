import { PlusOutlined } from '@ant-design/icons';
import { Button, Divider, message, Input } from 'antd';
import React, { useState, useRef } from 'react';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';

import CreateForm from './components/CreateForm';
import UpdateForm, { FormValueType } from './components/UpdateForm';
import { TableListItem } from './data.d';
import Api from './service';
// import { queryRule, getUserReportConfigList, updateRule, addRule, removeRule } from './service';

const Report: React.FC<{}> = () => {
  const params = {
    current: 1,
    pageSize: 10,
    sorter: {},
    filter: {},
  };
  const params2 = {
    isHaveQnaire: '',
    pageNum: 1,
    pageSize: 10,
    qnaireStatus: '',
  };
  return (
    <PageContainer>
      {/* <ProTable<TableListItem>
        headerTitle="查询表格"
        actionRef={actionRef}
        rowKey="key"
        toolBarRender={() => [
          <Button type="primary" onClick={() => handleModalVisible(true)}>
            <PlusOutlined /> 新建
          </Button>,
        ]}
        request={(params, sorter, filter) => queryRule({ ...params, sorter, filter })}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => setSelectedRows(selectedRows),
        }}
      /> */}

      <div>test</div>
      <h3 onClick={() => Api.queryRule(params)}>this is my father world</h3>
      <h3 onClick={() => Api.getUserReportConfigList(params2)}>GET TABLE DATE 11</h3>
    </PageContainer>
  );
};

export default Report;
