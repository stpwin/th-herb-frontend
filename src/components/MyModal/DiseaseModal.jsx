import React, { Component, Fragment } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux';
import { withFirestore } from 'react-redux-firebase'
import { storageConfig } from "../../config"
import { getDownloadUrl } from "../../utils"
import * as Holder from "holderjs"

import "./diseaseTable.css"

import { FaPlus, FaEye, FaEyeSlash, FaTools } from 'react-icons/fa'
import { MyModal } from "./MyModal"
import { Form, Col, Row, Button, Image, Table } from 'react-bootstrap'
import { ToolButtons } from "./ToolButtons"

import Gallery from "./Gallery"
import Upload from "./Upload"

const images_path = storageConfig.disease_images_path
let diseasesListener
class DiseaseModal extends Component {
  state = {
    data: {
      diseaseName: "",
      description: "",
      showPublic: true,
      image: "",
    },
    showAdd: false,
    showGallery: false,
    showUpload: false,
    selectedImageSrc: "",
    galleryImages: [],
    fetchGalleryImage: true,
    updating: false,
    diseases: [],
    /** @type {firebase.firestore.DocumentSnapshot} */
    updateDocSnapshot: null
  }

  fetchData = () => {
    /** @type {firebase.firestore.Firestore} */
    const firestore = this.props.firestore
    console.log("start listening")
    // console.log(this.props)
    if (diseasesListener) return
    diseasesListener = firestore.collection('diseases').orderBy('createdAt').onSnapshot(({ docs: diseases }) => {
      this.setState({ diseases })
    }, (error) => {
      // console.warn(error)
    })
  }

  stopListener = () => {
    if (diseasesListener) {
      console.log("stop disease listener")
      diseasesListener()
    }
  }

  componentWillUnmount() {
    console.log("Disease Modal Unmount")
    this.stopListener()
  }

