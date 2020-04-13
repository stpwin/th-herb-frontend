import React, { Component } from 'react'
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withFirebase } from 'react-redux-firebase'

import { Navbar, Nav, NavDropdown, Form } from "react-bootstrap"

export class Navigation extends Component {
  logout = () => {
    /** @type {firebase.auth.Auth} */
    const auth = this.props.firebase.auth()
    auth.signOut()
  }
  render() {
    return (
      <Navbar bg="light" expand="lg">
        <Navbar.Brand href="#home">Thai Herbal Pharm</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link href="#home">หน้าแรก</Nav.Link>
            {/* <Nav.Link href="#link">Link</Nav.Link> */}
            <NavDropdown title="หมวดหมู่ตำรา" id="basic-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
            </NavDropdown>
          </Nav>
          <Form inline>
            {this.props.authUser ?
              <Nav.Link href="" onClick={() => this.logout()}>ออกจากระบบ</Nav.Link>
              :
              <Nav.Link href="" onClick={() => this.props.showLogin()}>จัดการข้อมูล</Nav.Link>}

          </Form>
        </Navbar.Collapse>
      </Navbar>

    )
  }
}

const mapStateToProps = state => ({
  show: state.login.show,
  authUser: state.login.authUser
});

const mapDispatchToProps = dispatch => ({
  showLogin: () =>
    dispatch({ type: 'SHOW_LOGIN' }),
  hideLogin: () =>
    dispatch({ type: 'HIDE_LOGIN' }),
});

export default compose(
  withFirebase,
  connect(mapStateToProps, mapDispatchToProps),
)(Navigation)
