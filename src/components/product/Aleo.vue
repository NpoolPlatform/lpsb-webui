<template>
  <ProductPage
    :app-good-id='(appGoodID as string)'
    :purchase-amount='purchaseAmount'
    project-class='project-aleo'
    bg-img='product/aleo/aleo-banner.jpg'
    :customize-info='true'
  >
    <template #product-info>
      <div class='three-section'>
        <h4>{{ $t('MSG_PRICE') }}:</h4>
        <span class='number'>{{ utils.getLocaleString(sdk.appPowerRental.unitPrice(appGoodID as string) as string) }}</span>
        <span class='unit'>{{ constant.PriceCoinName }}</span>
        <div class='tooltip'>
          <img class='more-info' :src='question'><span>{{ $t('MSG_LEARN_MORE') }}</span>
          <p class='tooltip-text'>
            {{ $t('MSG_PRICE_TIP') }}
          </p>
        </div>
      </div>
      <div class='three-section'>
        <h4>{{ $t('MSG_DAILY_MINING_REWARDS') }}:</h4>
        <span class='number'>*</span>
        <span class='unit'>{{ sdk.appPowerRental.mainCoinUnit(target?.AppGoodID as string) }} / {{ $t('MSG_DAY') }}</span>
        <div class='tooltip'>
          <img class='more-info' :src='question'><span>{{ $t('MSG_LEARN_MORE') }}</span>
          <p class='tooltip-text'>
            {{ $t('MSG_DAILY_REWARD_TIP') }}
          </p>
        </div>
      </div>
      <div class='three-section'>
        <h4>{{ $t('MSG_SERVICE_PERIOD') }}:</h4>
        <span class='number'>{{ utils.getLocaleString(sdk.appPowerRental.minOrderDurationDays(target?.AppGoodID as string)) }}</span>
        <span class='unit'>{{ $t('MSG_DAYS') }}</span>
        <div class='tooltip'>
          <img class='more-info' :src='question'><span>{{ $t('MSG_LEARN_MORE') }}</span>
          <p class='tooltip-text'>
            {{ $t('MSG_SERVICE_PERIOD_TIP') }}
          </p>
        </div>
      </div>
      <div class='three-section'>
        <h4>{{ $t('MSG_TECHNIQUE_SERVICE_FEE') }}:</h4>
        <span class='number'>{{ techServiceFeePercent }}</span>
        <span class='unit'>%</span>
        <div class='tooltip'>
          <img class='more-info' :src='question'><span>{{ $t('MSG_LEARN_MORE') }}</span>
          <p class='tooltip-text'>
            {{ $t('MSG_TECHNIQUE_SERVICE_FEE_TIP') }}
          </p>
        </div>
      </div>
      <div class='three-section'>
        <h4>{{ $t('MSG_ORDER_EFFECTIVE') }}:</h4>
        <span class='number'>{{ true ? 'TBD*' : utils.formatTime(target?.ServiceStartAt as number, 'YYYY/MM/DD') }}</span>
        <div class='tooltip'>
          <img class='more-info' :src='question'><span>{{ $t('MSG_LEARN_MORE') }}</span>
          <p class='tooltip-text'>
            {{ $t('MSG_ORDER_EFFECTIVE_TIP') }}
          </p>
        </div>
      </div>
      <div class='three-section' v-if='sdk.appPowerRental.canBuy(target?.AppGoodID as string)'>
        <h4>{{ $t("MSG_SALE_END_DATE") }}</h4>
        <span class='number'>{{ sdk.appPowerRental.saleEndDate(target?.AppGoodID as string) }}</span>
        <br>
        <span class='unit'>{{ sdk.appPowerRental.saleEndTime(target?.AppGoodID as string) }} {{ $t("MSG_JST") }}</span>
        <div class='tooltip'>
          <img class='more-info' src='font-awesome/question.svg'><span>{{ $t('MSG_LEARN_MORE') }}</span>
          <p class='tooltip-text'>
            {{ $t('MSG_SALE_END_DATE_TIP') }}
          </p>
        </div>
      </div>
      <div class='hr' />
    </template>
    <template #product-detail>
      <div v-if='__locale === "en-US"'>
        <ProductDetailUS />
      </div>
      <div v-else>
        <ProductDetailJP />
      </div>
    </template>
    <template #sidebar>
      <div id='project-links' class='product-sidebar-section'>
        <h3 class='form-title'>
          {{ $t('MSG_PROJECT_LINKS') }}
        </h3>
        <ul class='product-links'>
          <li>
            <a href='https://www.aleo.org/' target='_blank'><img class='link-icon' src='font-awesome/homepage.svg'>
              <span>{{ $t('MSG_ALEO_HOMEPAGE') }}</span>
            </a>
          </li>
          <li>
            <a href='https://twitter.com/AleoHQ' target='_blank'><img class='link-icon' src='font-awesome/twitter.svg'>
              <span>{{ $t('MSG_TWITTER') }}</span>
            </a>
          </li>
          <li>
            <a href='https://www.youtube.com/channel/UCS_HKT2heOC_q88YQLiJt0g' target='_blank'><img class='link-icon' src='font-awesome/youtube.svg'>
              <span>{{ $t('MSG_YOUTUBE') }}</span>
            </a>
          </li>
          <li>
            <a href='https://discord.com/invite/aleohq' target='_blank'><img class='link-icon' src='font-awesome/discord.svg'>
              <span>{{ $t('MSG_DISCORD') }}</span>
            </a>
          </li>
          <li>
            <a href='https://github.com/AleoHQ' target='_blank'><img class='link-icon' src='font-awesome/github.svg'>
              <span>{{ $t('MSG_GITHUB') }}</span>
            </a>
          </li>
        </ul>
      </div>
      <!-- <div id='help' class='product-sidebar-section'>
        <h3 class='form-title'>
          {{ $t('MSG_PRODUCT_FAQ') }}
        </h3>
        <ul class='product-links'>
          <li>
            <a href='https://www.youtube.com/watch?v=xHIXUVhCLMY' target='_blank'>
              <img class='link-icon' :src='lightbulb'>
              <span>{{ $t('MSG_PURCHASE_ALEO_METHOD') }}</span>
            </a>
          </li>
          <li>
            <a href='https://www.youtube.com/watch?v=CW2ndiAvYD0' target='_blank'>
              <img class='link-icon' :src='lightbulb'>
              <span>{{ $t('MSG_MOBILE_PURCHASE_ALEO_METHOD') }}</span>
            </a>
          </li>
          <li>
            <a target='_blank' @click='router.push({ path: "/product/aleo" })'>
              <img class='link-icon' :src='lightbulb'>
              <span>{{ $t('MSG_PDF_MANUAL') }}</span>
            </a>
          </li>
        </ul>
      </div> -->
    </template>
  </ProductPage>
