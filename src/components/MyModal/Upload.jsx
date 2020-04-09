import React, { PureComponent, Fragment } from 'react'
import { compose } from "redux"
// import { withHandlers } from 'recompose'
import { withFirebase } from 'react-redux-firebase'
import bsCustomFileInput from 'bs-custom-file-input'
import { v4 as uuidv4 } from 'uuid';
import { Form, Row, Col, Image, Button } from 'react-bootstrap'
import Cropper from 'react-easy-crop'
import getCroppedImg from './cropImage'

import * as Holder from "holderjs"
import "./upload.css"

export class Upload extends PureComponent {
  state = {
    src: null,
    crop: {
      x: 0,
      y: 0,
      // width: 300,
      // height: 300
    },
    zoom: 1,
    aspect: 1,
    croppedAreaPixels: null,
    uploading: false,
    uploaded: false,
    uploadSrc: null,
    filename: ""
  }

  componentDidMount() {
    bsCustomFileInput.init()
    Holder.run({
      images: ".image-preview"
    })
  }
  componentDidUpdate() {
    Holder.run({
      images: ".image-preview"
    })
  }

  onSelectFile = e => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      const file = e.target.files[0]
      console.log(file.name)
      reader.addEventListener('load', () => {
        this.setState({ src: reader.result, uploaded: false, filename: file.name });
      });
      reader.readAsDataURL(file);
    }
  };

  onCropChange = crop => {
    this.setState({ crop })
  }

  onCropComplete = (croppedArea, croppedAreaPixels) => {
    this.setState({
      croppedAreaPixels: croppedAreaPixels
    })
  }

  onZoomChange = zoom => {
    this.setState({ zoom })
  }

  handleUpload = async () => {
    const { src, croppedAreaPixels, filename } = this.state
    if (!src) return

    this.setState({
      uploading: true
    }, async () => {
      const croppedImage = await getCroppedImg(src, croppedAreaPixels)
      const metadata = {
        cacheControl: 'public,max-age=300',
        contentType: 'image/jpeg',
        customMetadata: {
          "originalFilename": filename
        }
      }
      const firebase = this.props.firebase
      const storageRef = firebase.storage().ref(this.props.uploadPath)
      const uploadTask = storageRef.child(uuidv4() + ".jpg").put(croppedImage, metadata)
      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, function (snapshot) {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running');
            break;
          default:
            break;
        }
      })

      uploadTask.then(snapshot => {
        console.log("Upload done, Getting image url...")
        snapshot.ref.getDownloadURL().then(downloadURL => {
          console.log("Image url:", downloadURL)
          this.setState({
            uploading: false,
            uploaded: true,
            uploadSrc: downloadURL
          })
          this.props.onUploadDone && this.props.onUploadDone(downloadURL, snapshot.ref.name)
        })
      })
      // console.log(croppedImage)
    })
  }

  render() {
    const { src, crop, zoom, aspect, uploading, uploaded, uploadSrc } = this.state
    return (
      <Fragment>
        <Row className="justify-content-center mb-3">
          <Col md={6}>
            <div className="text-center">
              {src ? (uploaded ? <Image className="image-preview" src={uploadSrc} thumbnail /> : <div className="crop-container"><Cropper
                image={src}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={this.onCropChange}
                onCropComplete={this.onCropComplete}
                onZoomChange={this.onZoomChange}
              /></div>) : <Image className="image-preview" src="holder.js/400x400?text=ไม่ได้เลือก" thumbnail />}
            </div>
          </Col>
        </Row>
        <Row className="justify-content-center mb-3">
          <Col md={4}>
            <Form.Group controlId="customFile">
              <Form.Control type="file" onChange={this.onSelectFile} />
              {/* <Form.Label>เลือกไฟล์</Form.Label> */}
            </Form.Group>
          </Col>
        </Row>
        <Row className="justify-content-center mb-3">
          <Col md={4} className="text-center">
            <Button onClick={this.handleUpload} disabled={!src || uploading}>อัพโหลด</Button>
          </Col>
        </Row>
      </Fragment>
    )
  }
}

const enhance = compose(
  withFirebase,
  // withHandlers({
  //   fetchImage: props => () =>
  //     props.storage().ref().child("thumb/0.svg")
  // })
)

export default enhance(Upload)
