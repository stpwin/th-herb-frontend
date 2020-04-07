import React, { Component } from 'react'

import { Jumbotron, InputGroup, FormControl, Container, Row, Col } from "react-bootstrap"
import { FaSearch } from "react-icons/fa"

export class MainSearch extends Component {
  render() {
    return (
      <Jumbotron>
        <h1>ตำรับยาสมุนไพรไทย</h1>
        <p>ค้นหา โรค หรือ สมุนไพร</p>
        <div>
          <Container>
            <Row className="justify-content-md-center">
              <Col lg={7}>
                <InputGroup size="lg">
                  <InputGroup.Prepend>
                    <InputGroup.Text id="inputGroup-sizing-lg"><FaSearch /></InputGroup.Text>
                  </InputGroup.Prepend>
                  <FormControl aria-label="Large" aria-describedby="inputGroup-sizing-sm" />
                </InputGroup>
              </Col>
            </Row>
            <Row className="justify-content-md-center mt-3">
              <Col lg={7}>
                <p className="text-muted">จำนวนข้อมูลกว่า {1000} โรค {5000} ตำรับ และ {10000} สมุนไพร</p>
              </Col>
            </Row>
          </Container>
        </div>
      </Jumbotron>
    )
  }
}

export default MainSearch
