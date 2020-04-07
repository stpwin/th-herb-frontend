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

// const KeyCodes = {
//   // comma: 188,
//   enter: 13,
// };

// const delimiters = [KeyCodes.comma, KeyCodes.enter];

// const suggestions = [
//   {
//     id: "ตำรับไม่มีชื่อ",
//     text: "ตำรับไม่มีชื่อ"
//   },
//   {
//     id: "ควยต้า",
//     text: "ควยต้า"
//   }
// ]

class DiseaseModal extends Component {
  state = {
    // tags: [],
    showGallery: false,
    showPublic: true,
    showUpload: false,
    selectedImageSrc: "",
    selectedImageName: "",
    diseaseName: "",
    description: "",
    galleryImages: [],
    fetchGalleryImage: true,
    updating: false
  }

  componentDidMount() {
    Holder.run({
      images: ".image-preview"
    })
    // console.log(this.props)
  }
  componentDidUpdate() {
    Holder.run({
      images: ".image-preview"
    })
  }



  // handleAddition = (tag) => {
  //   this.setState(state => ({ tags: [...state.tags, tag] }))
  // }

  // handleDelete = (i) => {
  //   const { tags } = this.state;
  //   this.setState({
  //     tags: tags.filter((tag, index) => index !== i),
  //   });
  // }

  // handleDrag(tag, currPos, newPos) {
  //   const tags = [...this.state.tags]
  //   const newTags = tags.slice();

  //   newTags.splice(currPos, 1)
  //   newTags.splice(newPos, 0, tag)

  //   // re-render
  //   this.setState({ tags: newTags })
  // }

  // handleTagClick = (index) => {
  //   console.log('The tag at index ' + index + ' was clicked')
  // }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  handleShowPublicChange = (e) => {
    this.setState({
      showPublic: e.target.value === "true"
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
      selectedImageName: name,
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
      selectedImageName: imageName
    })
    // console.log("Selected", imageName)
  }

  handleSubmit = () => {
    const firestore = this.props.firestore
    const { diseaseName, description, selectedImageName, showPublic } = this.state

    this.setState({
      updating: true
    })

    firestore.set({ collection: 'diseases', doc: diseaseName }, {
      description: description,
      image: selectedImageName,
      showPublic: showPublic,
      owner: 'Anonymous',
      createdAt: firestore.FieldValue.serverTimestamp(),
      // modifyAt: firestore.FieldValue.serverTimestamp()
    }).then(() => {
      this.setState({
        updating: false,
      })
      this.props.onHide()
      // console.log("Success")
    })
  }

  render() {
    const { diseaseName, description, tags, showGallery, showUpload, galleryImages, fetchGalleryImage, selectedImageSrc, updating } = this.state
    const { onHide } = this.props
    let modalBody = <DiseaseForm tags={tags}
      diseaseName={diseaseName}
      description={description}
      onChange={this.handleChange}
      selectedImageSrc={selectedImageSrc}
      // handleDelete={this.handleDelete}
      // handleAddition={this.handleAddition}
      // handleTagClick={this.handleTagClick}
      handleShowGallery={this.handleShowGallery}
      handleShowUpload={this.handleShowUpload}
      handleShowPublicChange={this.handleShowPublicChange}
    />
    const modalTitle = "เพิ่มโรค"
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
      modalBody = <Upload onUploadDone={this.handleUploadDone} uploadPath={storageConfig.disease_images_path} />
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
          gallerypath={storageConfig.disease_images_path}
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

const DiseaseForm = ({ diseaseName, description, showPublic, selectedImageSrc, onChange, tags, handleDelete, handleAddition, handleTagClick, handleShowGallery, handleShowUpload, handleShowPublicChange }) => <Form>
  <Form.Group as={Row}>
    <Form.Label column sm="2">ชื่อโรค</Form.Label>
    <Col sm="10">
      <Form.Control type="text" placeholder="ชื่อโรค" name="diseaseName" value={diseaseName} onChange={onChange} />
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


  {/* <Form.Group as={Row}>
    <Form.Label column sm="2">ตำรับ</Form.Label>
    <Col sm="10">
      <ReactTags
        placeholder="ตำรับ"
        tags={tags}
        suggestions={suggestions}
        delimiters={delimiters}
        handleDelete={handleDelete}
        handleAddition={handleAddition}
        handleTagClick={handleTagClick}
        allowDragDrop={false}
        allowUnique={true}
        allowDeleteFromEmptyInput={false}
      />
    </Col>
  </Form.Group> */}

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

export default enhance(DiseaseModal)
