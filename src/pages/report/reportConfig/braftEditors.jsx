import React, { useState, useEffect } from 'react'
import { PageContainer } from '@ant-design/pro-layout'
import { Card, Row, Col, Button, Modal, message } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { getStorage } from '@/common/tools'
import images from './child/images'
import RoleRuleModal from './child/roleRuleModal'
import SubInfor from './child/subInfor'
import Api from '../service'
import Weditor from '../braftEditor/weditor'
import styles from './braftbox.less'

const submitTex = ['提交审核', '直接发布']

export default function Editors(props) {
  const [doRule, setdoRule] = useState(false)
  const [currentRule, setcurrentRule] = useState(null)
  const [currInd, setcurrInd] = useState(NaN)
  const [traitRuleContent, settraitRuleContent] = useState({})
  const [reportUpgradeRule, setreportUpgradeRule] = useState({})
  const [upgradeRuleDtos, setupgradeRuleDtos] = useState([])
  const [list, setlist] = useState([])
  const [plugArr, setplugArr] = useState([])
  const [editorObj, seteditorObj] = useState(null)
  const [isEidted, setisEidted] = useState(-1)
  const [showEidtor, setshowEidtor] = useState(false)
  const [editorUpdate, seteditorUpdate] = useState(1123)
  const {categories = [], content = '', cfgContendId, releaseStatus, repUpgradeDetailCfgPluginList=[] } = traitRuleContent
  const {definitionDto} = reportUpgradeRule

  useEffect(() => {
    const { definitionId, id } = getStorage('record')
    Api.reportUpgradeRule({ traitId: definitionId || id }).then(res => {
      if (!res) return
      setreportUpgradeRule(res)
      setupgradeRuleDtos(res.upgradeRuleDtos)
    })
  }, [])

  function editList(e, num, ind, id) {
    e.stopPropagation()
    const dis = ind === 2 ? -1 : 1
    switch (ind) {
      case 0:  // 编辑
        setdoRule(!doRule)
        touchBraftCon(id, num)
        break;
      case 1:  // 复制
        Api.copyTraitRule({ reportUpgradeId: id }).then(res => {
          if (!res) return
          upgradeRuleDtos.splice(num+1, 0, res )
          setupgradeRuleDtos([].concat(upgradeRuleDtos))

          // 摸拟点击了rule
          setTimeout(()=>{
            touchBraftCon(res.reportUpgradeId, num+1)
          }) 
        })
        break;
      case 2:  // 上移
      case 3:  // 下移
        const item = upgradeRuleDtos.splice(num, 1)[0]
        const isUp = dis < 0 ? 1 : 0
        Api.sortTraitRule({ reportUpgradeId: id || '', isUp }).then(res => {
          if (!res) return
          upgradeRuleDtos.splice(num+dis, 0, item)
          setupgradeRuleDtos([].concat(upgradeRuleDtos))
          num === currInd && setcurrInd(num+dis)
        })
        break;
      case 4:  // 删除
        delConfirm(id, num)
        break;
    }
  }

  function delConfirm(id, num) {
    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: '您确认要删除这条规则吗？',
      onOk(){
        Api.delTraitRule({ reportUpgradeId: id || '' }).then(res => {
          if (!res) return
          setupgradeRuleDtos(res)
          if(num === currInd){
            setcurrInd(NaN)
            settraitRuleContent({})
            setshowEidtor(false)
          }
        })
      },
      onCancel() {console.log('Cancel')},
    });
  }

  function creatIcons(num, len, id) {
    const { copyicon, delicon, downicon, editicon, upicon } = images
    return <div className={styles.subTools}>
      {[editicon, copyicon, upicon, downicon, delicon].map((item, index) => {
        const disa = (num === 0 && index === 2) || (num === len - 1 && index === 3)
        return <a key={index} disabled={disa} onClick={e => editList(e, num, index, id)}>
          <img src={item} />
        </a>
      })}
    </div>
  }

  function creatRuleList() {
    if (!upgradeRuleDtos.length) return ''
    return upgradeRuleDtos.map((item, index) => {
      const { reportUpgradeId, ruleAgeMax, ruleAgeMin, ruleConclusions, ruleGender } = item
      const ageTex = `${ruleAgeMin}-${ruleAgeMax}`
      const ruleCon = ruleConclusions.toString()
      let gender = '全部'
      ruleGender === '10' && (gender = '男')
      ruleGender === '01' && (gender = '女')
      return <li
        key={index}
        className={`${currInd === index ? styles.on : ''}`}
        onClick={() => touchBraftCon(reportUpgradeId, index)}
      >
        <div>
          <span>性别：{gender}</span> 
          {creatIcons(index, upgradeRuleDtos.length, reportUpgradeId)}
        </div>
        <div>结果：{ruleCon}</div>
        <div>年龄：{ageTex}</div>
      </li>
    })
  }

  function touchBraftCon(id, num) {
    if(num === currInd) return  // 点击当前的rule就忽略
    if(isEidted === 0) toSave(-1, '', '已保存')
    Api.traitRuleContent({ reportUpgradeId: id || '' }).then(res => {
      if(!res) return
      const con = {...res}
      settraitRuleContent(con)
      setcurrentRule(upgradeRuleDtos[num])
      setcurrInd(num)
      setisEidted(-1)
      setshowEidtor(true)
      seteditorUpdate(new Date().getTime())  // 每次都给个时间，以确保刷新
    })
  }

  function touchRuleList(item) {
    currentRule || upgradeRuleDtos.push(item)
    currentRule && upgradeRuleDtos.splice(currInd, 1, item)
    setupgradeRuleDtos(upgradeRuleDtos)
    setdoRule(!doRule)

    // 摸拟点击了rule
    setTimeout(()=>{
      touchBraftCon(item.reportUpgradeId, upgradeRuleDtos.length-1)
    }) 
  }

  function addNewRule(){
    if(isEidted === 0) toSave(-1, '', '已保存')

    setcurrentRule(null)
    setdoRule(!doRule)
  }

  function turntoREC(){
    let htm = editorObj.txt.html()
    htm = htm.replace(/<span?.*?>/g, '<span>') // 如果span里有style，则清掉
    htm = htm.replace(/<a class="grassTag/g, '<rec class="grassTag') // 转成rec
    htm = htm.replace(/<\/a><rec><\/rec>/g, '</rec><rec></rec>') // 转成rec
    return htm
  }

  function toSave(num, tex, toastTex) {
    const { reportUpgradeId, releaseStatus } = currentRule
    console.log(editorObj.txt.getJSON())
    console.log(editorObj.txt.html())
    if(num ===0) setisEidted(-1) // 防止连续点击
    const dis = num === -1 ? -1 : 1
    const params = {
      reportUpgradeId, cfgContendId,
      releaseStatus: num,
      categories: list,
      plugIn: plugArr,
      content: turntoREC(),
      contenth5Data: editorObj.txt.getJSON()
    }
    Api.traitRuleContentUpt(params).then(res => {
      if (!res) setisEidted(num) // 失败后重置一下
      if(tex){
        traitRuleContent.releaseStatus = -1
        settraitRuleContent(traitRuleContent)
      }
      setisEidted(num + dis)
      message.success(toastTex || '操作成功', toastTex ? 1 : 2)
    })
  }

  function toCheckRelease(num, tex){
    Modal.confirm({
      title: tex,
      icon: <ExclamationCircleOutlined />,
      content: `您确认要${tex}`,
      onOk() { toSave(num, tex) },
      onCancel() { console.log('Cancel') },
    });
  }

  // 取消
  function handleCancelBox(){
    if(isEidted === 0) toSave(-1, '', '已保存')
    props.history.push({ 
      pathname: +localStorage.fromPage === 1 ? '/report/trait_config' : '/report/report_config', 
      state: { false: 1 } 
    })
  }

  function changeHtml(editor, navList, pArr) {
    setlist(navList)
    setplugArr(pArr)
    seteditorObj(editor)
    setisEidted(0)
  }

  return (
    <>
      <Card className={styles.BraftEditorbox}>
        <Row><a className={styles.gotolist} onClick={handleCancelBox}>《 返回列表</a></Row>
        <Row>
          <Col span={5}>
            <SubInfor definitionDto={definitionDto} />
            <ul className={styles.subTagbox}>
              {creatRuleList()}
              <li onClick={addNewRule}><p>+ 新增人群</p></li>
            </ul>
          </Col>

          {showEidtor && <Col span={19}>
            <Weditor
              editorUpdate={editorUpdate}
              braftNav={categories} 
              texContent={content}
              tagList={repUpgradeDetailCfgPluginList}
              changeHtml={changeHtml}
            />
            <Row>
              <Col span={4}></Col>
              <Col span={20}>
              <div className={styles.braftBtnBox}>
                <p>
                  <Button disabled={isEidted !== 0} type="primary" onClick={() => toSave(0)}>保存</Button>
                  {/* <Button type="primary">预览</Button> */}
                </p>
                <p>
                  {submitTex.map((item, index) => 
                    <Button 
                      key={index}  type="primary"
                      disabled={isEidted < 0 || isEidted > index + 1}
                      onClick={() => toCheckRelease(index+1, item)} 
                    >{item}
                    </Button>
                  )}
                </p>
              </div>
              </Col>
            </Row>
          </Col>}
        </Row>
      </Card>

      {doRule &&
        <RoleRuleModal 
          doRule={doRule} 
          setdoRule={setdoRule} 
          touchRuleList={touchRuleList} 
          currentRule={currentRule} 
        />
      }
    </>
  )
}