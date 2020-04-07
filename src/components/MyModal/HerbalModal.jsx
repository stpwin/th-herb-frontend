import React, { Component } from 'react'
import { MyModal } from "./MyModal"
import { Form, Col, Row, Button, Image } from 'react-bootstrap'
import { compose } from 'redux'
import { withFirestore } from 'react-redux-firebase'

import { storageConfig } from "../../config"

import Gallery from "./Gallery"
import Upload from "./Upload"

import "./tagInput.css"

import * as Holder from "holderjs"

class HerbalModal extends Component {
  state = {
    showPublic: true,
    showGallery: false,
    showUpload: false,
    selectedImageSrc: "",
    galleryImages: [],
    fetchGalleryImage: true,
    updating: false,
    data: {
      herbalName: "",
      scientificName: "",
      description: "",
      image: "",
    }
  }

  componentDidMount() {
    Holder.run({
      images: ".image-preview"
    })
  }
  componentDidUpdate() {
    Holder.run({
      images: ".image-preview"
    })
  }

  handleChange = (e) => {
    this.setState({
      data: { ...this.state.data, [e.target.name]: e.target.value }
    })

  }

  handleShowPublicChange = (e) => {
    this.setState({
      data: {
        ...this.state.data,
        showPublic: e.target.value === "true"
      }
    })
  }

  handleShowGallery = () => {
    this.setState({
      showGallery: true
    })
  }
  handleHideGallery = () => {
    this.setState({
      showGallery: false
    })
  }

  handleShowUpload = () => {
    this.setState({
      showUpload: true
    })
  }

  handleHideUpload = () => {
    this.setState({
      showUpload: false
    })
  }

  handleUploadDone = (url, name) => {
    this.setState({
      showUpload: false,
      selectedImageSrc: url,
      data: { ...this.state.data, image: name },
      galleryImages: [...this.state.galleryImages, { url: url, name: name }]
    })
  }

  handleGalleryFetchDone = (images) => {
    this.setState({
      galleryImages: images,
      fetchGalleryImage: false
    })
  }

  handleImageClick = (e) => {
    const imageName = e.target.getAttribute("data-img-name")
    this.setState({
      showGallery: false,
      selectedImageSrc: e.target.src,
      data: { ...this.state.data, image: imageName }
    })
  }

  handleSubmit = () => {
    const firestore = this.props.firestore
    const { data, data: { herbalName } } = this.state

    this.setState({
      updating: true
    })

    firestore.set({ collection: 'herbals', doc: herbalName }, {
      ...data,
      owner: 'Anonymous',
      createdAt: firestore.FieldValue.serverTimestamp()
    }).then(() => {
      this.setState({
        updating: false,
      })
      this.props.onHide()
    })
  }

  render() {
    const { data: { herbalName, scientificName, description }, tags, showGallery, showUpload, galleryImages, fetchGalleryImage, selectedImageSrc, updating } = this.state
    const { onHide } = this.props
    let modalBody = <HerbalForm tags={tags}
      herbalName={herbalName}
      scientificName={scientificName}
      description={description}
      onChange={this.handleChange}
      selectedImageSrc={selectedImageSrc}
      handleShowGallery={this.handleShowGallery}
      handleShowUpload={this.handleShowUpload}
      handleShowPublicChange={this.handleShowPublicChange}
    />
    const modalTitle = "เพิ่มสมุนไพร"
    let modalSubTitle = ""
    let submittext = "บันทึก"
    let showsubmit = "true"
    let canceltext = "ปิด"
    let onCancel = onHide
    let submitdisable = updating.toString()

    if (showUpload) {
      modalSubTitle = " > อัพโหลดภาพ"
      submittext = "เสร็จสิ้น"
      showsubmit = "false"
      canceltext = "กลับ"
      onCancel = this.handleHideUpload
      modalBody = <Upload onUploadDone={this.handleUploadDone} uploadPath={storageConfig.herbal_images_path} />
      submitdisable = "false"

    } else if (showGallery) {
      modalSubTitle = " > เลือกภาพ"
      onCancel = this.handleHideGallery
      submittext = "เลือกภาพ"
      showsubmit = "false"
      canceltext = "กลับ"
      modalBody =
        <Gallery
          onClick={this.handleImageClick}
          galleryImages={galleryImages}
          fetchImage={fetchGalleryImage}
          onFetchDone={this.handleGalleryFetchDone}
          gallerypath={storageConfig.herbal_images_path}
        />
    }
    return <MyModal
      show={this.props.show}
      body={modalBody}
      title={modalTitle + modalSubTitle}
      submittext={submittext}
      showsubmit={showsubmit}
      canceltext={canceltext}
      onCancel={onCancel}
      onHide={onHide}
      submitdisable={submitdisable}
      onSubmit={this.handleSubmit}
    />
  }
}

const HerbalForm = ({ herbalName, scientificName, description, showPublic, selectedImageSrc, onChange, handleShowPublicChange, handleShowGallery, handleShowUpload }) => <Form>
  <Form.Group as={Row}>
    <Form.Label column sm="2">ชื่อสมุนไพร</Form.Label>
    <Col sm="10">
      <Form.Control type="text" placeholder="ชื่อสมุนไพร" name="herbalName" value={herbalName} onChange={onChange} />
    </Col>
  </Form.Group>

  <Form.Group as={Row}>
    <Form.Label column sm="2">ชื่อวิทยาศาสตร์</Form.Label>
    <Col sm="10">
      <Form.Control type="text" placeholder="ชื่อวิทยาศาสตร์" name="scientificName" value={scientificName} onChange={onChange} />
    </Col>
  </Form.Group>

  <Form.Group as={Row}>
    <Form.Label column sm="2">รายละเอียด</Form.Label>
    <Col sm="10">
      <Form.Control as="textarea" rows="3" name="description" value={description} onChange={onChange} />
    </Col>
  </Form.Group>

  <Form.Group as={Row}>
    <Form.Label column sm="2">แสดงต่อสาธารณะ</Form.Label>
    <Col sm="3">
      <Form.Control as="select" name="showPublic" value={showPublic} onChange={handleShowPublicChange}>
        <option value="true">แสดง</option>
        <option value="false">ไม่แสดง</option>
      </Form.Control>
    </Col>
  </Form.Group>

  <Form.Group as={Row}>
    <Form.Label column sm="2">รูปภาพ</Form.Label>
    <Col md={3}>
      {selectedImageSrc ? <Image className="image-preview" width="210px" src={selectedImageSrc} thumbnail /> : <Image width="210px" className="image-preview" src="holder.js/200x200?text=ไม่ได้เลือก" thumbnail />}

    </Col>
    <Col md={2} style={{ alignSelf: "center" }}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Button variant="primary" onClick={handleShowGallery}>เลือกรูปจากคลัง</Button>
        <Button variant="primary" className="mt-3" onClick={handleShowUpload}>อัพโหลด</Button>
      </div>
    </Col>
  </Form.Group>
</Form>

const enhance = compose(
  withFirestore,
)

export default enhance(HerbalModal)
