import React, { Component } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux';
import { withFirestore } from 'react-redux-firebase'


import { MyModal } from "./MyModal"
import { Form, Col, Row, Button, Table, ButtonGroup } from 'react-bootstrap'
import { ToolButtons } from "./ToolButtons"
import { FaPlusCircle, FaTools, FaChevronLeft, FaChevronRight } from 'react-icons/fa'

let tagsListener
class TagsModal extends Component {
  state = {
    tags: [],
    tagName: "",
    prevDisable: true,
    nextDisable: false,
    updating: false,
    limit: 15,
    offset: 0,
  /** @type {firebase.firestore.DocumentSnapshot} */
    updateDocSnapshot: null,
    showAdd: false,
    lastVisible: null,
    firstSnapshotList: [],
    finalPage: false,
    displayOffset: 0
  }

  startListen = (prev = false, next = false) => {
    /** @type {firebase.firestore.Firestore} */
    const firestore = this.props.firestore
    const tagsRef = firestore.collection('tags')

    if (!tagsListener) {
      console.log("startListen")
      let query = tagsRef.orderBy('createdAt').limit(this.state.limit)
      if (next) {
        query = tagsRef.orderBy('createdAt').limit(this.state.limit).startAfter(this.state.lastVisible)
      } else if (prev) {
        query = tagsRef.orderBy('createdAt').limit(this.state.limit).startAt(this.state.firstSnapshotList[this.state.offset])
      }
      tagsListener = query.onSnapshot({ includeMetadataChanges: true }, tagsSnap => {
        let offset = this.state.offset
        if (tagsSnap.empty) {
          console.log("Empty")
          offset = this.state.offset > 0 && this.state.offset - 1
          this.setState({
            finalPage: true,
            nextDisable: true,
            offset,
            tags: []
          })
          return
        }
        this.setState({
          tags: []
        })
        const firstVisible = tagsSnap.docs[0]
        let lastVisible = tagsSnap.docs[tagsSnap.docs.length - 1]
        const firstSnapshotList = this.state.firstSnapshotList
        if (this.state.firstSnapshotList.findIndex(item => item.id === firstVisible.id) === -1) {
          // console.log("add first: ", firstVisible.id)
          firstSnapshotList.push(firstVisible)
        }
        this.setState({
          firstSnapshotList,
          finalPage: false,
          nextDisable: false,
          displayOffset: offset,
          lastVisible,
        })
        tagsSnap.docs.forEach((snapshot) => {
          // const data = snapshot.data()
          this.setState({
            tags: [...this.state.tags, snapshot ],
          })
        })
      }, (error) => {
        console.warn(error)
      })
    }

  }

  stopListen = () => {
    console.log("stopListen")
    if (tagsListener) {
      tagsListener()
      tagsListener = null
    }
  }

  componentDidMount() {
    this.startListen()
  }

  componentWillUnmount() {
    this.stopListen()
  }

  handleShowAdd = () => {
    this.setState({
      showAdd: true,
      updateDocSnapshot: null,
      tagName: ""
    })
  }

  handleHideAdd = () => {
    this.setState({
      showAdd: false
    })
  }

/**
* @param {firebase.firestore.DocumentSnapshot} tag
*/
  handleEdit = (tag) => {
    const data = tag.data()
    this.setState({
      tagName: data.tagName,
      updateDocSnapshot: tag,
      showAdd: true,
    })
  }

  //** @param {firebase.firestore.DocumentSnapshot} snapshot */
  handleDelete = snapshot => {
    console.log("do del", snapshot)
    if (!snapshot) return
    // console.log("do del")
    // /** @type {firebase.firestore.DocumentSnapshot} */
    // const snaps = this.props.firestore
    snapshot.ref.delete().then(() => {
      console.log("deleted")
    }).catch(err => {
      
    })
  }

  handleNextPage = () => {
    this.stopListen()
    const offset = this.state.lastVisible ? this.state.offset + 1 : this.state.offset
    this.setState({
      prevDisable: offset < 1,
      nextDisable: true,
      offset
    }, () => {
      console.log("offset:", offset)
      this.startListen(false, true)
    })
  }

  handlePrevPage = () => {
    this.stopListen()
    const offset = this.state.offset > 0 ? this.state.offset - 1 : 0
    this.setState({
      prevDisable: offset < 1,
      // nextDisable: !this.state.lastVisible,
      offset
    }, () => {
      console.log("offset:", this.state.offset)
      this.startListen(true)
    })
  }

