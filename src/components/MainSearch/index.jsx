import React, { Component } from 'react'
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withFirestore } from 'react-redux-firebase'

import { Jumbotron, InputGroup, FormControl, Container, Row, Col } from "react-bootstrap"
import { FaSearch } from "react-icons/fa"

let delayType;
const limit = 10
export class MainSearch extends Component {

  search = (text) => {
    // this.props.doSearch()
    /** @type {firebase.firestore.Firestore} */
    const firestore = this.props.firestore
    const diseasesFetch = firestore.collection('diseases').orderBy('diseaseName').orderBy('createdAt').startAt(text).endAt(text + '\uf8ff').where('showPublic', '==', true).limit(limit).get()
    const herbalsFetch = firestore.collection('herbals').orderBy('herbalName').orderBy('createdAt').startAt(text).endAt(text + '\uf8ff').where('showPublic', '==', true).limit(limit).get()
    Promise.all([herbalsFetch, diseasesFetch]).then(([herbalSnap, diseaseSnap]) => {
      this.props.doneSearch(herbalSnap.docs, diseaseSnap.docs)
    })
  }

  handleSearch = e => {
    if (e.target.value.length > 2) {
      this.props.doSearch()
      const value = e.target.value
      clearTimeout(delayType)
      delayType = setTimeout(() => {
        this.search(value)
      }, 1000)

    } else {
      clearTimeout(delayType)
      this.props.clearSearch()
    }
  }

  render() {
    return (
      <Jumbotron>
        <h1>ตำรับยาสมุนไพรไทย</h1>
        <p>ค้นหา โรค หรือ สมุนไพร</p>
        <div>
          <Container>
            <Row className="justify-content-md-center">
              <Col lg={7}>
                <InputGroup size="lg">
                  <InputGroup.Prepend>
                    <InputGroup.Text id="inputGroup-sizing-lg"><FaSearch /></InputGroup.Text>
                  </InputGroup.Prepend>
                  <FormControl aria-label="Large" aria-describedby="inputGroup-sizing-sm" onChange={this.handleSearch} />
                </InputGroup>
              </Col>
            </Row>
            <Row className="justify-content-md-center mt-3">
              <Col lg={7}>
                <p className="text-muted">จำนวนข้อมูลกว่า {`90,000`} โรค {`100,000`} ตำรับ และสมุนไพรกว่า {`1,000,000`} ชนิด</p>
              </Col>
            </Row>
          </Container>
        </div>
      </Jumbotron>
    )
  }
}

const mapStateToProps = state => ({
  // authUser: state.login.authUser,
});

const mapDispatchToProps = dispatch => ({
  doSearch: () =>
    dispatch({ type: 'DO_SEARCH' }),
  doneSearch: (herbalResult, diseaseResult) =>
    dispatch({ type: 'DONE_SEARCH', herbalResult, diseaseResult }),
  clearSearch: () =>
    dispatch({ type: 'CLEAR_SEARCH' }),
});

const enhance = compose(
  withFirestore,
  connect(mapStateToProps, mapDispatchToProps)
)


export default enhance(MainSearch)
