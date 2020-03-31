import React, { Component } from 'react'

import MediaItem from "./MediaItem"

export default class MediaList extends Component {
    render() {
        return (
            <ul className="list-unstyled">
                <MediaItem />
                <MediaItem />
                <MediaItem />
            </ul>
        )
    }
}
