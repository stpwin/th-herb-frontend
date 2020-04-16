import React, { Component } from 'react'
import { Media, Image } from 'react-bootstrap'

import * as Holder from "holderjs"

export class HerbalMedia extends Component {
  componentDidMount() {
    Holder.run({
      className: "image-herbal"
    })
  }

  componentDidUpdate() {
    Holder.run({
      className: "image-herbal"
    })
  }
  
  render() {
    return (
      <Media>
        <Image width="100" className="image-herbal" src={this.props.image || "holder.js/100x100"}></Image>
        <Media.Body>
          {/* <h5>Media Heading</h5> */}
          <p>
            {this.props.title}
          </p>
        </Media.Body>
      </Media>
    )
  }
}

export default HerbalMedia
