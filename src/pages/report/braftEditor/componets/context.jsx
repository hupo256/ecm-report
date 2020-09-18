import React, { createContext, useState } from 'react';
import BraftEditor from 'braft-editor'

export const ctx = createContext({})
export function Provider({children}) {
  const [editor, seteditor] = useState(null)
  const [editerPos, setediterPos] = useState({ left: '0', top: '0' })
  const [currGrass, setcurrGrass] = useState(null)
  const [visible, setvisible] = useState(false)
  const [showCtrl, setshowCtrl] = useState(false)
  const [tipsCon, settipsCon] = useState(false)
  const [navList, setnavList] = useState([])
  const [mdaLoader, setmdaLoader] = useState(false)
  const [linkCon, setlinkCon] = useState(false)
  const [imgTag, setimgTag] = useState(null)
  const [currLink, setcurrLink] = useState(null)
  const [currTips, setcurrTips] = useState(null)

  const value = {
    editor, seteditor,
    editerPos, setediterPos,
    currGrass, setcurrGrass,
    visible, setvisible,
    showCtrl, setshowCtrl,
    tipsCon, settipsCon,
    navList, setnavList,
    mdaLoader, setmdaLoader,
    linkCon, setlinkCon,
    imgTag, setimgTag,
    currLink, setcurrLink,
    currTips, setcurrTips,
  }

  return (
    <ctx.Provider value={value}>{children}</ctx.Provider>
  )
}