  componentDidMount() {
    console.log("Disease Modal mount")
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
      showAdd: true,
      showUpload: false,
      selectedImageSrc: url,
      data: {
        ...this.state.data,
        image: name
      },
      galleryImages: [...this.state.galleryImages, { url: url, name: name }]
    })
  }

  handleGalleryFetchDone = images => {
    this.setState({ galleryImages: images, fetchGalleryImage: false })
  }

  handleImageClick = (e) => {
    const imageName = e.target.getAttribute("data-img-name")
    this.setState({
      showAdd: true,
      showGallery: false,
      selectedImageSrc: e.target.src,
      data: {
        ...this.state.data,
        image: imageName
      }
    })
  }

  handleSubmit = () => {
    /** @type {firebase.firestore.Firestore} */
    const firestore = this.props.firestore
    /** @type {firebase.User} */
    const user = this.props.authUser
    if (!user) {
      console.warn("Auth required!")
      this.props.showLogin()
      return
    }
    const { data, data: { diseaseName, description }, updateDocSnapshot } = this.state
    this.setState({ updating: true })

    const trimed = {
      ...data,
      diseaseName: diseaseName.trim(),
      description: description.trim(),
    }

    if (updateDocSnapshot) {
      updateDocSnapshot.ref.update({
        ...trimed,
        // owner: user.uid,
        modifyAt: firestore.FieldValue.serverTimestamp()
      }).then(() => {
        this.setState({ showAdd: false, updating: false, })
      })
      return
    }

    let collectionRef = firestore.collection('diseases')
    collectionRef.where('diseaseName', '==', trimed.diseaseName).get().then(doc => {
      if (!doc.empty) {
        return Promise.reject("ชื่อซ้ำในระบบ")
      }
      return collectionRef.add({
        ...trimed,
        owner: user.uid,
        createdAt: firestore.FieldValue.serverTimestamp()
      })
    }).then(result => {
      console.log("disease added", result)
      this.setState({ showAdd: false, updating: false, })
    }).catch(err => {
      console.warn("disease added fail: ", err)
      this.setState({ updating: false, })
    })


    // firestore.collection('diseases').add({
    //   ...data,
    //   owner: user.uid,
    //   createdAt: firestore.FieldValue.serverTimestamp()
    // }).then(() => {
    //   this.setState({ showAdd: false, updating: false, })
    // })
  }

  handleShowAdd = () => {
    this.setState({
      showAdd: true,
      data: {
        diseaseName: "",
        description: "",
        showPublic: true,
        image: "",
      },
      selectedImageSrc: "",
      updateDocSnapshot: null,
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

    /** @type {firebase.User} */
    const user = this.props.authUser
    if (!user) {
      console.warn("Auth required!")
      this.props.showLogin()
      return
    }

    snapshot.ref.delete().then(() => {
      console.log("deleted")
    }).catch(err => {
      console.log("deleted fail:", err)
    })
  }

  render() {
    const { data, diseases, showAdd, showGallery, showUpload, galleryImages, fetchGalleryImage, selectedImageSrc, updating, updateDocSnapshot } = this.state
    const { onHide } = this.props

    let modalTitle = "จัดการข้อมูลโรค"
    let modalSubTitle = ""
    let submittext = "บันทึก"
    let showsubmit = "false"
    let canceltext = "ปิด"
    let onCancel = onHide
    let submitdisable = updating.toString()

    let modalBody = <DiseaseList
      diseases={diseases}
      handleAdd={this.handleShowAdd}
      handleEdit={this.handleEdit}
      handleDelete={this.handleDelete}
    />
    const subtitle = updateDocSnapshot ? "แก้ไขข้อมูลโรค" : "เพิ่มข้อมูลโรค"
    if (showAdd) {
      modalSubTitle = subtitle
      submittext = "บันทึก"
      showsubmit = "true"
      canceltext = "กลับ"
      onCancel = this.handleHideAdd

      modalBody = <DiseaseForm
        data={data}
        selectedImageSrc={selectedImageSrc}
        onChange={this.handleChange}
        handleShowGallery={this.handleShowGallery}
        handleShowUpload={this.handleShowUpload}
        handleShowPublicChange={this.handleShowPublicChange}
      />
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
      submittext = "เลือกภาพจากคลัง"
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

const DiseaseList = ({ diseases, handleAdd, handleEdit, handleDelete }) =>
  <Fragment>
    <div className="mb-1 text-right">
      <Button variant="success" onClick={handleAdd}><FaPlus /></Button>
    </div>
    <div style={{ height: "40rem", overflowY: "auto" }}>
      <Table bordered striped size="sm" responsive hover >
        <thead>
          <tr>
            <th className="text-center" style={{ width: "5%" }}>#</th>
            <th style={{ width: "20%" }}>ชื่อโรค</th>
            <th style={{ width: "55%" }}>รายละเอียด</th>
            <th className="text-center" style={{ width: "5%" }}><FaEye /></th>
            <th className="text-center" style={{ width: "10%" }}><FaTools /></th>
          </tr>
        </thead>
        <tbody>
          {(diseases && diseases.length > 0 && diseases.map((disease, index) => {
            const data = disease.data()
            return <tr key={`disease-${index}`}>
              <td className="text-center">{index + 1}</td>
              <td>{data.diseaseName}</td>
              <td><p className="td-fixed-content">{data.description}</p></td>
              <td className="text-center">{data.showPublic ? <FaEye /> : <FaEyeSlash />}</td>
              <td >
                <div style={{ alignSelf: "center" }} className="text-center">
                  <ToolButtons onDelete={() => handleDelete(disease)} onEdit={() => handleEdit(disease)} />
                </div>
              </td>
            </tr>
          })) ||
            (<tr>
              <td colSpan={5} className="text-center py-5">ไม่มีข้อมูล</td>
            </tr>)}
        </tbody>
      </Table>
    </div>
  </Fragment>



const DiseaseForm = ({ data: { diseaseName, description, showPublic }, selectedImageSrc, onChange, handleShowGallery, handleShowUpload, handleShowPublicChange }) => <Form>
  <Form.Group as={Row}>
    <Form.Label column sm="2">ชื่อโรค</Form.Label>
    <Col sm="10">
      <Form.Control type="text" placeholder="ชื่อโรค" name="diseaseName" value={diseaseName} onChange={onChange} />
    </Col>
  </Form.Group>

  <Form.Group as={Row}>
    <Form.Label column sm="2">รายละเอียด</Form.Label>
    <Col sm="10">
      <Form.Control as="textarea" rows="14" name="description" value={description} onChange={onChange} />
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
    dispatch({ type: 'SHOW_LOGIN' }),
});

const enhance = compose(
  withFirestore,
  connect(mapStateToProps, mapDispatchToProps)
)

export default enhance(DiseaseModal)
