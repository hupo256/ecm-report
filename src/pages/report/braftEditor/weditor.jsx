import React, { useEffect, useState, useRef, useContext } from 'react'
import { Card, Row, Col, message } from 'antd'
import { cloneDeep } from 'lodash'
import { ctx, Provider } from './componets/context'
import Api from '../service'
import E from './release/wangEditor.js'
import { menus, colors, uploadConfig } from './release/wConfig'
import GrassModal from './componets/grassModal'
import GrassControl from './componets/grassControl'
import MediaLoader from './componets/mediaLoader'
import TipsCon from './componets/tipsCon'
import BraftNav from './componets/braftNav'
import LinkMadal from './componets/linkMadal'
import CustomTag from './componets/customTag'
import './release/wangEditor.css'

let editor = null
function Editor(props) {
  const { visible, setvisible, setcurrGrass, showCtrl, setshowCtrl, setediterPos,
    tipsCon, settipsCon, setnavList, mdaLoader, setmdaLoader, linkCon, setlinkCon,
    setimgTag, setcurrTips, setcurrLink, settagList } = useContext(ctx)
  const { texContent, braftNav, tagList, editorUpdate } = props
  const [cousTag, setcousTag] = useState(tagList)
  const ebox = useRef()

  useEffect(() => {
    createEditor()
    touchPlugArr()
    setshowCtrl(false)
    setnavList(braftNav)
  }, [texContent, editorUpdate])

  function createEditor() {
    const elem = ebox.current
    editor = new E(elem)
    editor.customConfig = {
      menus, colors,
      ...uploadConfig,
      toolbarClickCallBack: () => message.warning('标题不支持多段落修改'),
      focusTheTagCallBack: focusTheTag, // 捕获目标tag
      pasteTextHandle: clearConStyle,   // 过滤粘贴内容
      onchange: (html) => {
        console.log(html)
        const { changeHtml } = props
        changeHtml && changeHtml(editor, touchNavList(), touchPlugArr())
      }
    }
    editor.create()

    let htm = texContent ? texContent.replace(/<\/rec><rec><\/rec>/g, '</a><rec></rec>') : ''
    htm = htm.replace(/<rec class="grassTag/g, '<a class="grassTag')
    editor.txt.html(htm || '<p><br />&#8203;</p>')
  }

  // 内部粘贴样式二次过滤
  function clearPasteCss(con){
    if (con == '' && !con) return ''
    let str = con
    const reg1 = /<spanyes?.*?>/g
    const reg2 = /<\/spanyes?.*?>/g
    const reg3 = /<span st?.*?>/g
    str = str.replace(/<spanyes?.*?>/g, '')  // 移除spanyes
    str = str.replace(/<\/spanyes?.*?>/g, '')  // 移除spanyes
    str = str.replace(/<span?.*?>/g, '<span>') // 
    setisPaste(false)
    return str
  }

  // 去掉外部粘贴文本的样式
  function clearConStyle(content) {
    if (content == '' && !content) return ''
    let str = content
    console.log(str)
    str = str.replace(/<xml>[\s\S]*?<\/xml>/ig, '')  // 移除表头
    str = str.replace(/<style[\s\S]*?<\/style>/ig, '')  // 移除样式
    str = str.replace(/&nbsp;/gi, '')   //  移除空格
    str = str.replace(/<(?!img|br|p|\/p).*?>/g, '')  // 移除标签 只留img\br\p
    str = str.replace(/<p class=?.*?>/g, '<p>')  // 移除p中所有的属性
    // str = str.replace(/<span?.*?>/g, '<span>') // 移除span中所有的属性
    // str = str.replace(/<a?.*?>/g, '<span>') // 去掉a标签
    // str = str.replace(/<\/a>/g, '</span>') // 去掉a标签
    console.log(str)
    return str
  }

  // 获取插件信息
  function touchPlugArr() {
    const tags = ebox.current.querySelectorAll('.w-e-text-container .customTag')
    const plugArr = []
    const tarr = tagList ? cloneDeep(tagList) : []
    tags.forEach((tag, ind) => {
      const { code } = tag.dataset
      plugArr.push({
        order: ind,
        pluginCode: +code,
        pluginData: {}
      })
      for (let i = 0, k = tarr.length; i < k; i++) {
        const { pluginCode, limitNum } = tarr[i]
        if (pluginCode === +code && limitNum > 0) {
          tarr[i].limitNum = limitNum - 1
          break
        }
      }
    })
    setcousTag([].concat(tarr))
    return plugArr
  }

  // 获取导航标题信息
  function touchNavList() {
    const h6s = ebox.current.querySelectorAll('.w-e-text-container h6')
    const arr = []
    h6s.forEach(h6 => {
      if (h6.textContent) {
        arr.push({
          itemName: h6.textContent,
          itemCode: Math.floor(Math.random() * 1000000),
          itemId: h6.offsetTop,
        })
      }
    })
    setnavList(arr)
    return arr
  }

  function focusTheTag(tag) {
    if (tag === 'A') {
      const target = editor.selection.getSelectionContainerElem()[0]
      const { textContent, href, className, dataset, firstChild, lastChild } = target
      const currentTarget = editor.$textElem[0]
      const range = editor.selection.getRange()
      const { endOffset, startOffset, commonAncestorContainer: { length } } = range
      const isImg = firstChild.nodeName === 'IMG' || lastChild.nodeName === 'IMG'

      // 目标dom获得焦点之后就确定当前entity
      if (endOffset !== length || isImg) {
        setediterPos(touchPosByDom(target, currentTarget))
        if (className === 'linkUrl') {
          setcurrLink({ link: href, linkTex: textContent || '已选中内容' }) //设选中的文字为当前链接
        } else if (className === 'tipsCon') {
          setcurrTips({ tipsInfor: dataset.tipsInfor, tipsTit: textContent }) //设选中的文字为当前注释
        } else {
          const _gid = className.split('_')[1]
          Api.getTraitRule({ id: _gid }).then(res => {
            if (!res) return
            const { replaceDoc, recType, itemId } = res
            setcurrGrass({ grassFlag: recType, replaceDoc: textContent || replaceDoc, gid: _gid, itemId })
          })
        }
      }
    }
  }

  // 根据点击的dom，反回控制器的坐标
  function touchPosByDom(target, currentTarget) {
    const { clientWidth, clientHeight } = currentTarget
    const { offsetTop, offsetLeft, offsetWidth, offsetHeight } = target
    const { scrollTop } = document.querySelector('.w-e-text-container>.w-e-text')
    let left = offsetLeft + offsetWidth / 2
    let top = offsetTop + offsetHeight + 30 - scrollTop
    left = left + 90 > clientWidth ? clientWidth - 95 : left
    top = top + 30 > clientHeight ? clientHeight - 30 : top
    setshowCtrl(true) // 顺便显示出来
    return { left, top }
  }

  // 委托绑定
  function braftEvent(event) {
    const { target, currentTarget } = event
    const { className, nodeName } = target
    const tex = editor.selection.getSelectionText()  // 选中文字

    className.includes('audioBtn') && setmdaLoader(!mdaLoader)  // 音频
    if (nodeName !== 'A') cleanCurrEnt()
    if (className.includes('grassBtn')) {  // 种草
      setvisible(!visible)
      tex && setcurrGrass({ grassFlag: '', replaceDoc: tex }) //设选中的文字为当前草
    } else if (className === 'tipsBtn') {   // 注释
      settipsCon(!tipsCon)
      tex && setcurrTips({ tipsInfor: '', tipsTit: tex }) //设选中的文字为当前注释
    } else if (className.includes('linkBtn')) {  // 超链接
      setlinkCon(!linkCon)
      tex && setcurrLink({ link: '', linkTex: tex }) //设选中的文字为当前链接
    } 
    nodeName === 'IMG' && !className && setimgTag(target) // 如果点是内容里的img就记录一下
    nodeName !== 'IMG' && !className && setimgTag(null)   // 如果不是img就重置
  }

  function cleanCurrEnt() {
    setshowCtrl(false)
    setcurrLink(null)
    setcurrTips(null)
    setcurrGrass(null)
  }

  // 一把删除
  function clearGrassTag() {
    const target = editor.selection.getSelectionContainerElem()[0]
    const { className, nodeName } = target
    if (className.includes('grassTag') || nodeName === 'A') {
      cleanCurrEnt()
      const linkelem = editor.selection.getSelectionContainerElem();
      editor.selection.createRangeByElem(linkelem)
      editor.selection.restoreSelection()
      editor.cmd.do('insertHTML', '&#8203;')
    }
  }

  function braftKeyDown(key) {
    const { keyCode } = key
    const val = editor.cmd.queryCommandValue('formatBlock')
    if (keyCode === 8) clearGrassTag()
    if (keyCode === 13 && val.includes('h')) {
      editor.cmd.do('insertHTML', '<p><br /></p>')
      editor.cmd.do('formatBlock', '<p>');
    }
    const { nodeName } = editor.selection.getSelectionContainerElem()[0]
    if (nodeName !== 'A') cleanCurrEnt()
  }

  return (
    <React.Fragment>
      <Row>
        <Col span={4}><BraftNav /></Col>
        <Col span={20}>
          <div style={{ position: 'relative' }}>
            <CustomTag editor={editor} tagList={cousTag} />
            <div ref={ebox} onClick={braftEvent} onKeyDown={braftKeyDown}></div>
            {showCtrl && <GrassControl editor={editor} />}
          </div>
        </Col>
      </Row>

      {visible && <GrassModal editor={editor} />}
      {tipsCon && <TipsCon editor={editor} />}
      {linkCon && <LinkMadal editor={editor} />}
      {mdaLoader && <MediaLoader editor={editor} />}
    </React.Fragment>
  )
}

export default (props) => (
  <Provider>
    <Editor {...props} />
  </Provider>
)