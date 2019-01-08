import React from 'react'
import PropTypes from 'prop-types'
import GroupPanel from './components/GroupPanel'
import { sortBy, flowRight as compose } from 'lodash'
import { translate, ButtonAction } from 'cozy-ui/react'
import { withRouter } from 'react-router'
import AddAccountLink from 'ducks/settings/AddAccountLink'
import styles from './BalancePanels.styl'

class BalancePanels extends React.PureComponent {
  static propTypes = {
    groups: PropTypes.arrayOf(PropTypes.object).isRequired,
    router: PropTypes.object.isRequired
  }

  goToGroupsSettings = () => this.props.router.push('/settings/groups')

  render() {
    const { groups, t } = this.props

    const groupsSorted = sortBy(
      groups.map(group => ({
        ...group,
        label: group.virtual
          ? t(`Data.accountTypes.${group.label}`)
          : group.label
      })),
      group => group.label
    )

    return (
      <div>
        {groupsSorted.map(group => (
          <GroupPanel key={group._id} group={group} />
        ))}
        <div className={styles.BalancePanels__actions}>
          <AddAccountLink>
            <ButtonAction
              type="new"
              label={t('Accounts.add-account')}
              className={styles.BalancePanels__action}
            />
          </AddAccountLink>
          <ButtonAction
            onClick={this.goToGroupsSettings}
            type="normal"
            label={t('Groups.manage-groups')}
            className={styles.BalancePanels__action}
          />
        </div>
      </div>
    )
  }
}

export default compose(
  translate(),
  withRouter
)(BalancePanels)