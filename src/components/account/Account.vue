<template>
  <h2>{{ $t('MSG_ACCOUNT_TITLE') }}</h2>
  <form class='content-glass alignment' action='javascript:void(0)' @submit='onSubmit'>
    <h3>{{ $t('MSG_PERSON_DETAILS_FOR_KYC') }}</h3>
    <div class='warning'>
      <img :src='warning'>
      <span>{{ $t('MSG_PERSONAL_DETAIL_TIP') }}</span>
    </div>
    <br>
    <div class='row'>
      <div class='account-field'>
        <Input
          v-model:value='username'
          label='MSG_USERNAME'
          type='text'
          id='username'
          required
          :error='usernameError'
          message='MSG_USERNAME_TIP'
          placeholder='MSG_USERNAME_PLACEHOLDER'
          @focus='onUsernameFocusIn'
          @blur='onUsernameFocusOut'
        />
      </div>
      <q-space />
      <div class='account-field'>
        <label for='gender'>{{ $t('MSG_GENDER') }}</label>
        <select id='gender' :name='$t("MSG_GENDER")' v-model='gender' required>
          <option
            v-for='myGender in genders'
            :key='myGender'
            :value='myGender'
            :selected='myGender === gender'
          >
            {{ $t(myGender) }}
          </option>
        </select>
      </div>
    </div>
    <div class='row'>
      <div class='account-field'>
        <Input
          v-model:value='firstName'
          label='MSG_FIRST_NAME'
          type='text'
          id='first-name'
          required
          :error='firstNameError'
          message='MSG_FIRST_NAME_TIP'
          placeholder='MSG_FIRST_NAME_PLACEHOLDER'
          @focus='onFirstNameFocusIn'
          @blur='onFirstNameFocusOut'
        />
      </div>
      <q-space />
      <div class='account-field'>
        <Input
          v-model:value='lastName'
          label='MSG_LAST_NAME'
          type='text'
          id='last-name'
          required
          :error='lastNameError'
          message='MSG_LAST_NAME_TIP'
          placeholder='MSG_LAST_NAME_PLACEHOLDER'
          @focus='onLastNameFocusIn'
          @blur='onLastNameFocusOut'
        />
      </div>
    </div>
    <h3>{{ $t('MSG_ADDRESS') }}</h3>
    <div class='row'>
      <div class='account-field'>
        <Input
          v-model:value='postalCode'
          label='MSG_POSTAL_CODE'
          type='text'
          id='postal-code'
          required
          :error='postalCodeError'
          message='MSG_POSTAL_CODE_TIP'
          placeholder='MSG_POSTAL_CODE_PLACEHOLDER'
        />
      </div>
      <q-space />
      <div class='account-field'>
        <Input
          v-model:value='province'
          label='MSG_PROVINCE'
          type='text'
          id='province'
          required
          :error='provinceError'
          message='MSG_PROVINCE_TIP'
          placeholder='MSG_PROVINCE_PLACEHOLDER'
        />
      </div>
    </div>
    <div class='row'>
      <div class='account-field'>
        <Input
          v-model:value='street1'
          label='MSG_STREET1'
          type='text'
          id='street1'
          required
          :error='street1Error'
          message='MSG_STREET1_TIP'
          placeholder='MSG_STREE1_PLACEHOLDER'
        />
      </div>
      <q-space />
      <div class='account-field'>
        <Input
          v-model:value='street2'
          label='MSG_STREET2'
          type='text'
          id='street2'
          :required='false'
          :error='street2Error'
          message='MSG_STREET2_TIP'
          placeholder='MSG_STREET2_PLACEHOLDER'
        />
      </div>
    </div>
    <div class='row'>
      <div class='account-field'>
        <Input
          v-model:value='city'
          label='MSG_CITY'
          type='text'
          id='city'
          required
          :error='cityError'
          message='MSG_CITY'
          placeholder='MSG_CITY_PLACEHOLDER'
        />
      </div>
      <q-space />
      <div class='account-field'>
        <Input
          v-model:value='country'
          label='MSG_COUNTRY'
          type='text'
          id='country'
          required
          :error='countryError'
          message='MSG_COUNTRY_TIP'
          placeholder='MSG_COUNTRY_PLACEHOLDER'
        />
      </div>
    </div>
    <div class='save-changes'>
      <WaitingBtn
        label='MSG_SAVE_CHANGES'
        type='submit'
        :disabled='submitting'
        :waiting='submitting'
        @click='onSubmit'
      />
    </div>
  </form>
