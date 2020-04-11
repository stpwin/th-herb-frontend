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
    // data: dataList,
    diseasesData: {}
  }

  /**@param {firebase.firestore.QuerySnapshot} recipesSnap */
  fetchData = (recipesSnap) => {
    let diseasesData = {}
    this.setState({ diseasesData })
    if (recipesSnap) {
      // console.log("recipesSnap", recipesSnap.empty)
      if (recipesSnap.empty) return
      recipesSnap.forEach(recipeSnap => {
        if (recipeSnap.exists) {
          const recipeData = recipeSnap.data()
          /**@type {firebase.firestore.DocumentReference} */
          const diseaseRef = recipeData.diseaseRef
          //getting diseaseRef
          diseaseRef.get().then(diseaseDoc => {
            if (diseaseDoc.exists) {
              const diseaseData = diseaseDoc.data()
              if (!diseaseData.showPublic) return
              // console.log(diseaseData)
              const recipes = { ...(diseasesData[diseaseData.diseaseName] && diseasesData[diseaseData.diseaseName].recipes), [recipeSnap.id]: { ...recipeData } }
              diseasesData[diseaseData.diseaseName] = { ...diseaseData, recipes }
              this.setState({
                diseasesData,
                loading: false
              })
            }
          }).catch(err => {
            // console.warn(err)
          })
        }
      })
      return
    }

    /**@type {firebase.firestore.Firestore} */
    const firestore = this.props.firestore

    // console.log("recipesSnap")
    firestore.collection('recipes').orderBy('createdAt').where('showPublic', '==', true).get().then(recipesSnap => {
      if (recipesSnap.empty) return
      recipesSnap.forEach(recipeSnap => {
        if (recipeSnap.exists) {
          const recipeData = recipeSnap.data()
          /**@type {firebase.firestore.DocumentReference} */
          const diseaseRef = recipeData.diseaseRef
          //getting diseaseRef
          diseaseRef.get().then(diseaseDoc => {
            if (diseaseDoc.exists) {
              const diseaseData = diseaseDoc.data()
              if (!diseaseData.showPublic) return
              // console.log(diseaseData)
              const recipes = { ...(diseasesData[diseaseData.diseaseName] && diseasesData[diseaseData.diseaseName].recipes), [recipeSnap.id]: { ...recipeData } }
              diseasesData[diseaseData.diseaseName] = { ...diseaseData, recipes }
              this.setState({
                diseasesData,
                loading: false
              })
            }

          }).catch(err => {
            // console.warn(err)
          })
        }
      })
    }).catch(err => {
      // console.warn(err)
    })
  }

  componentDidMount() {
    /**@type {firebase.auth.Auth} */
    const auth = this.props.firebase.auth()

    /**@type {firebase.firestore.Firestore} */
    const firestore = this.props.firestore

    const recipesRef = firestore.collection('recipes').where('showPublic', '==', true)
    const herbalsRef = firestore.collection('herbals').where('showPublic', '==', true)
    const diseasesRef = firestore.collection('diseases').where('showPublic', '==', true)

    auth.onAuthStateChanged(authUser => {

      recipesRef.onSnapshot(recipesSnap => {
        this.fetchData(recipesSnap)
      }, (error) => {

      })

      herbalsRef.onSnapshot(s => {
        this.fetchData()
      }, (error) => {

      })

      diseasesRef.onSnapshot(s => {
        this.fetchData()
      }, (error) => {

      })
    })

    recipesRef.onSnapshot(recipesSnap => {
      this.fetchData(recipesSnap)
    }, (error) => {

    })


    herbalsRef.onSnapshot(s => {
      this.fetchData()
    }, (error) => {

    })

    diseasesRef.onSnapshot(s => {
      this.fetchData()
    }, (error) => {

    })
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
        // data: showItems[eventKey].name === "โรค" ? dataList : herbList
      })
      images_path = showItems[eventKey].name === "โรค" ? storageConfig.disease_images_path : storageConfig.herbal_images_path
    }
    // console.log(eventKey)
  }

  render() {

    const { loading, diseaseModal, herbalModal, recipeModal, showBy, linkPrefix, diseasesData } = this.state
    // for (const [key, value] of Object.entries(diseasesData)) {
    //   console.log(value)
    // }
    // Object.entries(diseasesData).map(([k, v], i) => {
    //   // console.log(v)
    // })
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
                    // if (item.showPublic || (this.props.authUser !== null)) {
                    return <MediaItem
                      key={`media-${i}`}
                      uid={`media-${i}`}
                      prefix={linkPrefix}
                      title={item.diseaseName || item.herbalName}
                      content={item.description}
                      data={item.recipes}
                      path={k}
                      image={item.image ? getDownloadUrl(images_path, item.image) : "holder.js/255x255"}
                      // showTool={(this.props.authUser !== null)}
                      hidden={!item.showPublic}
                      onAddRecipeOrDiseaseClick={this.handleAddRecipeOrDisease}
                      onEditClick={this.handleEdit}
                      onDeleteClick={this.handleDelete}
                    // onHideClick={this.handleHide}
                    />
                    // }
                    // return null;
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
