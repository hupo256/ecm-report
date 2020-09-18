import React, { useContext } from 'react'
import BraftEditor from 'braft-editor'
import { ctx } from './context'
import Api from '../../service'
import styles from './wEditor.less'

export default function GrassControl(props) {
  const { setshowCtrl, editerPos, visible, setvisible, tipsCon, settipsCon, linkCon, setlinkCon,
    currGrass, setcurrGrass, currLink, setcurrLink, currTips, setcurrTips } = useContext(ctx)
  const { left, top } = editerPos
  const { editor } = props

  // 编辑
  function toEditGrass(e) {
    e.stopPropagation()
    const dom = editor.selection.getSelectionContainerElem()[0]
    const { textContent, href, className } = dom
    console.log(textContent, href, className)
    if (className === 'linkUrl') {
      setlinkCon(!linkCon)
    } else if (className === 'tipsCon') {
      settipsCon(!linkCon)
    } else {
      setvisible(!visible)
    }
    setshowCtrl(false)
  }

  // 删除text
  function delTag(dom) {
    const { textContent, innerHTML, childNodes } = dom
    const {nodeName, className} = childNodes[0]
    console.log(nodeName, className)
    let htm = (nodeName === 'IMG' && className) ? dom.innerHTML : textContent || '&#8203;'
    htm = htm.replace(/<img class="linkImg"/g, '<img')   // 顺便把作为标记的class也删除
    const linkelem = editor.selection.getSelectionContainerElem();
    editor.selection.createRangeByElem(linkelem)
    editor.selection.restoreSelection()
    editor.cmd.do('insertHTML', `<span>${htm}</span>`)
    setcurrLink(null)
    setcurrTips(null)
  }

  // 删除
  function toDelGrass(e) {
    e.stopPropagation()
    const dom = editor.selection.getSelectionContainerElem()[0]
    dom.nodeName === 'A' ? delTag(dom) : 
    Api.deleteProductTraitRule(currGrass.gid).then(res => {
      if(!res) return
      delTag(dom)
      setcurrGrass(null)
    })
    setshowCtrl(false)
  }

  return (
    <div className={styles.tipbox} onClick={() => setshowCtrl(false)}>
      <div className={styles.editbox} style={{ left, top }}>
        <span onClick={e => toEditGrass(e)}>编辑</span>
        <span onClick={e => toDelGrass(e)}>删除</span>
      </div>
    </div>
  )
}