</template>

<script setup lang='ts'>
import { defineAsyncComponent, ref, computed } from 'vue'
import { notify, utils, user } from 'src/npoolstore'
import warning from '../../assets/warning.svg'
const Input = defineAsyncComponent(() => import('src/components/input/Input.vue'))
const WaitingBtn = defineAsyncComponent(() => import('src/components/button/WaitingBtn.vue'))

const logined = user.useLocalUserStore()

const username = ref(logined.username)
const usernameError = ref(false)
const onUsernameFocusIn = () => {
  usernameError.value = false
}
const onUsernameFocusOut = () => {
  usernameError.value = !username.value || !utils.validateUsername(username.value)
}

const genders = ref(['MSG_FAMALE', 'MSG_MALE', 'MSG_OTHER'])
const gender = ref(logined.gender)

const firstName = ref(logined.firstName)
const firstNameError = ref(false)
const onFirstNameFocusIn = () => {
  firstNameError.value = false
}
const onFirstNameFocusOut = () => {
  firstNameError.value = !firstName.value?.length
}

const lastName = ref(logined.lastName)
const lastNameError = ref(false)
const onLastNameFocusIn = () => {
  lastNameError.value = false
}
const onLastNameFocusOut = () => {
  lastNameError.value = !lastName.value?.length
}

const postalCode = ref(logined.postalCode)
const postalCodeError = ref(false)

const addressFields = ref(logined.addressFields)
const country = computed({
  get: () => addressFields.value?.[0] || '',
  set: (val) => {
    addressFields.value = [val, province.value, city.value, street1.value, street2.value]
  }
})
const countryError = ref(false)

const province = computed({
  get: () => addressFields.value?.[1] || '',
  set: (val) => {
    addressFields.value = [country.value, val, city.value, street1.value, street2.value]
  }
})

const provinceError = ref(false)

const city = computed({
  get: () => addressFields.value?.[2] || '',
  set: (val) => {
    addressFields.value = [country.value, province.value, val, street1.value, street2.value]
  }
})

const cityError = ref(false)

const street1 = computed({
  get: () => addressFields.value?.[3] || '',
  set: (val) => {
    addressFields.value = [country.value, province.value, city.value, val, street2.value]
  }
})

const street1Error = ref(false)

const street2 = computed({
  get: () => addressFields.value?.[4] || '',
  set: (val) => {
    addressFields.value = [country.value, province.value, city.value, street1.value, val]
  }
})

const street2Error = ref(false)

const fuser = user.useUserStore()

const submitting = ref(false)
const onSubmit = () => {
  submitting.value = true
  usernameError.value = !username.value?.length
  firstNameError.value = !firstName.value?.length
  lastNameError.value = !lastName.value?.length

  if (usernameError.value || firstNameError.value || lastNameError.value) {
    submitting.value = false
    return
  }

  fuser.updateUser({
    Username: username.value,
    AddressFields: addressFields.value,
    Gender: gender.value,
    PostalCode: postalCode.value,
    FirstName: firstName.value,
    LastName: lastName.value,
    Message: {
      Error: {
        Title: 'MSG_UPDATE_EXTRA',
        Message: 'MSG_UPDATE_EXTRA_FAIL',
        Popup: true,
        Type: notify.NotifyType.Error
      },
      Info: {
        Title: 'MSG_UPDATE_EXTRA',
        Message: 'MSG_UPDATE_EXTRA_SUCCESS',
        Popup: true,
        Type: notify.NotifyType.Success
      }
    }
  }, () => {
    submitting.value = false
  })
}

</script>

<style lang='sass' scoped>
.account-field
  width: 49% !important
  @media (max-width: $breakpoint-sm-max)
    width: 100%  !important

.alignment
  margin-left: 0px !important
  margin-right: 0px !important
.save-changes button
  width: 49%
</style>
