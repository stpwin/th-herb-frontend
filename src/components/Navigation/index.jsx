import React, { Component } from 'react'

import { Navbar, Nav, NavDropdown, Form } from "react-bootstrap"

export class Navigation extends Component {
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
                        <Nav.Link href="#manage">จัดการข้อมูล</Nav.Link>
                    </Form>
                </Navbar.Collapse>
            </Navbar>

        )
    }
}

export default Navigation
