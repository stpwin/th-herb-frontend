import React, { Component } from 'react'
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withFirebase, withFirestore } from 'react-redux-firebase'
import { getDownloadUrl } from "../../utils"
import { storageConfig } from "../../config"

import { Spinner, Container, Row, Col, Button, Dropdown } from "react-bootstrap"
import MediaItem from "./MediaItem"
import { DiseaseModal, HerbalModal, RecipeModal } from "../MyModal"

import "./mainList.css"

const dataList = [
  {
    name: "เบาหวาน",
    content: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like). It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).",
    image: "holder.js/256x256?text=เบาหวาน",
    data: [
      { path: "1", name: "ชื่อตำรับ", herbs: ["ใบมะยม", "ใบเหงือกปลาหมอ", "รากและต้นไมยราบ", "ใบเตยหอม"] },
      { path: "2", herbs: ["ใบมะยม", "ใบเหงือกปลาหมอ", "รากและต้นไมยราบ", "ใบเตยหอม"] }
    ],
    uid: "1",
    path: "เบาหวาน",
    hidden: true
  },
  {
    name: "เกี่ยวกับระดู",
    content: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like). It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).",
    image: "holder.js/256x256?text=เกี่ยวกับระดู",
    data: [
      { path: "1", herbs: ["ใบมะยม", "ใบเหงือกปลาหมอ", "รากและต้นไมยราบ", "ใบเตยหอม"] },
      { path: "2", herbs: ["2", "3", "4", "5"] }
    ],
    uid: "2",
    path: "เกี่ยวกับระดู",
    hidden: false
  }
]

const herbList = [
  {
    name: "ใบมะยม",
    content: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like). It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).",
    image: "holder.js/256x256?text=ใบมะยม",
    data: [
      { path: "1", name: "เกี่ยวกับระดู", herbs: ["ใบมะยม", "ใบเหงือกปลาหมอ", "รากและต้นไมยราบ", "ใบเตยหอม"] },
      { path: "2", herbs: ["เบาหวาน"] }
    ],
    uid: "1",
    path: "ใบมะยม",
    hidden: false
  },
  {
    name: "ใบเหงือกปลาหมอ",
    content: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like). It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).",
    image: "holder.js/256x256?text=ใบเหงือกปลาหมอ",
    data: [
      { path: "1", name: "เบาหวาน", herbs: ["A"] },
      { path: "2", herbs: ["B"] }
    ],
    uid: "2",
    path: "ใบเหงือกปลาหมอ",
    hidden: false
  }
]

const showItems = [
  { name: "โรค", ref: "ตำหรับ" },
  { name: "สมุนไพร", ref: "รักษา" }
]

let images_path = storageConfig.disease_images_path
export class MainList extends Component {
  state = {
    diseaseModal: false,
    herbalModal: false,
    recipeModal: false,
    loading: true,
    showBy: "โรค",
    linkPrefix: "ตำรับ",
    data: dataList,
    diseasesData: {}
  }

  componentDidMount() {
    /**@type {firebase.firestore.Firestore} */
    const firestore = this.props.firestore
    firestore.collection('recipes').orderBy('createdAt').onSnapshot(docsSnapshot => {
      let diseasesData = {}
      if (docsSnapshot.empty) return
      docsSnapshot.forEach(docSnapshot => {
        const recipeData = docSnapshot.data()

        /**@type {firebase.firestore.DocumentReference} */
        const diseaseRef = recipeData.diseaseRef
        //getting diseaseRef
        diseaseRef.get().then(diseaseDoc => {
          const diseaseData = diseaseDoc.data()
          const recipes = { ...(diseasesData[diseaseData.diseaseName] && diseasesData[diseaseData.diseaseName].recipes), [docSnapshot.id]: { ...recipeData } }
          diseasesData[diseaseData.diseaseName] = { ...diseaseData, recipes }
          this.setState({
            diseasesData
          })
          // console.log(diseasesData)
        })
        // console.log(recipeName)
      })

    })

    if (this.state.loading) {
      setTimeout(() => this.setState({ loading: false }), 1000)
    }
  }

  handleHideDiseaseModal = () => {
    this.setState({
      diseaseModal: false
    })
  }

  handleHideHerbalModal = () => {
    this.setState({
      herbalModal: false
    })
  }

  handleHideRecipeModal = () => {
    this.setState({
      recipeModal: false
    })
  }

  // handleModifyDataModalSubmit = () => {
  //   //Do validate
  //   this.setState({
  //     modifyDataModalShow: false
  //   })
  // }

  handleAddDisease = () => {
    // console.log("handleAddDisease")
    this.setState({
      diseaseModal: true
    })
  }

  handleAddHerbal = () => {
    // console.log("handleAddHerbal")
    this.setState({
      herbalModal: true
    })
  }

  handleAddRecipe = () => {
    // console.log("handleAddHerbal")
    this.setState({
      recipeModal: true
    })
  }

  handleEdit = (e) => {
    console.log("handleEdit", e.target.getAttribute("data-uid"))
  }

