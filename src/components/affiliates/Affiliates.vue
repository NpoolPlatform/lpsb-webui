<template>
  <div class='content' v-if='user.isKol'>
    <CommissionCard />
    <div class='hr' />
    <ReferralCode />
    <div class='hr' />
    <Tree />
    <div class='hr' />
    <Table />
    <div class='hr' />
  </div>
  <q-ajax-bar
    ref='progress'
    position='top'
    color='blue-3'
    size='6px'
  />
</template>

<script setup lang='ts'>
import { useLocalUserStore, useAdminAppGoodStore, NotifyType, AppGood, useAdminAppCoinStore, useFrontendArchivementStore, UserArchivement, useAdminCurrencyStore, CurrencyType, useFrontendCommissionStore, Commission, SettleType } from 'npool-cli-v4'
import { QAjaxBar } from 'quasar'
import { getCoins } from 'src/api/chain'
import { defineAsyncComponent, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

// eslint-disable-next-line @typescript-eslint/unbound-method
const { t } = useI18n({ useScope: 'global' })

const CommissionCard = defineAsyncComponent(() => import('src/components/affiliates/Commission.vue'))
const ReferralCode = defineAsyncComponent(() => import('src/components/affiliates/ReferralCode.vue'))
const Tree = defineAsyncComponent(() => import('src/components/affiliates/Tree.vue'))
const Table = defineAsyncComponent(() => import('src/components/affiliates/Table.vue'))

const user = useLocalUserStore()
const archivement = useFrontendArchivementStore()
const good = useAdminAppGoodStore()
const coin = useAdminAppCoinStore()
const currency = useAdminCurrencyStore()

const commission = useFrontendCommissionStore()

onMounted(() => {
  if (archivement.Archivements.Archivements.length === 0) {
    getArchivements(0, 100)
  }
  if (good.AppGoods.AppGoods.length === 0) {
    getAppGoods(0, 500)
  }
  if (coin.AppCoins.AppCoins.length === 0) {
    getCoins(0, 100)
  }

  if (!currency.LegalCurrencies.get(CurrencyType.JPY)) {
    currency.getLegalCurrencies({
      CurrencyType: CurrencyType.JPY,
      Message: {}
    }, () => {
      // TODO
    })
  }
  if (commission.Commissions.Commissions.length === 0) {
    getCommissions(0, 100)
  }
})

const getAppGoods = (offset: number, limit: number) => {
  good.getAppGoods({
    Offset: offset,
    Limit: limit,
    Message: {
      Error: {
        Title: t('MSG_GET_APP_GOODS_FAIL'),
        Popup: true,
        Type: NotifyType.Error
      }
    }
  }, (g: Array<AppGood>, error: boolean) => {
    if (error || g.length < limit) {
      return
    }
    getAppGoods(offset + limit, limit)
  })
}
const getArchivements = (offset: number, limit: number) => {
  archivement.getGoodArchivements({
    Offset: offset,
    Limit: limit,
    Message: {
      Error: {
        Title: t('MSG_GET_COIN_ARCHIVEMENT_FAIL'),
        Popup: true,
        Type: NotifyType.Error
      }
    }
  }, (error: boolean, rows: Array<UserArchivement>) => {
    if (error || rows.length < limit) {
      return
    }
    getArchivements(offset + limit, limit)
  })
}

const getCommissions = (offset: number, limit: number) => {
  commission.getCommissions({
    Offset: offset,
    Limit: limit,
    SettleType: SettleType.GoodOrderPercent,
    Message: {
      Error: {
        Title: t('MSG_GET_PURCHASE_AMOUNT_SETTINGS_FAIL'),
        Popup: true,
        Type: NotifyType.Error
      }
    }
  }, (error: boolean, rows: Array<Commission>) => {
    if (error || rows.length < limit) {
      return
    }
    getCommissions(offset + limit, limit)
  })
}
</script>
