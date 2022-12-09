import React from 'react'
import { Outlet } from 'react-router-dom'
import AnalysisTabs from 'ducks/analysis/AnalysisTabs'
import useBreakpoints from 'cozy-ui/transpiled/react/hooks/useBreakpoints'
import { useLocation } from 'components/RouterContext'

/**
 * Renders its children
 *
 * - On mobile, render the AnalysisTabs
 */
const AnalysisPage = () => {
  const { isMobile } = useBreakpoints()
  const location = useLocation()
  return (
    <>
      {isMobile ? <AnalysisTabs location={location} /> : null}
      <Outlet />
    </>
  )
}

export default AnalysisPage
