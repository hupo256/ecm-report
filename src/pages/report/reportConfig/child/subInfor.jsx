import React, { useEffect, useState} from 'react'
import styles from '../braftbox.less'

export default function SubInfor(props) {
  const {definitionDto} = props
  if (!definitionDto) return ''
  const { applicableU, theme, traitCode, traitName } = definitionDto
  return <div className={styles.subInfor}>
    <p>检测项名称： {traitName || ''}</p>
    <p>检测项编号：{traitCode || ''}</p>
    <p>场景：{theme || ''}</p>
    <p>应用人群：{applicableU|| ''}</p>
  </div>
}