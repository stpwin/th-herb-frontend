import React, { Component } from 'react'
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withFirebase, withFirestore } from 'react-redux-firebase'
import { getDownloadUrl } from "../../utils"
import { storageConfig } from "../../config"

import { Spinner, Container, Row, Col, Button, Dropdown } from "react-bootstrap"
import MediaItem from "./MediaItem"
import {TagItem} from "./TagItem"
import { DiseaseModal, HerbalModal, RecipeModal, TagsModal } from "../MyModal"

import "./mainList.css"

const showItems = [
  { name: "โรค", ref: "ตำหรับ" },
  { name: "สมุนไพร", ref: "รักษาโรค" },
  { name: "หมวดหมู่", ref: "ตำหรับ" }
]

export class MainList extends Component {
  state = {
    diseaseModal: false,
    herbalModal: false,
    recipeModal: false,
    tagsModal: false,
    showBy: "โรค",
    /**@type {firebase.firestore.QueryDocumentSnapshot[]} */
    diseaseList: [],
    /**@type {firebase.firestore.QueryDocumentSnapshot[]} */
    herbalList: [],
    searchList: [],
    tags: [],
    lastSnapshot: null,
    limit: 10,
  }

  processData = () => {
    console.log(this.state.tags)
    this.props.doneFetch({})
  }

