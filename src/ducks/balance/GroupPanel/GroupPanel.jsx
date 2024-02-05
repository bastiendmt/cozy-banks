import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useState, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import AccordionSummary from 'cozy-ui/transpiled/react/AccordionSummary'
import AccordionDetails from 'cozy-ui/transpiled/react/AccordionDetails'
import Box from 'cozy-ui/transpiled/react/Box'
import { withStyles } from 'cozy-ui/transpiled/react/styles'
import Accordion from 'cozy-ui/transpiled/react/Accordion'
import { useI18n } from 'cozy-ui/transpiled/react/providers/I18n'
import useBreakpoints from 'cozy-ui/transpiled/react/providers/Breakpoints'
import Figure from 'cozy-ui/transpiled/react/Figure'
import Switch from 'cozy-ui/transpiled/react/Switch'
import Typography from 'cozy-ui/transpiled/react/Typography'

import AccountsList from 'ducks/balance/AccountsList'
import { useFilters } from 'components/withFilters'
import { GroupEmpty } from 'ducks/balance/GroupEmpty'
import { getGroupBalance } from 'ducks/groups/helpers'
import { getGroupPanelSummaryClasses } from 'ducks/balance/GroupPanel/helpers'
import styles from 'ducks/balance/GroupPanel/GroupPanel.styl'

const GroupPanelSummary = withStyles(theme => ({
  root: {},
  expandIcon: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(0),
    color: theme.palette.grey[400]
  },
  expanded: {},
  content: {
    marginTop: 0,
    marginBottom: 0,
    paddingRight: 0,
    alignItems: 'stretch',
    // Do not put align-items: stretch on the root otherwise the expand icon
    // has the wrong size. Here, only the label takes all the vertical space.
    alignSelf: 'stretch',
    '&$expanded': {
      marginTop: 0,
      marginBottom: 0,
      paddingRight: 0
    }
  }
}))(AccordionSummary)

const NoTransition = props => {
  const { in: open, children } = props
  if (open) {
    return children
  } else {
    return null
  }
}

const GroupPanel = ({
  group,
  groupLabel,
  onChange,
  expanded: expandedProp,
  switches,
  onSwitchChange,
  checked,
  withBalance,
  className,
  initialVisibleAccounts
}) => {
  const navigate = useNavigate()
  const [optimisticExpanded, setOptimisticExpanded] = useState(expandedProp)
  const { t } = useI18n()
  const { isMobile } = useBreakpoints()
  const { filterByDoc } = useFilters()
  const groupPanelSummaryClasses = useSelector(state =>
    getGroupPanelSummaryClasses(group, state)
  )
  const goToGroupDetails = useCallback(() => {
    filterByDoc(group)
    navigate('/balances/details')
  }, [group, filterByDoc, navigate])

  const handleSummaryContentClick = useCallback(
    ev => {
      if (group.loading) return
      ev.stopPropagation()
      goToGroupDetails()
    },
    [goToGroupDetails, group.loading]
  )

  const handleSwitchClick = useCallback(e => {
    e.stopPropagation()
  }, [])

  const handlePanelChange = useCallback(
    async (event, expanded) => {
      // cozy-client does not do optimistic update yet
      // so we have to do it ourselves in the component
      setOptimisticExpanded(expanded)

      if (onChange) {
        await onChange(group._id, event, expanded)
      }
    },
    [onChange, group, setOptimisticExpanded]
  )

  const groupAccounts = group.accounts.data.filter(Boolean)
  const nbAccounts = groupAccounts.length
  const nbCheckedAccounts = Object.values(switches).filter(
    s => s.checked
  ).length
  const uncheckedAccountsIds = Object.keys(switches).filter(
    k => !switches[k].checked
  )

  const expanded =
    optimisticExpanded !== undefined ? optimisticExpanded : expandedProp
  const isUncheckable = !group.loading

  return (
    <Accordion
      className={className}
      expanded={expanded}
      onChange={handlePanelChange}
      TransitionComponent={NoTransition}
    >
      <GroupPanelSummary
        className={cx({
          [styles['GroupPanelSummary--unchecked']]: !checked && isUncheckable
        })}
        classes={groupPanelSummaryClasses}
      >
        <div
          className={styles.GroupPanelSummary__labelBalanceWrapper}
          onClick={handleSummaryContentClick}
        >
          <div className={styles.GroupPanelSummary__label}>
            {groupLabel}
            <br />
            {nbCheckedAccounts < nbAccounts && (
              <Typography
                className={styles.GroupPanelSummary__caption}
                variant="caption"
                color="textSecondary"
              >
                {t('Balance.nb-accounts', {
                  nbCheckedAccounts,
                  smart_count: nbAccounts
                })}
              </Typography>
            )}
          </div>
          {withBalance && (
            <Figure
              className="u-ml-half"
              symbol="€"
              total={getGroupBalance(group, uncheckedAccountsIds)}
              currencyClassName={styles.GroupPanelSummary__figureCurrency}
            />
          )}
        </div>
        <Box display="flex" alignItems="center">
          {onSwitchChange && (
            <Switch
              disableRipple
              className={!isMobile ? 'u-mr-half' : null}
              checked={checked}
              color="primary"
              onClick={handleSwitchClick}
              id={`[${group._id}]`}
              onChange={onSwitchChange}
            />
          )}
        </Box>
      </GroupPanelSummary>
      <AccordionDetails>
        <div className="u-flex-grow-1 u-maw-100">
          {groupAccounts && groupAccounts.length > 0 ? (
            <AccountsList
              group={group}
              switches={switches}
              onSwitchChange={onSwitchChange}
              initialVisibleAccounts={initialVisibleAccounts}
            />
          ) : (
            <GroupEmpty group={group} />
          )}
        </div>
      </AccordionDetails>
    </Accordion>
  )
}

export const DumbGroupPanel = GroupPanel

GroupPanel.propTypes = {
  group: PropTypes.object.isRequired,
  switches: PropTypes.object,
  checked: PropTypes.bool,
  expanded: PropTypes.bool.isRequired,
  onSwitchChange: PropTypes.func,
  onChange: PropTypes.func,
  withBalance: PropTypes.bool
}

GroupPanel.defaultProps = {
  withBalance: true
}

const MemoizedGroupPanel = React.memo(GroupPanel)

export { MemoizedGroupPanel as GroupPanel }