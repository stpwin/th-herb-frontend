import { firebase } from "./config"
export const getDownloadUrl = (path, name) => {
  return `https://firebasestorage.googleapis.com/v0/b/${firebase.projectId}.appspot.com/o/${path}${name}?alt=media`
}

export const trimDownloadUrl = url => {

}