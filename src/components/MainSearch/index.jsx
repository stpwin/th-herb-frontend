import React, { Component } from 'react'
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withFirestore } from 'react-redux-firebase'

import { Jumbotron, InputGroup, FormControl, Container, Row, Col } from "react-bootstrap"
import { FaSearch } from "react-icons/fa"

let delayType;
export class MainSearch extends Component {

  search = (text) => {
    this.props.doSearch()
    /** @type {firebase.firestore.Firestore} */
    const firestore = this.props.firestore

    const fetchList = []
    const diseaseFetchList = []
    let listData = {}

    const recipesRef = firestore.collection('recipes')
    const diseasesFetch = firestore.collection('diseases').orderBy('diseaseName').orderBy('createdAt').where('showPublic', '==', true).startAt(text).endAt(text + '\uf8ff').get().then(snapshot => {
      // console.log("diseases", snapshot.size)
      // console.log(snapshot.docs)

      snapshot.docs.forEach((diseaseSnap) => {
        const diseaseFetch = diseaseSnap.ref.get().then(doc => {
          const diseaseData = doc.data()
          console.log(diseaseData)

          return recipesRef.where('diseaseRef', '==', diseaseSnap.ref).where('showPublic', '==', true).get().then(recipeSnaps => {
            // console.log('recipes', recipeSnaps.size)

            recipeSnaps.forEach(recipeDoc => {
              const recipeData = recipeDoc.data()
              const recipes = { ...(listData[diseaseData.diseaseName] && listData[diseaseData.diseaseName].recipes), [recipeDoc.id]: { ...recipeData } }
              listData[diseaseData.diseaseName] = { ...diseaseData, recipes }

            })


          }).catch(err => {
            console.warn(err)
          })
          // fetchList.push(recipesFetch)
        }).catch(err => {
          console.warn(err)
        })
        fetchList.push(diseaseFetch)
      })
    }).catch(err => {
      console.warn(err)
    })

    const herbalsFetch = firestore.collection('herbals').orderBy('herbalName').orderBy('createdAt').startAt(text).endAt(text + '\uf8ff').where('showPublic', '==', true).get().then(snapshot => {
      // console.log("herbals", snapshot.size)
      // console.log(snapshot.docs)
      snapshot.docs.forEach((herbalDoc) => {
        const herbalFetch = herbalDoc.ref.get().then(herbalSnap => {
          const herbalData = herbalSnap.data()

          return recipesRef.where('herbalRefs', 'array-contains', herbalDoc.ref).where('showPublic', '==', true).get().then(recipeSnaps => {
            recipeSnaps.forEach(recipeDoc => {
              const recipeData = recipeDoc.data()
              const diseaseRef = recipeData.diseaseRef

              const b = diseaseRef.get().then((diseaseDoc) => {
                if (diseaseDoc.exists) {
                  const { diseaseName } = diseaseDoc.data()
                  // console.log(diseaseName)
                  const recipes = { ...(listData[herbalData.herbalName] && listData[herbalData.herbalName].recipes), [recipeDoc.id]: { ...recipeData, diseaseName } }
                  listData[herbalData.herbalName] = { ...herbalData, recipes }
                }
              })
              diseaseFetchList.push(b)
            })

            // console.log('recipes', recipeSnaps.size)
          }).catch(err => {
            console.warn(err)
          })

        })

        fetchList.push(herbalFetch)
      })
    }).catch(err => {
      console.warn(err)
    })
    // fetchList.push(diseasesFetch)
    // fetchList.push(herbalsFetch)

    Promise.all([diseasesFetch, herbalsFetch]).then(() => {
      Promise.all(fetchList).then(() => {
        Promise.all(diseaseFetchList).then(() => {
          console.log("ALL done")
          console.log(listData)
          this.props.doneSearch(listData)
        })

      })

    })
  }



  handleSearch = e => {
    if (e.target.value.length > 2) {
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
  doneSearch: (result) =>
    dispatch({ type: 'DONE_SEARCH', result }),
  clearSearch: () =>
    dispatch({ type: 'CLEAR_SEARCH' }),
});

const enhance = compose(
  withFirestore,
  connect(mapStateToProps, mapDispatchToProps)
)


export default enhance(MainSearch)
