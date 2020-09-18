import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Modal, Form, Row, Button, message, Spin, Select } from 'antd'
import config from '@/common/utils/config.js'
import axios from 'axios'
import { getStore } from '@/common/utils/localstore.js'
const baseUrl = config.host
const { Option } = Select
class ImportModalForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      imgList:[],
      editInfo:{},
      loading: false,
      traitType:''
    }
  }
  // 保存
  handleImport = () => {
    let formData = new FormData()
    let form = document.getElementById('file')
    if (this.state.traitType === '') {
      return message.warning('请选择检测项类型 ！！！')
    }
    if (!form.files || form.files.length === 0) {
      return message.warning('请导入文件！！！')
    }
    this.setState({
      loading: true
    })
    let file = form.files[0]
    formData.append('file', file)
    formData.append('traitType', this.state.traitType)
    console.log(file)
    this.postExcel(formData)
  }
   // 导入
   postExcel = (params) => {
     let headers = { headers: { 'Content-Type': 'multipart/form-data', token: getStore('token') } }
     let postUrl = `${baseUrl}reportCard/readTraitDocExcel`
     axios.post(postUrl, params, headers).then((res) => {
       this.setState({ loading: false })
       const { data } = res
       if (data && data.code === 0) {
         message.success('导入成功！！！')
         this.handleCancel()
         this.props.onLoadData()
       } else {
         message.error(data.msg)
       }
     })
   }
  // 取消
  handleCancel = (e) => {
    this.props.onCancel()
  }
  render () {
    const { visible } = this.props
    const { loading } = this.state
    return (
      <div>
        <Spin spinning={loading}>
          <Modal
            visible={visible}
            maskClosable={false}
            onCancel={this.handleCancel}
            width={850}
            title={'检测项配置/导入检测项基础信息'}
            footer={[]}
          >
            <div>
              {/* <Row>
                <p>
                  {
                    importType === 1
                      ? <a href='https://dnatime-prod.oss-cn-hangzhou.aliyuncs.com/shop/cms/label/%E6%A0%87%E7%AD%BE%E5%AF%BC%E5%85%A5%E6%A8%A1%E6%9D%BF.xls'
                        download='标签导入模板.xls'>下载标签导入模板</a>
                      : <a href='https://images.dnatime.com/app/source/document/5ceed64e-6972-4bb5-a2ca-e6e9a3c72d74.XLSX'
                        download='分词导入模板.xls'>下载分词导入模板</a>
                  }

                </p>
              </Row> */}
              <span>检测项类型：</span>
              <Select
                style={{ width:'200px' }}
                placeholder='请选择'
                showSearch
                allowClear
                optionFilterProp='children'
                filterOption={(input, option) =>
                  option.props.children.indexOf(input) >= 0
                }
                onChange={value => this.setState({ traitType:value })}
              >
                <Option key={1} value={1}>基因检测</Option>
                <Option key={2} value={2}>肠道检测</Option>
              </Select>
              <input type='file' name='file' id='file'
                accept='.csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                style={{ margin:'20px 0 20px 10px' }} />
              <Row>
                <Button type='primary' onClick={this.handleImport}>导入</Button>
              </Row>
            </div>
          </Modal>
        </Spin>
      </div>
    )
  }
}

ImportModalForm.propTypes = {
  onCancel: PropTypes.func,
  visible: PropTypes.bool,
  onLoadData: PropTypes.func,
}

const ImportModal = Form.create()(ImportModalForm)

export default ImportModal
