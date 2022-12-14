<template>
  <div :class='[ "affiliate content-glass", child ? "child" : "", firstChild ? "first-child" : "", lastChild ? "last-child" : "" ]'>
    <div class='aff-top'>
      <h3 class='aff-name'>
        {{ username }}
      </h3>
      <span class='aff-email'>{{ archivement.subUsername(referral) }}</span>
      <span>{{ $t('MSG_ONBOARDED_USERS') }}:<span class='aff-number'>{{ referral.TotalInvitees }}</span></span>
    </div>
    <div class='aff-table'>
      <table id='commission-table'>
        <thead>
          <tr>
            <th>
              <span>{{ $t('MSG_PRODUCT') }}</span>
            </th>
            <th>
              <div class='tooltip'>
                <span>{{ $t('MSG_COMMISSION_RATE') }}</span>
              </div>
            </th>
            <th>
              <div class='tooltip'>
                <span>{{ $t('MSG_REFERRAL_UNITS') }}</span>
              </div>
            </th>
            <th>
              <div class='tooltip'>
                <span>{{ $t('MSG_TOTAL_SALES') }}</span>
              </div>
            </th>
            <th>
              <div class='tooltip'>
                <span>{{ $t('MSG_REFERRAL_COMMISSION') }}</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr class='aff-info' v-for='(_good, idx) in visibleGoodArchivements' :key='idx'>
            <td><span class='aff-product'>{{ _good.GoodName }}</span></td>
            <td v-if='_good.Editing'>
              <input type='number' v-model='_good.CommissionPercent' :min='0' :max='getGoodPercent(_good.GoodID)'>
              <button @click='onSaveCommissionClick(_good)'>
                {{ $t('MSG_SAVE') }}
              </button>
            </td>
            <td v-else>
              <span class='aff-number'>{{ _good.CommissionPercent }}<span class='unit'>%</span></span>
              <button
                v-if='child'
                :class='[ "alt", good.online(_good.GoodID) ? "" : "in-active" ]'
                :disabled='!good.online(_good.GoodID)'
                @click='(_good.Editing = true)'
              >
                {{ $t('MSG_SET') }}
              </button>
            </td>
            <td><span class='aff-number'>{{ _good.TotalUnits }}<span class='unit'>{{ _good.GoodUnit?.length ? $t(_good.GoodUnit) : '' }}</span></span></td>
            <td><span class='aff-number'>{{ Number(_good.TotalAmount).toFixed(4) }}<span class='unit'>{{ PriceCoinName }}</span></span></td>
            <td>
              <span class='aff-number'>
                {{ child ? (_good.SuperiorCommission ? Number(_good.SuperiorCommission).toFixed(4) : 0.0000) : Number(_good.TotalCommission).toFixed(4) }}
                <span class='unit'>{{ PriceCoinName }}</span>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <q-slide-transition>
      <div class='detailed-summary' v-show='showDetailSummary'>
        <h4>{{ $t('MSG_COMMISSION_HISTORY') }}</h4>
        <div class='aff-table'>
          <table id='history-table'>
            <thead>
              <tr>
                <th>{{ $t('MSG_PRODUCT') }}</th>
                <th>{{ $t('MSG_EFFECTIVE_DATE') }}</th>
                <th>{{ $t('MSG_COMMISSION_RATE') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr class='aff-info' v-for='_commission in commissions' :key='_commission.ID'>
                <td><span class='aff-product'>{{ good.getGoodByID(_commission.GoodID)?.GoodName }}</span></td>
                <td><span class='aff-number'>{{ commission.settingDate(_commission) }}<span class='unit'>{{ commission.settingTime(_commission) }}</span></span></td>
                <td><span class='aff-number'>{{ _commission.Percent }}<span class='unit'>%</span></span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </q-slide-transition>
    <div class='buttons'>
      <button :class='[ "alt show-more", showDetailSummary ? "open" : "" ]' @click='onShowMoreClick'>
        <img :src='chevrons'>
      </button>
    </div>
  </div>
</template>

<script setup lang='ts'>
import {
  PriceCoinName
} from 'npool-cli-v2'
import { ref, toRef, defineProps, computed } from 'vue'
import chevrons from '../../assets/chevrons.svg'
import {
  useBaseUserStore,
  useLocalUserStore,
  User,
  useAdminAppGoodStore,
  useFrontendArchivementStore,
  UserArchivement,
  useFrontendCommissionStore,
  SettleType,
  NotifyType
} from 'npool-cli-v4'
import { useI18n } from 'vue-i18n'
import { MyGoodArchivement } from 'src/localstore/ledger/types'
// eslint-disable-next-line @typescript-eslint/unbound-method
const { locale, t } = useI18n({ useScope: 'global' })

interface Props {
  child: boolean;
  firstChild: boolean;
  lastChild: boolean;
  referral: UserArchivement;
}

const props = defineProps<Props>()
const child = toRef(props, 'child')
const firstChild = toRef(props, 'firstChild')
const lastChild = toRef(props, 'lastChild')
const target = toRef(props, 'referral')
const referral = ref(target.value)

const baseUser = useBaseUserStore()
const username = computed(() => baseUser.displayName({
  FirstName: referral.value.FirstName,
  LastName: referral.value.LastName
} as User, locale.value as string))

const logined = useLocalUserStore()
const good = useAdminAppGoodStore()

const archivement = useFrontendArchivementStore()
const goodArchivements = computed(() => Array.from(referral.value.Archivements.filter((el) => good.visible(el.GoodID))).map((el) => {
  return {
    ...el,
    Editing: false
  } as MyGoodArchivement
}))
const visibleGoodArchivements = ref(goodArchivements.value)

const getGoodPercent = computed(() => (goodID: string) => {
  const inviterArchivement = archivement.getArchivementByUserID(logined?.User.ID)
  return archivement.getInviterGoodPercent(inviterArchivement as UserArchivement, goodID)
})

const showDetailSummary = ref(false)
const onShowMoreClick = () => {
  showDetailSummary.value = !showDetailSummary.value
}

const commission = useFrontendCommissionStore()
const commissions = computed(() => commission.Commissions.Commissions.filter((el) => {
  return el.UserID === referral.value.UserID
}).sort((a, b) => {
  return a.StartAt < b.StartAt ? 1 : -1
}))

const onSaveCommissionClick = (row: MyGoodArchivement) => {
  if (row.CommissionPercent > getGoodPercent.value(row.GoodID)) {
    row.CommissionPercent = getGoodPercent.value(row.GoodID)
  }
  row.Editing = false
  commission.createCommission({
    TargetUserID: referral.value.UserID,
    GoodID: row.GoodID,
    SettleType: good.settleType(row.GoodID) as SettleType,
    Value: `${row.CommissionPercent}`,
    StartAt: Math.ceil(Date.now() / 1000),
    Message: {
      Error: {
        Title: t('MSG_CREATE_AMOUNT_SETTING_FAIL'),
        Popup: true,
        Type: NotifyType.Error
      }
    }
  }, () => {
    // TODO
  })
}

</script>
