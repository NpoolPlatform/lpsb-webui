<template>
  <div class='form-container'>
    <div class='confirmation'>
      <h3>{{ $t(title) }}</h3>
      <h3 class='form-title'>
        {{ utils.formatCoinName(paymentCoinName as string) || '' }} | <strong>{{ _order?.ID }}</strong>
      </h3>
      <div class='full-section'>
        <h4>{{ $t('MSG_PURCHASE_AMOUNT') }}:</h4>
        <span class='number'>{{ _order?.Units }}</span>
        <span class='unit'>{{ _order?.GoodUnit.length ? $t(_order?.GoodUnit) : '' }}</span>
      </div>
      <div class='full-section'>
        <h4>{{ $t('MSG_PAYMENT') }}:</h4>
        <span class='number'>{{ paymentAmount }}</span>
        <span class='unit'>{{ paymentCoinUnit }}</span>
      </div>
      <div class='full-section'>
        <h4>{{ $t('MSG_STATUS') }}:</h4>
        <span class='number'>{{ $t(state) }}</span>
      </div>
      <div v-if='showType === "date"' class='full-section'>
        <h4>{{ $t('MSG_DATE') }}:</h4>
        <span class='number'>{{ date.formatDate(_order?.CreatedAt as number * 1000, 'YYYY-MM-DD') }}</span>
        <span class='unit'>{{ date.formatDate(_order?.CreatedAt as number * 1000, 'HH:mm:ss') }}</span>
      </div>
      <div v-if='showType === "remain"' class='full-section'>
        <h4>{{ $t('MSG_TIME_REMAINING') }}:</h4>
        <span class='number'>{{ remainTime }}</span>
      </div>
      <div class='hr' />
      <div class='warning'>
        <img :src='warning'>
        <span>{{ $t(tipMessage) }}</span>
      </div>
      <button class='btn' @click='onProceedClick'>
        {{ $t('MSG_PROCEED_TO_DASHBOARD') }}
      </button>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { defineProps, toRef, computed, defineEmits } from 'vue'
import { date } from 'quasar'
import { utils, constant, sdk } from 'src/npoolstore'

import warning from 'src/assets/warning.svg'

interface Props {
  orderId: string
  title: string
  tipMessage: string
  state: string
  showType: string
  remainTime: string
}

const props = defineProps<Props>()

const orderId = toRef(props, 'orderId')
const title = toRef(props, 'title')

const _order = computed(() => sdk.powerRentalOrder.powerRentalOrder(orderId.value))
const paymentCoinName = computed(() => _order.value?.PaymentBalances?.[0]?.CoinName || constant.PriceCoinName)
const paymentAmount = computed(() => _order.value?.PaymentBalances?.[0]?.Amount || _order.value?.GoodValueUSD)
const paymentCoinUnit = computed(() => _order.value?.PaymentBalances?.[0]?.CoinUnit || constant.PriceCoinName)

const emit = defineEmits<{(e: 'proceed'): void;}>()

const onProceedClick = () => {
  emit('proceed')
}

</script>

<style lang='sass' scoped>
.form-title
  white-space: nowrap
  text-overflow: ellipsis

.form-container
  max-width: 600px
</style>
