import React, { Component } from 'react'
import { MyModal } from "./MyModal"
import { Form, Col, Row } from 'react-bootstrap'
import { compose } from 'redux'
import { withFirestore } from 'react-redux-firebase'

import "./tagInput.css"


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

class RecipeModal extends Component {
  state = {
    // tags: [],
    showGallery: false,
    diseases: [],
    updating: false,
    data: {
      recipeName: "",
      description: "",
      diseaseRef: null,
      showPublic: true,
    }
  }

  componentWillMount() {
    const firestore = this.props.firestore
    firestore.collection("diseases").onSnapshot(snapshot => {
      const docs = snapshot.docs
      console.log(docs)
      this.setState({
        diseases: docs
      })
    })
  }

  componentDidMount() {

    // const firestore = this.props.firestore
    // firestore.collection("diseases").get().then(snapshot => {
    //   const docs = snapshot.docs
    //   console.log(docs)
    //   this.setState({
    //     diseases: docs
    //   })
    // })
  }
  componentDidUpdate() {

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
      data: {
        ...this.state.data,
        [e.target.name]: e.target.value
      }
    })
  }

  handleShowPublicChange = (e) => {
    this.setState({
      data: {
        ...this.state.data,
        showPublic: e.target.value === "true"
      }
    })
  }

  handleDiseaseChange = (e) => {
    const diseaseRef = this.state.diseases[e.target.value].ref
    console.log(diseaseRef)
    console.log(e.target.value)
    this.setState({
      data: {
        ...this.state.data,
        diseaseRef
      }
    })
  }

  handleSubmit = () => {
    const firestore = this.props.firestore
    const { data } = this.state

    this.setState({
      updating: true
    })

    firestore.add({ collection: 'recipes' }, {
      ...data,
      owner: 'Anonymous',
      createdAt: firestore.FieldValue.serverTimestamp()
    }).then(doc => {
      console.log("doc:", doc)
      if (data.diseaseRef) {
        return firestore.runTransaction(t => {
          return t.get(data.diseaseRef).then(disease_doc => {
            const prevRefs = disease_doc.data().recipeRefs || []
            t.update(data.diseaseRef, { recipeRefs: [...prevRefs, doc] })
          })
        }).then(result => {
          console.log("success", result)

          this.setState({
            updating: false,
          })
          this.props.onHide()
        }).catch(err => {
          console.log(err)
        })
      }
      console.log("this will not fire")
      this.setState({
        updating: false,
      })
      this.props.onHide()
    })
  }

  render() {
    const { recipeName, description, diseases, tags, updating } = this.state
    const { onHide } = this.props
    let modalBody = <RecipeForm tags={tags}
      recipeName={recipeName}
      description={description}
      diseases={diseases}
      onChange={this.handleChange}
      // handleDelete={this.handleDelete}
      // handleAddition={this.handleAddition}
      // handleTagClick={this.handleTagClick}
      handleShowPublicChange={this.handleShowPublicChange}
      handleDiseaseChange={this.handleDiseaseChange}
    />
    const modalTitle = "เพิ่มตำรับ"
    let modalSubTitle = ""
    let submittext = "บันทึก"
    let showsubmit = "true"
    let canceltext = "ปิด"
    let onCancel = onHide
    let submitdisable = updating.toString()

    // if (showUpload) {
    //   modalSubTitle = " > อัพโหลดภาพ"
    //   submittext = "เสร็จสิ้น"
    //   showsubmit = "false"
    //   canceltext = "กลับ"
    //   onCancel = this.handleHideUpload
    //   modalBody = <Upload onUploadDone={this.handleUploadDone} uploadPath={storageConfig.disease_images_path} />
    //   submitdisable = "false"

    // } else if (showGallery) {
    //   modalSubTitle = " > เลือกภาพ"
    //   onCancel = this.handleHideGallery
    //   submittext = "เลือกภาพ"
    //   showsubmit = "false"
    //   canceltext = "กลับ"
    //   modalBody =
    //     <Gallery
    //       onClick={this.handleImageClick}
    //       galleryImages={galleryImages}
    //       fetchImage={fetchGalleryImage}
    //       onFetchDone={this.handleGalleryFetchDone}
    //       gallerypath={storageConfig.disease_images_path}
    //     />
    // }
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

const RecipeForm = ({ recipeName, description, showPublic, onChange, diseases, tags, handleDelete, handleAddition, handleTagClick, handleShowPublicChange, handleDiseaseChange }) => <Form>
  <Form.Group as={Row}>
    <Form.Label column sm="2">ชื่อตำรับ</Form.Label>
    <Col sm="10">
      <Form.Control type="text" placeholder="ชื่อตำรับ" name="recipeName" value={recipeName} onChange={onChange} />
    </Col>
  </Form.Group>

  <Form.Group as={Row}>
    <Form.Label column sm="2">รายละเอียด</Form.Label>
    <Col sm="10">
      <Form.Control as="textarea" rows="3" name="description" value={description} onChange={onChange} />
    </Col>
  </Form.Group>

  <Form.Group as={Row}>
    <Form.Label column sm="2">รักษาโรค</Form.Label>
    <Col sm="3">
      <Form.Control as="select" name="diseases" onChange={handleDiseaseChange}>
        <option key={`diseas-none`} value="">เลือกโรค</option>
        {diseases && diseases.length > 0 && diseases.map((item, index) => {
          return <option key={`diseas-${index}`} value={index}>{item.id}</option>
        })}
      </Form.Control>
    </Col>
  </Form.Group>

  {/* <Form.Group as={Row}>
    <Form.Label column sm="2">สมุนไพร</Form.Label>
    <Col sm="3">
      <Form.Control as="select" name="herbals" value={herbals} onChange={handleHerbalChange}>
        <option value="true">x</option>
        <option value="false">x</option>
      </Form.Control>
    </Col>
  </Form.Group> */}

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

</Form>

const enhance = compose(
  withFirestore,
)

export default enhance(RecipeModal)
