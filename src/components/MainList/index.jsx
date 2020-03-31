import React, { Component } from 'react'

import { Spinner, Container, Row, Col, Button, Modal } from "react-bootstrap"
import MediaItem from "./MediaItem"

const dataList = [
    {
        name: "โรคเบาหวาน",
        content: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like). It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).",
        image: "holder.js/256x256?text=โรคเบาหวาน",
        herbals: [
            { path: "1", herbs: ["ใบมะยม", "ใบเหงือกปลาหมอ", "รากและต้นไมยราบ", "ใบเตยหอม"] },
            { path: "2", herbs: ["ใบมะยม", "ใบเหงือกปลาหมอ", "รากและต้นไมยราบ", "ใบเตยหอม"] }
        ],
        uid: "1",
        path: "โรคเบาหวาน"
    },
    {
        name: "โรคเกี่ยวกับระดู",
        content: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like). It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).",
        image: "holder.js/256x256?text=โรคเกี่ยวกับระดู",
        herbals: [
            { path: "1", herbs: ["ใบมะยม", "ใบเหงือกปลาหมอ", "รากและต้นไมยราบ", "ใบเตยหอม"] },
            { path: "2", herbs: ["2", "3", "4", "5"] }
        ],
        uid: "2",
        path: "โรคเกี่ยวกับระดู"
    }
]

export class MainList extends Component {
    state = {
        loading: false,
        isAdmin: true,
        addDataModalShow: false
    }

    componentDidMount() {
        if (this.state.loading) {
            setTimeout(() => this.setState({ loading: false }), 1000)
        }
    }

    showAddDataModal = () => {
        this.setState({
            addDataModalShow: true
        })
    }

    handleAddDataModalHide = () => {
        this.setState({
            addDataModalShow: false
        })
    }

    render() {

        const { loading, isAdmin, addDataModalShow } = this.state
        return (
            <Container>
                {isAdmin ? <Row className="justify-content-md-center">
                    <Col xs lg={2}>
                        <Button variant="outline-primary" block onClick={this.showAddDataModal}>เพิ่ม</Button>
                    </Col>
                </Row> : null}
                <Row>
                    <Col>
                        <div className="main-list">
                            {loading ? <Spinner animation="grow" role="status" variant="success">
                                <span className="sr-only">Loading...</span>
                            </Spinner> :
                                <ul className="list-unstyled">
                                    {dataList.map(item => {
                                        return <MediaItem title={item.name} content={item.content} herbals={item.herbals} path={item.path} image={item.image} showTool={isAdmin} />
                                    })}
                                </ul>
                            }
                        </div>
                    </Col>
                </Row>
                <AddDataModal show={addDataModalShow} onHide={this.handleAddDataModalHide} />
            </Container>
        )
    }
}

const AddDataModal = (props) => {
    return <Modal backdrop="static" {...props} size="xl">
        <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
                เพิ่มรายการ
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Container>
                <Row className="show-grid">
                    <Col xs={12} md={8}>
                        <code>.col-xs-12 .col-md-8</code>
                    </Col>
                    <Col xs={6} md={4}>
                        <code>.col-xs-6 .col-md-4</code>
                    </Col>
                </Row>

                <Row className="show-grid">
                    <Col xs={6} md={4}>
                        <code>.col-xs-6 .col-md-4</code>
                    </Col>
                    <Col xs={6} md={4}>
                        <code>.col-xs-6 .col-md-4</code>
                    </Col>
                    <Col xs={6} md={4}>
                        <code>.col-xs-6 .col-md-4</code>
                    </Col>
                </Row>
            </Container>
        </Modal.Body>
        <Modal.Footer>
            <Button onClick={props.onHide}>Close</Button>
        </Modal.Footer>
    </Modal >
}

export default MainList
