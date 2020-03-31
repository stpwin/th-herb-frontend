import React, { Component, Fragment } from 'react'

import { Media, Dropdown, Badge } from "react-bootstrap"
import { FaBars } from "react-icons/fa"

export default class MediaItem extends Component {
    render() {
        return (
            <Media as="li" className="my-4">
                <a href={`#${this.props.path}`}>
                    <img
                        width={256}
                        height={256}
                        className="mr-3"
                        src={this.props.image}
                        alt="Generic placeholder"
                    />
                </a>

                <Media.Body>
                    <div style={{ display: "flex" }}>
                        <a href={`#${this.props.path}`}><h4>{this.props.title}</h4></a>
                        <span className="ml-auto"></span>
                        <Dropdown alignRight>
                            {/* <Button variant="success"><FaBars /></Button> */}
                            {this.props.showTool ? <Dropdown.Toggle variant="secondary-outline" id="dropdown-basic" size="sm" className="hide-toggle">
                                <FaBars color="red" />
                            </Dropdown.Toggle> : null}

                            <Dropdown.Menu>
                                <Dropdown.Item href="#/action-1">แก้ไข</Dropdown.Item>
                                <Dropdown.Item href="#/action-2">ซ่อนจากสาธารณะ</Dropdown.Item>
                                <Dropdown.Item href="#/action-3">ลบ</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                    <p style={{ maxHeight: "225px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 5, WebkitBoxOrient: "vertical" }}>
                        {this.props.content}
                    </p>
                    <div>


                        {(this.props.herbals && this.props.herbals.map((item, index) => {
                            return (<Fragment>
                                <a href={`#${this.props.path}/${item.path}`}>
                                    <Badge variant="success" className="mr-2">ตำรับที่ {index + 1}</Badge>
                                </a>
                                {/* <span className="mr-2"></span>
                                {item.herbs && item.herbs.map(herb => {
                                    return <span className="mr-1">{herb}</span>
                                })} */}
                            </Fragment>)

                        })) || "ไม่มีตำรับ"}

                    </div>
                </Media.Body>
            </Media>
        )
    }
}
