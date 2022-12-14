<template>
  <h2>{{ $t('MSG_DIRECT_AFFILIATES') }}</h2>
  <div class='direct-ref content-glass'>
    <div id='user-search'>
      <form action='javascript: void(0)' @submit='onSearchSubmit'>
        <div class='sub-form'>
          <h4>{{ $t('MSG_SEARCH_ACCOUNTS') }}</h4>
          <div class='search-wrap'>
            <input type='text' v-model='searchStr' :placeholder='$t("MSG_AFFILIATES_SEARCH_PLACEHOLDER")'>
            <button v-if='searchStr.length > 0' class='search-reset' type='reset' @click='onSearchResetClick'>
              &times;
            </button>
          </div>
        </div>
        <q-space />
        <div v-show='coins.length >= 1' id='product-filter'>
          <h4>{{ $t('MSG_PRODUCT_FILTER') }}</h4>
          <form>
            <CoinSelector
              v-model:id='selectedCoinID'
              :coins='coins'
              label=''
              hide-label
              default
              :name-index='0'
            />
          </form>
        </div>
      </form>
    </div>
    <div class='aff-table'>
      <table id='direct-ref-table'>
        <thead>
          <tr>
            <th><span>{{ $t('MSG_REFERRAL_ACCOUNT') }}</span></th>
            <th><span>{{ $t('MSG_JOIN_DATE') }}</span></th>
            <th><span>{{ $t('MSG_PURCHASE_AMOUNT') }}</span></th>
            <th><span>{{ $t('MSG_TOTAL_PAYMENT') }}</span></th>
            <th><span>{{ $t('MSG_COMMISSION') }}</span></th>
          </tr>
        </thead>
        <tbody>
          <!-- summary start -->
          <tr class='aff-info total-row'>
            <td><span class='aff-product'>{{ $t('MSG_TOTAL') }}</span></td>
            <td><span class='aff-number'><span class='unit'>{{ $t('MSG_NOT_AVAILABLE') }}</span></span></td>
            <td><span class='aff-number'>{{ totalUnits.toFixed(0) }}<span class='unit'>{{ goodUnit?.length ? $t(goodUnit) : '' }}</span></span></td>
            <td><span class='aff-number'>{{ totalAmount.toFixed(0) }}<span class='unit'>{{ PriceCoinName }}</span></span></td>
            <td><span class='aff-number'>{{ totalSuperiorCommission.toFixed(4) }}<span class='unit'>{{ PriceCoinName }}</span></span></td>
          </tr>
          <!-- summary end -->
          <tr class='aff-info' v-for='referral in pageReferrals' :key='referral.UserID'>
            <td>
              <span class='aff-product'>{{ archivement.subUsername(referral) }}</span>
              <img class='copy-button' :src='edit' @click='onSetKolClick(referral)'>
            </td>
            <td><span class='aff-number'>{{ joinDate(referral) }}<span class='unit'>{{ joinTime(referral) }}</span></span></td>
            <td><span class='aff-number'>{{ userTotalUnits(referral) }}<span class='unit'>{{ goodUnit?.length ? $t(goodUnit) : '' }}</span></span></td>
            <td><span class='aff-number'>{{ userTotalAmount(referral).toFixed(0) }}<span class='unit'>{{ PriceCoinName }}</span></span></td>
            <td><span class='aff-number'>{{ userSuperiorCommission(referral).toFixed(4) }}<span class='unit'>{{ PriceCoinName }}</span></span></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class='row'>
      <q-space />
      <div class='pagination'>
        <q-pagination
          dense
          color='white'
          active-color='orange-1'
          v-model='page'
          :max='pages'
          :max-pages='5'
          boundary-links
          direction-links
        />
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import edit from '../../assets/edit.svg'
import { computed, defineAsyncComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  useAdminAppCoinStore,
  useFrontendArchivementStore,
  UserArchivement,
  PriceCoinName
} from 'npool-cli-v4'

const CoinSelector = defineAsyncComponent(() => import('src/components/coin/CoinSelector.vue'))

const archivement = useFrontendArchivementStore()
const referrals = computed(() => archivement.notKolUsers().sort((a, b) => a.CreatedAt > b.CreatedAt ? -1 : 1))

const coin = useAdminAppCoinStore()
const coins = computed(() => coin.AppCoins.AppCoins.filter((el) => {
  const rfs = referrals.value?.filter((rel) => {
    for (const g of rel.Archivements) {
      if (g.CoinTypeID === el.CoinTypeID) return true
    }
    return false
  })
  return rfs.length > 0
}))
const selectedCoinID = ref(undefined as unknown as string)

const joinDate = computed(() => (referral: UserArchivement) => archivement.getJoinDate(referral))
const joinTime = computed(() => (referral: UserArchivement) => archivement.getJoinTime(referral))

const goodUnit = computed(() => {
  for (const rf of referrals.value) {
    for (const good of rf.Archivements) {
      if (good.CoinTypeID === selectedCoinID.value) {
        return good.GoodUnit
      }
    }
  }
  return ''
})
const totalUnits = computed(() => archivement.totalUnits(referrals.value, selectedCoinID.value))
const totalAmount = computed(() => archivement.totalAmount(referrals.value, selectedCoinID.value))
const totalSuperiorCommission = computed(() => archivement.totalSuperiorCommission(referrals.value, selectedCoinID.value))

const userTotalUnits = computed(() => (referral: UserArchivement) => archivement.userTotalUnits(referral.Archivements, selectedCoinID.value))
const userTotalAmount = computed(() => (referral: UserArchivement) => archivement.userTotalAmount(referral.Archivements, selectedCoinID.value))
const userSuperiorCommission = computed(() => (referral: UserArchivement) => archivement.userSuperiorCommission(referral.Archivements, selectedCoinID.value))

const searchStr = ref('')
const displayReferrals = computed(() => referrals.value.filter((el) => {
  return el.EmailAddress?.includes(searchStr.value) || el.PhoneNO?.includes(searchStr.value)
}))

const onSearchSubmit = () => {
  // DO NOTHING
}
const onSearchResetClick = () => {
  searchStr.value = ''
}

const page = ref(1)
const countPerPage = ref(10)
const pages = computed(() => Math.ceil(displayReferrals.value.length / countPerPage.value))

const pageReferrals = computed(() => displayReferrals.value.filter((el, index) => {
  return index >= (page.value - 1) * countPerPage.value && index < page.value * countPerPage.value
}))

const router = useRouter()
const onSetKolClick = (referral: UserArchivement) => {
  void router.push({
    path: '/setup/affiliate',
    query: {
      userID: referral.UserID
    }
  })
}
</script>

<style lang='sass' scoped>
.pagination
  max-width: 40%
</style>