  handleChange = (e) => {
    this.setState({
      tagName: e.target.value
    })
  }

  handleSubmit = (e) => {
    e.preventDefault()
    /** @type {firebase.firestore.Firestore} */
    const firestore = this.props.firestore
    // const batch = firestore.batch()
    const { updateDocSnapshot, tagName } = this.state

    /** @type {firebase.User} */
    const user = this.props.authUser
    if (!user) {
      console.warn("Auth required!")
      this.props.showLogin()
      return
    }

    this.setState({ updating: true })

    if (updateDocSnapshot) {
      updateDocSnapshot.ref.update({
        tagName,
        modifyAt: firestore.FieldValue.serverTimestamp()
      }).then(() => {
        this.setState({ showAdd: false, updating: false })
      }).catch(err => {
        
      })
      return
    }

    const tagsRef = firestore.collection('tags')
    tagsRef.add({
      tagName: this.state.tagName,
      createdAt: firestore.FieldValue.serverTimestamp(),
      modifyAt: firestore.FieldValue.serverTimestamp()
    }).then(() => {
      this.setState({ showAdd: false, updating: false})
    }).catch(err => {
      
    })

  }

  render() {
    const { tags, tagName, showAdd, updating, updateDocSnapshot, limit, displayOffset: offset,prevDisable, nextDisable} = this.state
    const { onHide } = this.props

    const modalTitle = "จัดการหมวดหมู่"
    let modalSubTitle = ""
    let submittext = ""
    let showsubmit = "false"
    let canceltext = "ปิด"
    let onCancel = onHide
    let submitdisable = updating.toString()

    let modalBody = <TagsList
      tags={tags}
      onAdd={this.handleShowAdd}
      onEdit={this.handleEdit}
      onDelete={this.handleDelete}
      onNextPage={this.handleNextPage}
      onPrevPage={this.handlePrevPage}
      limit={limit}
      offset={offset}
      prevDisable={prevDisable}
      nextDisable={nextDisable}
    />

    const subtitle = updateDocSnapshot ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่"
    if (showAdd) {
      modalSubTitle = subtitle
      submittext = "บันทึก"
      showsubmit = "true"
      canceltext = "กลับ"
      onCancel = this.handleHideAdd

      modalBody = <TagForm
        tagName={tagName}
        onChange={this.handleChange}
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

const TagsList = ({ tags, onAdd, onEdit, prevDisable, nextDisable, onDelete, onNextPage, onPrevPage, limit, offset }) =>
  <>
    <div className="mb-1 text-right">
      <Button variant="success" size="sm" onClick={onAdd}><FaPlusCircle /></Button>{" "}
      <ButtonGroup>
        <Button variant="outline-secondary" size="sm" disabled={prevDisable} onClick={onPrevPage} ><FaChevronLeft /></Button>
        <Button variant="outline-secondary" size="sm" disabled={nextDisable} onClick={onNextPage} ><FaChevronRight /></Button>
      </ButtonGroup>

    </div>
    <div style={{ height: "40rem", overflowY: "auto" }}>
      <Table bordered striped size="sm" responsive hover >
        <thead>
          <tr>
            <th className="text-center" style={{ width: "5%" }}>#</th>
            <th style={{ minWidth: "5rem" }}>ชื่อหมวดหมู่</th>
            <th className="text-center" style={{ minWidth: "81px" }}><FaTools /></th>
          </tr>
        </thead>
        <tbody>
          {(tags && tags.map((tag, index) => {
            const data = tag.data()
            return <tr key={`tag-${index}`}>
              <td className="text-center">{(index + 1) + (limit * offset)}</td>
              <td>{data.tagName}</td>
              <td >
                <div style={{ alignSelf: "center" }} className="text-center">
                  <ToolButtons onDelete={() => onDelete(tag)} onEdit={() => onEdit(tag)} />
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
  </>

const TagForm = ({ tagName, onChange }) =>
  <Form autoComplete="off">
    <Form.Group as={Row}>
      <Form.Label column sm="2">ชื่อหมวดหมู่</Form.Label>
      <Col sm="10">
        <Form.Control type="text" placeholder="ชื่อหมวหมู่" alt="ชื่อหมวหมู่" name="tagName" value={tagName} onChange={onChange} />
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

export default enhance(TagsModal)