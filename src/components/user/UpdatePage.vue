<template>
  <FormPage @submit='onSubmit' :label='label' :submit-text='submitText'>
    <template #top-right>
      <slot name='top-right' />
    </template>
    <template #form-body>
      <div class='sent-tip'>
        <p class='tip' v-html='$t("MSG_VERIFICATION_CODE_SENT_TO", { ACCOUNT: account })' />
      </div>
      <Input
        v-model:value='myVerificationCode'
        :label='accountType === appuserbase.SignMethodType.Email ? "MSG_EMAIL_VERIFICATION_CODE" : "MSG_MOBILE_VERIFICATION_CODE"'
        type='text'
        id='ver-code'
        required
        :error='myVerificationCodeError'
        message='MSG_VERIFICATION_CODE_TIP'
        placeholder='MSG_VERIFICATION_CODE_PLACEHOLDER'
        @focus='onVerificationCodeFocusIn'
        @blur='onVerificationCodeFocusOut'
      />
      <TimeoutSendBtn :initial-clicked='true' :target-error='false' @click='onSendCodeClick' />
      <slot name='body' />
    </template>
  </FormPage>
</template>

<script setup lang='ts'>
import { user, appuserbase, notifverify, basetypes, utils } from 'src/npoolstore'
import { defineAsyncComponent, ref, defineProps, toRef, defineEmits, watch, onMounted, computed } from 'vue'

interface Props {
  label: string
  accountType: appuserbase.SignMethodType
  account: string
  verificationCode: string
  verificationCodeError: boolean
  submitText: string
}

const props = defineProps<Props>()
const label = toRef(props, 'label')
const verificationCode = toRef(props, 'verificationCode')
const verificationCodeError = toRef(props, 'verificationCodeError')

const FormPage = defineAsyncComponent(() => import('src/components/page/FormPage.vue'))
const Input = defineAsyncComponent(() => import('src/components/input/Input.vue'))
const TimeoutSendBtn = defineAsyncComponent(() => import('src/components/button/TimeoutSendBtn.vue'))

const myVerificationCode = ref(verificationCode.value)
const myVerificationCodeError = ref(verificationCodeError.value)
const onVerificationCodeFocusIn = () => {
  myVerificationCodeError.value = false
}
const onVerificationCodeFocusOut = () => {
  myVerificationCodeError.value = !utils.validateVerificationCode(myVerificationCode.value)
}

const _notifverify = notifverify.useVerifyStore()

const onSendCodeClick = () => {
  if (!myAccount.value?.length) {
    return
  }
  _notifverify.sendVerificationCode(
    myAccount.value,
    myAccountType.value as unknown as appuserbase.SigninVerifyType,
    basetypes.EventType.Update,
    myAccount.value)
}

const logined = user.useLocalUserStore()
const myAccountType = computed(() => logined.User?.EmailAddress?.length ? appuserbase.SignMethodType.Email : appuserbase.SignMethodType.Mobile)
const myAccount = computed(() => myAccountType.value === appuserbase.SignMethodType.Email ? logined.User?.EmailAddress : logined.User?.PhoneNO)

const emit = defineEmits<{(e: 'update:accountType', type: string): void;
  (e: 'update:account', type: string): void;
  (e: 'update:verificationCode', code: string): void;
  (e: 'update:verificationCodeError', error: boolean): void;
  (e: 'submit'): void;
}>()

watch(myAccount, () => {
  if (!myAccount.value) {
    return
  }
  emit('update:account', myAccount.value)
})

watch(myAccountType, () => {
  emit('update:accountType', myAccountType.value)
})

watch(myVerificationCode, () => {
  emit('update:verificationCode', myVerificationCode.value)
})

watch(myVerificationCodeError, () => {
  emit('update:verificationCodeError', myVerificationCodeError.value)
})

const onSubmit = () => {
  if (myVerificationCodeError.value) {
    return
  }
  emit('submit')
  return false
}

onMounted(() => {
  if (myAccount.value?.length) {
    emit('update:account', myAccount.value)
  }
  emit('update:accountType', myAccountType.value)

  onSendCodeClick()
})
</script>

<style lang='sass' scoped>
.sent-tip
  margin-bottom: 20px

.tip
  line-height: 120%
</style>
