import React, { Component, Fragment } from 'react'
import { compose } from 'redux'
import { withFirestore } from 'react-redux-firebase'

import { MyModal } from "./MyModal"
import { Form, Col, Row, Button, Table } from 'react-bootstrap'
import { ToolButtons } from "./ToolButtons"
import { FaPlus } from 'react-icons/fa'
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
]


class RecipeModal extends Component {
  state = {
    showAdd: false,
    diseases: [],
    herbals: [],
    /** @type {firebase.firestore.DocumentReference[]} */
    recipes: [],
    updating: false,
    selectHerbals: [],
    data: {
      recipeName: "",
      heal: "",
      description: "",
      diseaseRef: null,
      showPublic: true,
      herbalRefs: []
    },
    /** @type {firebase.firestore.DocumentSnapshot} */
    updateDocSnapshot: null,
  }

  componentDidMount() {
    /** @type {firebase.firestore.Firestore} */
    const firestore = this.props.firestore
    firestore.collection("diseases").orderBy('createdAt').onSnapshot(({ docs }) => {
      const diseases = docs && docs.map(doc => {
        const data = doc.data()
        return { label: data.diseaseName, value: data.diseaseName, ref: doc.ref }
      })
      this.setState({ diseases })
    })
    firestore.collection("herbals").orderBy('createdAt').onSnapshot(({ docs }) => {
      const herbals = docs.map(doc => {
        const data = doc.data()
        return { label: data.herbalName, value: data.herbalName, ref: doc.ref }
      })
      this.setState({ herbals })
    })
    firestore.collection('recipes').orderBy('createdAt').onSnapshot(({ docs: recipes }) => {
      this.setState({ recipes })
    })
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
    this.setState({ data: { ...this.state.data, diseaseRef } })
  }

  handleSelectHerbalChange = e => {
    const herbalRefs = e && e.map(item => {
      return item.ref
    })
    this.setState({ selectHerbals: e, data: { ...this.state.data, herbalRefs } })
  }

  handleHealChange = e => {
    const heal = e && e.value
    this.setState({ data: { ...this.state.data, heal } })
  }

  handleSubmit = () => {
    /** @type {firebase.firestore.Firestore} */
    const firestore = this.props.firestore
    const { data, updateDocSnapshot } = this.state

    this.setState({ updating: true })

    if (updateDocSnapshot) {
      updateDocSnapshot.ref.update({
        ...data,
        owner: 'Anonymous',
        modifyAt: firestore.FieldValue.serverTimestamp()
      }).then(() => {
        this.setState({ showAdd: false, updating: false, })
      })
      return
    }

    firestore.add({ collection: 'recipes' }, {
      ...data,
      owner: 'Anonymous',
      createdAt: firestore.FieldValue.serverTimestamp()
    }).then(doc => {
      console.log("doc:", doc)
      // if (data.diseaseRef) {
      //   return firestore.runTransaction(t => {
      //     return t.get(data.diseaseRef).then(disease_doc => {
      //       const prevRefs = disease_doc.data().recipeRefs || []
      //       t.update(data.diseaseRef, { recipeRefs: [...prevRefs, doc] })
      //     })
      //   }).then(result => {
      //     console.log("success", result)

      //     this.setState({
      //       updating: false,
      //     })
      //     this.props.onHide()
      //   }).catch(err => {
      //     console.log(err)
      //   })
      // }
      console.log("recipe added")
      this.setState({ updating: false, })
      // this.props.onHide()
    })
  }

  handleShowAdd = () => { this.setState({ showAdd: true }) }

  handleHideAdd = () => { this.setState({ showAdd: false }) }

  /**
* @param {firebase.firestore.DocumentSnapshot} snapshot
*/
  handleEdit = snapshot => {
    const data = snapshot.data()
    this.setState({
      data,
      showAdd: true,
      updateDocSnapshot: snapshot
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
    const { data, showAdd, diseases, selectHerbals, recipes, herbals, updating } = this.state
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

    if (showAdd) {
      modalSubTitle = "เพิ่มตำรับ"
      submittext = "บันทึก"
      showsubmit = "true"
      canceltext = "กลับ"
      onCancel = this.handleHideAdd

      modalBody = <RecipeForm
        data={data}
        herbals={herbals}
        selectHerbals={selectHerbals}
        diseases={diseases}
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
            <th style={{ width: "5%" }}>#</th>
            <th>ชื่อตำรับ</th>
            <th>รักษาโรค</th>
            <th>วิธีการ</th>
            {/* <th>สมุนไพร</th> */}
            <th style={{ width: "10%" }}>สาธารณะ</th>
            <th style={{ width: "10%" }}>เครื่องมือ</th>
          </tr>
        </thead>
        <tbody>
          {(recipes && recipes.length > 0 && recipes.map((recipe, index) => {
            const data = recipe.data()
            /** @type {firebase.firestore.DocumentReference} */
            const diseaseRef = data.diseaseRef
            diseaseRef.get().then(snapshot => {
              console.log(snapshot.data())
            })
            return <tr key={`recipe-${index}`}>
              <td className="text-center">{index + 1}</td>
              <td>{data.recipeName}</td>
              <td>{"diseaseName"}</td>
              <td>{data.heal}</td>
              {/* <td>{data.description}</td> */}
              <td>{data.showPublic ? "แสดง" : "ไม่แสดง"}</td>
              <td >
                <div style={{ alignSelf: "center" }} className="text-center">
                  <ToolButtons onDelete={() => handleDelete(recipe)} onEdit={() => handleEdit(recipe)} />
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

const RecipeForm = ({ data: { recipeName, description, showPublic, heal }, selectHerbals, diseases, herbals, onChange, handleShowPublicChange, handleDiseaseChange, onSelectHerbalChange, handleHealChange }) =>
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
          // defaultValue={}
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
          defaultValue={heal}
          name="heal_select"
          onChange={handleHealChange}
        />
      </Col>
    </Form.Group>

    <Form.Group as={Row}>
      <Form.Label column sm="2">ขั้นตอนการรักษา</Form.Label>
      <Col sm="10">
        <Form.Control as="textarea" rows="10" name="description" value={description} onChange={onChange} />
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
          defaultValue={selectHerbals}
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

const enhance = compose(
  withFirestore,
)

export default enhance(RecipeModal)
