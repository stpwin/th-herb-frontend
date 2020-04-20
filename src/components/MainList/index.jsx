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

// let recipesListener = null
// let diseaseListener = null
export class MainList extends Component {
  state = {
    diseaseModal: false,
    herbalModal: false,
    recipeModal: false,
    showBy: "โรค",
    /**@type {firebase.firestore.QueryDocumentSnapshot[]} */
    recipes: [],
    diseases: {},
    /**@type {firebase.firestore.QueryDocumentSnapshot[]} */
    diseaseList: [],
    herbalList: [],
    limit: 1,
    lastSnapshot: null
  }

  // processHerbals = () => {
  //   // if (Object.keys(this.state.diseases).length === 0) return
  //   this.props.doFetch()
  //   console.log("processHerbals")
  //   let listData = {}
  //   const firestore = this.props.firestore
  //   // const batch = firestore.batch()

  //   // const recipesFetch = []
  //   // const herbalsFetch = []
  //   this.state.recipes.forEach(recipeSnap => {
  //     if (recipeSnap.exists) {
  //       const recipeData = recipeSnap.data()

  //       recipeData.herbals && recipeData.herbals.forEach(herbal => {
  //         const recipes = { ...(listData[herbal.herbalName] && listData[herbal.herbalName].recipes), [recipeSnap.id]: { ...recipeData } }
  //         listData[herbal.herbalName] = { ...herbal, recipes }
  //       })

  //       // /**@type {firebase.firestore.DocumentReference[]} */
  //       // const herbalRefs = recipeData.herbalRefs


  //       // if (herbalRefs) {
  //       //   const herbalsDocsFetch = herbalRefs.map(herbalRef => herbalRef.get())
  //       //   const a = Promise.all(herbalsDocsFetch).then(herbalDocs => {

  //       //     const herbals = herbalDocs && herbalDocs.map(doc => {
  //       //       const { herbalName, image, description } = doc.data()
  //       //       return { herbalName, image, description, ref: doc.ref }
  //       //     })
  //       //     console.log("tranform herbals:", herbals)
  //       //     batch.update(recipeSnap.ref, { herbals, showPublic: true })


  //       //   })
  //       //   herbalsFetch.push(a)
  //       // }

  //     }
  //   })
  //   this.setState({
  //     diseases: listData
  //   })
  //   this.props.doneFetch(listData)



  //   // // /** @type {firebase.firestore.Firestore} */
  //   // // const firestore = this.props.firestore
  //   // const batch = firestore.batch()
  //   // const herbalsRecipeCol = firestore.collection("herbalsRecipe")
  //   // Object.entries(listData).forEach(([k, v]) => {
  //   //   // console.log(item)
  //   //   const herbalsRecipeRef = herbalsRecipeCol.doc()
  //   //   batch.set(herbalsRecipeRef, { herbalName: k, ...v }, { merge: true })
  //   // })
  //   // batch.commit()
  // }

  // processDiseases = () => {
  //   this.props.doFetch()
  //   let listData = {}
  //   /**@type {firebase.firestore.Firestore} */
  //   const firestore = this.props.firestore
  //   // const batch = firestore.batch()
  //   // const fetchList = []
  //   // const fetchList1 = []
  //   this.state.recipes.forEach((recipeSnap) => {
  //     if (recipeSnap.exists) {
  //       const recipeData = recipeSnap.data()
  //       const diseaseData = { diseaseName: recipeData.diseaseName, image: recipeData.diseaseImage, description: recipeData.diseaseDescription }
  //       const recipes = { ...(listData[recipeData.diseaseName] && listData[recipeData.diseaseName].recipes), [recipeSnap.id]: { ...recipeData, recipeRef: recipeSnap.ref } }
  //       listData[recipeData.diseaseName] = { ...diseaseData, diseaseRef: recipeData.diseaseRef, recipes }

  //       // /**@type {firebase.firestore.DocumentReference} */
  //       // const b = firestore.collection('diseases').where('diseaseName', '==', recipeData.diseaseName).get().then((result) => {
  //       //   if (!result.empty) {

  //       //     // const a = result.docs[0].get().then((diseaseDoc) => {
  //       //     //   if (diseaseDoc.exists) {
  //       //     //     // const diseaseData = diseaseDoc.data()
  //       //     //     // if (!diseaseData.showPublic) return
  //       //     //     // const recipes = { ...(listData[diseaseData.diseaseName] && listData[diseaseData.diseaseName].recipes), [recipeSnap.id]: { ...recipeData } }
  //       //     //     // listData[diseaseData.diseaseName] = { ...diseaseData, recipes }
  //       //     //     batch.update(recipeSnap.ref, { diseaseRef: result.docs[0].ref, showPublic: true })
  //       //     //   }
  //       //     // })
  //       //     // fetchList.push(a)
  //       //   }
  //       // })

