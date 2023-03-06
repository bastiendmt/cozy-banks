import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import App from 'components/App'
import { isWebApp } from 'cozy-device-helper'

import { CategoriesPage } from 'ducks/categories'
import {
  Settings,
  AccountsSettings,
  GroupsSettings,
  ExistingGroupSettings,
  NewGroupSettings,
  TagsSettings,
  Configuration
} from 'ducks/settings'
import { Balance, BalanceDetailsPage } from 'ducks/balance'
import {
  DebugRecurrencePage,
  RecurrencesPage,
  RecurrencePage
} from 'ducks/recurrence'
import { TransferPage } from 'ducks/transfers'
import { SearchPage } from 'ducks/search'
import { AnalysisPage } from 'ducks/analysis'
import UserActionRequired from 'components/UserActionRequired'
import ScrollToTopOnMountWrapper from 'components/scrollToTopOnMount'
import PlannedTransactionsPage from 'ducks/future/PlannedTransactionsPage'
import SetFilterAndRedirect from 'ducks/balance/SetFilterAndRedirect'
import TagPage from 'ducks/tags/TagPage'
import Export from 'ducks/settings/Export'

// Use a function to delay instantation and have access to AppRoute.renderExtraRoutes
const AppRoute = () => (
  <Routes>
    <Route element={<UserActionRequired />}>
      <Route path="/" element={<App />}>
        {isWebApp() && (
          <Route index element={<Navigate to="balances" replace />} />
        )}
        <Route path="balances">
          <Route
            index
            element={
              <ScrollToTopOnMountWrapper>
                <Balance />
              </ScrollToTopOnMountWrapper>
            }
          />
          <Route
            path="details"
            element={
              <ScrollToTopOnMountWrapper>
                <BalanceDetailsPage />
              </ScrollToTopOnMountWrapper>
            }
          />
          <Route
            path="future"
            element={
              <ScrollToTopOnMountWrapper>
                <PlannedTransactionsPage />
              </ScrollToTopOnMountWrapper>
            }
          />
          <Route
            path=":accountOrGroupId/:page"
            element={<SetFilterAndRedirect />}
          />
        </Route>
        <Route
          path="categories/*"
          element={<Navigate to="../analysis/categories" replace />}
        ></Route>
        <Route
          path="recurrence/*"
          element={<Navigate to="../analysis/recurrence" replace />}
        ></Route>
        <Route
          path="analysis"
          element={
            <ScrollToTopOnMountWrapper>
              <AnalysisPage />
            </ScrollToTopOnMountWrapper>
          }
        >
          <Route path="categories">
            <Route
              index
              element={
                <ScrollToTopOnMountWrapper>
                  <CategoriesPage />
                </ScrollToTopOnMountWrapper>
              }
            />
            <Route
              path=":categoryName"
              element={
                <ScrollToTopOnMountWrapper>
                  <CategoriesPage />
                </ScrollToTopOnMountWrapper>
              }
            />
            <Route
              path=":categoryName/:subcategoryName"
              element={
                <ScrollToTopOnMountWrapper>
                  <CategoriesPage />
                </ScrollToTopOnMountWrapper>
              }
            />
          </Route>
          <Route path="recurrence">
            <Route
              index
              element={
                <ScrollToTopOnMountWrapper>
                  <RecurrencesPage />
                </ScrollToTopOnMountWrapper>
              }
            />
            <Route
              path=":bundleId"
              element={
                <ScrollToTopOnMountWrapper>
                  <RecurrencePage />
                </ScrollToTopOnMountWrapper>
              }
            />
          </Route>
        </Route>
        <Route path="settings">
          <Route
            path="configuration/export"
            element={<Navigate to="../export" replace />}
          />
          <Route path="export" element={<Export />} />
          <Route
            element={
              <ScrollToTopOnMountWrapper>
                <Settings />
              </ScrollToTopOnMountWrapper>
            }
          >
            <Route index element={<Configuration />} />
            <Route path="accounts" element={<AccountsSettings />} />
            <Route path="groups" element={<GroupsSettings />} />
            <Route path="tags" element={<TagsSettings />} />
            <Route path="configuration" element={<Configuration />} />
          </Route>
          <Route
            path="groups/new"
            element={
              <ScrollToTopOnMountWrapper>
                <NewGroupSettings />
              </ScrollToTopOnMountWrapper>
            }
          />
          <Route
            path="groups/:groupId"
            element={
              <ScrollToTopOnMountWrapper>
                <ExistingGroupSettings />
              </ScrollToTopOnMountWrapper>
            }
          />
          <Route
            path="accounts/:accountId"
            element={<Navigate to="../accounts" replace />}
          />
        </Route>
        <Route
          path="tag/:tagId"
          element={
            <ScrollToTopOnMountWrapper>
              <TagPage />
            </ScrollToTopOnMountWrapper>
          }
        />
        <Route
          path="transfers"
          element={
            <ScrollToTopOnMountWrapper>
              <TransferPage />
            </ScrollToTopOnMountWrapper>
          }
        />
        <Route
          path="search"
          element={
            <ScrollToTopOnMountWrapper>
              <SearchPage />
            </ScrollToTopOnMountWrapper>
          }
        />
        <Route
          path="search/:search"
          element={
            <ScrollToTopOnMountWrapper>
              <SearchPage />
            </ScrollToTopOnMountWrapper>
          }
        />
        <Route
          path="recurrencedebug"
          element={
            <ScrollToTopOnMountWrapper>
              <DebugRecurrencePage />
            </ScrollToTopOnMountWrapper>
          }
        />
        {AppRoute.renderExtraRoutes()}
        {isWebApp() && (
          <Route path="*" element={<Navigate to="balances" replace />} />
        )}
      </Route>
    </Route>
  </Routes>
)

// Ability to overrides easily
AppRoute.renderExtraRoutes = () => null

export default AppRoute
