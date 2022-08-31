import React, { useState, useReducer } from 'react'
import PropTypes from 'prop-types'

import { useClient } from 'cozy-client'
import { useI18n } from 'cozy-ui/transpiled/react/I18n'
import TextField from 'cozy-ui/transpiled/react/MuiCozyTheme/TextField'
import { ConfirmDialog } from 'cozy-ui/transpiled/react/CozyDialogs'
import Button from 'cozy-ui/transpiled/react/Buttons'

import { TAGS_DOCTYPE } from 'doctypes'

const TagAddNewTagModal = ({ onClick, onClose, withLabel }) => {
  const client = useClient()
  const { t } = useI18n()
  const [label, setLabel] = useState('')
  const [isBusy, toggleBusy] = useReducer(prev => !prev, false)

  const handleChange = ev => {
    setLabel(ev.target.value.trim())
  }

  const handleClick = async () => {
    toggleBusy()

    const { data: tag } = await client.save({
      _type: TAGS_DOCTYPE,
      label
    })

    if (onClick) onClick(tag)
    onClose()
  }

  return (
    <ConfirmDialog
      open
      onClose={onClose}
      title={t('Tag.add-new-tag')}
      content={
        <TextField
          fullWidth
          margin="normal"
          {...(withLabel && { label: t('Tag.tag-name') })}
          variant="outlined"
          inputProps={{
            maxLength: 30,
            'data-testid': 'TagAddNewTagModal-TextField'
          }}
          autoFocus
          onChange={handleChange}
        />
      }
      actions={
        <>
          <Button
            fullWidth
            variant="secondary"
            label={t('Tag.addModal.actions.cancel')}
            onClick={onClose}
          />
          <Button
            fullWidth
            label={t('Tag.addModal.actions.submit')}
            busy={isBusy}
            disabled={label.length === 0}
            onClick={handleClick}
            data-testid="TagAddNewTagModal-Button-submit"
          />
        </>
      }
    />
  )
}

TagAddNewTagModal.defaultProps = {
  withLabel: true
}

TagAddNewTagModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onClick: PropTypes.func,
  withLabel: PropTypes.bool
}

export default TagAddNewTagModal
