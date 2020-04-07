import React, { PureComponent } from 'react'
import { compose } from "redux"
// import { withHandlers } from 'recompose'
import { withFirebase } from 'react-redux-firebase'

import PropsTypes from "prop-types"
import { Image } from 'react-bootstrap'

import "./gallery.css"

import * as Holder from "holderjs"

export class Gallery extends PureComponent {
  state = {
    images: []
  }

  getImages = () => {
    const storageRef = this.props.firebase.storage().ref(this.props.gallerypath)
    console.log("Fetching image...")
    storageRef.listAll().then(res => {
      res.items.forEach(itemRef => {
        itemRef.getDownloadURL().then(url => {
          // console.log(itemRef);
          this.setState({
            images: [...this.state.images, { url: url, name: itemRef.name }]
          })
          if (res.items.length === this.state.images.length) {
            this.props.onFetchDone && this.props.onFetchDone(this.state.images)
            console.log("Fetch done.")
          }
          // console.info(url)
        }).catch(err => {
          console.warn(err)
        })
      })
      // console.info(res)
    }).catch(err => {
      console.error(err)
    })
  }

  componentDidMount() {
    Holder.run({
      images: ".gallery-item"
    })
    console.log("Gallery DidMount")

    if (this.props.fetchImage) {
      this.getImages()
    } else {
      if (this.props.galleryImages) {
        this.setState({
          images: this.props.galleryImages
        })
      }
    }


  }
  componentDidUpdate() {
    Holder.run({
      images: ".gallery-item"
    })
  }


  render() {
    const { images } = this.state
    return (
      <div className="gallery-container">
        <div className="gallery">
          {images.map((value, index) => {
            return <Image key={`gallery-img-${value.name}`}
              className="gallery-item"
              // src={`holder.js/171x180?text=${index}`}
              src={value.url}
              data-img-name={value.name}
              onClick={this.props.onClick}
              width="210px"
            />
          })
          }
        </div>
      </div>
    )
  }
}

Gallery.propsTypes = {
  onClick: PropsTypes.func
}

const enhance = compose(
  withFirebase,
  // withHandlers({
  //   fetchImage: props => () =>
  //     props.storage().ref().child("thumb/0.svg")
  // })
)

export default enhance(Gallery)