  //       // const b = 
  //       // fetchList1.push(b)
  //       // console.log("each")

  //     }
  //   })
  //   // Object.entries(listData).forEach(([k, v]) => {
  //   //   console.log(v)
  //   //   const recipes = Object.entries(v.recipes).map(([k, v]) => {

  //   //     return { recipeName: v.recipeName || "", recipeRef: v.recipeRef }
  //   //   })
  //   //   // console.log(recipes)
  //   //   batch.update(v.diseaseRef, { recipes })
  //   // })

  //   // Promise.all(fetchList1).then(() => {
  //   // Promise.all(fetchList).then(() => {
  //   // batch.commit()
  //   // })
  //   // })
  //   this.setState({
  //     diseases: listData
  //   })
  //   // /** @type {firebase.firestore.Firestore} */
  //   // const firestore = this.props.firestore
  //   const batch = firestore.batch()
  //   const diseases = firestore.collection("diseases")
  //   Object.entries(listData).forEach(([k, v]) => {
  //     /**@type {firebase.firestore.DocumentReference} */
  //     const diseaseRef = v.diseaseRef

  //     // console.log(diseaseRef)
  //     // diseaseRef.get().then(doc => {
  //     //   let recipes = doc.data().recipes
  //     // })
  //     // const diseasesRecipeRef = diseases.doc()
  //     // batch.set(diseaseRef, { diseaseName: k, ...v }, { merge: true })
  //   })
  //   // batch.commit()

  //   this.props.doneFetch(listData)
  // }

  // processDiseases1 = () => {
  //   console.log(this.state.diseaseList)
  //   this.props.doneFetch({})
  // }

  processData = () => {
    // const { showBy } = this.state
    this.props.doneFetch({})
  }

  fetchAnother = () => {
    console.log("on fetch another")
    /**@type {firebase.firestore.Firestore} */
    const firestore = this.props.firestore

    if (this.state.showBy === "โรค") {
      const diseaseRef = firestore.collection('diseases').where('showPublic', '==', true).orderBy('diseaseName').startAfter(this.state.lastSnapshot).limit(this.state.limit)
      return diseaseRef.get().then(diseaseSnap => {
        this.setState({
          herbalList: [],
          diseaseList: [...this.state.diseaseList, ...diseaseSnap.docs],
          lastSnapshot: diseaseSnap.docs.length > 0 && diseaseSnap.docs[diseaseSnap.docs.length - 1]
        }, this.processData)
      }, (error) => {
        console.warn(error)
      })
    }

    const herbalsRef = firestore.collection('herbals').where('showPublic', '==', true).orderBy('herbalName').startAfter(this.state.lastSnapshot).limit(this.state.limit)
    herbalsRef.get().then(herbalSnap => {
      this.setState({
        diseaseList: [],
        herbalList: [...this.state.herbalList, ...herbalSnap.docs],
        lastSnapshot: herbalSnap.docs.length > 0 && herbalSnap.docs[herbalSnap.docs.length - 1]
      }, this.processData)
    }, (error) => {
      console.warn(error)
    })
  }

