import React from 'react'
import { TagItem } from "./TagItem"

export const FetchResultTag = ({ diseaseList, tags, onImageClick, onSubClick, showBy, onTagClick }) => {
    let tagList = {}

    diseaseList.forEach((snap, i) => {
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
                    onTagClick={onTagClick}
                />
            }
            return null

        })}

    </>
}