</template>

<script setup lang='ts'>
import { defineAsyncComponent, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { appcoindescription, coincurrency, utils, constant, _locale, sdk } from 'src/npoolstore'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getCoins, getCurrencies, getDescriptions } from 'src/api/chain'

import question from '../../assets/question.svg'
// import lightbulb from '../../../assets/lightbulb.svg'

const ProductPage = defineAsyncComponent(() => import('src/components/product/ProductPage.vue'))
const ProductDetailUS = defineAsyncComponent(() => import('src/components/product/en-US/Detail.vue'))
const ProductDetailJP = defineAsyncComponent(() => import('src/components/product/ja-JP/Detail.vue'))

interface Query {
  appGoodID: string
  purchaseAmount: number
}

const route = useRoute()
const query = computed(() => route.query as unknown as Query)
const appGoodID = computed(() => query.value?.appGoodID || sdk.appDefaultGood.coinDefaultAppGoodIDWithUnit(coinUnit))

const target = computed(() => sdk.appPowerRental.appPowerRental(appGoodID.value as string))
const techServiceFeePercent = computed(() => sdk.appPowerRental.techniqueFeeRatio(appGoodID.value as string))

// Use CoinUnit to find AppGoodID from AppCoin
const coinUnit = 'ALEO'

const getGood = () => {
  if (target.value) {
    return
  }
  console.log(appGoodID.value, coinUnit)
  if (!appGoodID.value) {
    void router.push({ path: '/dashboard' })
    return
  }
  sdk.appPowerRental.getAppPowerRental(appGoodID.value, () => {
    if (!target.value) {
      void router.push({ path: '/dashboard' })
    }
  })
}

const locale = _locale.useLocaleStore()
const __locale = computed(() => locale.locale())

const purchaseAmount = computed(() => query.value.purchaseAmount)

const currency = coincurrency.useCurrencyStore()
const description = appcoindescription.useCoinDescriptionStore()

const router = useRouter()
onMounted(() => {
  if (!sdk.appCoin.appCoins.value.length) {
    sdk.appCoin.getAppCoins(0, 0, (error: boolean) => {
      if (error) return
      sdk.appDefaultGood.getAppDefaultGoods(0, 0, (error: boolean) => {
        if (error) return
        getGood()
      })
    })
  } else {
    sdk.appDefaultGood.getAppDefaultGoods(0, 0, (error: boolean) => {
      if (error) return
      getGood()
    })
  }
  if (!description.descriptions(undefined)?.length) {
    getDescriptions(0, 100)
  }
  if (!currency.currencies.length) {
    getCurrencies(0, 100)
  }
})

</script>

<style lang='sass' scoped>
</style>
