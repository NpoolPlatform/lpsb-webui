<template>
  <div class='form-container content-glass'>
    <div class='confirmation'>
      <h3>{{ $t(title) }}</h3>
      <div>
        <span>{{ $t(caption) }}</span>
      </div>
      <div v-if='myVerifyMethod !== AccountType.Google'>
        <p
          class='tip'
          v-if='myVerifyMethod === AccountType.Email'
          v-html='$t("MSG_VERIFICATION_CODE_SENT_TO", { ACCOUNT: account })'
        />
        <p
          class='tip'
          v-if='myVerifyMethod === AccountType.Mobile'
          v-html='$t("MSG_VERIFICATION_CODE_SENT_TO", { ACCOUNT: account })'
        />
      </div>
      <Input
        v-model:value='myCode'
        type='text'
        id='address'
        required
        :error='codeError'
        message='MSG_VERIFICATION_CODE_TIP'
        placeholder='MSG_VERIFICATION_CODE_PLACEHOLDER'
        :autocomplete='false'
        @focus='onCodeFocusIn'
        @blur='onCodeFocusOut'
      />
      <TimeoutSendBtn
        v-if='myVerifyMethod !== AccountType.Google'
        :initial-clicked='true'
        @click='onSendCodeClick'
        class='margin-top-0'
        :target-error='false'
      />
      <button class='btn' @click='onVerifyClick' :disabled='disabled'>
        {{ $t('MSG_VERIFY') }}
      </button>
      <button v-if='showCancel' class='send-code alt' @click='onCancelClick' :disabled='disabled'>
        {{ $t('MSG_CANCEL') }}
      </button>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { defineProps, toRef, defineEmits, computed, watch, onMounted, ref, defineAsyncComponent } from 'vue'
import { AccountType, useLocalUserStore, useFrontendVerifyStore, UsedFor, validateVerificationCode } from 'npool-cli-v4'

const TimeoutSendBtn = defineAsyncComponent(() => import('src/components/button/TimeoutSendBtn.vue'))
const Input = defineAsyncComponent(() => import('src/components/input/Input.vue'))

interface Props {
  verifyMethod?: AccountType;
  usedFor: UsedFor;
  account: string;
  accountType: AccountType;
  disabled?: boolean;
  showCancel?: boolean;
}

const props = defineProps<Props>()
const verifyMethod = toRef(props, 'verifyMethod')
const usedFor = toRef(props, 'usedFor')
const disabled = toRef(props, 'disabled')
const showCancel = toRef(props, 'showCancel')

const logined = useLocalUserStore()
const coderepo = useFrontendVerifyStore()

const myVerifyMethod = computed(() => {
  if (verifyMethod.value?.length) {
    switch (verifyMethod.value) {
      case AccountType.Mobile:
      case AccountType.Email:
      case AccountType.Google:
        return verifyMethod.value
    }
  }
  if (logined.User?.GoogleAuthVerified) {
    return AccountType.Google
  }
  if (logined.User?.EmailAddress?.length) {
    return AccountType.Email
  }
  return AccountType.Mobile
})
const title = computed(() => {
  switch (myVerifyMethod.value) {
    case AccountType.Mobile:
      return 'MSG_MOBILE_VERIFICATION'
    case AccountType.Email:
      return 'MSG_EMAIL_VERIFICATION'
    case AccountType.Google:
      return 'MSG_GOOGLE_VERIFICATION'
    default:
      break
  }
  return 'MSG_EMAIL_VERIFICATION'
})
const account = computed(() => {
  switch (myVerifyMethod.value) {
    case AccountType.Mobile:
      return logined.User?.PhoneNO
    case AccountType.Email:
      return logined.User?.EmailAddress
    case AccountType.Google:
      return ''
    default:
      break
  }
  return logined.User?.EmailAddress
})
const caption = computed(() => {
  switch (myVerifyMethod.value) {
    case AccountType.Mobile:
      return 'MSG_MOBILE_VERIFICATION_CAPTION'
    case AccountType.Email:
      return 'MSG_EMAIL_VERIFICATION_CAPTION'
    case AccountType.Google:
      return 'MSG_GOOGLE_VERIFICATION_CAPTION'
    default:
      break
  }
  return 'MSG_EMAIL_VERIFICATION_CAPTION'
})

const myCode = ref('')
const codeError = ref(false)
const onCodeFocusIn = () => {
  codeError.value = false
}
const onCodeFocusOut = () => {
  codeError.value = !validateVerificationCode(myCode.value)
}

const emit = defineEmits<{(e: 'update:account', account: string): void;
  (e: 'update:accountType', code: string): void;
  (e: 'update:verifyMethod', method: string): void;
  (e: 'verify', code: string): void;
  (e: 'cancel'): void;
}>()

watch(myVerifyMethod, () => {
  emit('update:verifyMethod', myVerifyMethod.value)
  emit('update:accountType', myVerifyMethod.value)
})
watch(account, () => {
  emit('update:account', account.value)
})

const onVerifyClick = () => {
  codeError.value = !validateVerificationCode(myCode.value)
  if (codeError.value) {
    return
  }
  emit('verify', myCode.value)
}

const onCancelClick = () => {
  emit('cancel')
}

const onSendCodeClick = () => {
  coderepo.sendVerificationCode(account.value, myVerifyMethod.value, usedFor.value, logined.User.Username.length ? logined.User.Username : account.value)
}

onMounted(() => {
  onSendCodeClick()
  emit('update:account', account.value)
  emit('update:accountType', myVerifyMethod.value)
})

</script>

<style lang='sass' scoped>
.margin-top-0
  margin-bottom: 36px !important

.tip
  margin-bottom: 0
  margin-top: 24px
  font-size: 14px
</style>
