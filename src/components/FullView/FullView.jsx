import React, { Component } from 'react'
import { connect } from 'react-redux';
import { compose } from 'recompose';

import { Modal, Button } from "react-bootstrap"
import HerbalMedia from './HerbalMedia'

import "./fullview.css"

class FullView extends Component {

  render() {
    /**@type {string} */

    let { description, description1 } = this.props.body
    description = description && description.replace(/↵/g, '\n')
    description1 = description1 && description1.replace(/↵/g, '\n')
    // console.log(description && description.match(/↵/g))
    // description = description && description.replace(/↵/g, '\n').split('"').join('')
    // console.log(description)
    return (
      <div>
        <Modal
          show={this.props.show}
          onHide={this.props.hide}
          dialogClassName="modal-90w"
          aria-labelledby="fullview-modal-styling-title"
        >
          <Modal.Header closeButton>
            <Modal.Title id="fullview-modal-styling-title">
              {this.props.title}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <RecipeView description={description1} howto={description} herbals={this.props.herbals} herbalsStatus={this.props.herbalsStatus} />
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.props.hide}>ปิด</Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

const RecipeView = ({ description, howto, herbals, herbalsStatus }) =>
  <>
    <h5 className="view-content-header">อาการของโรค:</h5>
    <p className="ml-3 view-content">
      {`${description}`}
    </p>
    <h5 className="view-content-header">สมุนไพรที่ใช้:</h5>
    <div className="ml-3 view-content-image">
      {herbalsStatus !== "done" ? <div>กำลังโหลดข้อมูล...</div> : ((herbals && herbals.map((herbal, i) => {
        return <HerbalMedia key={i} image={herbal.image} title={herbal.herbalName} />
      })) || <div>ไม่พบสมุนไพร</div>)}


    </div>
    <h5 className="view-content-header">วิธีการรักษา:</h5>
    <p className="ml-3 view-content">
      {`${howto}`}
    </p>
  </>


const mapStateToProps = state => ({
  show: state.modal.showFullView,
  title: state.modal.title,
  body: state.modal.body,
  herbals: state.modal.herbals,
  herbalsStatus: state.modal.herbalsStatus
});

const mapDispatchToProps = dispatch => ({
  hide: () =>
    dispatch({ type: 'HIDE_FULLVIEW' }),
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(FullView)

