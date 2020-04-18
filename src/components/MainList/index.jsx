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

let recipesListener = null
export class MainList extends Component {
  state = {
    diseaseModal: false,
    herbalModal: false,
    recipeModal: false,
    showBy: "โรค",
    /**@type {firebase.firestore.QueryDocumentSnapshot[]} */
    recipes: [],
    diseases: {}
  }

  processHerbals = () => {
    // if (Object.keys(this.state.diseases).length === 0) return
    this.props.doFetch()
    console.log("processHerbals")
    let listData = {}
    const firestore = this.props.firestore
    // const batch = firestore.batch()

    // const recipesFetch = []
    // const herbalsFetch = []
    this.state.recipes.forEach(recipeSnap => {
      if (recipeSnap.exists) {
        const recipeData = recipeSnap.data()

        recipeData.herbals && recipeData.herbals.forEach(herbal => {
          const recipes = { ...(listData[herbal.herbalName] && listData[herbal.herbalName].recipes), [recipeSnap.id]: { ...recipeData } }
          listData[herbal.herbalName] = { ...herbal, recipes }
        })




        // /**@type {firebase.firestore.DocumentReference[]} */
        // const herbalRefs = recipeData.herbalRefs


        // if (herbalRefs) {
        //   const herbalsDocsFetch = herbalRefs.map(herbalRef => herbalRef.get())
        //   const a = Promise.all(herbalsDocsFetch).then(herbalDocs => {

        //     const herbals = herbalDocs && herbalDocs.map(doc => {
        //       const { herbalName, image, description } = doc.data()
        //       return { herbalName, image, description, ref: doc.ref }
        //     })
        //     console.log("tranform herbals:", herbals)
        //     batch.update(recipeSnap.ref, { herbals, showPublic: true })


        //   })
        //   herbalsFetch.push(a)
        // }


      }
    })
    this.setState({
      diseases: listData
    })
    this.props.doneFetch(listData)



    // // /** @type {firebase.firestore.Firestore} */
    // // const firestore = this.props.firestore
    // const batch = firestore.batch()
    // const herbalsRecipeCol = firestore.collection("herbalsRecipe")
    // Object.entries(listData).forEach(([k, v]) => {
    //   // console.log(item)
    //   const herbalsRecipeRef = herbalsRecipeCol.doc()
    //   batch.set(herbalsRecipeRef, { herbalName: k, ...v }, { merge: true })
    // })
    // batch.commit()
  }

  processDiseases = () => {
    this.props.doFetch()
    let listData = {}
    /**@type {firebase.firestore.Firestore} */
    const firestore = this.props.firestore
    // const batch = firestore.batch()
    // const fetchList = []
    // const fetchList1 = []
    this.state.recipes.forEach((recipeSnap) => {
      if (recipeSnap.exists) {
        const recipeData = recipeSnap.data()
        const diseaseData = { diseaseName: recipeData.diseaseName, image: recipeData.diseaseImage, description: recipeData.diseaseDescription }
        const recipes = { ...(listData[recipeData.diseaseName] && listData[recipeData.diseaseName].recipes), [recipeSnap.id]: { ...recipeData, recipeRef: recipeSnap.ref } }
        listData[recipeData.diseaseName] = { ...diseaseData, diseaseRef: recipeData.diseaseRef, recipes }

        // /**@type {firebase.firestore.DocumentReference} */
        // const b = firestore.collection('diseases').where('diseaseName', '==', recipeData.diseaseName).get().then((result) => {
        //   if (!result.empty) {

        //     // const a = result.docs[0].get().then((diseaseDoc) => {
        //     //   if (diseaseDoc.exists) {
        //     //     // const diseaseData = diseaseDoc.data()
        //     //     // if (!diseaseData.showPublic) return
        //     //     // const recipes = { ...(listData[diseaseData.diseaseName] && listData[diseaseData.diseaseName].recipes), [recipeSnap.id]: { ...recipeData } }
        //     //     // listData[diseaseData.diseaseName] = { ...diseaseData, recipes }
        //     //     batch.update(recipeSnap.ref, { diseaseRef: result.docs[0].ref, showPublic: true })
        //     //   }
        //     // })
        //     // fetchList.push(a)
        //   }
        // })

        // const b = 
        // fetchList1.push(b)
        // console.log("each")

      }
    })
    // Object.entries(listData).forEach(([k, v]) => {
    //   console.log(v)
    //   const recipes = Object.entries(v.recipes).map(([k, v]) => {

    //     return { recipeName: v.recipeName || "", recipeRef: v.recipeRef }
    //   })
    //   // console.log(recipes)
    //   batch.update(v.diseaseRef, { recipes })
    // })

    // Promise.all(fetchList1).then(() => {
    // Promise.all(fetchList).then(() => {
    // batch.commit()
    // })
    // })
    this.setState({
      diseases: listData
    })
    // /** @type {firebase.firestore.Firestore} */
    // const firestore = this.props.firestore
    // const batch = firestore.batch()
    // const diseasesRecipeCol = firestore.collection("diseasesRecipe")
    // Object.entries(listData).forEach(([k, v]) => {
    //   // console.log(item)
    //   const diseasesRecipeRef = diseasesRecipeCol.doc()
    //   batch.set(diseasesRecipeRef, { diseaseName: k, ...v }, { merge: true })
    // })

    this.props.doneFetch(listData)
  }

