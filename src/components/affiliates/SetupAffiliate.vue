<template>
  <FormPage @submit='onSubmit' label='MSG_SETUP_AFFILIATE' submit-text='MSG_CREATE_AFFILIATE' :submitting='submitting'>
    <template #form-body>
      <h3 class='aff-name'>
        {{ username }}
      </h3>
      <p class='aff-email'>
        {{ subUsername }}
      </p>
      <div v-for='(_good, idx) in visibleGoodAchievements' :key='idx'>
        <label>{{ $t(sdk.appPowerRental.displayName(_good.AppGoodID, 4)) }} {{ $t('MSG_KOL_COMMISSION_RATE') }}:</label>
        <input
          type='number'
          v-model='_good.CommissionValue'
          :min='0'
          :max='getGoodCommissionValue(_good.AppGoodID)'
          :disabled='!sdk.appPowerRental.canBuy(_good.AppGoodID)'
        >
      </div>
    </template>
    <template #append-submit>
      <h3>{{ $t('MSG_INFO') }}</h3>
      <p v-html='$t("MSG_SETUP_AFFILIATE_INFO")' />
    </template>
  </FormPage>
</template>

<script setup lang='ts'>
import { defineAsyncComponent, computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { commission, achievement, user, appgood, notify, sdk } from 'src/npoolstore'

// eslint-disable-next-line @typescript-eslint/unbound-method
const { locale } = useI18n({ useScope: 'global' })

const FormPage = defineAsyncComponent(() => import('src/components/page/FormPage.vue'))

interface Query {
  userID: string
}

const route = useRoute()
const router = useRouter()
const query = computed(() => route.query as unknown as Query)

const _achievement = achievement.useAchievementStore()
const referral = computed(() => _achievement.achievement(undefined, query.value?.userID) as achievement.Achievement)

const _user = user.useUserStore()
const username = computed(() => _user.displayName(undefined, undefined, referral.value?.FirstName,
  referral.value?.LastName, locale.value as string))
const subUsername = computed(() => referral.value?.EmailAddress?.length ? referral.value?.EmailAddress : referral.value?.PhoneNO)

const logined = user.useLocalUserStore()

const getGoodCommissionValue = computed(() => (appGoodID: string) => {
  return _achievement.commissionPercent(undefined, logined?.User.EntID, undefined, appGoodID)
})
const getGoodCommissionSettleMode = computed(() => (appGoodID: string) => {
  return _achievement.settleMode(undefined, logined?.User.EntID, undefined, appGoodID) as commission.SettleMode
})
const getGoodCommissionSettleAmountType = computed(() => (appGoodID: string) => {
  return _achievement.settleAmountType(undefined, logined?.User.EntID, undefined, appGoodID) as commission.SettleAmountType
})
const getGoodCommissionSettleInterval = computed(() => (appGoodID: string) => {
  return _achievement.settleInterval(undefined, logined?.User.EntID, undefined, appGoodID) as commission.SettleInterval
})
const getGoodCommissionThreshold = computed(() => (appGoodID: string) => {
  return _achievement.threshold(undefined, logined?.User.EntID, undefined, appGoodID)
})

const good = appgood.useAppGoodStore()
const visibleGoodAchievements = computed(() => Array.from(referral.value?.Achievements?.filter((el) => {
  return sdk.appPowerRental.visible(el.AppGoodID)
})).sort((a, b) => sdk.appPowerRental.displayName(a.AppGoodID, 4).localeCompare(sdk.appPowerRental.displayName(b.AppGoodID, 4), 'zh-CN')))

const backTimer = ref(-1)
const submitting = ref(false)

const _commission = commission.useCommissionStore()
const onSubmit = () => {
  submitting.value = true
  referral.value?.Achievements?.forEach((g) => {
    if (Number(g.CommissionValue) > getGoodCommissionValue.value(g.AppGoodID)) {
      g.CommissionValue = getGoodCommissionValue.value(g.AppGoodID).toString()
    }
    if (Number(g.CommissionValue) < 0) {
      g.CommissionValue = '0'
    }
  })

  _user.updateUserKol({
    TargetUserID: referral.value?.UserID,
    Kol: true,
    Message: {
      Error: {
        Title: 'MSG_CREATE_INVITATION_CODE',
        Message: 'MSG_CREATE_INVITATION_CODE_FAIL',
        Popup: true,
        Type: notify.NotifyType.Error
      }
    }
  }, (error: boolean) => {
    submitting.value = false
    if (error) {
      return
    }
    if (visibleGoodAchievements.value?.length === 0) {
      _achievement.$reset()
      void router.push({ path: '/affiliates' })
      return
    }

    visibleGoodAchievements?.value?.forEach((row) => {
      switch (getGoodCommissionSettleAmountType.value(row.AppGoodID)) {
        case commission.SettleAmountType.SettleByAmount:
          break
        case commission.SettleAmountType.SettleByPercent:
          break
        default:
          return
      }
      _commission.createCommission({
        TargetUserID: referral.value?.UserID,
        AppGoodID: row.AppGoodID,
        SettleType: commission.SettleType.GoodOrderPayment,
        SettleAmountType: getGoodCommissionSettleAmountType.value(row.AppGoodID),
        SettleMode: getGoodCommissionSettleMode.value(row.AppGoodID),
        SettleInterval: getGoodCommissionSettleInterval.value(row.AppGoodID),
        Threshold: getGoodCommissionThreshold.value(row.AppGoodID).toString(),
        AmountOrPercent: `${row.CommissionValue}`,
        StartAt: Math.ceil(Date.now() / 1000),
        Message: {
          Error: {
            Title: 'MSG_CREATE_COMMISSION',
            Message: 'MSG_CREATE_COMMISSION_FAIL',
            Popup: true,
            Type: notify.NotifyType.Error
          }
        }
      }, () => {
        if (backTimer.value >= 0) {
          window.clearTimeout(backTimer.value)
        }
        backTimer.value = window.setTimeout(() => {
          _achievement.$reset()
          void router.push({ path: '/affiliates' })
        }, 1000)
      })
    })
  })
}

onMounted(() => {
  if (!good.goods(undefined).length) {
    sdk.getAppGoods(0, 0)
  }
  if (!_achievement.achievements(undefined, logined.loginedUserID).length) {
    getAchievements(0, 100)
  }
})

const getAchievements = (offset: number, limit: number) => {
  _achievement.getAchievements({
    Offset: offset,
    Limit: limit,
    Message: {
      Error: {
        Title: 'MSG_GET_COIN_ACHIEVEMENT',
        Message: 'MSG_GET_COIN_ACHIEVEMENT_FAIL',
        Popup: true,
        Type: notify.NotifyType.Error
      }
    }
  }, (error: boolean, rows?: Array<achievement.Achievement>) => {
    if (error || !rows?.length) {
      return
    }
    getAchievements(offset + limit, limit)
  })
}
</script>

<style lang='sass' scoped>
</style>
