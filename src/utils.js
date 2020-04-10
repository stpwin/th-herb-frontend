import { firebase } from "./config"
import { get, set } from 'lodash'
export const getDownloadUrl = (path, name) => {
  return `https://firebasestorage.googleapis.com/v0/b/${firebase.projectId}.appspot.com/o/${path}%2F${name}?alt=media`
}

export const trimDownloadUrl = url => {

}


const getReference = async documentReference => {
  const res = await documentReference.get()
  const data = res.data()

  if (data && documentReference.id) {
    data.uid = documentReference.id
  }

  return data
}

export const hydrate = async (document, paths = []) => Promise.all(
  paths.map(async path => {
    const documentReference = get(document, path)

    if (!documentReference || !documentReference.path) {
      return console.warn(
        `Error hydrating documentReference for path "${path}": Not found or invalid reference`
      )
    }

    const result = await getReference(documentReference)
    set(document, path, result)
  })
)