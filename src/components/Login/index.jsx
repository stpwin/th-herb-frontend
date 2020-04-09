import React, { Component } from 'react'
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withFirebase } from 'react-redux-firebase'

import { Form, Button, Modal } from 'react-bootstrap'

export class Login extends Component {
  state = {
    email: "simple@mail.com",
    password: "123456",
    loggingIn: false
  }

  componentDidMount() {
    console.log(this.props)
  }

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  handleLogin = () => {
    /**@type {firebase.auth.Auth} */
    const auth = this.props.firebase.auth()
    const { email, password } = this.state
    this.setState({ loggingIn: true })

    auth.signInWithEmailAndPassword(email, password).then(userCredential => {
      console.log(userCredential)
      this.setState({ loggingIn: false })
    }).catch(err => {
      console.error(err)
      this.setState({ loggingIn: false })
    })
  }

  render() {
    const { email, password, loggingIn } = this.state
    return (
      <Modal show={this.props.show} onHide={this.props.hideLogin} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>เข้าสู่ระบบจัดการข้อมูล</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control type="email" name="email" value={email} placeholder="Enter email" onChange={this.handleChange} />
            </Form.Group>
            <Form.Group controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" name="password" value={password} placeholder="Password" onChange={this.handleChange} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" disabled={loggingIn} onClick={this.handleLogin}>
            เข้าสู่ระบบ
          </Button>
          <Button variant="secondary" onClick={this.props.hideLogin}>
            ยกเลิก
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }
}

const mapStateToProps = state => ({
  show: state.login.show,
});

const mapDispatchToProps = dispatch => ({
  showLogin: () =>
    dispatch({ type: 'SHOW_LOGIN' }),
  hideLogin: () =>
    dispatch({ type: 'HIDE_LOGIN' }),
  setAuthUser: authUser =>
    dispatch({ type: 'SET_AUTH_USER', authUser }),
});

export default compose(
  withFirebase,
  connect(mapStateToProps, mapDispatchToProps),
)(Login)