  handleDelete = (e) => {
    console.log("handleDelete", e.target.getAttribute("data-uid"))
  }

  // handleHide = (e) => {
  //   console.log("handleHide", e.target.getAttribute("data-uid"))
  // }

  handleAddRecipeOrDisease = () => {
    if (this.state.showBy === "สมุนไพร") {
      return this.handleAddDisease()
    }
    // console.log("handleAddRecipe")
  }

  handleShowBySelect = (eventKey) => {
    const { showBy } = this.state
    if (showBy !== showItems[eventKey].name) {
      this.setState({
        showBy: showItems[eventKey].name,
        linkPrefix: showItems[eventKey].ref,
        data: showItems[eventKey].name === "โรค" ? dataList : herbList
      })
      images_path = showItems[eventKey].name === "โรค" ? storageConfig.disease_images_path : storageConfig.herbal_images_path
    }
    // console.log(eventKey)
  }

  render() {

    const { loading, diseaseModal, herbalModal, recipeModal, showBy, linkPrefix, data, diseasesData } = this.state
    // for (const [key, value] of Object.entries(diseasesData)) {
    //   console.log(value)
    // }
    Object.entries(diseasesData).map(([k, v], i) => {
      console.log(v)
    })
    return (
      <Container>
        {this.props.authUser ? <Row className="justify-content-md-center mb-3">
          <Col xs lg={3}>
            <Button variant="outline-primary" block onClick={this.handleAddDisease}>จัดการข้อมูลโรค</Button>
          </Col>
          <Col xs lg={3}>
            <Button variant="outline-primary" block onClick={this.handleAddHerbal}>จัดการข้อมูลสมุนไพร</Button>
          </Col>
          <Col xs lg={3}>
            <Button variant="outline-primary" block onClick={this.handleAddRecipe}>จัดการข้อมูลตำรับ</Button>
          </Col>
        </Row> : null}
        <div className="filter-item">
          <Row>
            <Col className="" style={{ display: "flex" }}>
              <div className="mr-2" style={{ alignSelf: "center" }}>แสดงตาม</div>
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary">
                  {showBy}
                </Dropdown.Toggle>
                <Dropdown.Menu id="dropdown-item-button" title="แสดงตาม">
                  {showItems.map((item, i) => {
                    if (item.name === showBy) {
                      return <Dropdown.Item key={`showBy-${i}`} eventKey={i} active onSelect={this.handleShowBySelect}>{item.name}</Dropdown.Item>
                    }
                    return <Dropdown.Item key={`showBy-${i}`} eventKey={i} onSelect={this.handleShowBySelect}>{item.name}</Dropdown.Item>
                  })}
                </Dropdown.Menu>
              </Dropdown>
            </Col>
            <Col></Col>
            <Col></Col>
          </Row>
        </div>

        <Row>
          <Col>
            <div className="main-list">
              {loading ? <Spinner animation="grow" role="status" variant="success">
                <span className="sr-only">Loading...</span>
              </Spinner> :
                <ul className="list-unstyled">
                  {/* {data.map((item, i) => { */}
                  {Object.entries(diseasesData).map(([k, item], i) => {
                    // const item = 
                    if (item.showPublic || (this.props.authUser !== null)) {
                      return <MediaItem
                        key={`media-${i}`}
                        uid={`media-${i}`}
                        prefix={linkPrefix}
                        title={item.diseaseName || item.herbalName}
                        content={item.description}
                        data={item.recipes}
                        path={k}
                        image={getDownloadUrl(images_path, item.image)}
                        showTool={(this.props.authUser !== null)}
                        hidden={!item.showPublic}
                        onAddRecipeOrDiseaseClick={this.handleAddRecipeOrDisease}
                        onEditClick={this.handleEdit}
                        onDeleteClick={this.handleDelete}
                      // onHideClick={this.handleHide}
                      />
                    }
                    return null;
                  })}
                </ul>
              }
            </div>
          </Col>
        </Row>
        <DiseaseModal
          show={diseaseModal}
          onHide={this.handleHideDiseaseModal}
        // onSubmit={this.handleModifyDataModalSubmit}
        // showsubmit="true"
        // submittext={modifyDataModalSubmitText}
        // title={modifyDataModalTitle}
        />
        <HerbalModal
          show={herbalModal}
          onHide={this.handleHideHerbalModal}
        />
        <RecipeModal
          show={recipeModal}
          onHide={this.handleHideRecipeModal}
        />
      </Container>
    )
  }
}

const mapStateToProps = state => ({
  show: state.login.show,
  authUser: state.login.authUser
});

const mapDispatchToProps = dispatch => ({
  showLogin: () =>
    dispatch({ type: 'SHOW_LOGIN' }),
  hideLogin: () =>
    dispatch({ type: 'HIDE_LOGIN' }),
});

export default compose(
  withFirebase,
  withFirestore,
  connect(mapStateToProps, mapDispatchToProps),
)(MainList)