  startFetch = () => {
    console.log("startFetch")
    /**@type {firebase.firestore.Firestore} */
    const firestore = this.props.firestore
    if (this.state.showBy === "โรค") {
      const diseaseRef = firestore.collection('diseases').where('showPublic', '==', true).orderBy('diseaseName').limit(this.state.limit)
      return diseaseRef.get().then(diseaseSnap => {
        this.setState({
          herbalList: [],
          diseaseList: diseaseSnap.docs,
          lastSnapshot: diseaseSnap.docs.length > 0 && diseaseSnap.docs[diseaseSnap.docs.length - 1]
        }, this.processData)
      }, (error) => {
        console.warn(error)
      })
    }

    const herbalsRef = firestore.collection('herbals').where('showPublic', '==', true).orderBy('herbalName').limit(this.state.limit)
    herbalsRef.get().then(herbalSnap => {
      this.setState({
        diseaseList: [],
        herbalList: herbalSnap.docs,
        lastSnapshot: herbalSnap.docs.length > 0 && herbalSnap.docs[herbalSnap.docs.length - 1]
      }, this.processData)
    }, (error) => {
      console.warn(error)
    })
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
      // if (user) {
      // }
      this.startFetch()
      // console.log(this.props)
    })
  }

  handleShowBySelect = (eventKey) => {
    const { showBy } = this.state
    if (showBy !== showItems[eventKey].name) {
      this.setState({
        showBy: showItems[eventKey].name,
      }, () => {
        localStorage.setItem("showBy", eventKey)
        this.startFetch()
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

  /**@param {firebase.firestore.DocumentReference} ref */
  fetchRecipe = (ref) => {
    this.props.fullViewRecipeFetch()
    ref.get().then(doc => {
      const { description, herbals } = doc.data()
      this.fetchHerbals(herbals)
      this.props.fullViewRecipe(description)
    })
  }

  /**@param {firebase.firestore.DocumentSnapshot} parentref
   * @param {firebase.firestore.DocumentReference} ref
   */
  handleSubClick = (title, name, parentRef, ref, index) => {

    const parentData = parentRef.data()
    const diseaseDescription = parentData.description

    this.fetchRecipe(ref)

    const body = { diseaseDescription }
    this.props.showFullView(`${title} ${name}`, body)
  }

  handleHerbalSubClick = (title, parentRef) => {
    console.log("Herbal sub click", title)
    // const parentData = parentRef.data()
    // const diseaseDescription = parentData.description

    // this.fetchRecipe(ref)

    // const body = { diseaseDescription }
    // this.props.showFullView(`${title} ${name}`, body)
  }

  render() {
    // console.log(this.state.diseases)
    const { diseaseModal, herbalModal, recipeModal, showBy, diseaseList, herbalList } = this.state

    const isSearching = this.props.status === "searching"
    const isSearchDone = this.props.status === "searchdone"

    const isFetching = this.props.status === "fetching"
    const isFetchDone = this.props.status === "done"

    // const result = this.props.status === "searchdone" ? this.props.searchResult : this.state.diseases
    return (
      <Container fluid>
        {this.props.authUser ?
          <>
            <Row className="justify-content-md-center mb-3">
              <Col xs lg={3}>
                <Button variant="outline-primary" className="manage-button mb-1" block onClick={this.handleAddDisease}>จัดการโรค</Button>
              </Col>
              <Col xs lg={3}>
                <Button variant="outline-primary" className="manage-button mb-1" block onClick={this.handleAddHerbal}>จัดการสมุนไพร</Button>
              </Col>
              <Col xs lg={3}>
                <Button variant="outline-primary" className="manage-button mb-1" block onClick={this.handleAddRecipe}>จัดการตำรับ</Button>
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
          </> : null}

        {/* Hide showBy when in search mode */}
        {isSearching || isSearchDone ? null :
          <div className="filter-item">
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
            </Row>
          </div>}

        <Row>
          <Col>
            <div className="main-list">
              {(isFetching || isSearching) ?
                <Spinner animation="grow" role="status" variant="success">
                  <span className="sr-only">กำลังดาวน์โหลดข้อมูล...</span>
                </Spinner>
                :
                <ul className="list-unstyled">
                  {/* {diseaseList.length > 0 ? : <div className="text-center my-3">ไม่พบอะไรเลยจ้ะ</div>} */}
                  {diseaseList.length === 0 && herbalList.length === 0 ?
                    <div className="text-center my-3">ไม่พบอะไรเลยจ้ะ</div>
                    :
                    <>
                      {diseaseList.map((snap, i) => {
                        const data = snap.data()
                        const title = data.diseaseName && "โรค" + data.diseaseName
                        const description = data.description
                        const subItems = data.recipes
                        const image = data.image ? getDownloadUrl(storageConfig.disease_images_path, data.image) : `holder.js/400x400?text=ไม่มีภาพ`

                        return <MediaItem
                          showBy={showBy}
                          key={`media-${i}`}
                          uid={`media-${i}`}
                          prefix="ตำรับ"
                          showSubIndex="true"
                          title={title}
                          content={description}
                          subItems={subItems}
                          snapRef={snap}
                          image={image}
                          onImageClick={this.handleImageClick}
                          onSubClick={this.handleSubClick}
                        />
                      })}
                      {herbalList.map((snap, i) => {
                        const data = snap.data()
                        const title = data.herbalName
                        const description = data.description
                        const image = data.image ? getDownloadUrl(storageConfig.herbal_images_path, data.image) : `holder.js/400x400?text=ไม่มีภาพ`

                        return <MediaItem
                          showBy={showBy}
                          key={`media-${i}`}
                          uid={`media-${i}`}
                          showMoreInfoButton="true"
                          title={title}
                          content={description}
                          snapRef={snap}
                          image={image}
                          onImageClick={this.handleImageClick}
                          onSubClick={this.handleHerbalSubClick}
                        />
                      })}
                      <Col className="text-center"><Button variant="outline-secondary" className="text-center my-3" onClick={this.fetchAnother}>แสดงเพิ่มเติม</Button></Col>
                    </>
                  }
                  {/* {diseaseList.length > 0 ?  : null} */}
                </ul>

              }
            </div>
          </Col>
        </Row>
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
  fullViewRecipe: (recipe) =>
    dispatch({ type: 'FULLVIEW_RECIPE', recipe }),
  fullViewRecipeFetch: () =>
    dispatch({ type: 'FULLVIEW_RECIPE_FETCH' }),
});

export default compose(
  withFirebase,
  withFirestore,
  connect(mapStateToProps, mapDispatchToProps),
)(MainList)
