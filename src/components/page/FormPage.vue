<template>
  <BackPage>
    <div class='content'>
      <div class='form-container content-glass incr'>
        <div class='row'>
          <h2 class='form-title'>
            {{ $t(label) }}
          </h2>
          <q-space />
          <div class='top-center'>
            <slot name='top-center' />
          </div>
          <div class='top-right'>
            <slot name='top-right' />
          </div>
        </div>
        <form @submit='onSubmit' method='POST' action='javascript:void(0)'>
          <slot name='form-body' />
          <input type='submit' :value='$t(submitText)' class='register' :disabled='submitting'>
          <slot name='append-submit' />
        </form>
      </div>
    </div>
  </BackPage>
</template>

<script setup lang='ts'>
import {
  defineAsyncComponent,
  defineEmits,
  defineProps,
  toRef
} from 'vue'

interface Props {
  label: string
  submitText: string
  submitting?: boolean
}

const props = defineProps<Props>()
const label = toRef(props, 'label')

const BackPage = defineAsyncComponent(() => import('src/components/page/BackPage.vue'))

const emit = defineEmits<{(e: 'submit'): void;}>()
const onSubmit = () => {
  emit('submit')
}

</script>

<style lang='sass' scoped>
.top-right
  margin-top: -48px
  margin-right: -48px
.incr
  max-width: 490px
.top-center
  width: 100%
h2.form-title
  width: 100%

h2::after
  background: linear-gradient(to right, transparent 0, #e1eeef 10%, transparent 100%)
</style>
