import { useState, useEffect } from 'react'
import { useClient, Q } from 'cozy-client'
import { KONNECTOR_DOCTYPE } from 'doctypes'

const useBankingSlugs = () => {
  const client = useClient()
  const [bankingSlugs, setBankingSlugs] = useState([])
  const [isFetchingBankSlugs, setIsFetchingBankSlugs] = useState(true)

  useEffect(() => {
    const load = async () => {
      const bankingKonnectors = await client.query(
        Q(KONNECTOR_DOCTYPE).where({
          categories: {
            $elemMatch: {
              $eq: 'banking'
            }
          }
        })
      )
      const result = bankingKonnectors?.data?.map(konnector => konnector.slug)
      setBankingSlugs(result)
      setIsFetchingBankSlugs(false)
    }
    load()
  }, [client])

  const isBankTrigger = trigger =>
    bankingSlugs.includes(trigger?.message?.konnector)

  const isBankKonnector = job => {
    return bankingSlugs.includes(job?.konnector)
  }

  return { bankingSlugs, isBankTrigger, isBankKonnector, isFetchingBankSlugs }
}

export default useBankingSlugs
