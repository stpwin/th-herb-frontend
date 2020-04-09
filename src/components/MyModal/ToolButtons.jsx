import React, { useState } from 'react'
import { FaTrash, FaEdit, FaSignOutAlt } from 'react-icons/fa'
import { Button } from 'react-bootstrap'

export function ToolButtons({ onDelete, onEdit }) {
  const [confirmDelete, setConfirm] = useState(0)

  function handleDelete() {
    if (!confirmDelete) {
      setConfirm(true)
      return
    }
    setConfirm(false)
    onDelete && onDelete()
  }

  return (
    <div>
      <Button size="sm" variant="outline-secondary" hidden={confirmDelete} onClick={() => onEdit()}> <FaEdit /></Button>{' '}
      <Button size="sm" variant={confirmDelete ? "danger" : "outline-danger"} onClick={handleDelete}><FaTrash /></Button>{' '}
      <Button size="sm" variant="outline-secondary" onClick={() => setConfirm(false)} hidden={!confirmDelete}><FaSignOutAlt /></Button>
    </div>
  )

}