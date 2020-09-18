import React, { useState } from 'react'
import { ctx } from './context'
import { Button } from 'antd'
import styles from './wEditor.less'

export default function CustomTag(props) {
  const {tagList} = props
  const [btnLoading, setbtnLoading] = useState(false)

  function addTag(item) {
    if(btnLoading) return
    setbtnLoading(true)
    const { pluginCode, imgUrl, limitNum } = item
    const htm = `<img class='customTag' data-code=${pluginCode} src=${imgUrl} /><span>&#8203;</span>`
    props.editor.cmd.do('insertHTML', htm)
    setTimeout(() => {
      setbtnLoading(false)
    }, 600)
  }

  return (
    <div className={styles.customBox}>
      {tagList && tagList.length > 0 && tagList.map((item, index) => {
        const { limitNum, pluginName, residueNum } = item
        return <Button
          key={index}
          type="primary"
          disabled={limitNum === 0}
          onClick={() => addTag(item)}
        >{pluginName}</Button>
      })}
    </div>
  )
}