import React, { Component } from 'react'
import PropTypes from "prop-types"

import { Media, Dropdown, Badge, Button } from "react-bootstrap"
import { FaBars, FaPlusCircle } from "react-icons/fa"

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
      <Media key={this.props.uid} style={{ opacity: this.props.hidden ? 1 : 1 }} as="li" className="my-4">
        <a href={`#${this.props.path}`}>
          <img
            width={256}
            height={256}
            className="mr-3 image-holder"
            src={this.props.image}
            alt="Generic placeholder"
          />
        </a>

        <Media.Body>
          <div style={{ display: "flex" }}>
            <a href={`#${this.props.path}`}><h4>{this.props.title}</h4></a><div className="title-badges">{this.props.hidden ? <Badge variant="warning" className="ml-2">ซ่อนจากสาธารณะ</Badge> : null}</div>
            <span className="ml-auto"></span>
            <Dropdown alignRight className="hide-toggle">
              {this.props.showTool ? <Dropdown.Toggle variant="secondary-outline" id="dropdown-basic" size="sm">
                <FaBars color="red" />
              </Dropdown.Toggle> : null}
              <Dropdown.Menu>
                <Dropdown.Item data-uid={this.props.uid} onClick={this.props.onEditClick}>แก้ไข</Dropdown.Item>
                <Dropdown.Item data-uid={this.props.uid} onClick={this.props.onHideClick}>{this.props.hidden ? "แสดงสู่สาธารณะ" : "ซ่อนจากสาธารณะ"}</Dropdown.Item>
                <Dropdown.Item data-uid={this.props.uid} onClick={this.props.onDeleteClick}>ลบ</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <p className="item-content">
            {this.props.content}
          </p>
          <div>
            {(this.props.data && this.props.data.map((item, index) => {
              return (
                <a key={`${this.props.uid}-${index}`} href={`#${this.props.path}/${item.path}`}>
                  <Badge variant="success" className="mr-2 custom-badge">{this.props.prefix} {index + 1} {item.name}</Badge>
                </a>
              )
            })) || <span className="mr-1">ไม่พบข้อมูล{this.props.prefix}</span>}
            {this.props.showTool ? <Button className="add-herbal-btn" onClick={this.props.onAddRecipeOrDiseaseClick}><FaPlusCircle /></Button> : null}
          </div>
        </Media.Body>
      </Media>
    )
  }
}

MediaItem.propsTypes = {
  title: PropTypes.string,
  path: PropTypes.string,
  hidden: PropTypes.bool,
  showTool: PropTypes.bool,
  content: PropTypes.string,
  data: PropTypes.arrayOf(PropTypes.shape({
    path: PropTypes.string,
    name: PropTypes.string
  })),
  uid: PropTypes.string,
  prefix: PropTypes.string,
  onAddRecipeOrDiseaseClick: PropTypes.func,
  onEditClick: PropTypes.func,
  onDeleteClick: PropTypes.func,
  onHideClick: PropTypes.func
}
