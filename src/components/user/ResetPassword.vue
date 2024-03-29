<template>
  <FormPage @submit='onSubmit' label='MSG_RESET_PASSWORD' submit-text='MSG_SUBMIT'>
    <template #top-center>
      <div class='email-phone-selector'>
        <div :class='["top", loginWithEmail ? "selected" : ""]' @click='onSwitcherClick(true)'>
          <img src='font-awesome/email.svg'><span>{{ $t('MSG_SWITCH_REGISTER_WITH_EMAIL') }}</span>
        </div>
        <div class='divider' />
        <div :class='["bottom", !loginWithEmail ? "selected" : ""]' @click='onSwitcherClick(false)'>
          <img src='font-awesome/phone.svg'><span>{{ $t('MSG_SWITCH_REGISTER_WITH_MOBILE') }}</span>
        </div>
      </div>
    </template>
    <template #form-body>
      <PhoneNO
        v-if='signupMethod === appuserbase.SignMethodType.Mobile'
        v-model:value='phoneNO'
        :error='accountError'
        :required='signupMethod === appuserbase.SignMethodType.Mobile'
        @focus='onPhoneNOFocusIn'
        @blur='onPhoneNOFocusOut'
      />
      <Input
        v-if='signupMethod === appuserbase.SignMethodType.Email'
        v-model:value='emailAddress'
        label='MSG_EMAIL_ADDRESS'
        type='email'
        id='email'
        :required='signupMethod === appuserbase.SignMethodType.Email'
        :error='accountError'
        message='MSG_EMAIL_TIP'
        placeholder='MSG_EMAIL_PLACEHOLDER'
        @focus='onEmailFocusIn'
        @blur='onEmailFocusOut'
      />
      <TimeoutSendBtn :initial-clicked='false' :target-error='accountError' @click='onSendCodeClick' />
      <Input
        v-model:value='verificationCode'
        :label='signupMethod === appuserbase.SignMethodType.Email ? "MSG_EMAIL_VERIFICATION_CODE" : "MSG_MOBILE_VERIFICATION_CODE"'
        type='text'
        id='ver-code'
        required
        :error='verificationCodeError'
        message='MSG_VERIFICATION_CODE_TIP'
        placeholder='MSG_VERIFICATION_CODE_PLACEHOLDER'
        @focus='onVerificationCodeFocusIn'
        @blur='onVerificationCodeFocusOut'
      />
      <Input
        v-model:value='password'
        label='MSG_PASSWORD'
        type='password'
        id='pass'
        required
        :error='pwdError'
        message='MSG_PASSWORD_TIP'
        placeholder='MSG_PASSWORD_PLACEHOLDER'
        @focus='onPasswordFocusIn'
        @blur='onPasswordFocusOut'
      />
      <Input
        v-model:value='confirmPassword'
        label='MSG_CONFIRM_PASSWORD'
        type='password'
        id='pass'
        required
        :error='confirmPwdError'
        message='MSG_PASSWORD_TIP'
        placeholder='MSG_PASSWORD_PLACEHOLDER'
        @focus='onConfirmPasswordFocusIn'
        @blur='onConfirmPasswordFocusOut'
      />
    </template>
    <template #append-submit>
      <slot name='append-submit' />
    </template>
  </FormPage>
</template>

<script setup lang='ts'>
import { defineAsyncComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { appuserbase, notify, user, notifverify, utils, basetypes } from 'src/npoolstore'
const FormPage = defineAsyncComponent(() => import('src/components/page/FormPage.vue'))
const Input = defineAsyncComponent(() => import('src/components/input/Input.vue'))
const PhoneNO = defineAsyncComponent(() => import('src/components/input/PhoneNO.vue'))
const TimeoutSendBtn = defineAsyncComponent(() => import('src/components/button/TimeoutSendBtn.vue'))

const accountError = ref(false)
const onAccountError = () => {
  accountError.value = signupMethod.value === appuserbase.SignMethodType.Email
    ? !utils.validateEmailAddress(emailAddress.value) : !utils.validateMobileNO(phoneNO.value)
}

const phoneNO = ref('')
const onPhoneNOFocusIn = () => {
  accountError.value = false
}
const onPhoneNOFocusOut = () => {
  onAccountError()
}

const emailAddress = ref('')
const onEmailFocusIn = () => {
  accountError.value = false
}
const onEmailFocusOut = () => {
  onAccountError()
}

const verificationCode = ref('')
const verificationCodeError = ref(false)
const onVerificationCodeFocusIn = () => {
  verificationCodeError.value = false
}
const onVerificationCodeFocusOut = () => {
  verificationCodeError.value = !utils.validateVerificationCode(verificationCode.value)
}

const password = ref('')
const pwdError = ref(false)
const onPasswordFocusIn = () => {
  pwdError.value = false
}
const onPasswordFocusOut = () => {
  pwdError.value = !utils.validatePassword(password.value)
}

const confirmPassword = ref('')
const confirmPwdError = ref(false)
const onConfirmPasswordFocusIn = () => {
  confirmPwdError.value = false
}
const onConfirmPasswordFocusOut = () => {
  confirmPwdError.value = !utils.validatePassword(confirmPassword.value) || confirmPassword.value !== password.value
}

const signupMethod = ref(appuserbase.SignMethodType.Email)

const loginWithEmail = ref(true)
const onSwitcherClick = (flag: boolean) => {
  if (flag === loginWithEmail.value) {
    return
  }
  loginWithEmail.value = flag
  switch (signupMethod.value) {
    case appuserbase.SignMethodType.Email:
      signupMethod.value = appuserbase.SignMethodType.Mobile
      break
    case appuserbase.SignMethodType.Mobile:
      signupMethod.value = appuserbase.SignMethodType.Email
      break
  }
  accountError.value = false
}

const _user = user.useUserStore()
const router = useRouter()

const onSubmit = () => {
  onConfirmPasswordFocusOut()
  onPasswordFocusOut()
  onVerificationCodeFocusOut()
  onAccountError()

  if (accountError.value || pwdError.value || confirmPwdError.value || verificationCodeError.value) {
    return
  }

  const account = signupMethod.value === appuserbase.SignMethodType.Email ? emailAddress.value : phoneNO.value
  _user.resetUser({
    Account: account,
    AccountType: signupMethod.value,
    VerificationCode: verificationCode.value,
    PasswordHash: utils.encryptPassword(password.value),
    Message: {
      Error: {
        Title: 'MSG_RESET_PASSWORD',
        Message: 'MSG_RESET_PASSWORD_FAIL',
        Popup: true,
        Type: notify.NotifyType.Error
      }
    }
  }, (error: boolean) => {
    if (error) {
      return
    }
    void router.push({ path: '/' })
  })

  return false
}

const _notifverify = notifverify.useVerifyStore()
const onSendCodeClick = () => {
  onAccountError()
  if (accountError.value) {
    return
  }

  const account = signupMethod.value === appuserbase.SignMethodType.Email ? emailAddress.value : phoneNO.value
  _notifverify.sendVerificationCode(account, signupMethod.value as unknown as appuserbase.SigninVerifyType, basetypes.EventType.Update, account)
}

</script>

<style lang='sass' scoped>
.switcher
  width: 0
  height: 0
  border-width: 32px
  border-style: solid
  border-color: var(--blue-1) var(--blue-1) transparent transparent
  cursor: pointer
  border-top-right-radius: 12px

.icon
  margin-right: -48px
  margin-top: -56px
</style>
