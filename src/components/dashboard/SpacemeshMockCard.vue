<template>
  <div v-show='goodProfits?.length' class='mining-summary content-glass'>
    <div class='mining-heading'>
      <div class='product-page-icon'>
        <img :src='target?.Logo'>
      </div>
      <h3 class='mining-title'>
        {{ target?.Name }} ({{ $t('MSG_TESTNET') }})
      </h3>
    </div>
    <div class='warning'>
      <img :src='warning'>
      <span>{{ $t('MSG_TESTNET_WARNING', { COIN_NAME: target?.Name, COIN_UNIT: target?.Unit }) }}</span>
    </div>
    <div class='top-line-summary'>
      <div class='top-line-item'>
        <span class='label'>{{ $t('MSG_EARNINGS') }}:</span>
        <span class='value'>{{ _totalEarningCoin.toFixed(2) }} {{ target?.Unit }}</span>
        <span class='sub-value'>(* {{ PriceCoinName }})</span>
      </div>
      <div class='top-line-item'>
        <span class='label'>{{ $t('MSG_LAST_24_HOURS') }}:</span>
        <span class='value'>{{ _last24HoursEarningCoin.toFixed(2) }} {{ target?.Unit }}</span>
        <span class='sub-value'>(* {{ PriceCoinName }})</span>
      </div>
      <div class='top-line-item'>
        <span class='label'>{{ $t('MSG_CAPACITY') }}:</span>
        <span class='value'>{{ totalUnits }} {{ $t(goodUnit) }}</span>
      </div>
    </div>
    <q-slide-transition>
      <div class='detailed-summary' v-show='!short'>
        <div class='line'>
          <span class='label'>{{ $t('MSG_30_DAYS_AVERAGE_OUTPUT') }}:</span>
          <span class='value'>{{ _last30DaysDailyEarningCoin.toFixed(2) }} {{ target?.Unit }}</span>
        </div>
        <div class='line'>
          <span class='label'>{{ $t('MSG_TECHNIQUE_SERVICE_FEE') }}:</span>
          <span class='value'>{{ (_last24HoursEarningCoin * 0.2).toFixed(2) }} {{ target?.Unit }} (20%)</span>
        </div>
        <div class='line'>
          <span class='label'>{{ $t('MSG_30_DAYS_AVERAGE_NET_OUTPUT') }}:</span>
          <span class='value'>{{ (_last30DaysDailyEarningCoin * 0.8).toFixed(2) }} {{ target?.Unit }}</span>
        </div>
        <div class='line'>
          <span class='label'>{{ $t('MSG_SERVICE_PERIOD') }}:</span>
          <span class='value'>{{ goodPeriod }} {{ $t('MSG_DAYS') }}</span>
        </div>
        <div class='line'>
          <span class='label'>{{ $t('MSG_NETWORK_DAILY_OUTPUT') }}:</span>
          <span class='value'>{{ daily.toFixed(2) }} {{ target?.Unit }}</span>
        </div>
      </div>
    </q-slide-transition>
    <div class='buttons'>
      <button :class='[ "alt show-more", short ? "" : "open" ]' @click='onExpandClick'>
        <img :src='chevrons'>
      </button>
      <button class='alt' disabled>
        {{ $t('MSG_EXPORT_DAILY_OUTPUT_CSV') }}
      </button>
      <button @click='onPurchaseClick' disabled>
        {{ $t('MSG_PURCHASE_CAPACITY') }}
      </button>
    </div>
  </div>
</template>

<script setup lang='ts'>
import {
  NotificationType
} from 'npool-cli-v2'
import { AppCoin, useAdminAppCoinStore, useAdminAppGoodStore, useFrontendProfitStore, PriceCoinName } from 'npool-cli-v4'
import { useMockSpacemeshStore } from 'src/teststore'
import { computed, onMounted, ref, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import chevrons from '../../assets/chevrons.svg'
import warning from '../../assets/warning.svg'

// eslint-disable-next-line @typescript-eslint/unbound-method
const { t } = useI18n({ useScope: 'global' })

const coin = useAdminAppCoinStore()
const target = computed(() => coin.getAvailableCoins().find((el) => el.Name?.toLowerCase()?.includes('spacemesh')) as AppCoin)

const profit = useFrontendProfitStore()
const goodProfits = computed(() => profit.GoodProfits.GoodProfits.filter((el) => el.CoinTypeID === target?.value?.CoinTypeID))

const goodUnit = computed(() => goodProfits.value?.length ? goodProfits.value?.[0].GoodUnit : '')
const goodPeriod = computed(() => goodProfits.value?.length ? goodProfits.value?.[0].GoodServicePeriodDays : '')
const totalUnits = computed(() => goodProfits.value?.length ? goodProfits.value?.[0].Units : 0)

const good = useAdminAppGoodStore()
const total = computed(() => goodProfits.value?.length ? good.getGoodByID(goodProfits.value?.[0].GoodID)?.Total : 0)
const unitsRatio = computed(() => goodProfits.value?.length && total.value ? totalUnits.value / total.value : 0)
const daily = computed(() => spacemesh.getNetworkDailyOutput)

const short = ref(true)

const spacemesh = useMockSpacemeshStore()
const _last24HoursEarningCoin = computed(() => {
  return spacemesh.getLastDaysAvgOutput(unitsRatio.value, spacemesh.NetworkInfo?.epoch?.stats?.current?.accounts * 1.3)
})
const _last30DaysDailyEarningCoin = computed(() => {
  return spacemesh.get30DaysAvgOutput(unitsRatio.value, spacemesh.NetworkInfo?.epoch?.stats?.current?.accounts * 1.3)
})
const _totalEarningCoin = computed(() => {
  return spacemesh.getEarning(unitsRatio.value, spacemesh.NetworkInfo?.epoch?.stats?.current?.accounts * 1.3)
})

const ticker = ref(-1)

const router = useRouter()
const onPurchaseClick = () => {
  void router.push({ path: '/' })
}

const onExpandClick = () => {
  short.value = !short.value
}

onMounted(() => {
  ticker.value = window.setInterval(() => {
    updater()
  }, 30000)
  updater()
})

onUnmounted(() => {
  if (ticker.value >= 0) {
    window.clearInterval(ticker.value)
  }
})

const updater = () => {
  spacemesh.getNetworks({
    Message: {
      Error: {
        Title: t('MSG_GET_SPACEMESH_NETWORKS'),
        Message: t('MSG_GET_SPACEMESH_NETWORKS_FAIL'),
        Popup: true,
        Type: NotificationType.Error
      }
    }
  }, () => {
    spacemesh.getNetworkInfo({
      Message: {
        Error: {
          Title: t('MSG_GET_SPACEMESH_NETWORK_INFOS'),
          Message: t('MSG_GET_SPACEMESH_NETWORK_INFOS_FAIL'),
          Popup: true,
          Type: NotificationType.Error
        }
      }
    }, () => {
      // TODO
    })
  })
}
</script>
