import React, { Component } from 'react'
import { connect } from 'react-redux';
import { compose } from 'recompose';

import { Modal } from "react-bootstrap"

import "./fullview.css"

class FullView extends Component {
  render() {
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
            <p>
              {this.props.body}
            </p>
          </Modal.Body>
        </Modal>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  show: state.fullView.show,
  title: state.fullView.title,
  body: state.fullView.body
});

const mapDispatchToProps = dispatch => ({
  hide: () =>
    dispatch({ type: 'HIDE_FULLVIEW' }),
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(FullView)

