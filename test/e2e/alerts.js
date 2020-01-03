/* eslint-disable no-console */

import { spawnSync } from 'child_process'
import { ArgumentParser } from 'argparse'
import isMatch from 'lodash/isMatch'
import pick from 'lodash/pick'
import pickBy from 'lodash/pickBy'
import omit from 'lodash/omit'

import { createClientInteractive } from 'cozy-client/dist/cli'
import {
  ACCOUNT_DOCTYPE,
  TRANSACTION_DOCTYPE,
  SETTINGS_DOCTYPE,
  GROUP_DOCTYPE,
  BILLS_DOCTYPE
} from '../../src/doctypes'
import { importData } from './dataUtils'
import { question } from './interactionUtils'
import Mailhog from 'mailhog'
import MockServer from './mock-server'
import scenarios from './scenarios'

const SOFTWARE_ID = 'banks.alerts-e2e'

const revokeOtherOAuthClientsForSoftwareId = async (client, softwareID) => {
  const { data: clients } = await client.stackClient.fetchJSON(
    'GET',
    `/settings/clients`
  )
  const currentOAuthClientId = client.stackClient.oauthOptions.clientID
  const otherOAuthClients = clients.filter(
    oauthClient =>
      oauthClient.attributes.software_id === softwareID &&
      oauthClient.id !== currentOAuthClientId
  )
  for (let oauthClient of otherOAuthClients) {
    await client.stackClient.fetchJSON(
      'DELETE',
      `/settings/clients/${oauthClient.id}`
    )
  }
}

const parseArgs = () => {
  const parser = new ArgumentParser()
  parser.addArgument('--url', { defaultValue: 'http://cozy.tools:8080' })
  parser.addArgument(['-v', '--verbose'], { action: 'storeTrue' })
  parser.addArgument(['--push'], { action: 'storeTrue' })
  parser.addArgument('scenario')
  return parser.parseArgs()
}

const decodeEmail = (mailhog, attrs) =>
  attrs
    ? {
        ...attrs,
        subject: attrs.subject.replace(/_/g, ' ')
      }
    : attrs

const runService = async options => {
  const env = {
    ...process.env,
    IS_TESTING: 'test'
  }
  const processOptions = pickBy(
    {
      stdio: options.showOutput ? 'inherit' : undefined,
      env
    },
    Boolean
  )
  const res = spawnSync(
    'node',
    ['build/onOperationOrBillCreate'],
    processOptions
  )

  if (res.status !== 0) {
    console.error(`Error: onOperationOrBillCreate exited with 1.`)
    if (!options.showOutput) {
      console.error(`Re-run with -v to see its output.`)
    }
    throw new Error('Error while running onOperationOrBillCreate')
  }
}

const expectMatch = (expected, received) => {
  if (expected === null) {
    if (!received) {
      return true
    } else {
      console.error('Error: expected null but received something')
      console.log('Received', received)
      return false
    }
  }
  const isMatching = isMatch(received, expected)
  if (isMatching) {
    return true
  } else {
    console.error('Error:', received, 'does not match expected', expected)
    return false
  }
}

const checkEmailForScenario = async (mailhog, scenario) => {
  const latestMessages = (await mailhog.messages(0, 1)).items
  const email = decodeEmail(
    mailhog,
    latestMessages.length > 0 ? pick(latestMessages[0], ['subject']) : null
  )
  return expectMatch(email, scenario.expected.email)
}

const checkPushForScenario = async (pushServer, scenario) => {
  let lastReq
  try {
    await pushServer.waitForRequest({ timeout: 5000 })
    lastReq = pushServer.getLastRequest()
  } catch (e) {
    // eslint-disable-line empty-catch
  }
  if (scenario.expected.notification !== undefined) {
    return expectMatch(scenario.expected.notification, lastReq && lastReq.body)
  } else {
    const answer = await question('Is scenario OK (y|n) ? ')
    return answer === 'y'
  }
}

const runScenario = async (client, scenarioId, options) => {
  console.log('Running scenario', scenarioId)
  const scenario = scenarios[scenarioId]
  await importData(client, scenario.data)

  if (options.mailhog) {
    await options.mailhog.deleteAll()
  }
  if (options.pushServer) {
    options.pushServer.clearRequests()
  }

  console.log('Running service...')
  try {
    await runService(options)
  } catch (e) {
    return false
  }

  console.log('Description: ', scenario.description)

  if (options.mailhog) {
    const emailMatch = await checkEmailForScenario(options.mailhog, scenario)
    return emailMatch
  } else {
    const pushMatch = await checkPushForScenario(options.pushServer, scenario)
    return pushMatch
  }
}

const cleanupDatabase = async client => {
  for (let doctype of [
    SETTINGS_DOCTYPE,
    TRANSACTION_DOCTYPE,
    ACCOUNT_DOCTYPE,
    GROUP_DOCTYPE,
    BILLS_DOCTYPE
  ]) {
    const col = client.collection(doctype)
    console.log(`Fetching docs ${doctype}`)
    const { data: docs } = await col.getAll()
    if (docs.length > 0) {
      console.log(`Cleaning ${docs.length} ${doctype} documents`)
      // The omit for _type can be removed when the following PR is resolved
      // https://github.com/cozy/cozy-client/pull/597
      await col.destroyAll(docs.map(doc => omit(doc, '_type')))
    }
  }
}

const main = async () => {
  const args = parseArgs()
  const client = await createClientInteractive({
    uri: args.url,
    scope: [
      'io.cozy.oauth.clients:ALL',
      SETTINGS_DOCTYPE,
      TRANSACTION_DOCTYPE,
      ACCOUNT_DOCTYPE,
      GROUP_DOCTYPE,
      BILLS_DOCTYPE
    ],
    oauth: {
      softwareID: SOFTWARE_ID
    }
  })

  await revokeOtherOAuthClientsForSoftwareId(client, SOFTWARE_ID)

  if (args.push) {
    const clientInfos = client.stackClient.oauthOptions
    await client.stackClient.updateInformation({
      ...clientInfos,
      notificationPlatform: 'android',
      notificationDeviceToken: 'fake-token'
    })
  }

  const allScenarioIds = Object.keys(scenarios)
  const scenarioIds =
    args.scenario === 'all'
      ? allScenarioIds
      : allScenarioIds.filter(x => x.startsWith(args.scenario))

  const mailhog = args.push ? null : Mailhog({ host: 'localhost' })
  const pushServer = args.push ? new MockServer() : null
  if (pushServer) {
    await pushServer.listen()
  }

  const answers = {}
  for (const scenarioId of scenarioIds) {
    await cleanupDatabase(client)
    const res = await runScenario(client, scenarioId, {
      showOutput: args.verbose,
      mailhog,
      pushServer: pushServer
    })
    answers[scenarioId] = res
  }

  for (const [scenarioId, answer] of Object.entries(answers)) {
    console.log(
      answer ? '✅' : '❌',
      scenarioId,
      `(${scenarios[scenarioId].description})`
    )
  }

  await pushServer.close()
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .then(() => {
    process.exit(0)
  })
