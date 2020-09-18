import React, { Component } from 'react'
import { Icon } from 'antd'
import PropTypes from 'prop-types'
import styles from './thumbnail.css'

export default class Thumbnail extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  // 点击删除
  handleDelete = () => {
    this.props.onDelete(this.props.imgIndex, this.props.thisItem)
  }

  render () {
    const { imgUrl } = this.props
    return (
      <div className={styles.thumbItem}>
        <div className={styles.thumbInfo}>
          <img className={styles.thumImg} src={imgUrl} />
          <div className={styles.thumbModal}>
            <span className={styles.deleteIcon} onClick={this.handleDelete}>
              <Icon type='delete' theme='outlined' />
            </span>
          </div>
        </div>
      </div>
    )
  }
}

Thumbnail.propTypes = {
  onDelete: PropTypes.func,
  imgUrl: PropTypes.string,
  imgIndex: PropTypes.number,
  thisItem:PropTypes.obj
}