  processData = () => {
    const { showBy, recipes } = this.state
    console.log("processData recipes length:", recipes.length)
    if (showBy === "โรค") {
      return this.processDiseases()
    }
    this.processHerbals()
  }

  startListen = () => {
    /**@type {firebase.firestore.Firestore} */
    const firestore = this.props.firestore
    const recipesRef = firestore.collection('recipes')//.where('showPublic', '==', true).limit(50)
    if (!recipesListener) {
      console.log("Start listening")
      recipesListener = recipesRef.onSnapshot(recipesSnap => {
        console.log("onSnapshot")
        this.setState({
          recipes: recipesSnap.docs
        }, this.processData)
      }, (error) => {
        console.warn(error)
      })
    }
  }

  componentDidMount() {
    console.log("componentDidMount")
    const key = localStorage.getItem("showBy")
    if (key) {
      this.setState({
        showBy: showItems[key].name,
      })
    }

    /**@type {firebase.auth.Auth} */
    const auth = this.props.firebase.auth()

    auth.onAuthStateChanged(user => {
      if (user) {
        this.startListen()
      }

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

  handleShowBySelect = (eventKey) => {
    const { showBy } = this.state
    if (showBy !== showItems[eventKey].name) {
      this.setState({
        showBy: showItems[eventKey].name,
      }, () => {
        localStorage.setItem("showBy", eventKey)
        this.processData()
      })
    }
  }

  handleImageClick = e => {
    // const path = e.target.dataset.path
    // const data = this.state.listData[path]
    // // console.log()
    // this.props.showFullView(path, data)
  }

  /**@param {firebase.firestore.DocumentReference[]} herbals */
  fetchHerbals = (herbals) => {
    this.props.fullViewHerbalsFetch()
    // console
    const herbalsFetch = herbals.map(herbal => herbal.ref.get())

    Promise.all(herbalsFetch).then(result => {
      const herbals = result.map(item => {
        // console.log(item)
        const { herbalName, image } = item.data()
        return {
          herbalName,
          image: image && getDownloadUrl(storageConfig.herbal_images_path, image)
        }
      })
      this.props.fullViewHerbals(herbals)
    })
  }

  handleSubClick = e => {
    const parent = e.target.dataset.parent
    const uid = e.target.dataset.uid
    const data = this.state.diseases[parent].recipes[uid]
    const name = e.target.dataset.name
    const description1 = this.state.diseases[parent].description
    if (!data) return
    // console.log(e.target.dataset.parent)
    // console.log(this.state.listData[parent])
    this.fetchHerbals(data.herbals)
    console.log(data)
    this.props.showFullView(`${parent} ${name}`, { ...data, description1 })
  }

  render() {
    // console.log(this.state.diseases)
    const { diseaseModal, herbalModal, recipeModal, showBy } = this.state
    const result = this.props.status === "searchdone" ? this.props.searchResult : this.state.diseases
    return (
      <Container fluid>
        {this.props.authUser ? <Row className="justify-content-md-center mb-3">

          <Col xs lg={3}>
            <Button variant="outline-primary" className="manage-button mb-1" block onClick={this.handleAddDisease}>จัดการโรค</Button>
          </Col>
          <Col xs lg={3}>
            <Button variant="outline-primary" className="manage-button mb-1" block onClick={this.handleAddHerbal}>จัดการสมุนไพร</Button>
          </Col>
          <Col xs lg={3}>
            <Button variant="outline-primary" className="manage-button mb-1" block onClick={this.handleAddRecipe}>จัดการตำรับ</Button>
          </Col>
        </Row> : null}

        {this.props.searchResult || this.props.status === "searching" ? null : <div className="filter-item">
          <Row>
            <Col className="mb-3" style={{ display: "flex" }} sm={5}>
              <div className="mr-2" style={{ alignSelf: "center" }}>แสดงตาม</div>
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary" size="sm">
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
            {/* <Col></Col> */}
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
                    const images_path = (showBy === "โรค") ? storageConfig.disease_images_path : storageConfig.herbal_images_path
                    return <MediaItem
                      showBy={showBy}
                      key={`media-${i}`}
                      uid={`media-${i}`}
                      prefix={showBy === "โรค" ? "ตำรับ" : "รักษา"}
                      title={showBy === "โรค" ? (item.diseaseName && "โรค" + item.diseaseName) : item.herbalName}
                      content={item.description}
                      data={item.recipes}
                      path={k}
                      image={item.image ? getDownloadUrl(images_path, item.image) : `holder.js/400x400?text=ไม่มีภาพ`}
                      // hidden={!item.showPublic}
                      onImageClick={this.handleImageClick}
                      onSubClick={this.handleSubClick}
                    />
                  }) : <div className="text-center my-3">ไม่พบอะไรเลยจ้ะ</div>}
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
  showFullView: (title, body) =>
    dispatch({ type: 'SHOW_FULLVIEW', title, body }),
  fullViewHerbals: (herbals) =>
    dispatch({ type: 'FULLVIEW_HERBAL', herbals }),
  fullViewHerbalsFetch: () =>
    dispatch({ type: 'FULLVIEW_HERBAL_FETCH' }),
});

export default compose(
  withFirebase,
  withFirestore,
  connect(mapStateToProps, mapDispatchToProps),
)(MainList)
