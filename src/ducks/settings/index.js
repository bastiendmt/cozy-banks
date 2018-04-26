import { fetchCollection, createDocument, updateDocument } from 'cozy-client'
import { merge } from 'lodash'
import Settings from './Settings'
import AccountSettings from './AccountSettings'
import AccountsSettings from './AccountsSettings'
import GroupSettings, { NewGroupSettings } from './GroupSettings'
import GroupsSettings from './GroupsSettings'
import { DOCTYPE, COLLECTION_NAME, DEFAULTS_SETTINGS } from './constants'

// components
export {
  Settings,
  AccountsSettings,
  AccountSettings,
  GroupsSettings,
  GroupSettings,
  NewGroupSettings
}

// actions
export const fetchSettingsCollection = () =>
  fetchCollection(COLLECTION_NAME, DOCTYPE)
export const createSettings = settings =>
  createDocument(DOCTYPE, settings, { updateCollections: [COLLECTION_NAME] })
export const updateSettings = settings => updateDocument(settings)
export const initSettings = () => createSettings(DEFAULTS_SETTINGS)

// utils
export const getSettings = settingsCollection => {
  if (
    settingsCollection &&
    settingsCollection.data &&
    settingsCollection.data.length > 0
  ) {
    const settings = settingsCollection.data[0]
    return merge(DEFAULTS_SETTINGS, settings)
  } else {
    return DEFAULTS_SETTINGS
  }
}