  handleFetchAnother = () => {
    // console.log("on fetch another")
    this.props.doFetchMore()
    /**@type {firebase.firestore.Firestore} */
    const firestore = this.props.firestore

    if (this.state.showBy === "โรค") { //|| this.state.showBy === "หมวดหมู่"
      const diseaseRef = firestore.collection('diseases').where('showPublic', '==', true).orderBy('diseaseName').startAfter(this.state.lastSnapshot).limit(this.state.limit)
      const tagsRef = firestore.collection('tags').orderBy('tagName')
      // return tagsRef.get().then(tagsSnap => {
        // return tagsSnap.docs
      // }).then((tagDocs) => {
        return diseaseRef.get().then(diseaseSnap => {
          this.setState({
            herbalList: [],
            diseaseList: [...this.state.diseaseList, ...diseaseSnap.docs],
            lastSnapshot: diseaseSnap.docs.length > 0 && diseaseSnap.docs[diseaseSnap.docs.length - 1],
            // tags: tagDocs
          }, this.processData)
        }, (error) => {
          console.warn(error)
        })
      // })
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
    if (this.state.showBy === "โรค" || this.state.showBy === "หมวดหมู่") {
      let diseaseRef;
      if (this.state.showBy === "หมวดหมู่") {
        diseaseRef = firestore.collection('diseases').where('showPublic', '==', true).orderBy('diseaseName')//.limit(this.state.limit)
      } else {
        diseaseRef = firestore.collection('diseases').where('showPublic', '==', true).orderBy('diseaseName').limit(this.state.limit)
      }
      
      const tagsRef = firestore.collection('tags').orderBy('tagName')//.limit(this.state.limit)
      return tagsRef.get().then(tagsSnap => {
        return tagsSnap.docs
      }).then((tagDocs) => {
        return diseaseRef.get().then(diseaseSnap => {
          this.setState({
            herbalList: [],
            diseaseList: diseaseSnap.docs,
            lastSnapshot: diseaseSnap.docs.length > 0 && diseaseSnap.docs[diseaseSnap.docs.length - 1],
            tags: tagDocs
          }, this.processData)
        }, (error) => {
          console.warn(error)
        })
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
    const key = localStorage.getItem("showBy")
    if (key) {
      this.setState({
        showBy: showItems[key].name,
      })
    }

    /**@type {firebase.auth.Auth} */
    const auth = this.props.firebase.auth()
    auth.onAuthStateChanged(user => {

      //Enable this
      this.startFetch() 

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

  handleShowTagsModal = () => {
    this.setState({
      tagsModal: true
    })
  }

  handleHideTagsModal = () => {
    this.setState({
      tagsModal: false
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

    if (herbals) {
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
    
  }

  /**@param {firebase.firestore.DocumentReference} ref */
  fetchRecipe = (ref) => {
    this.props.fullViewRecipeFetch()
    ref.get().then(doc => {
      const data = doc.data()
      this.fetchHerbals(data && data.herbals)
      this.props.fullViewRecipe(data && data.description)
    })
  }

  /**@param {firebase.firestore.DocumentSnapshot} parentref
   * @param {firebase.firestore.DocumentReference} ref
   */
  handleSubClick = (title, name, parentRef, ref, index) => {

    const parentData = parentRef.data()
    const description = parentData.description

    ref && this.fetchRecipe(ref)

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
    const { diseaseModal, herbalModal, recipeModal, showBy, diseaseList, herbalList, tagsModal, tags } = this.state

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
          <><AdminButtons
            onAddDisease={this.handleAddDisease}
            onAddHerbal={this.handleAddHerbal}
            onAddRecipe={this.handleAddRecipe}
            onShowTagsModal={this.handleShowTagsModal}
          />
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
            <TagsModal
              show={tagsModal}
              onHide={this.handleHideTagsModal}
            /> </> : null}

        {/* Hide ShowByDropdown when in search mode */}
        {isSearching || isSearchDone ? null : <ShowByDropdown showBy={showBy} showItems={showItems} onShowBySelect={this.handleShowBySelect} />}
        <Row>
          <Col>
            <div className="main-list">
              {(isFetching || isSearching) ?
                <Fetching />
                :
                <ul className="list-unstyled">
                  {isSearching || isSearchDone ?
                    (this.props.diseaseResult.length === 0 && this.props.herbalResult.length === 0 ? <Nothing /> :
                      <SearchResult
                        showBy={showBy}
                        diseaseResult={this.props.diseaseResult}
                        herbalResult={this.props.herbalResult}
                        onSubClick={this.handleSubClick}
                        onImageClick={this.handleImageClick}
                        onHerbalSubClick={this.handleHerbalSubClick}
                      />)
                    :
                    (diseaseList.length === 0 && herbalList.length === 0 ? <Nothing /> :
                      showBy === "หมวดหมู่" ?
                        (<FetchResultTag
                          showBy={showBy}
                          diseaseList={diseaseList}
                          tags={tags}
                          onImageClick={this.handleImageClick}
                          onSubClick={this.handleSubClick}
                        />)
                        : 
                        (<FetchResult
                          diseaseList={diseaseList}
                          herbalList={herbalList}
                          showBy={showBy}
                          onFetchAnother={this.handleFetchAnother}
                          onImageClick={this.handleImageClick}
                          onSubClick={this.handleSubClick}
                          onHerbalSubClick={this.handleHerbalSubClick}
                          isMoreFetching={isMoreFetching}
                          fetchAnotherDisable={isSearching || isSearchDone || isFetching || isMoreFetching} />)
                    )
                  }
                </ul>
              }
            </div>
          </Col>
        </Row>
      </Container>
    )
  }
}

const FetchResultTag = ({ diseaseList, tags, onImageClick, onSubClick, showBy }) => {
  let tagList = {}

  diseaseList.map((snap, i) => {
    const data = snap.data()
    if (!tagList[data.tag]) {
      tagList[data.tag] = [snap]
    } else {
      tagList[data.tag].push(snap)
    }
  })
  // console.log(tagList)
  return <>

  {tags.map((snap, i) => {
    const data = snap.data()
    const title = data.tagName
    if (tagList[title] && tagList[title].length > 0) {
      return <TagItem
      showBy={showBy}
      key={`media-${i}`}
      uid={`media-${i}`}
      prefix="ตำรับ"
      title={title}
      subItems={tagList[title]}
      onImageClick={onImageClick}
      onSubClick={onSubClick}
    />
    }
    
  })}

</>
}

const ShowByDropdown = ({ showBy, showItems, onShowBySelect }) =>
  <div className="filter-item">
  <Row>
    <Col className="mb-3" style={{ display: "flex" }} sm={5}>
      <div className="mr-2" style={{ alignSelf: "center" }}>แสดงตาม</div>
      <Dropdown>
        <Dropdown.Toggle variant="outline-secondary" size="sm">
          {showBy}
        </Dropdown.Toggle>
        <Dropdown.Menu id="dropdown-item-button" title="แสดงตาม">
          {showItems.map((item, ii) => {
            if (item.name === showBy) {
              return <Dropdown.Item key={`showBy-${ii}`} eventKey={`${ii}`} active onSelect={onShowBySelect}>{item.name}</Dropdown.Item>
            }
            return <Dropdown.Item key={`showBy-${ii}`} eventKey={`${ii}`} onSelect={onShowBySelect}>{item.name}</Dropdown.Item>
          })}
        </Dropdown.Menu>
      </Dropdown>
    </Col>
    <Col></Col>
  </Row>
</div>

const Nothing = () => <div className="text-center my-3">ไม่พบอะไรเลยจ้ะ</div>

const Fetching = () => <Spinner animation="grow" role="status" variant="success">
  <span className="sr-only">กำลังดาวน์โหลดข้อมูล...</span>
</Spinner>

const AdminButtons = ({ onAddDisease, onAddHerbal, onAddRecipe, onShowTagsModal }) => <>
  <Row className="justify-content-md-center mb-3">
    <Col xs lg={3}>
      <Button variant="outline-primary" className="manage-button mb-1" block onClick={() => onAddDisease()}>จัดการโรค</Button>
    </Col>
    <Col xs lg={3}>
      <Button variant="outline-primary" className="manage-button mb-1" block onClick={() => onAddHerbal()}>จัดการสมุนไพร</Button>
    </Col>
    <Col xs lg={3}>
      <Button variant="outline-primary" className="manage-button mb-1" block onClick={() => onAddRecipe()}>จัดการตำรับ</Button>
    </Col>
    <Col xs lg={3}>
      <Button variant="outline-primary" className="manage-button mb-1" block onClick={() => onShowTagsModal()}>จัดการหมวดหมู่</Button>
    </Col>
  </Row>
</>

const SearchResult = ({ diseaseResult, herbalResult, onSubClick, onImageClick, onHerbalSubClick, showBy}) => 
  <>
    {diseaseResult.map((snap, i) => {
      const data = snap.data()
      const title = data.diseaseName && "โรค" + data.diseaseName
      const description = data.description
      const subItems = data.recipes
      const image = data.image ? getDownloadUrl(storageConfig.disease_images_path, data.image) : `holder.js/400x400?text=ไม่มีภาพ`
      const tag = data.tag
      // console.log(subItems)
      return <MediaItem
        showBy={showBy}
        key={`media-${i}`}
        uid={`media-${i}`}
        prefix="ตำรับ"
        title={title}
        mytag={tag}
        content={description}
        subItems={subItems}
        snapRef={snap}
        image={image}
        onImageClick={onImageClick}
        onSubClick={onSubClick}
      />
    })}
    {herbalResult.map((snap, i) => {
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
        onImageClick={onImageClick}
        onSubClick={onHerbalSubClick}
      />
    })}
  </>

const FetchResult = ({ diseaseList, herbalList, onFetchAnother, fetchAnotherDisable, onImageClick, onSubClick, onHerbalSubClick, isMoreFetching, showBy}) => 
  <>
    {diseaseList.map((snap, i) => {
      const data = snap.data()
      const title = data.diseaseName && "โรค" + data.diseaseName
      const description = data.description
      const subItems = data.recipes
      const image = data.image ? getDownloadUrl(storageConfig.disease_images_path, data.image) : `holder.js/400x400?text=ไม่มีภาพ`
      const tag = data.tag
      
      return <MediaItem
        showBy={showBy}
        key={`media-${i}`}
        uid={`media-${i}`}
        prefix="ตำรับ"
        title={title}
        mytag={tag}
        content={description}
        subItems={subItems}
        snapRef={snap}
        image={image}
        onImageClick={onImageClick}
        onSubClick={onSubClick}
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
        onImageClick={onImageClick}
        onSubClick={onHerbalSubClick}
      />
    })}
    <ShowAnotherButton onFetchAnother={onFetchAnother} fetchAnotherDisable={fetchAnotherDisable} isMoreFetching={isMoreFetching}/>
  </>

const ShowAnotherButton = ({ onFetchAnother, fetchAnotherDisable, isMoreFetching}) => <Col className="text-center">
      <Button
        variant="outline-secondary"
        className="text-center my-3"
        disabled={fetchAnotherDisable}
        onClick={onFetchAnother}>
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
