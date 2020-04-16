import React, { Component, Fragment } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux';
import { withFirestore } from 'react-redux-firebase'
import { storageConfig } from "../../config"
import * as Holder from "holderjs"
import { getDownloadUrl } from "../../utils"

import { MyModal } from "./MyModal"
import { Form, Col, Row, Button, Image, Table } from 'react-bootstrap'
import { ToolButtons } from "./ToolButtons"
import { FaPlus, FaEye, FaEyeSlash, FaTools } from 'react-icons/fa'
import Gallery from "./Gallery"
import Upload from "./Upload"

const images_path = storageConfig.herbal_images_path
let herbalsListener
class HerbalModal extends Component {
  state = {
    showAdd: false,
    showGallery: false,
    showUpload: false,
    selectedImageSrc: "",
    galleryImages: [],
    fetchGalleryImage: true,
    updating: false,
    herbals: [],
    /** @type {firebase.firestore.DocumentSnapshot} */
    updateDocSnapshot: null,
    data: {
      herbalName: "",
      scientificName: "",
      nativeName: "",
      description: "",
      image: "",
      showPublic: true,
    }
  }

  fetchData = () => {
    /** @type {firebase.firestore.Firestore} */
    const firestore = this.props.firestore
    console.log("start listening")
    if (herbalsListener) return
    herbalsListener = firestore.collection('herbals').orderBy('createdAt').onSnapshot(({ docs: herbals }) => {
      this.setState({
        herbals
      })
    }, (error) => {

    })
  }

  stopListener = () => {
    if (herbalsListener) {
      console.log("stop herbals listener")
      herbalsListener()
    }
  }

  componentWillUnmount() {
    this.stopListener()
  }

  componentDidMount() {
    this.stopListener()
    // return //DISABLED
    Holder.run({ images: ".image-preview" })
    /**@type {firebase.auth.Auth} */
    const auth = this.props.firebase.auth()
    auth.onAuthStateChanged(user => {
      if (user) {
        this.fetchData()
      }
    })
    // this.fetchData()
  }

  componentDidUpdate() {
    Holder.run({ images: ".image-preview" })
  }

  handleChange = (e) => {
    this.setState({ data: { ...this.state.data, [e.target.name]: e.target.value } })
  }

  handleShowPublicChange = (e) => {
    this.setState({ data: { ...this.state.data, showPublic: e.target.value === "true" } })
  }

  handleShowGallery = () => {
    this.setState({ showAdd: false, showGallery: true })
  }

  handleHideGallery = () => {
    this.setState({ showAdd: true, showGallery: false })
  }

  handleShowUpload = () => {
    this.setState({ showAdd: false, showUpload: true })
  }

  handleHideUpload = () => {
    this.setState({ showAdd: true, showUpload: false })
  }

  handleUploadDone = (url, name) => {
    this.setState({
      showUpload: false,
      showAdd: true,
      selectedImageSrc: url,
      data: { ...this.state.data, image: name },
      galleryImages: [...this.state.galleryImages, { url, name }]
    })
  }

  handleGalleryFetchDone = (images) => {
    this.setState({
      galleryImages: images,
      fetchGalleryImage: false
    })
  }

  handleImageClick = (e) => {
    const image = e.target.getAttribute("data-img-name")
    this.setState({
      showAdd: true,
      showGallery: false,
      selectedImageSrc: e.target.src,
      data: { ...this.state.data, image }
    })
  }

  handleSubmit = () => {
    /** @type {firebase.firestore.Firestore} */
    const firestore = this.props.firestore
    const { data, data: { herbalName, scientificName, nativeName, description }, updateDocSnapshot } = this.state

    /** @type {firebase.User} */
    const user = this.props.authUser
    if (!user) {
      console.warn("Auth required!")
      this.props.showLogin()
      return
    }

    const trimed = {
      ...data,
      herbalName: herbalName.trim(),
      scientificName: scientificName.trim(),
      nativeName: nativeName.trim(),
      description: description.trim(),
    }
    // console.log(trimed)
    this.setState({ updating: true })
    if (updateDocSnapshot) {
      updateDocSnapshot.ref.update({
        ...trimed,
        modifyAt: firestore.FieldValue.serverTimestamp()
      }).then(() => {
        this.setState({ showAdd: false, updating: false, })
      })
      return
    }

    let collectionRef = firestore.collection('herbals')
    collectionRef.where('herbalName', '==', trimed.herbalName).get().then(doc => {
      if (!doc.empty) {
        return Promise.reject("ชื่อซ้ำในระบบ")
      }
      return collectionRef.add({
        ...trimed,
        owner: user.uid,
        createdAt: firestore.FieldValue.serverTimestamp()
      })
    }).then(result => {
      console.log("herbal added", result)
      this.setState({ showAdd: false, updating: false, })
    }).catch(err => {
      console.warn("herbal added fail: ", err)
      this.setState({ updating: false, })
    })
  }

  handleShowAdd = () => {
    this.setState({
      showAdd: true,
      data: {
        herbalName: "",
        scientificName: "",
        nativeName: "",
        description: "",
        image: "",
        showPublic: true,
      },
      selectedImageSrc: "",
      updateDocSnapshot: null
    })
  }

  handleHideAdd = () => { this.setState({ showAdd: false }) }

