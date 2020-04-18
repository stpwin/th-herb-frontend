import React, { Component, Fragment } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux';
import { withFirestore } from 'react-redux-firebase'
// import { hydrate } from "../../utils"

import { MyModal } from "./MyModal"
import { Form, Col, Row, Button, Table, ButtonGroup } from 'react-bootstrap'
import { ToolButtons } from "./ToolButtons"
import { FaPlusCircle, FaEye, FaEyeSlash, FaTools, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import Select from 'react-select';

const healGroup = [
  { label: "ต้มน้ำดื่ม", value: "ต้มน้ำดื่ม" },
  { label: "ดื่ม", value: "ดื่ม" },
  { label: "ทาบริเวณที่มีอาการ", value: "ทาบริเวณที่มีอาการ" },
  { label: "ปั้นเป็นเม็ด", value: "ปั้นเป็นเม็ด" },
  { label: "ทาหรือแช่", value: "ทาหรือแช่" },
  // { label: "ทา", value: "ทา" },
  { label: "ต้มน้ำดื่มหรือกินสด", value: "ต้มน้ำดื่มหรือกินสด" },
  { label: "อาบ", value: "อาบ" },
  { label: "สูดดม", value: "สูดดม" },
  { label: "ต้มหรือบดผสมน้ำผึ้ง", value: "ต้มหรือบดผสมน้ำผึ้ง" },
  { label: "ทาหรือปิดแผล", value: "ทาหรือปิดแผล" },
  // { label: "ฝนทา", value: "ฝนทา" },
  { label: "พอก", value: "พอก" },
  { label: "เช็ดตัว", value: "เช็ดตัว" },
  { label: "ปิดปากแผล", value: "ปิดปากแผล" },
  { label: "ทาน", value: "ทาน" },
  { label: "แช่น้ำดื่ม", value: "แช่น้ำดื่ม" },
  { label: "บด", value: "บด" },
]

// let diseasesListener
// let herbalsListener
let recipesListener
class RecipeModal extends Component {
  state = {
    showAdd: false,
    diseases: [],
    herbals: [],
    /** @type {firebase.firestore.DocumentReference[]} */
    recipes: {},
    updating: false,
    // selectHerbals: [],
    // selectDisease: "",
    data: {
      recipeName: "",
      heal: "",
      description: "",
      /** @type {firebase.firestore.DocumentReference} */
      diseaseRef: null,
      diseaseName: "",
      showPublic: true,
      /** @type {firebase.firestore.DocumentReference[]} */
      herbalRefs: [],
      herbals: []
    },
    /** @type {firebase.firestore.DocumentSnapshot} */
    updateDocSnapshot: null,
    limit: 12,
    lastVisible: null,
    firstSnapshotList: [],
    lastFirstVisible: null,
    offset: 0,
    finalPage: false,
    prevDisable: true,
    nextDisable: false,
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.show && !recipesListener) {
      this.startListen()
      this.fetchHerbalDisease()
    } else if (!nextProps.show) {
      this.stopListen()
    }
  }

  fetchHerbalDisease = () => {
    /** @type {firebase.firestore.Firestore} */
    const firestore = this.props.firestore
    const herbalsRef = firestore.collection('herbals')
    const diseasesRef = firestore.collection('diseases')

    diseasesRef.get().then(({ docs }) => {
      const diseases = docs && docs.map(doc => {
        const data = doc.data()
        return { label: data.diseaseName, value: data.diseaseName, ref: doc.ref }
      })
      this.setState({ diseases })
    }, (error) => {

    })

    herbalsRef.get().then(({ docs }) => {
      const herbals = docs.map(doc => {
        const data = doc.data()
        return { label: data.herbalName, value: data.herbalName, image: data.image, ref: doc.ref }
      })
      this.setState({ herbals })
    }, (error) => {

    })
  }

  startListen = (prev = false) => {
    /** @type {firebase.firestore.Firestore} */
    const firestore = this.props.firestore
    const recipesRef = firestore.collection('recipes')

    if (!recipesListener) {
      console.log("startListen")
      let query = recipesRef.orderBy('diseaseName').limit(this.state.limit).startAfter(this.state.lastVisible)
      if (prev) {
        console.log("Prev first:", this.state.firstSnapshotList[this.state.offset].id)
        query = recipesRef.orderBy('diseaseName').limit(this.state.limit).startAt(this.state.firstSnapshotList[this.state.offset])
      }
      recipesListener = query.onSnapshot({ includeMetadataChanges: true }, recipeSnap => {
        // console.log("onSnap")

        // recipeSnap.docChanges().forEach(change => {
        //   console.log("change.type:", change.type)
        //   console.log("fromCache:", recipeSnap.metadata.fromCache)
        // })

        if (recipeSnap.empty) {
          console.log("Empty")
          this.setState({
            finalPage: true,
            nextDisable: true,
            offset: this.state.offset > 0 && this.state.offset - 1
          })
          return
        }
        this.setState({
          recipes: {}
        })
        const firstVisible = recipeSnap.docs[0]
        const lastVisible = recipeSnap.docs[recipeSnap.docs.length - 1]

        // console.log("lastFirstVisible:", lastFirstVisible.id)
        console.log("lastVisible:", lastVisible.id)
        // console.log("recipeSnap empty:", recipeSnap.empty)
        let firstSnapshotList = this.state.firstSnapshotList
        if (this.state.firstSnapshotList.findIndex(item => item.id === firstVisible.id) === -1) {
          console.log("add first: ", firstVisible.id)
          firstSnapshotList.push(firstVisible)
        }
        this.setState({
          firstSnapshotList,
          finalPage: false,
          nextDisable: false,
          // lastFirstVisible,
          lastVisible,
        })
        recipeSnap.docs.forEach((snapshot) => {
          const { diseaseName, herbals } = snapshot.data()
          // /** @type {firebase.firestore.DocumentReference[]} */
          // const herbalRefs = data.herbalRefs
          // const herbals = data.herbals
          // await hydrate(data, ['diseaseRef'])

          this.setState({
            recipes: { ...this.state.recipes, [snapshot.id]: { snapshot, diseaseName, herbals } },
          })

          // const herbalDocs = herbalRefs && herbalRefs.map(herbal => herbal.get())
          // herbalDocs && Promise.all(herbalDocs).then(result => {
          //   const herbalNames = result.map(s => (s.exists && s.data().herbalName) || "ข้อมูลถูกลบ")
          //   const updateData = { [snapshot.id]: { ...this.state.recipes[snapshot.id], herbalNames } }
          //   this.setState({
          //     recipes: { ...this.state.recipes, ...updateData }
          //   })
          // })
        })
      }, (error) => {
        console.warn(error)
      })
    }

  }

  stopListen = () => {
    console.log("stopListen")
    if (recipesListener) {
      recipesListener()
      recipesListener = null
    }
  }

  componentWillUnmount() {
    this.stopListen()
  }

  componentDidMount() {
    // this.stopListen()
    // return //DISABLED
    /**@type {firebase.auth.Auth} */
    const auth = this.props.firebase.auth()
    auth.onAuthStateChanged(user => {
      if (user) {
        // this.startListen()
      }

    })
    // this.startListen()
  }

  handleChange = (e) => {
    this.setState({
      data: { ...this.state.data, [e.target.name]: e.target.value }
    })
  }

  handleShowPublicChange = (e) => {
    this.setState({
      data: { ...this.state.data, showPublic: e.target.value === "true" }
    })
  }

  handleDiseaseChange = (e) => {
    const diseaseRef = e && e.ref
    const diseaseName = e && e.value
    this.setState({ data: { ...this.state.data, diseaseRef, diseaseName }, selectDisease: e && e.value })
  }

  handleSelectHerbalChange = e => {
    const herbals = e && e.map(item => {
      return { herbalName: item.value, image: item.image, ref: item.ref }
    })
    // const herbalRefs = e && e.map(item => item.ref)
    // const selectHerbals = e && e.map(item => item.value)
    console.log("handleSelectHerbalChange:", e)
    this.setState({ data: { ...this.state.data, herbals } }, () => console.log(this.state.data.herbals))
  }

  handleHealChange = e => {
    const heal = e && e.value
    this.setState({ data: { ...this.state.data, heal } })
  }

  handleSubmit = () => {
    /** @type {firebase.firestore.Firestore} */
    const firestore = this.props.firestore
    const { data, updateDocSnapshot } = this.state

    /** @type {firebase.User} */
    const user = this.props.authUser
    if (!user) {
      console.warn("Auth required!")
      this.props.showLogin()
      return
    }

    const trimed = {
      ...data,
      // recipeName: recipeName,
      // heal: heal.trim(),
      // description: description.trim(),
    }

    this.setState({ updating: true })

    if (updateDocSnapshot) {
      updateDocSnapshot.ref.update({
        ...trimed,
        modifyAt: firestore.FieldValue.serverTimestamp()
      }).then(() => {
        // const transaction = firestore.runTransaction(t => {
        //   t.get(updateDocSnapshot.ref).then(doc => {
        //     const data = doc.data()
        //     /**@type {firebase.firestore.DocumentReference} */
        //     const diseaseRef = data.diseaseRef
        //     diseaseRef.
        //       t.update(diseaseRef)
        //   })
        // })
        // firestore.collection('diseases').where('diseaseName', '==')
        this.setState({ showAdd: false, updating: false, })
      })
      return
    }

    firestore.add({ collection: 'recipes' }, {
      ...trimed,
      owner: user.uid,
      createdAt: firestore.FieldValue.serverTimestamp()
    }).then(doc => {
      console.log("recipe added")
      this.setState({ showAdd: false, updating: false, })
    })
  }

  handleShowAdd = () => {
    this.setState({
      showAdd: true,
      data: {
        recipeName: "",
        heal: "",
        description: "",
        diseaseDescription: "",
        diseaseImage: "",
        diseaseName: "",
        diseaseRef: null,
        showPublic: true,
        // herbalRefs: [],
        herbals: []
      },
      updateDocSnapshot: null,
      selectDisease: "",
      selectHerbals: [],
    })
  }

  handleHideAdd = () => { this.setState({ showAdd: false }) }

  /**
* @param {firebase.firestore.DocumentSnapshot} snapshot
*/
  handleEdit = recipe => {
    const data = recipe.snapshot.data()
    this.setState({
      data,
      // selectDisease: recipe.diseaseName,
      // selectHerbals: recipe.herbalNames,
      updateDocSnapshot: recipe.snapshot,
      showAdd: true,
    })
  }

  /**
  * @param {firebase.firestore.DocumentSnapshot} snapshot
  */
  handleDelete = snapshot => {
    if (!snapshot) return
    snapshot.ref.delete().then(() => {
      console.log("deleted")
    }).catch(err => {
      console.log("deleted fail:", err)
    })
  }

  handleNextPage = () => {
    this.stopListen()
    const offset = this.state.lastVisible ? this.state.offset + 1 : this.state.offset
    this.setState({
      prevDisable: offset < 1,
      // nextDisable: !this.state.lastVisible,
      offset
    }, () => {
      console.log("offset:", offset)
      this.startListen()
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

  render() {
    const { data, updateDocSnapshot, showAdd, diseases, recipes, herbals, updating, prevDisable, nextDisable, limit, offset } = this.state
    const { onHide } = this.props

    const modalTitle = "จัดการข้อมูลตำรับ"
    let modalSubTitle = ""
    let submittext = ""
    let showsubmit = "false"
    let canceltext = "ปิด"
    let onCancel = onHide
    let submitdisable = updating.toString()

    let modalBody = <RecipeList
      recipes={recipes}
      handleAdd={this.handleShowAdd}
      handleEdit={this.handleEdit}
      handleDelete={this.handleDelete}
      limit={limit}
      offset={offset}
      onNextPage={this.handleNextPage}
      onPrevPage={this.handlePrevPage}
      prevDisable={prevDisable}
      nextDisable={nextDisable}
    />

    const subtitle = updateDocSnapshot ? "แก้ไขข้อมูลตำรับ" : "เพิ่มข้อมูลตำรับ"
    if (showAdd) {
      modalSubTitle = subtitle
      submittext = "บันทึก"
      showsubmit = "true"
      canceltext = "กลับ"
      onCancel = this.handleHideAdd

      modalBody = <RecipeForm
        data={data}
        herbals={herbals}
        diseases={diseases}
        selectDisease={data.diseaseName}
        selectHerbals={data.herbals}
        onChange={this.handleChange}
        handleShowPublicChange={this.handleShowPublicChange}
        handleDiseaseChange={this.handleDiseaseChange}
        onSelectHerbalChange={this.handleSelectHerbalChange}
        handleHealChange={this.handleHealChange}
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

const RecipeList = ({ recipes, handleAdd, handleEdit, prevDisable, nextDisable, handleDelete, onNextPage, onPrevPage, limit, offset }) =>
  <>
    <div className="mb-1 text-right">
      <Button variant="success" size="sm" onClick={handleAdd}><FaPlusCircle /></Button>{" "}
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
            <th style={{ minWidth: "5rem" }}>รักษาโรค</th>
            <th style={{ minWidth: "5rem" }}>ชื่อตำรับ</th>
            <th style={{ minWidth: "5rem" }}>วิธีการ</th>
            <th>สมุนไพร</th>
            <th className="text-center" style={{ width: "5%" }}><FaEye /></th>
            <th className="text-center" style={{ width: "10%" }}><FaTools /></th>
          </tr>
        </thead>
        <tbody>
          {(recipes && Object.values(recipes).length > 0 && Object.values(recipes).map((recipe, index) => {
            // const r = Object.values(recipe)[0]
            const data = recipe.snapshot.data()
            // console.log("recipe", recipe)
            return <tr key={`recipe-${index}`}>
              <td className="text-center">{(index + 1) + (limit * offset)}</td>
              <td>{recipe.diseaseName}</td>
              <td>{(data.recipeName || "")}</td>
              <td>{data.heal}</td>
              <td><span className="td-fixed-content">{recipe.herbals && recipe.herbals.map(herbal => herbal.herbalName).join(", ")}</span></td>
              <td className="text-center">{data.showPublic ? <FaEye /> : <FaEyeSlash />}</td>
              <td >
                <div style={{ alignSelf: "center" }} className="text-center">
                  <ToolButtons onDelete={() => handleDelete(recipe.snapshot)} onEdit={() => handleEdit(recipe)} />
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

const RecipeForm = ({ data: { recipeName, description, diseaseName, showPublic, heal, herbals: selectHerbals }, diseases, herbals, onChange, handleShowPublicChange, handleDiseaseChange, onSelectHerbalChange, handleHealChange }) =>

  <Form autoComplete="off">
    <Form.Group as={Row}>
      <Form.Label column sm="2">ชื่อตำรับ</Form.Label>
      <Col sm="10">
        <Form.Control type="text" placeholder="ชื่อตำรับ" alt="ชื่อตำรับ" name="recipeName" value={recipeName} onChange={onChange} />
      </Col>
    </Form.Group>
    <Form.Group as={Row}>
      <Form.Label column sm="2">รักษาโรค</Form.Label>
      <Col sm="3">
        <Select
          closeMenuOnSelect={true}
          placeholder="เลือกโรค"
          noOptionsMessage={() => "ไม่มีตัวเลือก"}
          loadingMessage={() => "กำลังโหลด"}
          isClearable={true}
          backspaceRemovesValue={false}
          options={diseases}
          value={diseases.filter(option => option.value === diseaseName)}
          name="diseases"
          onChange={handleDiseaseChange}
        />
      </Col>
    </Form.Group>

    <Form.Group as={Row}>
      <Form.Label column sm="2">วิธีการรักษา</Form.Label>
      <Col sm="3">
        <Select
          closeMenuOnSelect={true}
          placeholder="เลือกวิธีการรักษา"
          noOptionsMessage={() => "ไม่มีตัวเลือก"}
          loadingMessage={() => "กำลังโหลด"}
          isClearable={true}
          backspaceRemovesValue={false}
          options={healGroup}
          value={healGroup.filter(h => h.value === heal)}
          name="heal_select"
          onChange={handleHealChange}
        />
      </Col>
    </Form.Group>

    <Form.Group as={Row}>
      <Form.Label column sm="2">ขั้นตอนการรักษา</Form.Label>
      <Col sm="10">
        <Form.Control as="textarea" rows="14" name="description" value={description} onChange={onChange} />
      </Col>
    </Form.Group>

    <Form.Group as={Row}>
      <Form.Label column sm="2">สมุนไพร</Form.Label>
      <Col sm="10">
        <Select
          // closeMenuOnSelect={false}
          placeholder="เลือกสมุนไพร"
          noOptionsMessage={() => "ไม่มีตัวเลือก"}
          loadingMessage={() => "กำลังโหลด"}
          isClearable={true}
          backspaceRemovesValue={false}
          options={herbals}
          defaultValue={herbals.filter(h => selectHerbals && selectHerbals.map(item => item.herbalName).includes(h.value))}
          name="herbals_select"
          onChange={onSelectHerbalChange}
          isMulti
        />
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
    <Form.Control type="hidden" value="something"></Form.Control>
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

export default enhance(RecipeModal)
