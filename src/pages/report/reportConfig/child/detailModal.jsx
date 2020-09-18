import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Modal, Carousel } from 'antd'

export default class DetailModal extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  handleCancel = (e) => {
    this.props.onCancel()
  }

  render () {
    const { imgs } = this.props
    return (
      <Modal
        title='报告列图片'
        maskClosable={false}
        visible
        maskClosable={false}
        width={600}
        onCancel={this.handleCancel}
        footer={null}
      >
        <div style={{ height: '360px', overflow: 'auto' }}>
          {
            imgs.length > 0
              ? <img style={{ display: 'inline-block', width: '100%' }} src={imgs} />
              // ? <Carousel>
              //   {
              //     imgs.map((item, index) => {
              //       return (
              //         <div key={index}>
              //           <img style={{ display: 'inline-block', width: '100%' }} src={item} key={index} />
              //         </div>
              //       )
              //     })
              //   }
              // </Carousel>
              : <p style={{ textAlign: 'center', color: '#999' }}>暂无报告列图片</p>
          }
        </div>
      </Modal>
    )
  }
}

DetailModal.propTypes = {
  imgs: PropTypes.array,
  onCancel: PropTypes.func
}