  /**
  * @param {firebase.firestore.DocumentSnapshot} snapshot
  */
  handleEdit = snapshot => {
    const data = snapshot.data()
    this.setState({
      data,
      selectedImageSrc: data.image && getDownloadUrl(images_path, data.image),
      showAdd: true,
      updateDocSnapshot: snapshot
    })
  }

  /**
  * @param {firebase.firestore.DocumentSnapshot} snapshot
  */
  handleDelete = snapshot => {
    if (!snapshot) return
    snapshot.ref.delete().then(() => {
      console.log("deleted")
    }).catch(err => {
      console.log("deleted fail:", err)
    })
  }

  render() {
    const { data, herbals, updateDocSnapshot, showAdd, showGallery, showUpload, galleryImages, fetchGalleryImage, selectedImageSrc, updating } = this.state
    const { onHide } = this.props


    const modalTitle = "จัดการข้อมูลสมุนไพร"
    let modalSubTitle = ""
    let submittext = ""
    let showsubmit = "false"
    let canceltext = "ปิด"
    let onCancel = onHide
    let submitdisable = updating.toString()

    let modalBody = <HerbalList
      herbals={herbals}
      handleAdd={this.handleShowAdd}
      handleEdit={this.handleEdit}
      handleDelete={this.handleDelete}
    />

    const subtitle = updateDocSnapshot ? "แก้ไขข้อมูลสมุนไพร" : "เพิ่มข้อมูลสมุนไพร"
    if (showAdd) {
      modalBody = <HerbalForm
        data={data}
        onChange={this.handleChange}
        selectedImageSrc={selectedImageSrc}
        handleShowGallery={this.handleShowGallery}
        handleShowUpload={this.handleShowUpload}
        handleShowPublicChange={this.handleShowPublicChange}
      />
      modalSubTitle = subtitle
      submittext = "บันทึก"
      showsubmit = "true"
      canceltext = "กลับ"
      onCancel = this.handleHideAdd

    } else if (showUpload) {
      modalSubTitle = subtitle + " > อัพโหลดภาพ"
      submittext = "เสร็จสิ้น"
      showsubmit = "false"
      canceltext = "กลับ"
      onCancel = this.handleHideUpload
      modalBody = <Upload onUploadDone={this.handleUploadDone} uploadPath={images_path} />
      submitdisable = "false"

    } else if (showGallery) {
      modalSubTitle = subtitle + " > เลือกภาพ"
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
      title={modalTitle + (modalSubTitle ? " > " + modalSubTitle : "")}
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

const HerbalList = ({ herbals, handleAdd, handleEdit, handleDelete }) =>
  <Fragment>
    <div className="mb-1 text-right">
      <Button variant="success" onClick={handleAdd}><FaPlus /></Button>
    </div>
    <div style={{ height: "40rem", overflowY: "auto" }}>
      <Table bordered striped size="sm" responsive hover >
        <thead>
          <tr>
            <th className="text-center" style={{ width: "5%" }}>#</th>
            <th style={{ width: "15%" }}>ชื่อสมุนไพร</th>
            <th>ชื่อวิทยาศาสตร์</th>
            <th>ชื่อท้องถิ่น</th>
            <th>สรรพคุณ</th>
            <th className="text-center" style={{ width: "5%" }}><FaEye /></th>
            <th className="text-center" style={{ width: "10%" }}><FaTools /></th>
          </tr>
        </thead>
        <tbody>
          {(herbals && herbals.length > 0 && herbals.map((herbal, index) => {
            const data = herbal.data()
            return <tr key={`herbal-${index}`}>
              <td className="text-center">{index + 1}</td>
              <td>{data.herbalName}</td>
              <td>{data.scientificName}</td>
              <td><p className="td-fixed-content">{data.nativeName}</p></td>
              <td><p className="td-fixed-content">{data.description}</p></td>
              <td className="text-center">{data.showPublic ? <FaEye /> : <FaEyeSlash />}</td>
              <td >
                <div style={{ alignSelf: "center" }} className="text-center">
                  <ToolButtons onDelete={() => handleDelete(herbal)} onEdit={() => handleEdit(herbal)} />
                </div>
              </td>
            </tr>
          })) ||
            (<tr>
              <td colSpan={7} className="text-center py-5">ไม่มีข้อมูล</td>
            </tr>)}
        </tbody>
      </Table>
    </div>
  </Fragment>

const HerbalForm = ({ data: { herbalName, scientificName, nativeName, description, showPublic }, selectedImageSrc, onChange, handleShowPublicChange, handleShowGallery, handleShowUpload }) => <Form>
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
    <Form.Label column sm="2">ชื่อท้องถิ่น</Form.Label>
    <Col sm="10">
      <Form.Control type="text" placeholder="ชื่อท้องถิ่น" name="nativeName" value={nativeName} onChange={onChange} />
    </Col>
  </Form.Group>

  <Form.Group as={Row}>
    <Form.Label column sm="2">สรรพคุณ</Form.Label>
    <Col sm="10">
      <Form.Control as="textarea" rows="8" name="description" value={description} onChange={onChange} />
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

const mapStateToProps = state => ({
  authUser: state.login.authUser,
});

const mapDispatchToProps = dispatch => ({
  showLogin: () =>
    dispatch({ type: 'SHOW_LOGIN' })
});

const enhance = compose(
  withFirestore,
  connect(mapStateToProps, mapDispatchToProps)
)

export default enhance(HerbalModal)
