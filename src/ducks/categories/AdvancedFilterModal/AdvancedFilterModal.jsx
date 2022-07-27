import React, { useState } from 'react'
import PropTypes from 'prop-types'

import { useI18n } from 'cozy-ui/transpiled/react/I18n'
import { ConfirmDialog } from 'cozy-ui/transpiled/react/CozyDialogs'
import Button from 'cozy-ui/transpiled/react/Buttons'
import List from 'cozy-ui/transpiled/react/MuiCozyTheme/List'
import Divider from 'cozy-ui/transpiled/react/MuiCozyTheme/Divider'
import Overlay from 'cozy-ui/transpiled/react/Overlay'
import Spinner from 'cozy-ui/transpiled/react/Spinner'
import { isQueryLoading, useQueryAll } from 'cozy-client'

import { tagsConn } from 'doctypes'
import IncomeListItem from 'ducks/categories/AdvancedFilterModal/IncomeListItem'
import TagListItem from 'components/Tag/TagListItem'
import TagListItem from 'ducks/categories/CategoriesTags/TagListItem'

const AdvancedFilterModal = ({
  onClose,
  onConfirm,
  withIncome,
  setSelectedTags,
  selectedTags
}) => {
  const [isWithIncomeChecked, setIsWithIncomeChecked] = useState(withIncome)
  const [tagListSelected, setTagListSelected] = useState(selectedTags)
  const { t } = useI18n()
  const { data: tags, ...tagsQueryRest } = useQueryAll(tagsConn.query, tagsConn)
  const isLoading = isQueryLoading(tagsQueryRest) || tagsQueryRest.hasMore

  const toogleIncome = () => {
    setIsWithIncomeChecked(prev => !prev)
  }

  const handleConfirm = () => {
    onConfirm(isWithIncomeChecked)
    setSelectedTags(tagListSelected)
    onClose()
  }

  const handleDeleteTag = tagToDelete => {
    const newTagList = tagListSelected.filter(
      tagSelected => tagSelected._id !== tagToDelete._id
    )
    setTagListSelected(newTagList)
  }
  const handleConfirmSelectedTag = selectedTagIds => {
    setTagListSelected(selectedTagIds)
  }

  if (isLoading) {
    return (
      <Overlay className="u-flex u-flex-items-center u-flex-justify-center">
        <Spinner size="xlarge" color="white" />
      </Overlay>
    )
  }

  return (
    <ConfirmDialog
      open
      onClose={onClose}
      title={t('Categories.filter.advancedFilters.title')}
      content={
        <List style={{ margin: '0 -1rem 0 -0.5rem' }}>
          <IncomeListItem
            onChange={toogleIncome}
            value={!isWithIncomeChecked}
          />
          <Divider variant="inset" component="li" />
          <TagListItem
            tags={tags}
            tagListSelected={tagListSelected}
            disableGutters
            onDelete={handleDeleteTag}
            onConfirm={handleConfirmSelectedTag}
          />
        </List>
      }
      actions={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            label={t('General.cancel')}
          />
          <Button label={t('General.apply')} onClick={handleConfirm} />
        </>
      }
    />
  )
}

AdvancedFilterModal.prototype = {
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
  withIncome: PropTypes.bool
}

export default AdvancedFilterModal
