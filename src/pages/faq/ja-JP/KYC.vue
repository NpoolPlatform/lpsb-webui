<template>
  <Page>
    <template #body>
      <h2>KYC (本人確認)</h2>

      <div class='faq-content'>
        <div class='faq-content-nav'>
          <h3>目次</h3>

          <ul class='faq-nav-links'>
            <li><a @click='scrollTo("KYCの申請の方法")'>KYCの申請の方法</a></li>
            <li><a @click='scrollTo("審査状況の確認方法")'>審査状況の確認方法</a></li>
            <li><a @click='scrollTo("KYC申請中")'>KYC申請中(ボタンをクリック中)にサイトが落ちた場合、どうすればいいですか？</a></li>
          </ul>

          <div class='hr' />
        </div>

        <div class='faq-content-main'>
          <h3 id='KYCの申請の方法'>
            KYCの申請の方法
          </h3>

          <ul>
            <li>(1)ログイン後、<a target='_blank' @click='router.push({ path: "/kyc" })'>KYCページ</a>へアクセスします。</li>
            <li>(2)身分証明書一覧からKYCに使用する身分証明書を選択します。</li>
            <ul>
              <li>パスポート</li>
              <li>マイナンバーカード／運転免許証</li>
            </ul>
            <li>(3)表示されている必要画像をスマートフォンなどで撮影をし、アップロードをします。</li>
            <li>(4)画面下部の、オレンジ色の申請ボタンを押下します。</li>
          </ul>

          <h3 id='審査状況の確認方法'>
            審査状況の確認方法
          </h3>

          <ul>
            <li>(1)ログイン後、<a target='_blank' @click='router.push({ path: "/kyc" })'>個人情報ページ</a>へアクセスします。</li>
            <li>(2)身分証明の認証ステータスの記載内容から確認をします。</li>
          </ul>

          <ul>
            <li><strong>審査中：</strong>以下2点に変わるまでお待ちください。審査完了等の通知はございません。</li>
            <li><strong>成功：</strong>KYCの審査が受理された状態です。</li>
            <li><strong>失敗：</strong>KYCの審査が棄却された状態です。併記されている理由を参考に再度申請をお願いします。</li>
          </ul>

          <h3 id='KYC申請中'>
            KYC申請中(ボタンをクリック中)にサイトが落ちた場合、どうすればいいですか？
          </h3>

          <p>お手数ですが、KYCページの身分証明の認証ステータスに応じて以下ご対応をお願い申し上げます。</p>

          <ul>
            <li><strong>審査中：</strong>特に必要な対応はございません。弊社へ申請がとどいておりますので、審査完了をお待ちくださいませ。（※審査完了に際して通知はございません）</li>
            <li><strong>未登録：</strong>あらためて、申請のご対応をお願い申し上げます。</li>
          </ul>

          <div class='hr' />
        </div>
      </div>
    </template>
  </Page>
</template>

<script setup lang='ts'>
import { defineAsyncComponent } from 'vue'
import { scrollTo } from 'src/utils/scroll'
import { useRouter } from 'vue-router'

const Page = defineAsyncComponent(() => import('src/pages/faq/Page.vue'))

const router = useRouter()

</script>
