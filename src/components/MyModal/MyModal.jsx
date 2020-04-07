import React from 'react'
import { Container, Button, Modal } from "react-bootstrap"

export const MyModal = (props) => {
  return <Modal backdrop="static" {...props} size="xl">
    <Modal.Header closeButton>
      <Modal.Title id="contained-modal-title-vcenter">
        {props.title}
      </Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Container>
        {props.body}
      </Container>
    </Modal.Body>
    <Modal.Footer>
      {props.showsubmit === "true" ? <Button onClick={props.onSubmit} disabled={props.submitdisable}>{props.submittext}</Button> : null}
      <Button onClick={props.onCancel} variant="secondary">{props.canceltext || 'ปิด'}</Button>
    </Modal.Footer>
  </Modal >
}