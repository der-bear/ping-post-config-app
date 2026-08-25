import { useDeliveryMethodStore } from './store'

export interface DeliveryMethodCreationData {
  method: string
  description: string
  leadType: string
}

/** Resets the prototype store and prepares the editor for the selected delivery method. */
export function initializeDeliveryMethod(data: DeliveryMethodCreationData) {
  const initialStore = useDeliveryMethodStore.getState()
  initialStore.resetStore()

  const store = useDeliveryMethodStore.getState()
  const methodType = data.method === 'http-webhook' ? 'http-webhook' : 'ping-post'

  store.updateGeneral({
    methodType,
    description: data.description,
    leadType: data.leadType,
  })

  if (methodType !== 'http-webhook') return

  store.replacePostMappings([])
  store.updatePostMappings({ includeMappingsFromPing: false, expressIdMapping: '' })
  store.updatePostRequestBody(
    JSON.stringify(
      {
        first_name: '[f_name]',
        last_name: '[l_name]',
        email: '[email]',
        phone: '[phone]',
        address: '[address]',
        city: '[srv_city]',
        state: '[state]',
        dob: '[dob]',
        income: '[income]',
      },
      null,
      2,
    ),
  )
  store.updatePostUrlEndpoint({
    contentTypeSameAsPing: false,
    timeoutSameAsPing: false,
    includeHeadersFromPing: false,
  })
  store.updatePostAuth({ sameAsPing: false })
  store.updatePostRetrySettings({ sameAsPing: false })
  store.setActivePanel({ section: 'post', tab: 'url-endpoint' })
  if (!store.isPostExpanded) store.togglePostExpanded()
}
