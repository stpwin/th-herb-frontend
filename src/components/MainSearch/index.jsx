import React, { Component } from 'react'

import { Jumbotron, InputGroup, FormControl, Container, Row, Col } from "react-bootstrap"
import { FaSearch } from "react-icons/fa"

export class MainSearch extends Component {
    render() {
        return (
            <Jumbotron>
                <h1>ตำรับยาสมุนไพรไทย</h1>
                <p>
                    ค้นหา โรค หรือ สมุนไพร
  </p>
                <p>
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

                    </Container>

                </p>
            </Jumbotron>
        )
    }
}

export default MainSearch
