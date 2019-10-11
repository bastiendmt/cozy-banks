import {
  buildAutoGroups,
  getGroupLabel,
  translateAndSortGroups,
  renamedGroup
} from './helpers'
import { associateDocuments } from 'ducks/client/utils'
import { ACCOUNT_DOCTYPE } from 'doctypes'

describe('buildAutoGroups', () => {
  it('should generate a virtual group for every account types', () => {
    const accounts = [
      { _id: '1', type: 'Checkings' },
      { _id: '2', type: 'Savings' },
      { _id: '3', type: 'Other' },
      { _id: '4', type: 'TotallyUnkownType' },
      { _id: '5' }
    ]

    const virtualGroups = buildAutoGroups(accounts)

    const checkingsGroup = {
      _id: 'Checkings',
      _type: 'io.cozy.bank.groups',
      label: 'Checkings',
      virtual: true,
      accountType: 'Checkings'
    }

    const savingsGroup = {
      _id: 'Savings',
      _type: 'io.cozy.bank.groups',
      label: 'Savings',
      virtual: true,
      accountType: 'Savings'
    }

    const otherGroup = {
      _id: 'Other',
      _type: 'io.cozy.bank.groups',
      label: 'Other',
      virtual: true,
      accountType: 'Other'
    }

    associateDocuments(checkingsGroup, 'accounts', ACCOUNT_DOCTYPE, [
      accounts[0]
    ])
    associateDocuments(savingsGroup, 'accounts', ACCOUNT_DOCTYPE, [accounts[1]])
    associateDocuments(otherGroup, 'accounts', ACCOUNT_DOCTYPE, [
      accounts[2],
      accounts[3],
      accounts[4]
    ])

    const expected = [checkingsGroup, savingsGroup, otherGroup]

    expect(virtualGroups).toEqual(expected)
  })
})

describe('translateGroup', () => {
  const translate = jest.fn(key => key)

  afterEach(() => {
    translate.mockReset()
  })

  it("should translate the group label only if it's a virtual group", () => {
    const virtualGroup = {
      virtual: true,
      label: 'label'
    }

    const normalGroup = {
      virtual: false,
      label: 'label'
    }

    expect(getGroupLabel(virtualGroup, translate)).toEqual(
      'Data.accountTypes.label'
    )
    expect(getGroupLabel(normalGroup, translate)).toEqual(normalGroup.label)
  })
})

describe('translateAndSortGroups', () => {
  const translate = jest.fn(key => key)

  afterEach(() => {
    translate.mockClear()
  })

  const setup = groups => {
    // Merge translated label into the group for easier testing
    return translateAndSortGroups(groups, translate).map(groupAndLabel => ({
      ...groupAndLabel.group,
      label: groupAndLabel.label
    }))
  }

  it('should sort groups by translated label', () => {
    const groups = [
      { virtual: true, label: 'C' },
      { virtual: false, label: 'A' },
      { virtual: false, label: 'B' },
      { virtual: false, label: 'Z' },
      { virtual: false, label: 'é' }
    ]

    const expected = [
      { virtual: false, label: 'A' },
      { virtual: false, label: 'B' },
      { virtual: true, label: 'Data.accountTypes.C' },
      { virtual: false, label: 'é' },
      { virtual: false, label: 'Z' }
    ]

    expect(setup(groups)).toEqual(expected)
  })

  it('should put group with label "Other" at the end', () => {
    const groups = [
      { virtual: false, label: 'B' },
      { virtual: false, label: 'A' },
      { virtual: true, label: 'Other' },
      { virtual: true, label: 'Z' }
    ]

    const expected = [
      { virtual: false, label: 'A' },
      { virtual: false, label: 'B' },
      { virtual: true, label: 'Data.accountTypes.Z' },
      { virtual: true, label: 'Data.accountTypes.Other' }
    ]

    expect(setup(groups)).toEqual(expected)
  })

  it('should put reimbursements virtual group at the end', () => {
    const groups = [
      { virtual: false, label: 'A' },
      { _id: 'Reimbursements', virtual: true, label: 'Reimbursements' },
      { virtual: true, label: 'Other' },
      { virtual: true, label: 'Z' }
    ]

    const expected = [
      { virtual: false, label: 'A' },
      { virtual: true, label: 'Data.accountTypes.Z' },
      { virtual: true, label: 'Data.accountTypes.Other' },
      {
        _id: 'Reimbursements',
        virtual: true,
        label: 'Data.accountTypes.Reimbursements'
      }
    ]

    expect(setup(groups)).toEqual(expected)
  })
})

describe('when the given group has an accountType', () => {
  it('should not set accountType to null', () => {
    const group = { accountType: 'checkings' }

    expect(renamedGroup(group, 'My super group')).toEqual({
      label: 'My super group',
      accountType: null
    })
  })
})

describe('when the given group does not have an accountType', () => {
  it('should not set accountType to null', () => {
    const group = { label: 'My group' }

    expect(renamedGroup(group, 'My super group')).toEqual({
      label: 'My super group'
    })
  })
})
