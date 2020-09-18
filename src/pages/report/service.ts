import axios from 'axios';
import { message } from 'antd';


// 实例化 ajax请求对象
const ajaxinstance = axios.create({
  // baseURL: '//test03cmsapi.dnatime.com',
  timeout: 60000,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Method': 'POST,GET',
    responseType: 'json',
    token: localStorage.getItem('token'),
  },
});

// 请求拦截器
ajaxinstance
  .interceptors
  .request
  .use((request) => {
    const { params = {}, data={}} = request
    if (params.loadingTag || data.loadingTag){
      message.loading('加载中...', 10)
    }
    return request
  }, (error) => {
    message.destroy()
    Promise.reject(error)
  })

// 响应拦截器
ajaxinstance.interceptors.response.use(
  (response) => {
    const { config, data } = response
    const { params = {} } = config
    const { code = 1, result, msg } = data
    const loadingTag =  config.data ? JSON.parse(config.data).loadingTag : ''
    if (loadingTag || params.loadingTag){
      message.destroy()
    }
    if (+code) {
      if (+code === 100104) {
        window.location.href = '/user/login';
      } else if (+code === 600008) {
        return data;
      } else {
        message.error(msg || '服务器繁忙！！！');
      }
    }
    
    return +code ? null : result || {};
  }, (error) => {
    message.destroy()
    return Promise.reject(error);
  },
);

// 报告配置列表
async function getUserReportConfigList(postData: any) {
  return ajaxinstance.post('/api/userReportConfig/getUserReportConfigList', postData);
}

async function releaseRedirectH5(params: any) {
  return ajaxinstance.get('/api/userReportConfig/releaseRedirectH5', { params });
}

// 更新内容
async function renovatePageModuleContent(params: any) {
  return ajaxinstance.get('/api/userReportConfig/reportPage/renovatePageModuleContent', { params });
}

async function getreportModuleTraitDefinition(postData: any) {
  return ajaxinstance.post('/api/userReportConfig/getreportModuleTraitDefinition', postData);
}

// 种草检测项
async function productTraitList(params: any) {
  return ajaxinstance.get('/api/rec/productTraitList', { params });
}
// 保存种草规则
async function productTraitRule(postData: any) {
  return ajaxinstance.post('/api/rec/productTraitRule', postData);
}

// 查询种草规则
async function getTraitRule(params: any) {
  return ajaxinstance.get('/api/rec/productTraitRule', { params });
}

// 清除种草规则
async function deleteProductTraitRule(id: any) {
  return ajaxinstance.post(`/api/rec/deleteProductTraitRule?id=${id}`);
}

// 检测项列表（有分页）
async function getTraitList(postData: any) {
  return ajaxinstance.post('/api/reportTrait/getTraitList', postData);
}

// 所属报告列表
async function getNewUserReportConfig(params: any) {
  return ajaxinstance.get('/api/userReportConfig/restReportUserReportConfig/getNewUserReportConfig', { params });
}

// 检测项分类
async function getTraitCategoryList(postData: any) {
  return ajaxinstance.post('/api/reportTrait/getTraitCategoryList', postData);
}

// 报告名称
async function getReportUserReport(params: any) {
  return ajaxinstance.get('/api/reportTrait/getReportUserReport', { params });
}

// 报告所属分类
async function getReportCategoryConfigInfoAllList(params: any) {
  ajaxinstance.get('/api/reportCategoryConfig/getReportCategoryConfigInfoAllList', { params })
}
// 根据ID获取报告配置
async function getUserReportConfigById(params: any) {
  ajaxinstance.get('/api/userReportConfig/getUserReportConfigById', { params })
}
// 配置报告对应产品
async function listAllProduct(postDate: any) {
  ajaxinstance.get('/api/product/listAllProduct', postDate)
}
// 更新报告配置信息
async function updateUserReportConfig(postData: any) {
  ajaxinstance.post('/api/userReportConfig/updateUserReportConfig', postData)
}
// 新增报告配置
async function saveUserReportConfig(postData: any) {
  ajaxinstance.post('/api/userReportConfig/saveUserReportConfig', postData)
}


// 富文本开始
//  审核 发布
async function checkReleaseTraitCfgContent(params: any) {
  return ajaxinstance.get('/api/upgradeCfg/checkReleaseTraitCfgContent', { params });
}

async function copyTraitRule(params: any) {
  return ajaxinstance.get('/api/upgradeCfg/copyTraitRule', { params });
}

// 删除检测项配置规则
async function delTraitRule(params: any) {
  return ajaxinstance.get('/api/upgradeCfg/delTraitRule', { params });
}

// 获取5.0检测项基础信息
async function reportUpgradeRule(params: any) {
  return ajaxinstance.get('/api/upgradeCfg/reportUpgradeRule', { params });
}

// 获取5.0检测项结果与显示值映射关系
async function traitConcDisplayRelation(params: any) {
  return ajaxinstance.get('/api/upgradeCfg/traitConcDisplayRelation', { params });
}

// 获取 详情页富文本页面数据
async function traitRuleContent(params: any) {
  return ajaxinstance.get('/api/upgradeCfg/traitRuleContent', { params });
}

// 添加/更新 详情页富文本页面数据
async function traitRuleContentUpt(postData: any) {
  return ajaxinstance.post('/api/upgradeCfg/traitRuleContentUpt', postData);
}

// 添加/更新检测项配置规则
async function uptTraitRule(postData: any) {
  return ajaxinstance.post('/api/upgradeCfg/uptTraitRule', postData);
}

// 调整检测项规则顺序
async function sortTraitRule(postData: any) {
  const { reportUpgradeId, isUp } = postData
  return ajaxinstance.post(`/api/upgradeCfg/sortTraitRule?reportUpgradeId=${reportUpgradeId}&isUp=${isUp}`)
}

// 获取插件配置
async function getPluginList(params: any) {
  return ajaxinstance.get('/api/upgradeCfg/getPluginList', { params });
}

export default {
  getUserReportConfigList,
  releaseRedirectH5,
  renovatePageModuleContent,
  getreportModuleTraitDefinition,
  productTraitList,
  productTraitRule,
  getTraitRule,
  deleteProductTraitRule,
  getTraitList,
  getNewUserReportConfig,
  getTraitCategoryList,
  getReportUserReport,
  getReportCategoryConfigInfoAllList, getUserReportConfigById, listAllProduct, 
  updateUserReportConfig,saveUserReportConfig,

  // braftEdit
  checkReleaseTraitCfgContent,
  copyTraitRule, delTraitRule, reportUpgradeRule, traitConcDisplayRelation,
  traitRuleContent, traitRuleContentUpt, uptTraitRule, sortTraitRule, getPluginList,
}
