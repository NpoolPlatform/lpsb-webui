<template>
  <UpdatePage
    @submit='onSubmit'
    label='MSG_UPDATE_PASSWORD'
    submit-text='MSG_SUBMIT'
    v-model:account='account'
    v-model:account-type='accountType'
    v-model:verification-code='verificationCode'
    v-model:verification-code-error='verificationCodeError'
  >
    <template #body>
      <Input
        v-model:value='oldPassword'
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
        v-model:value='newPassword'
        label='MSG_NEW_PASSWORD'
        type='password'
        id='pass'
        required
        :error='newPwdError'
        message='MSG_PASSWORD_TIP'
        placeholder='MSG_PASSWORD_PLACEHOLDER'
        @focus='onNewPasswordFocusIn'
        @blur='onNewPasswordFocusOut'
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
  </UpdatePage>
</template>

<script setup lang='ts'>
import { utils, appuserbase, user, notify } from 'src/npoolstore'
import { defineAsyncComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const UpdatePage = defineAsyncComponent(() => import('src/components/user/UpdatePage.vue'))
const Input = defineAsyncComponent(() => import('src/components/input/Input.vue'))

// eslint-disable-next-line @typescript-eslint/unbound-method
const { t } = useI18n({ useScope: 'global' })

const _user = user.useUserStore()

const account = ref('')
const accountType = ref(appuserbase.SignMethodType.Email)
const verificationCode = ref('')
const verificationCodeError = ref(false)

const oldPassword = ref('')
const pwdError = ref(false)
const onPasswordFocusIn = () => {
  pwdError.value = false
}
const onPasswordFocusOut = () => {
  pwdError.value = !utils.validatePassword(oldPassword.value)
}

const newPassword = ref('')
const newPwdError = ref(false)
const onNewPasswordFocusIn = () => {
  newPwdError.value = false
}
const onNewPasswordFocusOut = () => {
  newPwdError.value = !utils.validatePassword(newPassword.value)
}

const confirmPassword = ref('')
const confirmPwdError = ref(false)
const onConfirmPasswordFocusIn = () => {
  confirmPwdError.value = false
}
const onConfirmPasswordFocusOut = () => {
  confirmPwdError.value = !utils.validatePassword(confirmPassword.value) || confirmPassword.value !== newPassword.value
}

const router = useRouter()

const onSubmit = () => {
  onConfirmPasswordFocusOut()
  onNewPasswordFocusOut()
  onPasswordFocusOut()

  if (newPwdError.value || pwdError.value || confirmPwdError.value || verificationCodeError.value) {
    return
  }
  _user.updateUser({
    Account: account.value,
    AccountType: accountType.value as unknown as appuserbase.SignMethodType,
    OldPasswordHash: utils.encryptPassword(oldPassword.value),
    PasswordHash: utils.encryptPassword(newPassword.value),
    VerificationCode: verificationCode.value,
    Message: {
      Error: {
        Title: t('MSG_UPDATE_PASSWORD'),
        Message: t('MSG_UPDATE_PASSWORD_FAIL'),
        Popup: true,
        Type: notify.NotifyType.Error
      }
    }
  }, (error: boolean) => {
    if (error) {
      return
    }
    void router.push({ path: '/dashboard' })
  })
  return false
}
</script>

<style lang='sass' scoped>
</style>
