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
    diseaseList: [],
    /**@type {firebase.firestore.QueryDocumentSnapshot[]} */
    herbalList: [],
    searchList: [],
    lastSnapshot: null,
    limit: 10,
  }

  processData = () => {
    // const { showBy } = this.state
    this.props.doneFetch({})
  }

  fetchAnother = () => {
    // console.log("on fetch another")
    this.props.doFetchMore()
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

  componentWillReceiveProps(nextProps) {
    // console.log(nextProps)
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
    const description = parentData.description

    this.fetchRecipe(ref)

    const body = { description }
    this.props.showFullView(`${title} ${name}`, body, false)
  }

  handleHerbalSubClick = (title, parentRef) => {
    // console.log("Herbal sub click", parentRef)
    if (parentRef) {
      const body = parentRef.data()
      this.props.showFullView(`${title} `, body, true)
    }
  }

  render() {
    // console.log(this.state.diseases)
    const { diseaseModal, herbalModal, recipeModal, showBy, diseaseList, herbalList } = this.state

    const isSearching = this.props.status === "searching"
    const isSearchDone = this.props.status === "searchdone"
    // const searchResult = this.props.searchResult

    const isMoreFetching = this.props.status === "more-fetching"
    const isFetching = this.props.status === "fetching"
    // const isFetchDone = this.props.status === "done"

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
                  {isSearching || isSearchDone ?
                    this.props.diseaseResult.length === 0 && this.props.herbalResult.length === 0 ? <div className="text-center my-3">ไม่พบอะไรเลยจ้ะ</div> :
                      <>
                        {this.props.diseaseResult.map((snap, i) => {
                          const data = snap.data()
                          const title = data.diseaseName && "โรค" + data.diseaseName
                          const description = data.description
                          const subItems = data.recipes
                          const image = data.image ? getDownloadUrl(storageConfig.disease_images_path, data.image) : `holder.js/400x400?text=ไม่มีภาพ`
                          console.log(subItems)
                          return <MediaItem
                            showBy={showBy}
                            key={`media-${i}`}
                            uid={`media-${i}`}
                            prefix="ตำรับ"
                            title={title}
                            content={description}
                            subItems={subItems}
                            snapRef={snap}
                            image={image}
                            onImageClick={this.handleImageClick}
                            onSubClick={this.handleSubClick}
                          />
                        })}
                        {this.props.herbalResult.map((snap, i) => {
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
                      </>
                    :
                    diseaseList.length === 0 && herbalList.length === 0 ?
                      <div className="text-center my-3">ไม่พบอะไรเลยจ้ะ</div>
                      :
                      <>
                        {diseaseList.map((snap, i) => {
                          const data = snap.data()
                          const title = data.diseaseName && "โรค" + data.diseaseName
                          const description = data.description
                          const subItems = data.recipes
                          const image = data.image ? getDownloadUrl(storageConfig.disease_images_path, data.image) : `holder.js/400x400?text=ไม่มีภาพ`
                          // console.log(subItems)
                          return <MediaItem
                            showBy={showBy}
                            key={`media-${i}`}
                            uid={`media-${i}`}
                            prefix="ตำรับ"
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
                        <Col className="text-center">
                          <Button
                            variant="outline-secondary"
                            className="text-center my-3"
                            disabled={isSearching || isSearchDone || isFetching || isMoreFetching}
                            onClick={this.fetchAnother}>
                            {isMoreFetching ?
                              <>
                                <Spinner
                                  as="span"
                                  animation="grow"
                                  size="sm"
                                  role="status"
                                  aria-hidden="true"
                                /> กำลังโหลด</> : "แสดงเพิ่มเติม"}
                          </Button>
                        </Col>
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
  herbalResult: state.data.herbalResult,
  diseaseResult: state.data.diseaseResult,
  status: state.data.status,
  authUser: state.login.authUser
});

const mapDispatchToProps = dispatch => ({
  showLogin: () =>
    dispatch({ type: 'SHOW_LOGIN' }),
  doFetch: () =>
    dispatch({ type: 'DO_FETCH' }),
  doFetchMore: () =>
    dispatch({ type: 'DO_FETCH_MORE' }),
  doneFetch: (result) =>
    dispatch({ type: 'DONE_FETCH', result }),
  showFullView: (title, body, herbalView) =>
    dispatch({ type: 'SHOW_FULLVIEW', title, body, herbalView }),
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
