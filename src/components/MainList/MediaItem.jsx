import React, { Component } from 'react'
import PropTypes from "prop-types"

import { Container, Button, Image, Row, Col } from "react-bootstrap"
// import { FaBars, FaPlusCircle } from "react-icons/fa"

import "./mediaItem.css"

import * as Holder from "holderjs"

export default class MediaItem extends Component {

  componentDidUpdate() {
    Holder.run({
      images: ".image-holder"
    })
  }

  componentDidMount() {
    Holder.run({
      images: ".image-holder"
    })
  }

  render() {
    return (
      <>
        {/* <Media key={this.props.uid} style={{ opacity: this.props.hidden ? 1 : 1 }} as="li" className="my-4"> */}
        {/* <a href={`#${this.props.path}`}> */}
        <Container fluid className="mb-5">
          <Row>
            <Col sm={5} md={2} >
              <Image
                rounded
                fluid
                // width={256}
                // height={256}
                className="mr-3 image-holder"
                src={this.props.image}
                alt={this.props.title}
                data-path={this.props.path}
                onClick={this.props.onImageClick}

              />
            </Col>
            <Col sm={5} md={10} >
              <Row>
                <Col>
                  <div style={{ display: "flex" }} className="mt-1">
                    <h4 data-path={this.props.path} onClick={this.props.onImageClick}>{`${this.props.title}`}</h4>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col>
                  <p className="item-content">
                    {`${this.props.content}`}
                  </p>
                </Col>
              </Row>
              <Row>
                <Col><div className="list-sub-button">
                  {(this.props.data && Object.entries(this.props.data).length > 0 && Object.entries(this.props.data).map(([k, v], index) => {
                    const name = (this.props.showBy === "โรค") ? `${this.props.prefix}ที่ ${index + 1} ${v.recipeName || ""}` : `${this.props.prefix}${v.diseaseName}`
                    return <Button key={`${this.props.uid}-${index}`} variant="success" className="mr-2 mb-1 custom-button" data-parent={this.props.path} data-uid={k} data-name={name} onClick={this.props.onSubClick}>{name}</Button>
                  })) || <span className="mr-1">ไม่พบข้อมูล{this.props.prefix}</span>}
                </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>



        {/* <Media.Body>


        </Media.Body>
      </Media> */}
      </>
    )
  }
}

MediaItem.propsTypes = {
  title: PropTypes.string,
  path: PropTypes.string,
  hidden: PropTypes.bool,
  // showTool: PropTypes.bool,
  content: PropTypes.string,
  data: PropTypes.arrayOf(PropTypes.shape({
    path: PropTypes.string,
    name: PropTypes.string
  })),
  uid: PropTypes.string,
  prefix: PropTypes.string,
  onImageClick: PropTypes.func,
  onSubClick: PropTypes.func
  // onAddRecipeOrDiseaseClick: PropTypes.func,
  // onEditClick: PropTypes.func,
  // onDeleteClick: PropTypes.func,
  // onHideClick: PropTypes.func
}
