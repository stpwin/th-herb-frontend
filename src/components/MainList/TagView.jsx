import React, { Component } from 'react'

import { Button } from 'react-bootstrap'

import { TagItem } from "./TagItem"

export class TagView extends Component {

    render() {
        return (
            <>
                <Button onClick={this.props.onGoBack}>กลับ</Button> <br />
                <TagItem
                    key={`media-${1}`}
                    uid={`media-${1}`}
                    prefix="ตำรับ"
                    title={`${this.props.tagName} (${this.props.items.length} รายการ)`}
                    subItems={this.props.items}
                    onImageClick={this.props.onImageClick}
                    onSubClick={this.props.onSubClick}
                    onTagClick={this.props.onTagClick}
                /><br />
                <Button onClick={this.props.onGoBack}>กลับ</Button>
            </>
        )
    }
}

export default TagView
