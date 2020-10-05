import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { Stack, useI18n } from 'cozy-ui/transpiled/react'
import useList from './useList'
import { getRuleId, getNextRuleId } from './ruleUtils'
import AddRuleButton from 'ducks/settings/AddRuleButton'

export { AddRuleButton }

/**
 * Displays a list of rules and allows to create or edit one
 *
 * Manages the stack of rules, the button to add a rule and the edition
 * modal
 */
const Rules = ({
  rules,
  children,
  onUpdate,
  onError,
  addButtonLabelKey,
  ItemEditionModal,
  makeNewItem
}) => {
  const { t } = useI18n()
  const [items, createOrUpdate, remove] = useList({
    list: rules,
    onUpdate,
    onError,
    getId: getRuleId,
    getNextId: getNextRuleId
  })
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleCreateItem = useCallback(
    async newItem => {
      setCreating(false)
      try {
        setSaving(true)
        await createOrUpdate(newItem)
      } finally {
        setSaving(false)
      }
    },
    [createOrUpdate, setSaving, setCreating]
  )

  const handleAddRule = useCallback(() => {
    setCreating(true)
  }, [setCreating])

  return (
    <>
      {items.length > 0 ? (
        <Stack spacing="xs">
          {items
            ? items.map((item, i) => children(item, i, createOrUpdate, remove))
            : null}
        </Stack>
      ) : null}
      {creating ? (
        <ItemEditionModal
          onDismiss={() => setCreating(false)}
          initialDoc={makeNewItem()}
          onEdit={handleCreateItem}
        />
      ) : null}
      <AddRuleButton
        label={t(addButtonLabelKey)}
        busy={saving}
        onClick={handleAddRule}
      />
    </>
  )
}

Rules.propTypes = {
  rules: PropTypes.array.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  addButtonLabelKey: PropTypes.string.isRequired,
  makeNewItem: PropTypes.func.isRequired,
  ItemEditionModal: PropTypes.elementType.isRequired
}

export default Rules
