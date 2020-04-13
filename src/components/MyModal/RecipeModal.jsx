import React, { Component, Fragment } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux';
import { withFirestore } from 'react-redux-firebase'
import { hydrate } from "../../utils"

import { MyModal } from "./MyModal"
import { Form, Col, Row, Button, Table } from 'react-bootstrap'
import { ToolButtons } from "./ToolButtons"
import { FaPlus, FaEye, FaEyeSlash, FaTools } from 'react-icons/fa'
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


class RecipeModal extends Component {
  state = {
    showAdd: false,
    diseases: [],
    herbals: [],
    /** @type {firebase.firestore.DocumentReference[]} */
    recipes: {},
    updating: false,
    selectHerbals: [],
    selectDisease: "",
    data: {
      recipeName: "",
      heal: "",
      description: "",
      /** @type {firebase.firestore.DocumentReference} */
      diseaseRef: null,
      showPublic: true,
      /** @type {firebase.firestore.DocumentReference[]} */
      herbalRefs: []
    },
    /** @type {firebase.firestore.DocumentSnapshot} */
    updateDocSnapshot: null,
  }

  fetchData = () => {
    /** @type {firebase.firestore.Firestore} */
    const firestore = this.props.firestore
    const recipesRef = firestore.collection('recipes')
    const herbalsRef = firestore.collection('herbals')
    const diseasesRef = firestore.collection('diseases')

    diseasesRef.onSnapshot(({ docs }) => {
      const diseases = docs && docs.map(doc => {
        const data = doc.data()
        return { label: data.diseaseName, value: data.diseaseName, ref: doc.ref }
      })
      this.setState({ diseases })
    }, (error) => {

    })
    herbalsRef.onSnapshot(({ docs }) => {
      const herbals = docs.map(doc => {
        const data = doc.data()
        return { label: data.herbalName, value: data.herbalName, ref: doc.ref }
      })
      this.setState({ herbals })
    }, (error) => {

    })
    recipesRef.onSnapshot(({ docs }) => {
      docs.forEach(async (snapshot) => {
        const data = snapshot.data()
        /** @type {firebase.firestore.DocumentReference[]} */
        const herbalRefs = data.herbalRefs
        await hydrate(data, ['diseaseRef'])

        this.setState({
          recipes: { ...this.state.recipes, [snapshot.id]: { snapshot, diseaseName: data.diseaseRef && data.diseaseRef.diseaseName } }
        })

        const herbalDocs = herbalRefs && herbalRefs.map(herbal => herbal.get())
        herbalDocs && Promise.all(herbalDocs).then(result => {
          const herbalNames = result.map(s => (s.exists && s.data().herbalName) || "ข้อมูลถูกลบ")
          const updateData = { [snapshot.id]: { ...this.state.recipes[snapshot.id], herbalNames } }
          this.setState({
            recipes: { ...this.state.recipes, ...updateData }
          })
        })
      })
    }, (error) => {

    })
  }

  componentDidMount() {
    /**@type {firebase.auth.Auth} */
    const auth = this.props.firebase.auth()
    auth.onAuthStateChanged(user => {
      this.fetchData()
    })
    this.fetchData()
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
    this.setState({ data: { ...this.state.data, diseaseRef }, selectDisease: e && e.value })
  }

  handleSelectHerbalChange = e => {
    const herbalRefs = e && e.map(item => item.ref)
    const selectHerbals = e && e.map(item => item.value)
    console.log("handleSelectHerbalChange:", e)
    this.setState({ selectHerbals, data: { ...this.state.data, herbalRefs } }, () => console.log(this.state.selectHerbals))
  }

  handleHealChange = e => {
    const heal = e && e.value
    this.setState({ data: { ...this.state.data, heal } })
  }

  handleSubmit = () => {
    /** @type {firebase.firestore.Firestore} */
    const firestore = this.props.firestore
    const { data, data: { recipeName, heal, description }, updateDocSnapshot } = this.state

    /** @type {firebase.User} */
    const user = this.props.authUser
    if (!user) {
      console.warn("Auth required!")
      this.props.showLogin()
      return
    }

    const trimed = {
      ...data,
      recipeName: recipeName.trim(),
      heal: heal.trim(),
      description: description.trim(),
    }

    this.setState({ updating: true })

    if (updateDocSnapshot) {
      updateDocSnapshot.ref.update({
        ...trimed,
        modifyAt: firestore.FieldValue.serverTimestamp()
      }).then(() => {
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
        diseaseRef: null,
        showPublic: true,
        herbalRefs: []
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
      selectDisease: recipe.diseaseName,
      selectHerbals: recipe.herbalNames,
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

  render() {
    const { data, updateDocSnapshot, showAdd, diseases, selectDisease, selectHerbals, recipes, herbals, updating } = this.state
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
        selectDisease={selectDisease}
        selectHerbals={selectHerbals}
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

const RecipeList = ({ recipes, handleAdd, handleEdit, handleDelete }) =>
  <Fragment>
    <div className="mb-1 text-right">
      <Button variant="success" onClick={handleAdd}><FaPlus /></Button>
    </div>
    <div style={{ height: "40rem", overflowY: "auto" }}>
      <Table bordered striped size="sm" responsive hover >
        <thead>
          <tr>
            <th className="text-center" style={{ width: "5%" }}>#</th>
            <th>รักษาโรค</th>
            <th>ชื่อตำรับ</th>
            <th>วิธีการ</th>
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
              <td className="text-center">{index + 1}</td>
              <td>{recipe.diseaseName}</td>
              <td>{data.recipeName}</td>
              <td>{data.heal}</td>
              <td><p className="td-fixed-content">{recipe.herbalNames && recipe.herbalNames.join(", ")}</p></td>
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
  </Fragment>

const RecipeForm = ({ data: { recipeName, description, showPublic, heal }, selectDisease, selectHerbals, diseases, herbals, onChange, handleShowPublicChange, handleDiseaseChange, onSelectHerbalChange, handleHealChange }) =>

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
          value={diseases.filter(option => option.value === selectDisease)}
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
          closeMenuOnSelect={false}
          placeholder="เลือกสมุนไพร"
          noOptionsMessage={() => "ไม่มีตัวเลือก"}
          loadingMessage={() => "กำลังโหลด"}
          isClearable={true}
          backspaceRemovesValue={false}
          options={herbals}
          defaultValue={herbals.filter(h => selectHerbals && selectHerbals.includes(h.value))}
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
