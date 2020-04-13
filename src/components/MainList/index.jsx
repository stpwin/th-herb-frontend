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
  { name: "สมุนไพร", ref: "รักษาโรค" }
]

// let images_path = storageConfig.disease_images_path
export class MainList extends Component {
  state = {
    diseaseModal: false,
    herbalModal: false,
    recipeModal: false,
    showBy: "โรค",
    // linkPrefix: "ตำหรับ",
    // true,
    // listData: {}
  }

  /**@param {firebase.firestore.QuerySnapshot} recipesSnap */
  processHerbals = (recipesSnap) => {
    this.props.doFetch()
    // console.log("processData")
    let listData = {}
    this.setState({ listData })
    if (recipesSnap.empty) return
    const recipesFetch = []
    const herbalsFetch = []
    recipesSnap.forEach((recipeSnap) => {
      if (recipeSnap.exists) {
        const recipeData = recipeSnap.data()
        /**@type {firebase.firestore.DocumentReference[]} */
        const herbalRefs = recipeData.herbalRefs
        /**@type {firebase.firestore.DocumentReference} */
        const diseaseRef = recipeData.diseaseRef

        const herbalsDocsFetch = herbalRefs.map(herbalRef => herbalRef.get())
        const b = diseaseRef.get().then((diseaseDoc) => {
          if (diseaseDoc.exists) {
            const { diseaseName } = diseaseDoc.data()

            const a = Promise.all(herbalsDocsFetch).then(herbalDocs => {
              herbalDocs.forEach((herbalDoc) => {
                const herbalData = herbalDoc.data()
                const recipes = { ...(listData[herbalData.herbalName] && listData[herbalData.herbalName].recipes), [recipeSnap.id]: { ...recipeData, diseaseName } }
                listData[herbalData.herbalName] = { ...herbalData, recipes }
              })
            })
            // console.log("each")
            herbalsFetch.push(a)
          }
        })
        recipesFetch.push(b)
      }
    })
    Promise.all([...herbalsFetch, ...recipesFetch]).then(() => {
      this.props.doneFetch(listData)
    })
  }

  /**@param {firebase.firestore.QuerySnapshot} recipesSnap */
  processDiseases = (recipesSnap) => {
    this.props.doFetch()
    let listData = {}
    this.setState({ listData })
    if (recipesSnap.empty) return
    const fetchList = []
    recipesSnap.forEach((recipeSnap) => {
      if (recipeSnap.exists) {
        const recipeData = recipeSnap.data()
        /**@type {firebase.firestore.DocumentReference} */
        const diseaseRef = recipeData.diseaseRef
        const a = diseaseRef.get().then((diseaseDoc) => {
          if (diseaseDoc.exists) {
            const diseaseData = diseaseDoc.data()
            if (!diseaseData.showPublic) return
            const recipes = { ...(listData[diseaseData.diseaseName] && listData[diseaseData.diseaseName].recipes), [recipeSnap.id]: { ...recipeData } }
            listData[diseaseData.diseaseName] = { ...diseaseData, recipes }
          }
        })
        // console.log("each")
        fetchList.push(a)
      }
    })
    Promise.all(fetchList).then(() => {
      this.props.doneFetch(listData)
    })
  }

  processData = data => {
    const { showBy } = this.state

    if (!data) {
      /**@type {firebase.firestore.Firestore} */
      const firestore = this.props.firestore
      return firestore.collection('recipes').where('showPublic', '==', true).get().then(data => {
        if (showBy === "โรค") {
          return this.processDiseases(data)
        }
        this.processHerbals(data)
      })
    }

    if (showBy === "โรค") {
      return this.processDiseases(data)
    }
    this.processHerbals(data)
  }

  componentDidMount() {
    const key = localStorage.getItem("showBy")
    if (key) {
      this.setState({
        showBy: showItems[key].name,
      })
      // images_path = showItems[key].name === "โรค" ? storageConfig.disease_images_path : storageConfig.herbal_images_path
    }


    /**@type {firebase.auth.Auth} */
    const auth = this.props.firebase.auth()

    /**@type {firebase.firestore.Firestore} */
    const firestore = this.props.firestore

    const recipesRef = firestore.collection('recipes').where('showPublic', '==', true)
    let unsub
    auth.onAuthStateChanged(authUser => {
      if (!unsub) {
        unsub = recipesRef.onSnapshot(recipesSnap => {
          this.processData(recipesSnap)
        }, (error) => {

        })
      }
    })

    if (!unsub) {
      unsub = recipesRef.onSnapshot(recipesSnap => {
        this.processData(recipesSnap)
      }, (error) => {

      })
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


  handleAddDisease = () => {
    this.setState({
      diseaseModal: true
    })
  }

  handleAddHerbal = () => {
    this.setState({
      herbalModal: true
    })
  }

  handleAddRecipe = () => {
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

  handleAddRecipeOrDisease = () => {
    if (this.state.showBy === "สมุนไพร") {
      return this.handleAddDisease()
    }
  }

  handleShowBySelect = (eventKey) => {
    const { showBy } = this.state
    if (showBy !== showItems[eventKey].name) {
      // images_path = showItems[eventKey].name === "โรค" ? storageConfig.disease_images_path : storageConfig.herbal_images_path
      this.setState({
        showBy: showItems[eventKey].name,
      }, () => {
        localStorage.setItem("showBy", eventKey)
        this.processData()
      })
    }
  }

  render() {
    const { diseaseModal, herbalModal, recipeModal, showBy } = this.state
    const result = this.props.status === "searchdone" ? this.props.searchResult : this.props.result
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

        {this.props.searchResult || this.props.status === "searching" ? null : <div className="filter-item">
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
        </div>}

        <Row>
          <Col>
            <div className="main-list">
              {!(this.props.status === "done" || this.props.status === "searchdone") ? <Spinner animation="grow" role="status" variant="success">
                <span className="sr-only">Loading...</span>
              </Spinner> :
                <ul className="list-unstyled">

                  {Object.entries(result).length > 0 ? Object.entries(result).map(([k, item], i) => {
                    const images_path = item.diseaseName ? storageConfig.disease_images_path : storageConfig.herbal_images_path
                    return <MediaItem
                      key={`media-${i}`}
                      uid={`media-${i}`}
                      prefix={item.diseaseName ? "ตำรับ" : "รักษา"}
                      title={item.diseaseName || item.herbalName}
                      content={item.description}
                      data={item.recipes}
                      path={k}
                      image={item.image ? getDownloadUrl(images_path, item.image) : `holder.js/255x255?text=ไม่มีภาพ`}
                      hidden={!item.showPublic}
                    />
                  }) : <div className="text-center">ไม่พบอะไรเลยจ้ะ</div>}
                </ul>
              }
            </div>
          </Col>
        </Row>
        <DiseaseModal
          show={diseaseModal}
          onHide={this.handleHideDiseaseModal}
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
  result: state.data.result,
  searchResult: state.data.searchResult,
  status: state.data.status,
  authUser: state.login.authUser
});

const mapDispatchToProps = dispatch => ({
  showLogin: () =>
    dispatch({ type: 'SHOW_LOGIN' }),
  doFetch: () =>
    dispatch({ type: 'DO_FETCH' }),
  doneFetch: (result) =>
    dispatch({ type: 'DONE_FETCH', result }),
});

export default compose(
  withFirebase,
  withFirestore,
  connect(mapStateToProps, mapDispatchToProps),
)(MainList)
