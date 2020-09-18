import React, { useState, useEffect, useContext } from 'react'
import { ctx } from './context'
import styles from './wEditor.less'

export default function BraftNav() {
  const { navList } = useContext(ctx)
  function toNavBraft(num){
    const editbox = document.querySelector('.w-e-text-container>.w-e-text')
    editbox.scrollTo({ 
      top: num, 
      behavior: "smooth" 
    })
  }

  return (
    <div className={styles.braftNav}>
      {navList && navList.length > 0 &&
        <>
          <b>导航</b>
          <ul>
            {navList.map((item, index) => {
              const { itemId, itemName } = item
              return <li key={index} onClick={() => toNavBraft(itemId)}>{itemName}</li>
            })}
          </ul>
        </>
      }
    </div>
  )
}